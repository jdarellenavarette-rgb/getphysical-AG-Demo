import * as Location from "expo-location";
import { z } from "zod";

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  isSimulated?: boolean;
  addressLabel?: string;
}

// Default benchmark location: Bonifacio Global City, Taguig (Metro Manila)
export const DEFAULT_BGC_COORDS: UserCoordinates = {
  latitude: 14.5492,
  longitude: 121.0487,
  isSimulated: true,
  addressLabel: "Bonifacio Global City, Taguig",
};

export type LocationPermission = "granted" | "denied" | "undetermined";

export interface LocationResult {
  readonly coords: UserCoordinates;
  readonly permission: LocationPermission;
  readonly canAskAgain: boolean;
}

/** Requests foreground location and reports the permission outcome (drives `permission_denied`). */
export async function requestUserLocation(): Promise<LocationResult> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (perm.status !== "granted") {
      return { coords: DEFAULT_BGC_COORDS, permission: perm.status === "denied" ? "denied" : "undetermined", canAskAgain: perm.canAskAgain };
    }
    return { coords: await requestAndFetchUserLocation(), permission: "granted", canAskAgain: true };
  } catch {
    return { coords: DEFAULT_BGC_COORDS, permission: "denied", canAskAgain: false };
  }
}

/** Spec 3.6: manual seed must be a 4-digit PH postal code or a plausible city name. */
export const locationSeedSchema = z
  .string()
  .trim()
  .min(2, "Enter a city or 4-digit ZIP code")
  .max(60, "That's too long for a city name")
  .refine((v) => /^\d{4}$/.test(v) || /^[A-Za-zÀ-ÿñÑ .'-]{2,}$/.test(v), "Use a 4-digit PH ZIP code or a city name");

/** Forward-geocodes a validated City/ZIP seed into map coordinates. */
export async function geocodeLocationSeed(seed: string): Promise<UserCoordinates | null> {
  const query = `${seed.trim()}, Philippines`;
  try {
    const results = await Location.geocodeAsync(query);
    const first = results[0];
    if (!first) return null;
    return { latitude: first.latitude, longitude: first.longitude, isSimulated: true, addressLabel: seed.trim() };
  } catch {
    return null;
  }
}

export async function requestAndFetchUserLocation(): Promise<UserCoordinates> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      return DEFAULT_BGC_COORDS;
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    let addressLabel = "Current Location";
    try {
      const rev = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      if (rev.length > 0 && rev[0]) {
        const item = rev[0];
        addressLabel = item.district || item.city || item.street || "Current Location";
      }
    } catch {
      // Ignore geocode error
    }

    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      isSimulated: false,
      addressLabel,
    };
  } catch (err) {
    console.warn("Location fetch fallback to BGC:", err);
    return DEFAULT_BGC_COORDS;
  }
}

/**
 * Great-circle distance between two GPS points in kilometers (Haversine formula).
 */
export function calculateHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = R * c;
  return Math.round(km * 10) / 10;
}

export function formatWalkingEta(distanceKm: number): string {
  const mins = Math.max(1, Math.round(distanceKm * 12));
  if (mins < 60) return `${mins} min walk`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return `${hours}h ${rem}m walk`;
}

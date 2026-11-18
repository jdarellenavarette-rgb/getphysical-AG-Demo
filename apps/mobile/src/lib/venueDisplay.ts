import type { FacilityRow } from "sodia-core";
import { calculateHaversineKm, formatWalkingEta, type UserCoordinates } from "../services/locationService";

/** "1.2 km • 15 min walk", or null when the venue has no map position. */
export function venueDistanceLabel(venue: FacilityRow, from: UserCoordinates): string | null {
  if (venue.lat == null || venue.lng == null) return null;
  const km = calculateHaversineKm(from.latitude, from.longitude, venue.lat, venue.lng);
  return `${km} km • ${formatWalkingEta(km)}`;
}

/** The venue's headline price, or "See plans" when it has not set one. */
export function venuePriceLabel(venue: FacilityRow): string {
  if (venue.court_hourly_price_php != null && venue.registry !== "A") {
    return `₱${venue.court_hourly_price_php.toLocaleString()}/hr Court`;
  }
  if (venue.day_pass_price_php != null) return `₱${venue.day_pass_price_php.toLocaleString()} Day Pass`;
  return "See plans";
}

/** "12/80" people inside, or null when the venue has not set a capacity. */
export function venueOccupancyLabel(venue: FacilityRow): string | null {
  if (!venue.max_capacity) return null;
  return `${venue.inside_now_count ?? 0}/${venue.max_capacity}`;
}

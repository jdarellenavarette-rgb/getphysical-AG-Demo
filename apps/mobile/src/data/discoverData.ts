import type { FacilityRow } from "sodia-core";
import { FACILITIES_PART_1 } from "./discoverFacilitiesNorth";
import { FACILITIES_PART_2 } from "./discoverFacilitiesSouth";

export type DiscoverCategory =
  | "All"
  | "Gyms"
  | "Pilates Studios"
  | "Sports Facilities"
  | "Coaches"
  | "Community Clubs";

export interface DiscoverCoach {
  id: string;
  name: string;
  roleType: "coach";
  title: string;
  specialty: "Strength & Conditioning" | "Pilates & Mobility" | "Racket Sports" | "Hyrox & Endurance" | "Boxing & Combat";
  sports: string[];
  avatar: string;
  rating: number;
  reviewCount: number;
  hourlyRatePhp: number;
  homeFacilityId: string;
  homeFacilityName: string;
  address: string;
  lat: number;
  lng: number;
  bio: string;
  schedule: string;
  experienceYears: number;
  credentials: string[];
}

export interface DiscoverCommunityClub {
  id: string;
  name: string;
  roleType: "community_club";
  category: "Running Crew" | "Cycling Peloton" | "Basketball Guild" | "Volleyball Collective" | "Racket Club";
  sport: string;
  sports: string[];
  coverImage: string;
  avatar: string;
  memberCount: number;
  meetingPoint: string;
  address: string;
  lat: number;
  lng: number;
  schedule: string;
  dropInFeePhp: number;
  paceOrLevel: string;
  description: string;
  organizer: string;
}

export interface DiscoverFilterState {
  category: DiscoverCategory;
  sport: string; // 'All' or specific sport
  priceRange: "all" | "under_300" | "300_600" | "above_600";
  openNowOnly: boolean;
}

export const INITIAL_DISCOVER_FILTERS: DiscoverFilterState = {
  category: "All",
  sport: "All",
  priceRange: "all",
  openNowOnly: false,
};

// Seed catalog for Discover, split per entity to keep files small.

export const EXPANDED_FACILITIES: readonly FacilityRow[] = [...FACILITIES_PART_1, ...FACILITIES_PART_2];
export { EXPANDED_COACHES } from "./discoverCoaches";
export { EXPANDED_CLUBS } from "./discoverClubs";

export function getFacilityPrimaryCategory(facility: FacilityRow): "Gyms" | "Pilates Studios" | "Sports Facilities" {
  const cat = facility.category.toLowerCase();
  const name = facility.name.toLowerCase();
  if (cat.includes("pilates") || name.includes("pilates") || cat.includes("reformer") || cat.includes("lagree")) {
    return "Pilates Studios";
  }
  if (
    cat.includes("racket") ||
    cat.includes("court") ||
    cat.includes("badminton") ||
    cat.includes("aquatic") ||
    cat.includes("pool") ||
    cat.includes("boulder") ||
    cat.includes("climb") ||
    cat.includes("turf") ||
    cat.includes("football")
  ) {
    return "Sports Facilities";
  }
  return "Gyms";
}

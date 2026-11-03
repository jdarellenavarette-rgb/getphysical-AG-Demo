import type { FacilityRow } from "sodia-core";
import {
  EXPANDED_COACHES,
  EXPANDED_CLUBS,
  getFacilityPrimaryCategory,
  type DiscoverFilterState,
  type DiscoverCoach,
  type DiscoverCommunityClub,
} from "./discoverData";

interface FilterResult {
  filteredFacilities: FacilityRow[];
  filteredCoaches: DiscoverCoach[];
  filteredClubs: DiscoverCommunityClub[];
}

export function filterDiscoverItems(
  allFacilities: FacilityRow[],
  searchQuery: string,
  filters: DiscoverFilterState
): FilterResult {
  const q = searchQuery.trim().toLowerCase();
  const { category, sport, priceRange, openNowOnly } = filters;

  const matchesQuery = (text: string) => !q || text.toLowerCase().includes(q);

  // 1. Filter Facilities
  const filteredFacilities = allFacilities.filter((f) => {
    const primaryCat = getFacilityPrimaryCategory(f);
    if (category === "Coaches" || category === "Community Clubs") return false;
    if (category !== "All" && primaryCat !== category) return false;
    if (openNowOnly && !f.is_open) return false;

    const price = f.day_pass_price_php ?? f.court_hourly_price_php ?? 250;
    if (priceRange === "under_300" && price > 300) return false;
    if (priceRange === "300_600" && (price < 300 || price > 600)) return false;
    if (priceRange === "above_600" && price < 600) return false;

    if (sport !== "All") {
      const textToSearch = `${f.name} ${f.category} ${(f.amenities ?? []).join(" ")}`.toLowerCase();
      if (!textToSearch.includes(sport.toLowerCase())) return false;
    }

    const fullText = `${f.name} ${f.category} ${f.address} ${(f.amenities ?? []).join(" ")}`;
    return matchesQuery(fullText);
  });

  // 2. Filter Coaches
  const filteredCoaches = EXPANDED_COACHES.filter((c) => {
    if (category !== "All" && category !== "Coaches") return false;
    if (priceRange === "under_300") return false;

    if (sport !== "All") {
      const text = `${c.name} ${c.specialty} ${c.sports.join(" ")}`.toLowerCase();
      if (!text.includes(sport.toLowerCase())) return false;
    }

    const fullText = `${c.name} ${c.title} ${c.specialty} ${c.address} ${c.sports.join(" ")}`;
    return matchesQuery(fullText);
  });

  // 3. Filter Clubs
  const filteredClubs = EXPANDED_CLUBS.filter((cl) => {
    if (category !== "All" && category !== "Community Clubs") return false;
    if (priceRange === "300_600" && cl.dropInFeePhp > 600) return false;
    if (priceRange === "above_600" && cl.dropInFeePhp < 600) return false;

    if (sport !== "All") {
      const text = `${cl.name} ${cl.category} ${cl.sport} ${cl.sports.join(" ")}`.toLowerCase();
      if (!text.includes(sport.toLowerCase())) return false;
    }

    const fullText = `${cl.name} ${cl.category} ${cl.sport} ${cl.address} ${cl.meetingPoint}`;
    return matchesQuery(fullText);
  });

  return { filteredFacilities, filteredCoaches, filteredClubs };
}

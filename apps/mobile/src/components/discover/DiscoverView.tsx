import React, { useState, useEffect, useMemo } from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Search, X, Map as MapIcon, List, SlidersHorizontal } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { FacilityRow } from "sodia-core";
import { styles } from "./DiscoverView.styles";
import { DiscoverMapCanvas } from "./DiscoverMapCanvas";
import { DiscoverFilterBar } from "./DiscoverFilterBar";
import { DiscoverFilterModal } from "./DiscoverFilterModal";
import { DiscoverListSection } from "./DiscoverListSection";
import { DiscoverCarousel } from "./DiscoverCarousel";
import { DiscoverLoadState } from "./DiscoverLoadState";
import { FacilityDetailSheet, type FacilityPassOption } from "./FacilityDetailSheet";
import { DiscoverEntitySheet, type DiscoverSelectedEntity } from "./DiscoverEntitySheet";
import {
  EXPANDED_COACHES,
  EXPANDED_CLUBS,
  type DiscoverFilterState,
  INITIAL_DISCOVER_FILTERS,
} from "../../data/discoverData";
import { filterDiscoverItems } from "../../data/discoverFilterHelper";
import { useDiscoverVenues } from "../../hooks/useDiscoverVenues";
import { requestAndFetchUserLocation, DEFAULT_BGC_COORDS, type UserCoordinates } from "../../services/locationService";

export interface CheckoutRequest {
  id: string;
  /** The venue plan being bought (`facility_products.id`). Absent for offline-preview samples. */
  productId?: string;
  title: string;
  subtitle: string;
  facilityId: string;
  facilityName: string;
  baseAmountPhp: number;
  billingKind: "one_time_pass" | "recurring_subscription";
  splitNote?: string;
}

/** What the checkout sheet needs to sell one of a venue's plans. */
export function toCheckoutRequest(option: FacilityPassOption, venue: FacilityRow): CheckoutRequest {
  return {
    id: option.id,
    productId: option.productId,
    title: `${option.title} • ${venue.name}`,
    subtitle: option.subtitle,
    facilityId: venue.id,
    facilityName: venue.name,
    baseAmountPhp: option.pricePhp,
    billingKind: option.billingKind,
    splitNote: option.splitNote,
  };
}

interface DiscoverViewProps {
  onSelectFacility?: (facility: FacilityRow) => void;
  onCheckoutItem?: (item: CheckoutRequest) => void;
}

export function DiscoverView({ onCheckoutItem }: DiscoverViewProps) {
  const { colors } = useThemeStore();
  const { live, venues, status, error, retry } = useDiscoverVenues();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DiscoverFilterState>(INITIAL_DISCOVER_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(() =>
    live ? null : (venues[0]?.id ?? null),
  );
  const [selectedDetailFacility, setSelectedDetailFacility] = useState<FacilityRow | null>(null);
  const [selectedEntityForSheet, setSelectedEntityForSheet] = useState<DiscoverSelectedEntity>(null);
  const [userCoords, setUserCoords] = useState<UserCoordinates>(DEFAULT_BGC_COORDS);

  useEffect(() => {
    let active = true;
    requestAndFetchUserLocation().then((loc) => {
      if (active) setUserCoords(loc);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sample coaches and clubs belong to the offline preview only; with a backend only real venues are listed.
  const { filteredFacilities, filteredCoaches, filteredClubs } = useMemo(
    () => filterDiscoverItems(venues, searchQuery, filters, !live),
    [venues, searchQuery, filters, live],
  );
  // Only venues with a map position get a pin.
  const mappedFacilities = useMemo(
    () => filteredFacilities.filter((f) => f.lat != null && f.lng != null),
    [filteredFacilities],
  );

  const hasActiveFilters =
    filters.category !== "All" || filters.sport !== "All" || filters.priceRange !== "all" || filters.openNowOnly;
  const totalCount = filteredFacilities.length + filteredCoaches.length + filteredClubs.length;
  const openVenue = (fac: FacilityRow) => {
    setSelectedFacilityId(fac.id);
    setSelectedDetailFacility(fac);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      {/* 1. FLOATING SEARCH HEADER */}
      <View style={styles.searchHeader}>
        <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search Gyms, Pilates, Courts, Clubs..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setIsFilterModalOpen(true)}
          style={[
            styles.filterTriggerBtn,
            { backgroundColor: colors.bgCard, borderColor: hasActiveFilters ? "#E11D48" : colors.borderColor },
          ]}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? "#E11D48" : colors.textPrimary} />
          {hasActiveFilters && <View style={styles.filterBadgeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "map" ? "list" : "map")}
          style={[styles.viewToggleBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
        >
          {viewMode === "map" ? (
            <List size={18} color={colors.textPrimary} />
          ) : (
            <MapIcon size={18} color={colors.textPrimary} />
          )}
        </TouchableOpacity>
      </View>

      {/* 2. CATEGORY & SPORT FILTER BAR */}
      <DiscoverFilterBar
        selectedCategory={filters.category}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat, sport: "All" }))}
        selectedSport={filters.sport}
        onSelectSport={(sp) => setFilters((prev) => ({ ...prev, sport: sp }))}
      />

      {/* 3. LOADING / ERROR / NO VENUES, THEN MAP OR LIST */}
      {status !== "ready" ? (
        <DiscoverLoadState status={status} error={error} onRetry={retry} />
      ) : viewMode === "map" ? (
        <View style={styles.mapViewport}>
          <DiscoverMapCanvas
            facilities={mappedFacilities}
            coaches={filteredCoaches}
            clubs={filteredClubs}
            selectedId={selectedFacilityId}
            userCoords={userCoords}
            onSelectPin={(id) => {
              const fac = venues.find((f) => f.id === id);
              if (fac) openVenue(fac);
            }}
            onSelectCoach={(id) => {
              const coach = EXPANDED_COACHES.find((c) => c.id === id);
              if (coach) setSelectedEntityForSheet({ kind: "coach", data: coach });
            }}
            onSelectClub={(id) => {
              const club = EXPANDED_CLUBS.find((cl) => cl.id === id);
              if (club) setSelectedEntityForSheet({ kind: "club", data: club });
            }}
            onRefreshLocation={() => requestAndFetchUserLocation().then(setUserCoords)}
          />
          <DiscoverCarousel
            facilities={filteredFacilities}
            selectedId={selectedFacilityId}
            userCoords={userCoords}
            onSelect={openVenue}
          />
        </View>
      ) : (
        <DiscoverListSection
          facilities={filteredFacilities}
          coaches={filteredCoaches}
          clubs={filteredClubs}
          userCoords={userCoords}
          onSelectFacility={setSelectedDetailFacility}
          onSelectCoach={(c) => setSelectedEntityForSheet({ kind: "coach", data: c })}
          onSelectClub={(cl) => setSelectedEntityForSheet({ kind: "club", data: cl })}
          onResetFilters={() => setFilters(INITIAL_DISCOVER_FILTERS)}
        />
      )}

      <DiscoverFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        totalResultsCount={totalCount}
      />

      <FacilityDetailSheet
        facility={selectedDetailFacility}
        visible={!!selectedDetailFacility}
        onClose={() => setSelectedDetailFacility(null)}
        onSelectPass={(passOpt, fac) => {
          setSelectedDetailFacility(null);
          onCheckoutItem?.(toCheckoutRequest(passOpt, fac));
        }}
      />

      {/* COACH & CLUB DETAIL SHEET (offline preview samples only) */}
      <DiscoverEntitySheet
        entity={selectedEntityForSheet}
        visible={!!selectedEntityForSheet}
        onClose={() => setSelectedEntityForSheet(null)}
        onConfirmBooking={(itemTitle, pricePhp, facId, facName) => {
          setSelectedEntityForSheet(null);
          onCheckoutItem?.({
            id: `entity_book_${Date.now()}`,
            title: itemTitle,
            subtitle: facName ?? "Session",
            facilityId: facId ?? "fac_metro_core",
            facilityName: facName ?? "Metro Athletic Network",
            baseAmountPhp: pricePhp,
            billingKind: "one_time_pass",
          });
        }}
      />
    </View>
  );
}

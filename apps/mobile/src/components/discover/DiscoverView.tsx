import React, { useMemo, useState } from "react";
import { StyleSheet as RNStyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Search, X, Map as MapIcon, List, SlidersHorizontal } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useColors } from "../../theme/theme";
import { overlays } from "../../navigation/overlayStore";
import { styles } from "./DiscoverView.styles";
import { DiscoverMapCanvas } from "./DiscoverMapCanvas";
import { DiscoverFilterBar } from "./DiscoverFilterBar";
import { DiscoverFilterModal } from "./DiscoverFilterModal";
import { DiscoverListSection } from "./DiscoverListSection";
import { DiscoverCarousel } from "./DiscoverCarousel";
import { LocationSeedCard } from "./LocationSeedCard";
import { DiscoverEntitySheet, type DiscoverSelectedEntity } from "./DiscoverEntitySheet";
import { EXPANDED_FACILITIES, EXPANDED_COACHES, EXPANDED_CLUBS, type DiscoverFilterState, INITIAL_DISCOVER_FILTERS } from "../../data/discoverData";
import { filterDiscoverItems } from "../../data/discoverFilterHelper";
import { useDiscoverLocation } from "../../hooks/useDiscoverLocation";

export interface CheckoutRequest {
  id: string;
  title: string;
  subtitle: string;
  facilityId: string;
  facilityName: string;
  baseAmountPhp: number;
  billingKind: "one_time_pass" | "recurring_subscription";
  splitNote?: string;
}

interface DiscoverViewProps {
  onCheckoutItem?: (item: CheckoutRequest) => void;
}

export function DiscoverView({ onCheckoutItem }: DiscoverViewProps) {
  const facilities = useEcosystemStore((s) => s.facilities);
  const colors = useColors();
  const location = useDiscoverLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DiscoverFilterState>(INITIAL_DISCOVER_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(EXPANDED_FACILITIES[0]?.id ?? null);
  const [entity, setEntity] = useState<DiscoverSelectedEntity>(null);

  const allFacilities = useMemo(() => {
    const map = new Map<string, FacilityRow>();
    EXPANDED_FACILITIES.forEach((f) => map.set(f.id, f));
    facilities.forEach((f) => map.set(f.id, f));
    return Array.from(map.values());
  }, [facilities]);

  const { filteredFacilities, filteredCoaches, filteredClubs } = useMemo(
    () => filterDiscoverItems(allFacilities, searchQuery, filters),
    [allFacilities, searchQuery, filters]
  );

  const activeFilters = [
    filters.category !== "All" ? filters.category : null,
    filters.sport !== "All" ? filters.sport : null,
    filters.priceRange !== "all" ? filters.priceRange : null,
    filters.openNowOnly ? "Open now" : null,
  ].filter((f): f is string => f !== null);
  const hasActiveFilters = activeFilters.length > 0;
  const totalCount = filteredFacilities.length + filteredCoaches.length + filteredClubs.length;

  const openFacility = (facility: FacilityRow) => {
    setSelectedFacilityId(facility.id);
    overlays.open({ kind: "facility", facility });
  };
  const resetAll = () => {
    setFilters(INITIAL_DISCOVER_FILTERS);
    setSearchQuery("");
  };
  const seedCard = location.permission === "denied" ? <LocationSeedCard variant="inline" onSeed={location.applySeed} /> : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
      <View style={styles.searchHeader}>
        <View style={[styles.searchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <Search size={16} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search gyms, pilates, courts, clubs…"
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            accessibilityLabel="Search venues"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear search">
              <X size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setIsFilterModalOpen(true)}
          style={[styles.filterTriggerBtn, { backgroundColor: colors.bgCard, borderColor: hasActiveFilters ? colors.accent : colors.borderColor }]}
          accessibilityRole="button"
          accessibilityLabel={hasActiveFilters ? `Filters, ${activeFilters.length} active` : "Filters"}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? colors.accentText : colors.textPrimary} />
          {hasActiveFilters && <View style={[styles.filterBadgeDot, { backgroundColor: colors.accent }]} />}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "map" ? "list" : "map")}
          style={[styles.viewToggleBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          accessibilityRole="button"
          accessibilityLabel={viewMode === "map" ? "Show list view" : "Show map view"}
        >
          {viewMode === "map" ? <List size={18} color={colors.textPrimary} /> : <MapIcon size={18} color={colors.textPrimary} />}
        </TouchableOpacity>
      </View>

      <DiscoverFilterBar
        selectedCategory={filters.category}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat, sport: "All" }))}
        selectedSport={filters.sport}
        onSelectSport={(sp) => setFilters((prev) => ({ ...prev, sport: sp }))}
      />

      {viewMode === "map" ? (
        <View style={styles.mapViewport}>
          <DiscoverMapCanvas
            facilities={filteredFacilities}
            coaches={filteredCoaches}
            clubs={filteredClubs}
            selectedId={selectedFacilityId}
            userCoords={location.coords}
            onSelectPin={(id) => {
              const fac = allFacilities.find((f) => f.id === id);
              if (fac) openFacility(fac);
            }}
            onSelectCoach={(id) => {
              const coach = EXPANDED_COACHES.find((c) => c.id === id);
              if (coach) setEntity({ kind: "coach", data: coach });
            }}
            onSelectClub={(id) => {
              const club = EXPANDED_CLUBS.find((cl) => cl.id === id);
              if (club) setEntity({ kind: "club", data: club });
            }}
            onRefreshLocation={() => {
              location.refresh().catch(() => undefined);
            }}
          />
          {location.isBlocked ? (
            <View style={[RNStyleSheet.absoluteFill, local.blocked, { backgroundColor: colors.overlayScrim }]}>
              <LocationSeedCard variant="overlay" onSeed={location.applySeed} />
            </View>
          ) : (
            <DiscoverCarousel facilities={filteredFacilities} selectedId={selectedFacilityId} userCoords={location.coords} onSelect={openFacility} />
          )}
        </View>
      ) : (
        <DiscoverListSection
          facilities={filteredFacilities}
          coaches={filteredCoaches}
          clubs={filteredClubs}
          userCoords={location.coords}
          query={searchQuery}
          activeFilters={activeFilters}
          header={seedCard}
          onSelectFacility={openFacility}
          onSelectCoach={(c) => setEntity({ kind: "coach", data: c })}
          onSelectClub={(cl) => setEntity({ kind: "club", data: cl })}
          onResetFilters={resetAll}
          onSelectSuggestion={(s) => {
            setFilters(INITIAL_DISCOVER_FILTERS);
            setSearchQuery(s);
          }}
        />
      )}

      <DiscoverFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        totalResultsCount={totalCount}
      />

      <DiscoverEntitySheet
        entity={entity}
        visible={!!entity}
        onClose={() => setEntity(null)}
        onConfirmBooking={(itemTitle, pricePhp, facId, facName) => {
          setEntity(null);
          onCheckoutItem?.({
            id: `entity_book_${Date.now()}`,
            title: itemTitle,
            subtitle: facName ?? "Athletic Session",
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

const local = RNStyleSheet.create({
  blocked: { justifyContent: "center", paddingBottom: 80 },
});

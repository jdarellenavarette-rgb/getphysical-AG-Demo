import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from "react-native";
import { Search, Users, Navigation, X, Map as MapIcon, List, SlidersHorizontal } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import type { FacilityRow } from "sodia-core";
import { styles } from "./DiscoverView.styles";
import { DiscoverMapCanvas } from "./DiscoverMapCanvas";
import { DiscoverFilterBar } from "./DiscoverFilterBar";
import { DiscoverFilterModal } from "./DiscoverFilterModal";
import { DiscoverListSection } from "./DiscoverListSection";
import { FacilityDetailSheet } from "./FacilityDetailSheet";
import { DiscoverEntitySheet, type DiscoverSelectedEntity } from "./DiscoverEntitySheet";
import { EXPANDED_FACILITIES, EXPANDED_COACHES, EXPANDED_CLUBS, type DiscoverFilterState, INITIAL_DISCOVER_FILTERS } from "../../data/discoverData";
import { filterDiscoverItems } from "../../data/discoverFilterHelper";
import { requestAndFetchUserLocation, DEFAULT_BGC_COORDS, calculateHaversineKm, formatWalkingEta, type UserCoordinates } from "../../services/locationService";

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
  onSelectFacility?: (facility: FacilityRow) => void;
  onCheckoutItem?: (item: CheckoutRequest) => void;
}

export function DiscoverView({ onCheckoutItem }: DiscoverViewProps) {
  const { facilities } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<DiscoverFilterState>(INITIAL_DISCOVER_FILTERS);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(EXPANDED_FACILITIES[0]?.id ?? null);
  const [selectedDetailFacility, setSelectedDetailFacility] = useState<FacilityRow | null>(null);
  const [selectedEntityForSheet, setSelectedEntityForSheet] = useState<DiscoverSelectedEntity>(null);
  const [userCoords, setUserCoords] = useState<UserCoordinates>(DEFAULT_BGC_COORDS);

  useEffect(() => {
    let active = true;
    requestAndFetchUserLocation().then((loc) => { if (active) setUserCoords(loc); });
    return () => { active = false; };
  }, []);

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

  const hasActiveFilters = filters.category !== "All" || filters.sport !== "All" || filters.priceRange !== "all" || filters.openNowOnly;
  const totalCount = filteredFacilities.length + filteredCoaches.length + filteredClubs.length;

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
            <TouchableOpacity onPress={() => setSearchQuery("")}><X size={16} color={colors.textMuted} /></TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setIsFilterModalOpen(true)}
          style={[styles.filterTriggerBtn, { backgroundColor: colors.bgCard, borderColor: hasActiveFilters ? "#E11D48" : colors.borderColor }]}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? "#E11D48" : colors.textPrimary} />
          {hasActiveFilters && <View style={styles.filterBadgeDot} />}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "map" ? "list" : "map")}
          style={[styles.viewToggleBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
        >
          {viewMode === "map" ? <List size={18} color={colors.textPrimary} /> : <MapIcon size={18} color={colors.textPrimary} />}
        </TouchableOpacity>
      </View>

      {/* 2. CATEGORY & SPORT FILTER BAR */}
      <DiscoverFilterBar
        selectedCategory={filters.category}
        onSelectCategory={(cat) => setFilters((prev) => ({ ...prev, category: cat, sport: "All" }))}
        selectedSport={filters.sport}
        onSelectSport={(sp) => setFilters((prev) => ({ ...prev, sport: sp }))}
      />

      {/* 3. MAP OR LIST VIEW */}
      {viewMode === "map" ? (
        <View style={styles.mapViewport}>
          <DiscoverMapCanvas
            facilities={filteredFacilities}
            coaches={filteredCoaches}
            clubs={filteredClubs}
            selectedId={selectedFacilityId}
            userCoords={userCoords}
            onSelectPin={(id) => {
              setSelectedFacilityId(id);
              const fac = allFacilities.find((f) => f.id === id);
              if (fac) setSelectedDetailFacility(fac);
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

          <View style={styles.carouselSection}>
            <Text style={[styles.carouselHeaderTitle, { color: colors.textMuted }]}>ATHLETIC HUBS & EXPERIENCES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
              {filteredFacilities.map((fac) => {
                const isSelected = fac.id === selectedFacilityId;
                const distKm = calculateHaversineKm(userCoords.latitude, userCoords.longitude, fac.lat ?? 14.549, fac.lng ?? 121.05);
                return (
                  <TouchableOpacity
                    key={fac.id}
                    onPress={() => { setSelectedFacilityId(fac.id); setSelectedDetailFacility(fac); }}
                    style={[styles.grabCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }, isSelected && styles.grabCardActive]}
                  >
                    <Image source={{ uri: fac.cover_image ?? "" }} style={styles.grabCover} />
                    <View style={styles.grabBody}>
                      <View style={styles.grabTopRow}>
                        <Text style={[styles.grabName, { color: colors.textPrimary }]} numberOfLines={1}>{fac.name}</Text>
                        <View style={styles.capacityPill}>
                          <Users size={11} color="#10B981" />
                          <Text style={styles.capacityPillText}>{fac.inside_now_count ?? 42}/{fac.max_capacity ?? 100}</Text>
                        </View>
                      </View>
                      <View style={styles.grabLocationRow}>
                        <Navigation size={11} color={colors.textMuted} />
                        <Text style={[styles.grabDistanceText, { color: colors.textMuted }]}>{distKm} km • {formatWalkingEta(distKm)}</Text>
                      </View>
                      <View style={[styles.grabFooter, { borderTopColor: colors.borderColor }]}>
                        <Text style={[styles.grabPrice, { color: colors.textPrimary }]}>
                          {fac.registry === "A" ? `₱${fac.day_pass_price_php} Pass` : `₱${fac.court_hourly_price_php}/hr Court`}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedDetailFacility(fac)} style={styles.grabBookCTA}>
                          <Text style={styles.grabBookText}>Passes</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
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

      {/* FILTER MODAL */}
      <DiscoverFilterModal
        visible={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        totalResultsCount={totalCount}
      />

      {/* FACILITY DETAIL SHEET */}
      <FacilityDetailSheet
        facility={selectedDetailFacility}
        visible={!!selectedDetailFacility}
        onClose={() => setSelectedDetailFacility(null)}
        onSelectPass={(passOpt, fac) => {
          setSelectedDetailFacility(null);
          onCheckoutItem?.({
            id: passOpt.id,
            title: `${passOpt.title} • ${fac.name}`,
            subtitle: passOpt.subtitle,
            facilityId: fac.id,
            facilityName: fac.name,
            baseAmountPhp: passOpt.pricePhp,
            billingKind: passOpt.billingKind,
            splitNote: passOpt.splitNote,
          });
        }}
      />

      {/* COACH & CLUB DETAIL SHEET */}
      <DiscoverEntitySheet
        entity={selectedEntityForSheet}
        visible={!!selectedEntityForSheet}
        onClose={() => setSelectedEntityForSheet(null)}
        onConfirmBooking={(itemTitle, pricePhp, facId, facName) => {
          setSelectedEntityForSheet(null);
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

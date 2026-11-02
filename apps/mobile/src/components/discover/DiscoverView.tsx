import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Search, Users, Navigation, X, Map as MapIcon, List } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { DiscoverMapCanvas } from "./DiscoverMapCanvas";
import { DiscoverEntitySheet, type DiscoverEntityType } from "./DiscoverEntitySheet";
import { FacilityDetailSheet, type FacilityPassOption } from "./FacilityDetailSheet";
import type { FacilityRow } from "sodia-core";

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

export function DiscoverView({ onSelectFacility, onCheckoutItem }: DiscoverViewProps) {
  const { facilities } = useEcosystemStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(facilities[0]?.id ?? null);
  const [activeSheetEntity, setActiveSheetEntity] = useState<DiscoverEntityType>(null);
  const [selectedFacilityForDetail, setSelectedFacilityForDetail] = useState<FacilityRow | null>(null);

  const filters = ["All", "Commercial Gyms", "Pickleball & Courts", "Coaches", "Meets"];

  const handleFilterPress = (fil: string) => {
    setSelectedFilter(fil);
    if (fil === "Coaches") setActiveSheetEntity("coach");
    if (fil === "Meets") setActiveSheetEntity("meet");
  };

  const filteredFacilities = facilities.filter((f) => {
    if (selectedFilter === "Commercial Gyms" && f.registry !== "A") return false;
    if (selectedFilter === "Pickleball & Courts" && f.registry !== "B") return false;
    if (searchQuery.trim().length > 0) {
      return (
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* 1. FLOATING SEARCH HEADER */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Search size={16} color="#71717A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search BGC, Makati, clubs or coaches..."
            placeholderTextColor="#71717A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color="#71717A" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => setViewMode(viewMode === "map" ? "list" : "map")} style={styles.viewToggleBtn}>
          {viewMode === "map" ? <List size={18} color="#FAFAFA" /> : <MapIcon size={18} color="#FAFAFA" />}
        </TouchableOpacity>
      </View>

      {/* 2. CATEGORY FILTER PILLS */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {filters.map((fil) => (
            <TouchableOpacity
              key={fil}
              onPress={() => handleFilterPress(fil)}
              style={[styles.filterChip, selectedFilter === fil && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, selectedFilter === fil && styles.filterTextActive]}>{fil}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. MAP VIEW (RADAR + CAROUSEL) */}
      {viewMode === "map" ? (
        <View style={styles.mapViewport}>
          <DiscoverMapCanvas
            facilities={filteredFacilities}
            selectedId={selectedFacilityId}
            onSelectPin={(id) => {
              setSelectedFacilityId(id);
              const fac = facilities.find((f) => f.id === id);
              if (fac) setSelectedFacilityForDetail(fac);
            }}
            onSelectCoach={() => setActiveSheetEntity("coach")}
            onSelectMeet={() => setActiveSheetEntity("meet")}
          />

          <View style={styles.carouselSection}>
            <Text style={styles.carouselHeaderTitle}>NEARBY ATHLETIC HUBS</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
              {filteredFacilities.map((fac) => {
                const isSelected = fac.id === selectedFacilityId;
                return (
                  <TouchableOpacity
                    key={fac.id}
                    onPress={() => {
                      setSelectedFacilityId(fac.id);
                      setSelectedFacilityForDetail(fac);
                    }}
                    style={[styles.grabCard, isSelected && styles.grabCardActive]}
                  >
                    <Image source={{ uri: fac.cover_image ?? "" }} style={styles.grabCover} />
                    <View style={styles.grabBody}>
                      <View style={styles.grabTopRow}>
                        <Text style={styles.grabName}>{fac.name}</Text>
                        <View style={styles.capacityPill}>
                          <Users size={11} color="#10B981" />
                          <Text style={styles.capacityPillText}>{fac.inside_now_count ?? 42}/{fac.max_capacity ?? 100}</Text>
                        </View>
                      </View>
                      <View style={styles.grabLocationRow}>
                        <Navigation size={11} color="#71717A" />
                        <Text style={styles.grabDistanceText}>{fac.distance} • 12 min walk</Text>
                      </View>
                      <View style={styles.grabFooter}>
                        <Text style={styles.grabPrice}>
                          {fac.registry === "A" ? `₱${fac.day_pass_price_php} Day Pass` : `₱${fac.court_hourly_price_php}/hr Court`}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedFacilityForDetail(fac)} style={styles.grabBookCTA}>
                          <Text style={styles.grabBookText}>View Passes</Text>
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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 12 }}>
          {filteredFacilities.map((fac) => (
            <TouchableOpacity key={fac.id} onPress={() => setSelectedFacilityForDetail(fac)} style={styles.listCard}>
              <Image source={{ uri: fac.cover_image ?? "" }} style={styles.listImage} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.listName}>{fac.name}</Text>
                <Text style={styles.listMeta}>{fac.distance} • {fac.category}</Text>
                <Text style={styles.listPrice}>₱{fac.day_pass_price_php ?? fac.court_hourly_price_php}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* FACILITY DETAIL SHEET */}
      <FacilityDetailSheet
        facility={selectedFacilityForDetail}
        visible={!!selectedFacilityForDetail}
        onClose={() => setSelectedFacilityForDetail(null)}
        onSelectPass={(passOpt, fac) => {
          setSelectedFacilityForDetail(null);
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

      {/* DISCOVER ENTITY SHEET (COACH / TOURNAMENT) */}
      <DiscoverEntitySheet
        entityType={activeSheetEntity}
        visible={!!activeSheetEntity}
        onClose={() => setActiveSheetEntity(null)}
        onConfirmBooking={() => {
          const isC = activeSheetEntity === "coach";
          onCheckoutItem?.({
            id: isC ? "coach_miguel_pt" : "meet_sunset_open",
            title: isC ? "1-on-1 PT Session with Miguel Ramos" : "BGC Sunset Pickleball Open Roster Entry",
            subtitle: isC ? "Metro Core Arena • Strength & Plyometrics" : "Nexus Court Club • DUPR 3.0 - 4.0 Bracket",
            facilityId: isC ? "fac_metro_core" : "fac_nexus_club",
            facilityName: isC ? "Metro Core Arena" : "Nexus Racket & Court Club",
            baseAmountPhp: isC ? 1350 : 500,
            billingKind: "one_time_pass",
            splitNote: isC ? "₱1,200 Coach Payout + ₱150 Floor Access Fee" : "Direct Bracket Prize Pool Escrow",
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  searchHeader: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6, gap: 10 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#141418", borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: "#27272A" },
  searchInput: { flex: 1, color: "#FAFAFA", fontSize: 13, marginLeft: 8 },
  viewToggleBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", alignItems: "center", justifyContent: "center" },
  filtersWrapper: { paddingVertical: 8 },
  filtersScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: { backgroundColor: "#141418", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "#27272A" },
  filterChipActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  filterText: { color: "#71717A", fontSize: 12, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF", fontWeight: "800" },
  mapViewport: { flex: 1, position: "relative" },
  carouselSection: { position: "absolute", bottom: 100, left: 0, right: 0 },
  carouselHeaderTitle: { color: "#A1A1AA", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginLeft: 16, marginBottom: 8 },
  carouselScroll: { paddingHorizontal: 16, gap: 12 },
  grabCard: { width: 260, backgroundColor: "#18181B", borderRadius: 16, overflow: "hidden", borderWidth: 1.5, borderColor: "#27272A" },
  grabCardActive: { borderColor: "#E11D48" },
  grabCover: { width: "100%", height: 95 },
  grabBody: { padding: 12 },
  grabTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grabName: { color: "#FAFAFA", fontSize: 13, fontWeight: "800", flex: 1, marginRight: 6 },
  capacityPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  capacityPillText: { color: "#10B981", fontSize: 9, fontWeight: "800" },
  grabLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  grabDistanceText: { color: "#71717A", fontSize: 10 },
  grabFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#27272A" },
  grabPrice: { color: "#FAFAFA", fontSize: 12, fontWeight: "800" },
  grabBookCTA: { backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  grabBookText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  listCard: { flexDirection: "row", backgroundColor: "#141418", borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#27272A" },
  listImage: { width: 70, height: 70, borderRadius: 10 },
  listName: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  listMeta: { color: "#71717A", fontSize: 11, marginTop: 3 },
  listPrice: { color: "#10B981", fontSize: 13, fontWeight: "800", marginTop: 4 },
});

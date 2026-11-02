import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Search, MapPin, Users, Navigation, X, Map as MapIcon, List, UserCheck, Award } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { DiscoverMapCanvas } from "./DiscoverMapCanvas";
import type { FacilityRow } from "sodia-core";

interface DiscoverViewProps {
  onSelectFacility?: (facility: FacilityRow) => void;
}

export function DiscoverView({ onSelectFacility }: DiscoverViewProps) {
  const { facilities } = useEcosystemStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(facilities[0]?.id ?? null);

  const filters = ["All", "Commercial Gyms", "Pickleball & Courts", "Coaches", "Meets"];

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

  const activeSelectedFacility = facilities.find((f) => f.id === selectedFacilityId) ?? facilities[0];

  return (
    <View style={styles.container}>
      {/* 1. FLOATING GRAB-STYLE SEARCH HEADER */}
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

        {/* MAP / LIST VIEW TOGGLE */}
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "map" ? "list" : "map")}
          style={styles.viewToggleBtn}
        >
          {viewMode === "map" ? <List size={18} color="#FAFAFA" /> : <MapIcon size={18} color="#FAFAFA" />}
        </TouchableOpacity>
      </View>

      {/* 2. CATEGORY FILTER PILLS */}
      <View style={styles.filtersWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          {filters.map((fil) => (
            <TouchableOpacity
              key={fil}
              onPress={() => setSelectedFilter(fil)}
              style={[styles.filterChip, selectedFilter === fil && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, selectedFilter === fil && styles.filterTextActive]}>
                {fil}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 3. MAP VIEW (GRAB-LIKE GPS RADAR + HORIZONTAL SNAP CAROUSEL) */}
      {viewMode === "map" ? (
        <View style={styles.mapViewport}>
          <DiscoverMapCanvas
            facilities={filteredFacilities}
            selectedId={selectedFacilityId}
            onSelectPin={(id) => setSelectedFacilityId(id)}
          />

          {/* GRAB-STYLE HORIZONTAL BOTTOM CAROUSEL */}
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
                      onSelectFacility?.(fac);
                    }}
                    style={[styles.grabCard, isSelected && styles.grabCardActive]}
                  >
                    <Image source={{ uri: fac.cover_image ?? "" }} style={styles.grabCover} />
                    <View style={styles.grabBody}>
                      <View style={styles.grabTopRow}>
                        <Text style={styles.grabName}>{fac.name}</Text>
                        <View style={styles.capacityPill}>
                          <Users size={11} color="#10B981" />
                          <Text style={styles.capacityPillText}>
                            {fac.inside_now_count ?? 42}/{fac.max_capacity ?? 100}
                          </Text>
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
                        <TouchableOpacity
                          onPress={() => onSelectFacility?.(fac)}
                          style={styles.grabBookCTA}
                        >
                          <Text style={styles.grabBookText}>Instant Book</Text>
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
        /* 4. LIST VIEW */
        <ScrollView style={styles.listScrollView} contentContainerStyle={{ paddingBottom: 110 }} showsVerticalScrollIndicator={false}>
          {filteredFacilities.map((fac) => (
            <TouchableOpacity
              key={fac.id}
              onPress={() => onSelectFacility?.(fac)}
              style={styles.facilityCard}
            >
              <Image source={{ uri: fac.cover_image ?? "" }} style={styles.facCover} />
              <View style={styles.facContent}>
                <View style={styles.facTopRow}>
                  <View>
                    <Text style={styles.facName}>{fac.name}</Text>
                    <Text style={styles.facCategory}>{fac.category}</Text>
                  </View>
                  <View style={styles.capacityBadge}>
                    <Users size={12} color="#10B981" />
                    <Text style={styles.capacityText}>
                      {fac.inside_now_count ?? 42}/{fac.max_capacity ?? 100} Active
                    </Text>
                  </View>
                </View>

                <View style={styles.facLocationRow}>
                  <MapPin size={12} color="#71717A" />
                  <Text style={styles.facAddress}>{fac.address} • {fac.distance}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => onSelectFacility?.(fac)}
                  style={styles.bookCTA}
                >
                  <Navigation size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.bookCTAText}>
                    {fac.registry === "A" ? `Drop In • ₱${fac.day_pass_price_php}` : `Book • ₱${fac.court_hourly_price_php}/hr`}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  searchHeader: { flexDirection: "row", paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, gap: 10, alignItems: "center" },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 12, paddingHorizontal: 12, height: 44, gap: 8, borderWidth: 1, borderColor: "#27272A" },
  searchInput: { flex: 1, color: "#FAFAFA", fontSize: 13 },
  viewToggleBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", alignItems: "center", justifyContent: "center" },
  filtersWrapper: { paddingBottom: 10 },
  filtersScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: { backgroundColor: "#18181B", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: "#27272A" },
  filterChipActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  filterText: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  filterTextActive: { color: "#FFFFFF" },
  mapViewport: { flex: 1 },
  carouselSection: { paddingVertical: 12 },
  carouselHeaderTitle: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 8 },
  carouselScroll: { paddingHorizontal: 16, gap: 12 },
  grabCard: { width: 270, backgroundColor: "#18181B", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#27272A" },
  grabCardActive: { borderColor: "#E11D48", borderWidth: 2 },
  grabCover: { width: "100%", height: 105, backgroundColor: "#27272A" },
  grabBody: { padding: 12 },
  grabTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  grabName: { color: "#FAFAFA", fontSize: 14, fontWeight: "800", flex: 1, marginRight: 6 },
  capacityPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  capacityPillText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  grabLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  grabDistanceText: { color: "#71717A", fontSize: 11 },
  grabFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, borderTopWidth: 1, borderTopColor: "#27272A", paddingTop: 8 },
  grabPrice: { color: "#FAFAFA", fontSize: 12, fontWeight: "800" },
  grabBookCTA: { backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  grabBookText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  listScrollView: { flex: 1, paddingHorizontal: 16 },
  facilityCard: { backgroundColor: "#121215", borderRadius: 14, borderWidth: 1, borderColor: "#18181B", overflow: "hidden", marginBottom: 14 },
  facCover: { width: "100%", height: 120, backgroundColor: "#18181B" },
  facContent: { padding: 12 },
  facTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  facName: { color: "#FAFAFA", fontSize: 15, fontWeight: "700" },
  facCategory: { color: "#71717A", fontSize: 11, marginTop: 2 },
  capacityBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capacityText: { color: "#10B981", fontSize: 10, fontWeight: "700" },
  facLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  facAddress: { color: "#71717A", fontSize: 11 },
  bookCTA: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#E11D48", paddingVertical: 8, borderRadius: 8, marginTop: 10 },
  bookCTAText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});
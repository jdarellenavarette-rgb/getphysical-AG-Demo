import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView } from "react-native";
import { Search, MapPin, Users, ShieldAlert, Navigation, X } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import type { FacilityRow } from "sodia-core";

interface DiscoverViewProps {
  onSelectFacility?: (facility: FacilityRow) => void;
}

export function DiscoverView({ onSelectFacility }: DiscoverViewProps) {
  const { facilities } = useEcosystemStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [isLocationDenied, setIsLocationDenied] = useState(false);
  const [manualZip, setManualZip] = useState("");

  const filters = ["All", "Commercial Gyms", "Pickleball & Courts", "Open Now"];

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
      {/* SEARCH & FILTERS */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Search size={16} color="#71717A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search gyms, courts, or challenges..."
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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
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

      {/* LOCATION DENIED FALLBACK (Spec 3.6) */}
      {isLocationDenied && (
        <View style={styles.locationFallbackCard}>
          <ShieldAlert size={28} color="#F59E0B" />
          <Text style={styles.fallbackTitle}>Location Access Denied</Text>
          <Text style={styles.fallbackSubtitle}>
            Enter your City or Zip Code to discover nearby clubs and live court capacity.
          </Text>
          <View style={styles.zipRow}>
            <TextInput
              style={styles.zipInput}
              placeholder="e.g. 1630 or BGC"
              placeholderTextColor="#71717A"
              value={manualZip}
              onChangeText={setManualZip}
            />
            <TouchableOpacity
              onPress={() => setIsLocationDenied(false)}
              style={styles.zipConfirmButton}
            >
              <Text style={styles.zipConfirmText}>Seed Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* FACILITY LIST OR EMPTY SEARCH STATE */}
      <ScrollView style={styles.facilityList} showsVerticalScrollIndicator={false}>
        {filteredFacilities.length === 0 ? (
          <View style={styles.emptySearchBox}>
            <Search size={32} color="#71717A" />
            <Text style={styles.emptySearchTitle}>No venues found</Text>
            <Text style={styles.emptySearchSub}>
              No clubs match "{searchQuery}". Try searching another name or reset filters.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSelectedFilter("All");
              }}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchText}>Clear Search & Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredFacilities.map((fac) => (
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

                <View style={styles.facFooter}>
                  <View style={styles.amenitiesWrap}>
                    {fac.amenities?.slice(0, 2).map((a) => (
                      <Text key={a} style={styles.amenityPill}>{a}</Text>
                    ))}
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
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  searchHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", borderRadius: 10, paddingHorizontal: 12, height: 42, gap: 8 },
  searchInput: { flex: 1, color: "#FAFAFA", fontSize: 13 },
  filtersScroll: { flexDirection: "row", marginTop: 10 },
  filterChip: { backgroundColor: "#18181B", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginRight: 8, borderWidth: 1, borderColor: "#27272A" },
  filterChipActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  filterText: { color: "#71717A", fontSize: 11, fontWeight: "600" },
  filterTextActive: { color: "#FFFFFF" },
  locationFallbackCard: { margin: 16, backgroundColor: "rgba(245, 158, 11, 0.12)", borderWidth: 1, borderColor: "rgba(245, 158, 11, 0.3)", borderRadius: 12, padding: 14, alignItems: "center" },
  fallbackTitle: { color: "#F59E0B", fontSize: 14, fontWeight: "700", marginTop: 6 },
  fallbackSubtitle: { color: "#A1A1AA", fontSize: 12, textAlign: "center", marginTop: 4, lineHeight: 16 },
  zipRow: { flexDirection: "row", marginTop: 10, gap: 8, width: "100%" },
  zipInput: { flex: 1, backgroundColor: "#18181B", borderRadius: 8, paddingHorizontal: 12, height: 38, color: "#FAFAFA", fontSize: 12 },
  zipConfirmButton: { backgroundColor: "#E11D48", borderRadius: 8, paddingHorizontal: 14, justifyContent: "center" },
  zipConfirmText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  facilityList: { flex: 1, padding: 16 },
  emptySearchBox: { backgroundColor: "#121215", borderRadius: 14, padding: 32, alignItems: "center", borderWidth: 1, borderColor: "#18181B", marginTop: 20 },
  emptySearchTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "700", marginTop: 10 },
  emptySearchSub: { color: "#71717A", fontSize: 12, textAlign: "center", marginTop: 4, maxWidth: 260 },
  clearSearchBtn: { backgroundColor: "#27272A", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginTop: 14 },
  clearSearchText: { color: "#FAFAFA", fontSize: 12, fontWeight: "600" },
  facilityCard: { backgroundColor: "#121215", borderRadius: 14, borderWidth: 1, borderColor: "#18181B", overflow: "hidden", marginBottom: 16 },
  facCover: { width: "100%", height: 130, backgroundColor: "#18181B" },
  facContent: { padding: 14 },
  facTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  facName: { color: "#FAFAFA", fontSize: 16, fontWeight: "700" },
  facCategory: { color: "#71717A", fontSize: 11, marginTop: 2 },
  capacityBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  capacityText: { color: "#10B981", fontSize: 10, fontWeight: "700" },
  facLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
  facAddress: { color: "#71717A", fontSize: 11 },
  facFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  amenitiesWrap: { flexDirection: "row", gap: 6 },
  amenityPill: { backgroundColor: "#18181B", color: "#A1A1AA", fontSize: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  bookCTA: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  bookCTAText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
});
import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from "react-native";
import { Star, MapPin, Users, Award, Calendar } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { FacilityRow } from "sodia-core";
import type { DiscoverCoach, DiscoverCommunityClub } from "../../data/discoverData";
import { calculateHaversineKm, formatWalkingEta, type UserCoordinates } from "../../services/locationService";

interface DiscoverListSectionProps {
  facilities: readonly FacilityRow[];
  coaches: readonly DiscoverCoach[];
  clubs: readonly DiscoverCommunityClub[];
  userCoords: UserCoordinates;
  onSelectFacility: (fac: FacilityRow) => void;
  onSelectCoach: (coach: DiscoverCoach) => void;
  onSelectClub: (club: DiscoverCommunityClub) => void;
  onResetFilters: () => void;
}

export function DiscoverListSection({
  facilities,
  coaches,
  clubs,
  userCoords,
  onSelectFacility,
  onSelectCoach,
  onSelectClub,
  onResetFilters,
}: DiscoverListSectionProps) {
  const { colors } = useThemeStore();
  const totalItems = facilities.length + coaches.length + clubs.length;

  if (totalItems === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Results Found</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
          Try adjusting your search terms or relaxing category & price filters.
        </Text>
        <TouchableOpacity onPress={onResetFilters} style={styles.emptyResetBtn}>
          <Text style={styles.emptyResetText}>Reset All Filters</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {/* 1. FACILITIES (GYMS, PILATES, MULTI-SPORT) */}
      {facilities.map((fac) => {
        const distKm = calculateHaversineKm(userCoords.latitude, userCoords.longitude, fac.lat ?? 14.549, fac.lng ?? 121.05);
        const price = fac.day_pass_price_php ?? fac.court_hourly_price_php ?? 250;
        return (
          <TouchableOpacity
            key={fac.id}
            onPress={() => onSelectFacility(fac)}
            style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
          >
            <Image source={{ uri: fac.cover_image ?? "" }} style={styles.image} />
            <View style={styles.body}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{fac.name}</Text>
              <Text style={[styles.category, { color: colors.textMuted }]} numberOfLines={1}>{fac.category}</Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {distKm} km • {formatWalkingEta(distKm)}
              </Text>
              <View style={styles.bottomRow}>
                <Text style={styles.price}>₱{price} {fac.registry === "A" ? "Day Pass" : "Court/Hr"}</Text>
                <View style={styles.badge}><Text style={styles.badgeText}>{fac.inside_now_count ?? 20} Inside</Text></View>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* 2. COACHES */}
      {coaches.map((c) => (
        <TouchableOpacity
          key={c.id}
          onPress={() => onSelectCoach(c)}
          style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
        >
          <Image source={{ uri: c.avatar }} style={styles.avatarImage} />
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{c.name}</Text>
              <View style={styles.coachTag}><Text style={styles.coachTagText}>COACH</Text></View>
            </View>
            <Text style={[styles.category, { color: colors.textMuted }]} numberOfLines={1}>{c.title}</Text>
            <View style={styles.ratingRow}>
              <Star size={11} color="#F59E0B" fill="#F59E0B" />
              <Text style={[styles.meta, { color: colors.textSecondary }]}>{c.rating} ({c.reviewCount} reviews)</Text>
            </View>
            <View style={styles.bottomRow}>
              <Text style={styles.price}>₱{c.hourlyRatePhp}/hr</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{c.homeFacilityName}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* 3. COMMUNITY CLUBS & MEETS */}
      {clubs.map((cl) => (
        <TouchableOpacity
          key={cl.id}
          onPress={() => onSelectClub(cl)}
          style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}
        >
          <Image source={{ uri: cl.coverImage }} style={styles.image} />
          <View style={styles.body}>
            <View style={styles.topRow}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{cl.name}</Text>
              <View style={styles.clubTag}><Text style={styles.clubTagText}>{cl.category.toUpperCase()}</Text></View>
            </View>
            <Text style={[styles.category, { color: colors.textMuted }]} numberOfLines={1}>{cl.meetingPoint}</Text>
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{cl.schedule}</Text>
            <View style={styles.bottomRow}>
              <Text style={[styles.price, cl.dropInFeePhp === 0 && { color: "#10B981" }]}>
                {cl.dropInFeePhp === 0 ? "Free Drop-In" : `₱${cl.dropInFeePhp} Entry`}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>{cl.memberCount} members</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 110, gap: 12 },
  card: { flexDirection: "row", borderRadius: 14, padding: 12, borderWidth: 1, minHeight: 92 },
  image: { width: 76, height: 76, borderRadius: 10 },
  avatarImage: { width: 76, height: 76, borderRadius: 38 },
  body: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "800", flex: 1 },
  category: { fontSize: 11, marginTop: 1 },
  meta: { fontSize: 11 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  price: { color: "#10B981", fontSize: 12, fontWeight: "800" },
  badge: { backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: "#10B981", fontSize: 9, fontWeight: "800" },
  coachTag: { backgroundColor: "rgba(59,130,246,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  coachTagText: { color: "#60A5FA", fontSize: 9, fontWeight: "800" },
  clubTag: { backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  clubTagText: { color: "#FBBF24", fontSize: 9, fontWeight: "800" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, textAlign: "center", lineHeight: 18, marginBottom: 18 },
  emptyResetBtn: { backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  emptyResetText: { color: "#FFF", fontSize: 13, fontWeight: "800" },
});

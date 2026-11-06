import React, { memo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Star } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import type { DiscoverCoach, DiscoverCommunityClub } from "../../data/discoverData";
import { calculateHaversineKm, formatWalkingEta, type UserCoordinates } from "../../services/locationService";

export type DiscoverListItem =
  | { readonly kind: "facility"; readonly id: string; readonly data: FacilityRow }
  | { readonly kind: "coach"; readonly id: string; readonly data: DiscoverCoach }
  | { readonly kind: "club"; readonly id: string; readonly data: DiscoverCommunityClub };

interface RowProps {
  item: DiscoverListItem;
  userCoords: UserCoordinates;
  onPress: (item: DiscoverListItem) => void;
}

function Tag({ label, color }: { label: string; color: string }) {
  const colors = useColors();
  return (
    <View style={[styles.tag, { backgroundColor: colors.bgCardTertiary }]}>
      <Text style={[styles.tagText, { color }]}>{label}</Text>
    </View>
  );
}

function DiscoverListRowImpl({ item, userCoords, onPress }: RowProps) {
  const colors = useColors();
  const card = [styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }];

  if (item.kind === "facility") {
    const fac = item.data;
    const distKm = calculateHaversineKm(userCoords.latitude, userCoords.longitude, fac.lat ?? 14.549, fac.lng ?? 121.05);
    const price = fac.day_pass_price_php ?? fac.court_hourly_price_php ?? 250;
    return (
      <TouchableOpacity onPress={() => onPress(item)} style={card} accessibilityRole="button" accessibilityLabel={`${fac.name}, ${distKm} kilometers away, ${price} pesos`}>
        <Image source={{ uri: fac.cover_image ?? "" }} style={styles.image} />
        <View style={styles.body}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{fac.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>{fac.category}</Text>
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{distKm} km • {formatWalkingEta(distKm)}</Text>
          <View style={styles.bottomRow}>
            <Text style={[styles.price, { color: colors.accentGreen }]}>₱{price} {fac.registry === "A" ? "Day Pass" : "Court/Hr"}</Text>
            <Tag label={`${fac.inside_now_count ?? 20} inside`} color={colors.accentGreen} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (item.kind === "coach") {
    const c = item.data;
    return (
      <TouchableOpacity onPress={() => onPress(item)} style={card} accessibilityRole="button" accessibilityLabel={`Coach ${c.name}, ${c.title}, ${c.hourlyRatePhp} pesos per hour`}>
        <Image source={{ uri: c.avatar }} style={[styles.image, styles.round]} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{c.name}</Text>
            <Tag label="COACH" color={colors.info} />
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>{c.title}</Text>
          <View style={styles.ratingRow}>
            <Star size={12} color={colors.warning} fill={colors.warning} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{c.rating} ({c.reviewCount} reviews)</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={[styles.price, { color: colors.accentGreen }]}>₱{c.hourlyRatePhp}/hr</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>{c.homeFacilityName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const cl = item.data;
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={card} accessibilityRole="button" accessibilityLabel={`${cl.name}, ${cl.category}, ${cl.schedule}`}>
      <Image source={{ uri: cl.coverImage }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>{cl.name}</Text>
          <Tag label={cl.category.toUpperCase()} color={colors.warning} />
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>{cl.meetingPoint}</Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>{cl.schedule}</Text>
        <View style={styles.bottomRow}>
          <Text style={[styles.price, { color: colors.accentGreen }]}>{cl.dropInFeePhp === 0 ? "Free Drop-In" : `₱${cl.dropInFeePhp} Entry`}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>{cl.memberCount} members</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const DiscoverListRow = memo(DiscoverListRowImpl);

const styles = StyleSheet.create({
  card: { flexDirection: "row", borderRadius: 14, padding: 12, borderWidth: 1, minHeight: 100, marginHorizontal: 16 },
  image: { width: 76, height: 76, borderRadius: 10 },
  round: { borderRadius: 38 },
  body: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 6 },
  title: { fontSize: 14, fontWeight: "800", flex: 1 },
  meta: { fontSize: 12, marginTop: 1, flexShrink: 1 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4, gap: 8 },
  price: { fontSize: 13, fontWeight: "800" },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 11, fontWeight: "800" },
});

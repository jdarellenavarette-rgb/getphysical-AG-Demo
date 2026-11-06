import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MapPin, Sparkles, Star, X } from "lucide-react-native";
import { MIN_TOUCH_TARGET, type FacilityRow } from "sodia-core";
import { useColors } from "../../../theme/theme";
import { amenitiesFor } from "./passOptions";

/** Hero, rating, address, live density meter and amenities for a facility sheet. */
export function FacilityOverview({ facility, onClose }: { facility: FacilityRow; onClose: () => void }) {
  const colors = useColors();
  const isGym = facility.registry === "A";
  const inside = facility.inside_now_count ?? 42;
  const capacity = facility.max_capacity ?? 100;
  const pct = Math.min(100, (inside / Math.max(1, capacity)) * 100);

  return (
    <>
      <View style={styles.hero}>
        <Image source={{ uri: facility.cover_image ?? facility.cover_url ?? "" }} style={styles.heroImg} accessibilityIgnoresInvertColors />
        <TouchableOpacity onPress={onClose} style={[styles.close, { backgroundColor: colors.mediaScrim }]} accessibilityRole="button" accessibilityLabel="Close facility details">
          <X size={20} color={colors.textOnMedia} />
        </TouchableOpacity>
        <View style={[styles.registry, { backgroundColor: colors.mediaScrim }]}>
          <Text style={[styles.registryText, { color: colors.textOnMedia }]}>{isGym ? "REGISTRY A • COMMERCIAL ARENA" : "REGISTRY B • COURT CLUB"}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]} accessibilityRole="header">{facility.name}</Text>
          <View style={[styles.rating, { backgroundColor: colors.bgCardTertiary }]} accessibilityLabel={`Rated ${facility.rating ?? 4.9}, ${facility.review_count ?? 148} reviews`}>
            <Star size={12} color={colors.warning} fill={colors.warning} />
            <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{facility.rating ?? 4.9} ({facility.review_count ?? 148})</Text>
          </View>
        </View>
        <View style={styles.locRow}>
          <MapPin size={13} color={colors.textMuted} />
          <Text style={[styles.address, { color: colors.textSecondary }]}>{facility.address} • {facility.distance}</Text>
        </View>

        <View style={[styles.density, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]} accessibilityLabel={`Inside now: ${inside} of ${capacity}`}>
          <View style={styles.densityHead}>
            <View style={styles.inline}>
              <View style={[styles.dot, { backgroundColor: colors.accentGreen }]} />
              <Text style={[styles.densityTitle, { color: colors.textPrimary }]}>INSIDE NOW</Text>
            </View>
            <Text style={[styles.densityCount, { color: colors.accentGreen }]}>{inside} / {capacity}</Text>
          </View>
          <View style={[styles.track, { backgroundColor: colors.borderColor }]}>
            <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.accentGreen }]} />
          </View>
          <Text style={[styles.densitySub, { color: colors.textMuted }]}>Peak hours: 5:30 PM – 8:00 PM</Text>
        </View>

        <Text style={[styles.section, { color: colors.textMuted }]}>AMENITIES</Text>
        <View style={styles.chips}>
          {amenitiesFor(facility).map((item) => (
            <View key={item} style={[styles.chip, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Sparkles size={12} color={colors.accentText} />
              <Text style={[styles.chipText, { color: colors.textPrimary }]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  hero: { height: 170, marginHorizontal: 12, borderRadius: 16, overflow: "hidden" },
  heroImg: { width: "100%", height: "100%" },
  close: { position: "absolute", top: 8, right: 8, width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  registry: { position: "absolute", bottom: 10, left: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  registryText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  body: { paddingHorizontal: 18, paddingTop: 14 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 20, fontWeight: "900", flex: 1, marginRight: 8 },
  rating: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  ratingText: { fontSize: 12, fontWeight: "800" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  address: { fontSize: 13, flexShrink: 1 },
  density: { borderRadius: 14, padding: 12, marginTop: 14, borderWidth: 1 },
  densityHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  inline: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  densityTitle: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
  densityCount: { fontSize: 12, fontWeight: "800", fontVariant: ["tabular-nums"] },
  track: { height: 6, borderRadius: 3, marginTop: 8, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 3 },
  densitySub: { fontSize: 11, marginTop: 6 },
  section: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginTop: 20, marginBottom: 10 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 12, fontWeight: "600" },
});

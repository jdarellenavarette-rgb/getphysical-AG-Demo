import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Navigation, Users } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import { calculateHaversineKm, formatWalkingEta, type UserCoordinates } from "../../services/locationService";

interface DiscoverCarouselProps {
  facilities: readonly FacilityRow[];
  selectedId: string | null;
  userCoords: UserCoordinates;
  onSelect: (facility: FacilityRow) => void;
}

const CARD_WIDTH = 260;

/** Google-Maps-style card rail pinned above the dock while in map mode. */
export function DiscoverCarousel({ facilities, selectedId, userCoords, onSelect }: DiscoverCarouselProps) {
  const colors = useColors();
  if (facilities.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.header, { color: colors.textPrimary, backgroundColor: colors.bgCard }]}>
        {facilities.length} hubs nearby
      </Text>
      <FlashList
        horizontal
        data={facilities}
        extraData={selectedId}
        keyExtractor={(f) => f.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rail}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item: fac }) => {
          const selected = fac.id === selectedId;
          const distKm = calculateHaversineKm(userCoords.latitude, userCoords.longitude, fac.lat ?? 14.549, fac.lng ?? 121.05);
          const price = fac.registry === "A" ? `₱${fac.day_pass_price_php} Pass` : `₱${fac.court_hourly_price_php}/hr Court`;
          return (
            <TouchableOpacity
              onPress={() => onSelect(fac)}
              style={[styles.card, { backgroundColor: colors.bgCard, borderColor: selected ? colors.accent : colors.borderColor }]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${fac.name}, ${distKm} kilometers, ${price}, view passes`}
            >
              <Image source={{ uri: fac.cover_image ?? "" }} style={styles.cover} />
              <View style={styles.body}>
                <View style={styles.topRow}>
                  <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>{fac.name}</Text>
                  <View style={[styles.capacity, { backgroundColor: colors.accentGreenMuted }]}>
                    <Users size={12} color={colors.accentGreen} />
                    <Text style={[styles.capacityText, { color: colors.accentGreen }]}>{fac.inside_now_count ?? 42}/{fac.max_capacity ?? 100}</Text>
                  </View>
                </View>
                <View style={styles.locRow}>
                  <Navigation size={12} color={colors.textMuted} />
                  <Text style={[styles.dist, { color: colors.textMuted }]}>{distKm} km • {formatWalkingEta(distKm)}</Text>
                </View>
                <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
                  <Text style={[styles.price, { color: colors.textPrimary }]}>{price}</Text>
                  <View style={[styles.cta, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.ctaText, { color: colors.textOnAccent }]}>Passes</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { position: "absolute", bottom: 100, left: 0, right: 0, height: 250 },
  header: { fontSize: 12, fontWeight: "800", marginLeft: 16, marginBottom: 8, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  rail: { paddingHorizontal: 16 },
  sep: { width: 12 },
  card: { width: CARD_WIDTH, borderRadius: 16, overflow: "hidden", borderWidth: 1.5 },
  cover: { width: "100%", height: 95 },
  body: { padding: 12 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 14, fontWeight: "800", flex: 1, marginRight: 6 },
  capacity: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  capacityText: { fontSize: 11, fontWeight: "800" },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  dist: { fontSize: 12 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTopWidth: 1 },
  price: { fontSize: 13, fontWeight: "800" },
  cta: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  ctaText: { fontSize: 12, fontWeight: "800" },
});

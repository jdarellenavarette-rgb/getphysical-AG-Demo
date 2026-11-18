import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Navigation, Users } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { venueDistanceLabel, venueOccupancyLabel, venuePriceLabel } from "../../lib/venueDisplay";
import type { UserCoordinates } from "../../services/locationService";
import { styles } from "./DiscoverView.styles";

interface DiscoverCarouselProps {
  facilities: readonly FacilityRow[];
  selectedId: string | null;
  userCoords: UserCoordinates;
  onSelect: (facility: FacilityRow) => void;
}

/** The "Near you" strip over the map: one card per venue, with only what the venue has actually set. */
export function DiscoverCarousel({ facilities, selectedId, userCoords, onSelect }: DiscoverCarouselProps) {
  const { colors } = useThemeStore();
  if (facilities.length === 0) return null;

  return (
    <View style={styles.carouselSection}>
      <Text style={[styles.carouselHeaderTitle, { color: colors.textMuted }]}>NEAR YOU</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselScroll}>
        {facilities.map((fac) => {
          const occupancy = venueOccupancyLabel(fac);
          const cover = fac.cover_image ?? fac.cover_url;
          return (
            <TouchableOpacity
              key={fac.id}
              onPress={() => onSelect(fac)}
              style={[
                styles.grabCard,
                { backgroundColor: colors.bgCard, borderColor: colors.borderColor },
                fac.id === selectedId && styles.grabCardActive,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${fac.name}. See plans`}
            >
              {cover ? (
                <Image source={{ uri: cover }} style={styles.grabCover} />
              ) : (
                <View style={[styles.grabCover, { backgroundColor: colors.bgCardSecondary }]} />
              )}
              <View style={styles.grabBody}>
                <View style={styles.grabTopRow}>
                  <Text style={[styles.grabName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {fac.name}
                  </Text>
                  {occupancy ? (
                    <View style={styles.capacityPill}>
                      <Users size={11} color="#10B981" />
                      <Text style={styles.capacityPillText}>{occupancy}</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.grabLocationRow}>
                  <Navigation size={11} color={colors.textMuted} />
                  <Text style={[styles.grabDistanceText, { color: colors.textMuted }]} numberOfLines={1}>
                    {venueDistanceLabel(fac, userCoords) ?? fac.address}
                  </Text>
                </View>
                <View style={[styles.grabFooter, { borderTopColor: colors.borderColor }]}>
                  <Text style={[styles.grabPrice, { color: colors.textPrimary }]}>{venuePriceLabel(fac)}</Text>
                  <View style={styles.grabBookCTA}>
                    <Text style={styles.grabBookText}>Plans</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

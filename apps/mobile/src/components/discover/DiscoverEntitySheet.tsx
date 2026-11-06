import React, { useRef } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Award, Clock, MapPin, ShieldCheck, Sparkles, Star, UserCheck, Users, X, type LucideIcon } from "lucide-react-native";
import { MIN_TOUCH_TARGET } from "sodia-core";
import { useColors, type ColorPalette } from "../../theme/theme";
import { AppBottomSheet } from "../sheets/AppBottomSheet";
import type { DiscoverCoach, DiscoverCommunityClub } from "../../data/discoverData";

export type DiscoverSelectedEntity =
  | { kind: "coach"; data: DiscoverCoach }
  | { kind: "club"; data: DiscoverCommunityClub }
  | null;

interface DiscoverEntitySheetProps {
  entity: DiscoverSelectedEntity;
  visible: boolean;
  onClose: () => void;
  onConfirmBooking: (itemTitle: string, pricePhp: number, facilityId?: string, facilityName?: string) => void;
}

interface EntityView {
  badge: string;
  badgeIcon: LucideIcon;
  badgeColor: string;
  title: string;
  subtitle: string;
  image: string;
  rating: string;
  ratingIcon: LucideIcon;
  body: string;
  details: readonly { icon: LucideIcon; label: string; value: string }[];
  priceLabel: string;
  pricePhp: number;
  cta: string;
  bookingTitle: string;
  facilityId?: string;
  facilityName?: string;
  round: boolean;
}

function toView(entity: NonNullable<DiscoverSelectedEntity>, colors: ColorPalette): EntityView {
  if (entity.kind === "coach") {
    const c = entity.data;
    return {
      badge: c.specialty.toUpperCase(), badgeIcon: UserCheck, badgeColor: colors.info,
      title: c.name, subtitle: c.title, image: c.avatar, round: true,
      rating: `${c.rating} (${c.reviewCount} reviews)`, ratingIcon: Star, body: c.bio,
      details: [
        { icon: Clock, label: "Schedule", value: c.schedule },
        { icon: MapPin, label: "Location", value: `${c.homeFacilityName} • ${c.address}` },
        { icon: ShieldCheck, label: "Credentials", value: c.credentials.join(" • ") },
      ],
      priceLabel: "1-on-1 session", pricePhp: c.hourlyRatePhp, cta: "Book Session",
      bookingTitle: `Session with ${c.name}`, facilityId: c.homeFacilityId, facilityName: c.homeFacilityName,
    };
  }
  const cl = entity.data;
  const free = cl.dropInFeePhp === 0;
  return {
    badge: cl.category.toUpperCase(), badgeIcon: free ? Users : Award, badgeColor: free ? colors.accentGreen : colors.warning,
    title: cl.name, subtitle: `${cl.category} • ${cl.sport}`, image: cl.coverImage, round: false,
    rating: cl.paceOrLevel, ratingIcon: Sparkles, body: cl.description,
    details: [
      { icon: Clock, label: "Schedule", value: cl.schedule },
      { icon: MapPin, label: "Location", value: cl.meetingPoint },
      { icon: ShieldCheck, label: "Organizer", value: cl.organizer },
    ],
    priceLabel: "Community drop-in", pricePhp: cl.dropInFeePhp, cta: free ? "RSVP Free" : "Join & Register",
    bookingTitle: `Entry to ${cl.name}`, facilityName: cl.meetingPoint,
  };
}

export function DiscoverEntitySheet({ entity, visible, onClose, onConfirmBooking }: DiscoverEntitySheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const last = useRef<DiscoverSelectedEntity>(entity);
  if (entity) last.current = entity;
  const v = last.current ? toView(last.current, colors) : null;

  return (
    <AppBottomSheet visible={visible && !!entity} onClose={onClose} snapPoints={["70%"]} accessibilityLabel={v ? `${v.title} details` : "Details"}>
      {v ? (
        <BottomSheetScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: colors.bgCardTertiary }]}>
              <v.badgeIcon size={13} color={v.badgeColor} />
              <Text style={[styles.badgeText, { color: v.badgeColor }]}>{v.badge}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.close} accessibilityRole="button" accessibilityLabel="Close details">
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.hero}>
            <Image source={{ uri: v.image }} style={[styles.avatar, !v.round && styles.square]} />
            <View style={styles.flex}>
              <Text style={[styles.name, { color: colors.textPrimary }]} accessibilityRole="header">{v.title}</Text>
              <Text style={[styles.role, { color: colors.textMuted }]}>{v.subtitle}</Text>
              <View style={styles.ratingRow}>
                <v.ratingIcon size={13} color={colors.warning} fill={v.ratingIcon === Star ? colors.warning : "none"} />
                <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{v.rating}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.bio, { color: colors.textSecondary }]}>{v.body}</Text>

          <View style={[styles.details, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
            {v.details.map(({ icon: Icon, label, value }) => (
              <View key={label} style={styles.detailRow}>
                <Icon size={15} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{label}</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
            <View>
              <Text style={[styles.priceLabel, { color: colors.textMuted }]}>{v.priceLabel}</Text>
              <Text style={[styles.price, { color: colors.accentGreen }]}>{v.pricePhp === 0 ? "Free" : `₱${v.pricePhp.toLocaleString()}`}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onConfirmBooking(v.bookingTitle, v.pricePhp, v.facilityId, v.facilityName)}
              style={[styles.cta, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
            >
              <Text style={[styles.ctaText, { color: colors.textOnAccent }]}>{v.cta}</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetScrollView>
      ) : null}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20 },
  flex: { flex: 1, marginLeft: 14 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: "800" },
  close: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  hero: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  square: { borderRadius: 12 },
  name: { fontSize: 17, fontWeight: "800" },
  role: { fontSize: 13, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  ratingText: { fontSize: 12, fontWeight: "700" },
  bio: { fontSize: 14, lineHeight: 20, marginBottom: 14 },
  details: { borderRadius: 14, padding: 14, gap: 12, marginBottom: 20, borderWidth: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailLabel: { fontSize: 12, width: 85 },
  detailValue: { fontSize: 13, fontWeight: "600", flex: 1 },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 16 },
  priceLabel: { fontSize: 12, fontWeight: "700" },
  price: { fontSize: 20, fontWeight: "900" },
  cta: { paddingHorizontal: 22, minHeight: 48, justifyContent: "center", borderRadius: 12 },
  ctaText: { fontSize: 14, fontWeight: "800" },
});

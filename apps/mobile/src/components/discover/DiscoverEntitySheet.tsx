import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from "react-native";
import { X, Star, Clock, MapPin, ShieldCheck, UserCheck, Users, Award, Sparkles } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
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

export function DiscoverEntitySheet({
  entity,
  visible,
  onClose,
  onConfirmBooking,
}: DiscoverEntitySheetProps) {
  const { colors } = useThemeStore();
  if (!visible || !entity) return null;

  const isCoach = entity.kind === "coach";
  const coach = isCoach ? entity.data : null;
  const club = !isCoach ? entity.data : null;

  const title = isCoach ? coach!.name : club!.name;
  const subtitle = isCoach ? coach!.title : `${club!.category} • ${club!.sport}`;
  const avatarUrl = isCoach ? coach!.avatar : club!.coverImage;
  const ratingOrLevel = isCoach ? `${coach!.rating} (${coach!.reviewCount} Reviews)` : club!.paceOrLevel;
  const locationText = isCoach ? `${coach!.homeFacilityName} • ${coach!.address}` : club!.meetingPoint;
  const scheduleText = isCoach ? coach!.schedule : club!.schedule;
  const pricePhp = isCoach ? coach!.hourlyRatePhp : club!.dropInFeePhp;
  const priceDisplay = pricePhp === 0 ? "Free Drop-In" : `₱${pricePhp.toLocaleString()}`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.badgeRow}>
              {isCoach ? (
                <View style={styles.coachBadge}>
                  <UserCheck size={12} color="#3B82F6" />
                  <Text style={styles.coachBadgeText}>{coach!.specialty.toUpperCase()}</Text>
                </View>
              ) : (
                <View style={styles.meetBadge}>
                  {club!.dropInFeePhp > 0 ? <Award size={12} color="#F59E0B" /> : <Users size={12} color="#10B981" />}
                  <Text style={[styles.meetBadgeText, club!.dropInFeePhp === 0 && { color: "#10B981" }]}>
                    {club!.category.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* HERO SECTION */}
            <View style={styles.heroSection}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={[styles.entityName, { color: colors.textPrimary }]}>{title}</Text>
                <Text style={[styles.entityRole, { color: colors.textMuted }]}>{subtitle}</Text>
                <View style={styles.ratingRow}>
                  {isCoach ? <Star size={12} color="#F59E0B" fill="#F59E0B" /> : <Sparkles size={12} color="#10B981" />}
                  <Text style={[styles.ratingText, { color: isCoach ? colors.textPrimary : "#10B981" }]}>
                    {ratingOrLevel}
                  </Text>
                </View>
              </View>
            </View>

            {/* BIO / DESCRIPTION */}
            <Text style={[styles.bioText, { color: colors.textSecondary }]}>
              {isCoach ? coach!.bio : club!.description}
            </Text>

            {/* DETAILS ACCORDION */}
            <View style={[styles.detailsBox, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <View style={styles.detailRow}>
                <Clock size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Schedule</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{scheduleText}</Text>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Location</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{locationText}</Text>
              </View>

              <View style={styles.detailRow}>
                <ShieldCheck size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>
                  {isCoach ? "Credentials" : "Organizer"}
                </Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {isCoach ? coach!.credentials.join(" • ") : club!.organizer}
                </Text>
              </View>
            </View>

            {/* PRICING & BOOKING CTA */}
            <View style={[styles.footerPricing, { borderTopColor: colors.borderColor }]}>
              <View>
                <Text style={[styles.totalPriceLabel, { color: colors.textMuted }]}>
                  {isCoach ? "1-on-1 Session Rate" : "Community Drop-In Fee"}
                </Text>
                <Text style={[styles.totalPriceVal, { color: pricePhp === 0 ? "#10B981" : colors.accentGreen }]}>
                  {priceDisplay}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onConfirmBooking(
                    isCoach ? `Session with ${coach!.name}` : `Entry to ${club!.name}`,
                    pricePhp,
                    isCoach ? coach!.homeFacilityId : undefined,
                    isCoach ? coach!.homeFacilityName : club!.meetingPoint
                  );
                }}
                style={styles.bookCtaBtn}
              >
                <Text style={styles.bookCtaText}>
                  {isCoach ? "Book Session" : pricePhp === 0 ? "RSVP Free" : "Join & Register"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "85%", borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  badgeRow: { flexDirection: "row" },
  coachBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(59,130,246,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  coachBadgeText: { color: "#60A5FA", fontSize: 10, fontWeight: "800" },
  meetBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  meetBadgeText: { color: "#FBBF24", fontSize: 10, fontWeight: "800" },
  closeBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  sheetContent: { paddingBottom: 24 },
  heroSection: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  entityName: { fontSize: 16, fontWeight: "800" },
  entityRole: { fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: "700" },
  bioText: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  detailsBox: { borderRadius: 14, padding: 14, gap: 12, marginBottom: 20, borderWidth: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailLabel: { fontSize: 12, width: 85 },
  detailValue: { fontSize: 12, fontWeight: "600", flex: 1 },
  footerPricing: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 16 },
  totalPriceLabel: { fontSize: 11, fontWeight: "700" },
  totalPriceVal: { fontSize: 18, fontWeight: "900" },
  bookCtaBtn: { backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  bookCtaText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from "react-native";
import { X, Star, Clock, MapPin, ShieldCheck, UserCheck, Award, Zap } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

export type DiscoverEntityType = "coach" | "meet" | null;

interface DiscoverEntitySheetProps {
  entityType: DiscoverEntityType;
  visible: boolean;
  onClose: () => void;
  onConfirmBooking: (itemTitle: string, pricePhp: number) => void;
}

export function DiscoverEntitySheet({
  entityType,
  visible,
  onClose,
  onConfirmBooking,
}: DiscoverEntitySheetProps) {
  const { colors } = useThemeStore();
  if (!visible || !entityType) return null;

  const isCoach = entityType === "coach";

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
                  <Text style={styles.coachBadgeText}>VERIFIED COACH</Text>
                </View>
              ) : (
                <View style={styles.meetBadge}>
                  <Award size={12} color="#F59E0B" />
                  <Text style={styles.meetBadgeText}>OFFICIAL TOURNAMENT</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            {/* HERO SECTION */}
            {isCoach ? (
              <View style={styles.heroSection}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80" }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.entityName, { color: colors.textPrimary }]}>Coach Miguel Ramos</Text>
                  <Text style={[styles.entityRole, { color: colors.textMuted }]}>NASM CPT • Strength & Plyometrics</Text>
                  <View style={styles.ratingRow}>
                    <Star size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={[styles.ratingText, { color: colors.textPrimary }]}>4.98 (142 Sessions Completed)</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.heroSection}>
                <Image
                  source={{ uri: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=300&q=80" }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.entityName, { color: colors.textPrimary }]}>BGC Sunset Open 2026</Text>
                  <Text style={[styles.entityRole, { color: colors.textMuted }]}>Nexus Court Club • DUPR 3.0 - 4.0</Text>
                  <View style={styles.ratingRow}>
                    <Zap size={12} color="#10B981" />
                    <Text style={[styles.ratingText, { color: "#10B981" }]}>12 / 16 Pairs Registered (4 Left)</Text>
                  </View>
                </View>
              </View>
            )}

            {/* DETAILS ACCORDION */}
            <View style={[styles.detailsBox, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <View style={styles.detailRow}>
                <Clock size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Schedule</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {isCoach ? "Today • 4:00 PM, 5:30 PM, 7:00 PM" : "Tonight • 6:00 PM - 9:30 PM"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MapPin size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Location</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {isCoach ? "Metro Core Arena (BGC 28th St)" : "Nexus Court Club (Makati)"}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <ShieldCheck size={14} color={colors.textMuted} />
                <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Split Model</Text>
                <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                  {isCoach ? "₱1,200/hr + ₱150 Floor Access" : "Direct Bracket Escrow"}
                </Text>
              </View>
            </View>

            {/* PRICING & BOOKING CTA */}
            <View style={[styles.footerPricing, { borderTopColor: colors.borderColor }]}>
              <View>
                <Text style={[styles.totalPriceLabel, { color: colors.textMuted }]}>Total Entry / Fee</Text>
                <Text style={[styles.totalPriceVal, { color: colors.accentGreen }]}>
                  {isCoach ? "₱1,350.00" : "₱500.00"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onConfirmBooking(
                    isCoach ? "1-on-1 PT Session with Miguel Ramos" : "BGC Sunset Pickleball Open Roster Entry",
                    isCoach ? 1350 : 500
                  );
                }}
                style={styles.bookCtaBtn}
              >
                <Text style={styles.bookCtaText}>
                  {isCoach ? "Instant Book Coach" : "Join Bracket"}
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
  sheetCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "80%", borderWidth: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  badgeRow: { flexDirection: "row" },
  coachBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(59,130,246,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  coachBadgeText: { color: "#60A5FA", fontSize: 10, fontWeight: "800" },
  meetBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  meetBadgeText: { color: "#FBBF24", fontSize: 10, fontWeight: "800" },
  closeBtn: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  sheetContent: { paddingBottom: 24 },
  heroSection: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  entityName: { fontSize: 16, fontWeight: "800" },
  entityRole: { fontSize: 12, marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  ratingText: { fontSize: 11, fontWeight: "700" },
  detailsBox: { borderRadius: 14, padding: 14, gap: 12, marginBottom: 20, borderWidth: 1 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailLabel: { fontSize: 12, width: 80 },
  detailValue: { fontSize: 12, fontWeight: "600", flex: 1 },
  footerPricing: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, paddingTop: 16 },
  totalPriceLabel: { fontSize: 11, fontWeight: "700" },
  totalPriceVal: { fontSize: 20, fontWeight: "900" },
  bookCtaBtn: { backgroundColor: "#E11D48", paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12 },
  bookCtaText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});

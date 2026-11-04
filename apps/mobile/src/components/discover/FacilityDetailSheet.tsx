import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from "react-native";
import { X, MapPin, Star, Sparkles, ChevronRight, Check } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { FacilityRow } from "sodia-core";
import { PickleballBookingGrid } from "./PickleballBookingGrid";

export interface FacilityPassOption {
  id: string;
  title: string;
  subtitle: string;
  pricePhp: number;
  billingKind: "one_time_pass" | "recurring_subscription";
  splitNote?: string;
}

interface FacilityDetailSheetProps {
  facility: FacilityRow | null;
  visible: boolean;
  onClose: () => void;
  onSelectPass: (option: FacilityPassOption, facility: FacilityRow) => void;
}

export function FacilityDetailSheet({
  facility,
  visible,
  onClose,
  onSelectPass,
}: FacilityDetailSheetProps) {
  const { colors } = useThemeStore();
  const [selectedPassId, setSelectedPassId] = useState<string>("");

  if (!visible || !facility) return null;

  const isGym = facility.registry === "A";

  const passOptions: FacilityPassOption[] = isGym
    ? [
        { id: "pass_day", title: "All-Access Day Pass", subtitle: "Single-day turnstile entry • Free lockers & sauna", pricePhp: facility.day_pass_price_php ?? 250, billingKind: "one_time_pass" },
        { id: "pass_pack10", title: "10-Session Punch Pack", subtitle: "Valid for 60 days • Save ₱300 vs daily drop-ins", pricePhp: 2200, billingKind: "one_time_pass" },
        { id: "pass_vip_monthly", title: "VIP Monthly All-Access", subtitle: "Unlimited 24/7 entry • 2 guest passes/month", pricePhp: facility.monthly_sub_price_php ?? 1500, billingKind: "recurring_subscription" },
      ]
    : [
        { id: "court_1hr", title: "1-Hour Court Reservation", subtitle: "Pickleball / Multi-court • Free loaner paddles", pricePhp: facility.court_hourly_price_php ?? 200, billingKind: "one_time_pass", splitNote: "Includes court maintenance fee" },
        { id: "court_ladder", title: "Open Play Ladder Entry", subtitle: "2 hours rotating King-of-the-court • DUPR rated", pricePhp: 150, billingKind: "one_time_pass" },
        { id: "court_tournament", title: "Sunset Open Tournament Pass", subtitle: "Official bracket roster entry • Prize pool eligible", pricePhp: 500, billingKind: "one_time_pass", splitNote: "Direct bracket prize pool escrow" },
      ];

  const activePass = passOptions.find((p) => p.id === selectedPassId) ?? passOptions[0];

  const amenities = isGym
    ? ["Olympic Barbells", "Turf Sprint Track", "Recovery Sauna", "Showers & Lockers", "Specialty Cafe"]
    : ["4 Regulation Courts", "Pro Lighting", "Equipment Rental", "Player Lounge", "Covered Facility"];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          {/* HEADER IMAGE & CLOSE */}
          <View style={styles.heroContainer}>
            <Image source={{ uri: facility.cover_image ?? facility.cover_url ?? "" }} style={styles.heroCover} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FAFAFA" />
            </TouchableOpacity>
            <View style={styles.registryTag}>
              <Text style={styles.registryTagText}>
                {isGym ? "REGISTRY A • COMMERCIAL ARENA" : "REGISTRY B • COURT CLUB"}
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* FACILITY TITLE & OCCUPANCY */}
            <View style={styles.titleSection}>
              <View style={styles.nameRow}>
                <Text style={[styles.facName, { color: colors.textPrimary }]}>{facility.name}</Text>
                <View style={styles.ratingBadge}>
                  <Star size={11} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingText}>{facility.rating ?? 4.9} ({facility.review_count ?? 148})</Text>
                </View>
              </View>

              <View style={styles.locationRow}>
                <MapPin size={12} color={colors.textMuted} />
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>{facility.address} • {facility.distance}</Text>
              </View>

              {/* LIVE OCCUPANCY METER */}
              <View style={[styles.occupancyBox, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
                <View style={styles.occupancyHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.occupancyTitle, { color: colors.textPrimary }]}>LIVE ATHLETE DENSITY</Text>
                  </View>
                  <Text style={styles.occupancyCounts}>
                    {facility.inside_now_count ?? 42} / {facility.max_capacity ?? 100} Capacity
                  </Text>
                </View>
                <View style={[styles.meterTrack, { backgroundColor: colors.borderColor }]}>
                  <View
                    style={[
                      styles.meterFill,
                      { width: `${Math.min(100, ((facility.inside_now_count ?? 42) / (facility.max_capacity ?? 100)) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.occupancySub, { color: colors.textMuted }]}>Peak hours: 5:30 PM - 8:00 PM • Smooth turnstile flow now</Text>
              </View>
            </View>

            {/* AMENITIES */}
            <View style={styles.amenitiesSection}>
              <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>FACILITY AMENITIES</Text>
              <View style={styles.amenitiesRow}>
                {amenities.map((item) => (
                  <View key={item} style={[styles.amenityChip, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor, borderWidth: 1 }]}>
                    <Sparkles size={11} color="#E11D48" />
                    <Text style={[styles.amenityText, { color: colors.textPrimary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* COURT BOOKING GRID (FOR PICKLEBALL / COURT FACILITIES) */}
            {!isGym && (
              <PickleballBookingGrid
                hourlyRate={facility.court_hourly_price_php ?? 200}
                onConfirmBooking={(slot) => {
                  onSelectPass(
                    {
                      id: `court_${slot.courtId}_${Date.now()}`,
                      title: `${slot.courtName} Reservation`,
                      subtitle: `${slot.timeSlot} • Instant Gate Pass`,
                      pricePhp: slot.pricePhp,
                      billingKind: "one_time_pass",
                      splitNote: "Includes court reservation buffer",
                    },
                    facility
                  );
                }}
              />
            )}

            {/* PASS & PRICING SELECTOR */}
            <View style={styles.pricingSection}>
              <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>SELECT ACCESS TIER</Text>
              <View style={{ gap: 10 }}>
                {passOptions.map((opt) => {
                  const isSelected = opt.id === (activePass?.id ?? "");
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setSelectedPassId(opt.id)}
                      style={[styles.passCard, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, isSelected && styles.passCardSelected]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.passTitle, { color: colors.textPrimary }]}>{opt.title}</Text>
                        <Text style={[styles.passSubtitle, { color: colors.textMuted }]}>{opt.subtitle}</Text>
                      </View>
                      <View style={styles.passPriceCol}>
                        <Text style={[styles.passPrice, { color: colors.accentGreen }]}>₱{opt.pricePhp}</Text>
                        <View style={[styles.radioDot, { borderColor: colors.borderColor }, isSelected && styles.radioDotSelected]}>
                          {isSelected && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* CHECKOUT CTA BAR */}
          {activePass && (
            <View style={[styles.footerBar, { backgroundColor: colors.bgCard, borderTopColor: colors.borderColor }]}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Total Amount</Text>
                <Text style={[styles.footerPrice, { color: colors.textPrimary }]}>₱{activePass.pricePhp.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  onSelectPass(activePass, facility);
                }}
                style={styles.checkoutBtn}
              >
                <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                <ChevronRight size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: "88%", borderWidth: 1, overflow: "hidden" },
  heroContainer: { position: "relative", width: "100%", height: 160 },
  heroCover: { width: "100%", height: "100%", resizeMode: "cover" },
  closeBtn: { position: "absolute", top: 14, right: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.65)", alignItems: "center", justifyContent: "center" },
  registryTag: { position: "absolute", bottom: 12, left: 16, backgroundColor: "rgba(9,9,11,0.85)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#27272A" },
  registryTagText: { color: "#FAFAFA", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  content: { padding: 18, paddingBottom: 24 },
  titleSection: { marginBottom: 18 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  facName: { fontSize: 20, fontWeight: "900", flex: 1, marginRight: 8 },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(245,158,11,0.15)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ratingText: { color: "#FBBF24", fontSize: 11, fontWeight: "800" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  addressText: { fontSize: 12 },
  occupancyBox: { borderRadius: 14, padding: 12, marginTop: 14, borderWidth: 1 },
  occupancyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
  occupancyTitle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  occupancyCounts: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  meterTrack: { height: 6, borderRadius: 3, marginTop: 8, overflow: "hidden" },
  meterFill: { height: "100%", backgroundColor: "#10B981", borderRadius: 3 },
  occupancySub: { fontSize: 10, marginTop: 6 },
  amenitiesSection: { marginBottom: 20 },
  sectionHeader: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  amenitiesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  amenityChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  amenityText: { fontSize: 11, fontWeight: "600" },
  pricingSection: { marginBottom: 14 },
  passCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1.5 },
  passCardSelected: { borderColor: "#E11D48", backgroundColor: "rgba(225,29,72,0.06)" },
  passTitle: { fontSize: 13, fontWeight: "800" },
  passSubtitle: { fontSize: 11, marginTop: 3 },
  passPriceCol: { alignItems: "flex-end", gap: 6, marginLeft: 12 },
  passPrice: { fontSize: 15, fontWeight: "800" },
  radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  radioDotSelected: { borderColor: "#E11D48", backgroundColor: "#E11D48" },
  footerBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderTopWidth: 1 },
  footerLabel: { fontSize: 11, fontWeight: "700" },
  footerPrice: { fontSize: 20, fontWeight: "900" },
  checkoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  checkoutBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});

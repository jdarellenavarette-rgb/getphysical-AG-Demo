import React, { useState } from "react";
import { Animated, View, Text, TouchableOpacity, StyleSheet, Modal, Image, ScrollView } from "react-native";
import { X, MapPin, Star, Sparkles, ChevronRight } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";
import type { FacilityRow } from "sodia-core";
import { PickleballBookingGrid } from "./PickleballBookingGrid";
import { SheetBackdrop, SheetGrabber } from "../common/SheetParts";
import { useSwipeDownToClose } from "../../hooks/useDismissGestures";
import { useVenuePlans, type FacilityPassOption } from "../../hooks/useVenuePlans";
import { VenuePlansSection } from "./VenuePlansSection";
import { formatPhp } from "../../lib/passDisplay";

export type { FacilityPassOption };

interface FacilityDetailSheetProps {
  facility: FacilityRow | null;
  visible: boolean;
  onClose: () => void;
  onSelectPass: (option: FacilityPassOption, facility: FacilityRow) => void;
}

export function FacilityDetailSheet({ facility, visible, onClose, onSelectPass }: FacilityDetailSheetProps) {
  const { colors } = useThemeStore();
  const swipe = useSwipeDownToClose(() => onClose());
  const [selectedPassId, setSelectedPassId] = useState<string>("");
  const { plans, live, retry } = useVenuePlans(facility, visible);

  if (!visible || !facility) return null;

  const isGym = facility.registry === "A";
  const options = plans.status === "ready" || plans.status === "preview" ? plans.options : [];
  const activePass = options.find((p) => p.id === selectedPassId) ?? options[0] ?? null;

  // The venue's own amenities and opening hours, not a generic list.
  const amenities: readonly string[] = Array.isArray(facility.amenities)
    ? facility.amenities.filter((item): item is string => typeof item === "string")
    : [];
  const inside = facility.inside_now_count ?? 0;
  const capacity = facility.max_capacity ?? 0;
  const fill = capacity > 0 ? inside / capacity : 0;
  const busyLabel = fill >= 0.8 ? "Very busy" : fill >= 0.5 ? "Getting busy" : "Not busy";

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SheetBackdrop onPress={onClose} />
        <Animated.View
          style={[
            styles.sheetCard,
            { backgroundColor: colors.bgCard, borderColor: colors.borderColor },
            swipe.sheetStyle,
          ]}
        >
          <SheetGrabber panHandlers={swipe.panHandlers} />
          {/* HEADER IMAGE & CLOSE */}
          <View style={styles.heroContainer}>
            <Image source={{ uri: facility.cover_image ?? facility.cover_url ?? "" }} style={styles.heroCover} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="#FAFAFA" />
            </TouchableOpacity>
            <View style={styles.registryTag}>
              <Text style={styles.registryTagText}>
                {(facility.category ?? (isGym ? "Gym" : "Courts")).toUpperCase()}
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {/* FACILITY TITLE & OCCUPANCY */}
            <View style={styles.titleSection}>
              <View style={styles.nameRow}>
                <Text style={[styles.facName, { color: colors.textPrimary }]}>{facility.name}</Text>
                {facility.rating != null && (
                  <View style={styles.ratingBadge}>
                    <Star size={11} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.ratingText}>
                      {facility.rating}
                      {facility.review_count != null ? ` (${facility.review_count})` : ""}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.locationRow}>
                <MapPin size={12} color={colors.textMuted} />
                <Text style={[styles.addressText, { color: colors.textSecondary }]}>
                  {facility.address}
                  {facility.distance ? ` • ${facility.distance}` : ""}
                </Text>
              </View>

              {/* LIVE OCCUPANCY METER */}
              <View
                style={[
                  styles.occupancyBox,
                  { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor },
                ]}
              >
                <View style={styles.occupancyHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <View style={styles.greenDot} />
                    <Text style={[styles.occupancyTitle, { color: colors.textPrimary }]}>HOW BUSY</Text>
                  </View>
                  {capacity > 0 && (
                    <Text style={styles.occupancyCounts}>
                      {inside} / {capacity} people
                    </Text>
                  )}
                </View>
                <View style={[styles.meterTrack, { backgroundColor: colors.borderColor }]}>
                  <View
                    style={[
                      styles.meterFill,
                      {
                        width: `${Math.min(100, Math.round(fill * 100))}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.occupancySub, { color: colors.textMuted }]}>
                  {[capacity > 0 ? busyLabel : null, facility.hours ? `Open ${facility.hours}` : null]
                    .filter(Boolean)
                    .join(" • ") || "Opening hours not listed"}
                </Text>
              </View>
            </View>

            {/* AMENITIES */}
            <View style={[styles.amenitiesSection, amenities.length === 0 && { display: "none" }]}>
              <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>AMENITIES</Text>
              <View style={styles.amenitiesRow}>
                {amenities.map((item) => (
                  <View
                    key={item}
                    style={[
                      styles.amenityChip,
                      { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor, borderWidth: 1 },
                    ]}
                  >
                    <Sparkles size={11} color="#E11D48" />
                    <Text style={[styles.amenityText, { color: colors.textPrimary }]}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Court slots are a preview-only sample: the backend has no court bookings to sell yet. */}
            {!isGym && !live && (
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
                    facility,
                  );
                }}
              />
            )}

            <VenuePlansSection
              plans={plans}
              selectedId={activePass?.id ?? null}
              onSelect={setSelectedPassId}
              onRetry={retry}
            />
          </ScrollView>

          {/* CHECKOUT CTA BAR */}
          {activePass && (
            <View style={[styles.footerBar, { backgroundColor: colors.bgCard, borderTopColor: colors.borderColor }]}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Subtotal</Text>
                <Text style={[styles.footerPrice, { color: colors.textPrimary }]}>
                  {formatPhp(activePass.pricePhp)}
                </Text>
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
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    borderWidth: 1,
    overflow: "hidden",
  },
  heroContainer: { position: "relative", width: "100%", height: 160 },
  heroCover: { width: "100%", height: "100%", resizeMode: "cover" },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  registryTag: {
    position: "absolute",
    bottom: 12,
    left: 16,
    backgroundColor: "rgba(9,9,11,0.85)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  registryTagText: { color: "#FAFAFA", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  content: { padding: 18, paddingBottom: 24 },
  titleSection: { marginBottom: 18 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  facName: { fontSize: 20, fontWeight: "900", flex: 1, marginRight: 8 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(245,158,11,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
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
  amenityChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  amenityText: { fontSize: 11, fontWeight: "600" },
  footerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
  },
  footerLabel: { fontSize: 11, fontWeight: "700" },
  footerPrice: { fontSize: 20, fontWeight: "900" },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E11D48",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  checkoutBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
});

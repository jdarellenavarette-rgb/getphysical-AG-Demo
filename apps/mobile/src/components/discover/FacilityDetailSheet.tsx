import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetFooter, useBottomSheetScrollableCreator } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check, ChevronRight } from "lucide-react-native";
import { MIN_TOUCH_TARGET, type FacilityRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import { AppBottomSheet } from "../sheets/AppBottomSheet";
import { PickleballBookingGrid } from "./PickleballBookingGrid";
import { FacilityOverview } from "./facility/FacilityOverview";
import { passOptionsFor, type FacilityPassOption } from "./facility/passOptions";

export type { FacilityPassOption } from "./facility/passOptions";

interface FacilityDetailSheetProps {
  facility: FacilityRow | null;
  visible: boolean;
  onClose: () => void;
  onSelectPass: (option: FacilityPassOption, facility: FacilityRow) => void;
}

const SNAP_POINTS = ["62%", "92%"] as const;
const FOOTER_HEIGHT = 84;

export function FacilityDetailSheet({ facility, visible, onClose, onSelectPass }: FacilityDetailSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const renderScrollComponent = useBottomSheetScrollableCreator();
  const [selectedPassId, setSelectedPassId] = useState("");
  // Keep the last facility mounted while the sheet animates closed.
  const lastFacility = useRef<FacilityRow | null>(facility);
  if (facility) lastFacility.current = facility;
  const fac = lastFacility.current;

  useEffect(() => {
    setSelectedPassId("");
  }, [facility?.id]);

  const options = fac ? passOptionsFor(fac) : [];
  const activePass = options.find((p) => p.id === selectedPassId) ?? options[0];

  return (
    <AppBottomSheet
      visible={visible && !!facility}
      onClose={onClose}
      snapPoints={SNAP_POINTS}
      accessibilityLabel={fac ? `${fac.name} details` : "Facility details"}
      footer={(props) =>
        fac && activePass ? (
          <BottomSheetFooter {...props} bottomInset={0}>
            <View style={[styles.footer, { backgroundColor: colors.bgCard, borderTopColor: colors.borderColor, paddingBottom: Math.max(insets.bottom, 12) }]}>
              <View>
                <Text style={[styles.footerLabel, { color: colors.textMuted }]}>Total</Text>
                <Text style={[styles.footerPrice, { color: colors.textPrimary }]}>₱{activePass.pricePhp.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => onSelectPass(activePass, fac)}
                style={[styles.checkoutBtn, { backgroundColor: colors.accent }]}
                accessibilityRole="button"
                accessibilityLabel={`Continue to checkout for ${activePass.title}`}
              >
                <Text style={[styles.checkoutText, { color: colors.textOnAccent }]}>Continue</Text>
                <ChevronRight size={18} color={colors.textOnAccent} />
              </TouchableOpacity>
            </View>
          </BottomSheetFooter>
        ) : null
      }
    >
      {fac ? (
        <FlashList
          data={options}
          extraData={activePass?.id}
          keyExtractor={(o) => o.id}
          renderScrollComponent={renderScrollComponent}
          contentContainerStyle={{ paddingBottom: FOOTER_HEIGHT + insets.bottom + 16 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          ListHeaderComponent={
            <View>
              <FacilityOverview facility={fac} onClose={onClose} />
              <View style={styles.section}>
                {fac.registry !== "A" && (
                  <PickleballBookingGrid
                    hourlyRate={fac.court_hourly_price_php ?? 200}
                    onConfirmBooking={(slot) =>
                      onSelectPass(
                        {
                          id: `court_${slot.courtId}_${Date.now()}`,
                          title: `${slot.courtName} Reservation`,
                          subtitle: `${slot.timeSlot} • Instant Gate Pass`,
                          pricePhp: slot.pricePhp,
                          billingKind: "one_time_pass",
                          splitNote: "Includes court reservation buffer",
                        },
                        fac
                      )
                    }
                  />
                )}
                <Text style={[styles.sectionHeader, { color: colors.textMuted }]}>SELECT ACCESS TIER</Text>
              </View>
            </View>
          }
          renderItem={({ item: opt }) => {
            const selected = opt.id === activePass?.id;
            return (
              <View style={styles.itemPad}>
                  <TouchableOpacity
                    onPress={() => setSelectedPassId(opt.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={`${opt.title}, ${opt.pricePhp} pesos${opt.billingKind === "recurring_subscription" ? " per month" : ""}`}
                    style={[
                      styles.passCard,
                      { backgroundColor: selected ? colors.accentMuted : colors.bgCardSecondary, borderColor: selected ? colors.accent : colors.borderColor },
                    ]}
                  >
                    <View style={styles.flex}>
                      <Text style={[styles.passTitle, { color: colors.textPrimary }]}>{opt.title}</Text>
                      <Text style={[styles.passSub, { color: colors.textMuted }]}>{opt.subtitle}</Text>
                    </View>
                    <View style={styles.priceCol}>
                      <Text style={[styles.passPrice, { color: colors.accentGreen }]}>
                        ₱{opt.pricePhp}
                        {opt.billingKind === "recurring_subscription" ? "/mo" : ""}
                      </Text>
                      <View style={[styles.radio, { borderColor: selected ? colors.accent : colors.borderColor, backgroundColor: selected ? colors.accent : "transparent" }]}>
                        {selected && <Check size={12} color={colors.textOnAccent} strokeWidth={3} />}
                      </View>
                    </View>
                  </TouchableOpacity>
              </View>
            );
          }}
        />
      ) : null}
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { paddingHorizontal: 18, paddingTop: 20 },
  sectionHeader: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  sep: { height: 10 },
  itemPad: { paddingHorizontal: 18 },
  passCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 14, borderWidth: 1.5 },
  passTitle: { fontSize: 14, fontWeight: "800" },
  passSub: { fontSize: 12, marginTop: 3 },
  priceCol: { alignItems: "flex-end", gap: 6, marginLeft: 12 },
  passPrice: { fontSize: 15, fontWeight: "800" },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, paddingTop: 12, borderTopWidth: 1 },
  footerLabel: { fontSize: 12, fontWeight: "700" },
  footerPrice: { fontSize: 20, fontWeight: "900", fontVariant: ["tabular-nums"] },
  checkoutBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 22, minHeight: MIN_TOUCH_TARGET + 4, borderRadius: 12 },
  checkoutText: { fontSize: 14, fontWeight: "800" },
});

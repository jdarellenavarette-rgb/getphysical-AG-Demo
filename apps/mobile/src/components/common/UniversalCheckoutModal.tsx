import React, { useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomSheetView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { Lock, Shield, WifiOff, X } from "lucide-react-native";
import { calculateHybridServiceFee, createCorrelationCode, HYBRID_FEE_MODEL, MIN_TOUCH_TARGET, RADII, SPACING, TYPE_SCALE } from "sodia-core";
import { useColors } from "../../theme/theme";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { AppBottomSheet } from "../sheets/AppBottomSheet";
import { haptics } from "../../lib/haptics";
import type { CheckoutRequest } from "../discover/DiscoverView";

interface UniversalCheckoutModalProps {
  item: CheckoutRequest | null;
  visible: boolean;
  onClose: () => void;
  /** Provisions the pass; may be async (gateway hand-off). Throwing surfaces the error state. */
  onConfirm: (item: CheckoutRequest) => void | Promise<void>;
}

function peso(n: number): string {
  return `₱${n.toFixed(2)}`;
}

/**
 * Universal checkout (Master Spec Phase 4). GetPhysical is never MoR: the only
 * platform line is the hybrid Service Fee (₱15 fixed one-time / 5% recurring).
 */
export function UniversalCheckoutModal({ item, visible, onClose, onConfirm }: UniversalCheckoutModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isOffline = useEcosystemStore((s) => s.isOffline);
  const lastItem = useRef<CheckoutRequest | null>(item);
  if (item) lastItem.current = item;
  const current = lastItem.current;

  const pay = useMutation({
    mutationFn: async (req: CheckoutRequest) => {
      await onConfirm(req);
    },
    onSuccess: () => haptics.success(),
    onError: () => haptics.error(),
  });
  const { reset } = pay;

  useEffect(() => {
    if (visible) reset();
  }, [visible, item?.id, reset]);

  const securing = pay.isPending;
  const fee = current ? calculateHybridServiceFee(current.baseAmountPhp, current.billingKind) : null;
  const recurring = current?.billingKind === "recurring_subscription";
  const feeLabel = recurring ? `Service Fee (${HYBRID_FEE_MODEL.RECURRING_SUB_FEE_RATE * 100}%)` : "Service Fee";
  const errorCode = useRef(createCorrelationCode("PAY"));

  return (
    <AppBottomSheet visible={visible && !!item} onClose={onClose} locked={securing} accessibilityLabel="Checkout">
      <BottomSheetView style={[styles.sheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]} accessibilityRole="header">Checkout</Text>
          <TouchableOpacity
            onPress={onClose}
            disabled={securing}
            style={[styles.close, securing && styles.disabled]}
            accessibilityRole="button"
            accessibilityLabel="Close checkout"
            accessibilityState={{ disabled: securing }}
          >
            <X size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {current && fee ? (
          <>
            <View style={[styles.item, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
              <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{current.title}</Text>
              <Text style={[styles.itemSub, { color: colors.textSecondary }]}>{current.subtitle}</Text>
              {current.splitNote ? (
                <View style={[styles.note, { backgroundColor: colors.accentGreenMuted }]}>
                  <Shield size={12} color={colors.accentGreen} />
                  <Text style={[styles.noteText, { color: colors.accentGreen }]}>{current.splitNote}</Text>
                </View>
              ) : null}
            </View>

            <View style={[styles.lines, { borderTopColor: colors.borderColor }]}>
              <View style={styles.line}>
                <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>{recurring ? "Membership (monthly)" : "Pass price"}</Text>
                <Text style={[styles.lineVal, { color: colors.textPrimary }]}>{peso(fee.baseAmountPhp)}</Text>
              </View>
              <View style={styles.line}>
                <Text style={[styles.lineLabel, { color: colors.textSecondary }]}>{feeLabel}</Text>
                <Text style={[styles.lineVal, { color: colors.textPrimary }]}>{peso(fee.serviceFeePhp)}</Text>
              </View>
              <View style={[styles.line, styles.total, { borderTopColor: colors.borderColor }]}>
                <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total{recurring ? " / month" : ""}</Text>
                <Text style={[styles.totalVal, { color: colors.textPrimary }]}>{peso(fee.totalChargePhp)}</Text>
              </View>
            </View>

            {isOffline ? (
              <View style={[styles.banner, { backgroundColor: colors.bgCardSecondary, borderColor: colors.warning }]} accessibilityRole="alert">
                <WifiOff size={16} color={colors.warning} />
                <Text style={[styles.bannerText, { color: colors.textPrimary }]}>Payments need a connection. Reconnect to continue.</Text>
              </View>
            ) : null}
            {pay.isError ? (
              <View style={[styles.banner, { backgroundColor: colors.bgCardSecondary, borderColor: colors.danger }]} accessibilityRole="alert">
                <Text style={[styles.bannerText, { color: colors.textPrimary }]}>
                  Payment didn't go through. You weren't charged. Ref {errorCode.current}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={() => pay.mutate(current)}
              disabled={securing || isOffline}
              style={[styles.pay, { backgroundColor: colors.accent }, (securing || isOffline) && styles.disabled]}
              accessibilityRole="button"
              accessibilityState={{ disabled: securing || isOffline, busy: securing }}
              accessibilityLabel={securing ? "Securing your slot" : `Pay ${peso(fee.totalChargePhp)}`}
            >
              {securing ? <ActivityIndicator color={colors.textOnAccent} /> : <Lock size={16} color={colors.textOnAccent} />}
              <Text style={[styles.payText, { color: colors.textOnAccent }]}>
                {securing ? "Securing your slot…" : pay.isError ? "Try again" : `Pay ${peso(fee.totalChargePhp)}`}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.legal, { color: colors.textMuted }]}>
              Paid directly to {current.facilityName}. GetPhysical charges only the service fee.
            </Text>
          </>
        ) : null}
      </BottomSheetView>
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { paddingHorizontal: SPACING.xl },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.sm },
  title: { ...TYPE_SCALE.title, fontWeight: "900" },
  close: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, alignItems: "center", justifyContent: "center" },
  disabled: { opacity: 0.5 },
  item: { borderRadius: RADII.lg, padding: 14, borderWidth: 1, marginBottom: SPACING.lg },
  itemTitle: { ...TYPE_SCALE.bodyLarge, fontWeight: "700" },
  itemSub: { ...TYPE_SCALE.footnote, marginTop: 2 },
  note: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: "flex-start" },
  noteText: { ...TYPE_SCALE.caption, fontWeight: "700" },
  lines: { borderTopWidth: 1, paddingTop: SPACING.md, marginBottom: SPACING.lg },
  line: { flexDirection: "row", justifyContent: "space-between", marginBottom: SPACING.sm },
  lineLabel: { ...TYPE_SCALE.body },
  lineVal: { ...TYPE_SCALE.body, fontWeight: "600", fontVariant: ["tabular-nums"] },
  total: { borderTopWidth: 1, paddingTop: SPACING.sm, marginTop: SPACING.xs },
  totalLabel: { ...TYPE_SCALE.bodyLarge, fontWeight: "800" },
  totalVal: { ...TYPE_SCALE.title, fontWeight: "900", fontVariant: ["tabular-nums"] },
  banner: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, padding: SPACING.md, borderRadius: RADII.md, borderWidth: 1, marginBottom: SPACING.md },
  bannerText: { ...TYPE_SCALE.footnote, flex: 1 },
  pay: { minHeight: 52, borderRadius: RADII.lg, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm },
  payText: { ...TYPE_SCALE.bodyLarge, fontWeight: "800" },
  legal: { ...TYPE_SCALE.caption, textAlign: "center", marginTop: SPACING.md },
});

import React, { useState } from "react";
import { Animated, View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { Shield } from "lucide-react-native";
import { calculateHybridServiceFee } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { useEcosystemStore } from "../../store/ecosystemStore";
import type { CheckoutRequest } from "../discover/DiscoverView";
import { SheetBackdrop, SheetGrabber } from "./SheetParts";
import { useSwipeDownToClose } from "../../hooks/useDismissGestures";

interface UniversalCheckoutModalProps {
  item: CheckoutRequest | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (item: CheckoutRequest) => void | Promise<void>;
  /** Why the last attempt did not reach the payment page, in words the buyer can act on. */
  error?: string | null;
}

export function UniversalCheckoutModal({ item, visible, onClose, onConfirm, error }: UniversalCheckoutModalProps) {
  const { colors } = useThemeStore();
  const swipe = useSwipeDownToClose(() => onClose());
  const { isGuest } = useEcosystemStore();
  const [submitting, setSubmitting] = useState(false);
  if (!visible || !item) return null;

  // One submission at a time: a second tap must not create a second pass or order.
  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(item);
    } finally {
      setSubmitting(false);
    }
  };

  const fee = calculateHybridServiceFee(item.baseAmountPhp, item.billingKind);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <SheetBackdrop onPress={onClose} />
        <Animated.View
          style={[
            styles.checkoutSheet,
            { backgroundColor: colors.bgCard, borderColor: colors.borderColor },
            swipe.sheetStyle,
          ]}
        >
          <SheetGrabber panHandlers={swipe.panHandlers} />
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>CHECKOUT</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
            >
              <Text style={[styles.closeBtn, { color: colors.textMuted }]}>Close</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.inventoryItem,
              { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.invTitle, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.invSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
            <Text style={styles.invPrice}>₱{item.baseAmountPhp.toFixed(2)}</Text>
            {item.splitNote && (
              <View style={styles.splitRow}>
                <Shield size={11} color="#10B981" />
                <Text style={styles.splitText}>{item.splitNote}</Text>
              </View>
            )}
          </View>

          <View style={[styles.feeBreakdown, { borderTopColor: colors.borderColor }]}>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.textMuted }]}>Subtotal</Text>
              <Text style={[styles.feeVal, { color: colors.textPrimary }]}>₱{fee.baseAmountPhp.toFixed(2)}</Text>
            </View>
            <View style={styles.feeRow}>
              <Text style={[styles.feeLabel, { color: colors.textMuted }]}>
                Service Fee ({item.billingKind === "recurring_subscription" ? "5% Recurring" : "₱15 Fixed"})
              </Text>
              <Text style={[styles.feeVal, { color: colors.textPrimary }]}>₱{fee.serviceFeePhp.toFixed(2)}</Text>
            </View>
            <View style={[styles.feeRow, styles.totalRow, { borderTopColor: colors.borderColor }]}>
              <Text style={[styles.totalLabel, { color: colors.textPrimary }]}>Total Charge</Text>
              <Text style={[styles.totalVal, { color: colors.accent }]}>₱{fee.totalChargePhp.toFixed(2)}</Text>
            </View>
          </View>

          {isGuest && (
            <Text style={[styles.previewNote, { color: colors.textMuted }]}>
              Sign in or create an account to buy this pass.
            </Text>
          )}
          {error ? (
            <Text style={styles.errorNote} accessibilityRole="alert">
              {error}
            </Text>
          ) : null}
          <TouchableOpacity
            onPress={() => void handleConfirm()}
            disabled={submitting}
            style={[styles.payButton, submitting && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityState={{ disabled: submitting, busy: submitting }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Shield size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.payButtonText}>
                  {isGuest ? "Sign In to Buy" : fee.totalChargePhp === 0 ? "Confirm" : "Continue to Payment"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  previewNote: { fontSize: 12, textAlign: "center", marginBottom: 10 },
  errorNote: { color: "#F87171", fontSize: 13, lineHeight: 18, textAlign: "center", marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  checkoutSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, borderWidth: 1 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  sheetTitle: { fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  closeBtn: { fontSize: 13, fontWeight: "600" },
  inventoryItem: { borderRadius: 12, padding: 14, marginBottom: 16 },
  invTitle: { fontSize: 15, fontWeight: "700" },
  invSubtitle: { fontSize: 12, marginTop: 2 },
  invPrice: { color: "#10B981", fontSize: 16, fontWeight: "800", marginTop: 4 },
  splitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  splitText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  feeBreakdown: { borderTopWidth: 1, paddingTop: 12, marginBottom: 16 },
  feeRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  feeLabel: { fontSize: 12 },
  feeVal: { fontSize: 12, fontWeight: "600" },
  totalRow: { borderTopWidth: 1, paddingTop: 8, marginTop: 4 },
  totalLabel: { fontSize: 14, fontWeight: "800" },
  totalVal: { fontSize: 18, fontWeight: "900" },
  payButton: {
    backgroundColor: "#E11D48",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  payButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
});

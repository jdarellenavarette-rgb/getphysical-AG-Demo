import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ChevronRight, QrCode } from "lucide-react-native";
import type { PassRow } from "sodia-core";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { isPassUsable, passExpiryLabel, passStatusLabel, passTitle, passVenueName } from "../../lib/passDisplay";

interface WalletPassListProps {
  passes: readonly PassRow[];
  /** The pass currently shown on the card above the list. */
  activePassId: string | null;
  onOpenReceipt: (pass: PassRow) => void;
  /** Put this pass on the card and show its entry code. */
  onShowQr: (pass: PassRow) => void;
}

/** Every pass the member holds: plan, venue, when it ends, and whether it still opens the door. */
export function WalletPassList({ passes, activePassId, onOpenReceipt, onShowQr }: WalletPassListProps) {
  const { facilities, purchases, venueNames } = useEcosystemStore();
  const { colors } = useThemeStore();

  return (
    <View style={styles.list}>
      {passes.map((pass) => {
        const venue = passVenueName(pass, facilities, purchases[pass.id], venueNames);
        const usable = isPassUsable(pass);
        return (
          <View
            key={pass.id}
            style={[
              styles.row,
              { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor },
              pass.id === activePassId && { borderColor: colors.accent },
            ]}
          >
            <TouchableOpacity
              onPress={() => onOpenReceipt(pass)}
              style={styles.rowMain}
              accessibilityRole="button"
              accessibilityLabel={`${passTitle(pass, venue)}, ${venue}. Open receipt`}
            >
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1} style={[styles.name, { color: colors.textPrimary }]}>
                  {passTitle(pass, venue)}
                </Text>
                <Text numberOfLines={1} style={[styles.meta, { color: colors.textMuted }]}>
                  {venue} • {passExpiryLabel(pass)}
                </Text>
              </View>
              <Text style={[styles.status, !usable && { color: colors.textMuted }]}>{passStatusLabel(pass)}</Text>
              <ChevronRight size={16} color={colors.textMuted} />
            </TouchableOpacity>
            {usable ? (
              <TouchableOpacity
                onPress={() => onShowQr(pass)}
                style={[styles.qrBtn, { borderLeftColor: colors.borderColor }]}
                accessibilityRole="button"
                accessibilityLabel={`Show entry QR for ${venue}`}
              >
                <QrCode size={18} color={colors.accent} />
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { flexDirection: "row", alignItems: "stretch", borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  rowMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, padding: 12, minHeight: 56 },
  name: { fontSize: 14, fontWeight: "800" },
  meta: { fontSize: 11, marginTop: 2 },
  status: { fontSize: 11, fontWeight: "800", color: "#10B981" },
  qrBtn: { width: 48, alignItems: "center", justifyContent: "center", borderLeftWidth: 1 },
});

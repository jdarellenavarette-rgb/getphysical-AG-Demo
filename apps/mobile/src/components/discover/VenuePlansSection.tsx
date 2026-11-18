import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Check, CloudOff, Ticket } from "lucide-react-native";
import { calculateHybridServiceFee } from "sodia-core";
import { useThemeStore } from "../../theme/theme";
import { formatPhp } from "../../lib/passDisplay";
import type { FacilityPassOption, VenuePlansState } from "../../hooks/useVenuePlans";

interface VenuePlansSectionProps {
  plans: VenuePlansState;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

function feeNote(option: FacilityPassOption): string {
  const fee = calculateHybridServiceFee(option.pricePhp, option.billingKind);
  return fee.serviceFeePhp > 0 ? `+ ${formatPhp(fee.serviceFeePhp)} service fee` : "No service fee";
}

/** The venue's plans: loading placeholders, a retry on failure, one line when nothing is on sale. */
export function VenuePlansSection({ plans, selectedId, onSelect, onRetry }: VenuePlansSectionProps) {
  const { colors } = useThemeStore();
  const box = { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor };

  return (
    <View style={styles.section}>
      <Text style={[styles.header, { color: colors.textMuted }]}>CHOOSE A PLAN</Text>

      {plans.status === "loading" ? (
        <View accessibilityLabel="Loading plans" style={styles.list}>
          <View style={[styles.card, styles.skeleton, box]} />
          <View style={[styles.card, styles.skeleton, box]} />
        </View>
      ) : plans.status === "error" ? (
        <View style={[styles.messageBox, box]}>
          <CloudOff size={20} color="#F59E0B" />
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            Couldn't load this venue's plans. {plans.message}
          </Text>
          <TouchableOpacity onPress={onRetry} style={styles.retryBtn} accessibilityRole="button">
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : plans.options.length === 0 ? (
        <View style={[styles.messageBox, box]}>
          <Ticket size={20} color={colors.textMuted} />
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>
            This venue isn't selling passes in the app right now. Ask at the front desk.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {plans.options.map((option) => {
            const isSelected = option.id === selectedId;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => onSelect(option.id)}
                style={[styles.card, box, isSelected && styles.cardSelected]}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: colors.textPrimary }]}>{option.title}</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>{option.subtitle}</Text>
                  <Text style={[styles.subtitle, { color: colors.textMuted }]}>{feeNote(option)}</Text>
                </View>
                <View style={styles.priceCol}>
                  <Text style={[styles.price, { color: colors.accentGreen }]}>{formatPhp(option.pricePhp)}</Text>
                  <View style={[styles.radio, { borderColor: colors.borderColor }, isSelected && styles.radioSelected]}>
                    {isSelected && <Check size={10} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 14 },
  header: { fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  list: { gap: 10 },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
  },
  cardSelected: { borderColor: "#E11D48", backgroundColor: "rgba(225,29,72,0.06)" },
  skeleton: { height: 68, opacity: 0.6 },
  title: { fontSize: 13, fontWeight: "800" },
  subtitle: { fontSize: 11, marginTop: 3 },
  priceCol: { alignItems: "flex-end", gap: 6, marginLeft: 12 },
  price: { fontSize: 15, fontWeight: "800" },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  radioSelected: { borderColor: "#E11D48", backgroundColor: "#E11D48" },
  messageBox: { alignItems: "center", gap: 8, borderRadius: 14, borderWidth: 1, padding: 18 },
  messageText: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  retryBtn: { minHeight: 44, justifyContent: "center", paddingHorizontal: 20 },
  retryText: { color: "#E11D48", fontSize: 13, fontWeight: "800" },
});

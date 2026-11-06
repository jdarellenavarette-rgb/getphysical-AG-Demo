import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Bell, Plus, QrCode, Send, Wallet } from "lucide-react-native";
import { createEmptyState, createSuccessState, MIN_TOUCH_TARGET, type PassRow } from "sodia-core";
import { useColors } from "../../theme/theme";
import { TenStateView } from "../common/TenStateView";
import { ExactVIPCard } from "./ExactVIPCard";

interface CardsHubHeaderProps {
  firstName: string;
  activePass: PassRow | null;
  hasTransactions: boolean;
  onAdd: () => void;
  onGift: () => void;
  onPay: () => void;
  onViewAll: () => void;
  onOpenNotifications: () => void;
}

export function CardsHubHeader(p: CardsHubHeaderProps) {
  const colors = useColors();
  const passState = p.activePass ? createSuccessState<PassRow>(p.activePass) : createEmptyState<PassRow>("Day passes, court bookings and memberships live here — with a 60s rolling entry code that works offline.", "Add your first pass");
  const actions = [
    { key: "add", label: "Add", icon: Plus, onPress: p.onAdd, primary: false },
    { key: "gift", label: "Gift", icon: Send, onPress: p.onGift, primary: false },
    { key: "pay", label: "Scan to enter", icon: QrCode, onPress: p.onPay, primary: true },
  ] as const;

  return (
    <View>
      <View style={styles.greeting}>
        <View>
          <Text style={[styles.name, { color: colors.textPrimary }]} accessibilityRole="header">Wallet</Text>
          <Text style={[styles.handle, { color: colors.textMuted }]}>Hi {p.firstName} • VIP account</Text>
        </View>
        <TouchableOpacity onPress={p.onOpenNotifications} style={[styles.bell, { backgroundColor: colors.bgCardSecondary }]} accessibilityRole="button" accessibilityLabel="Notifications">
          <Bell size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardWrap}>
        <TenStateView state={passState} skeleton="card" emptyIcon={Wallet} emptyTitle="No passes yet" onPrimaryAction={p.onAdd} compact>
          {(pass) => <ExactVIPCard pass={pass} facilityName="Metro Core Arena" />}
        </TenStateView>
      </View>

      <View style={styles.actions}>
        {actions.map(({ key, label, icon: Icon, onPress, primary }) => (
          <TouchableOpacity
            key={key}
            onPress={onPress}
            accessibilityRole="button"
            style={[styles.pill, primary ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
          >
            <Icon size={16} color={primary ? colors.textOnAccent : colors.accentText} />
            <Text style={[styles.pillText, { color: primary ? colors.textOnAccent : colors.textPrimary }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.historyHead, { backgroundColor: colors.bgCard }]}>
        <Text style={[styles.historyTitle, { color: colors.textPrimary }]} accessibilityRole="header">Recent transactions</Text>
        {p.hasTransactions && (
          <TouchableOpacity onPress={p.onViewAll} style={styles.viewAll} accessibilityRole="button" accessibilityLabel="View statement of account">
            <Text style={[styles.viewAllText, { color: colors.accentText }]}>View all</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  name: { fontSize: 28, fontWeight: "900", letterSpacing: -0.5 },
  handle: { fontSize: 13, marginTop: 2, fontWeight: "600" },
  bell: { width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  cardWrap: { paddingHorizontal: 16, marginBottom: 8 },
  actions: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 18, gap: 10 },
  pill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, minHeight: MIN_TOUCH_TARGET + 4, borderRadius: 12 },
  pillText: { fontSize: 13, fontWeight: "800" },
  historyHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  historyTitle: { fontSize: 17, fontWeight: "900" },
  viewAll: { minHeight: MIN_TOUCH_TARGET, justifyContent: "center" },
  viewAllText: { fontSize: 13, fontWeight: "700" },
});

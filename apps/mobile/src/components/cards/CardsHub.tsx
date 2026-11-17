import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Plus, Wallet, ChevronRight, QrCode } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { ReceiptModal } from "./ReceiptModal";
import { StatementOfAccountModal } from "./StatementOfAccountModal";
import { TurnstileQRModal } from "./TurnstileQRModal";
import { AddMembershipChoiceModal } from "./AddMembershipChoiceModal";
import { QrScannerModal } from "./QrScannerModal";
import { useThemeStore } from "../../theme/theme";
import { EmptyState } from "../common/EmptyState";
import { haptics } from "../../lib/haptics";
import type { PassRow } from "sodia-core";
import { isPassUsable, passStatusLabel, passVenueName } from "../../lib/passDisplay";

interface CardsHubProps {
  onBrowseVenues?: () => void;
}

export function CardsHub({ onBrowseVenues }: CardsHubProps) {
  const { passes, facilities, purchases, setIsGuest } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [selectedPassForReceipt, setSelectedPassForReceipt] = useState<PassRow | null>(null);
  const [isSoaOpen, setIsSoaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isAddMembershipChoiceOpen, setIsAddMembershipChoiceOpen] = useState(false);
  const [isClubScannerOpen, setIsClubScannerOpen] = useState(false);

  // The card on top is the first pass that can still open a gate.
  const activePass = passes.find((p) => isPassUsable(p)) ?? passes[0] ?? null;
  const activeVenue = activePass ? passVenueName(activePass, facilities, purchases[activePass.id]) : "";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.userGreetingRow}>
        <View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>Wallet</Text>
          <Text style={[styles.userHandle, { color: colors.textMuted }]}>Your passes and memberships</Text>
        </View>
      </View>

      {!activePass ? (
        // Nothing to show yet: one clear way forward, plus the scanner for people handed a QR code.
        <>
          <EmptyState
            icon={Wallet}
            title="No passes yet"
            body="Buy a day pass or membership at a venue and your entry QR code will live here."
            actionLabel="Find a venue"
            onAction={onBrowseVenues}
          />
          <TouchableOpacity
            onPress={() => setIsClubScannerOpen(true)}
            style={styles.scanLink}
            accessibilityRole="button"
          >
            <QrCode size={16} color={colors.accent} />
            <Text style={[styles.scanLinkText, { color: colors.accent }]}>Scan a QR code to join</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.cardWrapper}>
            <ExactVIPCard pass={activePass} facilityName={activeVenue} />
          </View>

          <View style={styles.actionPillsRow}>
            <TouchableOpacity
              onPress={() => setIsAddMembershipChoiceOpen(true)}
              style={[styles.actionPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
              accessibilityRole="button"
            >
              <Plus size={16} color={colors.accent} />
              <Text style={[styles.actionPillText, { color: colors.textPrimary }]}>Add Pass</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                haptics.tap();
                setIsQrOpen(true);
              }}
              style={[styles.actionPill, styles.actionPillPrimary]}
              accessibilityRole="button"
            >
              <QrCode size={16} color="#FFFFFF" />
              <Text style={[styles.actionPillText, { color: "#FFFFFF" }]}>Show Entry QR</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.historySheet, { backgroundColor: colors.bgCard }]}>
            <View style={styles.historyHeader}>
              <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Your Passes</Text>
              <TouchableOpacity onPress={() => setIsSoaOpen(true)} accessibilityRole="button">
                <Text style={styles.viewAllText}>Statement</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.txList}>
              {passes.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  onPress={() => setSelectedPassForReceipt(p)}
                  style={[styles.txRow, { backgroundColor: colors.bgCardSecondary }]}
                  accessibilityRole="button"
                >
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={[styles.txName, { color: colors.textPrimary }]}>
                      {p.pass_type}
                    </Text>
                    <Text numberOfLines={1} style={[styles.txTime, { color: colors.textMuted }]}>
                      {passVenueName(p, facilities, purchases[p.id])}
                    </Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txStatus, !isPassUsable(p) && { color: colors.textMuted }]}>
                      {passStatusLabel(p)}
                    </Text>
                    <ChevronRight size={16} color={colors.textMuted} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      <ReceiptModal
        visible={!!selectedPassForReceipt}
        pass={selectedPassForReceipt}
        onClose={() => setSelectedPassForReceipt(null)}
      />
      <StatementOfAccountModal
        visible={isSoaOpen}
        passes={passes}
        onClose={() => setIsSoaOpen(false)}
        onSelectPass={(p) => {
          setIsSoaOpen(false);
          setSelectedPassForReceipt(p);
        }}
      />
      <TurnstileQRModal
        visible={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        facilityName={activeVenue}
        passId={activePass && isPassUsable(activePass) ? activePass.id : null}
        onSignIn={() => {
          setIsQrOpen(false);
          setIsGuest(false);
        }}
      />
      <AddMembershipChoiceModal
        visible={isAddMembershipChoiceOpen}
        onClose={() => setIsAddMembershipChoiceOpen(false)}
        onSelectBrowse={() => onBrowseVenues?.()}
        onSelectScan={() => setIsClubScannerOpen(true)}
      />
      <QrScannerModal visible={isClubScannerOpen} onClose={() => setIsClubScannerOpen(false)} title="Scan to join" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scanLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 44 },
  scanLinkText: { fontSize: 14, fontWeight: "700" },
  container: { flex: 1 },
  contentContainer: { paddingBottom: 110 },
  userGreetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  bellBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  userHandle: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  emptyCardContainer: { paddingHorizontal: 16, marginBottom: 16 },
  emptyCardDashed: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 210,
  },
  emptyCardTitle: { fontSize: 18, fontWeight: "800", marginTop: 12 },
  emptyCardDesc: { fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18, maxWidth: 280 },
  getPassButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E11D48",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    marginTop: 16,
  },
  getPassButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  actionPillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 18,
    gap: 10,
  },
  actionPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    paddingVertical: 11,
    borderRadius: 12,
  },
  actionPillPrimary: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  actionPillText: { fontSize: 12, fontWeight: "800" },
  historySheet: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 40,
    minHeight: 320,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  historyTitle: { fontSize: 17, fontWeight: "900" },
  viewAllText: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  emptyLedgerBox: { alignItems: "center", justifyContent: "center", paddingVertical: 32, paddingHorizontal: 20 },
  emptyLedgerTitle: { fontSize: 14, fontWeight: "800", marginTop: 10 },
  emptyLedgerSubtitle: { fontSize: 12, textAlign: "center", marginTop: 4, lineHeight: 18, maxWidth: 260 },
  txList: { gap: 8 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 12 },
  txName: { fontSize: 14, fontWeight: "800" },
  txTime: { fontSize: 11, marginTop: 2 },
  txRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  txStatus: { fontSize: 11, fontWeight: "800", color: "#10B981" },
  cardDetailSection: { marginTop: 22, borderTopWidth: 1, paddingTop: 16 },
  cardDetailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardDetailTitle: { fontSize: 15, fontWeight: "800" },
  copyRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  copyText: { fontSize: 11, fontWeight: "700" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 12 },
  detailValMono: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
});

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Plus, Wallet, Ticket, FileText, ChevronRight, Send, QrCode, Eye, EyeOff, Copy, Check, Bell } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { ReceiptModal } from "./ReceiptModal";
import { StatementOfAccountModal } from "./StatementOfAccountModal";
import { TurnstileQRModal } from "./TurnstileQRModal";
import { GiftPassModal } from "./GiftPassModal";
import { AddMembershipChoiceModal } from "./AddMembershipChoiceModal";
import { ClubQRScannerModal } from "./ClubQRScannerModal";
import { useThemeStore } from "../../theme/theme";
import type { PassRow } from "sodia-core";

interface CardsHubProps {
  onBrowseVenues?: () => void;
}

export function CardsHub({ onBrowseVenues }: CardsHubProps) {
  const { passes, profile } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [selectedPassForReceipt, setSelectedPassForReceipt] = useState<PassRow | null>(null);
  const [isSoaOpen, setIsSoaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isGiftOpen, setIsGiftOpen] = useState(false);
  const [isAddMembershipChoiceOpen, setIsAddMembershipChoiceOpen] = useState(false);
  const [isClubScannerOpen, setIsClubScannerOpen] = useState(false);
  const [showFullCardNum, setShowFullCardNum] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePass = passes[0] ?? null;

  const handleCopyCard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* USER GREETING */}
      <View style={styles.userGreetingRow}>
        <View>
          <Text style={[styles.userName, { color: colors.textPrimary }]}>Hello, {profile.first_name},</Text>
          <Text style={[styles.userHandle, { color: colors.textMuted }]}>VIP Account</Text>
        </View>
        <TouchableOpacity style={[styles.bellBtn, { backgroundColor: colors.bgCardSecondary }]}>
          <Bell size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* 3D VIP CARD STACK OR EMPTY CARD OUTLINE */}
      {activePass ? (
        <View style={styles.cardWrapper}>
          <ExactVIPCard pass={activePass} facilityName="Metro Core Arena" />
        </View>
      ) : (
        <View style={styles.emptyCardContainer}>
          <View style={[styles.emptyCardDashed, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <Wallet size={40} color="#EC4899" />
            <Text style={[styles.emptyCardTitle, { color: colors.textPrimary }]}>No Active Passes</Text>
            <Text style={[styles.emptyCardDesc, { color: colors.textSecondary }]}>
              Add a day pass, court booking, or VIP membership to unlock turnstiles with 60s dynamic TOTP.
            </Text>
            <TouchableOpacity onPress={() => setIsAddMembershipChoiceOpen(true)} style={styles.getPassButton}>
              <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.getPassButtonText}>+ Add Membership</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* QUICK ACTION PILLS (ADD, SEND/GIFT, PAY) */}
      <View style={styles.actionPillsRow}>
        <TouchableOpacity onPress={() => setIsAddMembershipChoiceOpen(true)} style={[styles.actionPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
          <Plus size={16} color="#EC4899" />
          <Text style={[styles.actionPillText, { color: colors.textPrimary }]}>+ Add</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsGiftOpen(true)} style={[styles.actionPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}>
          <Send size={15} color="#EC4899" />
          <Text style={[styles.actionPillText, { color: colors.textPrimary }]}>Send ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsQrOpen(true)} style={[styles.actionPill, styles.actionPillPrimary]}>
          <QrCode size={16} color="#FFFFFF" />
          <Text style={[styles.actionPillText, { color: "#FFFFFF" }]}>Pay ⛶</Text>
        </TouchableOpacity>
      </View>

      {/* RECENT TRANSACTIONS SHEET */}
      <View style={[styles.historySheet, { backgroundColor: colors.bgCard }]}>
        <View style={styles.historyHeader}>
          <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>Recent Transaction</Text>
          {passes.length > 0 && (
            <TouchableOpacity onPress={() => setIsSoaOpen(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {passes.length === 0 ? (
          <View style={styles.emptyLedgerBox}>
            <Ticket size={28} color={colors.textMuted} />
            <Text style={[styles.emptyLedgerTitle, { color: colors.textPrimary }]}>No transactions recorded</Text>
            <Text style={[styles.emptyLedgerSubtitle, { color: colors.textMuted }]}>
              Purchases, passes, and statements will automatically record here.
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {passes.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPassForReceipt(p)}
                style={[styles.txRow, { backgroundColor: colors.bgCardSecondary }]}
              >
                <View>
                  <Text style={[styles.txName, { color: colors.textPrimary }]}>{p.pass_type}</Text>
                  <Text style={[styles.txTime, { color: colors.textMuted }]}>Metro Core Arena • Turnstile Valid</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txStatus}>ACTIVE</Text>
                  <ChevronRight size={16} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CARD NUMBER METADATA */}
        <View style={[styles.cardDetailSection, { borderTopColor: colors.borderColor }]}>
          <View style={styles.cardDetailHeader}>
            <Text style={[styles.cardDetailTitle, { color: colors.textPrimary }]}>Card Details</Text>
            <TouchableOpacity onPress={handleCopyCard} style={styles.copyRow}>
              {copied ? <Check size={13} color="#10B981" /> : <Copy size={13} color={colors.textMuted} />}
              <Text style={[styles.copyText, { color: copied ? "#10B981" : colors.textMuted }]}>{copied ? "Copied" : "Copy ID"}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.detailRow, { borderBottomColor: colors.borderColor }]}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Digital Pass ID</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={[styles.detailValMono, { color: colors.textPrimary }]}>
                {showFullCardNum ? "4912 • 8820 • 3014 • 9901" : "•••• •••• •••• 9901"}
              </Text>
              <TouchableOpacity onPress={() => setShowFullCardNum(!showFullCardNum)}>
                {showFullCardNum ? <EyeOff size={15} color={colors.textMuted} /> : <Eye size={15} color={colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ReceiptModal visible={!!selectedPassForReceipt} pass={selectedPassForReceipt} onClose={() => setSelectedPassForReceipt(null)} />
      <StatementOfAccountModal visible={isSoaOpen} passes={passes} onClose={() => setIsSoaOpen(false)} onSelectPass={(p) => { setIsSoaOpen(false); setSelectedPassForReceipt(p); }} />
      <TurnstileQRModal visible={isQrOpen} onClose={() => setIsQrOpen(false)} facilityName="Metro Core Arena" />
      <GiftPassModal visible={isGiftOpen} passes={passes} onClose={() => setIsGiftOpen(false)} onSendPass={(passId, rec, msg) => { setIsGiftOpen(false); }} />
      <AddMembershipChoiceModal
        visible={isAddMembershipChoiceOpen}
        onClose={() => setIsAddMembershipChoiceOpen(false)}
        onSelectBrowse={() => onBrowseVenues?.()}
        onSelectScan={() => setIsClubScannerOpen(true)}
      />
      <ClubQRScannerModal visible={isClubScannerOpen} onClose={() => setIsClubScannerOpen(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { paddingBottom: 110 },
  userGreetingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 24, fontWeight: "900", letterSpacing: -0.5 },
  userHandle: { fontSize: 12, marginTop: 2, fontWeight: "600" },
  cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  emptyCardContainer: { paddingHorizontal: 16, marginBottom: 16 },
  emptyCardDashed: { borderWidth: 2, borderStyle: "dashed", borderRadius: 20, padding: 28, alignItems: "center", justifyContent: "center", minHeight: 210 },
  emptyCardTitle: { fontSize: 18, fontWeight: "800", marginTop: 12 },
  emptyCardDesc: { fontSize: 12, textAlign: "center", marginTop: 6, lineHeight: 18, maxWidth: 280 },
  getPassButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#EC4899", paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, marginTop: 16 },
  getPassButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  actionPillsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 18, gap: 10 },
  actionPill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderWidth: 1, paddingVertical: 11, borderRadius: 12 },
  actionPillPrimary: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  actionPillText: { fontSize: 12, fontWeight: "800" },
  historySheet: { borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 40, minHeight: 320 },
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
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12 },
  detailValMono: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
});

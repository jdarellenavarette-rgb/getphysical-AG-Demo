import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { Plus, Wallet, Ticket, FileText, ChevronRight, Send, QrCode, Eye, EyeOff, Copy, Check, Bell } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { ReceiptModal } from "./ReceiptModal";
import { StatementOfAccountModal } from "./StatementOfAccountModal";
import { TurnstileQRModal } from "./TurnstileQRModal";
import type { PassRow } from "sodia-core";

interface CardsHubProps {
  onBrowseVenues?: () => void;
}

export function CardsHub({ onBrowseVenues }: CardsHubProps) {
  const { passes, profile } = useEcosystemStore();
  const [selectedPassForReceipt, setSelectedPassForReceipt] = useState<PassRow | null>(null);
  const [isSoaOpen, setIsSoaOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [showFullCardNum, setShowFullCardNum] = useState(false);
  const [copied, setCopied] = useState(false);

  const activePass = passes[0] ?? null;

  const handleCopyCard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* USER GREETING */}
      <View style={styles.userGreetingRow}>
        <View>
          <Text style={styles.userName}>Hello, {profile.first_name},</Text>
          <Text style={styles.userHandle}>VIP Account</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Bell size={20} color="#FAFAFA" />
        </TouchableOpacity>
      </View>

      {/* 3D VIP CARD STACK OR EMPTY CARD OUTLINE */}
      {activePass ? (
        <View style={styles.cardWrapper}>
          <ExactVIPCard pass={activePass} facilityName="Metro Core Arena" />
        </View>
      ) : (
        <View style={styles.emptyCardContainer}>
          <View style={styles.emptyCardDashed}>
            <Wallet size={40} color="#EC4899" />
            <Text style={styles.emptyCardTitle}>No Active Passes</Text>
            <Text style={styles.emptyCardDesc}>
              Add a day pass, court booking, or VIP membership to unlock turnstiles with 60s dynamic TOTP.
            </Text>
            {onBrowseVenues && (
              <TouchableOpacity onPress={onBrowseVenues} style={styles.getPassButton}>
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.getPassButtonText}>Browse Venues</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* QUICK ACTION PILLS (INSPIRATION PHOTO 2: ADD, SEND, PAY) */}
      <View style={styles.actionPillsRow}>
        <TouchableOpacity onPress={onBrowseVenues} style={styles.actionPill}>
          <Plus size={16} color="#EC4899" />
          <Text style={styles.actionPillText}>Add +</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSoaOpen(true)} style={styles.actionPill}>
          <Send size={15} color="#EC4899" />
          <Text style={styles.actionPillText}>Send ↗</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsQrOpen(true)} style={[styles.actionPill, styles.actionPillPrimary]}>
          <QrCode size={16} color="#FFFFFF" />
          <Text style={[styles.actionPillText, { color: "#FFFFFF" }]}>Pay ⛶</Text>
        </TouchableOpacity>
      </View>

      {/* PURE WHITE CURVED SHEET: RECENT TRANSACTIONS & CARD DETAILS */}
      <View style={styles.historySheet}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Recent Transaction</Text>
          {passes.length > 0 && (
            <TouchableOpacity onPress={() => setIsSoaOpen(true)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {passes.length === 0 ? (
          <View style={styles.emptyLedgerBox}>
            <Ticket size={28} color="#A1A1AA" />
            <Text style={styles.emptyLedgerTitle}>No transactions recorded</Text>
            <Text style={styles.emptyLedgerSubtitle}>
              Check-ins, drop-in receipts, and memberships will appear on your immutable ledger here.
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {passes.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPassForReceipt(p)}
                style={styles.txRow}
              >
                <View>
                  <Text style={styles.txName}>₱265.00</Text>
                  <Text style={styles.txTime}>{p.pass_type} • Metro Core Arena</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txStatus}>{p.status.toUpperCase()}</Text>
                  <ChevronRight size={14} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* CARD DETAIL CREDENTIALS (INSPIRATION PHOTO 2) */}
        <View style={styles.cardDetailSection}>
          <View style={styles.cardDetailHeader}>
            <Text style={styles.cardDetailTitle}>Card Detail</Text>
            <TouchableOpacity onPress={handleCopyCard} style={styles.copyRow}>
              {copied ? <Check size={12} color="#10B981" /> : <Copy size={12} color="#71717A" />}
              <Text style={[styles.copyText, copied && { color: "#10B981" }]}>
                {copied ? "Copied" : "Copy"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Holder Name</Text>
            <Text style={styles.detailVal}>{profile.name ?? "Adam Arête"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Card Number</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.detailValMono}>
                {showFullCardNum ? "2781 8191 6671 3160" : "2781 •••• •••• 3160"}
              </Text>
              <TouchableOpacity onPress={() => setShowFullCardNum(!showFullCardNum)}>
                {showFullCardNum ? <EyeOff size={15} color="#71717A" /> : <Eye size={15} color="#71717A" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        visible={!!selectedPassForReceipt}
        pass={selectedPassForReceipt}
        onClose={() => setSelectedPassForReceipt(null)}
      />

      {/* STATEMENT OF ACCOUNT MODAL */}
      <StatementOfAccountModal
        visible={isSoaOpen}
        passes={passes}
        onClose={() => setIsSoaOpen(false)}
        onSelectPass={(p) => {
          setIsSoaOpen(false);
          setSelectedPassForReceipt(p);
        }}
      />

      {/* DYNAMIC TURNSTILE QR MODAL */}
      <TurnstileQRModal
        visible={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        facilityName="Metro Core Arena"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  contentContainer: { paddingBottom: 110 },
  userGreetingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  bellBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#18181B", alignItems: "center", justifyContent: "center" },
  userName: { fontSize: 24, fontWeight: "900", color: "#FAFAFA", letterSpacing: -0.5 },
  userHandle: { fontSize: 12, color: "#8E8E93", marginTop: 2, fontWeight: "600" },
  cardWrapper: { paddingHorizontal: 16, marginBottom: 12 },
  emptyCardContainer: { paddingHorizontal: 16, marginBottom: 16 },
  emptyCardDashed: {
    borderWidth: 2, borderColor: "rgba(236, 72, 153, 0.4)", borderStyle: "dashed", borderRadius: 20,
    backgroundColor: "rgba(24, 24, 27, 0.7)", padding: 28, alignItems: "center", justifyContent: "center", minHeight: 210,
  },
  emptyCardTitle: { fontSize: 18, fontWeight: "800", color: "#FAFAFA", marginTop: 12 },
  emptyCardDesc: { fontSize: 12, color: "#A1A1AA", textAlign: "center", marginTop: 6, lineHeight: 18, maxWidth: 280 },
  getPassButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#EC4899", paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 999, marginTop: 16,
  },
  getPassButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "800" },
  actionPillsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 18, gap: 10 },
  actionPill: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#18181B", borderWidth: 1, borderColor: "#27272A", paddingVertical: 11, borderRadius: 12 },
  actionPillPrimary: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  actionPillText: { color: "#FAFAFA", fontSize: 12, fontWeight: "800" },
  historySheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 20, paddingTop: 22,
    paddingBottom: 40, minHeight: 320,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  historyTitle: { fontSize: 17, fontWeight: "900", color: "#000000" },
  viewAllText: { color: "#E11D48", fontSize: 12, fontWeight: "700" },
  emptyLedgerBox: { alignItems: "center", justifyContent: "center", paddingVertical: 32, paddingHorizontal: 20 },
  emptyLedgerTitle: { fontSize: 14, fontWeight: "800", color: "#18181B", marginTop: 10 },
  emptyLedgerSubtitle: { fontSize: 12, color: "#71717A", textAlign: "center", marginTop: 4, lineHeight: 18, maxWidth: 260 },
  txList: { gap: 8 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#F4F4F5", borderRadius: 12 },
  txName: { fontSize: 14, fontWeight: "800", color: "#000000" },
  txTime: { fontSize: 11, color: "#71717A", marginTop: 2 },
  txRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  txStatus: { fontSize: 11, fontWeight: "800", color: "#10B981" },
  cardDetailSection: { marginTop: 22, borderTopWidth: 1, borderTopColor: "#E4E4E7", paddingTop: 16 },
  cardDetailHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardDetailTitle: { fontSize: 15, fontWeight: "800", color: "#000000" },
  copyRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  copyText: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F4F4F5" },
  detailLabel: { fontSize: 12, color: "#71717A" },
  detailVal: { fontSize: 13, fontWeight: "700", color: "#18181B" },
  detailValMono: { fontSize: 13, fontWeight: "800", color: "#18181B", letterSpacing: 0.5 },
});
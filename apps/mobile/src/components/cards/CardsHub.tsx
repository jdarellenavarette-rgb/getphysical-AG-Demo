import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { Plus, Wallet, Ticket, FileText, ChevronRight } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { ReceiptModal } from "./ReceiptModal";
import { StatementOfAccountModal } from "./StatementOfAccountModal";
import type { PassRow } from "sodia-core";

interface CardsHubProps {
  onBrowseVenues?: () => void;
}

export function CardsHub({ onBrowseVenues }: CardsHubProps) {
  const { passes, profile } = useEcosystemStore();
  const [selectedPassForReceipt, setSelectedPassForReceipt] = useState<PassRow | null>(null);
  const [isSoaOpen, setIsSoaOpen] = useState(false);

  const activePass = passes[0] ?? null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* USER GREETING: AVATAR + ADAM ARÊTE */}
      <View style={styles.userGreetingRow}>
        <Image
          source={{ uri: profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
          style={styles.userAvatar}
        />
        <View>
          <Text style={styles.userName}>{profile.name ?? "Adam Arête"}</Text>
          <Text style={styles.userHandle}>@{profile.username} • Athlete</Text>
        </View>
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

      {/* PURE WHITE CURVED SHEET: TRANSACTION HISTORY */}
      <View style={styles.historySheet}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Transaction History</Text>
          {passes.length > 0 && (
            <TouchableOpacity onPress={() => setIsSoaOpen(true)} style={styles.soaBtn}>
              <FileText size={12} color="#E11D48" />
              <Text style={styles.soaBtnText}>View SOA</Text>
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
                  <Text style={styles.txName}>{p.pass_type}</Text>
                  <Text style={styles.txTime}>Valid Until: {new Date(p.valid_until).toLocaleDateString()}</Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={styles.txStatus}>{p.status.toUpperCase()}</Text>
                  <ChevronRight size={14} color="#A1A1AA" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  contentContainer: { paddingBottom: 100 },
  userGreetingRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 14 },
  userAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "#EC4899" },
  userName: { fontSize: 22, fontWeight: "900", color: "#FAFAFA", letterSpacing: -0.3 },
  userHandle: { fontSize: 11, color: "#A1A1AA", marginTop: 1 },
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
  historySheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 20, paddingTop: 20,
    paddingBottom: 40, minHeight: 320,
  },
  historyHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  historyTitle: { fontSize: 17, fontWeight: "900", color: "#000000" },
  soaBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#FFF1F2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  soaBtnText: { color: "#E11D48", fontSize: 11, fontWeight: "700" },
  emptyLedgerBox: { alignItems: "center", justifyContent: "center", paddingVertical: 36, paddingHorizontal: 20 },
  emptyLedgerTitle: { fontSize: 14, fontWeight: "800", color: "#18181B", marginTop: 10 },
  emptyLedgerSubtitle: { fontSize: 12, color: "#71717A", textAlign: "center", marginTop: 4, lineHeight: 18, maxWidth: 260 },
  txList: { gap: 10 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#F4F4F5", borderRadius: 12 },
  txName: { fontSize: 13, fontWeight: "800", color: "#000000" },
  txTime: { fontSize: 11, color: "#71717A", marginTop: 2 },
  txRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  txStatus: { fontSize: 11, fontWeight: "800", color: "#EC4899" },
});
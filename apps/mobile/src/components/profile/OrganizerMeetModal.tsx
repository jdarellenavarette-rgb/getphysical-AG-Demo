import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users, Clock, Trophy, CheckCircle2, Flame, Shield, ArrowLeft, Sparkles } from "lucide-react-native";
import { REGISTRY_HARD_LIMITS } from "sodia-core";

interface OrganizerMeetModalProps { visible: boolean; onClose: () => void; }
interface RosterPlayer { id: string; name: string; dupr: string; paidStatus: "AUTO_PAID_SPLIT" | "HOLD_180S"; gateCheckedIn: boolean; kudosGiven: boolean; }

const INITIAL_ROSTER: RosterPlayer[] = [
  { id: "p1", name: "Marco Villanueva", dupr: "3.75", paidStatus: "AUTO_PAID_SPLIT", gateCheckedIn: true, kudosGiven: false },
  { id: "p2", name: "tina.smash", dupr: "3.50", paidStatus: "AUTO_PAID_SPLIT", gateCheckedIn: true, kudosGiven: true },
  { id: "p3", name: "Enzo Lorenzo", dupr: "3.85", paidStatus: "AUTO_PAID_SPLIT", gateCheckedIn: true, kudosGiven: false },
  { id: "p4", name: "Bianca Santos", dupr: "3.40", paidStatus: "HOLD_180S", gateCheckedIn: false, kudosGiven: false },
];

const INITIAL_WAITLIST = [
  { id: "w1", name: "Kevin Tan", dupr: "3.60", position: 1, claimActive: false },
  { id: "w2", name: "Sarah Chen", dupr: "3.55", position: 2, claimActive: false },
];

export function OrganizerMeetModal({ visible, onClose }: OrganizerMeetModalProps) {
  const insets = useSafeAreaInsets();
  const [subTab, setSubTab] = useState<"roster" | "waitlist" | "courts">("roster");
  const [roster, setRoster] = useState<RosterPlayer[]>(INITIAL_ROSTER);
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);
  const [courtAScore, setCourtAScore] = useState({ a: 11, b: 8, finalized: false });

  const toggleKudos = (id: string) => setRoster((prev) => prev.map((p) => (p.id === id ? { ...p, kudosGiven: !p.kudosGiven } : p)));
  const triggerWaitlistClaim = (id: string) => setWaitlist((prev) => prev.map((w) => (w.id === id ? { ...w, claimActive: true } : w)));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP HEADER WITH SAFE NOTCH PADDING */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10 }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#FAFAFA" />
            <Text style={styles.backText}>Profile</Text>
          </TouchableOpacity>
          <View style={styles.rolePill}>
            <Sparkles size={12} color="#10B981" />
            <Text style={styles.rolePillText}>CLUBDASH ORGANIZER PRO</Text>
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          {/* RECLUB-STYLE MEET BANNER + VENUE AFFILIATION */}
          <View style={styles.meetCard}>
            <View style={styles.meetBadgeRow}>
              <Text style={styles.sportTag}>PICKLEBALL OPEN PLAY • DUPR 3.4 - 4.0</Text>
              <Text style={styles.slotCount}>24 / 24 FULL</Text>
            </View>
            <Text style={styles.meetTitle}>Thursday Night BGC Dink & Drive</Text>
            <Text style={styles.venueSub}>
              Affiliated Venue: Nexus Club — Courts A, B, C (6:00 PM – 9:00 PM)
            </Text>

            {/* SPLIT LEDGER ADVANTAGE OVER RECLUB */}
            <View style={styles.splitLedgerBox}>
              <Shield size={14} color="#10B981" />
              <Text style={styles.splitLedgerText}>
                ₱350/head (+₱15 fee) • Auto-Split Ledger: ₱150 to Venue / ₱200 Net to Organizer (0 manual GCash screenshots)
              </Text>
            </View>
          </View>

          {/* 3-TAB SWITCHER: ROSTER | WAITLIST | LIVE COURTS */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              onPress={() => setSubTab("roster")}
              style={[styles.tabBtn, subTab === "roster" && styles.tabBtnActive]}
            >
              <Users size={13} color={subTab === "roster" ? "#FFFFFF" : "#A1A1AA"} />
              <Text style={[styles.tabText, subTab === "roster" && styles.tabTextActive]}>
                Confirmed (24)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSubTab("waitlist")}
              style={[styles.tabBtn, subTab === "waitlist" && styles.tabBtnActive]}
            >
              <Clock size={13} color={subTab === "waitlist" ? "#FFFFFF" : "#A1A1AA"} />
              <Text style={[styles.tabText, subTab === "waitlist" && styles.tabTextActive]}>
                Waitlist ({waitlist.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSubTab("courts")}
              style={[styles.tabBtn, subTab === "courts" && styles.tabBtnActive]}
            >
              <Trophy size={13} color={subTab === "courts" ? "#FFFFFF" : "#A1A1AA"} />
              <Text style={[styles.tabText, subTab === "courts" && styles.tabTextActive]}>
                Courts & Kudos
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: CONFIRMED ROSTER */}
          {subTab === "roster" && (
            <View style={styles.sectionList}>
              {roster.map((player) => (
                <View key={player.id} style={styles.playerRow}>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={styles.playerName}>{player.name}</Text>
                      <View style={styles.duprBadge}>
                        <Text style={styles.duprText}>DUPR {player.dupr}</Text>
                      </View>
                    </View>
                    <Text style={styles.playerSub}>
                      {player.paidStatus === "AUTO_PAID_SPLIT"
                        ? "✓ Auto-Paid via Sodia Split"
                        : `⏳ Checkout Lock (${REGISTRY_HARD_LIMITS.INVENTORY_PESSIMISTIC_LOCK_SECONDS}s)`}
                      {" • "}
                      {player.gateCheckedIn ? "Scanned at Turnstile" : "Not at Venue Yet"}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => toggleKudos(player.id)}
                    style={[styles.kudosBtn, player.kudosGiven && styles.kudosBtnActive]}
                  >
                    <Flame size={13} color={player.kudosGiven ? "#F59E0B" : "#A1A1AA"} />
                    <Text style={[styles.kudosText, player.kudosGiven && { color: "#F59E0B" }]}>
                      {player.kudosGiven ? "Kudos Sent" : "Kudos"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* TAB 2: WAITLIST (15-MINUTE EXCLUSIVE CLAIM) */}
          {subTab === "waitlist" && (
            <View style={styles.sectionList}>
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  Spec Rule: Dropping a slot grants #1 on the waitlist an exclusive{" "}
                  {REGISTRY_HARD_LIMITS.WAITLIST_EXCLUSIVE_CLAIM_MINUTES}-minute checkout claim window.
                </Text>
              </View>
              {waitlist.map((w) => (
                <View key={w.id} style={styles.playerRow}>
                  <View>
                    <Text style={styles.playerName}>
                      #{w.position} {w.name} (DUPR {w.dupr})
                    </Text>
                    <Text style={styles.playerSub}>
                      {w.claimActive ? "⚡ 15:00 Exclusive Claim Push Sent" : "Waiting for open slot"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    disabled={w.claimActive}
                    onPress={() => triggerWaitlistClaim(w.id)}
                    style={[styles.claimBtn, w.claimActive && { backgroundColor: "#27272A" }]}
                  >
                    <Text style={styles.claimBtnText}>
                      {w.claimActive ? "Claim Active" : "Offer Slot (15m)"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* TAB 3: LIVE COURT ROTATOR & MATCH STAMPS */}
          {subTab === "courts" && (
            <View style={styles.sectionList}>
              <View style={styles.courtCard}>
                <View style={styles.courtHeader}>
                  <Text style={styles.courtTitle}>COURT A • ROUND ROBIN ROTATION #4</Text>
                  <Text style={styles.courtLiveBadge}>
                    {courtAScore.finalized ? "STAMPED TO SODIA" : "IN PROGRESS"}
                  </Text>
                </View>
                <Text style={styles.matchupText}>
                  Marco V. / Tina S. ({courtAScore.a}) vs Enzo L. / Bianca S. ({courtAScore.b})
                </Text>
                <TouchableOpacity
                  onPress={() => setCourtAScore((s) => ({ ...s, finalized: true }))}
                  style={[styles.stampBtn, courtAScore.finalized && { backgroundColor: "#10B981" }]}
                >
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.stampBtnText}>
                    {courtAScore.finalized
                      ? "Verified Match Stamp Pushed to Players' Profiles"
                      : "Finalize Score & Mint Verified Court Stamp"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { color: "#FAFAFA", fontSize: 14, fontWeight: "700" },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rolePillText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  body: { flex: 1, padding: 16 },
  meetCard: { backgroundColor: "#121215", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "#27272A" },
  meetBadgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sportTag: { color: "#38BDF8", fontSize: 10, fontWeight: "800" },
  slotCount: { color: "#F59E0B", fontSize: 11, fontWeight: "800" },
  meetTitle: { color: "#FAFAFA", fontSize: 18, fontWeight: "900", marginTop: 6 },
  venueSub: { color: "#A1A1AA", fontSize: 12, marginTop: 4 },
  splitLedgerBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#18181B", padding: 10, borderRadius: 8, marginTop: 12 },
  splitLedgerText: { color: "#D4D4D8", fontSize: 11, flex: 1, lineHeight: 16 },
  tabRow: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 12 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: "#18181B", paddingVertical: 10, borderRadius: 10 },
  tabBtnActive: { backgroundColor: "#E11D48" },
  tabText: { color: "#A1A1AA", fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF" },
  sectionList: { gap: 10, paddingBottom: 30 },
  playerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#121215", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#27272A" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  playerName: { color: "#FAFAFA", fontSize: 14, fontWeight: "700" },
  duprBadge: { backgroundColor: "#27272A", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  duprText: { color: "#38BDF8", fontSize: 10, fontWeight: "700" },
  playerSub: { color: "#71717A", fontSize: 11, marginTop: 4 },
  kudosBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#18181B", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: "#27272A" },
  kudosBtnActive: { borderColor: "#F59E0B", backgroundColor: "rgba(245,158,11,0.1)" },
  kudosText: { color: "#A1A1AA", fontSize: 11, fontWeight: "700" },
  infoBanner: { backgroundColor: "rgba(56,189,248,0.1)", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  infoBannerText: { color: "#7DD3FC", fontSize: 11, lineHeight: 16 },
  claimBtn: { backgroundColor: "#0284C7", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  claimBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  courtCard: { backgroundColor: "#121215", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#27272A" },
  courtHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  courtTitle: { color: "#A1A1AA", fontSize: 11, fontWeight: "800" },
  courtLiveBadge: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  matchupText: { color: "#FAFAFA", fontSize: 14, fontWeight: "800", marginBottom: 12 },
  stampBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#E11D48", paddingVertical: 10, borderRadius: 8 },
  stampBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});

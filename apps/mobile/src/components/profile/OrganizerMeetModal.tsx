import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { AppModal } from "../common/AppModal";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Users, Clock, Trophy, CheckCircle2, Flame, Shield, ArrowLeft, Sparkles } from "lucide-react-native";
import { useThemeStore } from "../../theme/theme";

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
  const { colors } = useThemeStore();
  const [subTab, setSubTab] = useState<"roster" | "waitlist" | "courts">("roster");
  const [roster, setRoster] = useState<RosterPlayer[]>(INITIAL_ROSTER);
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST);
  const [courtAScore, setCourtAScore] = useState({ a: 11, b: 8, finalized: false });

  const toggleKudos = (id: string) => setRoster((prev) => prev.map((p) => (p.id === id ? { ...p, kudosGiven: !p.kudosGiven } : p)));
  const triggerWaitlistClaim = (id: string) => setWaitlist((prev) => prev.map((w) => (w.id === id ? { ...w, claimActive: true } : w)));

  type OrganizerItem =
    | { kind: "player"; id: string; player: (typeof roster)[number] }
    | { kind: "wait"; id: string; entry: (typeof waitlist)[number] };
  const items: OrganizerItem[] =
    subTab === "roster"
      ? roster.map((player): OrganizerItem => ({ kind: "player", id: player.id, player }))
      : subTab === "waitlist"
        ? waitlist.map((entry): OrganizerItem => ({ kind: "wait", id: entry.id, entry }))
        : [];

  return (
    <AppModal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.bgScreen }]}>
        {/* TOP HEADER WITH SAFE NOTCH PADDING */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10, backgroundColor: colors.bgHeader, borderBottomColor: colors.borderColor }]}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.backBtn}>
            <ArrowLeft size={20} color={colors.textPrimary} />
            <Text style={[styles.backText, { color: colors.textPrimary }]}>Profile</Text>
          </TouchableOpacity>
          <View style={styles.rolePill}>
            <Sparkles size={12} color={colors.accentGreen} />
            <Text style={styles.rolePillText}>CLUBDASH ORGANIZER PRO</Text>
          </View>
        </View>

        <FlashList
          key={subTab}
          data={items}
          keyExtractor={(it) => it.id}
          getItemType={(it) => it.kind}
          style={styles.body}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          ListHeaderComponent={
            <View>
          {/* TOURNAMENT SUMMARY CARD */}
          <View style={[styles.meetCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
            <View style={styles.meetBadgeRow}>
              <Text style={styles.sportTag}>PICKLEBALL 3.5+ OPEN PLAY</Text>
              <Text style={styles.slotCount}>12 / 16 SLOTS CONFIRMED</Text>
            </View>
            <Text style={[styles.meetTitle, { color: colors.textPrimary }]}>Sunset Doubles Ladder (Court A & B)</Text>
            <Text style={[styles.venueSub, { color: colors.textMuted }]}>Twins Fitness Court Club • Sat, 4:00 PM</Text>
            <View style={[styles.splitLedgerBox, { backgroundColor: colors.bgCardSecondary }]}>
              <Shield size={14} color={colors.accentGreen} />
              <Text style={[styles.splitLedgerText, { color: colors.textSecondary }]}>Escrow Active: ₱150/player fee collected automatically via Sodia Split.</Text>
            </View>
          </View>

          {/* 3-SEGMENT SUB TABS */}
          <View style={styles.tabRow}>
            {(["roster", "waitlist", "courts"] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setSubTab(tab)}
                style={[styles.tabBtn, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, subTab === tab && styles.tabBtnActive]}
              >
                {tab === "roster" && <Users size={12} color={subTab === "roster" ? "#FFFFFF" : colors.textMuted} />}
                {tab === "waitlist" && <Clock size={12} color={subTab === "waitlist" ? "#FFFFFF" : colors.textMuted} />}
                {tab === "courts" && <Trophy size={12} color={subTab === "courts" ? "#FFFFFF" : colors.textMuted} />}
                <Text style={[styles.tabText, { color: colors.textMuted }, subTab === tab && styles.tabTextActive]}>
                  {tab === "roster" ? `Roster (${roster.length})` : tab === "waitlist" ? `Waitlist (${waitlist.length})` : "Live Courts"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

              {subTab === "waitlist" ? (
  <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>180s Auto-Drop Rule: When a slot opens, waitlist #1 has 3 minutes to confirm before passing to #2.</Text>
              </View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            <View>
          {/* TAB 3: LIVE COURTS */}
          {subTab === "courts" && (
            <View style={styles.sectionList}>
              <View style={[styles.courtCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                <View style={styles.courtHeader}>
                  <Text style={[styles.courtTitle, { color: colors.textMuted }]}>COURT A • GAME 1 (FINAL)</Text>
                  <Text style={styles.courtLiveBadge}>{courtAScore.finalized ? "OFFICIAL" : "LIVE"}</Text>
                </View>
                <Text style={[styles.matchupText, { color: colors.textPrimary }]}>Marco & Tina ({courtAScore.a}) vs Enzo & Bianca ({courtAScore.b})</Text>
                <TouchableOpacity onPress={() => setCourtAScore((p) => ({ ...p, finalized: true }))} disabled={courtAScore.finalized} style={[styles.stampBtn, courtAScore.finalized && { backgroundColor: colors.accentGreen }]}>
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.stampBtnText}>{courtAScore.finalized ? "Scores Synced to DUPR Roster" : "Sign Off & Post Results"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
            </View>
          }
          renderItem={({ item }) => {
            if (item.kind === "player") {
              const player = item.player;
              return (
                <View style={[styles.playerRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                  <View>
                    <View style={styles.nameRow}>
                      <Text style={[styles.playerName, { color: colors.textPrimary }]}>{player.name}</Text>
                      <View style={[styles.duprBadge, { backgroundColor: colors.bgInput }]}>
                        <Text style={styles.duprText}>DUPR {player.dupr}</Text>
                      </View>
                    </View>
                    <Text style={[styles.playerSub, { color: colors.textMuted }]}>
                      {player.gateCheckedIn ? "✓ Checked in at Gate" : "Hold reserved"} • {player.paidStatus}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleKudos(player.id)} style={[styles.kudosBtn, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, player.kudosGiven && styles.kudosBtnActive]}>
                    <Flame size={12} color={player.kudosGiven ? colors.warning : colors.textMuted} />
                    <Text style={[styles.kudosText, { color: colors.textMuted }, player.kudosGiven && { color: colors.warning }]}>
                      {player.kudosGiven ? "Hyped" : "Hype"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }
            const w = item.entry;
            return (
                <View style={[styles.playerRow, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
                  <View>
                    <Text style={[styles.playerName, { color: colors.textPrimary }]}>#{w.position} • {w.name}</Text>
                    <Text style={[styles.playerSub, { color: colors.textMuted }]}>DUPR {w.dupr} • {w.claimActive ? "Claim link active (180s)" : "Standing by"}</Text>
                  </View>
                  <TouchableOpacity onPress={() => triggerWaitlistClaim(w.id)} style={[styles.claimBtn, w.claimActive && { backgroundColor: colors.accentGreen }]}>
                    <Text style={styles.claimBtnText}>{w.claimActive ? "Pinged ✓" : "Call Up"}</Text>
                  </TouchableOpacity>
                </View>
            );
          }}
        />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  backText: { fontSize: 14, fontWeight: "700" },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(16,185,129,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  rolePillText: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  body: { flex: 1, padding: 16 },
  meetCard: { borderRadius: 14, padding: 16, borderWidth: 1 },
  meetBadgeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sportTag: { color: "#38BDF8", fontSize: 11, fontWeight: "800" },
  slotCount: { color: "#F59E0B", fontSize: 11, fontWeight: "800" },
  meetTitle: { fontSize: 18, fontWeight: "900", marginTop: 6 },
  venueSub: { fontSize: 12, marginTop: 4 },
  splitLedgerBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8, marginTop: 12 },
  splitLedgerText: { fontSize: 11, flex: 1, lineHeight: 16 },
  tabRow: { flexDirection: "row", gap: 8, marginTop: 16, marginBottom: 12 },
  tabBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  tabBtnActive: { backgroundColor: "#E11D48", borderColor: "#E11D48" },
  tabText: { fontSize: 11, fontWeight: "700" },
  tabTextActive: { color: "#FFFFFF" },
  sectionList: { gap: 10, paddingBottom: 30 },
  playerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, borderRadius: 10, borderWidth: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  playerName: { fontSize: 14, fontWeight: "700" },
  duprBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  duprText: { color: "#38BDF8", fontSize: 11, fontWeight: "700" },
  playerSub: { fontSize: 11, marginTop: 4 },
  kudosBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  kudosBtnActive: { borderColor: "#F59E0B", backgroundColor: "rgba(245,158,11,0.1)" },
  kudosText: { fontSize: 11, fontWeight: "700" },
  infoBanner: { backgroundColor: "rgba(56,189,248,0.1)", padding: 10, borderRadius: 8, borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  infoBannerText: { color: "#7DD3FC", fontSize: 11, lineHeight: 16 },
  claimBtn: { backgroundColor: "#0284C7", paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  claimBtnText: { color: "#FFFFFF", fontSize: 11, fontWeight: "700" },
  courtCard: { padding: 14, borderRadius: 12, borderWidth: 1 },
  courtHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  courtTitle: { fontSize: 11, fontWeight: "800" },
  courtLiveBadge: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  matchupText: { fontSize: 14, fontWeight: "800", marginBottom: 12 },
  stampBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: "#E11D48", paddingVertical: 10, borderRadius: 8 },
  stampBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
});

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from "react-native";
import { MapPin, Coins, Ticket } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { TenStateView } from "../common/TenStateView";
import { createSuccessState } from "sodia-core";

export function CardsHub() {
  const { passes, profile, isOffline } = useEcosystemStore();
  const [selectedPassIndex] = useState(0);

  const activePass = passes[selectedPassIndex] ?? passes[0];

  const passesState = isOffline
    ? {
        status: "no_internet" as const,
        data: passes,
        offline: {
          cachedAtIso: new Date().toISOString(),
          queuedMutationsCount: 0,
          totpFallbackActive: true,
        },
      }
    : createSuccessState(passes);

  return (
    <TenStateView state={passesState} onRetry={() => {}}>
      {() => (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* USER GREETING: AVATAR + ADAM ARÊTE */}
          <View style={styles.userGreetingRow}>
            <Image
              source={{ uri: profile.avatar_url ?? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" }}
              style={styles.userAvatar}
            />
            <Text style={styles.userName}>{profile.name ?? "Adam Arête"}</Text>
          </View>

          {/* 3D VIP CARD STACK */}
          {activePass && (
            <View style={styles.cardWrapper}>
              <ExactVIPCard
                pass={activePass}
                facilityName="Metro Core Arena"
              />
            </View>
          )}

          {/* PURE WHITE CURVED SHEET: TRANSACTION HISTORY */}
          <View style={styles.whiteHistorySheet}>
            <Text style={styles.historyTitle}>Transaction History</Text>

            {/* Item 1: Sprout Pickleball Club */}
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={styles.pinIconCircle}>
                  <MapPin size={17} color="#F97316" />
                </View>
                <View>
                  <Text style={styles.txTitle}>Sprout Pickleball Club</Text>
                  <Text style={styles.txSub}>Check-in: Today, 01:32PM</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txStatus}>FREE/PASS</Text>
                <Text style={styles.txPrice}>PHP 999</Text>
              </View>
            </View>

            {/* Item 2: AMP FITNESS SJDM */}
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={styles.pinIconCircle}>
                  <Coins size={17} color="#F97316" />
                </View>
                <View>
                  <Text style={styles.txTitle}>AMP FITNESS SJDM</Text>
                  <Text style={styles.txSub}>Membership: Yesterday, 11:01AM</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txStatus}>MONTHLY</Text>
                <Text style={styles.txPrice}>PHP 799</Text>
              </View>
            </View>

            {/* Item 3: GetPhysical+ */}
            <View style={styles.txRow}>
              <View style={styles.txLeft}>
                <View style={styles.ticketIconCircle}>
                  <Ticket size={17} color="#9333EA" />
                </View>
                <View>
                  <Text style={styles.txTitle}>GetPhysical+</Text>
                  <Text style={styles.txSub}>Subscription: Yesterday, 06:48AM</Text>
                </View>
              </View>
              <View style={styles.txRight}>
                <Text style={styles.txStatus}>MONTHLY</Text>
                <Text style={styles.txPrice}>PHP 149</Text>
              </View>
            </View>

            {/* VIEW FULL HISTORY GRADIENT BUTTON */}
            <TouchableOpacity style={styles.viewFullHistoryButton}>
              <Text style={styles.viewFullHistoryText}>VIEW FULL HISTORY</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </TenStateView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  contentContainer: { paddingBottom: 85 },
  userGreetingRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 20, paddingTop: 6, paddingBottom: 10 },
  userAvatar: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: "rgba(255,255,255,0.7)" },
  userName: { fontSize: 24, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.3 },
  cardWrapper: { paddingHorizontal: 16, marginBottom: 14 },
  whiteHistorySheet: { backgroundColor: "#FFFFFF", borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 24, gap: 10 },
  historyTitle: { fontSize: 17, fontWeight: "900", color: "#000000", textAlign: "center", marginBottom: 6, letterSpacing: -0.3 },
  txRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 12, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E4E4E7", borderRadius: 14 },
  txLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  pinIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FFF7ED", borderWidth: 1, borderColor: "#FED7AA", alignItems: "center", justifyContent: "center" },
  ticketIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#FAF5FF", borderWidth: 1, borderColor: "#E9D5FF", alignItems: "center", justifyContent: "center" },
  txTitle: { fontSize: 12, fontWeight: "800", color: "#000000" },
  txSub: { fontSize: 10, color: "#A1A1AA", marginTop: 2 },
  txRight: { alignItems: "flex-end" },
  txStatus: { fontSize: 11, fontWeight: "900", color: "#000000" },
  txPrice: { fontSize: 10, color: "#A1A1AA", marginTop: 2 },
  viewFullHistoryButton: { marginTop: 8, width: "100%", paddingVertical: 12, borderRadius: 999, backgroundColor: "#EC4899", alignItems: "center", justifyContent: "center" },
  viewFullHistoryText: { color: "#FFFFFF", fontSize: 11, fontWeight: "900", letterSpacing: 0.8 },
});

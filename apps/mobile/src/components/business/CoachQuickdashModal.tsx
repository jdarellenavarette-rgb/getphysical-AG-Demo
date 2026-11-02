import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, UserCheck, ShieldCheck, Users, Plus, CheckCircle, Sparkles } from "lucide-react-native";

interface CoachQuickdashModalProps {
  visible: boolean;
  onClose: () => void;
}

interface FloorClient {
  id: string;
  name: string;
  station: string;
  status: "IN_BUILDING" | "COMPLETED";
  feeDeductedPhp: number;
}

export function CoachQuickdashModal({ visible, onClose }: CoachQuickdashModalProps) {
  const insets = useSafeAreaInsets();
  const [clients, setClients] = useState<FloorClient[]>([]);

  const handleSimulateCheckIn = () => {
    const newClient: FloorClient = {
      id: `client_${Date.now()}`,
      name: "Marco Villanueva",
      station: "Squat Rack 3 • Strength Arena",
      status: "IN_BUILDING",
      feeDeductedPhp: 150,
    };
    setClients((prev) => [newClient, ...prev]);
  };

  const handleCheckoutClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* TOP BAR WITH SAFE NOTCH INSET */}
        <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 50) + 10 }]}>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
          >
            <ArrowLeft size={20} color="#FAFAFA" />
            <Text style={styles.backBtnText}>Back to Athlete App</Text>
          </TouchableOpacity>
          <View style={styles.badge}>
            <Sparkles size={12} color="#3B82F6" />
            <Text style={styles.badgeText}>COACHDASH ROSTER</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {/* COACH SUMMARY CARD */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Coach Floor Status • Metro Core Arena</Text>
            <Text style={styles.summarySub}>
              Active Roster: {clients.length} Clients • Auto Floor Split Fee: ₱150/athlete
            </Text>
          </View>

          {/* SIMULATE CLIENT CHECK-IN BUTTON */}
          <TouchableOpacity onPress={handleSimulateCheckIn} style={styles.checkInActionBtn}>
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.checkInActionText}>Simulate Client Check-in</Text>
          </TouchableOpacity>

          {/* CLIENT LIST OR CLEAN EMPTY STATE */}
          <Text style={styles.sectionHeader}>CLIENTS ON FLOOR ({clients.length})</Text>

          {clients.length === 0 ? (
            <View style={styles.emptyCard}>
              <Users size={32} color="#71717A" />
              <Text style={styles.emptyTitle}>No clients detected on floor</Text>
              <Text style={styles.emptyDesc}>
                When your PT athletes scan through turnstiles, they will automatically appear here with floor fees split.
              </Text>
            </View>
          ) : (
            clients.map((c) => (
              <View key={c.id} style={styles.clientCard}>
                <View style={styles.clientTop}>
                  <View>
                    <Text style={styles.clientName}>{c.name}</Text>
                    <Text style={styles.clientStation}>{c.station}</Text>
                  </View>
                  <View style={styles.inBuildingPill}>
                    <Text style={styles.inBuildingText}>IN BUILDING</Text>
                  </View>
                </View>

                {/* SODIA SPLIT FEE BADGE */}
                <View style={styles.splitFeeBox}>
                  <ShieldCheck size={14} color="#10B981" />
                  <Text style={styles.splitFeeText}>
                    ₱{c.feeDeductedPhp} Floor Fee Deducted via Sodia Split (Venue Paid)
                  </Text>
                </View>

                <View style={styles.clientActions}>
                  <TouchableOpacity
                    onPress={() => handleCheckoutClient(c.id)}
                    style={styles.checkoutBtn}
                  >
                    <CheckCircle size={14} color="#FAFAFA" style={{ marginRight: 4 }} />
                    <Text style={styles.checkoutBtnText}>Complete Session & Checkout</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#18181B" },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 44, paddingVertical: 4 },
  backBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(59, 130, 246, 0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: "#3B82F6", fontSize: 10, fontWeight: "800" },
  content: { padding: 16 },
  summaryCard: { backgroundColor: "#121215", borderRadius: 12, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#18181B" },
  summaryTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "800" },
  summarySub: { color: "#71717A", fontSize: 11, marginTop: 4 },
  checkInActionBtn: { backgroundColor: "#3B82F6", borderRadius: 10, paddingVertical: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  checkInActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  sectionHeader: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 0.8, marginBottom: 8 },
  emptyCard: { backgroundColor: "#121215", borderRadius: 14, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#18181B" },
  emptyTitle: { color: "#FAFAFA", fontSize: 14, fontWeight: "700", marginTop: 10 },
  emptyDesc: { color: "#71717A", fontSize: 12, textAlign: "center", marginTop: 4, maxWidth: 280, lineHeight: 18 },
  clientCard: { backgroundColor: "#121215", borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#27272A" },
  clientTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  clientName: { color: "#FAFAFA", fontSize: 15, fontWeight: "800" },
  clientStation: { color: "#A1A1AA", fontSize: 12, marginTop: 2 },
  inBuildingPill: { backgroundColor: "rgba(16, 185, 129, 0.2)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  inBuildingText: { color: "#10B981", fontSize: 10, fontWeight: "800" },
  splitFeeBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16, 185, 129, 0.08)", borderRadius: 8, padding: 10, marginTop: 10 },
  splitFeeText: { color: "#10B981", fontSize: 11, fontWeight: "600", flex: 1 },
  clientActions: { marginTop: 12 },
  checkoutBtn: { backgroundColor: "#27272A", borderRadius: 8, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  checkoutBtnText: { color: "#FAFAFA", fontSize: 12, fontWeight: "700" },
});
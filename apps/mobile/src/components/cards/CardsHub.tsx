import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Plus, Gift, Scan, Receipt, ArrowUpRight, CheckCircle2 } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { ExactVIPCard } from "./ExactVIPCard";
import { TenStateView } from "../common/TenStateView";
import { createSuccessState, createLoadingState, type PassRow } from "sodia-core";

export function CardsHub() {
  const { passes, facilities, isOffline } = useEcosystemStore();
  const [selectedPassIndex, setSelectedPassIndex] = useState(0);

  const activePass = passes[selectedPassIndex] ?? passes[0];
  const facility = facilities.find((f) => f.id === activePass?.facility_id);

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
      {(data) => (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          {/* CARDS CAROUSEL */}
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>3D VIP WALLET</Text>
            <Text style={styles.cardCounter}>
              {selectedPassIndex + 1} of {data.length}
            </Text>
          </View>

          {activePass && (
            <ExactVIPCard
              pass={activePass}
              facilityName={facility?.name ?? "Metro Core Arena"}
            />
          )}

          {/* ACTION ROW */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton}>
              <Scan size={18} color="#FAFAFA" />
              <Text style={styles.actionButtonText}>Scan Turnstile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Gift size={18} color="#FAFAFA" />
              <Text style={styles.actionButtonText}>Gift a Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
              <Plus size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Add Pass</Text>
            </TouchableOpacity>
          </View>

          {/* FITNESS SOA LEDGER */}
          <View style={styles.soaContainer}>
            <View style={styles.soaHeader}>
              <View style={styles.soaTitleRow}>
                <Receipt size={16} color="#A1A1AA" />
                <Text style={styles.soaTitle}>STATEMENT OF ACCOUNT</Text>
              </View>
              <Text style={styles.soaBadge}>IMMUTABLE</Text>
            </View>

            <View style={styles.ledgerRow}>
              <View style={styles.ledgerIconAccess}>
                <CheckCircle2 size={16} color="#10B981" />
              </View>
              <View style={styles.ledgerDetails}>
                <Text style={styles.ledgerAction}>Check-In • Metro Core Arena</Text>
                <Text style={styles.ledgerTime}>Today, 08:14 AM • Turnstile Verified</Text>
              </View>
              <Text style={styles.ledgerValueZero}>0.00</Text>
            </View>

            <View style={styles.ledgerRow}>
              <View style={styles.ledgerIconPayment}>
                <ArrowUpRight size={16} color="#E11D48" />
              </View>
              <View style={styles.ledgerDetails}>
                <Text style={styles.ledgerAction}>Day Pass • Metro Core Arena</Text>
                <Text style={styles.ledgerTime}>Yesterday, 07:30 PM • Xendit</Text>
              </View>
              <Text style={styles.ledgerValueNegative}>-₱265.00</Text>
            </View>

            <View style={styles.ledgerRow}>
              <View style={styles.ledgerIconPayment}>
                <ArrowUpRight size={16} color="#3B82F6" />
              </View>
              <View style={styles.ledgerDetails}>
                <Text style={styles.ledgerAction}>Court A • Nexus Racket Club</Text>
                <Text style={styles.ledgerTime}>Oct 29, 04:00 PM • Split</Text>
              </View>
              <Text style={styles.ledgerValueNegative}>-₱215.00</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </TenStateView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  cardCounter: {
    color: "#A1A1AA",
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginVertical: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#18181B",
    borderColor: "#27272A",
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonText: {
    color: "#FAFAFA",
    fontSize: 12,
    fontWeight: "600",
  },
  primaryAction: {
    backgroundColor: "#E11D48",
    borderColor: "#E11D48",
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  soaContainer: {
    backgroundColor: "#121215",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#18181B",
    padding: 20,
    marginTop: 8,
    minHeight: 280,
  },
  soaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  soaTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  soaTitle: {
    color: "#FAFAFA",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  soaBadge: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "700",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ledgerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#18181B",
  },
  ledgerIconAccess: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  ledgerIconPayment: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(225, 29, 72, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  ledgerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  ledgerAction: {
    color: "#FAFAFA",
    fontSize: 13,
    fontWeight: "600",
  },
  ledgerTime: {
    color: "#71717A",
    fontSize: 11,
    marginTop: 2,
  },
  ledgerValueZero: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
  },
  ledgerValueNegative: {
    color: "#FAFAFA",
    fontSize: 13,
    fontWeight: "700",
  },
});

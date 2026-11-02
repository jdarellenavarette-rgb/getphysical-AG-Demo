import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, Navigation, Dumbbell, Award, UserCheck, Flame } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";

interface DiscoverMapCanvasProps {
  facilities: readonly FacilityRow[];
  selectedId: string | null;
  onSelectPin: (id: string) => void;
}

export function DiscoverMapCanvas({ facilities, selectedId, onSelectPin }: DiscoverMapCanvasProps) {
  // Coords mapped across the dark radar canvas
  const pinPositions: Record<string, { left: number; top: number; type: "gym" | "court" | "coach" | "meet" }> = {
    fac_metro_core: { left: 55, top: 38, type: "gym" },
    fac_nexus_club: { left: 22, top: 62, type: "court" },
    fac_iron_forge: { left: 75, top: 68, type: "gym" },
  };

  return (
    <View style={styles.mapContainer}>
      {/* MAP GRID LINES & RADAR ACCENT */}
      <View style={styles.gridLineHorizontal1} />
      <View style={styles.gridLineHorizontal2} />
      <View style={styles.gridLineVertical1} />
      <View style={styles.gridLineVertical2} />
      <View style={styles.radarRing} />

      {/* USER GPS POSITION (GRAB-STYLE PULSE DOT) */}
      <View style={styles.userPinContainer}>
        <View style={styles.userPulseRing} />
        <View style={styles.userDot} />
        <View style={styles.userCallout}>
          <Text style={styles.userCalloutText}>You (BGC 28th St)</Text>
        </View>
      </View>

      {/* VENUE PINS */}
      {facilities.map((fac) => {
        const pos = pinPositions[fac.id] ?? { left: 50, top: 50, type: "gym" };
        const isSelected = selectedId === fac.id;

        return (
          <TouchableOpacity
            key={fac.id}
            onPress={() => onSelectPin(fac.id)}
            style={[
              styles.pinContainer,
              { left: `${pos.left}%`, top: `${pos.top}%` },
              isSelected && styles.pinContainerSelected,
            ]}
          >
            <View style={[styles.pinBubble, isSelected && styles.pinBubbleSelected]}>
              <Text style={styles.pinPrice}>
                ₱{fac.day_pass_price_php ?? fac.court_hourly_price_php}
              </Text>
              <View style={[styles.pinDotIndicator, { backgroundColor: isSelected ? "#FFFFFF" : "#10B981" }]} />
            </View>
            <View style={[styles.pinBeak, isSelected && styles.pinBeakSelected]} />
          </TouchableOpacity>
        );
      })}

      {/* COACH PIN ON MAP */}
      <TouchableOpacity
        onPress={() => onSelectPin("fac_metro_core")}
        style={[styles.pinContainer, { left: "68%", top: "25%" }]}
      >
        <View style={[styles.pinBubble, { backgroundColor: "#3B82F6", borderColor: "#60A5FA" }]}>
          <UserCheck size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.pinPrice}>Coach PT</Text>
        </View>
        <View style={[styles.pinBeak, { borderTopColor: "#3B82F6" }]} />
      </TouchableOpacity>

      {/* TOURNAMENT MEET PIN ON MAP */}
      <TouchableOpacity
        onPress={() => onSelectPin("fac_nexus_club")}
        style={[styles.pinContainer, { left: "18%", top: "30%" }]}
      >
        <View style={[styles.pinBubble, { backgroundColor: "#F59E0B", borderColor: "#FBBF24" }]}>
          <Award size={10} color="#FFFFFF" style={{ marginRight: 2 }} />
          <Text style={styles.pinPrice}>Meet 6PM</Text>
        </View>
        <View style={[styles.pinBeak, { borderTopColor: "#F59E0B" }]} />
      </TouchableOpacity>

      {/* RADAR METADATA FOOTER */}
      <View style={styles.radarMeta}>
        <Navigation size={12} color="#10B981" />
        <Text style={styles.radarMetaText}>GPS RADAR ACTIVE • 5 VENUES & COACHES IN 2KM</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    height: 310,
    backgroundColor: "#101014",
    position: "relative",
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E24",
  },
  gridLineHorizontal1: { position: "absolute", top: "33%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  gridLineHorizontal2: { position: "absolute", top: "66%", left: 0, right: 0, height: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  gridLineVertical1: { position: "absolute", left: "33%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  gridLineVertical2: { position: "absolute", left: "66%", top: 0, bottom: 0, width: 1, backgroundColor: "rgba(255,255,255,0.04)" },
  radarRing: { position: "absolute", width: 260, height: 260, borderRadius: 130, borderWidth: 1, borderColor: "rgba(225, 29, 72, 0.08)", left: "20%", top: "15%" },
  userPinContainer: { position: "absolute", left: "44%", top: "48%", alignItems: "center", justifyContent: "center" },
  userPulseRing: { position: "absolute", width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(59, 130, 246, 0.25)" },
  userDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#3B82F6", borderWidth: 2, borderColor: "#FFFFFF" },
  userCallout: { backgroundColor: "#18181B", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginTop: 22, borderWidth: 1, borderColor: "#27272A" },
  userCalloutText: { color: "#FAFAFA", fontSize: 9, fontWeight: "800" },
  pinContainer: { position: "absolute", alignItems: "center", transform: [{ translateX: -24 }, { translateY: -30 }] },
  pinContainerSelected: { zIndex: 40, transform: [{ translateX: -28 }, { translateY: -36 }, { scale: 1.1 }] },
  pinBubble: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181B", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5, borderColor: "#EC4899", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 6 },
  pinBubbleSelected: { backgroundColor: "#E11D48", borderColor: "#FFFFFF" },
  pinPrice: { color: "#FAFAFA", fontSize: 11, fontWeight: "900" },
  pinDotIndicator: { width: 5, height: 5, borderRadius: 2.5, marginLeft: 4 },
  pinBeak: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#EC4899", marginTop: -1 },
  pinBeakSelected: { borderTopColor: "#E11D48" },
  radarMeta: { position: "absolute", bottom: 10, left: 14, flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(9,9,11,0.85)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: "#27272A" },
  radarMetaText: { color: "#10B981", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 },
});
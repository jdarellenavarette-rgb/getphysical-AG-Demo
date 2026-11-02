import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, Navigation, UserCheck, Award, Flame } from "lucide-react-native";
import type { FacilityRow } from "sodia-core";

interface DiscoverMapCanvasProps {
  facilities: readonly FacilityRow[];
  selectedId: string | null;
  onSelectPin: (id: string) => void;
  onSelectCoach?: () => void;
  onSelectMeet?: () => void;
}

export function DiscoverMapCanvas({
  facilities,
  selectedId,
  onSelectPin,
  onSelectCoach,
  onSelectMeet,
}: DiscoverMapCanvasProps) {
  const pinPositions: Record<string, { left: number; top: number; road: string }> = {
    fac_metro_core: { left: 56, top: 38, road: "28th St Avenue" },
    fac_nexus_club: { left: 24, top: 58, road: "7th Avenue" },
    fac_iron_forge: { left: 74, top: 66, road: "High Street Walkway" },
  };

  return (
    <View style={styles.mapCanvas}>
      {/* 1. REALISTIC DARK CARTOGRAPHY (GRAB / APPLE MAPS DARK) */}
      {/* Background Park / Green Zones */}
      <View style={styles.parkZone1} />
      <View style={styles.parkZone2} />

      {/* Road Network Arteries */}
      <View style={styles.majorAvenueHorizontal} />
      <View style={styles.majorAvenueDiagonal} />
      <View style={styles.avenueVertical1} />
      <View style={styles.avenueVertical2} />
      <View style={styles.streetHorizontal} />

      {/* Road Labels (Grab-style subtle typography) */}
      <Text style={styles.roadLabelBGC}>BGC 28TH ST</Text>
      <Text style={styles.roadLabel7th}>7TH AVE</Text>
      <Text style={styles.roadLabelHighStreet}>BONIFACIO HIGH STREET</Text>

      {/* 2. USER GPS LOCATION BEACON (Grab Blue Pulse) */}
      <View style={styles.userBeaconContainer}>
        <View style={styles.userPulseHalo} />
        <View style={styles.userDotCore} />
        <View style={styles.userCalloutPill}>
          <Text style={styles.userCalloutText}>You • 28th St</Text>
        </View>
      </View>

      {/* 3. VENUE PRICE PINS (Grab / Airbnb Style) */}
      {facilities.map((fac) => {
        const pos = pinPositions[fac.id] ?? { left: 50, top: 50, road: "BGC" };
        const isSelected = selectedId === fac.id;
        const price = fac.day_pass_price_php ?? fac.court_hourly_price_php;

        return (
          <TouchableOpacity
            key={fac.id}
            onPress={() => onSelectPin(fac.id)}
            style={[
              styles.pinWrapper,
              { left: `${pos.left}%`, top: `${pos.top}%` },
              isSelected && styles.pinWrapperActive,
            ]}
          >
            <View style={[styles.pinCapsule, isSelected && styles.pinCapsuleActive]}>
              <View style={[styles.statusDot, isSelected && { backgroundColor: "#FFFFFF" }]} />
              <Text style={[styles.pinPriceText, isSelected && styles.pinPriceTextActive]}>
                ₱{price}
              </Text>
            </View>
            <View style={[styles.pinAnchor, isSelected && styles.pinAnchorActive]} />
          </TouchableOpacity>
        );
      })}

      {/* 4. VERIFIED COACH PIN (Blue Pro Marker) */}
      <TouchableOpacity
        onPress={() => onSelectCoach?.()}
        style={[styles.pinWrapper, { left: "68%", top: "26%" }]}
      >
        <View style={[styles.pinCapsule, styles.coachCapsule]}>
          <UserCheck size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.coachText}>Coach PT</Text>
        </View>
        <View style={[styles.pinAnchor, { borderTopColor: "#3B82F6" }]} />
      </TouchableOpacity>

      {/* 5. TOURNAMENT MEET PIN (Amber Gold Marker) */}
      <TouchableOpacity
        onPress={() => onSelectMeet?.()}
        style={[styles.pinWrapper, { left: "18%", top: "32%" }]}
      >
        <View style={[styles.pinCapsule, styles.meetCapsule]}>
          <Award size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
          <Text style={styles.meetText}>Meet 6PM</Text>
        </View>
        <View style={[styles.pinAnchor, { borderTopColor: "#F59E0B" }]} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mapCanvas: { height: 320, backgroundColor: "#0C0C0F", position: "relative", overflow: "hidden" },
  parkZone1: { position: "absolute", top: 18, left: 14, width: 90, height: 70, borderRadius: 18, backgroundColor: "rgba(16, 185, 129, 0.06)" },
  parkZone2: { position: "absolute", bottom: 20, right: 30, width: 120, height: 80, borderRadius: 24, backgroundColor: "rgba(16, 185, 129, 0.05)" },
  majorAvenueHorizontal: { position: "absolute", top: "45%", left: 0, right: 0, height: 14, backgroundColor: "#191922" },
  majorAvenueDiagonal: { position: "absolute", top: 0, bottom: 0, left: "46%", width: 14, backgroundColor: "#191922", transform: [{ rotate: "22deg" }] },
  avenueVertical1: { position: "absolute", top: 0, bottom: 0, left: "28%", width: 8, backgroundColor: "#16161E" },
  avenueVertical2: { position: "absolute", top: 0, bottom: 0, left: "70%", width: 8, backgroundColor: "#16161E" },
  streetHorizontal: { position: "absolute", top: "68%", left: 0, right: 0, height: 8, backgroundColor: "#16161E" },
  roadLabelBGC: { position: "absolute", top: "46%", left: 16, color: "#3F3F4E", fontSize: 8, fontWeight: "800", letterSpacing: 1 },
  roadLabel7th: { position: "absolute", top: 80, left: "30%", color: "#3F3F4E", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  roadLabelHighStreet: { position: "absolute", bottom: 25, left: "20%", color: "#3F3F4E", fontSize: 8, fontWeight: "800", letterSpacing: 0.8 },
  userBeaconContainer: { position: "absolute", left: "42%", top: "44%", alignItems: "center", justifyContent: "center", zIndex: 10 },
  userPulseHalo: { position: "absolute", width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(59, 130, 246, 0.22)" },
  userDotCore: { width: 15, height: 15, borderRadius: 8, backgroundColor: "#3B82F6", borderWidth: 2.5, borderColor: "#FFFFFF" },
  userCalloutPill: { backgroundColor: "#18181B", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, marginTop: 22, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.12)" },
  userCalloutText: { color: "#FFFFFF", fontSize: 9, fontWeight: "800" },
  pinWrapper: { position: "absolute", alignItems: "center", transform: [{ translateX: -26 }, { translateY: -32 }] },
  pinWrapperActive: { zIndex: 30, transform: [{ translateX: -30 }, { translateY: -38 }, { scale: 1.08 }] },
  pinCapsule: { flexDirection: "row", alignItems: "center", backgroundColor: "#141418", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1.5, borderColor: "rgba(255, 255, 255, 0.15)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 6 },
  pinCapsuleActive: { backgroundColor: "#E11D48", borderColor: "#FFFFFF" },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981", marginRight: 5 },
  pinPriceText: { color: "#FFFFFF", fontSize: 12, fontWeight: "900" },
  pinPriceTextActive: { color: "#FFFFFF" },
  pinAnchor: { width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 6, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#141418", marginTop: -1 },
  pinAnchorActive: { borderTopColor: "#E11D48" },
  coachCapsule: { backgroundColor: "#2563EB", borderColor: "#60A5FA" },
  coachText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
  meetCapsule: { backgroundColor: "#D97706", borderColor: "#FBBF24" },
  meetText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" },
});

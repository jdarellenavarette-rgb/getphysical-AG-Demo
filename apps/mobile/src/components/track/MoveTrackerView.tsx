import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Play, Pause, Square, MapPin, Footprints, Flame, CheckCircle2, RotateCcw, Activity } from "lucide-react-native";

export function MoveTrackerView() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [isFinished, setIsFinished] = useState(false);
  const [stampSaved, setStampSaved] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        setDistanceKm((prev) => parseFloat((prev + 0.0035).toFixed(3)));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setDistanceKm(0.0);
    setIsFinished(false);
    setStampSaved(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. STATUS BADGE */}
      <View style={styles.statusRow}>
        <View style={styles.gpsLivePill}>
          <View style={styles.livePulse} />
          <Text style={styles.gpsLiveText}>GPS RUNNING • BGC 30TH TRAIL</Text>
        </View>
        <Text style={styles.activityTag}>OUTDOOR MOVE</Text>
      </View>

      {/* 2. BIG BOLD DIGITAL HUD (INSPIRATION PHOTO 4: 32:18 / 4.02 MI / 8:12 PACE) */}
      <View style={styles.hudContainer}>
        <Text style={styles.hudTimer}>{formatTime(seconds)}</Text>

        <View style={styles.dualMetricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{distanceKm.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>DISTANCE (KM)</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {distanceKm > 0 ? `${(seconds / 60 / distanceKm).toFixed(1)}` : "0:00"}
            </Text>
            <Text style={styles.metricLabel}>PACE (/KM)</Text>
          </View>
        </View>
      </View>

      {/* 3. SIMULATED NEON GPS BREADCRUMB ROUTE (PHOTO 4) */}
      <View style={styles.neonMapBox}>
        <View style={styles.neonRoutePlaceholder}>
          <View style={styles.routeDotStart} />
          <View style={styles.routeSegment1} />
          <View style={styles.routeSegment2} />
          <View style={styles.routeDotCurrent} />
        </View>
        <View style={styles.mapFooterRow}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Activity size={14} color="#E11D48" />
            <Text style={styles.heartRateText}>168 BPM • Threshold Zone 4 (63.8%)</Text>
          </View>
          <Text style={styles.elevationText}>+38m Elev</Text>
        </View>
      </View>

      {/* 4. DUAL CIRCULAR CONTROLS (INSPIRATION PHOTO 4: CIRCLE PAUSE & STOP) */}
      {!isActive && !isFinished && (
        <View style={styles.actionWrap}>
          {seconds === 0 ? (
            <TouchableOpacity onPress={() => setIsActive(true)} style={styles.startGradientBtn}>
              <Play size={22} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>Start Outdoor GPS Run</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.circularControlsRow}>
              <TouchableOpacity onPress={() => setIsActive(true)} style={styles.resumeCircleBtn}>
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.circleBtnLabel}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFinish} style={styles.stopCircleBtn}>
                <Square size={20} color="#FAFAFA" fill="#FAFAFA" />
                <Text style={styles.circleBtnLabel}>Stop</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {isActive && (
        <View style={styles.circularControlsRow}>
          <TouchableOpacity onPress={() => setIsActive(false)} style={styles.pauseCircleBtn}>
            <Pause size={24} color="#FFFFFF" />
            <Text style={styles.circleBtnLabel}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleFinish} style={styles.stopCircleBtn}>
            <Square size={20} color="#FAFAFA" fill="#FAFAFA" />
            <Text style={styles.circleBtnLabel}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. FINISHED RUN SUMMARY & PR MOVE STAMP */}
      {isFinished && (
        <View style={styles.finishedCard}>
          <CheckCircle2 size={36} color="#10B981" />
          <Text style={styles.finishedTitle}>OUTDOOR RUN FINISHED</Text>
          <Text style={styles.finishedDesc}>
            {distanceKm.toFixed(2)} km in {formatTime(seconds)} • {(seconds / 60 / Math.max(0.01, distanceKm)).toFixed(1)} /km pace • {Math.round(distanceKm * 64)} Active kcal
          </Text>

          {!stampSaved ? (
            <TouchableOpacity onPress={() => setStampSaved(true)} style={styles.stampActionBtn}>
              <Flame size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.stampActionText}>Mint Verified Move Stamp</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stampSuccessBox}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.stampSuccessText}>Minted to Locker & Profile Trophy Case!</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <RotateCcw size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>New Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  content: { padding: 16, paddingBottom: 110 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  gpsLivePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16, 185, 129, 0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  livePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10B981" },
  gpsLiveText: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  activityTag: { color: "#71717A", fontSize: 11, fontWeight: "700" },
  hudContainer: { alignItems: "center", marginVertical: 8 },
  hudTimer: { color: "#FAFAFA", fontSize: 62, fontWeight: "900", letterSpacing: -2 },
  dualMetricsRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 8 },
  metricCol: { alignItems: "center", flex: 1 },
  metricVal: { color: "#FAFAFA", fontSize: 28, fontWeight: "900" },
  metricLabel: { color: "#71717A", fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginTop: 2 },
  metricDivider: { width: 1, height: 36, backgroundColor: "#27272A" },
  neonMapBox: { backgroundColor: "#121215", borderRadius: 20, padding: 16, borderWidth: 1, borderColor: "#27272A", marginVertical: 16 },
  neonRoutePlaceholder: { height: 110, position: "relative", justifyContent: "center", alignItems: "center" },
  routeDotStart: { position: "absolute", left: 40, top: 20, width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  routeSegment1: { position: "absolute", left: 44, top: 24, width: 120, height: 3, backgroundColor: "#E11D48", transform: [{ rotate: "25deg" }] },
  routeSegment2: { position: "absolute", left: 140, top: 50, width: 110, height: 3, backgroundColor: "#EC4899", transform: [{ rotate: "-15deg" }] },
  routeDotCurrent: { position: "absolute", right: 50, top: 40, width: 12, height: 12, borderRadius: 6, backgroundColor: "#EC4899", borderWidth: 2, borderColor: "#FFFFFF" },
  mapFooterRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#1E1E24", paddingTop: 10, marginTop: 10 },
  heartRateText: { color: "#E11D48", fontSize: 11, fontWeight: "700" },
  elevationText: { color: "#71717A", fontSize: 11, fontWeight: "600" },
  actionWrap: { marginVertical: 12 },
  startGradientBtn: { backgroundColor: "#E11D48", borderRadius: 16, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  startBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  circularControlsRow: { flexDirection: "row", justifyContent: "center", gap: 36, marginVertical: 14 },
  pauseCircleBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
  resumeCircleBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  stopCircleBtn: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#18181B", borderWidth: 2, borderColor: "#27272A", alignItems: "center", justifyContent: "center" },
  circleBtnLabel: { color: "#FAFAFA", fontSize: 10, fontWeight: "800", marginTop: 2 },
  finishedCard: { backgroundColor: "#121215", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#27272A", marginTop: 8 },
  finishedTitle: { color: "#FAFAFA", fontSize: 16, fontWeight: "800", marginTop: 8 },
  finishedDesc: { color: "#A1A1AA", fontSize: 12, marginTop: 4, textAlign: "center", lineHeight: 18 },
  stampActionBtn: { backgroundColor: "#EC4899", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", marginTop: 14 },
  stampActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  stampSuccessBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16, 185, 129, 0.15)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 14 },
  stampSuccessText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  resetBtn: { flexDirection: "row", alignItems: "center", marginTop: 14, padding: 6 },
  resetBtnText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
});
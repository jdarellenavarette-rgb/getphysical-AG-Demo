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
          <Text style={styles.gpsLiveText}>GPS Active • BGC Greenway Trail</Text>
        </View>
        <Text style={styles.activityTag}>Outdoor Run</Text>
      </View>

      {/* 2. BIG BOLD DIGITAL HUD (STRAVA PHOTO 4) */}
      <View style={styles.hudContainer}>
        <Text style={styles.hudTimer}>{formatTime(seconds)}</Text>

        <View style={styles.dualMetricsRow}>
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>{distanceKm.toFixed(2)}</Text>
            <Text style={styles.metricLabel}>Distance (KM)</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricCol}>
            <Text style={styles.metricVal}>
              {distanceKm > 0 ? `${(seconds / 60 / distanceKm).toFixed(1)}` : "0:00"}
            </Text>
            <Text style={styles.metricLabel}>Pace (/KM)</Text>
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
            <Text style={styles.heartRateText}>168 BPM • Threshold Zone 4</Text>
          </View>
          <Text style={styles.elevationText}>+38m Elev</Text>
        </View>
      </View>

      {/* 4. DUAL CIRCULAR CONTROLS (PHOTO 4: GRADIENT PAUSE & WHITE STOP) */}
      {!isActive && !isFinished && (
        <View style={styles.actionWrap}>
          {seconds === 0 ? (
            <TouchableOpacity onPress={() => setIsActive(true)} style={styles.startGradientBtn}>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>Start Outdoor GPS Run</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.circularControlsRow}>
              <TouchableOpacity onPress={() => setIsActive(true)} style={styles.resumeCircleBtn}>
                <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
                <Text style={styles.circleBtnLabel}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFinish} style={styles.stopCircleBtn}>
                <Square size={20} color="#09090B" fill="#09090B" />
                <Text style={styles.circleBtnLabelDark}>Stop</Text>
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
            <Square size={20} color="#09090B" fill="#09090B" />
            <Text style={styles.circleBtnLabelDark}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 5. FINISHED RUN SUMMARY */}
      {isFinished && (
        <View style={styles.finishedCard}>
          <CheckCircle2 size={36} color="#10B981" />
          <Text style={styles.finishedTitle}>Workout Complete</Text>
          <Text style={styles.finishedDesc}>
            {distanceKm.toFixed(2)} km in {formatTime(seconds)} • {(seconds / 60 / Math.max(0.01, distanceKm)).toFixed(1)} /km pace • {Math.round(distanceKm * 64)} Active kcal
          </Text>

          {!stampSaved ? (
            <TouchableOpacity onPress={() => setStampSaved(true)} style={styles.stampActionBtn}>
              <Flame size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.stampActionText}>Mint Verified Move Stamp</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.stampConfirmedRow}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.stampConfirmedText}>Verified Move Stamp Saved to Profile</Text>
            </View>
          )}

          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <RotateCcw size={14} color="#A1A1AA" style={{ marginRight: 6 }} />
            <Text style={styles.resetBtnText}>New Run</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  content: { padding: 16, paddingBottom: 110 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  gpsLivePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16, 185, 129, 0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  livePulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#10B981" },
  gpsLiveText: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  activityTag: { color: "#8E8E93", fontSize: 11, fontWeight: "700" },
  hudContainer: { alignItems: "center", marginVertical: 14 },
  hudTimer: { color: "#FAFAFA", fontSize: 62, fontWeight: "900", letterSpacing: -2 },
  dualMetricsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", marginTop: 12 },
  metricCol: { alignItems: "center", flex: 1 },
  metricVal: { color: "#FAFAFA", fontSize: 28, fontWeight: "900" },
  metricLabel: { color: "#8E8E93", fontSize: 11, fontWeight: "700", marginTop: 2 },
  metricDivider: { width: 1, height: 32, backgroundColor: "#27272A" },
  neonMapBox: { height: 160, backgroundColor: "#141418", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", padding: 16, justifyContent: "space-between", marginVertical: 18 },
  neonRoutePlaceholder: { flex: 1, position: "relative", justifyContent: "center" },
  routeDotStart: { position: "absolute", left: "15%", top: "70%", width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981" },
  routeSegment1: { position: "absolute", left: "18%", top: "40%", width: "40%", height: 3, backgroundColor: "#E11D48", transform: [{ rotate: "-25deg" }] },
  routeSegment2: { position: "absolute", left: "50%", top: "25%", width: "35%", height: 3, backgroundColor: "#EC4899", transform: [{ rotate: "18deg" }] },
  routeDotCurrent: { position: "absolute", right: "12%", top: "35%", width: 14, height: 14, borderRadius: 7, backgroundColor: "#E11D48", borderWidth: 2, borderColor: "#FFFFFF" },
  mapFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1, borderTopColor: "#202026" },
  heartRateText: { color: "#E11D48", fontSize: 11, fontWeight: "800" },
  elevationText: { color: "#8E8E93", fontSize: 11, fontWeight: "600" },
  actionWrap: { marginTop: 14 },
  startGradientBtn: { backgroundColor: "#E11D48", borderRadius: 999, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", shadowColor: "#E11D48", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  circularControlsRow: { flexDirection: "row", justifyContent: "center", gap: 32, marginTop: 18 },
  pauseCircleBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center", shadowColor: "#E11D48", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
  resumeCircleBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  stopCircleBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  circleBtnLabel: { color: "#FAFAFA", fontSize: 10, fontWeight: "800", marginTop: 4 },
  circleBtnLabelDark: { color: "#09090B", fontSize: 10, fontWeight: "800", marginTop: 4 },
  finishedCard: { backgroundColor: "#141418", borderRadius: 20, padding: 22, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", marginTop: 16 },
  finishedTitle: { color: "#FAFAFA", fontSize: 18, fontWeight: "900", marginTop: 10 },
  finishedDesc: { color: "#8E8E93", fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  stampActionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, marginTop: 16 },
  stampActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  stampConfirmedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 },
  stampConfirmedText: { color: "#10B981", fontSize: 12, fontWeight: "800" },
  resetBtn: { flexDirection: "row", alignItems: "center", marginTop: 14, padding: 8 },
  resetBtnText: { color: "#8E8E93", fontSize: 12, fontWeight: "700" },
});

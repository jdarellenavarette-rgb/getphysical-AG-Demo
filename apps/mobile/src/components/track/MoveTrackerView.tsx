import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Play, Pause, Square, MapPin, Footprints, Flame, CheckCircle2, RotateCcw, Activity, Send } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";

export function MoveTrackerView() {
  const { addPost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [isFinished, setIsFinished] = useState(false);
  const [stampSaved, setStampSaved] = useState(false);
  const [sharedToFeed, setSharedToFeed] = useState(false);

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
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. STATUS BADGE */}
      <View style={styles.statusRow}>
        <View style={styles.gpsLivePill}>
          <View style={styles.livePulse} />
          <Text style={styles.gpsLiveText}>{isActive ? "GPS TRACKING LIVE" : "GPS READY"}</Text>
        </View>
        <Text style={[styles.activityTag, { color: colors.textMuted }]}>OUTDOOR RUN • BGC CIRCUIT</Text>
      </View>

      {/* 2. HUD DIGITAL READOUT */}
      <View style={styles.hudContainer}>
        <Text style={[styles.hudTimer, { color: colors.textPrimary }]}>{formatTime(seconds)}</Text>
        <View style={styles.dualMetricsRow}>
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{distanceKm.toFixed(2)}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>KILOMETERS</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.borderColor }]} />
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>
              {distanceKm > 0 ? (seconds / 60 / distanceKm).toFixed(1) : "0.0"}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MIN / KM PACE</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.borderColor }]} />
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{(distanceKm * 64).toFixed(0)}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>EST. KCAL</Text>
          </View>
        </View>
      </View>

      {/* 3. NEON ROUTE CANVAS */}
      <View style={[styles.neonMapBox, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
        <View style={styles.neonRoutePlaceholder}>
          <View style={styles.routeDotStart} />
          <View style={styles.routeSegment1} />
          <View style={styles.routeSegment2} />
          <View style={styles.routeDotCurrent} />
        </View>
        <View style={[styles.mapFooterRow, { borderTopColor: colors.borderColor }]}>
          <Text style={styles.heartRateText}>❤️ 148 BPM (Zone 3 Aero)</Text>
          <Text style={[styles.elevationText, { color: colors.textMuted }]}>Elevation +18m • Bonifacio High St</Text>
        </View>
      </View>

      {/* 4. CONTROLS */}
      {!isFinished ? (
        <View style={styles.actionWrap}>
          {!isActive && seconds === 0 ? (
            <TouchableOpacity onPress={() => setIsActive(true)} style={styles.startGradientBtn}>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>Start Outdoor Run</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.circularControlsRow}>
              {isActive ? (
                <TouchableOpacity onPress={() => setIsActive(false)} style={styles.pauseCircleBtn}>
                  <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.circleBtnLabel}>PAUSE</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setIsActive(true)} style={styles.resumeCircleBtn}>
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.circleBtnLabel}>RESUME</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleFinish} style={[styles.stopCircleBtn, { backgroundColor: colors.textPrimary }]}>
                <Square size={24} color={colors.bgScreen} fill={colors.bgScreen} />
                <Text style={[styles.circleBtnLabelDark, { color: colors.bgScreen }]}>FINISH</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.finishedCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <CheckCircle2 size={36} color="#10B981" />
          <Text style={[styles.finishedTitle, { color: colors.textPrimary }]}>Run Recorded Successfully!</Text>
          <Text style={[styles.finishedDesc, { color: colors.textMuted }]}>
            {distanceKm.toFixed(2)} km in {formatTime(seconds)} • {(distanceKm * 64).toFixed(0)} active kcal burned
          </Text>

          {!stampSaved ? (
            <TouchableOpacity onPress={() => setStampSaved(true)} style={styles.stampActionBtn}>
              <Footprints size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.stampActionText}>Save Move Stamp to Locker</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ gap: 10, alignItems: "center" }}>
              <View style={styles.stampConfirmedRow}>
                <CheckCircle2 size={16} color="#10B981" />
                <Text style={styles.stampConfirmedText}>Move Stamp Saved to Profile Locker</Text>
              </View>
              {!sharedToFeed ? (
                <TouchableOpacity
                  onPress={() => {
                    addPost(`Outdoor GPS run completed: ${distanceKm.toFixed(2)} km in ${formatTime(seconds)}! 🏃‍♂️⚡`, undefined, {
                      id: `stamp_move_${Date.now()}`,
                      type: "run",
                      title: "Outdoor 5K Route",
                      primaryMetric: `${distanceKm.toFixed(2)} km`,
                      isVerified: true,
                    });
                    setSharedToFeed(true);
                  }}
                  style={[styles.shareFeedRunBtn, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }]}
                >
                  <Send size={14} color="#E11D48" style={{ marginRight: 6 }} />
                  <Text style={[styles.shareFeedRunText, { color: colors.textPrimary }]}>Share Route Stamp to Sodia Feed</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}>✓ Shared to Feed</Text>
              )}
            </View>
          )}

          <TouchableOpacity onPress={() => { handleReset(); setSharedToFeed(false); }} style={styles.resetBtn}>
            <RotateCcw size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.resetBtnText, { color: colors.textMuted }]}>New Run</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 110 },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  gpsLivePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16, 185, 129, 0.12)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  livePulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#10B981" },
  gpsLiveText: { color: "#10B981", fontSize: 11, fontWeight: "800" },
  activityTag: { fontSize: 11, fontWeight: "700" },
  hudContainer: { alignItems: "center", marginVertical: 14 },
  hudTimer: { fontSize: 62, fontWeight: "900", letterSpacing: -2 },
  dualMetricsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", marginTop: 12 },
  metricCol: { alignItems: "center", flex: 1 },
  metricVal: { fontSize: 28, fontWeight: "900" },
  metricLabel: { fontSize: 11, fontWeight: "700", marginTop: 2 },
  metricDivider: { width: 1, height: 32 },
  neonMapBox: { height: 160, borderRadius: 20, borderWidth: 1, padding: 16, justifyContent: "space-between", marginVertical: 18 },
  neonRoutePlaceholder: { flex: 1, position: "relative", justifyContent: "center" },
  routeDotStart: { position: "absolute", left: "15%", top: "70%", width: 10, height: 10, borderRadius: 5, backgroundColor: "#10B981" },
  routeSegment1: { position: "absolute", left: "18%", top: "40%", width: "40%", height: 3, backgroundColor: "#E11D48", transform: [{ rotate: "-25deg" }] },
  routeSegment2: { position: "absolute", left: "50%", top: "25%", width: "35%", height: 3, backgroundColor: "#EC4899", transform: [{ rotate: "18deg" }] },
  routeDotCurrent: { position: "absolute", right: "12%", top: "35%", width: 14, height: 14, borderRadius: 7, backgroundColor: "#E11D48", borderWidth: 2, borderColor: "#FFFFFF" },
  mapFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTopWidth: 1 },
  heartRateText: { color: "#E11D48", fontSize: 11, fontWeight: "800" },
  elevationText: { fontSize: 11, fontWeight: "600" },
  actionWrap: { marginTop: 14 },
  startGradientBtn: { backgroundColor: "#E11D48", borderRadius: 999, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  circularControlsRow: { flexDirection: "row", justifyContent: "center", gap: 32, marginTop: 18 },
  pauseCircleBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#E11D48", alignItems: "center", justifyContent: "center" },
  resumeCircleBtn: { width: 78, height: 78, borderRadius: 39, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  stopCircleBtn: { width: 78, height: 78, borderRadius: 39, alignItems: "center", justifyContent: "center" },
  circleBtnLabel: { color: "#FAFAFA", fontSize: 10, fontWeight: "800", marginTop: 4 },
  circleBtnLabelDark: { fontSize: 10, fontWeight: "800", marginTop: 4 },
  finishedCard: { borderRadius: 20, padding: 22, alignItems: "center", borderWidth: 1, marginTop: 16 },
  finishedTitle: { fontSize: 18, fontWeight: "900", marginTop: 10 },
  finishedDesc: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 18 },
  stampActionBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#E11D48", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, marginTop: 16 },
  stampActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  stampConfirmedRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 16 },
  stampConfirmedText: { color: "#10B981", fontSize: 12, fontWeight: "800" },
  shareFeedRunBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  shareFeedRunText: { fontSize: 12, fontWeight: "700" },
  resetBtn: { flexDirection: "row", alignItems: "center", marginTop: 14, padding: 8 },
  resetBtnText: { fontSize: 12, fontWeight: "700" },
});

import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Play, Pause, Square, MapPin, Footprints, Flame, CheckCircle2, RotateCcw } from "lucide-react-native";

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* GPS LIVE ENGINE CARD */}
      <View style={styles.mapPreviewBox}>
        <View style={styles.gpsStatusRow}>
          <MapPin size={14} color="#10B981" />
          <Text style={styles.gpsStatusText}>GPS LOCK: HIGH ACCURACY (BGC TRACK 30TH)</Text>
        </View>

        <View style={styles.bigMetricRow}>
          <Text style={styles.bigDistance}>{distanceKm.toFixed(2)}</Text>
          <Text style={styles.bigUnit}>KILOMETERS</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{formatTime(seconds)}</Text>
            <Text style={styles.statLabel}>DURATION</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>
              {distanceKm > 0 ? `${(seconds / 60 / distanceKm).toFixed(1)} /km` : "--:--"}
            </Text>
            <Text style={styles.statLabel}>AVG PACE</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{Math.round(distanceKm * 62)}</Text>
            <Text style={styles.statLabel}>ACTIVE KCAL</Text>
          </View>
        </View>
      </View>

      {/* CONTROLS BASED ON STATE */}
      {!isActive && !isFinished && (
        <View style={styles.actionWrap}>
          {seconds === 0 ? (
            <TouchableOpacity onPress={() => setIsActive(true)} style={styles.startBtn}>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>Start Outdoor GPS Run</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.pausedRow}>
              <TouchableOpacity onPress={() => setIsActive(true)} style={styles.resumeBtn}>
                <Play size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.resumeText}>Resume</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
                <Square size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.finishText}>Finish</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {isActive && (
        <View style={styles.activeRow}>
          <TouchableOpacity onPress={() => setIsActive(false)} style={styles.pauseBtn}>
            <Pause size={18} color="#FAFAFA" />
            <Text style={styles.pauseBtnText}>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
            <Square size={16} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.finishText}>Finish Run</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FINISHED RUN SUMMARY & PR MOVE STAMP */}
      {isFinished && (
        <View style={styles.finishedCard}>
          <CheckCircle2 size={32} color="#10B981" />
          <Text style={styles.finishedTitle}>RUN COMPLETED</Text>
          <Text style={styles.finishedDesc}>
            {distanceKm.toFixed(2)} km in {formatTime(seconds)} • {(seconds / 60 / Math.max(0.01, distanceKm)).toFixed(1)} /km pace
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
            <Text style={styles.resetBtnText}>New Outdoor Session</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  content: { padding: 16 },
  mapPreviewBox: { backgroundColor: "#121215", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#27272A", marginBottom: 16 },
  gpsStatusRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  gpsStatusText: { color: "#10B981", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  bigMetricRow: { alignItems: "center", marginVertical: 10 },
  bigDistance: { color: "#FAFAFA", fontSize: 56, fontWeight: "900", letterSpacing: -1 },
  bigUnit: { color: "#71717A", fontSize: 11, fontWeight: "800", letterSpacing: 1, marginTop: -4 },
  statsRow: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 1, borderTopColor: "#1E1E24", paddingTop: 14, marginTop: 14 },
  statItem: { alignItems: "center" },
  statVal: { color: "#FAFAFA", fontSize: 18, fontWeight: "800" },
  statLabel: { color: "#71717A", fontSize: 10, fontWeight: "700", marginTop: 2 },
  actionWrap: { marginBottom: 16 },
  startBtn: { backgroundColor: "#10B981", borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  startBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  activeRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  pauseBtn: { flex: 1, backgroundColor: "#27272A", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  pauseBtnText: { color: "#FAFAFA", fontSize: 13, fontWeight: "700" },
  pausedRow: { flexDirection: "row", gap: 10 },
  resumeBtn: { flex: 1, backgroundColor: "#10B981", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  resumeText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  finishBtn: { flex: 1, backgroundColor: "#E11D48", borderRadius: 12, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  finishText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },
  finishedCard: { backgroundColor: "#121215", borderRadius: 16, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#27272A" },
  finishedTitle: { color: "#FAFAFA", fontSize: 16, fontWeight: "800", marginTop: 8 },
  finishedDesc: { color: "#A1A1AA", fontSize: 12, marginTop: 4, textAlign: "center" },
  stampActionBtn: { backgroundColor: "#EC4899", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", marginTop: 14 },
  stampActionText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" },
  stampSuccessBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(16, 185, 129, 0.15)", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginTop: 14 },
  stampSuccessText: { color: "#10B981", fontSize: 11, fontWeight: "700" },
  resetBtn: { flexDirection: "row", alignItems: "center", marginTop: 14, padding: 6 },
  resetBtnText: { color: "#A1A1AA", fontSize: 12, fontWeight: "600" },
});
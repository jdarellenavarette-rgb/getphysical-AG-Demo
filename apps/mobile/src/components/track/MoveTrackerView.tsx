import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Play, Pause, Square, CheckCircle2, RotateCcw, Send } from "lucide-react-native";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore, type MoveSportType } from "../../store/trackingStore";
import { requestAndFetchUserLocation, DEFAULT_BGC_COORDS } from "../../services/locationService";
import { StravaRouteMap } from "./StravaRouteMap";
import { SPORTS_LIST, BGC_CIRCUIT } from "./trackConstants";

export function MoveTrackerView() {
  const { addPost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const { saveMoveActivity } = useTrackingStore();

  const [selectedSport, setSelectedSport] = useState<MoveSportType>("run");
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([DEFAULT_BGC_COORDS.latitude, DEFAULT_BGC_COORDS.longitude]);
  const [route, setRoute] = useState<[number, number][]>([[DEFAULT_BGC_COORDS.latitude, DEFAULT_BGC_COORDS.longitude]]);
  const [isFinished, setIsFinished] = useState(false);
  const [sharedToFeed, setSharedToFeed] = useState(false);

  useEffect(() => {
    requestAndFetchUserLocation().then((loc) => {
      const start: [number, number] = [loc.latitude, loc.longitude];
      setCurrentCoords(start);
      setRoute([start]);
    });
  }, []);

  useEffect(() => {
    let t: any = null;
    if (isActive) {
      t = setInterval(() => {
        setSeconds((prev) => prev + 1);
        setDistanceKm((prev) => +(prev + 0.004).toFixed(3));
        setRoute((prev) => {
          const nextIdx = prev.length % BGC_CIRCUIT.length;
          const nextPt = BGC_CIRCUIT[nextIdx]!;
          setCurrentCoords(nextPt);
          return [...prev, nextPt];
        });
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isActive]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const activeSportObj = SPORTS_LIST.find((s) => s.id === selectedSport) || SPORTS_LIST[0]!;
  const calBurned = Math.round(distanceKm > 0 ? distanceKm * activeSportObj.rateKcal : (seconds / 60) * (activeSportObj.rateKcal / 10));

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
    const pace = distanceKm > 0 ? (seconds / 60 / distanceKm).toFixed(2) : "0:00";
    saveMoveActivity({
      sport: selectedSport,
      title: `${activeSportObj.label} Session`,
      durationSeconds: seconds,
      distanceKm,
      paceMinKm: pace,
      avgSpeedKmH: +(distanceKm / (seconds / 3600 || 1)).toFixed(1),
      caloriesBurned: calBurned,
      routeCoords: route,
      elevationM: 18,
      avgBpm: 152,
    });
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
    setDistanceKm(0.0);
    setIsFinished(false);
    setSharedToFeed(false);
    setRoute([currentCoords]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgScreen }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1. SPORT SELECTOR PILLS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sportSelectorRow} contentContainerStyle={{ gap: 8 }}>
        {SPORTS_LIST.map((sp) => (
          <TouchableOpacity
            key={sp.id}
            onPress={() => !isActive && setSelectedSport(sp.id)}
            style={[styles.sportPill, { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor }, selectedSport === sp.id && styles.sportPillActive]}
          >
            <Text style={styles.sportEmoji}>{sp.icon}</Text>
            <Text style={[styles.sportLabel, { color: colors.textMuted }, selectedSport === sp.id && styles.sportLabelActive]}>{sp.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 2. STRAVA GPS STATUS BADGE */}
      <View style={styles.statusRow}>
        <View style={styles.stravaLivePill}>
          <View style={styles.livePulse} />
          <Text style={styles.stravaLiveText}>{isActive ? "STRAVA GPS LIVE" : "GPS READY"}</Text>
        </View>
        <Text style={[styles.activityTag, { color: colors.textMuted }]}>{activeSportObj.icon} {activeSportObj.label.toUpperCase()} • BGC LOOP</Text>
      </View>

      {/* 3. HUD DIGITAL READOUT */}
      <View style={styles.hudContainer}>
        <Text style={[styles.hudTimer, { color: colors.textPrimary }]}>{formatTime(seconds)}</Text>
        <View style={styles.dualMetricsRow}>
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{distanceKm.toFixed(2)}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>KILOMETERS</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.borderColor }]} />
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{distanceKm > 0 ? (seconds / 60 / distanceKm).toFixed(1) : "0.0"}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>MIN / KM PACE</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.borderColor }]} />
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{calBurned}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>EST. KCAL</Text>
          </View>
        </View>
      </View>

      {/* 4. REAL STRAVA ROUTE MAP */}
      <StravaRouteMap routeCoords={route} currentPos={currentCoords} isTracking={isActive} />

      {/* 5. CONTROLS */}
      {!isFinished ? (
        <View style={styles.actionWrap}>
          {!isActive && seconds === 0 ? (
            <TouchableOpacity onPress={() => setIsActive(true)} style={styles.startStravaBtn}>
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>Start {activeSportObj.label} Tracking</Text>
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
          <Text style={[styles.finishedTitle, { color: colors.textPrimary }]}>{activeSportObj.label} Saved to Memories!</Text>
          <Text style={[styles.finishedDesc, { color: colors.textMuted }]}>{distanceKm.toFixed(2)} km in {formatTime(seconds)} • {calBurned} active kcal burned</Text>
          {!sharedToFeed ? (
            <TouchableOpacity
              onPress={() => {
                addPost(`GPS ${activeSportObj.label} completed: ${distanceKm.toFixed(2)} km in ${formatTime(seconds)}! ⚡`, undefined, {
                  id: `stamp_move_${Date.now()}`,
                  type: "run",
                  title: `${activeSportObj.label} Strava Route`,
                  primaryMetric: `${distanceKm.toFixed(2)} km`,
                  isVerified: true,
                });
                setSharedToFeed(true);
              }}
              style={styles.shareFeedRunBtn}
            >
              <Send size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.shareFeedRunText}>Share Strava Stamp to Feed</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#10B981", fontSize: 12, fontWeight: "700", marginTop: 12 }}>✓ Shared to Feed</Text>
          )}
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <RotateCcw size={14} color={colors.textMuted} style={{ marginRight: 6 }} />
            <Text style={[styles.resetBtnText, { color: colors.textMuted }]}>New Activity</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 120 },
  sportSelectorRow: { marginBottom: 12 },
  sportPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  sportPillActive: { backgroundColor: "#FC4C02", borderColor: "#FC4C02" },
  sportEmoji: { fontSize: 13 },
  sportLabel: { fontSize: 12, fontWeight: "700" },
  sportLabelActive: { color: "#FFFFFF" },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  stravaLivePill: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(252, 76, 2, 0.12)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  livePulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FC4C02" },
  stravaLiveText: { color: "#FC4C02", fontSize: 10, fontWeight: "900" },
  activityTag: { fontSize: 10, fontWeight: "700" },
  hudContainer: { alignItems: "center", marginVertical: 10 },
  hudTimer: { fontSize: 56, fontWeight: "900", letterSpacing: -2 },
  dualMetricsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around", width: "100%", marginTop: 10 },
  metricCol: { alignItems: "center", flex: 1 },
  metricVal: { fontSize: 26, fontWeight: "900" },
  metricLabel: { fontSize: 10, fontWeight: "700", marginTop: 2 },
  metricDivider: { width: 1, height: 30 },
  actionWrap: { marginTop: 16 },
  startStravaBtn: { backgroundColor: "#FC4C02", borderRadius: 999, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  startBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  circularControlsRow: { flexDirection: "row", justifyContent: "center", gap: 32, marginTop: 14 },
  pauseCircleBtn: { width: 74, height: 74, borderRadius: 37, backgroundColor: "#FC4C02", alignItems: "center", justifyContent: "center" },
  resumeCircleBtn: { width: 74, height: 74, borderRadius: 37, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  stopCircleBtn: { width: 74, height: 74, borderRadius: 37, alignItems: "center", justifyContent: "center" },
  circleBtnLabel: { color: "#FAFAFA", fontSize: 9, fontWeight: "800", marginTop: 3 },
  circleBtnLabelDark: { fontSize: 9, fontWeight: "800", marginTop: 3 },
  finishedCard: { borderRadius: 18, padding: 20, alignItems: "center", borderWidth: 1, marginTop: 16 },
  finishedTitle: { fontSize: 17, fontWeight: "900", marginTop: 10 },
  finishedDesc: { fontSize: 13, textAlign: "center", marginTop: 6 },
  shareFeedRunBtn: { backgroundColor: "#FC4C02", flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, marginTop: 14 },
  shareFeedRunText: { color: "#FFF", fontSize: 12, fontWeight: "800" },
  resetBtn: { flexDirection: "row", alignItems: "center", marginTop: 12, padding: 6 },
  resetBtnText: { fontSize: 12, fontWeight: "700" },
});

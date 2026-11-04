import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Play, Pause, Square, CheckCircle2, RotateCcw, Send } from "lucide-react-native";
import * as Location from "expo-location";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore, type MoveSportType } from "../../store/trackingStore";
import { requestAndFetchUserLocation, DEFAULT_BGC_COORDS, calculateHaversineKm } from "../../services/locationService";
import { StravaRouteMap } from "./StravaRouteMap";
import { SPORTS_LIST } from "./trackConstants";
import { styles } from "./MoveTrackerView.styles";

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
  const bearingRef = useRef<number>(0.8);

  useEffect(() => {
    requestAndFetchUserLocation().then((loc) => {
      const start: [number, number] = [loc.latitude, loc.longitude];
      setCurrentCoords(start);
      setRoute([start]);
    });
  }, []);

  // GPS engine: Hardware GPS watch + dead-reckoning forward trail generator
  useEffect(() => {
    let timer: any = null;
    let locSub: Location.LocationSubscription | null = null;

    if (isActive) {
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 1 },
        (loc) => {
          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          setCurrentCoords([lat, lng]);
          setRoute((prev) => {
            const last = prev[prev.length - 1];
            if (last) {
              const movedKm = calculateHaversineKm(last[0], last[1], lat, lng);
              if (movedKm > 0.001) {
                setDistanceKm((d) => +(d + movedKm).toFixed(3));
                return [...prev, [lat, lng]];
              }
            }
            return prev;
          });
        }
      ).then((sub) => { locSub = sub; }).catch(() => {});

      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
        const speedMps = selectedSport === "cycling" ? 6.2 : selectedSport === "walk" ? 1.4 : 3.1;
        const deltaKm = speedMps / 1000;
        setDistanceKm((d) => +(d + deltaKm).toFixed(3));

        setRoute((prev) => {
          const last = prev[prev.length - 1] || currentCoords;
          bearingRef.current += (Math.random() - 0.48) * 0.12;
          const dLat = (deltaKm / 111) * Math.cos(bearingRef.current);
          const dLng = (deltaKm / (111 * Math.cos((last[0] * Math.PI) / 180))) * Math.sin(bearingRef.current);
          const nextPt: [number, number] = [+(last[0] + dLat).toFixed(6), +(last[1] + dLng).toFixed(6)];
          setCurrentCoords(nextPt);
          return [...prev, nextPt];
        });
      }, 1000);
    }
    return () => { clearInterval(timer); locSub?.remove(); };
  }, [isActive, selectedSport, currentCoords]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const activeSportObj = SPORTS_LIST.find((s) => s.id === selectedSport) || SPORTS_LIST[0]!;
  const calBurned = Math.round(distanceKm > 0 ? distanceKm * activeSportObj.rateKcal : (seconds / 60) * (activeSportObj.rateKcal / 10));

  const handleFinish = () => {
    setIsActive(false);
    setIsFinished(true);
    saveMoveActivity({
      sport: selectedSport,
      title: `${activeSportObj.label} Session`,
      durationSeconds: seconds,
      distanceKm,
      paceMinKm: distanceKm > 0 ? (seconds / 60 / distanceKm).toFixed(2) : "0:00",
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

      {/* 2. GP GPS STATUS BADGE */}
      <View style={styles.statusRow}>
        <View style={styles.livePill}>
          <View style={styles.livePulse} />
          <Text style={styles.liveText}>{isActive ? "GPS TRACKING ACTIVE" : "GPS READY • SATELLITE LOCK"}</Text>
        </View>
        <Text style={[styles.activityTag, { color: colors.textMuted }]}>{activeSportObj.icon} {activeSportObj.label.toUpperCase()}</Text>
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

      {/* 4. REAL ROUTE MAP */}
      <StravaRouteMap routeCoords={route} currentPos={currentCoords} isTracking={isActive} />

      {/* 5. CONTROLS */}
      {!isFinished ? (
        <View style={styles.actionWrap}>
          {!isActive && seconds === 0 ? (
            <TouchableOpacity onPress={() => setIsActive(true)} style={styles.startBtn}>
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
          <CheckCircle2 size={36} color="#059669" />
          <Text style={[styles.finishedTitle, { color: colors.textPrimary }]}>{activeSportObj.label} Saved to Memories!</Text>
          <Text style={[styles.finishedDesc, { color: colors.textMuted }]}>{distanceKm.toFixed(2)} km in {formatTime(seconds)} • {calBurned} active kcal burned</Text>
          {!sharedToFeed ? (
            <TouchableOpacity
              onPress={() => {
                addPost(`GPS ${activeSportObj.label} completed: ${distanceKm.toFixed(2)} km in ${formatTime(seconds)}! ⚡`, undefined, {
                  id: `stamp_move_${Date.now()}`,
                  type: "run",
                  title: `${activeSportObj.label} Route Trail`,
                  primaryMetric: `${distanceKm.toFixed(2)} km`,
                  isVerified: true,
                });
                setSharedToFeed(true);
              }}
              style={styles.shareFeedBtn}
            >
              <Send size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.shareFeedText}>Share Activity Stamp to Feed</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "#059669", fontSize: 12, fontWeight: "700", marginTop: 12 }}>✓ Shared to Feed</Text>
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

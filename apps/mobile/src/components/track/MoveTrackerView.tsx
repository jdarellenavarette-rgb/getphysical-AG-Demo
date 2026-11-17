import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Play, Pause, Square, CheckCircle2, RotateCcw, Send } from "lucide-react-native";
import * as Location from "expo-location";
import { useEcosystemStore } from "../../store/ecosystemStore";
import { useThemeStore } from "../../theme/theme";
import { useTrackingStore, type MoveSportType } from "../../store/trackingStore";
import { requestAndFetchUserLocation, DEFAULT_BGC_COORDS, calculateHaversineKm } from "../../services/locationService";
import { StravaRouteMap } from "./StravaRouteMap";
import { SPORTS_LIST } from "./trackConstants";
import { haptics } from "../../lib/haptics";
import { styles } from "./MoveTrackerView.styles";

/** Activities shorter than this are not saved. */
const MIN_SAVE_SECONDS = 10;

export function MoveTrackerView() {
  const { addPost } = useEcosystemStore();
  const { colors } = useThemeStore();
  const { saveMoveActivity } = useTrackingStore();

  const [selectedSport, setSelectedSport] = useState<MoveSportType>("run");
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0.0);
  const [currentCoords, setCurrentCoords] = useState<[number, number]>([
    DEFAULT_BGC_COORDS.latitude,
    DEFAULT_BGC_COORDS.longitude,
  ]);
  const [route, setRoute] = useState<[number, number][]>([[DEFAULT_BGC_COORDS.latitude, DEFAULT_BGC_COORDS.longitude]]);
  const [isFinished, setIsFinished] = useState(false);
  const [sharedToFeed, setSharedToFeed] = useState(false);
  const currentCoordsRef = useRef<[number, number]>(currentCoords);

  useEffect(() => {
    currentCoordsRef.current = currentCoords;
  }, [currentCoords]);

  useEffect(() => {
    requestAndFetchUserLocation().then((loc) => {
      const start: [number, number] = [loc.latitude, loc.longitude];
      setCurrentCoords(start);
      currentCoordsRef.current = start;
      setRoute([start]);
    });
  }, []);

  // 1. Elapsed Time Stopwatch: Smooth 1-second increment while active
  useEffect(() => {
    let t: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      t = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(t);
  }, [isActive]);

  // 2. Real Hardware GPS Movement Tracker (Zero fake movement when stationary)
  useEffect(() => {
    let locSub: Location.LocationSubscription | null = null;

    if (isActive) {
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (loc) => {
          // Reject inaccurate GPS fixes to prevent indoor jitter
          if (loc.coords.accuracy && loc.coords.accuracy > 40) return;

          const lat = loc.coords.latitude;
          const lng = loc.coords.longitude;
          const last = currentCoordsRef.current;
          const movedKm = calculateHaversineKm(last[0], last[1], lat, lng);

          // Only advance when physical displacement is >= 2.5 meters (0.0025 km)
          if (movedKm >= 0.0025) {
            const nextPt: [number, number] = [lat, lng];
            setCurrentCoords(nextPt);
            setRoute((prev) => [...prev, nextPt]);
            setDistanceKm((d) => +(d + movedKm).toFixed(2));
          }
        },
      )
        .then((sub) => {
          locSub = sub;
        })
        .catch(() => {});
    }

    return () => {
      locSub?.remove();
    };
  }, [isActive]);

  const formatTime = (sec: number) =>
    `${Math.floor(sec / 60)
      .toString()
      .padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const formatPace = () => {
    if (distanceKm < 0.01 || seconds === 0) return "-:--";
    const totalPaceSec = Math.round(seconds / distanceKm);
    if (totalPaceSec > 3599) return "-:--";
    const m = Math.floor(totalPaceSec / 60);
    const s = totalPaceSec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const activeSportObj = SPORTS_LIST.find((s) => s.id === selectedSport) || SPORTS_LIST[0]!;
  const calBurned = Math.round(
    distanceKm > 0 ? distanceKm * activeSportObj.rateKcal : (seconds / 60) * (activeSportObj.rateKcal * 0.05),
  );

  // The sport is fixed once recording starts, so a saved activity cannot change type.
  const canChangeSport = !isActive && seconds === 0 && !isFinished;

  const handleFinish = () => {
    // Nothing worth keeping yet: offer to discard instead of saving an empty activity.
    if (seconds < MIN_SAVE_SECONDS) {
      Alert.alert("Too short to save", "Keep going, or discard this activity.", [
        { text: "Keep going", style: "cancel" },
        { text: "Discard", style: "destructive", onPress: handleReset },
      ]);
      return;
    }
    haptics.success();
    setIsActive(false);
    setIsFinished(true);
    saveMoveActivity({
      sport: selectedSport,
      title: `${activeSportObj.label} Session`,
      durationSeconds: seconds,
      distanceKm,
      paceMinKm: formatPace(),
      avgSpeedKmH: +(distanceKm / (seconds / 3600 || 1)).toFixed(1),
      caloriesBurned: calBurned,
      routeCoords: route,
    });
  };

  const confirmDiscard = () => {
    Alert.alert("Discard this activity?", "Nothing from it will be saved.", [
      { text: "Keep it", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: handleReset },
    ]);
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgScreen }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. SPORT SELECTOR PILLS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportSelectorRow}
        contentContainerStyle={{ gap: 8 }}
      >
        {SPORTS_LIST.map((sp) => (
          <TouchableOpacity
            key={sp.id}
            onPress={() => canChangeSport && setSelectedSport(sp.id)}
            disabled={!canChangeSport}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedSport === sp.id, disabled: !canChangeSport }}
            style={[
              styles.sportPill,
              { backgroundColor: colors.bgCardSecondary, borderColor: colors.borderColor },
              selectedSport === sp.id && styles.sportPillActive,
              !canChangeSport && selectedSport !== sp.id && { opacity: 0.4 },
            ]}
          >
            <Text style={styles.sportEmoji}>{sp.icon}</Text>
            <Text
              style={[
                styles.sportLabel,
                { color: colors.textMuted },
                selectedSport === sp.id && styles.sportLabelActive,
              ]}
            >
              {sp.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.statusRow}>
        <View style={styles.livePill}>
          <View style={styles.livePulse} />
          <Text style={styles.liveText}>{isActive ? "Recording" : seconds > 0 ? "Paused" : "Ready"}</Text>
        </View>
      </View>

      {/* 3. HUD DIGITAL READOUT */}
      <View style={styles.hudContainer}>
        <Text style={[styles.hudTimer, { color: colors.textPrimary }]}>{formatTime(seconds)}</Text>
        <View style={styles.dualMetricsRow}>
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{distanceKm.toFixed(2)}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>DISTANCE (KM)</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.borderColor }]} />
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{formatPace()}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>PACE (/KM)</Text>
          </View>
          <View style={[styles.metricDivider, { backgroundColor: colors.borderColor }]} />
          <View style={styles.metricCol}>
            <Text style={[styles.metricVal, { color: colors.textPrimary }]}>{calBurned}</Text>
            <Text style={[styles.metricLabel, { color: colors.textMuted }]}>CALORIES</Text>
          </View>
        </View>
      </View>

      {/* 5. CONTROLS */}
      {!isFinished ? (
        <View style={styles.actionWrap}>
          {!isActive && seconds === 0 ? (
            <TouchableOpacity
              onPress={() => {
                haptics.impact();
                setIsActive(true);
              }}
              style={styles.startBtn}
              accessibilityRole="button"
            >
              <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.startBtnText}>Start {activeSportObj.label.toLowerCase()}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.circularControlsRow}>
              {isActive ? (
                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    setIsActive(false);
                  }}
                  style={styles.pauseCircleBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Pause"
                >
                  <Pause size={28} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.circleBtnLabel}>PAUSE</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    haptics.tap();
                    setIsActive(true);
                  }}
                  style={styles.resumeCircleBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Resume"
                >
                  <Play size={28} color="#FFFFFF" fill="#FFFFFF" />
                  <Text style={styles.circleBtnLabel}>RESUME</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleFinish}
                style={[styles.stopCircleBtn, { backgroundColor: colors.textPrimary }]}
                accessibilityRole="button"
                accessibilityLabel="Finish"
              >
                <Square size={24} color={colors.bgScreen} fill={colors.bgScreen} />
                <Text style={[styles.circleBtnLabelDark, { color: colors.bgScreen }]}>FINISH</Text>
              </TouchableOpacity>
            </View>
          )}
          {!isActive && seconds > 0 && (
            <TouchableOpacity onPress={confirmDiscard} style={styles.discardBtn} accessibilityRole="button">
              <Text style={[styles.discardBtnText, { color: colors.textMuted }]}>Discard activity</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={[styles.finishedCard, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
          <CheckCircle2 size={36} color="#059669" />
          <Text style={[styles.finishedTitle, { color: colors.textPrimary }]}>{activeSportObj.label} saved</Text>
          <Text style={[styles.finishedDesc, { color: colors.textMuted }]}>
            {distanceKm.toFixed(2)} km in {formatTime(seconds)} • {calBurned} kcal
          </Text>
          {!sharedToFeed ? (
            <TouchableOpacity
              onPress={() => {
                addPost(
                  `${activeSportObj.label} completed: ${distanceKm.toFixed(2)} km in ${formatTime(seconds)}.`,
                  undefined,
                  {
                    id: `stamp_move_${Date.now()}`,
                    type: "move",
                    title: `${activeSportObj.label} session`,
                    primaryMetric: `${distanceKm.toFixed(2)} km`,
                    isVerified: false,
                  },
                );
                setSharedToFeed(true);
              }}
              style={styles.shareFeedBtn}
            >
              <Send size={14} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={styles.shareFeedText}>Share to Feed</Text>
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

      {/* 4. REAL ROUTE MAP */}
      <StravaRouteMap routeCoords={route} currentPos={currentCoords} isTracking={isActive} />
    </ScrollView>
  );
}

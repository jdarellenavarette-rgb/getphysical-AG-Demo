import React, { useEffect, useRef } from "react";
import { View, Image, StyleSheet, StatusBar, Animated, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OpeningLoadingScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export function OpeningLoadingScreen({ onFinish, durationMs = 2400 }: OpeningLoadingScreenProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Fluid entrance: smooth scale-up & fade-in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: durationMs - 400,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Smooth dismissal into the app
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, durationMs);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, progressAnim, durationMs, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="light-content" />

      {/* AMBIENT RADIAL LIGHTING BEHIND EMBLEM */}
      <View style={styles.ambientGlow} />

      {/* HIGH-DEFINITION BRAND COMPOSITION */}
      <Animated.View style={[styles.centerBrandBlock, { transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require("../../../assets/gp_emblem_hd.png")}
          style={styles.gpEmblem}
          resizeMode="contain"
        />
        <Text style={styles.brandTitle}>getphysical</Text>
        <Text style={styles.brandSubtitle}>Welcome to GetPhysical</Text>
      </Animated.View>

      {/* REFINED BRAND PROGRESS LINE */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 24) + 16 }]}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: progressWidth }]} />
        </View>
        <TouchableOpacity onPress={onFinish} style={styles.skipBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Tap to enter</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#121214",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  ambientGlow: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(225, 29, 72, 0.14)",
  },
  centerBrandBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  gpEmblem: {
    width: 154,
    height: 68,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -1,
    marginTop: 14,
  },
  brandSubtitle: {
    color: "#8E8E93",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.2,
    marginTop: 8,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 40,
    right: 40,
    alignItems: "center",
    gap: 12,
  },
  track: {
    width: 140,
    height: 3,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#E11D48",
    borderRadius: 2,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  skipText: {
    color: "#71717A",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

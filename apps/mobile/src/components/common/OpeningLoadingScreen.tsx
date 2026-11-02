import React, { useEffect, useState, useRef } from "react";
import { View, Image, StyleSheet, StatusBar, Animated, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OpeningLoadingScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export function OpeningLoadingScreen({ onFinish, durationMs = 2200 }: OpeningLoadingScreenProps) {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.96)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Entrance animation (subtle scale & fade in)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: durationMs - 400,
        useNativeDriver: false,
      }),
    ]).start();

    // 2. Smooth dismissal after durationMs
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

      {/* FULLSCREEN MOCKUP ASSET WITH 100% VISUAL FIDELITY */}
      <Animated.View style={[styles.contentWrapper, { transform: [{ scale: scaleAnim }] }]}>
        <Image
          source={require("../../../assets/opening_splash.png")}
          style={styles.splashImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* SUBTLE BRAND PROGRESS LINE */}
      <View style={[styles.footerContainer, { paddingBottom: Math.max(insets.bottom, 20) + 16 }]}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, { width: progressWidth }]} />
        </View>
        <TouchableOpacity onPress={onFinish} style={styles.skipBtn}>
          <Text style={styles.skipText}>Tap to skip</Text>
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
  contentWrapper: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  splashImage: {
    width: "100%",
    height: "100%",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 40,
    right: 40,
    alignItems: "center",
    gap: 10,
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

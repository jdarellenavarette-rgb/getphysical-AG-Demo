import React, { useCallback, useEffect, useRef } from "react";
import { Image, StyleSheet, StatusBar, Animated, TouchableWithoutFeedback } from "react-native";

interface OpeningLoadingScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export function OpeningLoadingScreen({ onFinish, durationMs = 2200 }: OpeningLoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const isFinishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  const dismissScreen = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinishRef.current();
    });
  }, [fadeAnim]);

  useEffect(() => {
    // 1. Fluid entrance: smooth scale-up & fade-in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Auto-transition into the app
    const timer = setTimeout(() => {
      dismissScreen();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, dismissScreen, fadeAnim, scaleAnim]);

  return (
    <TouchableWithoutFeedback onPress={dismissScreen}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" />

        {/* HIGH-DEFINITION BRAND COMPOSITION */}
        <Animated.View style={[styles.centerBrandBlock, { transform: [{ scale: scaleAnim }] }]}>
          <Image
            source={require("../../../assets/brand/gp_wordmark.png")}
            style={styles.wordmark}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="GetPhysical"
          />
        </Animated.View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000000",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBrandBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  // The full logo, sized from its own proportions (about 6.15 : 1).
  wordmark: { width: 260, height: 42 },
});

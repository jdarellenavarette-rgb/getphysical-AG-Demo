import React, { useCallback, useEffect, useRef } from "react";
import { Image, StyleSheet, StatusBar, Text, TouchableWithoutFeedback } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

interface OpeningLoadingScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

/** Branded launch splash; all motion runs on the UI thread (Reanimated). */
export function OpeningLoadingScreen({ onFinish, durationMs = 2200 }: OpeningLoadingScreenProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.94);
  const isFinishedRef = useRef(false);

  const dismissScreen = useCallback(() => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    opacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) scheduleOnRN(onFinish);
    });
  }, [onFinish, opacity]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    scale.value = withSpring(1, { damping: 14, stiffness: 120 });
    const timer = setTimeout(dismissScreen, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, dismissScreen, opacity, scale]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const scaleStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <TouchableWithoutFeedback onPress={dismissScreen} accessibilityRole="button" accessibilityLabel="GetPhysical. Tap to continue">
      <Animated.View style={[styles.container, fadeStyle]}>
        <StatusBar barStyle="light-content" />

        {/* HIGH-DEFINITION BRAND COMPOSITION */}
        <Animated.View style={[styles.centerBrandBlock, scaleStyle]}>
          <Image
            source={require("../../../assets/gp_emblem_hd.png")}
            style={styles.gpEmblem}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>getphysical</Text>
          <Text style={styles.brandSubtitle}>Welcome to GetPhysical</Text>
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
    backgroundColor: "#151517",
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  centerBrandBlock: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  gpEmblem: {
    width: 180,
    height: 82,
    marginBottom: 8,
  },
  brandTitle: {
    color: "#FFFFFF",
    fontSize: 33,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: -0.6,
    marginTop: 8,
  },
  brandSubtitle: {
    color: "#9CA3AF",
    fontSize: 15,
    fontWeight: "400",
    letterSpacing: 0.15,
    marginTop: 6,
  },
});

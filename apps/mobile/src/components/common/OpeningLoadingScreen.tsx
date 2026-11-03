import React, { useEffect, useRef } from "react";
import {
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Text,
  TouchableWithoutFeedback,
} from "react-native";

interface OpeningLoadingScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export function OpeningLoadingScreen({
  onFinish,
  durationMs = 2200,
}: OpeningLoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const isFinishedRef = useRef(false);

  const dismissScreen = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

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
  }, [durationMs]);

  return (
    <TouchableWithoutFeedback onPress={dismissScreen}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <StatusBar barStyle="light-content" />

        {/* HIGH-DEFINITION BRAND COMPOSITION */}
        <Animated.View
          style={[styles.centerBrandBlock, { transform: [{ scale: scaleAnim }] }]}
        >
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

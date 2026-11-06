import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { GestureDetector, useTapGesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Heart } from "lucide-react-native";
import { MOTION } from "sodia-core";
import { useColors } from "../../../theme/theme";

interface DoubleTapLikeProps {
  onDoubleTap: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

/**
 * Instagram-style double-tap-to-like. Gesture recognition and the heart burst
 * both run on the UI thread; only the like callback hops back to JS.
 */
export function DoubleTapLike({ onDoubleTap, children, style, accessibilityLabel }: DoubleTapLikeProps) {
  const colors = useColors();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    maxDuration: 250,
    onActivate: () => {
      "worklet";
      scale.value = withSequence(withSpring(1, MOTION.spring), withDelay(380, withTiming(0.6, { duration: MOTION.fastMs })));
      opacity.value = withSequence(withTiming(1, { duration: 90 }), withDelay(420, withTiming(0, { duration: MOTION.baseMs })));
      scheduleOnRN(onDoubleTap);
    },
  });

  const heartStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={doubleTap}>
      <View
        style={style}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to like"
        accessibilityActions={[{ name: "activate", label: "Like" }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === "activate") onDoubleTap();
        }}
      >
        {children}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.center, heartStyle]}>
          <Heart size={96} color={colors.textOnMedia} fill={colors.textOnMedia} strokeWidth={1} style={styles.shadow} />
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  shadow: { shadowColor: "#000000", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
});

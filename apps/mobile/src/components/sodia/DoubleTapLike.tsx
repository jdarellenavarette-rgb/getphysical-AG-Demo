import React, { useRef, type ReactNode } from "react";
import { Animated, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { Heart } from "lucide-react-native";

interface DoubleTapLikeProps {
  /** Called on a double tap. A double tap only ever likes; it never removes a like. */
  onLike: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

const DOUBLE_TAP_MS = 280;

/** Wraps a photo so a double tap likes it and a heart pops over the image. */
export function DoubleTapLike({ onLike, style, children }: DoubleTapLikeProps) {
  const lastTap = useRef(0);
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTap.current > DOUBLE_TAP_MS) {
      lastTap.current = now;
      return;
    }
    lastTap.current = 0;
    onLike();
    scale.setValue(0.4);
    opacity.setValue(1);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 220, delay: 260, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable onPress={handlePress} style={style} accessible={false}>
      {children}
      <Animated.View pointerEvents="none" style={[styles.heart, { opacity, transform: [{ scale }] }]}>
        <Heart size={96} color="#FFFFFF" fill="#FFFFFF" />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heart: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
});

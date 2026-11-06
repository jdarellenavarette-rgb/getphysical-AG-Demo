import React, { createContext, useContext, useEffect } from "react";
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { RADII, SPACING } from "sodia-core";
import { useColors } from "../../theme/theme";

const ShimmerContext = createContext<SharedValue<number> | null>(null);

/** One UI-thread clock drives every block inside the group so they pulse in sync. */
export function SkeletonGroup({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const progress = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return undefined;
    progress.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true);
    return () => cancelAnimation(progress);
  }, [progress, reduceMotion]);

  return (
    <ShimmerContext.Provider value={progress}>
      <View
        style={style}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading content"
        accessibilityState={{ busy: true }}
      >
        {children}
      </View>
    </ShimmerContext.Provider>
  );
}

interface BoneProps {
  width?: DimensionValue;
  height: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Bone({ width = "100%", height, radius = RADII.sm, style }: BoneProps) {
  const colors = useColors();
  const ctx = useContext(ShimmerContext);
  const fallback = useSharedValue(0);
  const progress = ctx ?? fallback;
  const base = colors.skeletonBase;
  const highlight = colors.skeletonHighlight;

  const animated = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [base, highlight]),
  }));

  return <Animated.View style={[{ width, height, borderRadius: radius }, animated, style]} />;
}

/** Matches SodiaPostCard geometry: author row, 310pt media, action row, caption. */
export function PostCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[styles.post, { backgroundColor: colors.bgCard, borderColor: colors.borderColor }]}>
      <View style={styles.rowPad}>
        <Bone width={38} height={38} radius={19} />
        <View style={styles.flexGap}>
          <Bone width="45%" height={12} />
          <Bone width="30%" height={10} />
        </View>
      </View>
      <Bone height={310} radius={0} />
      <View style={styles.footer}>
        <View style={styles.actionRow}>
          <Bone width={24} height={24} radius={12} />
          <Bone width={24} height={24} radius={12} />
          <Bone width={24} height={24} radius={12} />
        </View>
        <Bone width="55%" height={12} />
        <Bone width="85%" height={12} />
      </View>
    </View>
  );
}

/** Avatar + two text lines; used by inbox, activity, comments, discover rows, ledgers. */
export function ListRowSkeleton({ avatarSize = 44 }: { avatarSize?: number }) {
  return (
    <View style={styles.listRow}>
      <Bone width={avatarSize} height={avatarSize} radius={avatarSize / 2} />
      <View style={styles.flexGap}>
        <Bone width="60%" height={12} />
        <Bone width="85%" height={10} />
      </View>
    </View>
  );
}

/** Wallet pass stack (Apple Wallet style 200pt cards). */
export function CardStackSkeleton() {
  return (
    <View style={styles.cardStack}>
      <Bone height={200} radius={RADII.xl} />
      <Bone height={64} radius={RADII.xl} style={styles.cardPeek} />
    </View>
  );
}

export type SkeletonVariant = "post" | "row" | "card";

export function SkeletonList({ variant, count }: { variant: SkeletonVariant; count: number }) {
  const items = Array.from({ length: Math.max(1, count) }, (_, i) => i);
  return (
    <SkeletonGroup style={variant === "post" ? styles.postList : styles.list}>
      {items.map((i) =>
        variant === "post" ? <PostCardSkeleton key={i} /> : variant === "card" ? <CardStackSkeleton key={i} /> : <ListRowSkeleton key={i} />
      )}
    </SkeletonGroup>
  );
}

const styles = StyleSheet.create({
  post: { borderTopWidth: 1, borderBottomWidth: 1 },
  rowPad: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  flexGap: { flex: 1, gap: SPACING.sm },
  footer: { padding: 14, gap: SPACING.sm },
  actionRow: { flexDirection: "row", gap: 14, marginBottom: SPACING.xs },
  listRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  cardStack: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg },
  cardPeek: { marginTop: -24, marginHorizontal: SPACING.md, opacity: 0.7 },
  postList: { gap: 18, paddingTop: SPACING.md },
  list: { paddingTop: SPACING.sm },
});

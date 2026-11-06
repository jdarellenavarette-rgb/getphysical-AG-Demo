import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import Animated, { FadeOutUp, SlideInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Bell, X, ArrowRight, Tag } from "lucide-react-native";
import { useCrmMessagingStore } from "../../store/crmMessagingStore";
import { useThemeStore } from "../../theme/theme";

interface CrmToastBannerProps {
  onPressToast: (threadId: string) => void;
}

export function CrmToastBanner({ onPressToast }: CrmToastBannerProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useThemeStore();
  const { activeToast, dismissToast } = useCrmMessagingStore();

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast, dismissToast]);

  if (!activeToast) return null;

  return (
    <Animated.View
      key={activeToast.id}
      entering={SlideInUp.springify().damping(18)}
      exiting={FadeOutUp.duration(180)}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        {
          top: Math.max(insets.top, 44) + 6,
          backgroundColor: colors.bgCard,
          borderColor: colors.accent,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          const tid = activeToast.threadId;
          dismissToast();
          onPressToast(tid);
        }}
        style={styles.innerTouch}
        accessibilityRole="button"
        accessibilityLabel={`${activeToast.title}. ${activeToast.body}. Open conversation`}
      >
        <Image source={{ uri: activeToast.senderAvatar }} style={styles.senderAvatar} />

        <View style={styles.contentWrap}>
          <View style={styles.topRow}>
            <View style={styles.badgePill}>
              <Bell size={10} color="#FFFFFF" />
              <Text style={styles.badgeText}>CRM BROADCAST</Text>
            </View>
            <Text style={[styles.timeText, { color: colors.textMuted }]}>{activeToast.timestamp}</Text>
          </View>

          <Text numberOfLines={1} style={[styles.titleText, { color: colors.textPrimary }]}>
            {activeToast.title}
          </Text>

          <Text numberOfLines={2} style={[styles.bodyText, { color: colors.textSecondary }]}>
            {activeToast.body}
          </Text>

          {activeToast.promoCode ? (
            <View style={styles.promoPill}>
              <Tag size={10} color={colors.accent} />
              <Text style={styles.promoCodeText}>PROMO: {activeToast.promoCode}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity onPress={dismissToast} hitSlop={12} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Dismiss notification">
          <X size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 14,
    right: 14,
    zIndex: 9999,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  innerTouch: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    gap: 10,
  },
  senderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#E11D48",
  },
  contentWrap: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E11D48",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  titleText: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 17,
  },
  bodyText: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  promoPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(225, 29, 72, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
    gap: 4,
  },
  promoCodeText: {
    color: "#E11D48",
    fontSize: 11,
    fontWeight: "900",
  },
  closeBtn: {
    padding: 4,
  },
});

import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

/** Haptic feedback. Silent on the web and on devices without a haptic engine. */
function run(effect: () => Promise<void>): void {
  if (Platform.OS === "web") return;
  effect().catch(() => undefined);
}

export const haptics = {
  /** A light tap: toggles, tab changes, selections. */
  tap: () => run(() => Haptics.selectionAsync()),
  /** A firmer tap: a like, completing a set, starting or stopping an activity. */
  impact: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** Something finished well: saved a workout, posted, signed in. */
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  /** Something needs attention: a validation error or a blocked action. */
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};

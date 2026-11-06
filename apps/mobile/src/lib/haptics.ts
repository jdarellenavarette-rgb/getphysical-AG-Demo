import * as Haptics from "expo-haptics";

/** Fire-and-forget haptics. Devices without a taptic engine reject silently. */
export const haptics = {
  selection(): void {
    Haptics.selectionAsync().catch(() => undefined);
  },
  light(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  },
  medium(): void {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  },
  success(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  },
  warning(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  },
  error(): void {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  },
};

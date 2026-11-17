import { useCallback } from "react";
import { Alert } from "react-native";
import { useEcosystemStore } from "../store/ecosystemStore";

/**
 * Guests can look around, but anything that belongs to an account (posting,
 * messaging, buying a pass) asks them to sign in first.
 *
 * Returns a function that is true when the action may go ahead.
 */
export function useRequireAccount(): (action: string) => boolean {
  const isGuest = useEcosystemStore((state) => state.isGuest);
  const setIsGuest = useEcosystemStore((state) => state.setIsGuest);

  return useCallback(
    (action: string) => {
      if (!isGuest) return true;
      Alert.alert("Sign in to continue", `Create a free account or sign in to ${action}.`, [
        { text: "Not now", style: "cancel" },
        // Leaving guest mode returns to the sign-in screen.
        { text: "Sign in", onPress: () => setIsGuest(false) },
      ]);
      return false;
    },
    [isGuest, setIsGuest],
  );
}

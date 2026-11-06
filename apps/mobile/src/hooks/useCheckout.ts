import { useCallback, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import type { CheckoutRequest } from "../components/discover/DiscoverView";
import { getSessionUserId } from "../lib/supabase";
import { startCheckout } from "../services/paymentService";

/**
 * Handles "Pay" from the checkout sheet. Signed-in users go through the real
 * provider checkout; the idempotency key is stable per item so double taps
 * and retries reuse the same order instead of charging twice.
 */
export function useCheckout(onSignedOutPreview: (item: CheckoutRequest) => void) {
  const [pending, setPending] = useState(false);
  const keys = useRef(new Map<string, string>());

  const confirm = useCallback(
    async (item: CheckoutRequest): Promise<boolean> => {
      if (pending) return false;
      if (!(await getSessionUserId())) {
        onSignedOutPreview(item);
        return true;
      }
      let key = keys.current.get(item.id);
      if (!key) {
        key = `${item.id}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 10)}`;
        keys.current.set(item.id, key);
      }
      setPending(true);
      const result = await startCheckout({
        facilityId: item.facilityId,
        sku: item.billingKind === "recurring_subscription" ? "MONTHLY" : "DAY_PASS",
        idempotencyKey: key,
      });
      setPending(false);
      if (!result.ok) {
        Alert.alert("Checkout unavailable", result.correlationId ? `${result.message}\n\nRef: ${result.correlationId}` : result.message);
        return false;
      }
      keys.current.delete(item.id);
      await Linking.openURL(result.data.checkoutUrl);
      return true;
    },
    [pending, onSignedOutPreview]
  );

  return { confirm, pending };
}

import { useCallback, useRef, useState } from "react";
import { Linking } from "react-native";
import type { CheckoutRequest } from "../components/discover/DiscoverView";
import { getSessionUserId } from "../lib/supabase";
import { startCheckout } from "../services/paymentService";

/**
 * Handles "Pay" from the checkout sheet. Buying needs an account, so a guest
 * is asked to sign in. Signed-in users buy one of the venue's own plans: the
 * plan's id is the SKU, and the server sets the price. The idempotency key is
 * stable per item so double taps and retries reuse the same order instead of
 * charging twice.
 *
 * `error` is the message to show in the checkout sheet when the last attempt
 * did not reach the payment page.
 */
export function useCheckout(onSignedOut: () => void) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keys = useRef(new Map<string, string>());

  const clearError = useCallback(() => setError(null), []);

  const confirm = useCallback(
    async (item: CheckoutRequest): Promise<boolean> => {
      if (pending) return false;
      setError(null);
      if (!(await getSessionUserId())) {
        onSignedOut();
        return false;
      }
      // Only a plan from the venue's catalogue can be sold; nothing else has a price on the server.
      if (!item.productId) {
        setError("This can't be bought in the app yet. Choose one of the venue's plans instead.");
        return false;
      }
      let key = keys.current.get(item.id);
      if (!key) {
        key = `${item.id}:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 10)}`;
        keys.current.set(item.id, key);
      }
      setPending(true);
      const result = await startCheckout({ facilityId: item.facilityId, sku: item.productId, idempotencyKey: key });
      setPending(false);
      if (!result.ok) {
        setError(result.correlationId ? `${result.message}\n\nRef: ${result.correlationId}` : result.message);
        return false;
      }
      keys.current.delete(item.id);
      await Linking.openURL(result.data.checkoutUrl);
      return true;
    },
    [pending, onSignedOut],
  );

  return { confirm, pending, error, clearError };
}

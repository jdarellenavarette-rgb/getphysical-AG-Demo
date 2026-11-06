import { FunctionsHttpError } from "@supabase/supabase-js";
import type { CheckoutRequest as CheckoutBody, CheckoutResponse } from "sodia-core";
import { getSupabase } from "../lib/supabase";

export type CheckoutResult =
  | { ok: true; data: CheckoutResponse }
  | { ok: false; code: string; message: string; correlationId?: string };

const FRIENDLY: Record<string, string> = {
  AGE_VERIFICATION_REQUIRED: "Add your date of birth in Settings before buying passes.",
  PAYMENT_BLOCKED_UNDER_18: "Purchases require an account holder aged 18 or over.",
  FACILITY_PAYOUTS_NOT_CONFIGURED: "This facility isn't accepting online payments yet.",
  SKU_NOT_FOR_SALE: "This pass isn't on sale right now.",
  SESSION_EXPIRED: "Your session expired. Sign in again.",
  AUTH_REQUIRED: "Sign in to buy passes.",
};

/**
 * Creates a server-priced order and a provider checkout (Xendit or Stripe).
 * The pass is issued only after the provider's webhook confirms payment.
 */
export async function startCheckout(body: CheckoutBody): Promise<CheckoutResult> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, code: "NOT_CONFIGURED", message: "Payments are unavailable in this build." };

  const { data, error } = await supabase.functions.invoke<CheckoutResponse>("payments-checkout", { body });
  if (!error && data) return { ok: true, data };

  if (error instanceof FunctionsHttpError) {
    const payload = (await error.context.json().catch(() => null)) as
      | { error?: { code?: string; message?: string; correlationId?: string } }
      | null;
    const code = payload?.error?.code ?? "CHECKOUT_FAILED";
    return {
      ok: false,
      code,
      message: FRIENDLY[code] ?? payload?.error?.message ?? "Checkout failed. Please retry.",
      correlationId: payload?.error?.correlationId,
    };
  }
  return { ok: false, code: "NETWORK", message: "You're offline. Reconnect and retry checkout." };
}

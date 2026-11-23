"use server";

import { requireSuiteSession } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export type PayoutActionResult = { ok: true; message: string } | { ok: false; message: string };

function failure(error: { code?: string; message: string }): PayoutActionResult {
  if (error.code === "42501") return { ok: false, message: "Only the owner or an admin can set up payouts." };
  if (error.message.includes("SANDBOX_DISABLED")) {
    return { ok: false, message: "Test payments aren't available here." };
  }
  if (error.message.includes("ALREADY_LIVE"))
    return { ok: false, message: "This business already takes live payments." };
  return { ok: false, message: "We couldn't update payouts. Please retry." };
}

/** Switch on Maya test payments for the active venue. No real money moves. */
export async function connectTestPayouts(): Promise<PayoutActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("connect_sandbox_payouts", { p_facility_id: active.id });
  if (error) return failure(error);
  return {
    ok: true,
    message:
      "Test payments are on. People can now buy from you with the payment provider's test cards. No real money moves.",
  };
}

export async function disconnectTestPayouts(): Promise<PayoutActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("disconnect_sandbox_payouts", { p_facility_id: active.id });
  if (error) return failure(error);
  return { ok: true, message: "Test payments are off." };
}

/** Ask to be told when live split payments open. The request is recorded against the business. */
export async function requestLivePayouts(): Promise<PayoutActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("request_live_payouts", { p_facility_id: active.id });
  if (error) return failure(error);
  return {
    ok: true,
    message: "You're on the list. We'll contact you as soon as live payments open for your kind of business.",
  };
}

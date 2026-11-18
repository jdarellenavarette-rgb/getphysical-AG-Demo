"use server";

import { requireSuiteSession } from "../../lib/active-facility";
import { createServerSupabase } from "../../lib/supabase/server";

export type PayoutActionResult = { ok: true; message: string } | { ok: false; message: string };

function failure(error: { code?: string; message: string }): PayoutActionResult {
  if (error.code === "42501") return { ok: false, message: "Only the owner or an admin can set up payouts." };
  if (error.message.includes("SANDBOX_DISABLED")) {
    return { ok: false, message: "Test payments aren't available here. Request live payouts instead." };
  }
  if (error.message.includes("ALREADY_LIVE")) return { ok: false, message: "This venue already has live payouts." };
  return { ok: false, message: "We couldn't update payouts. Please retry." };
}

/** Switch on Maya test payments for the active venue. No real money moves. */
export async function connectTestPayouts(): Promise<PayoutActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("connect_sandbox_payouts", { p_facility_id: active.id });
  if (error) return failure(error);
  return { ok: true, message: "Maya test payments are on. Members can now buy your plans with Maya's test cards." };
}

export async function disconnectTestPayouts(): Promise<PayoutActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("disconnect_sandbox_payouts", { p_facility_id: active.id });
  if (error) return failure(error);
  return { ok: true, message: "Test payments are off. Your plans can't be bought until payouts are connected again." };
}

/** Ask to be set up for real payouts. The request is recorded; Maya verifies the business directly. */
export async function requestLivePayouts(): Promise<PayoutActionResult> {
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("request_live_payouts", { p_facility_id: active.id });
  if (error) return failure(error);
  return { ok: true, message: "Request recorded. We'll contact you to start verification with Maya." };
}

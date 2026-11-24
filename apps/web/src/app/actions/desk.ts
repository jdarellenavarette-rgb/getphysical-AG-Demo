"use server";

import { z } from "zod";
import { requireSuiteSession } from "../../lib/active-facility";
import { describeDbError, type ActionResult } from "../../lib/form-state";
import { formatPeso } from "../../lib/format";
import { createServerSupabase } from "../../lib/supabase/server";

const paymentSchema = z.object({
  kind: z.enum(["BOOKING", "CLASS", "PACK", "EVENT", "OTHER"]),
  refId: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  amount: z.number().positive().max(1_000_000),
  method: z.enum(["CASH", "EWALLET", "CARD", "BANK", "OTHER"]),
  payerName: z.string().trim().max(120),
});

export type DeskPaymentInput = z.infer<typeof paymentSchema>;

/**
 * Record money the business took itself: cash at the desk, a transfer, an e-wallet payment to its
 * own account. Nothing is charged; this is the business's own record, and it cannot be edited.
 */
export async function recordDeskPayment(input: DeskPaymentInput): Promise<ActionResult> {
  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "That payment could not be recorded." };
  const { active } = await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.from("desk_payments").insert({
    facility_id: active.id,
    amount_php: parsed.data.amount,
    method: parsed.data.method,
    kind: parsed.data.kind,
    ref_id: parsed.data.refId,
    user_id: parsed.data.userId,
    payer_name: parsed.data.payerName || null,
  });
  if (error) return { ok: false, message: describeDbError(error, {}, "We couldn't record the payment. Please retry.") };
  return { ok: true, message: `${formatPeso(parsed.data.amount)} recorded.` };
}

/** Cancel a payment recorded by mistake with a reversing entry. Owners and admins only. */
export async function reverseDeskPayment(paymentId: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(paymentId);
  if (!parsed.success) return { ok: false, message: "That payment could not be found." };
  await requireSuiteSession();
  const supabase = await createServerSupabase();
  const { error } = await supabase.rpc("reverse_desk_payment", { p_payment_id: parsed.data });
  if (error) {
    return {
      ok: false,
      message: describeDbError(
        error,
        {
          ALREADY_REVERSED: "That payment was already reversed.",
          FORBIDDEN: "Only the owner or an admin can reverse a payment.",
        },
        "We couldn't reverse the payment. Please retry.",
      ),
    };
  }
  return { ok: true, message: "Payment reversed." };
}

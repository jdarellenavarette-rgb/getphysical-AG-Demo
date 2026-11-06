/**
 * Maya Checkout webhook. Register in Maya Manager as:
 *   https://<ref>.supabase.co/functions/v1/webhook-maya?token=<MAYA_WEBHOOK_TOKEN>
 *
 * Deployed with verify_jwt = false. The URL token filters out random callers,
 * but the body is never trusted: the payment is re-read from Maya with the
 * secret key, and only Maya's answer changes money state. Idempotent.
 */
import type { Json } from "../_shared/database.types.ts";
import { requireEnv } from "../_shared/env.ts";
import { handle, HttpError, json, readJson, rpcError } from "../_shared/http.ts";
import { getMayaPaymentsByReference } from "../_shared/providers.ts";
import { timingSafeEqualStrings } from "../_shared/signatures.ts";
import { serviceClient } from "../_shared/supabase.ts";

const FAILED = new Set(["PAYMENT_FAILED", "PAYMENT_EXPIRED", "PAYMENT_CANCELLED", "AUTH_FAILED"]);

Deno.serve(handle("webhook-maya", [], async (req) => {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  if (!timingSafeEqualStrings(token, requireEnv("MAYA_WEBHOOK_TOKEN"))) {
    throw new HttpError(401, "INVALID_SIGNATURE", "Invalid webhook token");
  }

  const payload = (await readJson(req)) as Json;
  const notified = payload as { id?: string; requestReferenceNumber?: string; status?: string };
  const orderId = notified.requestReferenceNumber;
  if (!orderId) throw new HttpError(400, "INVALID_EVENT", "Missing requestReferenceNumber");

  const db = serviceClient();
  const { data: order } = await db
    .from("payment_orders")
    .select("id, provider, provider_ref")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.provider !== "MAYA") return json({ received: true, ignored: "UNKNOWN_ORDER" });

  const payments = await getMayaPaymentsByReference(order.id);
  const paid = payments.find((p) => p.status === "PAYMENT_SUCCESS" && p.currency === "PHP");

  if (paid) {
    const { error } = await db.rpc("settle_payment_order", {
      p_order_id: order.id,
      p_provider: "MAYA",
      p_provider_ref: order.provider_ref ?? paid.id,
      p_paid_amount: Number(paid.amount),
    });
    if (error) throw rpcError(error);
  } else if (payments.length > 0 && payments.every((p) => FAILED.has(p.status))) {
    const { error } = await db.rpc("close_payment_order", {
      p_order_id: order.id,
      p_status: payments.some((p) => p.status === "PAYMENT_EXPIRED") ? "EXPIRED" : "FAILED",
      p_reason: payments.map((p) => p.status).join(","),
    });
    if (error) throw rpcError(error);
  }

  await db.rpc("record_payment_webhook_event", {
    p_provider: "MAYA",
    p_event_id: `${notified.id ?? order.id}:${notified.status ?? "UNKNOWN"}`,
    p_event_type: `maya.${(notified.status ?? "unknown").toLowerCase()}`,
    p_payload: payload,
  });

  return json({ received: true });
}));

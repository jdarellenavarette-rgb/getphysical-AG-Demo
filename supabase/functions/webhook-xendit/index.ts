/**
 * Xendit invoice callback. Deployed with verify_jwt = false (Xendit cannot
 * send a Supabase JWT); authenticity comes from the x-callback-token header,
 * and the invoice is re-fetched from Xendit before any money state changes.
 * Processing is idempotent, so provider retries are safe.
 */
import { requireEnv } from "../_shared/env.ts";
import { handle, HttpError, json, readJson, rpcError } from "../_shared/http.ts";
import { getXenditInvoice } from "../_shared/providers.ts";
import { verifyXenditCallbackToken } from "../_shared/signatures.ts";
import type { Json } from "../_shared/database.types.ts";
import { serviceClient } from "../_shared/supabase.ts";

interface XenditInvoiceCallback {
  id?: string;
  external_id?: string;
  status?: string;
}

Deno.serve(handle("webhook-xendit", [], async (req) => {
  if (!verifyXenditCallbackToken(req.headers.get("x-callback-token"), requireEnv("XENDIT_CALLBACK_TOKEN"))) {
    throw new HttpError(401, "INVALID_SIGNATURE", "Invalid callback token");
  }

  const payload = (await readJson(req)) as Json;
  const event = payload as XenditInvoiceCallback;
  if (!event.id || !event.external_id || !event.status) {
    throw new HttpError(400, "INVALID_EVENT", "Missing invoice fields");
  }

  const db = serviceClient();
  const { data: order } = await db
    .from("payment_orders")
    .select("id, facility_id, provider")
    .eq("id", event.external_id)
    .maybeSingle();
  if (!order || order.provider !== "XENDIT") {
    // Not ours (or already deleted test data): acknowledge so Xendit stops retrying.
    return json({ received: true, ignored: "UNKNOWN_ORDER" });
  }

  const { data: payout } = await db
    .from("facility_payout_accounts")
    .select("xendit_sub_account_id")
    .eq("facility_id", order.facility_id)
    .single();

  // Never trust the callback body for amounts/status: confirm with Xendit.
  const invoice = await getXenditInvoice(event.id, payout?.xendit_sub_account_id ?? "");
  if (invoice.external_id !== order.id) throw new HttpError(400, "INVALID_EVENT", "Invoice/order mismatch");

  if (invoice.status === "PAID" || invoice.status === "SETTLED") {
    const { error } = await db.rpc("settle_payment_order", {
      p_order_id: order.id,
      p_provider: "XENDIT",
      p_provider_ref: invoice.id,
      p_paid_amount: invoice.paid_amount ?? invoice.amount,
    });
    if (error) throw rpcError(error);
  } else if (invoice.status === "EXPIRED") {
    const { error } = await db.rpc("close_payment_order", {
      p_order_id: order.id,
      p_status: "EXPIRED",
      p_reason: "Invoice expired",
    });
    if (error) throw rpcError(error);
  }

  await db.rpc("record_payment_webhook_event", {
    p_provider: "XENDIT",
    p_event_id: `${invoice.id}:${invoice.status}`,
    p_event_type: `invoice.${invoice.status.toLowerCase()}`,
    p_payload: payload,
  });

  return json({ received: true });
}));

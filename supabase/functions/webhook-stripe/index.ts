/**
 * Stripe webhook (platform account; Connect destination charges).
 * Deployed with verify_jwt = false; authenticity comes from the
 * Stripe-Signature header verified against the raw body.
 */
import { requireEnv } from "../_shared/env.ts";
import { handle, HttpError, json, rpcError } from "../_shared/http.ts";
import { getStripePaymentIntent } from "../_shared/providers.ts";
import { verifyStripeSignature } from "../_shared/signatures.ts";
import type { Json } from "../_shared/database.types.ts";
import { serviceClient } from "../_shared/supabase.ts";

interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

interface CheckoutSession {
  id: string;
  client_reference_id: string | null;
  payment_status: string;
  amount_total: number | null;
}

interface Charge {
  payment_intent: string | null;
  amount: number;
  amount_refunded: number;
  refunded: boolean;
}

Deno.serve(handle("webhook-stripe", [], async (req) => {
  const rawBody = await req.text();
  const valid = await verifyStripeSignature(
    rawBody,
    req.headers.get("Stripe-Signature"),
    requireEnv("STRIPE_WEBHOOK_SECRET"),
  );
  if (!valid) throw new HttpError(401, "INVALID_SIGNATURE", "Invalid Stripe signature");

  const payload = JSON.parse(rawBody) as Json;
  const event = payload as unknown as StripeEvent;
  const db = serviceClient();

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as unknown as CheckoutSession;
      if (session.payment_status === "paid" && session.client_reference_id && session.amount_total !== null) {
        const { error } = await db.rpc("settle_payment_order", {
          p_order_id: session.client_reference_id,
          p_provider: "STRIPE",
          p_provider_ref: session.id,
          p_paid_amount: session.amount_total / 100,
        });
        if (error) throw rpcError(error);
      }
      break;
    }
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as unknown as CheckoutSession;
      if (session.client_reference_id) {
        const { error } = await db.rpc("close_payment_order", {
          p_order_id: session.client_reference_id,
          p_status: event.type === "checkout.session.expired" ? "EXPIRED" : "FAILED",
          p_reason: event.type,
        });
        if (error) throw rpcError(error);
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as unknown as Charge;
      // Only full refunds revoke the pass; partial refunds are reconciled manually.
      if (charge.payment_intent && charge.refunded && charge.amount_refunded === charge.amount) {
        const intent = await getStripePaymentIntent(charge.payment_intent);
        const orderId = intent.metadata.order_id;
        if (orderId) {
          const { error } = await db.rpc("refund_payment_order", {
            p_order_id: orderId,
            p_reason: "Stripe refund",
          });
          if (error) throw rpcError(error);
        }
      }
      break;
    }
    default:
      break;
  }

  await db.rpc("record_payment_webhook_event", {
    p_provider: "STRIPE",
    p_event_id: event.id,
    p_event_type: event.type,
    p_payload: payload,
  });

  return json({ received: true });
}));

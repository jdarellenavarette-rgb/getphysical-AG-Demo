/**
 * POST /functions/v1/payments-checkout   { facilityId, sku, idempotencyKey }
 *
 * 1. create_payment_order() as the user → server-side price, age gate, payout check
 * 2. create the provider checkout (Xendit invoice or Stripe Checkout Session)
 * 3. attach_payment_checkout() as service_role
 * The pass is issued only when the provider's webhook confirms payment.
 */
import { allowedOrigins, requireEnv } from "../_shared/env.ts";
import { handle, HttpError, json, readJson, rpcError } from "../_shared/http.ts";
import { createStripeCheckoutSession, createXenditInvoice } from "../_shared/providers.ts";
import { checkoutRequestSchema } from "../_shared/schemas.ts";
import { serviceClient, userClient } from "../_shared/supabase.ts";

Deno.serve(handle("payments-checkout", allowedOrigins(), async (req) => {
  const { db, user } = await userClient(req);

  const parsed = checkoutRequestSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    throw new HttpError(400, "VALIDATION_FAILED", parsed.error.issues[0]?.message ?? "Invalid request");
  }
  const { facilityId, sku, idempotencyKey } = parsed.data;

  const { data: order, error: orderError } = await db.rpc("create_payment_order", {
    p_facility_id: facilityId,
    p_sku: sku,
    p_idempotency_key: idempotencyKey,
  });
  if (orderError) throw rpcError(orderError);

  const respond = (checkoutUrl: string) =>
    json({
      orderId: order.id,
      checkoutUrl,
      totalPhp: order.total_php,
      serviceFeePhp: order.service_fee_php,
      provider: order.provider,
    });

  // Retry of an attempt that already has a checkout: return it unchanged.
  if (order.status !== "PENDING") {
    throw new HttpError(409, `ORDER_${order.status}`, `This order is already ${order.status.toLowerCase()}`);
  }
  if (order.checkout_url) return respond(order.checkout_url);

  const service = serviceClient();
  const [{ data: facility }, { data: payout }] = await Promise.all([
    service.from("facilities").select("id, name").eq("id", facilityId).single(),
    service
      .from("facility_payout_accounts")
      .select("xendit_sub_account_id, stripe_account_id")
      .eq("facility_id", facilityId)
      .single(),
  ]);
  if (!facility || !payout) throw new HttpError(422, "FACILITY_PAYOUTS_NOT_CONFIGURED", "Facility cannot accept payments yet");

  const label = `${sku === "MONTHLY" ? "Monthly membership" : "Day pass"} — ${facility.name}`;
  const redirectBase = requireEnv("CHECKOUT_REDIRECT_BASE_URL");

  const checkout = order.provider === "XENDIT"
    ? await createXenditInvoice(order, payout.xendit_sub_account_id ?? "", label, user.email, redirectBase)
    : await createStripeCheckoutSession(order, payout.stripe_account_id ?? "", label, user.email, redirectBase);

  const { error: attachError } = await service.rpc("attach_payment_checkout", {
    p_order_id: order.id,
    p_provider_ref: checkout.providerRef,
    p_checkout_url: checkout.checkoutUrl,
  });
  if (attachError) {
    // A concurrent request attached first; hand back the stored checkout.
    const { data: current } = await service
      .from("payment_orders")
      .select("checkout_url")
      .eq("id", order.id)
      .single();
    if (current?.checkout_url) return respond(current.checkout_url);
    throw rpcError(attachError);
  }

  return respond(checkout.checkoutUrl);
}));

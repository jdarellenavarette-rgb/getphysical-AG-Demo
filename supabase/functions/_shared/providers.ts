/**
 * Payment provider calls. GetPhysical is never Merchant of Record:
 *   - COMMERCIAL gyms  → Xendit xenPlatform: invoice created on the gym's
 *     sub-account (for-user-id) with a platform fee rule (with-fee-rule).
 *   - COMMUNITY clubs / coaches → Stripe Connect destination charge with an
 *     application_fee_amount routed to the platform.
 */
import { requireEnv } from "./env.ts";
import { HttpError } from "./http.ts";

export interface ProviderCheckout {
  providerRef: string;
  checkoutUrl: string;
}

export interface CheckoutOrder {
  id: string;
  sku: string;
  billing_kind: string;
  total_php: number;
  service_fee_php: number;
}

const TIMEOUT_MS = 15_000;

function toCentavos(amountPhp: number): number {
  return Math.round(amountPhp * 100);
}

export async function createXenditInvoice(
  order: CheckoutOrder,
  subAccountId: string,
  description: string,
  payerEmail: string | undefined,
  redirectBaseUrl: string,
): Promise<ProviderCheckout> {
  const feeRule = order.billing_kind === "recurring_subscription"
    ? requireEnv("XENDIT_FEE_RULE_RECURRING")
    : requireEnv("XENDIT_FEE_RULE_ONE_TIME");

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${requireEnv("XENDIT_SECRET_KEY")}:`)}`,
      "Content-Type": "application/json",
      "for-user-id": subAccountId,
      "with-fee-rule": feeRule,
    },
    body: JSON.stringify({
      external_id: order.id,
      amount: order.total_php,
      currency: "PHP",
      description,
      invoice_duration: 3600,
      payer_email: payerEmail,
      success_redirect_url: `${redirectBaseUrl}/checkout/success?order=${order.id}`,
      failure_redirect_url: `${redirectBaseUrl}/checkout/failed?order=${order.id}`,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = (await response.json().catch(() => ({}))) as { id?: string; invoice_url?: string; message?: string };
  if (!response.ok || !body.id || !body.invoice_url) {
    throw new HttpError(502, "XENDIT_ERROR", body.message ?? `Xendit responded ${response.status}`);
  }
  return { providerRef: body.id, checkoutUrl: body.invoice_url };
}

export async function getXenditInvoice(
  invoiceId: string,
  subAccountId: string,
): Promise<{ id: string; external_id: string; status: string; amount: number; paid_amount?: number }> {
  const response = await fetch(`https://api.xendit.co/v2/invoices/${encodeURIComponent(invoiceId)}`, {
    headers: {
      Authorization: `Basic ${btoa(`${requireEnv("XENDIT_SECRET_KEY")}:`)}`,
      "for-user-id": subAccountId,
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new HttpError(502, "XENDIT_ERROR", `Xendit responded ${response.status}`);
  return await response.json();
}

async function stripeRequest<T>(path: string, init: { method: "GET" | "POST"; form?: URLSearchParams; idempotencyKey?: string }): Promise<T> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${requireEnv("STRIPE_SECRET_KEY")}`,
  };
  if (init.form) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (init.idempotencyKey) headers["Idempotency-Key"] = init.idempotencyKey;
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: init.method,
    headers,
    body: init.form?.toString(),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: { message?: string } };
  if (!response.ok) {
    throw new HttpError(502, "STRIPE_ERROR", body.error?.message ?? `Stripe responded ${response.status}`);
  }
  return body;
}

export async function createStripeCheckoutSession(
  order: CheckoutOrder,
  connectedAccountId: string,
  productName: string,
  customerEmail: string | undefined,
  redirectBaseUrl: string,
): Promise<ProviderCheckout> {
  const form = new URLSearchParams({
    mode: "payment",
    client_reference_id: order.id,
    "metadata[order_id]": order.id,
    "payment_intent_data[metadata][order_id]": order.id,
    "payment_intent_data[application_fee_amount]": String(toCentavos(order.service_fee_php)),
    "payment_intent_data[transfer_data][destination]": connectedAccountId,
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "php",
    "line_items[0][price_data][unit_amount]": String(toCentavos(order.total_php)),
    "line_items[0][price_data][product_data][name]": productName,
    success_url: `${redirectBaseUrl}/checkout/success?order=${order.id}`,
    cancel_url: `${redirectBaseUrl}/checkout/failed?order=${order.id}`,
  });
  if (customerEmail) form.set("customer_email", customerEmail);

  const session = await stripeRequest<{ id: string; url: string | null }>("checkout/sessions", {
    method: "POST",
    form,
    idempotencyKey: `checkout:${order.id}`,
  });
  if (!session.url) throw new HttpError(502, "STRIPE_ERROR", "Stripe returned no checkout URL");
  return { providerRef: session.id, checkoutUrl: session.url };
}

export function getStripePaymentIntent(paymentIntentId: string): Promise<{ id: string; metadata: Record<string, string> }> {
  return stripeRequest(`payment_intents/${encodeURIComponent(paymentIntentId)}`, { method: "GET" });
}

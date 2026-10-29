import "server-only";
import type Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Marks the order paid and takes stock. Safe to call more than once (webhook
// and success page both call it) — the database function is idempotent.
export async function completeCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return null;

  const shipping = session.collected_information?.shipping_details;
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : (session.payment_intent?.id ?? null);

  const { data, error } = await createAdminClient().rpc("mark_order_paid", {
    p_session_id: session.id,
    p_payment_intent: paymentIntent,
    p_email: session.customer_details?.email ?? null,
    p_name: shipping?.name ?? session.customer_details?.name ?? null,
    p_address: shipping?.address ?? session.customer_details?.address ?? null,
    p_shipping_cents: session.shipping_cost?.amount_total ?? null,
    p_tax_cents: session.total_details?.amount_tax ?? 0,
    p_total_cents: session.amount_total,
  });
  if (error) throw error;
  return data as string | null;
}

export async function cancelCheckoutSession(sessionId: string) {
  await createAdminClient().from("orders").update({ status: "cancelled" }).eq("stripe_session_id", sessionId).eq("status", "pending");
}

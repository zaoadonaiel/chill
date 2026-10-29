import type Stripe from "stripe";
import { cancelCheckoutSession, completeCheckoutSession } from "@/lib/orders";
import { getStripe, webCrypto } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return new Response("Missing signature", { status: 400 });

  const body = await request.text();
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, secret, undefined, webCrypto);
  } catch (err) {
    console.error("Stripe webhook signature failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await completeCheckoutSession(event.data.object);
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await cancelCheckoutSession(event.data.object.id);
        break;
      case "charge.refunded": {
        const charge = event.data.object;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.refunded) {
          await createAdminClient().from("orders").update({ status: "refunded" }).eq("stripe_payment_intent", pi);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Stripe webhook ${event.type} failed`, err);
    return new Response("Webhook handler failed", { status: 500 });
  }

  return Response.json({ received: true });
}

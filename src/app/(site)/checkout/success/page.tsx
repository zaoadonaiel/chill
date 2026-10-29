import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ClearCart } from "@/components/site/ClearCart";
import { OrderSummary } from "@/components/site/OrderSummary";
import { completeCheckoutSession } from "@/lib/orders";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const { session_id } = await searchParams;
  if (typeof session_id !== "string" || !session_id.startsWith("cs_")) redirect("/shop");

  let order: Order | null = null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(session_id);
    // Don't wait for the webhook — confirm straight away (idempotent).
    await completeCheckoutSession(session);
    const { data } = await createAdminClient()
      .from("orders")
      .select("*, order_items(*)")
      .eq("stripe_session_id", session.id)
      .maybeSingle<Order>();
    order = data;
  } catch (err) {
    console.error("checkout success", err);
  }

  return (
    <div className="flex-1 bg-paper px-4 py-16 md:px-10 md:py-24">
      <ClearCart />
      <div className="mx-auto max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">Thank you</p>
        <h1 className="mt-3 font-display text-5xl italic md:text-6xl">Your order is confirmed</h1>
        {order ? (
          <>
            <p className="mt-4 text-sm text-black/60">
              Order #{order.number} — a receipt has been sent to {order.email ?? "your email"}.
            </p>
            <div className="mt-10">
              <OrderSummary order={order} />
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-black/60">We&apos;re processing your payment. You&apos;ll receive an email shortly.</p>
        )}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/shop" className="bg-black px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-85">
            Continue shopping
          </Link>
          {order?.user_id && (
            <Link href={`/account/orders/${order.id}`} className="border border-black px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white">
              View order
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

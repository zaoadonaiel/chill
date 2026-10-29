import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/site/OrderSummary";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";

export const metadata: Metadata = { title: "Order" };

export default async function AccountOrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const { user } = await requireUser(`/account/orders/${id}`);
  const supabase = await createClient();
  // RLS limits this to the signed-in user's own orders.
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle<Order>();
  if (!order) notFound();

  return (
    <div className="flex-1 bg-paper px-4 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-2xl">
        <Link href="/account" className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">
          ← Back to account
        </Link>
        <h1 className="mt-6 font-display text-5xl italic">Order #{order.number}</h1>
        <p className="mt-2 text-sm text-black/60">Placed {formatDateTime(order.created_at)}</p>
        <div className="mt-10">
          <OrderSummary order={order} />
        </div>
      </div>
    </div>
  );
}

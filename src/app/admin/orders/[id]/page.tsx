import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderSummary } from "@/components/site/OrderSummary";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { Card, ghostButtonClass, PageHeader } from "../../ui";
import { OrderUpdateForm } from "./OrderUpdateForm";

export const metadata: Metadata = { title: "Order" };

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle<Order>();
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/orders" className="text-xs underline underline-offset-4 text-neutral-600">
        ← Orders
      </Link>
      <div className="mt-4">
        <PageHeader
          title={`Order #${order.number}`}
          actions={
            order.stripe_payment_intent && (
              <a href={`https://dashboard.stripe.com/payments/${order.stripe_payment_intent}`} target="_blank" rel="noreferrer" className={ghostButtonClass}>
                View in Stripe ↗
              </a>
            )
          }
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <OrderSummary order={order} />
        </div>
        <div className="space-y-6">
          <Card className="space-y-2 p-5 text-sm">
            <h2 className="mb-2 font-semibold">Customer</h2>
            <p>{order.shipping_name ?? "—"}</p>
            <p className="text-neutral-600">{order.email ?? "—"}</p>
            <p className="text-xs text-neutral-500">{order.user_id ? "Registered customer" : "Guest checkout"}</p>
            <div className="border-t border-neutral-100 pt-3 text-xs text-neutral-500">
              <p>Created {formatDateTime(order.created_at)}</p>
              {order.paid_at && <p>Paid {formatDateTime(order.paid_at)}</p>}
            </div>
          </Card>
          <OrderUpdateForm order={order} />
        </div>
      </div>
    </>
  );
}

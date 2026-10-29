import Link from "next/link";
import { StatusBadge } from "@/components/site/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { Card, PageHeader, Stat, tdClass, thClass } from "./ui";

const REVENUE_STATUSES = ["paid", "shipped", "delivered"];

function daysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

type LowStock = { id: string; size: string; stock: number; product: { id: string; name: string } | null };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const since = daysAgo(30);

  const [{ data: recent }, { data: monthOrders }, { count: productCount }, { count: customerCount }, { data: lowStock }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .neq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(8)
        .overrideTypes<Order[], { merge: false }>(),
      supabase.from("orders").select("total_cents, status").in("status", REVENUE_STATUSES).gte("created_at", since),
      supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("product_variants")
        .select("id, size, stock, product:products(id, name)")
        .lte("stock", 3)
        .order("stock")
        .limit(8)
        .overrideTypes<LowStock[], { merge: false }>(),
    ]);

  const revenue = (monthOrders ?? []).reduce((n: number, o: { total_cents: number }) => n + o.total_cents, 0);
  const toShip = (recent ?? []).filter((o) => o.status === "paid").length;

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Revenue (30d)" value={formatPrice(revenue)} />
        <Stat label="Orders (30d)" value={String(monthOrders?.length ?? 0)} hint={toShip ? `${toShip} awaiting shipment` : undefined} />
        <Stat label="Active products" value={String(productCount ?? 0)} />
        <Stat label="Customers" value={String(customerCount ?? 0)} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        <Card>
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-neutral-200">
                <tr>
                  <th className={thClass}>Order</th>
                  <th className={thClass}>Customer</th>
                  <th className={thClass}>Status</th>
                  <th className={`${thClass} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(recent ?? []).map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50">
                    <td className={tdClass}>
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold underline-offset-4 hover:underline">
                        #{o.number}
                      </Link>
                      <p className="text-xs text-neutral-500">{formatDateTime(o.created_at)}</p>
                    </td>
                    <td className={tdClass}>{o.shipping_name ?? o.email ?? "—"}</td>
                    <td className={tdClass}>
                      <StatusBadge status={o.status} />
                    </td>
                    <td className={`${tdClass} text-right`}>{formatPrice(o.total_cents, o.currency)}</td>
                  </tr>
                ))}
                {!recent?.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-sm text-neutral-500">
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="border-b border-neutral-200 px-4 py-3">
            <h2 className="text-sm font-semibold">Low stock</h2>
          </div>
          <ul className="divide-y divide-neutral-100">
            {(lowStock ?? []).map((v) => (
              <li key={v.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <Link href={`/admin/products/${v.product?.id}`} className="hover:underline">
                  {v.product?.name} <span className="text-neutral-500">· {v.size}</span>
                </Link>
                <span className={v.stock === 0 ? "font-semibold text-rose-600" : "text-amber-600"}>{v.stock}</span>
              </li>
            ))}
            {!lowStock?.length && <li className="px-4 py-10 text-center text-sm text-neutral-500">All stocked up.</li>}
          </ul>
        </Card>
      </div>
    </>
  );
}

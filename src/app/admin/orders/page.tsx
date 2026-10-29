import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/site/StatusBadge";
import { formatDateTime, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, type Order } from "@/lib/types";
import { Card, inputClass, PageHeader, tdClass, thClass } from "../ui";

export const metadata: Metadata = { title: "Orders" };

const TABS = ["all", ...ORDER_STATUSES] as const;

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const status = TABS.find((t) => t === sp.status) ?? "all";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const supabase = await createClient();
  let query = supabase.from("orders").select("*, order_items(quantity)").order("created_at", { ascending: false }).limit(100);
  // Abandoned checkouts stay "pending"; hide them unless asked for.
  if (status === "all") query = query.neq("status", "pending");
  else query = query.eq("status", status);
  if (q) {
    const num = Number(q.replace("#", ""));
    const term = q.replace(/[%_,()]/g, " ");
    query = Number.isInteger(num) && num > 0 ? query.eq("number", num) : query.or(`email.ilike.%${term}%,shipping_name.ilike.%${term}%`);
  }
  const { data: orders } = await query.overrideTypes<Order[], { merge: false }>();

  return (
    <>
      <PageHeader title="Orders" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1">
          {TABS.map((t) => (
            <Link
              key={t}
              href={t === "all" ? "/admin/orders" : `/admin/orders?status=${t}`}
              className={`px-3 py-1.5 text-xs capitalize ${status === t ? "bg-black text-white" : "bg-white text-neutral-600 hover:text-black"}`}
            >
              {t}
            </Link>
          ))}
        </div>
        <form className="w-full max-w-xs">
          {status !== "all" && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search # / email / name" className={inputClass} />
        </form>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-neutral-200">
            <tr>
              <th className={thClass}>Order</th>
              <th className={thClass}>Date</th>
              <th className={thClass}>Customer</th>
              <th className={thClass}>Items</th>
              <th className={thClass}>Status</th>
              <th className={`${thClass} text-right`}>Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className={tdClass}>
                  <Link href={`/admin/orders/${o.id}`} className="font-semibold hover:underline">
                    #{o.number}
                  </Link>
                </td>
                <td className={`${tdClass} text-neutral-600`}>{formatDateTime(o.created_at)}</td>
                <td className={tdClass}>
                  <p>{o.shipping_name ?? "—"}</p>
                  <p className="text-xs text-neutral-500">{o.email}</p>
                </td>
                <td className={tdClass}>{o.order_items?.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className={tdClass}>
                  <StatusBadge status={o.status} />
                </td>
                <td className={`${tdClass} text-right`}>{formatPrice(o.total_cents, o.currency)}</td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

import type { Metadata } from "next";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { Card, PageHeader, tdClass, thClass } from "../ui";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const [{ data: profiles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500).overrideTypes<Profile[], { merge: false }>(),
    supabase.from("orders").select("user_id, total_cents").in("status", ["paid", "shipped", "delivered"]).not("user_id", "is", null),
  ]);

  const stats = new Map<string, { count: number; spent: number }>();
  for (const o of (orders ?? []) as { user_id: string; total_cents: number }[]) {
    const s = stats.get(o.user_id) ?? { count: 0, spent: 0 };
    s.count += 1;
    s.spent += o.total_cents;
    stats.set(o.user_id, s);
  }

  return (
    <>
      <PageHeader title="Customers" />
      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-neutral-200">
            <tr>
              <th className={thClass}>Customer</th>
              <th className={thClass}>Joined</th>
              <th className={thClass}>Orders</th>
              <th className={`${thClass} text-right`}>Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(profiles ?? []).map((p) => {
              const s = stats.get(p.id);
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className={tdClass}>
                    <p className="font-semibold">
                      {p.full_name ?? "—"}
                      {p.role === "admin" && <span className="ml-2 bg-black px-1.5 py-0.5 text-[9px] uppercase text-white">Admin</span>}
                    </p>
                    <p className="text-xs text-neutral-500">{p.email}</p>
                  </td>
                  <td className={`${tdClass} text-neutral-600`}>{formatDate(p.created_at)}</td>
                  <td className={tdClass}>{s?.count ?? 0}</td>
                  <td className={`${tdClass} text-right`}>{formatPrice(s?.spent ?? 0)}</td>
                </tr>
              );
            })}
            {!profiles?.length && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

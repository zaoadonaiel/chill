import type { Metadata } from "next";
import Link from "next/link";
import { signOut } from "../auth-actions";
import { StatusBadge } from "@/components/site/StatusBadge";
import { requireUser } from "@/lib/auth";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { ProfileForm } from "./ProfileForm";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .overrideTypes<Order[], { merge: false }>();

  return (
    <div className="flex-1 bg-paper px-4 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">Account</p>
            <h1 className="mt-2 font-display text-5xl italic">Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === "admin" && (
              <Link href="/admin" className="bg-black px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-85">
                Admin panel
              </Link>
            )}
            <form action={signOut}>
              <button className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">Sign out</button>
            </form>
          </div>
        </div>

        <div className="mt-12 grid gap-12 md:grid-cols-[2fr_1fr]">
          <section>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest">Order history</h2>
            {!orders?.length ? (
              <div className="border border-line p-8 text-center text-sm text-black/60">
                No orders yet.{" "}
                <Link href="/shop" className="underline underline-offset-4">
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Link href={`/account/orders/${o.id}`} className="flex items-center gap-4 py-4 transition-colors hover:bg-white/50">
                      <div className="flex-1">
                        <p className="text-sm font-semibold">#{o.number}</p>
                        <p className="text-xs text-black/60">
                          {formatDate(o.created_at)} · {o.order_items?.reduce((n, i) => n + i.quantity, 0)} items
                        </p>
                      </div>
                      <StatusBadge status={o.status} />
                      <p className="w-28 text-right text-sm">{formatPrice(o.total_cents, o.currency)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-10">
            <div>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest">Profile</h2>
              <p className="mb-4 text-sm text-black/60">{user.email}</p>
              <ProfileForm name={profile?.full_name ?? ""} />
            </div>
            <Link href="/account/update-password" className="block text-xs underline underline-offset-4 opacity-70 hover:opacity-100">
              Change password
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

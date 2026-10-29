import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { site } from "@/lib/site";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = { title: { default: "Admin", template: `%s — ${site.name} Admin` }, robots: { index: false } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { profile, user } = await requireAdmin();

  return (
    <div className="flex min-h-svh flex-col bg-neutral-100 text-ink md:flex-row">
      <aside className="flex shrink-0 flex-col bg-black text-white md:sticky md:top-0 md:h-svh md:w-60">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <Link href="/admin" className="font-display text-3xl italic">
            {site.wordmark}
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 md:mt-1">Admin</p>
        </div>
        <AdminNav />
        <div className="mt-auto hidden border-t border-white/10 px-5 py-4 text-xs text-white/50 md:block">
          <p className="truncate">{profile?.full_name ?? user.email}</p>
          <Link href="/" className="mt-2 inline-block underline underline-offset-4 hover:text-white">
            View store →
          </Link>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-8 md:px-10">{children}</main>
    </div>
  );
}

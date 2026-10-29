import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { connection } from "next/server";
import { isSupabaseConfigured, siteUrl } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getSession = cache(async () => {
  // Always render per request, even before Supabase is configured.
  await connection();
  if (!isSupabaseConfigured) return { user: null, profile: null };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>();
  return { user, profile };
});

export async function requireUser(next = "/account") {
  const session = await getSession();
  if (!session.user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { user: session.user, profile: session.profile };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.user) redirect("/login?next=/admin");
  if (session.profile?.role !== "admin") notFound();
  return { user: session.user, profile: session.profile };
}

export async function getOrigin() {
  if (siteUrl) return siteUrl;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

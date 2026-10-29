import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/site/AuthCard";
import { getSession } from "@/lib/auth";
import { safeNext } from "@/lib/format";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = safeNext(typeof sp.next === "string" ? sp.next : null);
  const { user } = await getSession();
  if (user) redirect(next);

  return (
    <AuthCard title="Sign in" subtitle="Track orders and check out faster.">
      {sp.error === "auth" && (
        <p className="mb-6 text-sm text-red-600">That link is invalid or has expired. Please try again.</p>
      )}
      <LoginForm next={next} />
    </AuthCard>
  );
}

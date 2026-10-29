import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/site/AuthCard";
import { getSession } from "@/lib/auth";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const { user } = await getSession();
  if (user) redirect("/account");

  return (
    <AuthCard title="Create account" subtitle="Save your details and see every order in one place.">
      <RegisterForm />
    </AuthCard>
  );
}

import type { Metadata } from "next";
import { AuthCard } from "@/components/site/AuthCard";
import { requireUser } from "@/lib/auth";
import { UpdatePasswordForm } from "./UpdatePasswordForm";

export const metadata: Metadata = { title: "Change password" };

export default async function UpdatePasswordPage() {
  await requireUser("/account/update-password");
  return (
    <AuthCard title="New password">
      <UpdatePasswordForm />
    </AuthCard>
  );
}

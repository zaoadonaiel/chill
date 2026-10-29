"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "../auth-actions";
import { AuthCard } from "@/components/site/AuthCard";
import { Field, FormMessage, SubmitButton } from "@/components/forms";

export default function ForgotPasswordPage() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <AuthCard title="Reset password" subtitle="We'll email you a link to choose a new one.">
      <form action={action} className="space-y-5">
        <Field label="Email" name="email" type="email" autoComplete="email" required />
        <FormMessage state={state} />
        <SubmitButton>Send reset link</SubmitButton>
        <p className="text-center text-xs">
          <Link href="/login" className="underline underline-offset-4">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

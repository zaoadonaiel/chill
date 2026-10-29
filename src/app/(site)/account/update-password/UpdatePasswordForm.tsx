"use client";

import Link from "next/link";
import { useActionState } from "react";
import { updatePassword } from "../../auth-actions";
import { Field, FormMessage, SubmitButton } from "@/components/forms";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="space-y-5">
      <Field label="New password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      <FormMessage state={state} />
      <SubmitButton>Update password</SubmitButton>
      <p className="text-center text-xs">
        <Link href="/account" className="underline underline-offset-4">
          Back to account
        </Link>
      </p>
    </form>
  );
}

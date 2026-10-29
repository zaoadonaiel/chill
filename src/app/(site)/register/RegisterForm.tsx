"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "../auth-actions";
import { Field, FormMessage, SubmitButton } from "@/components/forms";

export function RegisterForm() {
  const [state, action] = useActionState(signUp, undefined);
  return (
    <form action={action} className="space-y-5">
      <Field label="Full name" name="name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      <FormMessage state={state} />
      <SubmitButton>Create account</SubmitButton>
      <p className="text-center text-xs">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}

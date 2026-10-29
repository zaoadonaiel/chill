"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "../auth-actions";
import { Field, FormMessage, SubmitButton } from "@/components/forms";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, undefined);
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      <FormMessage state={state} />
      <SubmitButton>Sign in</SubmitButton>
      <div className="flex justify-between text-xs">
        <Link href="/forgot-password" className="underline underline-offset-4 opacity-70 hover:opacity-100">
          Forgot password?
        </Link>
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="underline underline-offset-4 opacity-70 hover:opacity-100">
          Create an account
        </Link>
      </div>
    </form>
  );
}

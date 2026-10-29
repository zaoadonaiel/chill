"use client";

import { useActionState } from "react";
import { updateProfile } from "../auth-actions";
import { Field, FormMessage, SubmitButton } from "@/components/forms";

export function ProfileForm({ name }: { name: string }) {
  const [state, action] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Full name" name="name" defaultValue={name} required />
      <FormMessage state={state} />
      <SubmitButton>Save</SubmitButton>
    </form>
  );
}

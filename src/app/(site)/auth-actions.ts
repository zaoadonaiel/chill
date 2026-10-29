"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getOrigin, requireUser } from "@/lib/auth";
import { safeNext } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

const email = z.string().trim().email("Enter a valid email");
const password = z.string().min(8, "Password must be at least 8 characters");

function firstIssue(err: z.ZodError) {
  return err.issues[0]?.message ?? "Invalid input";
}

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z.object({ email, password: z.string().min(1, "Enter your password") }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(safeNext(formData.get("next") as string | null));
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = z
    .object({ name: z.string().trim().min(1, "Enter your name").max(80), email, password })
    .safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const origin = await getOrigin();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });
  if (error) return { error: error.message };

  if (!data.session) return { message: "Check your inbox to confirm your email, then sign in." };
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = email.safeParse(formData.get("email"));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const origin = await getOrigin();
  await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${origin}/auth/callback?next=/account/update-password`,
  });
  // Same response whether or not the account exists.
  return { message: "If an account exists for that email, a reset link is on its way." };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  await requireUser("/account/update-password");
  const parsed = password.safeParse(formData.get("password"));
  if (!parsed.success) return { error: firstIssue(parsed.error) };
  if (parsed.data !== formData.get("confirm")) return { error: "Passwords do not match" };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { error: error.message };
  return { message: "Password updated." };
}

export async function updateProfile(_: FormState, formData: FormData): Promise<FormState> {
  const { user } = await requireUser();
  const parsed = z.string().trim().min(1, "Enter your name").max(80).safeParse(formData.get("name"));
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ full_name: parsed.data }).eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/account");
  return { message: "Saved." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

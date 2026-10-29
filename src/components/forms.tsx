"use client";

import { useFormStatus } from "react-dom";
import type { InputHTMLAttributes, ReactNode } from "react";

export function Field({ label, ...props }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-widest text-black/60">{label}</span>
      <input
        {...props}
        className="w-full border border-line bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-black"
      />
    </label>
  );
}

export function SubmitButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full bg-black py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 disabled:opacity-50 ${className}`}
    >
      {pending ? "Please wait…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; message?: string } | undefined }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm text-red-600">{state.error}</p>;
  if (state.message) return <p className="text-sm text-emerald-700">{state.message}</p>;
  return null;
}

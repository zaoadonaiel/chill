import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 items-start justify-center bg-paper px-4 py-16 md:py-24">
      <div className="w-full max-w-md">
        <h1 className="font-display text-5xl italic">{title}</h1>
        {subtitle && <p className="mt-3 text-sm text-black/60">{subtitle}</p>}
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}

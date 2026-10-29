import type { ReactNode } from "react";

export function PageHeader({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      {actions}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border border-neutral-200 bg-white ${className}`}>{children}</div>;
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-widest text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-neutral-500">{hint}</p>}
    </Card>
  );
}

export const buttonClass =
  "inline-flex items-center justify-center bg-black px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white transition-opacity hover:opacity-85 disabled:opacity-50";

export const ghostButtonClass =
  "inline-flex items-center justify-center border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:border-black disabled:opacity-50";

export const inputClass =
  "w-full border border-neutral-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-black";

export const thClass = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-neutral-500";
export const tdClass = "px-4 py-3 text-sm";

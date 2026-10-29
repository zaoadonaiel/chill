"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { search } from "@/app/(site)/actions";
import { formatPrice } from "@/lib/format";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { ProductImage } from "./ProductImage";

type Result = Awaited<ReturnType<typeof search>>[number];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    const id = setTimeout(() => {
      startTransition(async () => setResults(term.trim().length > 1 ? await search(term) : []));
    }, 250);
    return () => clearTimeout(id);
  }, [term]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/95 text-white backdrop-blur transition-opacity duration-300 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="mx-auto max-w-3xl px-6 pt-6 md:pt-16">
        <div className="flex justify-end">
          <button onClick={onClose} aria-label="Close search" className="p-2 opacity-70 hover:opacity-100">
            <CloseIcon />
          </button>
        </div>
        <label className="mt-6 flex items-center gap-4 border-b border-white/30 pb-4">
          <SearchIcon className="shrink-0 opacity-60" />
          <input
            ref={inputRef}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search the store"
            className="w-full bg-transparent font-display text-3xl italic outline-none placeholder:text-white/30 md:text-5xl"
          />
        </label>
        <div className="mt-8 min-h-10 text-sm text-white/50">
          {pending && "Searching…"}
          {!pending && term.trim().length > 1 && results.length === 0 && "No products found."}
        </div>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {results.map((p) => (
            <li key={p.id}>
              <Link href={`/product/${p.slug}`} onClick={onClose} className="group block">
                <ProductImage src={p.images[0]} alt={p.name} className="aspect-square bg-white" imgClassName="transition-transform duration-500 group-hover:scale-105" />
                <p className="mt-2 text-xs font-semibold uppercase">{p.name}</p>
                <p className="text-xs text-white/60">{formatPrice(p.price_cents)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

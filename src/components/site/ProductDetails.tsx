"use client";

import { useState, type ReactNode } from "react";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import { useCart } from "@/store/cart";
import { ChevronDown } from "@/components/icons";
import { ProductImage } from "./ProductImage";

export function ProductDetails({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const variants = product.product_variants;
  const firstAvailable = variants.find((v) => v.stock > 0);
  const [variantId, setVariantId] = useState<string | null>(variants.length === 1 ? (firstAvailable?.id ?? null) : null);
  const [active, setActive] = useState(0);
  const [hint, setHint] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? null;
  const soldOut = !firstAvailable;
  const images = product.images.length ? product.images : [null];

  function addToBag() {
    if (!selected) {
      setHint(true);
      return;
    }
    add({
      variantId: selected.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      size: selected.size,
      priceCents: product.price_cents,
      image: product.images[0] ?? null,
      maxQuantity: selected.stock,
    });
  }

  return (
    <div className="grid md:grid-cols-[1.3fr_1fr]">
      {/* Gallery */}
      <div className="border-line md:border-r">
        <ProductImage src={images[active]} alt={product.name} className="aspect-square w-full" />
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-line p-3">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-20 shrink-0 border transition-colors ${i === active ? "border-black" : "border-transparent hover:border-line"}`}
                aria-label={`Show image ${i + 1}`}
              >
                <ProductImage src={src} alt="" className="aspect-square" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-10 md:sticky md:top-[72px] md:self-start md:px-12 md:py-16">
        {product.category && <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">{product.category}</p>}
        <h1 className="mt-2 text-2xl font-bold uppercase leading-tight md:text-3xl">{product.name}</h1>
        <p className="mt-3 text-lg font-semibold">
          {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
            <span className="mr-3 font-normal text-black/40 line-through">{formatPrice(product.compare_at_cents)}</span>
          )}
          {formatPrice(product.price_cents)}
        </p>

        {product.color_name && (
          <div className="mt-8">
            <p className="text-xs uppercase tracking-widest">
              Color: <span className="text-black/60">{product.color_name}</span>
            </p>
            {product.color_hex && (
              <div className="mt-3 h-8 w-8 border border-black p-0.5">
                <div className="h-full w-full" style={{ backgroundColor: product.color_hex }} />
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <p className={`text-xs uppercase tracking-widest ${hint && !selected ? "text-red-600" : ""}`}>
            {hint && !selected ? "Please select a size" : "Size"}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                disabled={v.stock <= 0}
                onClick={() => {
                  setVariantId(v.id);
                  setHint(false);
                }}
                className={`min-w-12 border px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:text-black/25 disabled:line-through ${
                  v.id === variantId ? "border-black bg-black text-white" : "border-line hover:border-black"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>
          {selected && selected.stock <= 3 && <p className="mt-3 text-xs text-black/60">Only {selected.stock} left</p>}
        </div>

        <button
          onClick={addToBag}
          disabled={soldOut}
          className="mt-8 w-full bg-black py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Add to bag"}
        </button>

        <p className="mt-4 text-center text-xs text-black/50">
          Free shipping on orders over {formatPrice(site.shipping.freeOverCents)}
        </p>

        <div className="mt-10 divide-y divide-line border-y border-line">
          <Accordion title="Description" open>
            <p className="whitespace-pre-line">{product.description || "—"}</p>
          </Accordion>
          <Accordion title="Shipping">
            Orders ship within 1–2 business days. Standard delivery takes 3–7 business days. Flat {formatPrice(site.shipping.flatCents)}{" "}
            shipping, free over {formatPrice(site.shipping.freeOverCents)}.
          </Accordion>
          <Accordion title="Returns">Unworn items with tags can be returned within 30 days of delivery.</Accordion>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="group py-4" open={open}>
      <summary className="flex cursor-pointer items-center justify-between text-xs font-semibold uppercase tracking-widest">
        {title}
        <ChevronDown className="transition-transform group-open:rotate-180" />
      </summary>
      <div className="pt-4 text-sm leading-relaxed text-black/70">{children}</div>
    </details>
  );
}

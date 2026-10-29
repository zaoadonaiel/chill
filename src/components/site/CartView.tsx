"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { startCheckout } from "@/app/(site)/checkout/actions";
import { formatPrice } from "@/lib/format";
import { shippingFor, site } from "@/lib/site";
import { cartSubtotal, useCart } from "@/store/cart";
import { ProductImage } from "./ProductImage";

export function CartView({ onNavigate }: { onNavigate?: () => void }) {
  const items = useCart((s) => s.items);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const remaining = site.shipping.freeOverCents - subtotal;

  function checkout() {
    setError(null);
    startTransition(async () => {
      const res = await startCheckout(items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })));
      if (res.url) window.location.assign(res.url);
      else setError(res.error ?? "Could not start checkout.");
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20 text-center">
        <p className="font-display text-4xl italic">Your bag is empty</p>
        <Link
          href="/shop"
          onClick={onNavigate}
          className="border border-black px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-black hover:text-white"
        >
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-6 py-3 text-xs">
        {remaining > 0 ? (
          <>You&apos;re {formatPrice(remaining)} away from free shipping.</>
        ) : (
          <>You&apos;ve unlocked free shipping.</>
        )}
        <div className="mt-2 h-[2px] w-full bg-line">
          <div
            className="h-full bg-black transition-all duration-500"
            style={{ width: `${Math.min(100, (subtotal / site.shipping.freeOverCents) * 100)}%` }}
          />
        </div>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-6">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-5">
            <Link href={`/product/${item.slug}`} onClick={onNavigate} className="w-24 shrink-0">
              <ProductImage src={item.image} alt={item.name} className="aspect-square" />
            </Link>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-2">
                <Link href={`/product/${item.slug}`} onClick={onNavigate} className="text-sm font-bold uppercase leading-tight">
                  {item.name}
                </Link>
                <p className="shrink-0 text-sm font-semibold">{formatPrice(item.priceCents * item.quantity)}</p>
              </div>
              <p className="mt-1 text-xs text-black/60">Size: {item.size}</p>
              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center border border-line">
                  <button
                    className="h-8 w-8 text-sm hover:bg-black hover:text-white"
                    onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    className="h-8 w-8 text-sm hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                    onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= Math.min(item.maxQuantity, 10)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button className="text-xs underline underline-offset-4 opacity-60 hover:opacity-100" onClick={() => remove(item.variantId)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="space-y-2 border-t border-line px-6 py-5 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-black/60">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
        </div>
        <p className="text-xs text-black/50">Taxes calculated at checkout.</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={checkout}
          disabled={pending}
          className="mt-2 w-full bg-black py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "Redirecting…" : `Checkout — ${formatPrice(subtotal + shipping)}`}
        </button>
      </div>
    </div>
  );
}

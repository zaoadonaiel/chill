"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { cartCount, useCart } from "@/store/cart";
import { CloseIcon } from "@/components/icons";
import { CartView } from "./CartView";

export function CartDrawer() {
  const isOpen = useCart((s) => s.isOpen);
  const close = useCart((s) => s.close);
  const count = useCart((s) => cartCount(s.items));
  const pathname = usePathname();

  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`} aria-hidden={!isOpen}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Shopping bag"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-paper transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-6 md:h-[72px]">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">Bag ({count})</p>
          <button onClick={close} aria-label="Close bag" className="p-1">
            <CloseIcon />
          </button>
        </div>
        <CartView onNavigate={close} />
      </aside>
    </div>
  );
}

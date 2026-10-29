import type { Metadata } from "next";
import { CartView } from "@/components/site/CartView";

export const metadata: Metadata = { title: "Bag" };

export default function CartPage() {
  return (
    <div className="flex flex-1 justify-center bg-paper px-4 py-12 md:py-20">
      <div className="flex w-full max-w-xl flex-col">
        <h1 className="mb-8 font-display text-5xl italic">Your bag</h1>
        <div className="flex flex-1 flex-col border border-line bg-white/40">
          <CartView />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-black px-6 text-center text-white">
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">404</p>
      <h1 className="font-display text-6xl italic">Nothing here.</h1>
      <Link href="/shop" className="border border-white/40 px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-white hover:text-black">
        Back to shop
      </Link>
    </div>
  );
}

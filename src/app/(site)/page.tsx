import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { ProductCard } from "@/components/site/ProductCard";
import { getProducts } from "@/lib/queries";

export default async function HomePage() {
  const featured = await getProducts({ featured: true, limit: 4 });

  return (
    <>
      <Hero />

      {featured.length > 0 && (
        <section className="bg-paper px-4 py-16 md:px-10 md:py-24">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-black/50">Featured</p>
              <h2 className="mt-2 font-display text-4xl italic md:text-6xl">New arrivals</h2>
            </div>
            <Link href="/shop" className="text-xs font-semibold uppercase tracking-widest underline underline-offset-8 hover:opacity-60">
              Shop all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="grid bg-black text-white md:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 px-6 py-20 md:px-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">The standard</p>
          <h2 className="font-display text-5xl italic leading-[0.95] md:text-7xl">Made slowly. Worn for years.</h2>
          <p className="max-w-md text-sm leading-relaxed text-white/60">
            Heavyweight fabrics, reinforced seams and a fit that stays put wash after wash. Produced in small runs —
            when it&apos;s gone, it&apos;s gone.
          </p>
          <Link
            href="/about"
            className="w-fit border border-white/40 px-8 py-3 text-xs font-semibold uppercase tracking-widest transition-colors hover:bg-white hover:text-black"
          >
            Our story
          </Link>
        </div>
        <div className="grain relative min-h-[50vh] overflow-hidden bg-[radial-gradient(ellipse_at_30%_40%,#3a3f46_0%,#121417_55%,#000_90%)]">
          <span className="absolute bottom-8 right-8 font-display text-[9rem] italic leading-none text-white/10 md:text-[14rem]">
            FW
          </span>
        </div>
      </section>
    </>
  );
}

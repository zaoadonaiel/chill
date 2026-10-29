import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/site/ProductCard";
import { ChevronDown, FilterIcon } from "@/components/icons";
import { getCategories, getProducts, type ShopSort } from "@/lib/queries";

export const metadata: Metadata = { title: "Shop" };

const SORTS: { value: ShopSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function href(params: { category?: string; sort?: string }) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export default async function ShopPage({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const sort = (SORTS.find((s) => s.value === sp.sort)?.value ?? "newest") as ShopSort;

  const [products, categories] = await Promise.all([getProducts({ category, sort }), getCategories()]);

  return (
    <div className="flex-1 bg-paper">
      <div className="px-4 pb-4 pt-8 md:px-10">
        <h1 className="text-3xl font-bold md:text-4xl">{category ?? "Shop"}</h1>
      </div>

      <div className="sticky top-16 z-20 flex items-center border-y border-line bg-paper md:top-[72px]">
        <details className="group relative">
          <summary className="flex cursor-pointer items-center gap-2 border-r border-line px-6 py-3 text-xs font-bold uppercase transition-colors hover:bg-black hover:text-white">
            <FilterIcon />
            Filter
          </summary>
          <div className="absolute left-0 top-full z-30 min-w-56 border border-line bg-paper py-2 shadow-xl">
            <Link href={href({ sort })} className={`block px-5 py-2 text-xs uppercase hover:bg-black hover:text-white ${!category ? "font-bold" : ""}`}>
              All products
            </Link>
            {categories.map((c) => (
              <Link
                key={c}
                href={href({ category: c, sort })}
                className={`block px-5 py-2 text-xs uppercase hover:bg-black hover:text-white ${category === c ? "font-bold" : ""}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </details>

        <nav className="ml-4 flex items-center gap-1 text-xs text-black/50">
          <Link href="/" className="underline transition-colors hover:text-black">
            Home
          </Link>
          <span>/</span>
          {category ? (
            <>
              <Link href="/shop" className="underline transition-colors hover:text-black">
                Shop
              </Link>
              <span>/</span>
              <span className="font-bold text-black">{category}</span>
            </>
          ) : (
            <span className="font-bold text-black">Shop</span>
          )}
        </nav>

        <details className="relative ml-auto">
          <summary className="flex cursor-pointer items-center gap-2 border-l border-line px-6 py-3 text-xs font-bold uppercase transition-colors hover:bg-black hover:text-white">
            Sort
            <ChevronDown />
          </summary>
          <div className="absolute right-0 top-full z-30 min-w-56 border border-line bg-paper py-2 shadow-xl">
            {SORTS.map((s) => (
              <Link
                key={s.value}
                href={href({ category, sort: s.value })}
                className={`block px-5 py-2 text-xs uppercase hover:bg-black hover:text-white ${sort === s.value ? "font-bold" : ""}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
        </details>
      </div>

      <div className="px-4 py-8 md:px-10">
        {products.length === 0 ? (
          <p className="py-24 text-center text-sm text-black/50">No products yet. Add some from the admin panel.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

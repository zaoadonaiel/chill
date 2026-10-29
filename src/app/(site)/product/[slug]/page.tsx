import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/ProductCard";
import { ProductDetails } from "@/components/site/ProductDetails";
import { getProductBySlug, getProducts } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/product/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    openGraph: { images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: PageProps<"/product/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.category
    ? (await getProducts({ category: product.category, limit: 5 })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="flex-1 bg-paper">
      <nav className="flex items-center gap-1 border-b border-line px-4 py-3 text-xs text-black/50 md:px-10">
        <Link href="/" className="underline hover:text-black">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="underline hover:text-black">
          Shop
        </Link>
        <span>/</span>
        <span className="font-bold text-black">{product.name}</span>
      </nav>

      <ProductDetails product={product} />

      {related.length > 0 && (
        <section className="border-t border-line px-4 py-16 md:px-10">
          <h2 className="mb-10 font-display text-4xl italic">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

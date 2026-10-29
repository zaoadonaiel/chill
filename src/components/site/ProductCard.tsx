import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.product_variants.some((v) => v.stock > 0);
  const [first, second] = product.images;

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col items-center text-center">
      <div className="relative aspect-square w-full overflow-hidden">
        <ProductImage
          src={first}
          alt={product.name}
          className="h-full w-full"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        {second && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={second}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {!inStock && (
          <span className="absolute left-3 top-3 bg-black px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-3 flex w-full flex-col items-center gap-1.5">
        <p className="text-sm font-bold uppercase leading-tight">{product.name}</p>
        <p className="text-sm font-bold">
          {product.compare_at_cents && product.compare_at_cents > product.price_cents && (
            <span className="mr-2 font-normal text-black/40 line-through">{formatPrice(product.compare_at_cents)}</span>
          )}
          {formatPrice(product.price_cents)}
        </p>
        {product.color_hex && (
          <div className="h-6 w-6 border border-line" style={{ backgroundColor: product.color_hex }} title={product.color_name ?? ""} />
        )}
        <div className="mt-0.5 flex flex-wrap items-center justify-center gap-1.5">
          {product.product_variants.map((v) => (
            <span
              key={v.id}
              className={`border border-line px-2 py-1 text-xs transition-colors group-hover:border-black/40 ${
                v.stock > 0 ? "" : "text-black/30 line-through"
              }`}
            >
              {v.size}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

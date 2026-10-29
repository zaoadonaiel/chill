import type { Metadata } from "next";
import Link from "next/link";
import { ProductImage } from "@/components/site/ProductImage";
import { formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { buttonClass, Card, PageHeader, tdClass, thClass } from "../ui";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .order("created_at", { ascending: false })
    .overrideTypes<Product[], { merge: false }>();

  return (
    <>
      <PageHeader
        title="Products"
        actions={
          <Link href="/admin/products/new" className={buttonClass}>
            Add product
          </Link>
        }
      />
      <Card className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-neutral-200">
            <tr>
              <th className={thClass}>Product</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Stock</th>
              <th className={thClass}>Category</th>
              <th className={`${thClass} text-right`}>Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(products ?? []).map((p) => {
              const stock = p.product_variants.reduce((n, v) => n + v.stock, 0);
              return (
                <tr key={p.id} className="hover:bg-neutral-50">
                  <td className={tdClass}>
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <ProductImage src={p.images[0]} alt="" className="aspect-square w-12 shrink-0 border border-neutral-200" />
                      <span className="font-semibold hover:underline">{p.name}</span>
                    </Link>
                  </td>
                  <td className={tdClass}>
                    <span
                      className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        p.active ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"
                      }`}
                    >
                      {p.active ? "Active" : "Draft"}
                    </span>
                    {p.featured && <span className="ml-2 text-[10px] uppercase tracking-wider text-neutral-500">Featured</span>}
                  </td>
                  <td className={tdClass}>
                    <span className={stock === 0 ? "text-rose-600" : ""}>{stock}</span>
                    <span className="text-neutral-500"> in {p.product_variants.length} sizes</span>
                  </td>
                  <td className={tdClass}>{p.category ?? "—"}</td>
                  <td className={`${tdClass} text-right`}>{formatPrice(p.price_cents)}</td>
                </tr>
              );
            })}
            {!products?.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-neutral-500">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}

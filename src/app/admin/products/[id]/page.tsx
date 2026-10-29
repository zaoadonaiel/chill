import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { ghostButtonClass, PageHeader } from "../../ui";
import { ProductForm } from "../ProductForm";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*, product_variants(*)").eq("id", id).maybeSingle<Product>();
  if (!product) notFound();
  product.product_variants.sort((a, b) => a.position - b.position);

  return (
    <>
      <PageHeader
        title={product.name}
        actions={
          product.active && (
            <Link href={`/product/${product.slug}`} target="_blank" className={ghostButtonClass}>
              View in store ↗
            </Link>
          )
        }
      />
      <ProductForm product={product} />
    </>
  );
}

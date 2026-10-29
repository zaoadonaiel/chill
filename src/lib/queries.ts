import "server-only";
import { connection } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

const PRODUCT_SELECT = "*, product_variants(*)";

export type ShopSort = "newest" | "price-asc" | "price-desc";

function sortVariants(product: Product) {
  product.product_variants?.sort((a, b) => a.position - b.position);
  return product;
}

export async function getProducts(opts: { category?: string; sort?: ShopSort; featured?: boolean; limit?: number } = {}) {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_SELECT).eq("active", true);
  if (opts.category) query = query.eq("category", opts.category);
  if (opts.featured) query = query.eq("featured", true);
  if (opts.sort === "price-asc") query = query.order("price_cents", { ascending: true });
  else if (opts.sort === "price-desc") query = query.order("price_cents", { ascending: false });
  else query = query.order("created_at", { ascending: false });
  if (opts.limit) query = query.limit(opts.limit);

  const { data, error } = await query.overrideTypes<Product[], { merge: false }>();
  if (error) {
    console.error("getProducts", error);
    return [];
  }
  return data.map(sortVariants);
}

export async function getProductBySlug(slug: string) {
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle<Product>();
  if (error) console.error("getProductBySlug", error);
  return data ? sortVariants(data) : null;
}

export async function getCategories() {
  await connection();
  if (!isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("category").eq("active", true).not("category", "is", null);
  return [...new Set((data ?? []).map((r: { category: string }) => r.category))].sort();
}

export async function searchCatalog(term: string) {
  const q = term.trim().replace(/[%_,()]/g, " ").slice(0, 60);
  if (!q || !isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price_cents, images, category")
    .eq("active", true)
    .or(`name.ilike.%${q}%,category.ilike.%${q}%`)
    .limit(8);
  return (data ?? []) as Pick<Product, "id" | "name" | "slug" | "price_cents" | "images" | "category">[];
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "Name is required").max(120),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and dashes"),
  description: z.string().max(5000),
  price_cents: z.number().int().min(0),
  compare_at_cents: z.number().int().min(0).nullable(),
  category: z.string().trim().max(60).nullable(),
  color_name: z.string().trim().max(60).nullable(),
  color_hex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex value like #000000")
    .nullable(),
  images: z.array(z.string().url()).max(12),
  active: z.boolean(),
  featured: z.boolean(),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        size: z.string().trim().min(1, "Every size needs a label").max(20),
        sku: z.string().trim().max(60).nullable(),
        stock: z.number().int().min(0),
      }),
    )
    .min(1, "Add at least one size"),
});

export type ProductInput = z.input<typeof productSchema>;

export async function saveProduct(input: ProductInput): Promise<{ error?: string }> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product" };

  const { id, variants, ...fields } = parsed.data;
  const sizes = variants.map((v) => v.size.toLowerCase());
  if (new Set(sizes).size !== sizes.length) return { error: "Each size can only be listed once" };

  const supabase = await createClient();

  let productId = id;
  if (productId) {
    const { error } = await supabase.from("products").update(fields).eq("id", productId);
    if (error) return { error: error.code === "23505" ? "That slug is already used" : error.message };
  } else {
    const { data, error } = await supabase.from("products").insert(fields).select("id").single<{ id: string }>();
    if (error) return { error: error.code === "23505" ? "That slug is already used" : error.message };
    productId = data.id;
  }

  // Sync variants: delete removed ones, update existing, insert new.
  const keepIds = variants.flatMap((v) => (v.id ? [v.id] : []));
  let del = supabase.from("product_variants").delete().eq("product_id", productId);
  if (keepIds.length) del = del.not("id", "in", `(${keepIds.join(",")})`);
  const { error: delError } = await del;
  if (delError) return { error: delError.message };

  const rows = variants.map((v, position) => ({ ...v, product_id: productId, position }));
  const existing = rows.filter((r) => r.id);
  const added = rows
    .filter((r) => !r.id)
    .map((r) => ({ product_id: r.product_id, size: r.size, sku: r.sku, stock: r.stock, position: r.position }));
  if (existing.length) {
    const { error } = await supabase.from("product_variants").upsert(existing);
    if (error) return { error: error.message };
  }
  if (added.length) {
    const { error } = await supabase.from("product_variants").insert(added);
    if (error) return { error: error.code === "23505" ? "Each size can only be listed once" : error.message };
  }

  revalidatePath("/", "layout");
  redirect("/admin/products");
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  if (!z.string().uuid().safeParse(id).success) return { error: "Invalid product" };
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

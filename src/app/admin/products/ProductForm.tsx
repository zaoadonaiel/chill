"use client";

import { useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { slugify } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/site/ProductImage";
import { buttonClass, Card, ghostButtonClass, inputClass } from "../ui";
import { deleteProduct, saveProduct } from "./actions";

type VariantRow = { key: string; id?: string; size: string; sku: string; stock: string };

const BUCKET = "product-images";

const toDollars = (cents: number | null | undefined) => (cents == null ? "" : (cents / 100).toFixed(2));
const toCents = (value: string) => (value.trim() === "" ? null : Math.round(parseFloat(value) * 100));

export function ProductForm({ product }: { product?: Product }) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(toDollars(product?.price_cents));
  const [compareAt, setCompareAt] = useState(toDollars(product?.compare_at_cents));
  const [category, setCategory] = useState(product?.category ?? "");
  const [colorName, setColorName] = useState(product?.color_name ?? "");
  const [colorHex, setColorHex] = useState(product?.color_hex ?? "#000000");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [active, setActive] = useState(product?.active ?? true);
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [variants, setVariants] = useState<VariantRow[]>(
    product?.product_variants.map((v) => ({ key: v.id, id: v.id, size: v.size, sku: v.sku ?? "", stock: String(v.stock) })) ?? [
      { key: "S", size: "S", sku: "", stock: "0" },
      { key: "M", size: "M", sku: "", stock: "0" },
      { key: "L", size: "L", sku: "", stock: "0" },
      { key: "XL", size: "XL", sku: "", stock: "0" },
    ],
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    try {
      for (const file of files) {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, { cacheControl: "31536000", contentType: file.type });
        if (error) throw error;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        setImages((imgs) => [...imgs, data.publicUrl]);
      }
    } catch (err) {
      setError(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(false);
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    setImages((imgs) => {
      const next = [...imgs];
      const j = i + dir;
      if (j < 0 || j >= next.length) return imgs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function submit() {
    setError(null);
    const priceCents = toCents(price);
    if (priceCents == null || Number.isNaN(priceCents)) {
      setError("Enter a price");
      return;
    }
    startTransition(async () => {
      const res = await saveProduct({
        id: product?.id,
        name,
        slug,
        description,
        price_cents: priceCents,
        compare_at_cents: toCents(compareAt),
        category: category.trim() || null,
        color_name: colorName.trim() || null,
        color_hex: colorName.trim() ? colorHex : null,
        images,
        active,
        featured,
        variants: variants.map((v) => ({
          id: v.id,
          size: v.size,
          sku: v.sku.trim() || null,
          stock: Math.max(0, parseInt(v.stock, 10) || 0),
        })),
      });
      if (res?.error) setError(res.error);
    });
  }

  function remove() {
    if (!product || !confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <div className="space-y-6">
        <Card className="space-y-4 p-5">
          <Label text="Name">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
            />
          </Label>
          <Label text="URL slug">
            <div className="flex items-center">
              <span className="border border-r-0 border-neutral-300 bg-neutral-50 px-3 py-2 text-sm text-neutral-500">/product/</span>
              <input
                className={inputClass}
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
              />
            </div>
          </Label>
          <Label text="Description">
            <textarea className={`${inputClass} min-h-36`} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Label>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Images</h2>
            <label className={`${ghostButtonClass} cursor-pointer`}>
              {uploading ? "Uploading…" : "Upload"}
              <input type="file" accept="image/*" multiple className="hidden" onChange={upload} disabled={uploading} />
            </label>
          </div>
          {images.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">No images. The first image is used on the shop grid; the second shows on hover.</p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {images.map((src, i) => (
                <li key={src} className="group relative border border-neutral-200">
                  <ProductImage src={src} alt="" className="aspect-square" />
                  {i === 0 && <span className="absolute left-1 top-1 bg-black px-1.5 py-0.5 text-[9px] uppercase text-white">Main</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" className="px-2 py-1 hover:bg-neutral-200" onClick={() => moveImage(i, -1)} aria-label="Move left">
                      ←
                    </button>
                    <button type="button" className="px-2 py-1 text-rose-600 hover:bg-rose-50" onClick={() => setImages((imgs) => imgs.filter((x) => x !== src))}>
                      Remove
                    </button>
                    <button type="button" className="px-2 py-1 hover:bg-neutral-200" onClick={() => moveImage(i, 1)} aria-label="Move right">
                      →
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Sizes & inventory</h2>
            <button
              type="button"
              className={ghostButtonClass}
              onClick={() => setVariants((vs) => [...vs, { key: crypto.randomUUID(), size: "", sku: "", stock: "0" }])}
            >
              Add size
            </button>
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2 text-[11px] uppercase tracking-wider text-neutral-500">
              <span>Size</span>
              <span>SKU</span>
              <span>Stock</span>
              <span className="w-16" />
            </div>
            {variants.map((v) => (
              <div key={v.key} className="grid grid-cols-[1fr_1.5fr_1fr_auto] gap-2">
                <input className={inputClass} value={v.size} placeholder="M" onChange={(e) => updateVariant(v.key, { size: e.target.value })} />
                <input className={inputClass} value={v.sku} placeholder="Optional" onChange={(e) => updateVariant(v.key, { sku: e.target.value })} />
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  value={v.stock}
                  onChange={(e) => updateVariant(v.key, { stock: e.target.value })}
                />
                <button
                  type="button"
                  className="w-16 text-xs text-rose-600 hover:underline"
                  onClick={() => setVariants((vs) => vs.filter((x) => x.key !== v.key))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="space-y-3 p-5">
          <h2 className="text-sm font-semibold">Visibility</h2>
          <Toggle checked={active} onChange={setActive} label="Active (visible in store)" />
          <Toggle checked={featured} onChange={setFeatured} label="Featured on home page" />
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Pricing</h2>
          <Label text="Price (USD)">
            <input className={inputClass} type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </Label>
          <Label text="Compare-at price (optional)">
            <input className={inputClass} type="number" min={0} step="0.01" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} />
          </Label>
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="text-sm font-semibold">Details</h2>
          <Label text="Category">
            <input className={inputClass} value={category} placeholder="Hoodies" onChange={(e) => setCategory(e.target.value)} />
          </Label>
          <Label text="Color">
            <div className="flex gap-2">
              <input className={inputClass} value={colorName} placeholder="Black" onChange={(e) => setColorName(e.target.value)} />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="h-[38px] w-12 shrink-0 cursor-pointer border border-neutral-300 bg-white p-1"
              />
            </div>
          </Label>
        </Card>

        {error && <p className="border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={submit} disabled={pending || uploading} className={`${buttonClass} flex-1`}>
            {pending ? "Saving…" : product ? "Save changes" : "Create product"}
          </button>
          {product && (
            <button type="button" onClick={remove} disabled={pending} className={`${ghostButtonClass} text-rose-600 hover:border-rose-600`}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ text, children }: { text: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-600">{text}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-black" />
      {label}
    </label>
  );
}

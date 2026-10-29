"use server";

import { z } from "zod";
import { getOrigin, getSession } from "@/lib/auth";
import { shippingFor, site } from "@/lib/site";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const cartSchema = z
  .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(10) }))
  .min(1)
  .max(50);

type VariantRow = {
  id: string;
  size: string;
  stock: number;
  product: { id: string; name: string; slug: string; price_cents: number; images: string[]; active: boolean } | null;
};

// Prices and stock always come from the database — never from the browser.
export async function startCheckout(input: unknown): Promise<{ url?: string; error?: string }> {
  const parsed = cartSchema.safeParse(input);
  if (!parsed.success) return { error: "Your bag is invalid. Please refresh and try again." };

  try {
    const admin = createAdminClient();
    const ids = parsed.data.map((i) => i.variantId);
    const { data: variants, error } = await admin
      .from("product_variants")
      .select("id, size, stock, product:products(id, name, slug, price_cents, images, active)")
      .in("id", ids)
      .overrideTypes<VariantRow[], { merge: false }>();
    if (error) throw error;

    const lines = [];
    for (const item of parsed.data) {
      const v = variants.find((x) => x.id === item.variantId);
      if (!v?.product?.active) return { error: "An item in your bag is no longer available." };
      if (v.stock < item.quantity) {
        return { error: `Only ${v.stock} left of ${v.product.name} (${v.size}). Please update your bag.` };
      }
      lines.push({ variant: v, product: v.product, quantity: item.quantity });
    }

    const subtotal = lines.reduce((n, l) => n + l.product.price_cents * l.quantity, 0);
    const shipping = shippingFor(subtotal);
    const { user } = await getSession();
    const origin = await getOrigin();

    const { data: order, error: orderError } = await admin
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email: user?.email ?? null,
        currency: site.currency,
        subtotal_cents: subtotal,
        shipping_cents: shipping,
        total_cents: subtotal + shipping,
      })
      .select("id")
      .single<{ id: string }>();
    if (orderError) throw orderError;

    const { error: itemsError } = await admin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product.id,
        variant_id: l.variant.id,
        product_name: l.product.name,
        size: l.variant.size,
        image: l.product.images[0] ?? null,
        unit_price_cents: l.product.price_cents,
        quantity: l.quantity,
      })),
    );
    if (itemsError) throw itemsError;

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: site.currency,
          unit_amount: l.product.price_cents,
          product_data: {
            name: l.product.name,
            description: `Size ${l.variant.size}`,
            images: l.product.images.filter((src) => src.startsWith("https://")).slice(0, 1),
          },
        },
      })),
      shipping_address_collection: { allowed_countries: [...site.shipping.countries] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: shipping === 0 ? "Free shipping" : "Standard shipping",
            fixed_amount: { amount: shipping, currency: site.currency },
            delivery_estimate: {
              minimum: { unit: "business_day", value: 3 },
              maximum: { unit: "business_day", value: 7 },
            },
          },
        },
      ],
      customer_email: user?.email ?? undefined,
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      payment_intent_data: { metadata: { order_id: order.id } },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    await admin.from("orders").update({ stripe_session_id: session.id }).eq("id", order.id);

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  } catch (err) {
    console.error("startCheckout", err);
    return { error: "Checkout is unavailable right now. Please try again." };
  }
}

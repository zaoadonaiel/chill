export type Variant = {
  id: string;
  product_id: string;
  size: string;
  sku: string | null;
  stock: number;
  position: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  category: string | null;
  color_name: string | null;
  color_hex: string | null;
  images: string[];
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  product_variants: Variant[];
};

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled", "refunded"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type ShippingAddress = {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  size: string | null;
  image: string | null;
  unit_price_cents: number;
  quantity: number;
};

export type Order = {
  id: string;
  number: number;
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  currency: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  stripe_session_id: string | null;
  stripe_payment_intent: string | null;
  shipping_name: string | null;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  paid_at: string | null;
  order_items?: OrderItem[];
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "customer" | "admin";
  created_at: string;
};

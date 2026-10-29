import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { StatusBadge } from "./StatusBadge";

export function OrderSummary({ order }: { order: Order }) {
  const a = order.shipping_address;
  return (
    <div className="border border-line bg-white/50">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest">Order #{order.number}</p>
        <StatusBadge status={order.status} />
      </div>
      <ul className="divide-y divide-line px-5">
        {order.order_items?.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-4">
            <ProductImage src={item.image} alt={item.product_name} className="aspect-square w-16 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold uppercase">{item.product_name}</p>
              <p className="text-xs text-black/60">
                Size {item.size} · Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm">{formatPrice(item.unit_price_cents * item.quantity, order.currency)}</p>
          </li>
        ))}
      </ul>
      <div className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
        <Row label="Subtotal" value={formatPrice(order.subtotal_cents, order.currency)} />
        <Row label="Shipping" value={order.shipping_cents ? formatPrice(order.shipping_cents, order.currency) : "Free"} />
        {order.tax_cents > 0 && <Row label="Tax" value={formatPrice(order.tax_cents, order.currency)} />}
        <div className="flex justify-between pt-2 font-semibold">
          <span>Total</span>
          <span>{formatPrice(order.total_cents, order.currency)}</span>
        </div>
      </div>
      {(a || order.tracking_number) && (
        <div className="grid gap-6 border-t border-line px-5 py-4 text-sm sm:grid-cols-2">
          {a && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-black/50">Ship to</p>
              <p>{order.shipping_name}</p>
              <p className="text-black/70">
                {[a.line1, a.line2].filter(Boolean).join(", ")}
                <br />
                {[a.city, a.state, a.postal_code].filter(Boolean).join(" ")}
                <br />
                {a.country}
              </p>
            </div>
          )}
          {order.tracking_number && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-widest text-black/50">Tracking</p>
              <p className="font-mono text-xs">{order.tracking_number}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-black/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

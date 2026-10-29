"use client";

import { useActionState } from "react";
import { FormMessage } from "@/components/forms";
import { ORDER_STATUSES, type Order } from "@/lib/types";
import { buttonClass, Card, inputClass } from "../../ui";
import { updateOrder } from "../actions";

export function OrderUpdateForm({ order }: { order: Order }) {
  const [state, action, pending] = useActionState(updateOrder, undefined);
  return (
    <Card className="p-5">
      <form action={action} className="space-y-4">
        <h2 className="text-sm font-semibold">Fulfillment</h2>
        <input type="hidden" name="id" value={order.id} />
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Status</span>
          <select name="status" defaultValue={order.status} className={inputClass}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Tracking number</span>
          <input name="tracking_number" defaultValue={order.tracking_number ?? ""} className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">Internal notes</span>
          <textarea name="notes" defaultValue={order.notes ?? ""} className={`${inputClass} min-h-20`} />
        </label>
        <p className="text-xs text-neutral-500">Refunds are issued from the Stripe dashboard; the order updates automatically.</p>
        <FormMessage state={state} />
        <button disabled={pending} className={`${buttonClass} w-full`}>
          {pending ? "Saving…" : "Save"}
        </button>
      </form>
    </Card>
  );
}

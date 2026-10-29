"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES } from "@/lib/types";

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES),
  tracking_number: z.string().trim().max(120),
  notes: z.string().trim().max(2000),
});

export async function updateOrder(_: unknown, formData: FormData): Promise<{ error?: string; message?: string }> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { id, tracking_number, notes, status } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status, tracking_number: tracking_number || null, notes: notes || null })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { message: "Order updated." };
}

"use server";

import { searchCatalog } from "@/lib/queries";

export async function search(term: string) {
  if (typeof term !== "string") return [];
  return searchCatalog(term);
}

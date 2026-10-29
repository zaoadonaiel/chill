"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart";

export function ClearCart() {
  useEffect(() => {
    // Load the persisted bag first so clearing also empties localStorage.
    Promise.resolve(useCart.persist.rehydrate()).then(() => useCart.getState().clear());
  }, []);
  return null;
}

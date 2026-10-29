import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

// Fetch-based HTTP client + Web Crypto so the SDK runs on Cloudflare Workers.
export function getStripe() {
  if (!stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripe = new Stripe(key, { httpClient: Stripe.createFetchHttpClient() });
  }
  return stripe;
}

export const webCrypto = Stripe.createSubtleCryptoProvider();

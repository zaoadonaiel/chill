// Brand + store settings. Change these to make the store your own.
export const site = {
  name: "C.H.ILL",
  // Shown in the header/hero when `logo` is null. Swap for your own mark.
  wordmark: "C.H.ILL",
  tagline: "Quiet streetwear, made to last.",
  description: "C.H.ILL — premium heavyweight streetwear, cut and sewn in small runs.",
  // Put files in /public and set e.g. "/logo.png" and "/hero.jpg".
  logo: null as string | null,
  // Demo photo from Unsplash; replace with your own campaign image.
  heroImage: "https://images.unsplash.com/photo-1513789181297-6f2ec112c0bc?w=2400&q=80" as string | null,

  currency: "usd",
  // Flat-rate shipping, free above the threshold. Amounts in cents.
  shipping: {
    flatCents: 1000,
    freeOverCents: 15000,
    countries: ["US", "CA", "GB", "AU", "DE", "FR", "NL", "IE", "SE", "AE"] as const,
  },

  supportEmail: "support@example.com",

  nav: [
    { label: "Shop", href: "/shop" },
    { label: "Collaborations", href: "/collaborations" },
    { label: "More", href: "/more" },
  ],
  social: [
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
    { label: "X", href: "#" },
    { label: "YouTube", href: "#" },
  ],
  footerAbout: [
    { label: "About", href: "/about" },
    { label: "FAQs", href: "/faqs" },
    { label: "Shipping", href: "/shipping" },
    { label: "Returns", href: "/returns" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Accessibility", href: "/accessibility" },
  ],
};

export function shippingFor(subtotalCents: number) {
  return subtotalCents >= site.shipping.freeOverCents ? 0 : site.shipping.flatCents;
}

import { site } from "@/lib/site";

// Copy for the simple content pages. Edit freely — each key is a URL (/about, /faqs…).
export type ContentPage = {
  title: string;
  eyebrow?: string;
  intro?: string;
  sections: { heading?: string; body: string }[];
  links?: { label: string; href: string }[];
};

export const pages: Record<string, ContentPage> = {
  about: {
    eyebrow: "About",
    title: "Made slowly. Worn for years.",
    intro: `${site.name} started with one hoodie and a simple rule: make fewer things, and make them better.`,
    sections: [
      {
        body: "Every piece starts with fabric — heavyweight cottons, milled for us and garment-dyed for depth. We cut generous, boxy silhouettes, reinforce the seams that take the most stress, and test every run through dozens of washes before it ships.",
      },
      {
        heading: "Small runs",
        body: "We produce in limited quantities. It keeps waste low and quality high. When a colorway sells out, it may not come back.",
      },
    ],
  },
  collaborations: {
    eyebrow: "Collaborations",
    title: "Made with friends.",
    intro: "Limited capsules with artists, designers and brands we admire.",
    sections: [
      { heading: "Coming soon", body: "Our first collaboration drops soon. Create an account to be the first to know." },
      { heading: "Work with us", body: `Interested in a collaboration? Reach out at ${site.supportEmail}.` },
    ],
  },
  more: {
    eyebrow: "More",
    title: "Everything else.",
    sections: [],
    links: [
      { label: "About", href: "/about" },
      { label: "FAQs", href: "/faqs" },
      { label: "Shipping", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "Contact", href: "/contact" },
      { label: "Account", href: "/account" },
    ],
  },
  faqs: {
    eyebrow: "Help",
    title: "FAQs",
    sections: [
      { heading: "How do your pieces fit?", body: "Our tops are cut boxy and slightly cropped. Take your usual size for the intended fit, or size down for a closer fit." },
      { heading: "When will my order ship?", body: "Orders ship within 1–2 business days. You'll get an email with tracking as soon as it leaves us." },
      { heading: "Do I need an account to order?", body: "No — guest checkout is available. An account lets you see your order history and track orders in one place." },
      { heading: "Which payment methods do you accept?", body: "All major cards, Apple Pay and Google Pay, processed securely by Stripe." },
      { heading: "How do I care for my garments?", body: "Wash cold, inside out, and hang dry. Avoid tumble drying to keep the shape and the print." },
    ],
  },
  shipping: {
    eyebrow: "Help",
    title: "Shipping",
    sections: [
      { heading: "Rates", body: `Flat-rate shipping on every order, free over $${site.shipping.freeOverCents / 100}.` },
      { heading: "Timing", body: "Orders are processed within 1–2 business days. Standard delivery takes 3–7 business days." },
      { heading: "Where we ship", body: `We currently ship to: ${site.shipping.countries.join(", ")}. Duties and taxes may apply for international orders.` },
    ],
  },
  returns: {
    eyebrow: "Help",
    title: "Returns",
    sections: [
      { heading: "30-day returns", body: "Unworn, unwashed items with original tags can be returned within 30 days of delivery." },
      { heading: "How to return", body: `Email ${site.supportEmail} with your order number and we'll send instructions.` },
      { heading: "Refunds", body: "Refunds go back to your original payment method within 5–10 business days of us receiving the return." },
    ],
  },
  contact: {
    eyebrow: "Help",
    title: "Contact",
    intro: "We usually reply within one business day.",
    sections: [
      { heading: "Customer service", body: site.supportEmail },
      { heading: "Press & collaborations", body: site.supportEmail },
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms & Conditions",
    intro: "Replace this placeholder with your own terms before launch.",
    sections: [
      { heading: "Orders", body: "All orders are subject to availability and confirmation of the order price." },
      { heading: "Pricing", body: "Prices are listed in USD and may change without notice. Taxes are calculated at checkout." },
    ],
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy Policy",
    intro: "Replace this placeholder with your own policy before launch.",
    sections: [
      { heading: "What we collect", body: "Your name, email and shipping address to fulfil orders. Payment details are handled by Stripe and never touch our servers." },
      { heading: "Your rights", body: `Email ${site.supportEmail} to access or delete your data.` },
    ],
  },
  accessibility: {
    eyebrow: "Legal",
    title: "Accessibility",
    sections: [
      {
        body: `We want everyone to be able to use this site. If anything gets in your way, tell us at ${site.supportEmail} and we'll fix it.`,
      },
    ],
  },
};

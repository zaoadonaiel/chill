import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers has no built-in Next.js image optimizer; product images
  // are served straight from Supabase Storage.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

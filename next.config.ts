import type { NextConfig } from "next";

/**
 * Supabase Storage images are proxied through /api/asset/* so that:
 *   1. next/image can optimise them,
 *   2. signed URLs for private objects stay server-side,
 *   3. the host allow-list stays narrow.
 * Local development falls back to remotePatterns for the public bucket.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["motion"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats — Next picks AVIF, then WebP, by Accept header.
    // The 488 KB source PNG is compressed on-the-fly to a few KB per size.
    formats: ["image/avif", "image/webp"],
    // Tight size set keeps the logo payload minimal on mobile.
    imageSizes: [16, 32, 48, 64, 96, 128],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

// next/image is used only for the logo, which is now an SVG — Next serves those
// unoptimized by default, so there is nothing left for `images` to tune here.
const nextConfig: NextConfig = {};

export default nextConfig;

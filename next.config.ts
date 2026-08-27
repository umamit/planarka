import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Webpack is used for production builds; Turbopack is dev-only via `next dev --turbo` */
  experimental: {},
};

export default nextConfig;

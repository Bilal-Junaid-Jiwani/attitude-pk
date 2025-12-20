import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'cdn.shopify.com', 'Attitude-pk.myshopify.com'],
  },
  transpilePackages: ['mongoose', 'mongodb'],
  /* config options here */
};

export default nextConfig;

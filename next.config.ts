import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16+ automatically supports instrumentation
  // No experimental flag needed
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    // Type verification is enforced independently via `npx tsc --noEmit`
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

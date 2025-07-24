import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Это правило для ESLint мы оставляем
  eslint: {
    ignoreDuringBuilds: true,
  },

  // А вот это новое правило для TypeScript
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Разрешаем все HTTPS домены для аватарок (в проде лучше указать конкретные CDN)
      },
    ],
  },
};

export default nextConfig;
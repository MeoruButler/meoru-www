import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: ['next.meoru.localhost'],
  transpilePackages: ['@meoru/ui'],
  typedRoutes: true,
};

export default nextConfig;

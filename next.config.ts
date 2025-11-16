import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai'],
  output: 'standalone',
};

export default nextConfig;

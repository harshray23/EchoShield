if (typeof globalThis !== 'undefined') {
  try {
    const g = globalThis as any;
    if (g.localStorage && typeof g.localStorage.getItem !== 'function') {
      delete g.localStorage;
    }
  } catch (e) {
    // safe fallback
  }
}

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

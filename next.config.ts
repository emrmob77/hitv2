import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore errors for build (will be caught by ESLint warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Turbopack only for development
  ...(process.env.NODE_ENV !== 'production' && {
    turbopack: {
      root: __dirname,
    },
  }),
  // Performance Optimizations
  compress: true, // Enable gzip compression

  // Image Optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Experimental Features for Performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
    webpackBuildWorker: true,
  },

  // Headers for Performance and Security
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';
    const hasSSL = process.env.VERCEL || process.env.STORMKIT; // Stormkit and Vercel provide SSL
    
    const securityHeaders = [
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on'
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'origin-when-cross-origin'
      },
    ];

    // Only add HSTS in production with SSL
    if (isProduction && hasSSL) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains'
      });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache images
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

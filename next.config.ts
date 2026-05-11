import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Core Performance */
  poweredByHeader: false,
  reactCompiler: true,
  compress: true, // Enable gzip/brotli compression for all responses

  // All image optimization is handled by Cloudinary (see lib/optimizeImage.ts).
  // unoptimized: true disables Vercel Image Optimization entirely,
  // so formats, minimumCacheTTL, and remotePatterns are unnecessary.
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // ── Cache Headers — fixes "Add Expires headers" F grade ──────────────────
  async headers() {
    return [
      {
        // Static assets in _next/static (JS, CSS bundles) — immutable, hashed filenames
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Images served from /images/ directory
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Fonts (woff2, woff, ttf) .
        source: '/_next/static/media/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Favicon and app icons
        source: '/:path(favicon.ico|icon.png|apple-icon.png|site.webmanifest)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // All pages
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

import { DEVICE_SIZES, getImageProxy, IMAGE_SIZES } from './lib/image-variants';

// Validates the image env (failing the build on bad values) and returns the proxy rewrite when
// images are served same-origin. See `lib/image-variants.ts` for the three hosting modes.
const imageProxy = getImageProxy(process.env.NEXT_PUBLIC_IMAGE_CDN_URL, process.env.IMAGE_ORIGIN_URL);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['diary.meoru.localhost'],
  transpilePackages: ['@meoru/ui'],
  typedRoutes: true,
  images: {
    // Without `NEXT_PUBLIC_IMAGE_CDN_URL`, `public/photos` is served through the built-in optimizer.
    // With it, stickers point straight at pre-generated variants (`lib/image-variants.ts`) and
    // `/_next/image` is never called, so Vercel's transformation quota stays untouched.
    formats: ['image/avif', 'image/webp'],
    // Stickers render at 19-43vw (see `STICKER_SIZES`), so the srcset needs widths well below the
    // viewport: 256-640 for phones, 828-1600 for 2x desktops. Anything above 1920 is wasted bytes.
    // Shared with the variant generator so every width the srcset lists exists in the bucket.
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
    qualities: [60, 75, 85],
    // Photo files are content-addressed, so the optimized variants can be cached for a year.
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  async rewrites() {
    return imageProxy ? [imageProxy] : [];
  },
  async headers() {
    if (!imageProxy) return [];
    return [
      {
        source: imageProxy.source,
        headers: [
          // Vercel caches external rewrites by default only for projects created on or after
          // 2026-04-06; this opts older projects in so the bucket only sees cache misses.
          { key: 'x-vercel-enable-rewrite-caching', value: '1' },
          // Variants are content-addressed, so a year is safe even if an upload missed its header.
          { key: 'CDN-Cache-Control', value: 'max-age=31536000' },
        ],
      },
    ];
  },
};

export default nextConfig;

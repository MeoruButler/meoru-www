import type { NextConfig } from 'next';

import { getImageCdnRemotePattern } from './lib/image-cdn';

const cdnUrl = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;
const remotePattern = getImageCdnRemotePattern(cdnUrl);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['diary.meoru.localhost'],
  transpilePackages: ['@meoru/ui'],
  typedRoutes: true,
  images: {
    // Without a CDN, `public/photos` is served through the built-in optimizer. Once
    // `NEXT_PUBLIC_IMAGE_CDN_URL` is set, the custom loader builds edge-transform URLs instead.
    // Registering `loader: 'custom'` disables `/_next/image`, so it must stay conditional.
    ...(cdnUrl ? { loader: 'custom' as const, loaderFile: './lib/image-loader.ts' } : {}),
    formats: ['image/avif', 'image/webp'],
    // Stickers render at 19-43vw (see `STICKER_SIZES`), so the srcset needs widths well below the
    // viewport: 256-640 for phones, 828-1600 for 2x desktops. Anything above 1920 is wasted bytes.
    deviceSizes: [640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [256, 384, 512],
    qualities: [60, 75, 85],
    // Photo files are content-addressed, so the optimized variants can be cached for a year.
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Only consulted by the built-in optimizer; lets the CDN act as a plain origin if the custom
    // loader lines above are ever removed.
    remotePatterns: remotePattern ? [remotePattern] : [],
  },
};

export default nextConfig;

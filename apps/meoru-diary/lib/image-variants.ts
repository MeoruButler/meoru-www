import type { ImageLoader } from 'next/image';

/**
 * Contract between the variant generator (`lib/photo-variants.ts`) and the browser. With
 * `NEXT_PUBLIC_IMAGE_CDN_URL` set, stickers request pre-generated files straight from the image
 * bucket, so nothing is resized at runtime and no image-transformation quota is spent.
 *
 * Bucket layout: `<key>/w<width>.<format>`, where `key` is `<content hash>/<rendition version>`
 * from the manifest. Keys are content-addressed and never overwritten, so objects can be cached as
 * immutable and the bucket can move to another host by copying it and changing only the base URL.
 *
 * Kept free of `@/` imports: `next.config.ts` and the Node scripts load this file directly.
 */

/** `images.imageSizes` and `images.deviceSizes`; their union is every width `next/image` requests. */
export const IMAGE_SIZES = [256, 384, 512];
export const DEVICE_SIZES = [640, 828, 1080, 1280, 1600, 1920];
export const VARIANT_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];

/** AVIF first (≈20–30% smaller), WebP as the fallback for browsers without AVIF. */
export const VARIANT_FORMATS = ['avif', 'webp'] as const;
export type VariantFormat = (typeof VARIANT_FORMATS)[number];

/** Bump when encoding settings change so new renditions get new keys instead of overwriting. */
export const RENDITION_VERSION = 'v1';

export function variantPath(key: string, width: number, format: VariantFormat): string {
  return `${key}/w${width}.${format}`;
}

/**
 * Loader for one format. `next/image` only requests the configured widths, which are exactly the
 * generated ones; `quality` is fixed at generation time and ignored here.
 */
export function createVariantLoader(base: string, format: VariantFormat): ImageLoader {
  const origin = base.replace(/\/$/, '');
  return ({ src, width }) => `${origin}/${variantPath(src, width, format)}`;
}

/**
 * Validate the image env at build time and derive the proxy rewrite, if any.
 *
 * `NEXT_PUBLIC_IMAGE_CDN_URL` is the base the browser requests:
 * - unset: local mode, `public/photos` through the built-in optimizer.
 * - an absolute http(s) URL: variants load straight from that public host.
 * - a same-origin path such as `/img`: Vercel proxies it to `IMAGE_ORIGIN_URL`. That variable is
 *   server-only, so the bucket's real hostname never reaches the page, the client bundle, or this
 *   public repository.
 */
export function getImageProxy(
  base: string | undefined,
  origin: string | undefined
): { source: string; destination: string } | undefined {
  if (!base) return undefined;
  if (!base.startsWith('/') || base.startsWith('//')) {
    assertHttpUrl(base, 'NEXT_PUBLIC_IMAGE_CDN_URL');
    return undefined;
  }
  if (!origin) throw new Error('IMAGE_ORIGIN_URL is required when NEXT_PUBLIC_IMAGE_CDN_URL is a path');
  assertHttpUrl(origin, 'IMAGE_ORIGIN_URL');
  return { source: `${base.replace(/\/$/, '')}/:path*`, destination: `${origin.replace(/\/$/, '')}/:path*` };
}

/** `new URL` also rejects malformed and protocol-relative values. */
function assertHttpUrl(value: string, name: string): void {
  const { protocol } = new URL(value);
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error(`${name} must use http or https, received "${protocol}"`);
  }
}

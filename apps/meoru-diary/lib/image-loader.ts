import type { ImageLoaderProps } from 'next/image';

/**
 * `next/image` loader used only when `NEXT_PUBLIC_IMAGE_CDN_URL` is set (see `next.config.ts`).
 *
 * Builds a transform URL for an image CDN that resizes on the fly, so the Vercel optimizer (and
 * its per-image pricing) is bypassed entirely. The URL shape follows Cloudflare Image
 * Transformations, `/cdn-cgi/image/<options>/<source>`; adjust `buildCdnUrl` for another vendor.
 */
const CDN_BASE = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;
const DEFAULT_QUALITY = 75;

export function buildCdnUrl(base: string, { src, width, quality }: ImageLoaderProps): string {
  const origin = base.replace(/\/$/, '');
  const key = src.replace(/^\//, '');
  const options = [`width=${width}`, `quality=${quality ?? DEFAULT_QUALITY}`, 'format=auto', 'fit=scale-down'];
  return `${origin}/cdn-cgi/image/${options.join(',')}/${key}`;
}

export default function imageLoader(props: ImageLoaderProps): string {
  if (!CDN_BASE) {
    throw new Error('lib/image-loader.ts is registered but NEXT_PUBLIC_IMAGE_CDN_URL is not set');
  }
  return buildCdnUrl(CDN_BASE, props);
}

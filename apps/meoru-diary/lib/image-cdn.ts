import type { RemotePattern } from 'next/dist/shared/lib/image-config';

/**
 * Parse `NEXT_PUBLIC_IMAGE_CDN_URL` into a `remotePatterns` entry for `next.config.ts`.
 * Returns `undefined` when the CDN is not configured so local `/photos/*` files are used.
 */
export function getImageCdnRemotePattern(cdnUrl: string | undefined): RemotePattern | undefined {
  if (!cdnUrl) return undefined;

  const url = new URL(cdnUrl);
  const protocol = url.protocol.replace(':', '');
  if (protocol !== 'http' && protocol !== 'https') {
    throw new Error(`NEXT_PUBLIC_IMAGE_CDN_URL must use http or https, received "${url.protocol}"`);
  }

  return {
    protocol,
    hostname: url.hostname,
    ...(url.port ? { port: url.port } : {}),
    pathname: `${url.pathname.replace(/\/$/, '')}/**`,
  };
}

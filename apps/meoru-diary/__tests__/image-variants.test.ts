import { createVariantLoader, getImageProxy, variantPath } from '@/lib/image-variants';

describe('variantPath', () => {
  it('places every width and format under the content-addressed key', () => {
    expect(variantPath('0123456789abcdef/v1', 1080, 'avif')).toBe('0123456789abcdef/v1/w1080.avif');
    expect(variantPath('0123456789abcdef/v1', 256, 'webp')).toBe('0123456789abcdef/v1/w256.webp');
  });
});

describe('createVariantLoader', () => {
  it('maps a next/image request to a static variant URL and ignores quality', () => {
    const loader = createVariantLoader('https://img.example.com/', 'avif');
    expect(loader({ src: '0123456789abcdef/v1', width: 828, quality: 85 })).toBe(
      'https://img.example.com/0123456789abcdef/v1/w828.avif'
    );
  });

  it('builds same-origin URLs when the base is a proxied path', () => {
    const loader = createVariantLoader('/img/', 'avif');
    expect(loader({ src: 'abc/v1', width: 1080 })).toBe('/img/abc/v1/w1080.avif');
  });

  it('keeps a path on the base URL so the bucket can sit under a prefix', () => {
    const loader = createVariantLoader('https://img.example.com/meoru', 'webp');
    expect(loader({ src: 'abc/v1', width: 640 })).toBe('https://img.example.com/meoru/abc/v1/w640.webp');
  });
});

describe('getImageProxy', () => {
  it('needs no proxy in local mode or for a public image host', () => {
    expect(getImageProxy(undefined, undefined)).toBeUndefined();
    expect(getImageProxy('', 'https://origin.example.com')).toBeUndefined();
    expect(getImageProxy('https://img.example.com/', undefined)).toBeUndefined();
  });

  it('proxies a same-origin path to the server-only origin', () => {
    expect(getImageProxy('/img/', 'https://origin.example.com/')).toEqual({
      source: '/img/:path*',
      destination: 'https://origin.example.com/:path*',
    });
  });

  it('requires the origin when the base is a path', () => {
    expect(() => getImageProxy('/img', undefined)).toThrow(/IMAGE_ORIGIN_URL is required/);
  });

  it('rejects non-http, protocol-relative, and malformed URLs', () => {
    expect(() => getImageProxy('ftp://img.example.com', undefined)).toThrow(/http or https/);
    expect(() => getImageProxy('//img.example.com', undefined)).toThrow();
    expect(() => getImageProxy('img.example.com', undefined)).toThrow();
    expect(() => getImageProxy('/img', 'ftp://origin.example.com')).toThrow(/IMAGE_ORIGIN_URL must use http/);
  });
});

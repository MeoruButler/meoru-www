import { buildCdnUrl } from '@/lib/image-loader';

const props = { src: '/photos/01-spring/sample-01.jpg', width: 828, quality: 85 };

describe('buildCdnUrl', () => {
  it('builds a Cloudflare transform URL and tolerates a trailing slash on the base', () => {
    expect(buildCdnUrl('https://img.example.com/', props)).toBe(
      'https://img.example.com/cdn-cgi/image/width=828,quality=85,format=auto,fit=scale-down/photos/01-spring/sample-01.jpg'
    );
  });

  it('defaults quality to 75', () => {
    expect(buildCdnUrl('https://img.example.com', { src: '/a.jpg', width: 640 })).toContain('quality=75');
  });
});

describe('default loader', () => {
  const originalEnv = process.env.NEXT_PUBLIC_IMAGE_CDN_URL;

  afterEach(() => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = originalEnv;
  });

  it('uses the CDN base URL from the environment', () => {
    process.env.NEXT_PUBLIC_IMAGE_CDN_URL = 'https://img.example.com';
    jest.isolateModules(() => {
      const loader = jest.requireActual<typeof import('@/lib/image-loader')>('@/lib/image-loader').default;
      expect(loader(props)).toMatch(/^https:\/\/img\.example\.com\/cdn-cgi\/image\//);
    });
  });

  it('fails loudly when registered without a CDN base URL', () => {
    delete process.env.NEXT_PUBLIC_IMAGE_CDN_URL;
    jest.isolateModules(() => {
      const loader = jest.requireActual<typeof import('@/lib/image-loader')>('@/lib/image-loader').default;
      expect(() => loader(props)).toThrow(/NEXT_PUBLIC_IMAGE_CDN_URL/);
    });
  });
});

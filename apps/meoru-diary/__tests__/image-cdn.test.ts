import { getImageCdnRemotePattern } from '@/lib/image-cdn';

describe('getImageCdnRemotePattern', () => {
  it('returns undefined when the CDN is not configured', () => {
    expect(getImageCdnRemotePattern(undefined)).toBeUndefined();
    expect(getImageCdnRemotePattern('')).toBeUndefined();
  });

  it('derives protocol, host, and a wildcard path from the base URL', () => {
    expect(getImageCdnRemotePattern('https://img.example.com/photos/')).toEqual({
      protocol: 'https',
      hostname: 'img.example.com',
      pathname: '/photos/**',
    });
    expect(getImageCdnRemotePattern('http://localhost:8787')).toEqual({
      protocol: 'http',
      hostname: 'localhost',
      port: '8787',
      pathname: '/**',
    });
  });

  it('rejects non-http schemes', () => {
    expect(() => getImageCdnRemotePattern('ftp://img.example.com')).toThrow(/http or https/);
  });
});

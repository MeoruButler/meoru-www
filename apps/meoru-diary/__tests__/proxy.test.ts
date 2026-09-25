/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

import { LOCALE_COOKIE } from '@/lib/i18n/locales';
import { proxy } from '@/proxy';

function request(
  path: string,
  init: { acceptLanguage?: string; cookie?: string; headers?: Record<string, string> } = {}
) {
  const headers = new Headers(init.headers);
  if (init.acceptLanguage) headers.set('accept-language', init.acceptLanguage);
  if (init.cookie) headers.set('cookie', `${LOCALE_COOKIE}=${init.cookie}`);
  return new NextRequest(`https://diary.test${path}`, { headers });
}

describe('proxy', () => {
  it('redirects the root to the device language', () => {
    const response = proxy(request('/', { acceptLanguage: 'ko-KR,en;q=0.8' }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://diary.test/ko');
  });

  it('falls back to English and keeps the rest of the path', () => {
    const response = proxy(request('/somewhere?x=1', { acceptLanguage: 'fr' }));
    expect(response.headers.get('location')).toBe('https://diary.test/en/somewhere?x=1');
  });

  it('lets a remembered choice override the device language', () => {
    const response = proxy(request('/', { acceptLanguage: 'ko', cookie: 'ja' }));
    expect(response.headers.get('location')).toBe('https://diary.test/ja');
  });

  it('remembers a localized visit in the cookie', () => {
    const response = proxy(request('/zh', { cookie: 'en' }));
    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
    expect(response.cookies.get(LOCALE_COOKIE)?.value).toBe('zh');
  });

  const prefetchHeaders: Record<string, string>[] = [
    { 'next-router-prefetch': '1' },
    { purpose: 'prefetch' },
    { 'sec-purpose': 'prefetch;anonymous-client-ip' },
  ];

  it.each(prefetchHeaders)(
    'ignores prefetch requests (%o) so speculative loads cannot change the language',
    headers => {
      const response = proxy(request('/zh', { cookie: 'en', headers }));
      expect(response.status).toBe(200);
      expect(response.cookies.get(LOCALE_COOKIE)).toBeUndefined();
    }
  );

  it('does not rewrite the cookie when it already matches', () => {
    const response = proxy(request('/zh', { cookie: 'zh' }));
    expect(response.cookies.get(LOCALE_COOKIE)).toBeUndefined();
  });
});

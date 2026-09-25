import { NextResponse, type NextRequest } from 'next/server';

import { getLocaleFromPath, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, negotiateLocale } from '@/lib/i18n/locales';

/**
 * Locale routing. Every page lives under `/<locale>`; requests without a locale are redirected to
 * the remembered choice, else the device language, else English. Visiting a localized URL
 * directly (the language switcher is plain links) records that choice in a cookie.
 */
/** Prefetches are speculative; only a real navigation may change the remembered language. */
export function isPrefetch(request: NextRequest): boolean {
  return (
    request.headers.get('next-router-prefetch') === '1' ||
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose')?.includes('prefetch') === true
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const pathLocale = getLocaleFromPath(pathname);

  if (pathLocale) {
    const response = NextResponse.next();
    if (cookie !== pathLocale && !isPrefetch(request)) {
      response.cookies.set(LOCALE_COOKIE, pathLocale, {
        path: '/',
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: 'lax',
      });
    }
    return response;
  }

  const locale = negotiateLocale({ cookie, acceptLanguage: request.headers.get('accept-language') });
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, API routes, and any path that looks like a file (photos, icons).
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};

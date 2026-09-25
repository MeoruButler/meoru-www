export const LOCALES = ['en', 'ko', 'ja', 'zh'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
/** Cookie that remembers a manual language choice. */
export const LOCALE_COOKIE = 'meoru-locale';
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LOCALE_META: Record<Locale, { htmlLang: string; nativeName: string }> = {
  en: { htmlLang: 'en', nativeName: 'English' },
  ko: { htmlLang: 'ko', nativeName: '한국어' },
  ja: { htmlLang: 'ja', nativeName: '日本語' },
  zh: { htmlLang: 'zh-Hans', nativeName: '中文' },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Parse an `Accept-Language` header into language tags ordered by descending quality. */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];
  return header
    .split(',')
    .map((part, index) => {
      const [tag = '', ...params] = part.trim().split(';');
      const qParam = params.map(param => param.trim()).find(param => param.startsWith('q='));
      const quality = qParam ? Number.parseFloat(qParam.slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 0, index };
    })
    .filter(entry => entry.tag !== '' && entry.tag !== '*' && entry.quality > 0)
    .toSorted((a, b) => b.quality - a.quality || a.index - b.index)
    .map(entry => entry.tag);
}

/** Match the first tag whose primary subtag is a supported locale (`zh-CN` → `zh`). */
export function matchLocale(tags: readonly string[]): Locale | undefined {
  for (const tag of tags) {
    const primary = tag.toLowerCase().split('-')[0];
    if (isLocale(primary)) return primary;
  }
  return undefined;
}

/** Manual choice (cookie) wins over the device language, which wins over the default. */
export function negotiateLocale({
  cookie,
  acceptLanguage,
}: {
  cookie?: string | null;
  acceptLanguage?: string | null;
}): Locale {
  if (isLocale(cookie)) return cookie;
  return matchLocale(parseAcceptLanguage(acceptLanguage)) ?? DEFAULT_LOCALE;
}

/** `/ko/anything` → `ko`; `/` or `/photos/x.jpg` → `undefined`. */
export function getLocaleFromPath(pathname: string): Locale | undefined {
  const [, first] = pathname.split('/');
  return isLocale(first) ? first : undefined;
}

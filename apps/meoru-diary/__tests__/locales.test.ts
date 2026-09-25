import {
  DEFAULT_LOCALE,
  getLocaleFromPath,
  isLocale,
  matchLocale,
  negotiateLocale,
  parseAcceptLanguage,
} from '@/lib/i18n/locales';

describe('parseAcceptLanguage', () => {
  it('orders tags by quality and keeps header order for ties', () => {
    expect(parseAcceptLanguage('ja;q=0.5, ko-KR, en-US;q=0.8, zh;q=0')).toEqual(['ko-kr', 'en-us', 'ja']);
  });

  it('ignores wildcards, garbage, and empty headers', () => {
    expect(parseAcceptLanguage('*, en;q=abc, ,;q=1')).toEqual([]);
    expect(parseAcceptLanguage(null)).toEqual([]);
    expect(parseAcceptLanguage(undefined)).toEqual([]);
  });
});

describe('matchLocale', () => {
  it('matches on the primary subtag and skips unsupported languages', () => {
    expect(matchLocale(['de', 'zh-CN', 'en'])).toBe('zh');
    expect(matchLocale(['fr', 'de'])).toBeUndefined();
  });
});

describe('negotiateLocale', () => {
  it('prefers the cookie, then the header, then the default', () => {
    expect(negotiateLocale({ cookie: 'ja', acceptLanguage: 'ko' })).toBe('ja');
    expect(negotiateLocale({ cookie: 'xx', acceptLanguage: 'ko-KR,en;q=0.9' })).toBe('ko');
    expect(negotiateLocale({ cookie: undefined, acceptLanguage: 'fr' })).toBe(DEFAULT_LOCALE);
    expect(negotiateLocale({})).toBe('en');
  });
});

describe('getLocaleFromPath / isLocale', () => {
  it('reads the first path segment only when it is a supported locale', () => {
    expect(getLocaleFromPath('/ko')).toBe('ko');
    expect(getLocaleFromPath('/zh/anything/else')).toBe('zh');
    expect(getLocaleFromPath('/')).toBeUndefined();
    expect(getLocaleFromPath('/photos/x.jpg')).toBeUndefined();
    expect(isLocale(42)).toBe(false);
  });
});

export const SUPPORTED_LOCALES = ["en", "ko"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"
export const LOCALE_COOKIE_NAME = "locale"
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ko"
}

export function parseLocale(value: string | undefined): Locale | undefined {
  return isLocale(value) ? value : undefined
}

export function parseLocaleFromCookie(
  cookieValue: string | undefined,
): Locale | undefined {
  return parseLocale(cookieValue)
}

export function parseAcceptLanguage(
  header: string | undefined,
): Locale | undefined {
  if (!header) return undefined
  const candidates = header
    .split(",")
    .map((part) => part.replace(/;.*$/, "").trim().toLowerCase())
  for (const candidate of candidates) {
    const base = candidate.split("-")[0]
    if (isLocale(base)) return base
  }
  return undefined
}

export function resolveLocale(opts: {
  cookie?: string
  acceptLanguage?: string
}): Locale {
  return (
    parseLocaleFromCookie(opts.cookie) ??
    parseAcceptLanguage(opts.acceptLanguage) ??
    DEFAULT_LOCALE
  )
}

export function serializeLocaleCookie(locale: Locale): string {
  return `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax`
}

export function pickLocaleFromPathname(pathname: string): Locale {
  const first = pathname.split("/").filter(Boolean)[0]
  return isLocale(first) ? first : DEFAULT_LOCALE
}

export function swapLocaleInPath(
  pathname: string,
  nextLocale: Locale,
): string {
  const segments = pathname.split("/").filter(Boolean)
  if (segments.length === 0) return `/${nextLocale}`
  segments[0] = nextLocale
  return `/${segments.join("/")}`
}

export function parseLocaleFromCookieString(
  cookieString: string,
): Locale | undefined {
  const match = cookieString.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE_NAME}=([^;]+)`),
  )
  if (!match) return undefined
  try {
    return parseLocale(decodeURIComponent(match[1]))
  } catch {
    return undefined
  }
}

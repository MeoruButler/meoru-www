export const THEMES = ["light", "dark", "system"] as const
export type Theme = (typeof THEMES)[number]
export type ResolvedTheme = "light" | "dark"

export const DEFAULT_THEME: Theme = "system"
export const THEME_COOKIE_NAME = "theme"
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

export function parseTheme(value: string | undefined): Theme {
  return isTheme(value) ? value : DEFAULT_THEME
}

export function parseThemeFromCookie(cookieString: string): Theme {
  const match = cookieString.match(
    new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]+)`),
  )
  if (!match) return DEFAULT_THEME
  try {
    return parseTheme(decodeURIComponent(match[1]))
  } catch {
    return DEFAULT_THEME
  }
}

export function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): ResolvedTheme {
  if (theme === "system") return prefersDark ? "dark" : "light"
  return theme
}

export function serializeThemeCookie(theme: Theme): string {
  return `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`
}

export const themeInitScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${THEME_COOKIE_NAME}=([^;]+)/);var t=m?decodeURIComponent(m[1]):'system';var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`

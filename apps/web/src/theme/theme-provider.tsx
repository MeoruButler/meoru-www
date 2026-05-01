import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"
import {
  DEFAULT_THEME,
  parseThemeFromCookie,
  resolveTheme,
  serializeThemeCookie,
  type ResolvedTheme,
  type Theme,
} from "./theme-config"

export interface ThemeContextValue {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (next: Theme) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

interface ThemeProviderProps {
  children: React.ReactNode
}

function applyDocumentClass(resolved: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", resolved === "dark")
}

function subscribePrefersDark(onChange: () => void): () => void {
  const mql = window.matchMedia("(prefers-color-scheme: dark)")
  mql.addEventListener("change", onChange)
  return () => mql.removeEventListener("change", onChange)
}

function getPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function getServerPrefersDark(): boolean {
  return false
}

function readInitialTheme(): Theme {
  try {
    return parseThemeFromCookie(document.cookie)
  } catch {
    return DEFAULT_THEME
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme)
  const prefersDark = useSyncExternalStore(
    subscribePrefersDark,
    getPrefersDark,
    getServerPrefersDark,
  )

  useEffect(() => {
    applyDocumentClass(resolveTheme(theme, prefersDark))
  }, [theme, prefersDark])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.cookie = serializeThemeCookie(next)
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme: resolveTheme(theme, prefersDark),
      setTheme,
    }),
    [theme, prefersDark, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

import { createContext, useEffect, useMemo } from "react"
import {
  serializeLocaleCookie,
  type Locale,
} from "./config"
import { messages, type Messages } from "./messages"

export interface LocaleContextValue {
  locale: Locale
  messages: Messages
}

export const LocaleContext = createContext<LocaleContextValue | null>(null)

interface LocaleProviderProps {
  locale: Locale
  children: React.ReactNode
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  const value = useMemo<LocaleContextValue>(
    () => ({ locale, messages: messages[locale] }),
    [locale],
  )

  useEffect(() => {
    document.cookie = serializeLocaleCookie(locale)
  }, [locale])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

import { createServerFn } from "@tanstack/react-start"
import { getCookie, getRequestHeader } from "@tanstack/react-start/server"
import { LOCALE_COOKIE_NAME, resolveLocale, type Locale } from "./config"

export const resolveDefaultLocale = createServerFn({ method: "GET" }).handler(
  (): Locale =>
    resolveLocale({
      cookie: getCookie(LOCALE_COOKIE_NAME),
      acceptLanguage: getRequestHeader("accept-language"),
    })
)

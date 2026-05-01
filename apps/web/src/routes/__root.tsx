import {
  HeadContent,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/react"

import appCss from "@workspace/ui/globals.css?url"
import { ThemeProvider } from "@/theme/theme-provider"
import { themeInitScript } from "@/theme/theme-config"
import { pickLocaleFromPathname } from "@/i18n/config"

const SITE_TITLE = "Meoru Butler"
const SITE_DESCRIPTION = "Personal site of @Meoru_butler"
const OG_IMAGE = "/og.png"

export const head = () => ({
  meta: [
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { title: SITE_TITLE },
    { name: "description", content: SITE_DESCRIPTION },
    { property: "og:type", content: "website" },
    { property: "og:title", content: SITE_TITLE },
    { property: "og:description", content: SITE_DESCRIPTION },
    { property: "og:image", content: OG_IMAGE },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@Meoru_butler" },
    { name: "twitter:creator", content: "@Meoru_butler" },
    { name: "twitter:title", content: SITE_TITLE },
    { name: "twitter:description", content: SITE_DESCRIPTION },
    { name: "twitter:image", content: OG_IMAGE },
  ],
  links: [
    { rel: "stylesheet", href: appCss },
    { rel: "icon", href: "/favicon.ico" },
    { rel: "manifest", href: "/manifest.json" },
    { rel: "alternate", hrefLang: "en", href: "/en" },
    { rel: "alternate", hrefLang: "ko", href: "/ko" },
    { rel: "alternate", hrefLang: "x-default", href: "/en" },
  ],
})

export function NotFound() {
  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  )
}

export const Route = createRootRoute({
  head,
  notFoundComponent: NotFound,
  shellComponent: RootDocument,
})

export function RootDocument({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const lang = pickLocaleFromPathname(pathname)
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          {import.meta.env.DEV && (
            <TanStackRouterDevtools position="bottom-right" />
          )}
        </ThemeProvider>
        {import.meta.env.PROD && (
          <>
            <SpeedInsights />
            <Analytics />
          </>
        )}
        <Scripts />
      </body>
    </html>
  )
}

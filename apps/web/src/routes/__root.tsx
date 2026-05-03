import { Film } from "lucide-react"
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
import { CinephileEasterEggs } from "@/components/easter-eggs"
import { DirectorsCutProvider } from "@/lib/directors-cut-context"
import { ThemeProvider } from "@/theme/theme-provider"
import { themeInitScript } from "@/theme/theme-config"
import { pickLocaleFromPathname } from "@/i18n/config"
import { messages } from "@/i18n/messages"

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
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const locale = pickLocaleFromPathname(pathname)
  const t = messages[locale].notFound
  return (
    <main className="container mx-auto flex min-h-svh flex-col items-center justify-center gap-3 p-4 text-center">
      <Film className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-2xl font-semibold tracking-tight">{t.title}</h1>
      <p className="max-w-md text-base text-muted-foreground">
        {t.description}
      </p>
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
          <DirectorsCutProvider>
            {children}
            <CinephileEasterEggs />
          </DirectorsCutProvider>
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

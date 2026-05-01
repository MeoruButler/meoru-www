import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"

import appCss from "@workspace/ui/globals.css?url"
import { ThemeProvider } from "@/theme/theme-provider"
import { themeInitScript } from "@/theme/theme-config"

export const head = () => ({
  meta: [
    {
      charSet: "utf-8",
    },
    {
      name: "viewport",
      content: "width=device-width, initial-scale=1",
    },
    {
      title: "TanStack Start Starter",
    },
  ],
  links: [
    {
      rel: "stylesheet",
      href: appCss,
    },
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
  return (
    <html lang="en" suppressHydrationWarning>
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
        <Scripts />
      </body>
    </html>
  )
}

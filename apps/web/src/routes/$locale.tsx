import { Outlet, createFileRoute, notFound } from "@tanstack/react-router"
import { isLocale } from "@/i18n/config"
import { LocaleProvider } from "@/i18n/locale-provider"
import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"

export const Route = createFileRoute("/$locale")({
  beforeLoad: ({ params }) => {
    if (!isLocale(params.locale)) {
      throw notFound()
    }
    return { locale: params.locale }
  },
  component: LocaleLayout,
})

export function LocaleLayout() {
  const { locale } = Route.useRouteContext()
  return (
    <LocaleProvider locale={locale}>
      <div className="flex min-h-svh flex-col">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </div>
    </LocaleProvider>
  )
}

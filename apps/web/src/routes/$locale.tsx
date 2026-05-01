import { Outlet, createFileRoute, notFound } from "@tanstack/react-router"
import { isLocale } from "@/i18n/config"
import { LocaleProvider } from "@/i18n/locale-provider"

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
      <Outlet />
    </LocaleProvider>
  )
}

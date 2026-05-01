import { createFileRoute } from "@tanstack/react-router"
import { useT } from "@/i18n/use-locale"

export const Route = createFileRoute("/$locale/")({
  component: LocaleHome,
})

export function LocaleHome() {
  const t = useT()
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-medium">{t.hero.title}</h1>
      <p className="text-muted-foreground mt-2">{t.hero.subtitle}</p>
    </main>
  )
}

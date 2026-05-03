import { createFileRoute } from "@tanstack/react-router"
import { ArrowUpRight } from "lucide-react"
import { useT } from "@/i18n/use-locale"

export const Route = createFileRoute("/$locale/links")({
  component: LocaleLinks,
})

interface SocialLink {
  id: string
  href: string
  labelKey: "twitter"
}

const SOCIAL_LINKS: ReadonlyArray<SocialLink> = [
  { id: "twitter", href: "https://x.com/Meoru_butler", labelKey: "twitter" },
]

export function LocaleLinks() {
  const t = useT()
  return (
    <main className="container mx-auto px-4 py-10">
      <section className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t.linksPage.title}
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          {t.linksPage.description}
        </p>
      </section>
      <ul className="grid max-w-2xl gap-3">
        {SOCIAL_LINKS.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-3xl border px-5 py-4 text-base font-medium transition-colors hover:bg-muted"
            >
              <span>{t.linksPage[link.labelKey]}</span>
              <ArrowUpRight
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}

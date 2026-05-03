import { useT } from "@/i18n/use-locale"

export function Footer() {
  const t = useT()
  return (
    <footer className="mt-16 border-t">
      <div className="container mx-auto flex flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span>{t.footer.copyright}</span>
        <span className="font-mono text-xs tracking-wide text-muted-foreground/70">
          {t.footer.filmCredit}
        </span>
        <a
          href="https://x.com/Meoru_butler"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          {t.brand.handle}
        </a>
      </div>
    </footer>
  )
}

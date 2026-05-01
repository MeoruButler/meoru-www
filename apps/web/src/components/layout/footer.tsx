import { useT } from "@/i18n/use-locale"

export function Footer() {
  const t = useT()
  return (
    <footer className="border-t mt-16">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-6 text-sm text-muted-foreground">
        <span>{t.footer.copyright}</span>
        <a
          href="https://x.com/meorudayo"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground"
        >
          X / Twitter
        </a>
      </div>
    </footer>
  )
}

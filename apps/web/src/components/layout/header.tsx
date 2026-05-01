import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { Menu } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet"
import { cn } from "@workspace/ui/lib/utils"
import { useLocale, useT } from "@/i18n/use-locale"
import { LangSwitcher } from "./lang-switcher"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  const { locale } = useLocale()
  const t = useT()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { to: "/$locale" as const, label: t.nav.home },
    { to: "/$locale/links" as const, label: t.nav.links },
  ]

  return (
    <header className="bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/$locale"
          params={{ locale }}
          className="text-lg font-semibold"
        >
          {t.brand.name}
        </Link>

        <nav
          aria-label={t.nav.primaryNav}
          className="hidden items-center gap-2 md:flex"
        >
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              params={{ locale }}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
          <LangSwitcher />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <LangSwitcher />
          <ThemeToggle />
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              aria-label={t.nav.openMenu}
              className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{t.brand.name}</SheetTitle>
              </SheetHeader>
              <nav
                aria-label={t.nav.primaryNav}
                className="flex flex-col gap-4 px-6 pb-6"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    params={{ locale }}
                    onClick={() => setMobileOpen(false)}
                    className="text-foreground text-base"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

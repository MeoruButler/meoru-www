import { useRouter, useRouterState } from "@tanstack/react-router"
import { Languages } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import {
  SUPPORTED_LOCALES,
  swapLocaleInPath,
  type Locale,
} from "@/i18n/config"
import { useLocale, useT } from "@/i18n/use-locale"

export function LangSwitcher() {
  const router = useRouter()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { locale } = useLocale()
  const t = useT()

  function switchTo(next: Locale) {
    if (next === locale) return
    router.navigate({ to: swapLocaleInPath(pathname, next) })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.langSwitcher.label}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <Languages className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LOCALES.map((option) => (
          <DropdownMenuItem
            key={option}
            data-active={option === locale ? "" : undefined}
            onClick={() => switchTo(option)}
          >
            {t.langSwitcher[option]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

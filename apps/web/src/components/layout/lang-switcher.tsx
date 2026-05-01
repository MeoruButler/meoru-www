import { useRouter, useRouterState } from "@tanstack/react-router"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
        <span
          aria-hidden="true"
          className="text-xs font-semibold tracking-wider uppercase"
        >
          {locale}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => switchTo(value as Locale)}
        >
          {SUPPORTED_LOCALES.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {t.langSwitcher[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

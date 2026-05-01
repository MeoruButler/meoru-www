import { Monitor, Moon, Sun } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { useT } from "@/i18n/use-locale"
import { useTheme } from "@/theme/use-theme"
import { THEMES, type Theme } from "@/theme/theme-config"

const TRIGGER_ICON: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const t = useT()
  const TriggerIcon = TRIGGER_ICON[theme]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.themeToggle.label}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <TriggerIcon className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={theme}
          onValueChange={(value) => setTheme(value as Theme)}
        >
          {THEMES.map((option) => {
            const OptionIcon = TRIGGER_ICON[option]
            return (
              <DropdownMenuRadioItem key={option} value={option}>
                <OptionIcon className="me-2 h-4 w-4" aria-hidden="true" />
                {t.themeToggle[option]}
              </DropdownMenuRadioItem>
            )
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

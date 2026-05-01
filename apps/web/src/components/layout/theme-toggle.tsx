import { Monitor, Moon, Sun } from "lucide-react"
import { buttonVariants } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"
import { useT } from "@/i18n/use-locale"
import { useTheme } from "@/theme/use-theme"
import { THEMES, type Theme } from "@/theme/theme-config"

const ICON: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const t = useT()
  const TriggerIcon = resolvedTheme === "dark" ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t.themeToggle.label}
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
      >
        <TriggerIcon className="h-4 w-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((option) => {
          const Icon = ICON[option]
          return (
            <DropdownMenuItem
              key={option}
              data-active={option === theme ? "" : undefined}
              onClick={() => setTheme(option)}
            >
              <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
              {t.themeToggle[option]}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { createFileRoute, redirect } from "@tanstack/react-router"
import { resolveDefaultLocale } from "@/i18n/locale.server"

export async function indexBeforeLoad(): Promise<never> {
  const locale = await resolveDefaultLocale()
  throw redirect({
    to: "/$locale",
    params: { locale },
  })
}

export const Route = createFileRoute("/")({ beforeLoad: indexBeforeLoad })

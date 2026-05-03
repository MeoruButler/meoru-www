import { createFileRoute } from "@tanstack/react-router"
import { LightroomShell } from "@/components/photo/lightroom-shell"

export const Route = createFileRoute("/$locale/")({
  component: LocaleHome,
})

export function LocaleHome() {
  return (
    <main>
      <LightroomShell />
    </main>
  )
}

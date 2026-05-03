import { useEffect } from "react"
import { useDirectorsCutState } from "@/lib/directors-cut-context"
import { logCinephileQuote } from "@/lib/easter-eggs"

const GRAIN_SVG =
  "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.55'/%3E%3C/svg%3E"

export function CinephileEasterEggs() {
  const directorsCut = useDirectorsCutState()

  useEffect(() => {
    logCinephileQuote()
  }, [])

  if (!directorsCut) return null

  return (
    <div
      aria-hidden="true"
      data-testid="directors-cut-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,${GRAIN_SVG}")`,
        backgroundSize: "200px 200px",
        opacity: 0.18,
        mixBlendMode: "overlay",
      }}
    />
  )
}

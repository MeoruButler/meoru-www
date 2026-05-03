import { useEffect, useRef, useState } from "react"

const KONAMI_CODE: ReadonlyArray<string> = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
]

export function logCinephileQuote(): void {
  console.log(
    "%c🎬 Meoru Butler%c — \"Cinema is a matter of what's in the frame and what's out.\"\n%c— Martin Scorsese",
    "color:#e5e7eb;font-weight:700",
    "color:#9ca3af;font-style:italic",
    "color:#6b7280"
  )
}

export function useKonamiCode(onTrigger: () => void): void {
  const triggerRef = useRef(onTrigger)
  triggerRef.current = onTrigger

  useEffect(() => {
    let buffer: string[] = []
    const handler = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      buffer = [...buffer, key].slice(-KONAMI_CODE.length)
      if (
        buffer.length === KONAMI_CODE.length &&
        buffer.every((k, i) => k === KONAMI_CODE[i])
      ) {
        triggerRef.current()
        buffer = []
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
}

export function useDirectorsCut(): boolean {
  const [active, setActive] = useState(false)
  useKonamiCode(() => setActive((prev) => !prev))
  return active
}

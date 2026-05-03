import { useEffect, useState } from "react"
import { Map, Marker } from "pigeon-maps"

type LocationMapProps = {
  lat: number
  lng: number
  zoom?: number
  height?: number
  ariaLabel: string
}

export function LocationMap({
  lat,
  lng,
  zoom = 13,
  height = 140,
  ariaLabel,
}: LocationMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? (
    <div
      role="img"
      aria-label={ariaLabel}
      className="overflow-hidden rounded border border-border/60"
    >
      <Map
        defaultCenter={[lat, lng]}
        defaultZoom={zoom}
        mouseEvents={false}
        touchEvents={false}
        height={height}
        attributionPrefix={false}
      >
        <Marker anchor={[lat, lng]} width={28} color="#ef4444" />
      </Map>
    </div>
  ) : (
    <div
      role="img"
      aria-label={ariaLabel}
      className="h-[var(--mini-map-h)] animate-pulse rounded bg-muted"
      style={{ ["--mini-map-h" as string]: `${height}px` }}
    />
  )
}

export default LocationMap

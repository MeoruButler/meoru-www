import { lazy, Suspense } from "react"
import { Aperture, Camera, Compass, Gauge, MapPin, Timer } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { Photo } from "@/data/photos"
import type { Messages } from "@/i18n/messages/en"

const LocationMap = lazy(() => import("./location-map"))

type ExifContentProps = {
  photo: Photo
  labels: Messages["gallery"]["exif"]
  locale: "en" | "ko"
  className?: string
}

export function ExifContent({
  photo,
  labels,
  locale,
  className,
}: ExifContentProps) {
  const locationName = photo.location?.name
    ? photo.location.name[locale] ||
      photo.location.name.ko ||
      photo.location.name.en
    : undefined
  const hasGps =
    photo.location &&
    typeof photo.location.lat === "number" &&
    typeof photo.location.lng === "number"

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h3 className="text-xs font-medium tracking-[0.16em] uppercase">
        {labels.title}
      </h3>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-sm text-foreground/90">
        <ExifRow
          icon={Camera}
          label={labels.camera}
          value={photo.exif.camera}
        />
        <ExifRow icon={Compass} label={labels.lens} value={photo.exif.lens} />
        <ExifRow
          icon={Compass}
          label={labels.focalLength}
          value={photo.exif.focalLength}
        />
        <ExifRow
          icon={Aperture}
          label={labels.aperture}
          value={photo.exif.aperture}
        />
        <ExifRow
          icon={Timer}
          label={labels.shutter}
          value={photo.exif.shutter}
        />
        <ExifRow
          icon={Gauge}
          label={labels.iso}
          value={String(photo.exif.iso)}
        />
      </dl>
      {photo.location ? (
        <div className="flex flex-col gap-2 border-t border-border/40 pt-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                {labels.location}
              </p>
              {locationName ? (
                <p className="mt-0.5 text-foreground">{locationName}</p>
              ) : null}
            </div>
          </div>
          {hasGps ? (
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="h-[120px] animate-pulse rounded bg-muted"
                />
              }
            >
              <LocationMap
                lat={photo.location.lat as number}
                lng={photo.location.lng as number}
                height={120}
                ariaLabel={`${labels.location}: ${locationName ?? ""}`}
              />
            </Suspense>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

type ExifRowProps = {
  icon: LucideIcon
  label: string
  value: string
}

function ExifRow({ icon: Icon, label, value }: ExifRowProps) {
  return (
    <>
      <dt className="inline-flex items-center gap-1.5 text-[10px] tracking-wide text-muted-foreground uppercase">
        <Icon className="h-3 w-3" aria-hidden="true" />
        {label}
      </dt>
      <dd className="font-mono text-xs tabular-nums">{value}</dd>
    </>
  )
}

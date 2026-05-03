import { Calendar, MapPin, Sparkles } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import type { Photo } from "@/data/photos"

type PhotoOfTheDayBannerProps = {
  photo: Photo
  isToday: boolean
  todayLabel: string
  locale: string
}

export function PhotoOfTheDayBanner({
  photo,
  isToday,
  todayLabel,
  locale,
}: PhotoOfTheDayBannerProps) {
  const formattedDate = new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(photo.takenAt))

  return (
    <div
      data-testid="photo-meta-banner"
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs tracking-[0.12em] text-muted-foreground uppercase",
        isToday && "text-foreground"
      )}
    >
      {isToday ? (
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span className="font-medium">
        {isToday ? todayLabel : photo.collection}
      </span>
      <span aria-hidden="true">·</span>
      <span>{formattedDate}</span>
      {photo.location?.name ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {photo.location.name[locale === "ko" ? "ko" : "en"] ||
              photo.location.name.ko ||
              photo.location.name.en}
          </span>
        </>
      ) : null}
    </div>
  )
}

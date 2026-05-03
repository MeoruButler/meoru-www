import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import type { Photo } from "@/data/photos"

type FilmstripProps = {
  photos: ReadonlyArray<Photo>
  selectedId: string
  onSelect: (id: string) => void
  label: string
  className?: string
}

export function Filmstrip({
  photos,
  selectedId,
  onSelect,
  label,
  className,
}: FilmstripProps) {
  return (
    <section aria-label={label} className={className}>
      <ScrollArea>
        <ul className="flex snap-x snap-mandatory gap-1.5 pb-2">
          {photos.map((photo) => (
            <li key={photo.id} className="shrink-0 snap-start">
              <button
                type="button"
                onClick={() => onSelect(photo.id)}
                aria-current={selectedId === photo.id}
                aria-label={photo.alt}
                className={cn(
                  "block aspect-[3/2] w-24 overflow-hidden rounded-sm border-2 transition-opacity sm:w-28",
                  selectedId === photo.id
                    ? "border-foreground opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img
                  src={photo.thumb ?? photo.src}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </section>
  )
}

import { useState } from "react"
import { Contrast, Info } from "lucide-react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"
import type { Photo } from "@/data/photos"
import type { Messages } from "@/i18n/messages/en"
import { ExifContent } from "./exif-content"

type PhotoViewerProps = {
  photo: Photo
  className?: string
  developFilter?: string
  exifLabels: Messages["gallery"]["exif"]
  toggleGrayscaleLabel: string
  toggleMetadataLabel: string
  locale: "en" | "ko"
}

export function PhotoViewer({
  photo,
  className,
  developFilter,
  exifLabels,
  toggleGrayscaleLabel,
  toggleMetadataLabel,
  locale,
}: PhotoViewerProps) {
  const [grayscale, setGrayscale] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const filter = [grayscale ? "grayscale(1)" : null, developFilter]
    .filter(Boolean)
    .join(" ")

  return (
    <figure
      className={cn(
        "relative aspect-[3/2] w-full overflow-hidden rounded-md bg-card select-none",
        className
      )}
      data-testid="photo-viewer"
    >
      <img
        src={photo.medium ?? photo.src}
        srcSet={
          photo.medium && photo.medium !== photo.src
            ? `${photo.medium} 1600w, ${photo.src} 3000w`
            : undefined
        }
        sizes="(min-width: 1024px) 70vw, 100vw"
        alt={photo.alt}
        draggable={false}
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-contain transition-[filter] duration-200 ease-out"
        style={{ filter: filter || undefined }}
      />
      {showInfo ? (
        <div
          data-testid="metadata-overlay"
          onClick={() => setShowInfo(false)}
          className="absolute inset-0 z-0 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm"
        >
          <ScrollArea
            onClick={(event) => event.stopPropagation()}
            className="h-full w-full max-w-sm overflow-hidden rounded-md border border-white/15 bg-card/90 text-foreground"
          >
            <div className="p-3">
              <ExifContent photo={photo} labels={exifLabels} locale={locale} />
            </div>
          </ScrollArea>
        </div>
      ) : null}
      {photo.caption && !showInfo ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 py-3 text-sm text-white">
          {photo.caption}
        </figcaption>
      ) : null}
      <div className="absolute top-2.5 right-2.5 z-10 flex gap-1.5">
        <ToolButton
          label={toggleGrayscaleLabel}
          isActive={grayscale}
          onClick={() => setGrayscale((prev) => !prev)}
        >
          <Contrast className="h-3.5 w-3.5" aria-hidden="true" />
        </ToolButton>
        <ToolButton
          label={toggleMetadataLabel}
          isActive={showInfo}
          onClick={() => setShowInfo((prev) => !prev)}
        >
          <Info className="h-3.5 w-3.5" aria-hidden="true" />
        </ToolButton>
      </div>
    </figure>
  )
}

type ToolButtonProps = {
  label: string
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolButton({ label, isActive, onClick, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onClick={onClick}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-full backdrop-blur transition-colors",
        isActive
          ? "bg-white text-black"
          : "bg-black/55 text-white hover:bg-black/70"
      )}
    >
      {children}
    </button>
  )
}

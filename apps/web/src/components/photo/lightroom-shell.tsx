import { useEffect, useMemo, useState } from "react"
import { photos } from "@/data/photos"
import { useLocale, useT } from "@/i18n/use-locale"
import { useDirectorsCutState } from "@/lib/directors-cut-context"
import { getPhotoOfTheDay } from "@/lib/photo-of-the-day"
import { CollectionSidebar } from "./collection-sidebar"
import {
  buildDevelopFilter,
  DevelopSliders,
  NEUTRAL_DEVELOP,
  type DevelopValues,
} from "./develop-sliders"
import { Filmstrip } from "./filmstrip"
import { PhotoOfTheDayBanner } from "./photo-of-the-day-banner"
import { PhotoViewer } from "./photo-viewer"

export function LightroomShell() {
  const t = useT()
  const { locale } = useLocale()
  const directorsCut = useDirectorsCutState()
  const [activeCollection, setActiveCollection] = useState<string | null>(null)
  const [potdId, setPotdId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>(photos[0].id)
  const [develop, setDevelop] = useState<DevelopValues>(NEUTRAL_DEVELOP)

  const sourcePhotos = useMemo(
    () => (directorsCut ? photos : photos.filter((p) => !p.hidden)),
    [directorsCut]
  )
  const sourceCollections = useMemo(
    () => Array.from(new Set(sourcePhotos.map((p) => p.collection))),
    [sourcePhotos]
  )

  useEffect(() => {
    const today = getPhotoOfTheDay(sourcePhotos)
    setPotdId(today.id)
    setSelectedId(today.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (
      activeCollection !== null &&
      !sourceCollections.includes(activeCollection)
    ) {
      setActiveCollection(null)
    }
  }, [activeCollection, sourceCollections])

  const visiblePhotos = useMemo(
    () =>
      activeCollection === null
        ? sourcePhotos
        : sourcePhotos.filter((p) => p.collection === activeCollection),
    [sourcePhotos, activeCollection]
  )

  useEffect(() => {
    if (
      visiblePhotos.length > 0 &&
      !visiblePhotos.some((p) => p.id === selectedId)
    ) {
      setSelectedId(visiblePhotos[0].id)
    }
  }, [visiblePhotos, selectedId])

  const selected =
    visiblePhotos.find((p) => p.id === selectedId) ??
    visiblePhotos[0] ??
    sourcePhotos[0]

  const developFilter = buildDevelopFilter(develop)

  return (
    <div className="container mx-auto px-3 py-3 lg:px-4 lg:py-4">
      <h1 className="sr-only">{t.gallery.heading}</h1>
      {directorsCut ? (
        <p
          data-testid="directors-cut-banner"
          className="mb-2 text-[10px] font-medium tracking-[0.18em] text-foreground/80 uppercase"
        >
          ✦ {t.gallery.directorsCutHint}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[180px_1fr] lg:gap-4">
        <CollectionSidebar
          collections={sourceCollections}
          active={activeCollection}
          onChange={setActiveCollection}
          label={t.gallery.collections}
          allLabel={t.gallery.all}
        />
        <div className="flex min-w-0 flex-col gap-3">
          <PhotoOfTheDayBanner
            photo={selected}
            isToday={potdId !== null && selected.id === potdId}
            todayLabel={t.gallery.todayPhoto}
            locale={locale}
          />
          <PhotoViewer
            photo={selected}
            developFilter={developFilter}
            exifLabels={t.gallery.exif}
            toggleGrayscaleLabel={t.gallery.toggleGrayscale}
            toggleMetadataLabel={t.gallery.toggleMetadata}
            locale={locale === "ko" ? "ko" : "en"}
          />
          <DevelopSliders
            value={develop}
            onChange={setDevelop}
            labels={t.gallery.develop}
          />
          <Filmstrip
            photos={visiblePhotos}
            selectedId={selected.id}
            onSelect={setSelectedId}
            label={t.gallery.filmstrip}
          />
        </div>
      </div>
    </div>
  )
}

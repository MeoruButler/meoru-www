import type { Photo } from "@/data/photos"

export function getPhotoOfTheDay(
  photos: ReadonlyArray<Photo>,
  date: Date = new Date()
): Photo {
  const seed = Number(
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`
  )
  return photos[seed % photos.length]
}

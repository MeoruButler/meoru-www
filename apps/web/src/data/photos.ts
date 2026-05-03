import { photos } from "./photos.generated"
import type { Photo } from "./photo-types"

export type { Photo, PhotoEntry, PhotoExif, PhotoLocation } from "./photo-types"
export { photos } from "./photos.generated"

export const collections: ReadonlyArray<string> = Array.from(
  new Set(photos.map((p) => p.collection))
)

export function findPhotoById(id: string): Photo | undefined {
  return photos.find((p) => p.id === id)
}

export function photosByCollection(collection: string): ReadonlyArray<Photo> {
  return photos.filter((p) => p.collection === collection)
}

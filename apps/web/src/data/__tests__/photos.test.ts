import { describe, it, expect } from "vitest"
import {
  collections,
  findPhotoById,
  photos,
  photosByCollection,
} from "../photos"

describe("data/photos", () => {
  it("exposes a non-empty seed array", () => {
    expect(photos.length).toBeGreaterThan(0)
  })

  it("requires a unique id per photo", () => {
    const ids = photos.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("derives collections from the seed", () => {
    expect(collections.length).toBeGreaterThan(0)
    for (const collection of collections) {
      expect(typeof collection).toBe("string")
      expect(collection.length).toBeGreaterThan(0)
    }
  })

  it("findPhotoById returns the matching photo", () => {
    const target = photos[0]
    expect(findPhotoById(target.id)).toBe(target)
  })

  it("findPhotoById returns undefined for unknown ids", () => {
    expect(findPhotoById("does-not-exist")).toBeUndefined()
  })

  it("photosByCollection filters by collection name", () => {
    const target = collections[0]
    const result = photosByCollection(target)
    expect(result.length).toBeGreaterThan(0)
    for (const photo of result) {
      expect(photo.collection).toBe(target)
    }
  })

  it("photosByCollection returns an empty list for unknown collections", () => {
    expect(photosByCollection("__missing__")).toEqual([])
  })
})

import { describe, it, expect } from "vitest"
import type { Photo } from "@/data/photos"
import { getPhotoOfTheDay } from "../photo-of-the-day"

const exif = {
  camera: "Sony A7 IV",
  lens: "50mm",
  focalLength: "50mm",
  aperture: "f/1.8",
  shutter: "1/200s",
  iso: 800,
}

const fixture: ReadonlyArray<Photo> = [
  {
    id: "a",
    src: "/a.jpg",
    alt: "a",
    collection: "X",
    takenAt: "2025-01-01",
    exif,
  },
  {
    id: "b",
    src: "/b.jpg",
    alt: "b",
    collection: "X",
    takenAt: "2025-02-01",
    exif,
  },
  {
    id: "c",
    src: "/c.jpg",
    alt: "c",
    collection: "X",
    takenAt: "2025-03-01",
    exif,
  },
]

describe("getPhotoOfTheDay", () => {
  it("returns the same photo for the same date", () => {
    const date = new Date(2026, 4, 3)
    expect(getPhotoOfTheDay(fixture, date).id).toBe(
      getPhotoOfTheDay(fixture, date).id
    )
  })

  it("varies the picked photo across days", () => {
    const day1 = getPhotoOfTheDay(fixture, new Date(2026, 4, 3))
    const day2 = getPhotoOfTheDay(fixture, new Date(2026, 4, 4))
    const day3 = getPhotoOfTheDay(fixture, new Date(2026, 4, 5))
    expect(new Set([day1.id, day2.id, day3.id]).size).toBeGreaterThan(1)
  })

  it("falls back to a default Date when none is provided", () => {
    const result = getPhotoOfTheDay(fixture)
    expect(fixture.map((p) => p.id)).toContain(result.id)
  })
})

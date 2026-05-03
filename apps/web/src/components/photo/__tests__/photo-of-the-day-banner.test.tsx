import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import type { Photo } from "@/data/photos"
import { PhotoOfTheDayBanner } from "../photo-of-the-day-banner"

const basePhoto: Photo = {
  id: "fixture",
  src: "https://example.com/photo.jpg",
  alt: "fixture alt",
  collection: "Demo Collection",
  takenAt: "2025-11-09",
  exif: {
    camera: "Sony A7 IV",
    lens: "50mm",
    focalLength: "50mm",
    aperture: "f/1.8",
    shutter: "1/200s",
    iso: 800,
  },
  location: {
    name: { en: "Olympic Hall, Seoul", ko: "올림픽홀, 서울" },
    lat: 37.52,
    lng: 127.12,
  },
}

describe("PhotoOfTheDayBanner", () => {
  it("shows the today label when isToday is true", () => {
    render(
      <PhotoOfTheDayBanner
        photo={basePhoto}
        isToday
        todayLabel="Photo of the day"
        locale="en"
      />
    )
    expect(screen.getByText("Photo of the day")).toBeInTheDocument()
  })

  it("falls back to the collection name when isToday is false", () => {
    render(
      <PhotoOfTheDayBanner
        photo={basePhoto}
        isToday={false}
        todayLabel="Photo of the day"
        locale="en"
      />
    )
    expect(screen.getByText("Demo Collection")).toBeInTheDocument()
    expect(screen.queryByText("Photo of the day")).not.toBeInTheDocument()
  })

  it("renders the location name when present", () => {
    render(
      <PhotoOfTheDayBanner
        photo={basePhoto}
        isToday={false}
        todayLabel="Today"
        locale="en"
      />
    )
    expect(screen.getByText("Olympic Hall, Seoul")).toBeInTheDocument()
  })

  it("omits the location segment when no location is provided", () => {
    const { container } = render(
      <PhotoOfTheDayBanner
        photo={{ ...basePhoto, location: undefined }}
        isToday={false}
        todayLabel="Today"
        locale="en"
      />
    )
    expect(container.textContent).not.toContain("Olympic Hall")
  })

  it("renders the Korean location name when locale is ko", () => {
    render(
      <PhotoOfTheDayBanner
        photo={basePhoto}
        isToday={false}
        todayLabel="오늘"
        locale="ko"
      />
    )
    expect(screen.getByText("올림픽홀, 서울")).toBeInTheDocument()
  })

  it("falls back across the bilingual name when one side is empty", () => {
    render(
      <PhotoOfTheDayBanner
        photo={{
          ...basePhoto,
          location: {
            name: { en: "", ko: "" },
            lat: 37.52,
            lng: 127.12,
          },
        }}
        isToday={false}
        todayLabel="Today"
        locale="en"
      />
    )
    expect(screen.queryByText("Olympic Hall, Seoul")).not.toBeInTheDocument()
  })
})

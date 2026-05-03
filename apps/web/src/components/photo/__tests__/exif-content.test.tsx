import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import type { Photo } from "@/data/photos"
import { messages } from "@/i18n/messages"
import { ExifContent } from "../exif-content"

const labels = messages.en.gallery.exif

const basePhoto: Photo = {
  id: "fixture",
  src: "https://example.com/photo.jpg",
  alt: "fixture",
  collection: "Demo",
  takenAt: "2025-11-09",
  exif: {
    camera: "Sony A7 IV",
    lens: "FE 70-200 GM II",
    focalLength: "135mm",
    aperture: "f/2.8",
    shutter: "1/500s",
    iso: 3200,
  },
  location: {
    name: { en: "Seoul, South Korea", ko: "서울특별시, 대한민국" },
    lat: 37.52,
    lng: 127.12,
  },
}

describe("ExifContent", () => {
  it("renders every EXIF row including the ISO value", () => {
    render(<ExifContent photo={basePhoto} labels={labels} locale="en" />)
    expect(screen.getByText("Sony A7 IV")).toBeInTheDocument()
    expect(screen.getByText("FE 70-200 GM II")).toBeInTheDocument()
    expect(screen.getByText("135mm")).toBeInTheDocument()
    expect(screen.getByText("f/2.8")).toBeInTheDocument()
    expect(screen.getByText("1/500s")).toBeInTheDocument()
    expect(screen.getByText("3200")).toBeInTheDocument()
  })

  it("renders the English location name when locale is en", () => {
    render(<ExifContent photo={basePhoto} labels={labels} locale="en" />)
    expect(screen.getByText("Seoul, South Korea")).toBeInTheDocument()
  })

  it("renders the Korean location name when locale is ko", () => {
    render(
      <ExifContent
        photo={basePhoto}
        labels={messages.ko.gallery.exif}
        locale="ko"
      />
    )
    expect(screen.getByText("서울특별시, 대한민국")).toBeInTheDocument()
  })

  it("renders only the location text when no GPS is available", () => {
    render(
      <ExifContent
        photo={{
          ...basePhoto,
          location: {
            name: { en: "Seoul, South Korea", ko: "서울특별시, 대한민국" },
          },
        }}
        labels={labels}
        locale="en"
      />
    )
    expect(screen.getByText("Seoul, South Korea")).toBeInTheDocument()
    expect(screen.getByText(labels.location)).toBeInTheDocument()
  })

  it("hides the location section when no location is provided", () => {
    render(
      <ExifContent
        photo={{ ...basePhoto, location: undefined }}
        labels={labels}
        locale="en"
      />
    )
    expect(screen.queryByText(labels.location)).not.toBeInTheDocument()
  })

  it("falls back to the Korean side when the English name is empty", () => {
    render(
      <ExifContent
        photo={{
          ...basePhoto,
          location: { name: { en: "", ko: "서울" }, lat: 37.52, lng: 127.12 },
        }}
        labels={labels}
        locale="en"
      />
    )
    expect(screen.getByText("서울")).toBeInTheDocument()
  })

  it("falls back to the English side when the Korean name is empty", () => {
    render(
      <ExifContent
        photo={{
          ...basePhoto,
          location: { name: { en: "Seoul", ko: "" }, lat: 37.52, lng: 127.12 },
        }}
        labels={messages.ko.gallery.exif}
        locale="ko"
      />
    )
    expect(screen.getByText("Seoul")).toBeInTheDocument()
  })

  it("keeps the location label visible when only GPS is available", () => {
    const { container } = render(
      <ExifContent
        photo={{
          ...basePhoto,
          location: { lat: 37.52, lng: 127.12 },
        }}
        labels={labels}
        locale="en"
      />
    )
    expect(screen.getByText(labels.location)).toBeInTheDocument()
    expect(container.querySelector("p.text-foreground")).toBeNull()
  })
})

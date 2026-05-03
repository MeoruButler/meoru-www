import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Photo } from "@/data/photos"
import { messages } from "@/i18n/messages"
import { PhotoViewer } from "../photo-viewer"

const exifLabels = messages.en.gallery.exif

const basePhoto: Photo = {
  id: "fixture",
  src: "https://example.com/photo.jpg",
  alt: "fixture alt",
  collection: "Fixtures",
  takenAt: "2025-01-01",
  caption: "fixture caption",
  exif: {
    camera: "Sony A7 IV",
    lens: "50mm",
    focalLength: "50mm",
    aperture: "f/1.8",
    shutter: "1/200s",
    iso: 800,
  },
}

function renderViewer(photo: Photo = basePhoto, developFilter?: string) {
  return render(
    <PhotoViewer
      photo={photo}
      developFilter={developFilter}
      exifLabels={exifLabels}
      toggleGrayscaleLabel="Toggle B&W"
      toggleMetadataLabel="Toggle metadata"
      locale="en"
    />
  )
}

describe("PhotoViewer", () => {
  it("renders the image with the photo src and alt", () => {
    renderViewer()
    const img = screen.getByRole("img", { name: "fixture alt" })
    expect(img).toHaveAttribute("src", basePhoto.src)
  })

  it("renders the caption when one is provided", () => {
    renderViewer()
    expect(screen.getByText("fixture caption")).toBeInTheDocument()
  })

  it("omits the caption when none is provided", () => {
    const { container } = renderViewer({ ...basePhoto, caption: undefined })
    expect(container.querySelector("figcaption")).toBeNull()
  })

  it("applies grayscale to the photo when the B&W toggle is pressed", async () => {
    const user = userEvent.setup()
    renderViewer()
    const img = screen.getByRole("img", { name: "fixture alt" })
    expect((img as HTMLImageElement).style.filter).toBe("")
    await user.click(screen.getByRole("button", { name: "Toggle B&W" }))
    expect((img as HTMLImageElement).style.filter).toContain("grayscale(1)")
  })

  it("combines the develop filter with grayscale when both are active", async () => {
    const user = userEvent.setup()
    renderViewer(basePhoto, "brightness(1.2) saturate(0.8) contrast(1.1)")
    const img = screen.getByRole("img", { name: "fixture alt" })
    expect((img as HTMLImageElement).style.filter).toBe(
      "brightness(1.2) saturate(0.8) contrast(1.1)"
    )
    await user.click(screen.getByRole("button", { name: "Toggle B&W" }))
    expect((img as HTMLImageElement).style.filter).toBe(
      "grayscale(1) brightness(1.2) saturate(0.8) contrast(1.1)"
    )
  })

  it("opens the metadata overlay when the info toggle is pressed", async () => {
    const user = userEvent.setup()
    renderViewer()
    expect(screen.queryByTestId("metadata-overlay")).toBeNull()
    await user.click(screen.getByRole("button", { name: "Toggle metadata" }))
    expect(screen.getByTestId("metadata-overlay")).toBeInTheDocument()
    expect(screen.getByText("Sony A7 IV")).toBeInTheDocument()
  })

  it("hides the caption while the metadata overlay is open", async () => {
    const user = userEvent.setup()
    renderViewer()
    expect(screen.getByText("fixture caption")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Toggle metadata" }))
    expect(screen.queryByText("fixture caption")).not.toBeInTheDocument()
  })

  it("dismisses the metadata overlay when the backdrop is clicked", async () => {
    const user = userEvent.setup()
    renderViewer()
    await user.click(screen.getByRole("button", { name: "Toggle metadata" }))
    const overlay = screen.getByTestId("metadata-overlay")
    await user.click(overlay)
    expect(screen.queryByTestId("metadata-overlay")).toBeNull()
  })

  it("keeps the metadata overlay open when its content is clicked", async () => {
    const user = userEvent.setup()
    renderViewer()
    await user.click(screen.getByRole("button", { name: "Toggle metadata" }))
    await user.click(screen.getByText("Sony A7 IV"))
    expect(screen.getByTestId("metadata-overlay")).toBeInTheDocument()
  })

  it("closes the overlay when the info toggle is pressed a second time", async () => {
    const user = userEvent.setup()
    renderViewer()
    const button = screen.getByRole("button", { name: "Toggle metadata" })
    await user.click(button)
    expect(screen.getByTestId("metadata-overlay")).toBeInTheDocument()
    await user.click(button)
    expect(screen.queryByTestId("metadata-overlay")).toBeNull()
  })

  it("reflects toggle state via aria-pressed on each tool button", async () => {
    const user = userEvent.setup()
    renderViewer()
    const grayscaleButton = screen.getByRole("button", {
      name: "Toggle B&W",
    })
    const infoButton = screen.getByRole("button", { name: "Toggle metadata" })
    expect(grayscaleButton).toHaveAttribute("aria-pressed", "false")
    expect(infoButton).toHaveAttribute("aria-pressed", "false")
    await user.click(grayscaleButton)
    expect(grayscaleButton).toHaveAttribute("aria-pressed", "true")
    await user.click(infoButton)
    expect(infoButton).toHaveAttribute("aria-pressed", "true")
  })
})

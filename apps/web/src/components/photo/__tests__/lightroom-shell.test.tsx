import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LocaleProvider } from "@/i18n/locale-provider"
import { DirectorsCutContext } from "@/lib/directors-cut-context"
import { getPhotoOfTheDay } from "@/lib/photo-of-the-day"
import type { Photo } from "@/data/photo-types"
import { LightroomShell } from "../lightroom-shell"

const { fixturePhotos } = vi.hoisted(() => {
  const exif = {
    camera: "Sony A7 IV",
    lens: "FE 50mm",
    focalLength: "50mm",
    aperture: "f/1.8",
    shutter: "1/200s",
    iso: 800,
  }
  const make = (
    id: string,
    collection: string,
    overrides: Partial<Photo> = {}
  ): Photo => ({
    id,
    src: `/photos/${id}.jpg`,
    medium: `/photos/${id}.md.webp`,
    thumb: `/photos/${id}.thumb.webp`,
    alt: `${id} alt`,
    collection,
    takenAt: "2025-11-09",
    exif,
    ...overrides,
  })
  const photos: ReadonlyArray<Photo> = [
    make("demo-tour-01", "Demo Tour", { caption: "Demo tour caption" }),
    make("demo-tour-02", "Demo Tour", { thumb: undefined }),
    make("demo-fan-01", "Demo Fan"),
    make("demo-fan-02", "Demo Fan"),
    make("demo-bts-01", "Director's Cut", { hidden: true }),
  ]
  return { fixturePhotos: photos }
})

vi.mock("@/data/photos", () => {
  const collections = Array.from(
    new Set(fixturePhotos.map((p) => p.collection))
  )
  return {
    photos: fixturePhotos,
    collections,
    findPhotoById: (id: string) => fixturePhotos.find((p) => p.id === id),
    photosByCollection: (collection: string) =>
      fixturePhotos.filter((p) => p.collection === collection),
  }
})

const FIXED_DATE = new Date(2026, 0, 4)
const visibleFixture = fixturePhotos.filter((p) => !p.hidden)
const visibleCollections = Array.from(
  new Set(visibleFixture.map((p) => p.collection))
)
const todayPhoto = getPhotoOfTheDay(visibleFixture, FIXED_DATE)

function renderShell(locale: "en" | "ko" = "en") {
  return render(
    <LocaleProvider locale={locale}>
      <LightroomShell />
    </LocaleProvider>
  )
}

describe("LightroomShell", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.setSystemTime(FIXED_DATE)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("snaps the viewer to today's photo on mount", () => {
    renderShell()
    const figure = screen.getByRole("figure")
    const img = within(figure).getByRole("img")
    expect(img).toHaveAttribute("src", todayPhoto.medium ?? todayPhoto.src)
  })

  it("renders the Korean locale variant of the gallery", () => {
    renderShell("ko")
    expect(
      screen.getByRole("navigation", { name: "컬렉션" })
    ).toBeInTheDocument()
  })

  it("labels the banner with 'Photo of the day' when the potd is selected", () => {
    renderShell()
    expect(screen.getByText("Photo of the day")).toBeInTheDocument()
  })

  it("falls back to the collection name in the banner once another photo is selected", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderShell()
    const target = visibleFixture.find((p) => p.id !== todayPhoto.id)
    if (!target) throw new Error("fixture needs a non-potd visible photo")
    const strip = screen.getByRole("region", { name: "Filmstrip" })
    await user.click(within(strip).getByRole("button", { name: target.alt }))
    const banner = screen.getByTestId("photo-meta-banner")
    expect(
      within(banner).queryByText("Photo of the day")
    ).not.toBeInTheDocument()
    expect(within(banner).getByText(target.collection)).toBeInTheDocument()
  })

  it("renders an entry for each visible collection plus an All shortcut", () => {
    renderShell()
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    expect(
      within(sidebar).getAllByRole("button", { name: "All" }).length
    ).toBeGreaterThan(0)
    for (const collection of visibleCollections) {
      expect(
        within(sidebar).getAllByRole("button", { name: collection }).length
      ).toBeGreaterThan(0)
    }
  })

  it("does not surface hidden collections in the sidebar by default", () => {
    renderShell()
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    expect(
      within(sidebar).queryByRole("button", { name: "Director's Cut" })
    ).toBeNull()
  })

  it("filters the filmstrip when a collection is activated", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderShell()
    const targetCollection = visibleCollections[0]
    const expectedCount = visibleFixture.filter(
      (p) => p.collection === targetCollection
    ).length
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    await user.click(
      within(sidebar).getAllByRole("button", { name: targetCollection })[0]
    )
    const strip = screen.getByRole("region", { name: "Filmstrip" })
    expect(within(strip).getAllByRole("button")).toHaveLength(expectedCount)
  })

  it("snaps the viewer to the first matching photo when filtering removes the current selection", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderShell()
    const otherCollection = visibleCollections.find(
      (c) => c !== todayPhoto.collection
    )
    if (!otherCollection) {
      throw new Error("fixture needs at least two visible collections")
    }
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    await user.click(
      within(sidebar).getAllByRole("button", { name: otherCollection })[0]
    )
    const expected = visibleFixture.find(
      (p) => p.collection === otherCollection
    )
    if (!expected) throw new Error("missing photo for collection")
    const figure = screen.getByRole("figure")
    expect(within(figure).getByRole("img")).toHaveAttribute(
      "src",
      expected.medium ?? expected.src
    )
  })

  it("swaps the viewer when a filmstrip thumbnail is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderShell()
    const target = visibleFixture.find((p) => p.id !== todayPhoto.id)
    if (!target) throw new Error("fixture needs a non-potd visible photo")
    const strip = screen.getByRole("region", { name: "Filmstrip" })
    await user.click(within(strip).getByRole("button", { name: target.alt }))
    const figure = screen.getByRole("figure")
    expect(within(figure).getByRole("img")).toHaveAttribute(
      "src",
      target.medium ?? target.src
    )
  })

  it("returns to the full visible set when All is selected after filtering", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderShell()
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    await user.click(
      within(sidebar).getAllByRole("button", { name: visibleCollections[0] })[0]
    )
    await user.click(within(sidebar).getAllByRole("button", { name: "All" })[0])
    const strip = screen.getByRole("region", { name: "Filmstrip" })
    expect(within(strip).getAllByRole("button")).toHaveLength(
      visibleFixture.length
    )
  })

  it("renders the caption overlay when the selected photo provides one", () => {
    renderShell()
    if (!todayPhoto.caption) {
      throw new Error("today's photo should have a caption for this fixture")
    }
    expect(screen.getByText(todayPhoto.caption)).toBeInTheDocument()
  })

  it("surfaces the hidden Director's Cut collection when the override is active", () => {
    const hidden = fixturePhotos.find((p) => p.hidden)
    if (!hidden) throw new Error("fixture needs at least one hidden photo")
    render(
      <LocaleProvider locale="en">
        <DirectorsCutContext.Provider value={true}>
          <LightroomShell />
        </DirectorsCutContext.Provider>
      </LocaleProvider>
    )
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    expect(
      within(sidebar).getAllByRole("button", { name: hidden.collection }).length
    ).toBeGreaterThan(0)
  })

  it("resets the active collection when it disappears after the Director's Cut override is dropped", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const hidden = fixturePhotos.find((p) => p.hidden)
    if (!hidden) throw new Error("fixture needs at least one hidden photo")
    const { rerender } = render(
      <LocaleProvider locale="en">
        <DirectorsCutContext.Provider value={true}>
          <LightroomShell />
        </DirectorsCutContext.Provider>
      </LocaleProvider>
    )
    const sidebar = screen.getByRole("navigation", { name: "Collections" })
    await user.click(
      within(sidebar).getAllByRole("button", { name: hidden.collection })[0]
    )
    rerender(
      <LocaleProvider locale="en">
        <DirectorsCutContext.Provider value={false}>
          <LightroomShell />
        </DirectorsCutContext.Provider>
      </LocaleProvider>
    )
    const strip = screen.getByRole("region", { name: "Filmstrip" })
    expect(within(strip).getAllByRole("button")).toHaveLength(
      visibleFixture.length
    )
  })
})

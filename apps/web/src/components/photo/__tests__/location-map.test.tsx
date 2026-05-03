import { describe, it, expect, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"

vi.mock("pigeon-maps", () => ({
  Map: ({
    children,
    height,
  }: {
    children?: React.ReactNode
    height?: number
  }) => (
    <div data-testid="pigeon-map" style={{ height: height ?? 0 }}>
      {children}
    </div>
  ),
  Marker: ({ anchor }: { anchor: [number, number] }) => (
    <div data-testid="pigeon-marker" data-anchor={anchor.join(",")} />
  ),
}))

import { LocationMap } from "../location-map"

describe("LocationMap", () => {
  it("renders a skeleton placeholder before the client mounts", () => {
    render(<LocationMap lat={37.52} lng={127.12} ariaLabel="Olympic Hall" />)
    expect(
      screen.getByRole("img", { name: "Olympic Hall" })
    ).toBeInTheDocument()
  })

  it("renders the pigeon map after the mount effect", async () => {
    await act(async () => {
      render(<LocationMap lat={37.52} lng={127.12} ariaLabel="Olympic Hall" />)
    })
    expect(screen.getByTestId("pigeon-map")).toBeInTheDocument()
    expect(screen.getByTestId("pigeon-marker")).toHaveAttribute(
      "data-anchor",
      "37.52,127.12"
    )
  })

  it("respects custom height and zoom props", async () => {
    await act(async () => {
      render(
        <LocationMap
          lat={37.52}
          lng={127.12}
          ariaLabel="Olympic Hall"
          height={80}
          zoom={11}
        />
      )
    })
    const map = screen.getByTestId("pigeon-map")
    expect(map.style.height).toBe("80px")
  })
})

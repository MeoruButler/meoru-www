import { describe, it, expect, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { messages } from "@/i18n/messages"
import {
  buildDevelopFilter,
  DevelopSliders,
  NEUTRAL_DEVELOP,
} from "../develop-sliders"

const labels = messages.en.gallery.develop

describe("buildDevelopFilter", () => {
  it("returns identity-like values when neutral", () => {
    expect(buildDevelopFilter(NEUTRAL_DEVELOP)).toBe(
      "brightness(1) saturate(1) contrast(1)"
    )
  })

  it("scales brightness off the exposure slider", () => {
    expect(
      buildDevelopFilter({ exposure: 100, saturation: 0, vibrance: 0 })
    ).toBe("brightness(1.5) saturate(1) contrast(1)")
  })
})

describe("DevelopSliders", () => {
  it("forwards numeric updates from each range input", () => {
    const onChange = vi.fn()
    render(
      <DevelopSliders
        value={NEUTRAL_DEVELOP}
        onChange={onChange}
        labels={labels}
      />
    )
    fireEvent.change(screen.getByLabelText(labels.exposure), {
      target: { value: "40" },
    })
    expect(onChange).toHaveBeenLastCalledWith({
      exposure: 40,
      saturation: 0,
      vibrance: 0,
    })
    fireEvent.change(screen.getByLabelText(labels.saturation), {
      target: { value: "-25" },
    })
    expect(onChange).toHaveBeenLastCalledWith({
      exposure: 0,
      saturation: -25,
      vibrance: 0,
    })
    fireEvent.change(screen.getByLabelText(labels.vibrance), {
      target: { value: "10" },
    })
    expect(onChange).toHaveBeenLastCalledWith({
      exposure: 0,
      saturation: 0,
      vibrance: 10,
    })
  })

  it("disables the reset button when values are neutral", () => {
    render(
      <DevelopSliders
        value={NEUTRAL_DEVELOP}
        onChange={vi.fn()}
        labels={labels}
      />
    )
    expect(screen.getByRole("button", { name: labels.reset })).toBeDisabled()
  })

  it("formats positive values with a leading +", () => {
    render(
      <DevelopSliders
        value={{ exposure: 25, saturation: -10, vibrance: 0 }}
        onChange={vi.fn()}
        labels={labels}
      />
    )
    expect(screen.getByText("+25")).toBeInTheDocument()
    expect(screen.getByText("-10")).toBeInTheDocument()
    expect(screen.getByText("0")).toBeInTheDocument()
  })

  it("invokes onChange with neutral values when reset is clicked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(
      <DevelopSliders
        value={{ exposure: 30, saturation: 10, vibrance: 5 }}
        onChange={onChange}
        labels={labels}
      />
    )
    await user.click(screen.getByRole("button", { name: labels.reset }))
    expect(onChange).toHaveBeenCalledWith(NEUTRAL_DEVELOP)
  })
})

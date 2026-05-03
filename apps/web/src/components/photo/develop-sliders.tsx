import { ChevronDown } from "lucide-react"
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"
import { cn } from "@workspace/ui/lib/utils"
import type { Messages } from "@/i18n/messages/en"

export type DevelopValues = {
  exposure: number
  saturation: number
  vibrance: number
}

export const NEUTRAL_DEVELOP: DevelopValues = {
  exposure: 0,
  saturation: 0,
  vibrance: 0,
}

export function buildDevelopFilter({
  exposure,
  saturation,
  vibrance,
}: DevelopValues): string {
  return `brightness(${1 + exposure / 200}) saturate(${1 + saturation / 100}) contrast(${1 + vibrance / 300})`
}

type DevelopSlidersProps = {
  value: DevelopValues
  onChange: (next: DevelopValues) => void
  labels: Messages["gallery"]["develop"]
  className?: string
  defaultOpen?: boolean
}

export function DevelopSliders({
  value,
  onChange,
  labels,
  className,
  defaultOpen = true,
}: DevelopSlidersProps) {
  const isDirty =
    value.exposure !== 0 || value.saturation !== 0 || value.vibrance !== 0

  return (
    <Collapsible
      defaultOpen={defaultOpen}
      role="region"
      aria-label={labels.title}
      className={cn(
        "group/develop rounded-md border border-border bg-card/40",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2">
        <CollapsibleTrigger className="flex flex-1 items-center justify-between text-xs font-medium tracking-[0.16em] uppercase">
          <span>{labels.title}</span>
          <ChevronDown
            className="h-4 w-4 text-muted-foreground transition-transform group-data-[panel-open]/develop:rotate-180"
            aria-hidden="true"
          />
        </CollapsibleTrigger>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onChange(NEUTRAL_DEVELOP)
          }}
          disabled={!isDirty}
          className="ml-3 text-[11px] text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          {labels.reset}
        </button>
      </div>
      <CollapsiblePanel>
        <div className="flex flex-col gap-2.5 px-3 pt-1 pb-3">
          <SliderRow
            label={labels.exposure}
            value={value.exposure}
            onChange={(v) => onChange({ ...value, exposure: v })}
          />
          <SliderRow
            label={labels.saturation}
            value={value.saturation}
            onChange={(v) => onChange({ ...value, saturation: v })}
          />
          <SliderRow
            label={labels.vibrance}
            value={value.vibrance}
            onChange={(v) => onChange({ ...value, vibrance: v })}
          />
        </div>
      </CollapsiblePanel>
    </Collapsible>
  )
}

type SliderRowProps = {
  label: string
  value: number
  onChange: (next: number) => void
}

function SliderRow({ label, value, onChange }: SliderRowProps) {
  const formatted = value > 0 ? `+${value}` : String(value)
  return (
    <label className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[10px] tracking-wide text-muted-foreground uppercase">
        <span>{label}</span>
        <span className="font-mono text-foreground tabular-nums">
          {formatted}
        </span>
      </div>
      <input
        type="range"
        min={-100}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="h-1 w-full cursor-pointer appearance-none rounded bg-muted accent-foreground [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground"
      />
    </label>
  )
}

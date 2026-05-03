import { useMemo } from "react"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"

type CollectionSidebarProps = {
  collections: ReadonlyArray<string>
  active: string | null
  onChange: (collection: string | null) => void
  label: string
  allLabel: string
  className?: string
}

type Item = {
  key: string
  label: string
  value: string | null
  handle: () => void
}

export function CollectionSidebar({
  collections,
  active,
  onChange,
  label,
  allLabel,
  className,
}: CollectionSidebarProps) {
  const items = useMemo<ReadonlyArray<Item>>(
    () => [
      {
        key: "__all__",
        label: allLabel,
        value: null,
        handle: () => onChange(null),
      },
      ...collections.map((c) => ({
        key: c,
        label: c,
        value: c,
        handle: () => onChange(c),
      })),
    ],
    [collections, allLabel, onChange]
  )

  return (
    <nav
      aria-label={label}
      className={cn("lg:sticky lg:top-20 lg:self-start", className)}
    >
      <p className="mb-1.5 hidden text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase lg:block">
        {label}
      </p>
      <ScrollArea className="lg:hidden">
        <ul className="flex gap-1 pb-1">
          {items.map((item) => (
            <li key={item.key} className="shrink-0">
              <CollectionButton
                label={item.label}
                isActive={active === item.value}
                onClick={item.handle}
                tone="chip"
              />
            </li>
          ))}
        </ul>
      </ScrollArea>
      <ul className="hidden flex-col gap-0.5 lg:flex">
        {items.map((item) => (
          <li key={item.key}>
            <CollectionButton
              label={item.label}
              isActive={active === item.value}
              onClick={item.handle}
              tone="row"
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

type CollectionButtonProps = {
  label: string
  isActive: boolean
  onClick: () => void
  tone: "chip" | "row"
}

function CollectionButton({
  label,
  isActive,
  onClick,
  tone,
}: CollectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      data-tone={tone}
      className={cn(
        "block w-full text-sm whitespace-nowrap transition-colors",
        tone === "chip" &&
          "rounded-full border px-2.5 py-1 text-xs " +
            (isActive
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"),
        tone === "row" &&
          "rounded px-2 py-1 text-left " +
            (isActive
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")
      )}
    >
      {label}
    </button>
  )
}

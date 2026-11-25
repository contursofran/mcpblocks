"use client"

import * as React from "react"
// The kit has no bookmark icon, so this one comes from lucide.
import { Bookmark } from "lucide-react"

import { cn } from "@/lib/utils"
import { guideline } from "@/registry/mcpblocks/lib/host"
import { CaretLeftIcon, CaretRightIcon, StarFilledIcon } from "@/registry/mcpblocks/ui/icons"

export type CarouselItem = {
  id: string
  title: string
  subtitle?: string
  image?: string
  imageAlt?: string
  /** Star rating shown first in the meta row, e.g. 4.6. */
  rating?: number
  /** Short facts joined with dots, e.g. ["Moderate", "2.8 mi"]. */
  meta?: string[]
  /** Optional save/bookmark toggle on the image. */
  saved?: boolean
  onSave?: (saved: boolean) => void
  onClick?: () => void
}

export type CarouselProps = {
  /** Claude guidelines: 3–8 items. */
  items: CarouselItem[]
  /** Accessible label for the scroll region. */
  label?: string
  /** Card width and image height in px (kit default 220 × 280). */
  cardWidth?: number
  imageHeight?: number
  className?: string
}

/**
 * Horizontal row of comparable items with images, a save toggle and a meta row.
 * Matches the "Inline carousel" pattern in the MCP Apps for Claude kit.
 * Register the resource with `_meta.ui.prefersBorder: false`.
 */
export function Carousel({
  items,
  label = "Options",
  cardWidth = 220,
  imageHeight = 280,
  className,
}: CarouselProps) {
  guideline(items.length < 3 || items.length > 8, "Carousel: Claude recommends 3–8 items.")
  const scroller = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState({ start: true, end: false })
  const [saved, setSaved] = React.useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((i) => [i.id, !!i.saved]))
  )

  const updateEdges = React.useCallback(() => {
    const el = scroller.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  React.useEffect(() => {
    updateEdges()
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(updateEdges)
    ro.observe(el)
    return () => ro.disconnect()
  }, [updateEdges])

  function page(dir: 1 | -1) {
    scroller.current?.scrollBy({ left: dir * (cardWidth + 12) * 2, behavior: "smooth" })
  }

  const fade = !edges.end
    ? "linear-gradient(to right, black calc(100% - 172px), transparent)"
    : undefined

  return (
    <div data-slot="carousel" className={cn("relative w-full pt-4 pb-6 text-host-fg font-[family-name:var(--font-sans)]", className)}>
      <div
        ref={scroller}
        role="region"
        aria-label={label}
        tabIndex={0}
        onScroll={updateEdges}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          maskImage: fade,
          WebkitMaskImage: fade,
          scrollPaddingInline: "max(16px, var(--mb-safe-left, 0px)) max(16px, var(--mb-safe-right, 0px))",
        }}
      >
        {items.map((item) => {
          const isSaved = saved[item.id]
          return (
            <article key={item.id} className="flex shrink-0 snap-start flex-col gap-5" style={{ width: cardWidth }}>
              <div className="relative overflow-hidden rounded-host-xl bg-host-bg-secondary" style={{ height: imageHeight }}>
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt={item.imageAlt ?? ""} className="size-full object-cover" />
                ) : null}
                {item.onSave !== undefined || item.saved !== undefined ? (
                  <button
                    type="button"
                    aria-pressed={isSaved}
                    aria-label={isSaved ? `Remove ${item.title} from saved` : `Save ${item.title}`}
                    onClick={() => {
                      const next = !isSaved
                      setSaved((s) => ({ ...s, [item.id]: next }))
                      item.onSave?.(next)
                    }}
                    className="absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full border-[length:var(--border-width-regular,0.5px)] border-host-border-tertiary bg-host-bg/90 text-host-fg backdrop-blur-[9px]"
                  >
                    <Bookmark className="size-5" fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col gap-2.5">
                {item.onClick ? (
                  <button type="button" onClick={item.onClick} className="truncate text-left text-xs leading-[1.4] font-semibold text-host-fg-secondary hover:underline">
                    {item.title}
                  </button>
                ) : (
                  <h3 className="truncate text-xs leading-[1.4] font-semibold text-host-fg-secondary">{item.title}</h3>
                )}
                {item.subtitle ? <p className="truncate text-xs leading-[1.4] text-host-fg-secondary">{item.subtitle}</p> : null}
                {item.rating !== undefined || item.meta?.length ? (
                  <p className="flex items-center gap-1 text-xs leading-[1.4] text-host-fg-tertiary opacity-75">
                    {item.rating !== undefined ? (
                      <span className="flex items-center gap-0.5">
                        <StarFilledIcon className="size-4" aria-label="Rating" />
                        {item.rating}
                      </span>
                    ) : null}
                    {item.meta?.map((m, i) => (
                      <React.Fragment key={m}>
                        {i > 0 || item.rating !== undefined ? (
                          <span aria-hidden="true" className="size-[3px] rounded-full bg-current" />
                        ) : null}
                        <span className="truncate">{m}</span>
                      </React.Fragment>
                    ))}
                  </p>
                ) : null}
              </div>
            </article>
          )
        })}
        <div aria-hidden="true" className="w-4 shrink-0" />
      </div>

      {!edges.start ? (
        <button
          type="button"
          aria-label="Previous"
          onClick={() => page(-1)}
          className="absolute top-[calc(16px+var(--img-h)/2)] left-2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-[length:var(--border-width-regular,0.5px)] border-host-border-tertiary bg-host-bg text-host-fg shadow-md"
          style={{ ["--img-h" as string]: `${imageHeight}px` }}
        >
          <CaretLeftIcon className="size-5" />
        </button>
      ) : null}
      {!edges.end ? (
        <button
          type="button"
          aria-label="Next"
          onClick={() => page(1)}
          className="absolute top-[calc(16px+var(--img-h)/2)] right-2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full border-[length:var(--border-width-regular,0.5px)] border-host-border-tertiary bg-host-bg text-host-fg shadow-md"
          style={{ ["--img-h" as string]: `${imageHeight}px` }}
        >
          <CaretRightIcon className="size-5" />
        </button>
      ) : null}
    </div>
  )
}

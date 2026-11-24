import * as React from "react"

import { cn } from "@/lib/utils"
import { guideline } from "@/registry/inlinekit/lib/host"
import { HostButton } from "@/registry/inlinekit/ui/host-button"

export type CarouselItem = {
  id: string
  title: string
  image?: string
  imageAlt?: string
  /** Up to 3 short lines of metadata. */
  meta?: string[]
  cta?: { label: string; onClick?: () => void }
}

export type CarouselProps = React.ComponentProps<"div"> & {
  /** Claude guidelines: 3–8 items. */
  items: CarouselItem[]
  /** Card width in px. Keep it consistent across a carousel. */
  cardWidth?: number
  /** Accessible label for the scroll region. */
  label?: string
}

/**
 * Horizontal row of comparable items. Use it borderless
 * (`_meta.ui.prefersBorder: false`) so it can bleed to the edges:
 * scroll-padding keeps resting cards inside the safe area.
 */
export function Carousel({
  items,
  cardWidth = 210,
  label = "Options",
  className,
  ...props
}: CarouselProps) {
  guideline(items.length < 3 || items.length > 8, "Carousel: Claude recommends 3–8 items.")

  return (
    <div
      role="region"
      aria-label={label}
      data-slot="carousel"
      className={cn(
        "flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 font-[family-name:var(--font-sans)] text-host-fg [scrollbar-width:none]",
        "scroll-px-[max(var(--ik-safe-left),0px)] px-[var(--ik-safe-left)]",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <article
          key={item.id}
          className="flex shrink-0 snap-start flex-col overflow-hidden rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-border-secondary bg-host-bg"
          style={{ width: cardWidth }}
        >
          <div className="aspect-[16/10] w-full bg-host-bg-secondary">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt={item.imageAlt ?? ""}
                className="size-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col gap-0.5 p-3">
            <h3 className="truncate text-sm font-semibold">{item.title}</h3>
            {item.meta?.slice(0, 3).map((line, i) => (
              <p key={i} className="truncate text-xs text-host-fg-tertiary">
                {line}
              </p>
            ))}
            {item.cta ? (
              <HostButton
                variant="secondary"
                className="mt-3"
                onClick={item.cta.onClick}
              >
                {item.cta.label}
              </HostButton>
            ) : null}
          </div>
        </article>
      ))}
      <div aria-hidden="true" className="w-[var(--ik-safe-right)] shrink-0" />
    </div>
  )
}

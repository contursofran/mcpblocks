import * as React from "react"

import { cn } from "@/lib/utils"
import { guideline } from "@/registry/mcpblocks/lib/host"
import { ArrowRightIcon } from "@/registry/mcpblocks/ui/icons"

export type ListViewItem = {
  id: string
  /** Initials shown in the avatar, e.g. "SC". */
  initials: string
  /** Avatar background. Any CSS color; defaults to the host info color. */
  avatarColor?: string
  title: string
  /** Secondary label next to the title, e.g. a channel or tag. */
  meta?: string
  /** Right-aligned timestamp or status. */
  timestamp?: string
  body?: React.ReactNode
  onClick?: () => void
}

export type ListViewProps = React.ComponentProps<"div"> & {
  items: ListViewItem[]
  /** Footer summary, e.g. "Showing 4 of 12 results". */
  summary?: string
  /** Footer link to open the full list in your app or in fullscreen. */
  viewAll?: { label: string; href?: string; onClick?: () => void }
}

/**
 * A short list of rich rows (messages, tickets, results) for inline display.
 * Matches the "List views" pattern in the MCP Apps for Claude kit.
 */
export function ListView({ items, summary, viewAll, className, ...props }: ListViewProps) {
  guideline(items.length > 5, "ListView: keep inline lists to ~4–5 rows and link to the rest.")

  return (
    <div
      data-slot="list-view"
      className={cn("flex w-full flex-col text-host-fg font-[family-name:var(--font-sans)]", className)}
      {...props}
    >
      <ul className="flex flex-col">
        {items.map((item) => {
          const Row = item.onClick ? "button" : "div"
          return (
            <li key={item.id} className="border-b-[length:var(--border-width-regular,0.5px)] border-host-border-secondary">
              <Row
                type={item.onClick ? "button" : undefined}
                onClick={item.onClick}
                className={cn(
                  "flex w-full items-start gap-3 px-6 py-4 text-left",
                  item.onClick && "transition-colors hover:bg-host-bg-tertiary focus-visible:outline-2 focus-visible:outline-host-ring"
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs leading-[16.8px] font-semibold text-white"
                  style={{ backgroundColor: item.avatarColor ?? "var(--color-text-info)" }}
                >
                  {item.initials}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm leading-[19.6px] font-semibold">{item.title}</span>
                      {item.meta ? (
                        <span className="truncate text-xs leading-[16.8px] text-host-fg-tertiary opacity-75">{item.meta}</span>
                      ) : null}
                    </span>
                    {item.timestamp ? (
                      <span className="shrink-0 text-xs leading-[16.8px] text-host-fg-tertiary opacity-75">{item.timestamp}</span>
                    ) : null}
                  </span>
                  {item.body ? (
                    <span className="line-clamp-2 text-sm leading-[19.6px] text-host-fg-secondary">{item.body}</span>
                  ) : null}
                </span>
              </Row>
            </li>
          )
        })}
      </ul>

      {summary || viewAll ? (
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-xs leading-[16.8px] text-host-fg-tertiary">{summary}</span>
          {viewAll ? (
            <a
              href={viewAll.href ?? "#"}
              onClick={(e) => {
                if (viewAll.onClick) {
                  e.preventDefault()
                  viewAll.onClick()
                }
              }}
              className="inline-flex items-center gap-1 text-xs leading-[16.8px] text-host-info-fg hover:underline"
            >
              {viewAll.label}
              <ArrowRightIcon className="size-4" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

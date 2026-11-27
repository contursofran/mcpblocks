import * as React from "react"

import { cn } from "@/lib/utils"

// mcpblocks skeleton@0.1.1
/** A single skeleton block. Prefer skeletons over spinners for inline content. */
export function HostSkeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="host-skeleton"
      className={cn("animate-pulse rounded-host-sm bg-host-app-surface-muted", className)}
      {...props}
    />
  )
}

/** Skeleton that matches InlineCard's layout, so the swap is seamless. */
export function InlineCardSkeleton({
  fields = 4,
  actions = 2,
  className,
  ...props
}: React.ComponentProps<"div"> & { fields?: number; actions?: 0 | 1 | 2 }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "flex w-full flex-col gap-4 rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-app-border-muted bg-host-app-surface p-5",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <HostSkeleton className="h-4 w-2/5" />
        <HostSkeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <HostSkeleton className="h-3 w-1/3" />
            <HostSkeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
      {actions > 0 ? (
        <div className="flex gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <HostSkeleton key={i} className="h-11 flex-1 rounded-host-md" />
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** Skeleton for a Carousel row. */
export function CarouselSkeleton({ count = 3, cardWidth = 210 }: { count?: number; cardWidth?: number }) {
  return (
    <div role="status" aria-label="Loading" className="flex gap-3 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex shrink-0 flex-col overflow-hidden rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-app-border-muted bg-host-app-surface"
          style={{ width: cardWidth }}
        >
          <HostSkeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="flex flex-col gap-1.5 p-3">
            <HostSkeleton className="h-4 w-3/4" />
            <HostSkeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Rows of avatar + three columns, the "Loading" state from the
 * MCP Apps for Claude kit. Use it while a list or table loads.
 */
export function RowsSkeleton({
  rows = 4,
  columns = 3,
  avatar = true,
  className,
  ...props
}: React.ComponentProps<"div"> & { rows?: number; columns?: number; avatar?: boolean }) {
  return (
    <div role="status" aria-label="Loading" className={cn("@container flex w-full flex-col gap-6 p-6", className)} {...props}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-8 items-center gap-3 @[24rem]:gap-5">
          {avatar ? <HostSkeleton className="size-8 shrink-0" style={{ borderRadius: 9999 }} /> : null}
          <div className="grid h-full flex-1 gap-2 @[24rem]:gap-5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, c) => (
              <HostSkeleton key={c} className="h-full" style={{ borderRadius: "var(--border-radius-md)" }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

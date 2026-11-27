import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

export type DataListItem = { label: ReactNode; value: ReactNode }

export function KeyValue({
  label,
  value,
  layout = "stacked",
}: DataListItem & { layout?: "stacked" | "aligned" }) {
  if (layout === "aligned") {
    return (
      <div className="grid grid-cols-[minmax(0,72px)_minmax(0,1fr)] items-baseline gap-3 text-sm leading-[1.4] [overflow-wrap:anywhere]">
        <dt className="text-host-app-fg-subtle">{label}</dt>
        <dd className="py-1 text-host-app-fg-muted">{value}</dd>
      </div>
    )
  }
  return (
    <div className="min-w-0">
      <dt className="text-xs text-host-app-fg-subtle">{label}</dt>
      <dd className="text-sm font-medium [overflow-wrap:anywhere]">{value}</dd>
    </div>
  )
}

export function DataList({
  items,
  layout = "stacked",
  className,
  ...props
}: ComponentProps<"dl"> & { items: DataListItem[]; layout?: "stacked" | "aligned" }) {
  return (
    <dl data-slot="data-list" className={cn("grid", layout === "aligned" ? "gap-2" : "gap-3", className)} {...props}>
      {items.map((item, index) => <KeyValue key={index} {...item} layout={layout} />)}
    </dl>
  )
}

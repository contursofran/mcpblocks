import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"
import { DataList } from "@/components/ui/data-list"

export type ChangePreviewRow = { label: ReactNode; from?: ReactNode; to: ReactNode }

export function ChangePreview({
  rows,
  children,
  className,
  ...props
}: ComponentProps<"div"> & { rows?: ChangePreviewRow[] }) {
  return (
    <div data-slot="change-preview" className={cn("space-y-2 text-host-sm", className)} {...props}>
      {rows?.length ? (
        <DataList
          layout="aligned"
          items={rows.map(({ label, from, to }) => ({
            label,
            value: from == null ? <strong>{to}</strong> : (
              <>
                <span>{from}</span>{" "}<span aria-label="changes to">→</span>{" "}<strong>{to}</strong>
              </>
            ),
          }))}
        />
      ) : null}
      {children}
      <p className="text-host-app-fg-muted">Nothing is saved until you confirm.</p>
    </div>
  )
}

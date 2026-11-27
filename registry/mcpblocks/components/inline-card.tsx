import * as React from "react"

import { cn } from "@/lib/utils"
import { guideline } from "@/registry/mcpblocks/lib/host"
import { DataList } from "@/registry/mcpblocks/ui/data-list"
import {
  HostButton,
  type HostButtonProps,
} from "@/registry/mcpblocks/ui/host-button"
import { StatusPill, type StatusPillTone } from "@/registry/mcpblocks/ui/status-pill"
import { Surface } from "@/registry/mcpblocks/ui/surface"

// mcpblocks inline-card@0.1.2
export type InlineCardField = {
  label: string
  value: React.ReactNode
}

export type InlineCardAction = {
  label: string
  onClick?: () => void
  variant?: HostButtonProps["variant"]
  disabled?: boolean
}

export type InlineCardTone = StatusPillTone

export type InlineCardProps = Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode
  /** Short status label shown top-right. */
  badge?: { label: string; tone?: InlineCardTone }
  description?: React.ReactNode
  /** Claude guidelines: at most 4–5 data points in an inline card. */
  fields?: InlineCardField[]
  /** Claude guidelines: at most 2 actions, at the bottom of the card. */
  actions?: InlineCardAction[]
  /** Number of columns for the field grid. */
  columns?: 1 | 2 | 3 | 4
}

const columnClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-2 @[20rem]:grid-cols-3",
  4: "grid-cols-2 @md:grid-cols-4",
} as const

/**
 * A compact card for the conversation: summary data plus up to two actions.
 * Height always fits its content (no inner scrolling).
 */
export function InlineCard({
  title,
  badge,
  description,
  fields = [],
  actions = [],
  columns = 2,
  className,
  children,
  ...props
}: InlineCardProps) {
  guideline(fields.length > 5, "InlineCard: more than 5 fields. Consider fullscreen.")
  guideline(actions.length > 2, "InlineCard: more than 2 actions. Claude allows at most 2.")

  return (
    <Surface as="section"
      data-slot="inline-card"
      className={cn(
        "@container flex flex-col gap-4 p-5",
        className
      )}
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-base leading-snug font-host-app-display font-semibold [overflow-wrap:anywhere]">{title}</h3>
          {description ? (
            <p className="text-sm text-host-app-fg-muted">{description}</p>
          ) : null}
        </div>
        {badge ? (
          <StatusPill tone={badge.tone}>{badge.label}</StatusPill>
        ) : null}
      </header>

      {fields.length > 0 ? <DataList className={columnClass[columns]} items={fields} /> : null}

      {children}

      {actions.length > 0 ? (
        <footer className="grid gap-2 @[20rem]:auto-cols-fr @[20rem]:grid-flow-col">
          {actions.slice(0, 2).map((a, i) => (
            <HostButton
              key={a.label}
              block
              className="min-w-0 py-2 text-center whitespace-normal [overflow-wrap:anywhere]"
              variant={a.variant ?? (i === 0 ? "primary" : "secondary")}
              onClick={a.onClick}
              disabled={a.disabled}
            >
              {a.label}
            </HostButton>
          ))}
        </footer>
      ) : null}
    </Surface>
  )
}

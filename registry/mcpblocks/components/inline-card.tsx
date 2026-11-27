import * as React from "react"

import { cn } from "@/lib/utils"
import { guideline } from "@/registry/mcpblocks/lib/host"
import {
  HostButton,
  type HostButtonProps,
} from "@/registry/mcpblocks/ui/host-button"

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

export type InlineCardTone = "neutral" | "info" | "success" | "warning" | "danger"

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

const toneClass: Record<InlineCardTone, string> = {
  neutral: "bg-host-app-surface-muted text-host-app-fg-muted",
  info: "bg-host-app-info-bg text-host-app-fg border-[length:var(--border-width-regular,0.5px)] border-host-app-info-border/40",
  success: "bg-host-app-success-bg text-host-app-success-fg",
  warning: "bg-host-app-warning-bg text-host-app-warning-fg",
  danger: "bg-host-app-danger-border/15 text-host-app-danger-fg",
}

const columnClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
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
    <section
      data-slot="inline-card"
      className={cn(
        "@container flex w-full flex-col gap-4 rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-app-border-muted bg-host-app-surface p-5 text-host-app-fg font-[family-name:var(--font-sans)]",
        className
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-base leading-snug font-host-app-display font-semibold">{title}</h3>
          {description ? (
            <p className="text-sm text-host-app-fg-muted">{description}</p>
          ) : null}
        </div>
        {badge ? (
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
              toneClass[badge.tone ?? "neutral"]
            )}
          >
            {badge.label}
          </span>
        ) : null}
      </header>

      {fields.length > 0 ? (
        <dl className={cn("grid gap-3", columnClass[columns])}>
          {fields.map((f, i) => (
            <div key={i} className="min-w-0">
              <dt className="text-xs text-host-app-fg-subtle">{f.label}</dt>
              <dd className="truncate text-sm font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children}

      {actions.length > 0 ? (
        <footer className="flex gap-2">
          {actions.slice(0, 2).map((a, i) => (
            <HostButton
              key={a.label}
              block
              variant={a.variant ?? (i === 0 ? "primary" : "secondary")}
              onClick={a.onClick}
              disabled={a.disabled}
            >
              {a.label}
            </HostButton>
          ))}
        </footer>
      ) : null}
    </section>
  )
}

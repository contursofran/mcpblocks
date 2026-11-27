import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const tones = {
  neutral: "bg-host-app-surface-muted text-host-app-fg-muted",
  info: "bg-host-app-info-bg text-host-app-fg border-[length:var(--border-width-regular,0.5px)] border-host-app-info-border/40",
  success: "bg-host-app-success-bg text-host-app-success-fg",
  warning: "bg-host-app-warning-bg text-host-app-warning-fg",
  danger: "bg-host-app-danger-border/15 text-host-app-danger-fg",
} as const

export type StatusPillTone = keyof typeof tones

export function StatusPill({
  tone = "neutral",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: StatusPillTone }) {
  return (
    <span
      data-slot="status-pill"
      className={cn("inline-block max-w-full rounded-full px-2 py-0.5 text-xs font-semibold [overflow-wrap:anywhere]", tones[tone], className)}
      {...props}
    />
  )
}

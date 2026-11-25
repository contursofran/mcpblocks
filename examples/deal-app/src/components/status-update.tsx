import * as React from "react"

import { cn } from "@/lib/utils"
import { HostButton } from "@/components/ui/host-button"
import { CheckCircleIcon, InfoIcon, ProhibitIcon, WarningIcon } from "@/components/ui/icons"

export type StatusTone = "success" | "info" | "warning" | "danger"

export type StatusUpdateProps = Omit<React.ComponentProps<"div">, "title"> & {
  tone?: StatusTone
  title: React.ReactNode
  description?: React.ReactNode
  /** One optional follow-up, e.g. "Undo" or "View". */
  action?: { label: string; onClick?: () => void }
}

const tones: Record<
  StatusTone,
  { icon: React.ElementType; chip: string; label: string }
> = {
  success: { icon: CheckCircleIcon, chip: "bg-host-success-bg text-host-success-fg", label: "Success" },
  info: { icon: InfoIcon, chip: "bg-host-info-bg text-host-info-fg", label: "Info" },
  warning: { icon: WarningIcon, chip: "bg-host-warning-bg text-host-warning-fg", label: "Warning" },
  danger: { icon: ProhibitIcon, chip: "bg-host-danger-border/15 text-host-danger-fg", label: "Error" },
}

/** Confirms the result of an action, using the host's semantic colors. */
export function StatusUpdate({
  tone = "success",
  title,
  description,
  action,
  className,
  ...props
}: StatusUpdateProps) {
  const t = tones[tone]
  const Icon = t.icon
  return (
    <div
      role="status"
      data-slot="status-update"
      className={cn(
        "flex w-full items-center gap-3 rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-border-secondary bg-host-bg p-4 text-host-fg font-[family-name:var(--font-sans)]",
        className
      )}
      {...props}
    >
      <span
        className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", t.chip)}
      >
        <Icon className="size-[18px]" aria-label={t.label} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="truncate text-sm text-host-fg-tertiary">{description}</p>
        ) : null}
      </div>
      {action ? (
        <HostButton variant="secondary" onClick={action.onClick}>
          {action.label}
        </HostButton>
      ) : null}
    </div>
  )
}

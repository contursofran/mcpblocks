import * as React from "react"

import { cn } from "@/lib/utils"
import { Surface } from "@/components/ui/surface"
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
  success: { icon: CheckCircleIcon, chip: "bg-host-app-success-bg text-host-app-success-fg", label: "Success" },
  info: { icon: InfoIcon, chip: "bg-host-app-info-bg text-host-app-info-fg", label: "Info" },
  warning: { icon: WarningIcon, chip: "bg-host-app-warning-bg text-host-app-warning-fg", label: "Warning" },
  danger: { icon: ProhibitIcon, chip: "bg-host-app-danger-border/15 text-host-app-danger-fg", label: "Error" },
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
    <Surface
      role="status"
      data-slot="status-update"
      className={cn(
        "flex flex-wrap items-center gap-3 p-4",
        className
      )}
      {...props}
    >
      <span
        className={cn("flex size-9 shrink-0 items-center justify-center rounded-full", t.chip)}
      >
        <Icon className="size-[18px]" aria-label={t.label} />
      </span>
      <div className="flex min-w-0 flex-1 basis-28 flex-col [overflow-wrap:anywhere]">
        <p className="text-sm font-semibold">{title}</p>
        {description ? (
          <p className="text-sm text-host-app-fg-subtle">{description}</p>
        ) : null}
      </div>
      {action ? (
        <HostButton variant="secondary" className="max-w-full py-2 whitespace-normal [overflow-wrap:anywhere]" onClick={action.onClick}>
          {action.label}
        </HostButton>
      ) : null}
    </Surface>
  )
}

"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { StatusUpdate } from "@/registry/mcpblocks/components/status-update"
import { HostButton } from "@/registry/mcpblocks/ui/host-button"
import { CheckIcon } from "@/registry/mcpblocks/ui/icons"

export type ConfirmActionStatus = "pending" | "working" | "done" | "error" | "refused" | "unknown"

export type ConfirmActionProps = {
  /** What will happen, e.g. "Set lead assignment permission". */
  title: React.ReactNode
  /** The person or record the action applies to. */
  subject: {
    name: string
    detail?: string
    initials?: string
    avatarColor?: string
  }
  /** Button label, e.g. "Confirm assignment". */
  confirmLabel?: string
  /** Called on confirm. Return a promise to show the working state. */
  onConfirm?: () => unknown
  /** Optional list of what the change includes. */
  details?: { heading: string; items: string[] }
  /** Summary of the proposed change, shown with a confirmation reminder. */
  changePreview?: React.ReactNode
  doneTitle?: React.ReactNode
  doneDescription?: React.ReactNode
  onUndo?: () => void
  errorTitle?: React.ReactNode
  refusedTitle?: React.ReactNode
  refusedDescription?: React.ReactNode
  unknownTitle?: React.ReactNode
  unknownDescription?: React.ReactNode
  /** Reconcile the original request without blindly sending another write. */
  onCheckAgain?: () => void
  /** Control the status from outside (e.g. after a tool result arrives). */
  status?: ConfirmActionStatus
  className?: string
}

/**
 * Confirmation for a change Claude has prepared: what happens, who it applies
 * to, one confirm button, and what the change includes.
 * Matches the "Confirmation actions" pattern in the MCP Apps for Claude kit.
 * Edits stay in the conversation; the widget only confirms.
 */
export function ConfirmAction({
  title,
  subject,
  confirmLabel = "Confirm",
  onConfirm,
  details,
  changePreview,
  doneTitle = "Done",
  doneDescription,
  onUndo,
  errorTitle = "That didn't work",
  refusedTitle = "Nothing was changed",
  refusedDescription,
  unknownTitle = "We couldn't confirm this went through",
  unknownDescription,
  onCheckAgain,
  status: controlled,
  className,
}: ConfirmActionProps) {
  const [internal, setInternal] = React.useState<ConfirmActionStatus>("pending")
  const status = controlled ?? internal

  async function confirm() {
    try {
      setInternal("working")
      await onConfirm?.()
      setInternal("done")
    } catch {
      setInternal("error")
    }
  }

  if (status === "done") {
    return (
      <StatusUpdate
        className={className}
        tone="success"
        title={doneTitle}
        description={doneDescription}
        action={onUndo ? { label: "Undo", onClick: () => { onUndo(); setInternal("pending") } } : undefined}
      />
    )
  }
  if (status === "error") {
    return (
      <StatusUpdate
        className={className}
        tone="danger"
        title={errorTitle}
        description="Nothing was changed."
        action={{ label: "Try again", onClick: confirm }}
      />
    )
  }
  if (status === "refused" || status === "unknown") {
    const refused = status === "refused"
    return (
      <StatusUpdate
        className={cn("[&_p]:whitespace-normal", className)}
        tone={refused ? "info" : "warning"}
        title={refused ? refusedTitle : unknownTitle}
        description={refused ? refusedDescription : unknownDescription}
        action={!refused && onCheckAgain ? { label: "Check again", onClick: onCheckAgain } : undefined}
      />
    )
  }

  const initials =
    subject.initials ??
    subject.name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  return (
    <div
      data-slot="confirm-action"
      className={cn("flex w-full flex-col gap-6 p-6 text-host-app-fg font-[family-name:var(--font-sans)]", className)}
    >
      <h3 className="text-xl leading-[25px] font-host-app-display font-semibold">{title}</h3>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-app-border-muted p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: subject.avatarColor ?? "var(--color-text-info)" }}
          >
            {initials}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm leading-[19.6px] font-semibold">{subject.name}</span>
            {subject.detail ? (
              <span className="truncate text-sm leading-[19.6px] text-host-app-fg-subtle opacity-75">{subject.detail}</span>
            ) : null}
          </span>
        </div>
        <HostButton onClick={confirm} disabled={status === "working"}>
          {status === "working" ? "Working…" : confirmLabel}
        </HostButton>
      </div>

      {details ? (
        <div className="flex flex-col gap-4">
          <h4 className="text-sm leading-[19.6px] font-semibold">{details.heading}</h4>
          <ul className="flex flex-col gap-3">
            {details.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-[19.6px] text-host-app-fg-subtle">
                <CheckIcon className="size-5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {changePreview != null ? (
        <div className="space-y-2 text-host-sm">
          {changePreview}
          <p className="text-host-app-fg-muted">Nothing is saved until you confirm.</p>
        </div>
      ) : null}
    </div>
  )
}

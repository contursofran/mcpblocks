"use client"

import * as React from "react"

import { InlineCard, type InlineCardField } from "@/registry/inlinekit/components/inline-card"
import { StatusUpdate } from "@/registry/inlinekit/components/status-update"

export type ConfirmActionStatus = "pending" | "working" | "done" | "error"

export type ConfirmActionProps = {
  title: React.ReactNode
  description?: React.ReactNode
  fields?: InlineCardField[]
  /** Called when the user approves. Return a promise to show a working state. */
  onApprove?: () => unknown
  /**
   * Edits go through the chat, not a form in the widget.
   * Typically sends a message back to the host (e.g. `ui/message`).
   */
  onEditInChat?: () => void
  /** Optional undo after success. */
  onUndo?: () => void
  approveLabel?: string
  editLabel?: string
  doneTitle?: React.ReactNode
  doneDescription?: React.ReactNode
  errorTitle?: React.ReactNode
  /** Control the status from outside (e.g. after a tool result arrives). */
  status?: ConfirmActionStatus
  className?: string
}

/**
 * Approve / edit-in-chat pattern for a change Claude has prepared.
 * Pending → working → done (or error), all within one inline card.
 */
export function ConfirmAction({
  title,
  description,
  fields,
  onApprove,
  onEditInChat,
  onUndo,
  approveLabel = "Approve",
  editLabel = "Edit in chat",
  doneTitle = "Done",
  doneDescription,
  errorTitle = "That didn't work",
  status: controlled,
  className,
}: ConfirmActionProps) {
  const [internal, setInternal] = React.useState<ConfirmActionStatus>("pending")
  const status = controlled ?? internal

  async function approve() {
    try {
      setInternal("working")
      await onApprove?.()
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
        action={
          onUndo
            ? {
                label: "Undo",
                onClick: () => {
                  onUndo()
                  setInternal("pending")
                },
              }
            : undefined
        }
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
        action={{ label: "Try again", onClick: approve }}
      />
    )
  }

  return (
    <InlineCard
      className={className}
      title={title}
      description={description}
      badge={{ label: "Needs approval", tone: "warning" }}
      fields={fields}
      columns={fields && fields.length > 2 ? 4 : 2}
      actions={[
        {
          label: status === "working" ? "Working…" : approveLabel,
          onClick: approve,
          disabled: status === "working",
        },
        { label: editLabel, onClick: onEditInChat, variant: "secondary" },
      ]}
    />
  )
}

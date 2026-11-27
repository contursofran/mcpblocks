import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { StatusUpdate, type StatusTone, type StatusUpdateProps } from "@/registry/mcpblocks/components/status-update"

const outcomes = {
  done: { title: "Done", tone: "success" },
  refused: { title: "Nothing was changed", tone: "info" },
  unknown: { title: "We couldn't confirm this went through", tone: "warning" },
  error: { title: "That didn't work", tone: "danger", description: "Nothing was changed." },
} satisfies Record<string, { title: string; tone: StatusTone; description?: string }>

export type OutcomeCardStatus = keyof typeof outcomes

export function OutcomeCard({
  status,
  title,
  description,
  className,
  ...props
}: Omit<StatusUpdateProps, "tone" | "title"> & { status: OutcomeCardStatus; title?: ReactNode }) {
  const outcome = outcomes[status]
  return (
    <StatusUpdate
      data-outcome={status}
      title={title === undefined ? outcome.title : title}
      description={description === undefined && "description" in outcome ? outcome.description : description}
      tone={outcome.tone}
      className={cn((status === "refused" || status === "unknown") && "[&_p]:whitespace-normal", className)}
      {...props}
    />
  )
}

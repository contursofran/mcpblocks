import { InlineCard } from "@/components/inline-card"
import { useHost } from "@/hooks/use-host"
import { useToolResult } from "@/hooks/use-tool-result"

export function RecordView() {
  const { app, error } = useHost()
  const { result } = useToolResult()

  if (error || result?.isError) return <p role="alert">The record could not be loaded.</p>
  if (!app || !result) return <p role="status">Loading record…</p>

  const record = result.structuredContent
  if (typeof record !== "object" || !record || !("name" in record) || typeof record.name !== "string") {
    return <p role="alert">The record is missing a name.</p>
  }
  const status = "status" in record && typeof record.status === "string" ? record.status : undefined
  return <InlineCard title={record.name} badge={status ? { label: status, tone: "info" } : undefined} />
}

import type { App } from "@modelcontextprotocol/ext-apps"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./styles.css"
import { ConfirmAction, type ConfirmActionStatus } from "@/components/confirm-action"
import { InlineCard } from "@/components/inline-card"
import { LineChart } from "@/components/line-chart"
import { ListView } from "@/components/list-view"
import { RowsSkeleton } from "@/components/skeleton"
import { McpHostProvider, useHost } from "@/hooks/use-host"
import { usePreparedWrite, type WriteOutcome } from "@/hooks/use-prepared-write"
import { useToolCall, type ToolCallOutcome } from "@/hooks/use-tool-call"
import { useToolResult } from "@/hooks/use-tool-result"
import type { DemoBlock } from "../shared/demo-blocks"
import { BlockPanelDemo, RegistryBlockDemo } from "./demo-blocks"

import type { Deal } from "../server/data"
type Payload =
  | { view: "deals"; deals: Deal[]; total: number }
  | { view: "deal"; deal: Deal }
  | { view: "confirm"; deal: Deal; next: Deal["stage"] }
  | { view: "refused"; deal: Deal; reason: string }
  | { view: "block"; block: DemoBlock }
  | { view: "block-panel"; block: DemoBlock }
  | { view: "trend"; labels: string[]; series: { name: string; values: number[] }[] }

const money = (n: number) => `$${n.toLocaleString("en-US")}`
const COLORS = ["#6366E9", "#835EEE", "#DA5597", "#2C84DB"]
const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2)

type Proposal = { deal: Deal; next: Deal["stage"] }

const confirmationStatus = {
  preview: "pending",
  confirming: "working",
  saved: "done",
  blocked: "refused",
  refused: "refused",
  unknown: "unknown",
  checking: "unknown",
} satisfies Record<string, ConfirmActionStatus>

function readReceipt(call: ToolCallOutcome, next: Deal["stage"]): WriteOutcome<Deal> {
  const result = call.kind === "result" || call.kind === "error" ? call.result : undefined
  const receipt = result?.structuredContent as { deal?: Deal; outcome?: "unchanged"; reason?: string } | undefined
  if (receipt?.outcome === "unchanged" && receipt.reason) return { kind: "refused", reason: receipt.reason }
  if (call.kind === "result" && receipt?.deal?.stage === next) {
    return { kind: "saved", result: receipt.deal, summary: `${receipt.deal.company} is now in ${next}.` }
  }
  return { kind: "unknown", reason: "This proposal has no confirmed receipt yet. You can check again." }
}

function DealStageView({ app, deal, next }: { app: App; deal: Deal; next?: Deal["stage"] }) {
  const propose = useToolCall("propose_stage_change")
  const execute = useToolCall("update_deal_stage")
  const reconcile = useToolCall("check_deal_stage_change")
  const write = usePreparedWrite<string, Proposal, Deal>({
    initialPreview: next ? { deal, next } : undefined,
    async prepare(id) {
      const outcome = await propose.call({ id })
      if (outcome.kind === "result") {
        const proposed = outcome.result.structuredContent as Payload | undefined
        if (proposed?.view === "confirm") return { kind: "preview", preview: proposed }
        if (proposed?.view === "refused") return { kind: "blocked", reason: proposed.reason }
      }
      return { kind: "blocked", reason: outcome.kind === "error" ? outcome.error.message : "Couldn't prepare the change." }
    },
    async execute({ preview, idempotencyKey }) {
      const outcome = await execute.call({
        id: preview.deal.id,
        expectedStage: preview.deal.stage,
        stage: preview.next,
        idempotencyKey,
      })
      return outcome.kind === "unavailable"
        ? { kind: "refused", reason: "The host cannot call the write tool." }
        : readReceipt(outcome, preview.next)
    },
    async reconcile({ preview, idempotencyKey }) {
      const outcome = await reconcile.call({ id: preview.deal.id, idempotencyKey })
      return readReceipt(outcome, preview.next)
    },
  })
  const { state } = write

  if (state.status === "idle" || state.status === "preparing") {
    return (
      <InlineCard
        title={deal.company}
        badge={{ label: deal.stage, tone: deal.stage === "Won" ? "success" : "info" }}
        description={deal.note}
        fields={[
          { label: "Value", value: money(deal.amount) },
          { label: "Close date", value: deal.closeDate },
          { label: "Contact", value: deal.contact },
          { label: "Email", value: deal.email },
        ]}
        actions={[
          {
            label: state.status === "preparing" ? "Preparing…" : "Move to next stage",
            disabled: !write.canClose || !propose.available,
            onClick: () => void write.prepare(deal.id),
          },
          {
            label: "Draft follow-up",
            variant: "secondary",
            onClick: () => void app.sendMessage({
              role: "user",
              content: [{ type: "text", text: `Draft a follow-up email to ${deal.contact} at ${deal.company}.` }],
            }),
          },
        ]}
      />
    )
  }

  const preview = "preview" in state ? state.preview : undefined
  const current = preview?.deal ?? deal
  const proposed = preview?.next
  return (
    <ConfirmAction
      title={proposed ? `Move ${current.company} to ${proposed}` : `Move ${current.company}`}
      subject={{ name: current.contact, detail: `${current.company} · ${money(current.amount)}` }}
      confirmLabel={proposed ? `Move to ${proposed}` : undefined}
      changePreview={proposed && <p>Stage <strong>{current.stage}</strong> → <strong>{proposed}</strong></p>}
      details={{ heading: "This will", items: [`Keep the ${current.closeDate} close date`] }}
      doneTitle={state.status === "saved" ? `${state.result.company} moved to ${state.result.stage}` : undefined}
      doneDescription="Deal stage · just now"
      status={confirmationStatus[state.status]}
      refusedDescription={state.status === "blocked" || state.status === "refused" ? state.reason : undefined}
      unknownDescription={state.status === "checking" ? "Looking up the proposal receipt…" : state.status === "unknown" ? state.reason : undefined}
      onCheckAgain={state.status === "unknown" ? () => void write.checkAgain() : undefined}
      onConfirm={write.confirm}
    />
  )
}

function Root() {
  const { app, error } = useHost()
  const { result } = useToolResult()
  const payload = result?.structuredContent as Payload | undefined

  if (error) return <p className="p-4 text-sm">Couldn't connect: {error.message}</p>
  if (result?.isError) {
    return <p className="p-4 text-sm text-host-danger-fg">{result.content?.find((block) => block.type === "text")?.text ?? "Something went wrong."}</p>
  }
  if (!app || !payload) return <RowsSkeleton rows={3} columns={3} />

  const ask = (text: string) => app.sendMessage({ role: "user", content: [{ type: "text", text }] })

  switch (payload.view) {
    case "block":
      return <RegistryBlockDemo key={payload.block} block={payload.block} />
    case "block-panel":
      return <BlockPanelDemo key={payload.block} initialBlock={payload.block} />
    case "deals":
      return (
        <ListView
          items={payload.deals.map((d, i) => ({
            id: d.id,
            initials: initials(d.contact),
            avatarColor: COLORS[i % COLORS.length],
            title: d.company,
            meta: d.stage,
            timestamp: money(d.amount),
            body: d.note,
            onClick: () => void ask(`Show me the ${d.company} deal (${d.id}).`),
          }))}
          summary={`Showing ${payload.deals.length} of ${payload.total} deals`}
        />
      )
    case "deal":
      return <DealStageView key={payload.deal.id} app={app} deal={payload.deal} />
    case "confirm":
      return <DealStageView key={`${payload.deal.id}:${payload.next}`} app={app} deal={payload.deal} next={payload.next} />
    case "refused":
      return (
        <ConfirmAction
          title={`Move ${payload.deal.company}`}
          subject={{ name: payload.deal.company }}
          status="refused"
          refusedDescription={payload.reason}
        />
      )
    case "trend":
      return (
        <LineChart
          title="Pipeline and closed-won revenue"
          labels={payload.labels}
          series={payload.series}
          labelEvery={1}
          formatValue={(v) => `$${v}k`}
        />
      )
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <McpHostProvider
      appInfo={{ name: "mcpblocks deal app", version: "0.1.0" }}
      capabilities={{ availableDisplayModes: ["inline", "fullscreen"] }}
    >
      <Root />
    </McpHostProvider>
  </StrictMode>,
)

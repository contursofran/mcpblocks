import type { CallToolResult } from "@modelcontextprotocol/client"
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import type { App } from "@modelcontextprotocol/ext-apps"
import { StrictMode, useEffect, useState } from "react"
import { createRoot } from "react-dom/client"

import "./styles.css"
import { ConfirmAction, type ConfirmActionStatus } from "@/components/confirm-action"
import { InlineCard } from "@/components/inline-card"
import { LineChart } from "@/components/line-chart"
import { ListView } from "@/components/list-view"
import { RowsSkeleton } from "@/components/skeleton"
import { applyHostContext, tellModel } from "@/lib/host"

type Deal = { id: string; company: string; contact: string; email: string; stage: string; amount: number; closeDate: string; note: string }
type Payload =
  | { view: "deals"; deals: Deal[]; total: number }
  | { view: "deal"; deal: Deal }
  | { view: "confirm"; deal: Deal; next: string }
  | { view: "refused"; deal: Deal; reason: string }
  | { view: "trend"; labels: string[]; series: { name: string; values: number[] }[] }

const money = (n: number) => `$${n.toLocaleString("en-US")}`
const COLORS = ["#6366E9", "#835EEE", "#DA5597", "#2C84DB"]
const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2)

function DealConfirmation({ app, deal, next }: { app: App; deal: Deal; next: string }) {
  const [status, setStatus] = useState<ConfirmActionStatus>("pending")
  const [checking, setChecking] = useState(false)
  const [refusedDescription, setRefusedDescription] = useState<string>()
  const [unknownDescription, setUnknownDescription] = useState("Check the current deal stage before taking another action.")

  function markDone() {
    setStatus("done")
    void tellModel(app, `${deal.company} is now in ${next}.`)
  }

  async function confirm() {
    setStatus("working")
    try {
      const result = await app.callServerTool({
        name: "update_deal_stage", arguments: { id: deal.id, expectedStage: deal.stage, stage: next },
      })
      const outcome = result.structuredContent as { outcome?: "unchanged"; reason?: string; deal?: Deal } | undefined
      if (outcome?.outcome === "unchanged") {
        setRefusedDescription(outcome.reason)
        setStatus("refused")
      } else if (!result.isError && outcome?.deal?.stage === next) {
        markDone()
      } else {
        setStatus("unknown")
      }
    } catch {
      setStatus("unknown")
    }
  }

  async function checkAgain() {
    setChecking(true)
    try {
      const result = await app.callServerTool({ name: "show_deal", arguments: { id: deal.id } })
      const current = result.structuredContent as Extract<Payload, { view: "deal" }> | undefined
      if (!result.isError && current?.deal?.stage === next) {
        markDone()
      } else {
        setUnknownDescription("The proposed stage is still unconfirmed.")
      }
    } catch {
      setUnknownDescription("The deal could not be checked. You can check again.")
    } finally {
      setChecking(false)
    }
  }

  return (
    <ConfirmAction
      title={`Move ${deal.company} to ${next}`}
      subject={{ name: deal.contact, detail: `${deal.company} · ${money(deal.amount)}` }}
      confirmLabel={`Move to ${next}`}
      changePreview={<p>Stage <strong>{deal.stage}</strong> → <strong>{next}</strong></p>}
      details={{ heading: "This will", items: [`Keep the ${deal.closeDate} close date`] }}
      doneTitle={`${deal.company} moved to ${next}`}
      doneDescription="Deal stage · just now"
      status={status}
      refusedDescription={refusedDescription}
      unknownDescription={checking ? "Checking the current stage…" : unknownDescription}
      onCheckAgain={checking ? undefined : () => void checkAgain()}
      onConfirm={confirm}
    />
  )
}

function Root() {
  const [payload, setPayload] = useState<Payload | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { app, error: connectError } = useApp({
    appInfo: { name: "mcpblocks deal app", version: "0.1.0" },
    capabilities: {},
    onAppCreated: (app) => {
      // Register handlers before connect(): the host may send the result immediately.
      app.ontoolresult = async (result: CallToolResult) => {
        if (result.isError) {
          const text = result.content?.find((c) => c.type === "text")
          setError(text && "text" in text ? text.text : "Something went wrong.")
          return
        }
        setPayload(result.structuredContent as Payload)
      }
      app.onhostcontextchanged = () => applyHostContext(app.getHostContext())
    },
  })

  useEffect(() => {
    if (app) applyHostContext(app.getHostContext())
  }, [app])

  if (connectError) return <p className="p-4 text-sm">Couldn't connect: {connectError.message}</p>
  if (error) return <p className="p-4 text-sm text-host-danger-fg">{error}</p>
  if (!app || !payload) return <RowsSkeleton rows={3} columns={3} />

  const ask = (text: string) => app.sendMessage({ role: "user", content: [{ type: "text", text }] })

  switch (payload.view) {
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
    case "deal": {
      const d = payload.deal
      return (
        <InlineCard
          title={d.company}
          badge={{ label: d.stage, tone: d.stage === "Won" ? "success" : "info" }}
          description={d.note}
          fields={[
            { label: "Value", value: money(d.amount) },
            { label: "Close date", value: d.closeDate },
            { label: "Contact", value: d.contact },
            { label: "Email", value: d.email },
          ]}
          actions={[
            {
              label: "Move to next stage",
              // Claude blocks mutating requests that arrive as app-sent chat messages, so go
              // straight to the server and show the confirmation in this same view.
              onClick: async () => {
                const res = await app.callServerTool({ name: "propose_stage_change", arguments: { id: d.id } })
                if (res.isError) return setError(res.content?.find((c) => c.type === "text" && "text" in c)?.text ?? "Couldn't propose the change.")
                setPayload(res.structuredContent as Payload)
              },
            },
            { label: "Draft follow-up", variant: "secondary", onClick: () => void ask(`Draft a follow-up email to ${d.contact} at ${d.company}.`) },
          ]}
        />
      )
    }
    case "confirm": {
      const { deal, next } = payload
      return <DealConfirmation key={`${deal.id}:${next}`} app={app} deal={deal} next={next} />
    }
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
    <Root />
  </StrictMode>,
)

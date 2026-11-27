import type { Meta, StoryObj } from "@storybook/react-vite"
import { useMemo, useState } from "react"

import { buildHostContext, insetsFor, type PreviewMode, type PreviewTheme } from "@/lib/host-context"
import { ConfirmAction, type ConfirmActionStatus } from "@/registry/mcpblocks/components/confirm-action"
import { FakeHost } from "@/registry/mcpblocks/hooks/fake-host"
import { useHost } from "@/registry/mcpblocks/hooks/use-host"
import { usePreparedWrite, type WriteOutcome } from "@/registry/mcpblocks/hooks/use-prepared-write"
import { useToolCall, type ToolCallOutcome } from "@/registry/mcpblocks/hooks/use-tool-call"
import { fakeHostCapabilities, toolStub, type HostRequest } from "@/registry/mcpblocks/lib/host-harness"

const scenarios = ["success", "error", "refused", "unknown", "timeout", "slow"] as const
type Scenario = typeof scenarios[number]

const status = {
  idle: "pending",
  preparing: "working",
  preview: "pending",
  blocked: "refused",
  confirming: "working",
  saved: "done",
  refused: "refused",
  unknown: "unknown",
  checking: "unknown",
} satisfies Record<string, ConfirmActionStatus>

function readOutcome(outcome: ToolCallOutcome): WriteOutcome<string> {
  if (outcome.kind === "unavailable") return { kind: "refused", reason: "This host does not offer tool calls." }
  if (outcome.kind === "result") {
    const data = outcome.result.structuredContent
    if (typeof data === "object" && data !== null && "outcome" in data) {
      if (data.outcome === "success") return { kind: "saved", result: "Negotiation", summary: "Northwind Traders moved to Negotiation." }
      if (data.outcome === "refused") return { kind: "refused", reason: "The original stage changed." }
    }
  }
  return { kind: "unknown" }
}

function PreparedDeal() {
  const { app, error } = useHost()
  const execute = useToolCall("update_deal")
  const reconcile = useToolCall("check_proposal")
  const proposal = usePreparedWrite({
    initialPreview: "Negotiation",
    prepare: async () => ({ kind: "preview", preview: "Negotiation" }),
    execute: async ({ idempotencyKey }) => readOutcome(await execute.call({ idempotencyKey }, { timeoutMs: 2500 })),
    reconcile: async ({ idempotencyKey }) => readOutcome(await reconcile.call({ idempotencyKey })),
  })
  const { state } = proposal

  if (error) return <p role="alert">{error.message}</p>
  if (!app) return <p role="status">Connecting to the mock host…</p>
  return (
    <ConfirmAction
      title="Move Northwind Traders to Negotiation"
      subject={{ name: "Northwind Traders", detail: "Deal stage" }}
      changePreview={<p>Stage <strong>Proposal</strong> → <strong>Negotiation</strong></p>}
      status={status[state.status]}
      doneTitle="Northwind Traders moved to Negotiation"
      refusedDescription={state.status === "refused" ? state.reason : undefined}
      unknownDescription={state.status === "checking" ? "Checking the proposal receipt…" : "Look up the original proposal receipt."}
      onConfirm={proposal.confirm}
      onCheckAgain={state.status === "unknown" ? () => void proposal.checkAgain() : undefined}
    />
  )
}

type HostStoryProps = {
  scenario: Scenario
  theme?: PreviewTheme
  mode?: PreviewMode
  width?: string
  safeAreas?: string
  missingCapability?: string
}

function HostStory({ scenario, theme = "light", mode = "inline", width = "auto", safeAreas = "auto", missingCapability }: HostStoryProps) {
  const [requests, setRequests] = useState<HostRequest[]>([])
  const tools = useMemo(() => ({
    update_deal: scenario === "slow" ? toolStub({ kind: "success", delayMs: 1200 }) : toolStub({ kind: scenario }),
    check_proposal: toolStub({ kind: "success" }),
  }), [scenario])
  const capabilities = useMemo(() => {
    if (missingCapability === "none") return {}
    const advertised = { ...fakeHostCapabilities }
    if (missingCapability && missingCapability in advertised) delete advertised[missingCapability as keyof typeof advertised]
    return advertised
  }, [missingCapability])
  const availableWidth = width === "auto"
    ? ({ inline: 712, "side-panel": 600, fullscreen: 960 })[mode]
    : Number.parseInt(width)
  const context = useMemo(() => {
    const device = availableWidth <= 375 ? "mobile" : "web"
    const hostContext = buildHostContext({ theme, mode, device })
    return {
      ...hostContext,
      containerDimensions: { ...hostContext.containerDimensions, width: availableWidth },
      safeAreaInsets: safeAreas === "none" ? { top: 0, right: 0, bottom: 0, left: 0 }
        : safeAreas === "mobile" ? insetsFor("mobile", mode)
          : hostContext.safeAreaInsets,
    }
  }, [availableWidth, mode, safeAreas, theme])

  return (
    <div className="mx-auto min-w-0 max-w-full space-y-4" style={{ width: availableWidth }}>
      <FakeHost
        className="rounded-host-xl border border-host-border-secondary bg-host-bg text-host-fg"
        capabilities={capabilities}
        context={context}
        tools={tools}
        onRequest={(event) => setRequests((previous) => [...previous.slice(-19), event])}
      >
        <div className="pt-[var(--mb-safe-top)] pr-[var(--mb-safe-right)] pb-[var(--mb-safe-bottom)] pl-[var(--mb-safe-left)]">
          <PreparedDeal />
        </div>
      </FakeHost>
      <details className="rounded-md border border-host-border-secondary p-3 text-sm">
        <summary>Host requests ({requests.length})</summary>
        <pre className="max-h-48 overflow-auto py-2 text-xs">{JSON.stringify(requests, null, 2)}</pre>
      </details>
    </div>
  )
}

const meta = {
  title: "Protocol/Prepared write",
  component: HostStory,
  parameters: { fakeHost: true },
  args: { scenario: "success" },
  argTypes: { scenario: { control: "select", options: scenarios } },
  render: (args, { globals }) => (
    <HostStory
      key={`${args.scenario}:${globals.capabilities}`}
      {...args}
      theme={globals.theme}
      mode={globals.displayMode}
      width={globals.width}
      safeAreas={globals.safeAreas}
      missingCapability={globals.capabilities}
    />
  ),
} satisfies Meta<typeof HostStory>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {}
export const Slow: Story = { args: { scenario: "slow" } }
export const Refused: Story = { args: { scenario: "refused" } }
export const Error: Story = { args: { scenario: "error" } }
export const Timeout: Story = { args: { scenario: "timeout" } }
export const Unknown: Story = { args: { scenario: "unknown" } }

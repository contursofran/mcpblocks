import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server"
import { McpServer, type CallToolResult } from "@modelcontextprotocol/server"
import * as z from "zod/v4"
import { DEMO_BLOCKS, type DemoBlock } from "../shared/demo-blocks.js"
import { deals, nextStage, STAGES, trend, type Deal, type Stage } from "./data.js"

// The same bundle renders both resources. Their URIs keep the host's
// placement preferences independent.
const VIEW_URI = "ui://deal-app/view.html"
const PANEL_URI = "ui://deal-app/block-panel.html"
const ui = { resourceUri: VIEW_URI }

// The View already shows the data, so tell the model not to repeat it as text or a table.
const SHOWN =
  "The user can already see this in an interactive view above. Do not repeat or tabulate it; reply with at most one short sentence, or answer their question."

const fail = (text: string): CallToolResult => ({ isError: true, content: [{ type: "text", text }] })
const unchanged = (reason: string): CallToolResult => ({ ...fail(reason), structuredContent: { outcome: "unchanged", reason } })
const money = (n: number) => `$${n.toLocaleString("en-US")}`
const blockInput = z.object({ block: z.enum(DEMO_BLOCKS) })
const readOnlySample = { readOnlyHint: true, destructiveHint: false, openWorldHint: false }

// The demo's deals and receipts share the same process-local lifetime.
const stageReceipts = new Map<string, { deal: Deal; expectedStage?: Stage }>()
const stageReceiptResult = (deal: Deal): CallToolResult => ({
  content: [{ type: "text", text: `${deal.company} moved to ${deal.stage}.` }],
  structuredContent: { deal },
})

function blockPreview(block: DemoBlock, view: "block" | "block-panel"): CallToolResult {
  return {
    content: [{ type: "text", text: `Showing the ${block} sample. ${SHOWN}` }],
    structuredContent: { view, block },
  }
}

/**
 * `loadView` returns the bundled View (dist/view.html). It is injected so the same server
 * runs on Node (reads the file) and on Cloudflare Workers (the file is bundled into the Worker).
 */
export function createServer(loadView: () => Promise<string>): McpServer {
  const server = new McpServer({ name: "mcpblocks deal app", version: "0.1.0" })

  registerAppTool(
    server,
    "show_block",
    {
      title: "Show a registry block",
      description: "Preview one MCP Blocks UI component by registry name using fixed sample data. Use skeleton to hold a loading example on screen.",
      inputSchema: blockInput,
      annotations: readOnlySample,
      _meta: { ui },
    },
    async ({ block }) => blockPreview(block, "block"),
  )

  registerAppTool(
    server,
    "open_block_panel",
    {
      title: "Open a registry block in a side panel",
      description: "Preview an MCP Blocks UI component by registry name in a side panel when the host supports it. Uses fixed sample data.",
      inputSchema: blockInput,
      annotations: readOnlySample,
      _meta: { ui: { resourceUri: PANEL_URI } },
    },
    async ({ block }) => blockPreview(block, "block-panel"),
  )

  registerAppTool(
    server,
    "list_deals",
    {
      title: "List deals",
      description: "Show open deals as a list. Optionally filter by pipeline stage.",
      inputSchema: z.object({ stage: z.enum(STAGES).optional() }),
      _meta: { ui },
    },
    async ({ stage }): Promise<CallToolResult> => {
      const rows = deals.filter((d) => !stage || d.stage === stage)
      return {
        // `content` is what the model reads; `structuredContent` is for the View.
        content: [{ type: "text", text: rows.length ? `Showing ${rows.length} deal(s), ids ${rows.map((d) => d.id).join(", ")}. ${SHOWN}` : "No deals match." }],
        structuredContent: { view: "deals", deals: rows, total: deals.length },
      }
    },
  )

  registerAppTool(
    server,
    "show_deal",
    {
      title: "Show deal",
      description: "Show a summary card for one deal.",
      inputSchema: z.object({ id: z.string().describe("Deal id, e.g. d1") }),
      _meta: { ui },
    },
    async ({ id }): Promise<CallToolResult> => {
      const deal = deals.find((d) => d.id === id)
      if (!deal) return fail(`No deal with id ${id}`)
      return {
        content: [{ type: "text", text: `Showing the ${deal.company} deal card (${deal.stage}, ${money(deal.amount)}, closes ${deal.closeDate}). ${SHOWN}` }],
        structuredContent: { view: "deal", deal },
      }
    },
  )

  registerAppTool(
    server,
    "propose_stage_change",
    {
      title: "Propose stage change",
      description: "Ask the user to confirm moving a deal to its next pipeline stage. Does not change anything until they confirm.",
      inputSchema: z.object({ id: z.string() }),
      _meta: { ui },
    },
    async ({ id }): Promise<CallToolResult> => {
      const deal = deals.find((d) => d.id === id)
      if (!deal) return fail(`No deal with id ${id}`)
      const next = nextStage(deal.stage)
      if (!next) {
        const reason = `${deal.company} is already in the last stage.`
        return {
          content: [{ type: "text", text: `${reason} Nothing was changed.` }],
          structuredContent: { view: "refused", deal, reason },
        }
      }
      return {
        content: [{ type: "text", text: `Showing a confirmation to move ${deal.company} from ${deal.stage} to ${next}; nothing changes until the user presses the button. ${SHOWN}` }],
        structuredContent: { view: "confirm", deal, next },
      }
    },
  )

  // App-only tool: the View calls it after the user presses Confirm. Hidden from the model.
  registerAppTool(
    server,
    "update_deal_stage",
    {
      title: "Update deal stage",
      description: "Set a deal's stage. Called by the confirmation view.",
      inputSchema: z.object({
        id: z.string(),
        stage: z.enum(STAGES),
        expectedStage: z.enum(STAGES).optional(),
        idempotencyKey: z.uuid().optional(),
      }),
      _meta: { ui: { ...ui, visibility: ["app"] } },
    },
    async ({ id, stage, expectedStage, idempotencyKey }): Promise<CallToolResult> => {
      const receipt = idempotencyKey && stageReceipts.get(idempotencyKey)
      if (receipt) {
        if (receipt.deal.id !== id || receipt.deal.stage !== stage || receipt.expectedStage !== expectedStage) {
          return unchanged("This key belongs to a different proposal.")
        }
        return stageReceiptResult(receipt.deal)
      }
      const deal = deals.find((d) => d.id === id)
      if (!deal) return unchanged(`No deal with id ${id}`)
      if (idempotencyKey && !expectedStage) return unchanged("A confirmed proposal must specify the original deal stage.")
      if (expectedStage && nextStage(expectedStage) !== stage) return unchanged("This proposal is no longer valid.")
      if (expectedStage && deal.stage !== expectedStage && (idempotencyKey || deal.stage !== stage)) {
        return unchanged("The deal stage changed after this proposal was prepared.")
      }
      deal.stage = stage
      if (idempotencyKey) stageReceipts.set(idempotencyKey, { deal: { ...deal }, expectedStage })
      return stageReceiptResult(deal)
    },
  )

  registerAppTool(
    server,
    "check_deal_stage_change",
    {
      title: "Check deal stage change",
      description: "Look up the receipt for a confirmed proposal without writing again.",
      inputSchema: z.object({ id: z.string(), idempotencyKey: z.uuid() }),
      annotations: readOnlySample,
      _meta: { ui: { ...ui, visibility: ["app"] } },
    },
    async ({ id, idempotencyKey }): Promise<CallToolResult> => {
      const receipt = stageReceipts.get(idempotencyKey)
      if (receipt?.deal.id === id) return stageReceiptResult(receipt.deal)
      return { content: [{ type: "text", text: "The proposal has no confirmed receipt." }], structuredContent: { outcome: "unknown" } }
    },
  )

  registerAppTool(
    server,
    "pipeline_trend",
    {
      title: "Pipeline trend",
      description: "Chart pipeline value and closed-won revenue over the last six months.",
      inputSchema: z.object({}),
      _meta: { ui },
    },
    async (): Promise<CallToolResult> => ({
      content: [{ type: "text", text: `Showing a pipeline chart: pipeline grew from $${trend.series[0].values[0]}k to $${trend.series[0].values.at(-1)}k over six months. ${SHOWN}` }],
      structuredContent: { view: "trend", ...trend },
    }),
  )

  function registerView(name: string, uri: string, preferredDisplayMode?: "fullscreen") {
    const _meta = {
      ui: {
        prefersBorder: false,
        // Claude reads this preference from resources/read and decides where to open the view.
        ...(preferredDisplayMode ? { preferredDisplayMode } : {}),
      },
    }
    registerAppResource(server, name, uri, { mimeType: RESOURCE_MIME_TYPE, _meta }, async () => ({
      contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: await loadView(), _meta }],
    }))
  }

  registerView("Deal app view", VIEW_URI)
  registerView("Registry block side panel", PANEL_URI, "fullscreen")

  return server
}

import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server"
import { McpServer, type CallToolResult } from "@modelcontextprotocol/server"
import * as z from "zod/v4"
import { DEMO_BLOCKS } from "../shared/demo-blocks.js"
import { deals, nextStage, STAGES, trend } from "./data.js"

// One View serves every tool: it reads `structuredContent.view` and renders the
// matching block. Tools can also point at separate resources if you prefer.
const VIEW_URI = "ui://deal-app/view.html"
const ui = { resourceUri: VIEW_URI }

// The View already shows the data, so tell the model not to repeat it as text or a table.
const SHOWN =
  "The user can already see this in an interactive view above. Do not repeat or tabulate it; reply with at most one short sentence, or answer their question."

const fail = (text: string): CallToolResult => ({ isError: true, content: [{ type: "text", text }] })
const unchanged = (reason: string): CallToolResult => ({ ...fail(reason), structuredContent: { outcome: "unchanged", reason } })
const money = (n: number) => `$${n.toLocaleString("en-US")}`

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
      inputSchema: z.object({ block: z.enum(DEMO_BLOCKS) }),
      annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
      _meta: { ui },
    },
    async ({ block }): Promise<CallToolResult> => ({
      content: [{ type: "text", text: `Showing the ${block} sample. ${SHOWN}` }],
      structuredContent: { view: "block", block },
    }),
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
      inputSchema: z.object({ id: z.string(), stage: z.enum(STAGES), expectedStage: z.enum(STAGES).optional() }),
      _meta: { ui: { ...ui, visibility: ["app"] } },
    },
    async ({ id, stage, expectedStage }): Promise<CallToolResult> => {
      const deal = deals.find((d) => d.id === id)
      if (!deal) return unchanged(`No deal with id ${id}`)
      if (expectedStage && nextStage(expectedStage) !== stage) return unchanged("This proposal is no longer valid.")
      if (expectedStage && ![expectedStage, stage].includes(deal.stage)) {
        return unchanged("The deal stage changed after this proposal was prepared.")
      }
      deal.stage = stage
      return { content: [{ type: "text", text: `${deal.company} moved to ${stage}.` }], structuredContent: { deal } }
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

  registerAppResource(server, "Deal app view", VIEW_URI, { mimeType: RESOURCE_MIME_TYPE }, async () => ({
    contents: [
      {
        uri: VIEW_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: await loadView(),
        // Blocks draw their own borders, so ask the host not to add another.
        _meta: { ui: { prefersBorder: false } },
      },
    ],
  }))

  return server
}

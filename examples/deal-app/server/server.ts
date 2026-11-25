import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server"
import { McpServer, type CallToolResult } from "@modelcontextprotocol/server"
import * as z from "zod/v4"
import { deals, nextStage, STAGES, trend } from "./data.js"

// One View serves every tool: it reads `structuredContent.view` and renders the
// matching block. Tools can also point at separate resources if you prefer.
const VIEW_URI = "ui://deal-app/view.html"
const ui = { resourceUri: VIEW_URI }

const fail = (text: string): CallToolResult => ({ isError: true, content: [{ type: "text", text }] })
const money = (n: number) => `$${n.toLocaleString("en-US")}`

/**
 * `loadView` returns the bundled View (dist/view.html). It is injected so the same server
 * runs on Node (reads the file) and on Cloudflare Workers (the file is bundled into the Worker).
 */
export function createServer(loadView: () => Promise<string>): McpServer {
  const server = new McpServer({ name: "mcpblocks deal app", version: "0.1.0" })

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
        content: [{ type: "text", text: rows.map((d) => `${d.id}: ${d.company} (${d.stage}, ${money(d.amount)})`).join("\n") || "No deals." }],
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
        content: [{ type: "text", text: `${deal.company}: ${deal.stage}, ${money(deal.amount)}, closes ${deal.closeDate}. ${deal.note}` }],
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
      if (!next) return fail(`${deal.company} is already in the last stage.`)
      return {
        content: [{ type: "text", text: `Waiting for the user to confirm moving ${deal.company} from ${deal.stage} to ${next}.` }],
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
      inputSchema: z.object({ id: z.string(), stage: z.enum(STAGES) }),
      _meta: { ui: { ...ui, visibility: ["app"] } },
    },
    async ({ id, stage }): Promise<CallToolResult> => {
      const deal = deals.find((d) => d.id === id)
      if (!deal) return fail(`No deal with id ${id}`)
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
      content: [{ type: "text", text: `Pipeline grew from $${trend.series[0].values[0]}k to $${trend.series[0].values.at(-1)}k over six months.` }],
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

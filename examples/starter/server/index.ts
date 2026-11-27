import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"

import { createMcpExpressApp } from "@modelcontextprotocol/express"
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server"
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node"
import { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"

const view = await readFile(new URL("../dist/view.html", import.meta.url), "utf8")
const revision = createHash("sha256").update(view).digest("hex").slice(0, 12)
const uri = `ui://record-summary/view-${revision}.html`
const csp = { resourceDomains: ["https://assets.claude.ai"], connectDomains: [] }

function createServer() {
  const server = new McpServer({ name: "Record summary", version: "0.1.0" })
  registerAppTool(server, "show_record", {
    title: "Show record",
    description: "Show a read-only sample record.",
    inputSchema: z.object({}),
    annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
    _meta: { ui: { resourceUri: uri } },
  }, async () => ({
    content: [{ type: "text", text: "Northwind renewal · In review" }],
    structuredContent: { name: "Northwind renewal", status: "In review" },
  }))
  registerAppResource(server, "Record summary", uri, { mimeType: RESOURCE_MIME_TYPE }, async () => ({
    contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: view, _meta: { ui: { csp } } }],
  }))
  return server
}

const host = "127.0.0.1"
const app = createMcpExpressApp({ host })
app.all("/mcp", async (req, res) => {
  const server = createServer()
  const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
  res.on("close", () => {
    void transport.close().catch(() => {})
    void server.close().catch(() => {})
  })
  try {
    await server.connect(transport)
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    console.error(error)
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", id: null, error: { code: -32603, message: "Internal server error" } })
    }
  }
})

const port = Number(process.env.PORT ?? 3001)
app.listen(port, host, () => console.log(`MCP endpoint at http://${host}:${port}/mcp`))

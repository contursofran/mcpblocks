import { createMcpExpressApp } from "@modelcontextprotocol/express"
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import cors from "cors"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createServer as createDealServer, maxRequestBodySize } from "./server.js"

const viewPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist/view.html")
const createServer = () => createDealServer(() => fs.readFile(viewPath, "utf-8"))

if (process.argv.includes("--stdio")) {
  await createServer().connect(new StdioServerTransport())
} else {
  const port = Number(process.env.PORT ?? 3001)
  const app = createMcpExpressApp({ host: "0.0.0.0", jsonLimit: `${maxRequestBodySize}b` })
  app.use(cors())

  // Stateless: a fresh server + transport per request.
  app.all("/mcp", async (req, res) => {
    const server = createServer()
    const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined, maxRequestBodySize })
    res.on("close", () => {
      transport.close().catch(() => {})
      server.close().catch(() => {})
    })
    try {
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
    } catch (error) {
      console.error("MCP error:", error)
      if (!res.headersSent) {
        res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal server error" }, id: null })
      }
    }
  })

  app.listen(port, () => console.log(`MCP server listening on http://localhost:${port}/mcp`))
}

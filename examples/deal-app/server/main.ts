import { createMcpExpressApp } from "@modelcontextprotocol/express"
import { NodeStreamableHTTPServerTransport } from "@modelcontextprotocol/node"
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio"
import cors from "cors"
import { createServer } from "./server.js"

if (process.argv.includes("--stdio")) {
  await createServer().connect(new StdioServerTransport())
} else {
  const port = Number(process.env.PORT ?? 3001)
  const app = createMcpExpressApp({ host: "0.0.0.0" })
  app.use(cors())

  // Stateless: a fresh server + transport per request.
  app.all("/mcp", async (req, res) => {
    const server = createServer()
    const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined })
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

// Cloudflare Worker entry: serves the Deal app MCP server at /mcp on the same host as the
// static docs site (see wrangler.jsonc: assets.run_worker_first).
import { createMcpHandler } from "@modelcontextprotocol/server"
import viewHtml from "../dist/view.html"
import { createServer, maxRequestBodySize } from "../server/server.js"

const handler = createMcpHandler(() => createServer(async () => viewHtml), { maxRequestBodySize })

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, DELETE, OPTIONS",
  "access-control-allow-headers": "*",
  "access-control-expose-headers": "mcp-session-id, mcp-protocol-version",
}

export default {
  async fetch(request: Request): Promise<Response> {
    // Cloudflare calls the Worker when no static asset matches the URL.
    const { pathname } = new URL(request.url)
    if (pathname !== "/mcp" && !pathname.startsWith("/mcp/")) {
      return new Response(null, { status: 404 })
    }

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors })
    const res = await handler.fetch(request)
    const out = new Response(res.body, res)
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v)
    return out
  },
}

import { InMemoryTransport, type CallToolResult } from "@modelcontextprotocol/client"
import { AppBridge, type McpUiHostCapabilities, type McpUiHostContext } from "@modelcontextprotocol/ext-apps/app-bridge"

export type FakeTool = (args: Record<string, unknown>) => CallToolResult | Promise<CallToolResult>

export const fakeHostCapabilities: McpUiHostCapabilities = {
  serverTools: {},
  updateModelContext: { text: {}, structuredContent: {} },
  message: { text: {} },
  openLinks: {},
}

export type FakeHostOptions = {
  context?: McpUiHostContext
  capabilities?: McpUiHostCapabilities
  tools?: Record<string, FakeTool>
  onRequest?: (event: HostRequest) => void
}

export type HostRequest = { method: string; params: unknown }

export function toolStub({
  kind,
  delayMs = 0,
}: {
  kind: "success" | "error" | "refused" | "unknown" | "timeout"
  delayMs?: number
}): FakeTool {
  return async (args) => {
    if (kind === "timeout") return new Promise(() => {})
    if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs))
    if (kind === "error") return { isError: true, content: [{ type: "text", text: "The tool failed." }] }
    return { content: [], structuredContent: { ...args, outcome: kind } }
  }
}

let nextHostId = 0

/** Exercise the actual MCP Apps handshake over an in-memory transport. */
export function createFakeHost({ context, capabilities = fakeHostCapabilities, tools = {}, onRequest }: FakeHostOptions = {}) {
  const [viewTransport, hostTransport] = InMemoryTransport.createLinkedPair()
  const bridge = new AppBridge(null, { name: "MCP Blocks test host", version: "1.0.0" }, capabilities, { hostContext: context })
  const requests: HostRequest[] = []
  let currentContext = context ?? {}

  function setContext(update: McpUiHostContext) {
    currentContext = { ...currentContext, ...update }
    bridge.setHostContext(currentContext)
  }

  function record(method: string, params: unknown) {
    const event = { method, params }
    requests.push(event)
    onRequest?.(event)
  }

  bridge.oncalltool = async (params) => {
    record("tools/call", params)
    const tool = tools[params.name]
    if (!tool) return { isError: true, content: [{ type: "text", text: `Unknown tool: ${params.name}` }] }
    return tool(params.arguments ?? {})
  }
  bridge.onopenlink = async (params) => { record("ui/open-link", params); return {} }
  bridge.onmessage = async (params) => { record("ui/message", params); return {} }
  bridge.onupdatemodelcontext = async (params) => { record("ui/update-model-context", params); return {} }
  bridge.onsizechange = (params) => record("ui/notifications/size-changed", params)
  bridge.onrequestdisplaymode = async (params) => {
    record("ui/request-display-mode", params)
    if (currentContext.availableDisplayModes && !currentContext.availableDisplayModes.includes(params.mode)) {
      return { mode: currentContext.displayMode ?? "inline" }
    }
    setContext({ displayMode: params.mode })
    return { mode: params.mode }
  }
  const ready = bridge.connect(hostTransport)

  return { id: ++nextHostId, bridge, ready, requests, setContext, createTransport: () => viewTransport }
}

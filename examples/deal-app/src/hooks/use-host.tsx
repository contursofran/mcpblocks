"use client"

import type { Implementation, Transport } from "@modelcontextprotocol/client"
import { App, type McpUiAppCapabilities, type McpUiDisplayMode, type McpUiHostCapabilities, type McpUiHostContext } from "@modelcontextprotocol/ext-apps"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { applyHostContext } from "@/lib/host"
import { ToolNotificationsContext, type ToolNotifications } from "@/hooks/use-tool-result"

type HostConnection = {
  app: App | null
  context?: McpUiHostContext
  capabilities?: McpUiHostCapabilities
  platform?: McpUiHostContext["platform"]
  error: Error | null
  requestDisplayMode: (mode: McpUiDisplayMode) => Promise<McpUiDisplayMode | undefined>
}

type HostOptions = {
  appInfo: Implementation
  capabilities?: McpUiAppCapabilities
  autoResize?: boolean
  /** Apply host styles inside an embedded preview. Defaults to the document. */
  styleTarget?: HTMLElement
  /** Create a fresh transport for a connection. Defaults to the host iframe. */
  createTransport?: () => Transport
}

const HostContext = createContext<HostConnection | null>(null)
const disconnected: HostConnection = {
  app: null,
  error: null,
  requestDisplayMode: async () => undefined,
}

/** Mount one provider for a view. Connection options are read on mount. */
export function McpHostProvider({ children, ...options }: HostOptions & { children: ReactNode }) {
  const [configuration] = useState(options)
  const [connection, setConnection] = useState(disconnected)
  const [notifications, setNotifications] = useState<ToolNotifications>({})

  useEffect(() => {
    const app = new App(configuration.appInfo, configuration.capabilities, { autoResize: configuration.autoResize ?? true })
    const abort = new AbortController()
    let connected = false
    let context: McpUiHostContext | undefined
    let modeRevision = 0

    function applyContext(update: McpUiHostContext | undefined) {
      if (abort.signal.aborted) return
      context = { ...context, ...update }
      applyHostContext(context, configuration.styleTarget)
      if (connected) {
        setConnection({
          app,
          context,
          capabilities: app.getHostCapabilities(),
          platform: context.platform,
          error: null,
          requestDisplayMode,
        })
      }
    }

    async function requestDisplayMode(mode: McpUiDisplayMode) {
      if (!connected || abort.signal.aborted) return undefined
      if (context?.availableDisplayModes && !context.availableDisplayModes.includes(mode)) return context.displayMode
      const revision = ++modeRevision
      const actual = await app.requestDisplayMode({ mode })
      if (revision === modeRevision) applyContext({ displayMode: actual.mode })
      return actual.mode
    }

    app.addEventListener("hostcontextchanged", (update) => {
      if (update.displayMode) modeRevision++
      applyContext(update)
    })
    app.addEventListener("toolinputpartial", (partialInput) => setNotifications({ partialInput }))
    app.addEventListener("toolinput", (input) => setNotifications({ input }))
    app.addEventListener("toolresult", (result) => setNotifications((previous) => ({ ...previous, result, cancelled: undefined })))
    app.addEventListener("toolcancelled", (cancelled) => setNotifications((previous) => ({ ...previous, cancelled })))
    app.onclose = () => {
      if (abort.signal.aborted || !connected) return
      connected = false
      setConnection({ ...disconnected, error: new Error("The MCP host connection closed.") })
    }

    // Let Strict Mode finish its setup/cleanup cycle before opening a transport.
    void Promise.resolve().then(async () => {
      if (abort.signal.aborted) return
      await app.connect(configuration.createTransport?.(), { signal: abort.signal })
      if (abort.signal.aborted) return
      connected = true
      applyContext(app.getHostContext())
    }).catch((error: unknown) => {
      if (abort.signal.aborted) return
      setConnection({ ...disconnected, error: error instanceof Error ? error : new Error(String(error)) })
    })

    return () => {
      abort.abort()
      connected = false
      void app.close().catch(() => {})
    }
  }, [configuration])

  return (
    <HostContext.Provider value={connection}>
      <ToolNotificationsContext.Provider value={notifications}>{children}</ToolNotificationsContext.Provider>
    </HostContext.Provider>
  )
}

export function useHost(): HostConnection {
  const connection = useContext(HostContext)
  if (!connection) throw new Error("useHost must be used within McpHostProvider.")
  return connection
}

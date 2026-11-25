"use client"

import * as React from "react"
import { AppBridge, PostMessageTransport } from "@modelcontextprotocol/ext-apps/app-bridge"
import {
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Monitor,
  Moon,
  Play,
  RotateCcw,
  Smartphone,
  Sun,
} from "lucide-react"

import {
  buildHostContext,
  insetsFor,
  type PreviewDevice,
  type PreviewMode,
  type PreviewTheme,
} from "@/lib/host-context"
import { cn } from "@/lib/utils"
import { AppFrame, Composer, Segmented } from "@/components/site/host-preview"
import { XIcon } from "@/registry/mcpblocks/ui/icons"

const INLINE_HEIGHT_CAP = 520

type ProtocolLogEntry = {
  id: number
  time: string
  direction: "host → app" | "app → host"
  method: string
  detail: string
}

type Preset = {
  id: string
  label: string
  toolName: string
  prompt: string
  toolInput: Record<string, unknown>
  structuredContent: Record<string, unknown>
}

const DEAL_PRESETS: Preset[] = [
  {
    id: "deals",
    label: "list_deals (ListView)",
    toolName: "list_deals",
    prompt: "Show me my open deals.",
    toolInput: {},
    structuredContent: {
      view: "deals",
      total: 4,
      deals: [
        {
          id: "d1",
          company: "Northwind Traders",
          contact: "Hannah Patel",
          email: "hannah@northwind.example",
          stage: "Proposal",
          amount: 48000,
          closeDate: "2026-12-18",
          note: "Security review cleared; waiting on legal redlines.",
        },
        {
          id: "d2",
          company: "Contoso Health",
          contact: "Marcus Reed",
          email: "m.reed@contoso.example",
          stage: "Negotiation",
          amount: 92000,
          closeDate: "2026-12-05",
          note: "Procurement asked for annual billing terms.",
        },
        {
          id: "d3",
          company: "Fabrikam Cloud",
          contact: "Priya Nair",
          email: "priya@fabrikam.example",
          stage: "Discovery",
          amount: 31500,
          closeDate: "2027-01-15",
          note: "Technical champion wants a sandbox trial next week.",
        },
        {
          id: "d4",
          company: "Alpine Logistics",
          contact: "Jonas Weber",
          email: "j.weber@alpine.example",
          stage: "Proposal",
          amount: 64000,
          closeDate: "2026-12-22",
          note: "CFO approved budget; reviewing seat count.",
        },
      ],
    },
  },
  {
    id: "deal",
    label: "show_deal (InlineCard)",
    toolName: "show_deal",
    prompt: "Show me the Northwind Traders deal.",
    toolInput: { id: "d1" },
    structuredContent: {
      view: "deal",
      deal: {
        id: "d1",
        company: "Northwind Traders",
        contact: "Hannah Patel",
        email: "hannah@northwind.example",
        stage: "Proposal",
        amount: 48000,
        closeDate: "2026-12-18",
        note: "Security review cleared; waiting on legal redlines.",
      },
    },
  },
  {
    id: "confirm",
    label: "propose_stage_change (ConfirmAction)",
    toolName: "propose_stage_change",
    prompt: "Move Northwind Traders to the next stage.",
    toolInput: { id: "d1" },
    structuredContent: {
      view: "confirm",
      next: "Negotiation",
      deal: {
        id: "d1",
        company: "Northwind Traders",
        contact: "Hannah Patel",
        email: "hannah@northwind.example",
        stage: "Proposal",
        amount: 48000,
        closeDate: "2026-12-18",
        note: "Security review cleared; waiting on legal redlines.",
      },
    },
  },
  {
    id: "trend",
    label: "pipeline_trend (LineChart)",
    toolName: "pipeline_trend",
    prompt: "Chart our pipeline trend over the last six months.",
    toolInput: {},
    structuredContent: {
      view: "trend",
      labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
      series: [
        { name: "Open pipeline", values: [180, 210, 195, 245, 270, 310] },
        { name: "Closed-won", values: [62, 74, 88, 95, 118, 142] },
      ],
    },
  },
]

function nowLabel() {
  const d = new Date()
  return d.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export function AppBridgeHost() {
  const [theme, setTheme] = React.useState<PreviewTheme>("light")
  const [mode, setMode] = React.useState<PreviewMode>("inline")
  const [device, setDevice] = React.useState<PreviewDevice>("web")

  const [presetId, setPresetId] = React.useState<string>(DEAL_PRESETS[0].id)
  const preset = DEAL_PRESETS.find((p) => p.id === presetId) ?? DEAL_PRESETS[0]

  const [jsonDraft, setJsonDraft] = React.useState(() => JSON.stringify(preset.structuredContent, null, 2))
  const [jsonError, setJsonError] = React.useState<string | null>(null)
  const [customHtml, setCustomHtml] = React.useState<string>("")
  const [useCustomHtml, setUseCustomHtml] = React.useState(false)

  const [bundleHtml, setBundleHtml] = React.useState<string | null>(null)
  const [loadError, setLoadError] = React.useState<string | null>(null)
  const [iframeKey, setIframeKey] = React.useState(0)

  const [connectedApp, setConnectedApp] = React.useState<{ name: string; version: string } | null>(null)
  const [reportedHeight, setReportedHeight] = React.useState<number>(360)
  const [chatFollowups, setChatFollowups] = React.useState<string[]>([])
  const [logs, setLogs] = React.useState<ProtocolLogEntry[]>([])

  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const bridgeRef = React.useRef<AppBridge | null>(null)
  const logIdRef = React.useRef(1)
  const pendingPayloadRef = React.useRef<{
    toolInput: Record<string, unknown>
    structuredContent: Record<string, unknown>
  }>({
    toolInput: preset.toolInput,
    structuredContent: preset.structuredContent,
  })
  const hostStateRef = React.useRef({ theme, mode, device })
  hostStateRef.current = { theme, mode, device }
  const lastSentContextKeyRef = React.useRef<string>("")

  const pushLog = React.useCallback(
    (direction: ProtocolLogEntry["direction"], method: string, detail: string) => {
      const id = logIdRef.current++
      setLogs((prev) => [{ id, time: nowLabel(), direction, method, detail }, ...prev].slice(0, 40))
    },
    []
  )

  // Fetch the bundled deal-app view HTML once from static assets.
  React.useEffect(() => {
    let cancelled = false
    fetch("/demo/deal-app.html")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.text()
      })
      .then((html) => {
        if (!cancelled) setBundleHtml(html)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeHtml = useCustomHtml && customHtml.trim() ? customHtml : bundleHtml

  const sendPayloadToBridge = React.useCallback(
    async (
      bridge: AppBridge,
      toolInput: Record<string, unknown>,
      structuredContent: Record<string, unknown>,
    ) => {
      pushLog("host → app", "ui/notifications/tool-input", JSON.stringify(toolInput))
      await bridge.sendToolInput({ arguments: toolInput })

      const summary =
        typeof structuredContent.view === "string"
          ? `structuredContent.view="${structuredContent.view}"`
          : `${Object.keys(structuredContent).length} top-level key(s)`
      pushLog("host → app", "ui/notifications/tool-result", summary)
      await bridge.sendToolResult({
        content: [{ type: "text", text: "Mock tool result from mcpblocks playground." }],
        structuredContent,
      })
    },
    [pushLog]
  )

  // Wire a fresh AppBridge each time the iframe mounts/reloads.
  React.useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe || !activeHtml) return

    let disposed = false
    setConnectedApp(null)

    const initialContext = buildHostContext(hostStateRef.current)
    lastSentContextKeyRef.current = `${hostStateRef.current.theme}|${hostStateRef.current.mode}|${hostStateRef.current.device}`
    const bridge = new AppBridge(
      null,
      { name: "mcpblocks-playground", version: "1.0.0" },
      {
        openLinks: {},
        serverTools: {},
        updateModelContext: { text: {} },
      },
      { hostContext: initialContext }
    )

    bridge.addEventListener("initialized", () => {
      if (disposed) return
      const info = bridge.getAppVersion() ?? { name: "MCP App", version: "0.0.0" }
      setConnectedApp(info)
      pushLog("app → host", "ui/notifications/initialized", `${info.name} v${info.version}`)
      void sendPayloadToBridge(
        bridge,
        pendingPayloadRef.current.toolInput,
        pendingPayloadRef.current.structuredContent
      )
    })

    bridge.addEventListener("sizechange", ({ height }) => {
      if (disposed) return
      if (typeof height === "number" && Number.isFinite(height) && height > 0) {
        setReportedHeight(Math.round(height))
        pushLog("app → host", "ui/notifications/size-changed", `height=${Math.round(height)}px`)
      }
    })

    bridge.onmessage = async (params) => {
      const textBlock = params.content.find((c) => c.type === "text")
      const text = textBlock && "text" in textBlock ? textBlock.text : JSON.stringify(params.content)
      pushLog("app → host", "ui/message", text)
      setChatFollowups((prev) => [...prev, text])
      return {}
    }

    bridge.oncalltool = async (params) => {
      pushLog("app → host", "tools/call", `${params.name}(${JSON.stringify(params.arguments ?? {})})`)
      return {
        content: [{ type: "text", text: `Simulated server tool "${params.name}" succeeded.` }],
        structuredContent: { ok: true, tool: params.name, arguments: params.arguments ?? {} },
      }
    }

    bridge.onupdatemodelcontext = async (params) => {
      const textBlock = params.content?.find((c) => c.type === "text")
      const text = textBlock && "text" in textBlock ? textBlock.text : "Model context updated"
      pushLog("app → host", "ui/update-model-context", text)
      return {}
    }

    bridge.onrequestdisplaymode = async (params) => {
      const granted: PreviewMode = params.mode === "fullscreen" ? "fullscreen" : "inline"
      pushLog("app → host", "ui/request-display-mode", `requested=${params.mode} → granted=${granted}`)
      setMode(granted)
      return { mode: granted }
    }

    bridge.onopenlink = async (params) => {
      pushLog("app → host", "ui/open-link", params.url)
      return {}
    }

    const connectBridge = async () => {
      if (!iframe.contentWindow) return
      const transport = new PostMessageTransport(iframe.contentWindow, iframe.contentWindow)
      await bridge.connect(transport)
      if (!disposed) {
        bridgeRef.current = bridge
        pushLog(
          "host → app",
          "ui/initialize",
          `theme=${initialContext.theme}, mode=${initialContext.displayMode}, platform=${initialContext.platform}`
        )
      }
    }

    void connectBridge()

    return () => {
      disposed = true
      bridgeRef.current = null
      void bridge.close()
    }
  }, [activeHtml, iframeKey, mode, pushLog, sendPayloadToBridge])

  // Push hostContext updates over the live AppBridge whenever theme or device changes.
  React.useEffect(() => {
    const bridge = bridgeRef.current
    if (!bridge || !connectedApp) return
    const key = `${theme}|${mode}|${device}`
    if (key === lastSentContextKeyRef.current) return
    lastSentContextKeyRef.current = key
    const next = buildHostContext({ theme, mode, device })
    bridge.setHostContext(next)
    pushLog(
      "host → app",
      "ui/notifications/host-context-changed",
      `theme=${theme}, displayMode=${mode}, platform=${next.platform}`
    )
  }, [theme, mode, device, connectedApp, pushLog])

  function selectPreset(nextPreset: Preset) {
    setPresetId(nextPreset.id)
    setJsonDraft(JSON.stringify(nextPreset.structuredContent, null, 2))
    setJsonError(null)
    setChatFollowups([])
    pendingPayloadRef.current = {
      toolInput: nextPreset.toolInput,
      structuredContent: nextPreset.structuredContent,
    }
    if (bridgeRef.current && connectedApp) {
      void sendPayloadToBridge(bridgeRef.current, nextPreset.toolInput, nextPreset.structuredContent)
    }
  }

  function applyMockJson() {
    try {
      const parsed = JSON.parse(jsonDraft) as Record<string, unknown>
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setJsonError("Mock tool result must be a JSON object.")
        return
      }
      setJsonError(null)
      pendingPayloadRef.current = { toolInput: {}, structuredContent: parsed }
      if (bridgeRef.current && connectedApp) {
        void sendPayloadToBridge(bridgeRef.current, {}, parsed)
      }
    } catch (err) {
      setJsonError(err instanceof Error ? err.message : "Invalid JSON")
    }
  }

  function reloadIframe() {
    setChatFollowups([])
    setIframeKey((k) => k + 1)
  }

  const insets = insetsFor(device, mode)
  const hostVars = {
    "--mb-safe-top": `${insets.top}px`,
    "--mb-safe-right": `${insets.right}px`,
    "--mb-safe-bottom": `${insets.bottom}px`,
    "--mb-safe-left": `${insets.left}px`,
  } as React.CSSProperties

  const tooTall = mode === "inline" && reportedHeight > INLINE_HEIGHT_CAP

  return (
    <div className="flex flex-col gap-6">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
            ]}
          />
          <Segmented
            label="Display mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "inline", label: "Inline", icon: Monitor },
              { value: "fullscreen", label: "Fullscreen", icon: Maximize2 },
            ]}
          />
          <Segmented
            label="Device"
            value={device}
            onChange={setDevice}
            options={[
              { value: "web", label: "Web", icon: Monitor },
              { value: "mobile", label: "Mobile", icon: Smartphone },
            ]}
          />
        </div>

        <button
          type="button"
          onClick={reloadIframe}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border bg-card px-3 text-sm font-medium text-foreground hover:bg-secondary"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Restart sandbox
        </button>
      </div>

      {/* Preset buttons */}
      {!useCustomHtml ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Deal app tool:</span>
          {DEAL_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-xs transition-colors",
                p.id === presetId
                  ? "border-foreground bg-foreground text-background"
                  : "bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Main grid: sandboxed host frame + mock JSON / protocol log */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          {/* Host frame */}
          <div className="flex justify-center rounded-2xl border bg-secondary/60 p-4 sm:p-6">
            <div
              data-host-theme={theme}
              style={hostVars}
              className={cn(
                "relative flex w-full flex-col overflow-hidden bg-host-bg-secondary text-host-fg transition-[max-width]",
                device === "mobile"
                  ? "max-w-[375px] rounded-[28px] border-[6px] border-[#141413]"
                  : "max-w-[760px] rounded-xl border border-host-border-tertiary",
                mode === "fullscreen"
                  ? device === "mobile"
                    ? "h-[720px]"
                    : "h-[620px]"
                  : "min-h-[420px]"
              )}
            >
              {mode === "fullscreen" ? (
                <>
                  <div className="flex h-12 shrink-0 items-center justify-between border-b border-host-border-tertiary bg-host-bg px-4 text-sm">
                    <span className="font-medium">{connectedApp?.name ?? "MCP App"}</span>
                    <button
                      type="button"
                      onClick={() => setMode("inline")}
                      aria-label="Exit fullscreen"
                      className="inline-flex size-8 items-center justify-center rounded-md text-host-fg-tertiary hover:text-host-fg"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                  <div className="relative flex-1 bg-host-bg">
                    {loadError ? (
                      <p className="p-6 text-sm text-host-danger-fg">Failed to load view bundle: {loadError}</p>
                    ) : activeHtml ? (
                      <iframe
                        key={iframeKey}
                        ref={iframeRef}
                        title="Sandboxed MCP App preview"
                        sandbox="allow-scripts allow-forms"
                        srcDoc={activeHtml}
                        className="size-full border-0 bg-transparent"
                      />
                    ) : (
                      <p className="p-6 text-sm text-host-fg-tertiary">Loading bundled MCP App…</p>
                    )}
                  </div>
                  <Composer floating />
                </>
              ) : (
                <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
                  <div className="ml-auto max-w-[80%] rounded-xl bg-host-bg-tertiary px-4 py-2.5 text-sm">
                    {preset.prompt}
                  </div>
                  <p className="text-sm">Here&apos;s what I found:</p>
                  <div className="w-full">
                    <AppFrame name={connectedApp?.name ?? "Deal app"} borderless>
                      {loadError ? (
                        <p className="p-4 text-sm text-host-danger-fg">Failed to load view bundle: {loadError}</p>
                      ) : activeHtml ? (
                        <iframe
                          key={iframeKey}
                          ref={iframeRef}
                          title="Sandboxed MCP App preview"
                          sandbox="allow-scripts allow-forms"
                          srcDoc={activeHtml}
                          style={{ height: Math.max(180, Math.min(reportedHeight, 900)) }}
                          className="block w-full border-0 bg-transparent transition-[height] duration-150"
                        />
                      ) : (
                        <p className="p-4 text-sm text-host-fg-tertiary">Loading bundled MCP App…</p>
                      )}
                    </AppFrame>
                  </div>
                  {chatFollowups.map((msg, i) => (
                    <div key={i} className="ml-auto max-w-[85%] rounded-xl bg-host-bg-tertiary px-4 py-2.5 text-sm">
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-wider text-host-fg-tertiary">
                        ui/message from app
                      </span>
                      {msg}
                    </div>
                  ))}
                  <div className="mt-auto pt-2">
                    <Composer />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Protocol & guideline checks */}
          <div className="grid gap-2 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              {connectedApp ? (
                <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Passes" />
              ) : (
                <AlertTriangle className="size-4 shrink-0 text-[#805c1f]" aria-label="Waiting" />
              )}
              <span>
                {connectedApp
                  ? `Handshake: ${connectedApp.name} v${connectedApp.version}`
                  : "Waiting for ui/notifications/initialized…"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {tooTall ? (
                <AlertTriangle className="size-4 shrink-0 text-[#805c1f]" aria-label="Warning" />
              ) : (
                <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Passes" />
              )}
              <span>
                {mode === "inline"
                  ? `Reported height ${reportedHeight}px ${tooTall ? `exceeds ~${INLINE_HEIGHT_CAP}px` : "fits inline cap"}`
                  : `Fullscreen · safeArea bottom ${insets.bottom}px`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Passes" />
              <span>Opaque iframe sandbox (`allow-scripts allow-forms`)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Passes" />
              <span>Live host CSS tokens injected via AppBridge</span>
            </div>
          </div>
        </div>

        {/* Right rail: mock tool result editor + custom HTML + protocol log */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Mock tool result (`structuredContent`)</h2>
              <button
                type="button"
                onClick={applyMockJson}
                disabled={!connectedApp}
                className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Play className="size-3.5" aria-hidden="true" />
                Send result
              </button>
            </div>
            <textarea
              aria-label="Mock tool result JSON"
              value={jsonDraft}
              onChange={(e) => setJsonDraft(e.target.value)}
              rows={11}
              spellCheck={false}
              className="w-full rounded-lg border bg-secondary/50 p-3 font-mono text-xs leading-relaxed text-foreground outline-none focus:border-foreground"
            />
            {jsonError ? <p className="text-xs text-destructive">{jsonError}</p> : null}
          </div>

          <details className="rounded-xl border bg-card p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Test your own single-file MCP App HTML
            </summary>
            <div className="mt-3 flex flex-col gap-2.5">
              <p className="text-xs text-muted-foreground">
                Paste a single-file bundle (for example from <code className="font-mono">vite-plugin-singlefile</code>) to
                run it inside this sandboxed <code className="font-mono">AppBridge</code> host with Claude&apos;s tokens.
              </p>
              <textarea
                aria-label="Custom MCP App HTML"
                value={customHtml}
                onChange={(e) => setCustomHtml(e.target.value)}
                placeholder="<!doctype html>..."
                rows={5}
                spellCheck={false}
                className="w-full rounded-lg border bg-secondary/50 p-3 font-mono text-xs outline-none focus:border-foreground"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomHtml(true)
                    reloadIframe()
                  }}
                  disabled={!customHtml.trim()}
                  className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-background disabled:opacity-50"
                >
                  Mount custom HTML
                </button>
                {useCustomHtml ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomHtml(false)
                      reloadIframe()
                    }}
                    className="rounded-md border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                  >
                    Back to Deal app
                  </button>
                ) : null}
              </div>
            </div>
          </details>

          <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Protocol log</h2>
              <button
                type="button"
                onClick={() => setLogs([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            </div>
            <div className="max-h-60 overflow-y-auto rounded-lg border bg-secondary/40 p-2 font-mono text-[11px]">
              {logs.length === 0 ? (
                <p className="p-2 text-muted-foreground">Waiting for protocol messages…</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {logs.map((entry) => (
                    <li key={entry.id} className="border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-muted-foreground">{entry.time}</span>{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          entry.direction === "host → app" ? "text-[#B5543A]" : "text-[#265b19]"
                        )}
                      >
                        {entry.direction}
                      </span>{" "}
                      <span className="font-semibold text-foreground">{entry.method}</span>
                      <div className="truncate text-muted-foreground">{entry.detail}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

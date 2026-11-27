import { StrictMode, act, type ComponentProps } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { createFakeHost, fakeHostCapabilities } from "@/registry/mcpblocks/lib/host-harness"
import { buildHostStyleVariables } from "@/lib/host-context"
import { McpHostProvider, useHost } from "@/registry/mcpblocks/hooks/use-host"
import { usePreparedWrite, type PreparedWrite } from "@/registry/mcpblocks/hooks/use-prepared-write"
import { useToolCall } from "@/registry/mcpblocks/hooks/use-tool-call"
import { useToolResult } from "@/registry/mcpblocks/hooks/use-tool-result"

type ProviderProps = ComponentProps<typeof McpHostProvider>

let root: Root
let container: HTMLElement

beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })
  container = document.createElement("div")
  document.body.append(container)
  root = createRoot(container)
})

afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
  document.documentElement.removeAttribute("style")
  document.documentElement.removeAttribute("class")
  delete document.documentElement.dataset.displayMode
  delete document.documentElement.dataset.hostStyles
  document.getElementById("mcpblocks-host-fonts")?.remove()
})

async function mount<T>(host: ReturnType<typeof createFakeHost>, read: () => T, createTransport = host.createTransport) {
  let latest!: T
  function Probe() {
    latest = read()
    return null
  }
  const props: Omit<ProviderProps, "children"> = {
    appInfo: { name: "Test view", version: "1.0.0" },
    capabilities: { availableDisplayModes: ["inline", "fullscreen"] },
    createTransport,
  }
  await host.ready
  await act(async () => {
    root.render(<StrictMode><McpHostProvider {...props}><Probe /></McpHostProvider></StrictMode>)
  })
  return () => latest
}

describe("useHost and useToolResult", () => {
  it("connects once and applies host styles, display mode, font CSS and live context", async () => {
    const host = createFakeHost({
      context: {
        theme: "dark",
        platform: "mobile",
        displayMode: "inline",
        availableDisplayModes: ["inline", "fullscreen"],
        safeAreaInsets: { top: 18, right: 0, bottom: 24, left: 0 },
        styles: { variables: { ...buildHostStyleVariables("dark"), "--color-text-primary": "#fefefe" }, css: { fonts: "/* Host fonts */" } },
      },
    })
    const createTransport = vi.fn(host.createTransport)
    const get = await mount(host, () => useHost(), createTransport)
    expect(createTransport).toHaveBeenCalledTimes(1)
    expect(get()).toMatchObject({ app: expect.anything(), capabilities: fakeHostCapabilities, platform: "mobile", error: null })
    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.style.getPropertyValue("--color-text-primary")).toBe("#fefefe")
    expect(document.documentElement.style.getPropertyValue("--mb-safe-bottom")).toBe("24px")
    expect(document.getElementById("mcpblocks-host-fonts")?.textContent).toBe("/* Host fonts */")
    expect(host.requests).toContainEqual({ method: "ui/notifications/size-changed", params: { width: 1024, height: 0 } })

    await act(async () => {
      host.setContext({ theme: "light" })
      expect(await get().requestDisplayMode("fullscreen")).toBe("fullscreen")
      expect(await get().requestDisplayMode("pip")).toBe("fullscreen")
      await get().app?.sendSizeChanged({ width: 360, height: 240 })
    })
    expect(get().context?.displayMode).toBe("fullscreen")
    expect(document.documentElement.dataset.displayMode).toBe("fullscreen")
    expect(document.documentElement.classList.contains("dark")).toBe(false)
    expect(document.documentElement.style.getPropertyValue("--mb-safe-top")).toBe("18px")
    expect(host.requests.filter(({ method }) => method === "ui/request-display-mode")).toHaveLength(1)
    expect(host.requests).toContainEqual({ method: "ui/notifications/size-changed", params: { width: 360, height: 240 } })
  })

  it("keeps partial input separate and exposes the latest completed result", async () => {
    const host = createFakeHost()
    const get = await mount(host, () => useToolResult())
    await act(async () => host.bridge.sendToolInputPartial({ arguments: { deal: "North" } }))
    expect(get()).toEqual({ partialInput: { arguments: { deal: "North" } } })
    const result = { content: [], structuredContent: { deal: "Northwind" } }
    await act(async () => {
      await host.bridge.sendToolInput({ arguments: { deal: "Northwind" } })
      await host.bridge.sendToolResult(result)
    })
    expect(get()).toMatchObject({ input: { arguments: { deal: "Northwind" } }, result })
    expect(get().partialInput).toBeUndefined()
    await act(async () => host.bridge.sendToolInput({ arguments: { deal: "Globex" } }))
    expect(get().result).toBeUndefined()
  })
})

describe("useToolCall", () => {
  it("classifies success, an explicit tool error, and a request timeout", async () => {
    const host = createFakeHost({
      tools: {
        echo: (structuredContent) => ({ content: [], structuredContent }),
        refuse: () => ({ isError: true, content: [{ type: "text", text: "The record changed." }] }),
        pending: () => new Promise(() => {}),
      },
    })
    const get = await mount(host, () => ({
      echo: useToolCall("echo"),
      refuse: useToolCall("refuse"),
      pending: useToolCall("pending"),
    }))
    await expect(get().echo.call({ id: "d1" })).resolves.toMatchObject({
      kind: "result", result: { structuredContent: { id: "d1" } },
    })
    await expect(get().refuse.call()).resolves.toMatchObject({
      kind: "error", error: { message: "The record changed." }, result: { isError: true },
    })
    await expect(get().pending.call({}, { timeoutMs: 10 })).resolves.toMatchObject({ kind: "timeout" })
  })

  it("returns unavailable without a tool request when the capability is missing", async () => {
    const host = createFakeHost({ capabilities: {} })
    const get = await mount(host, () => useToolCall("write"))
    expect(get().available).toBe(false)
    await expect(get().call()).resolves.toEqual({ kind: "unavailable" })
    expect(host.requests.some(({ method }) => method === "tools/call")).toBe(false)
  })
})

describe("usePreparedWrite", () => {
  it("blocks duplicate confirmation and reconciles the original key before reporting the change", async () => {
    const host = createFakeHost()
    let finishExecute!: () => void
    const execute = vi.fn((_write: PreparedWrite<string>) => new Promise<{ kind: "unknown" }>((resolve) => {
      finishExecute = () => resolve({ kind: "unknown" })
    }))
    const reconcile = vi.fn(async () => ({ kind: "saved" as const, result: "qualified", summary: "Northwind is qualified." }))
    const get = await mount(host, () => usePreparedWrite<string, string, string>({
      prepare: async (input) => ({ kind: "preview", preview: input }),
      execute,
      reconcile,
    }))

    expect(get().state).toEqual({ status: "idle" })
    await act(async () => get().prepare("Northwind"))
    const proposal = get().state
    expect(proposal).toMatchObject({ status: "preview", preview: "Northwind", idempotencyKey: expect.any(String) })
    let pending!: Promise<void>
    await act(async () => {
      pending = get().confirm()
      await get().confirm()
      get().reset()
    })
    expect(execute).toHaveBeenCalledTimes(1)
    expect(get()).toMatchObject({ state: { status: "confirming" }, canClose: false })
    await act(async () => {
      finishExecute()
      await pending
      get().reset()
    })
    expect(get()).toMatchObject({ state: { ...proposal, status: "unknown" }, canClose: false })
    expect(host.requests.some(({ method }) => method === "ui/update-model-context")).toBe(false)
    await act(async () => {
      await Promise.all([get().checkAgain(), get().checkAgain()])
    })
    expect(reconcile).toHaveBeenCalledTimes(1)
    expect(reconcile).toHaveBeenCalledWith(execute.mock.calls.at(0)?.[0])
    expect(get()).toMatchObject({ state: { status: "saved", result: "qualified" }, canClose: true })
    expect(host.requests.filter(({ method }) => method === "ui/update-model-context")).toEqual([{
      method: "ui/update-model-context", params: { content: [{ type: "text", text: "Northwind is qualified." }] },
    }])
  })

  it("reports blocked preparations and explicit refusals without notifying the model", async () => {
    const host = createFakeHost()
    const execute = vi.fn(async () => ({ kind: "refused" as const, reason: "Already changed." }))
    const get = await mount(host, () => usePreparedWrite<string, string, string>({
      prepare: async (input) => input ? { kind: "preview", preview: input } : { kind: "blocked", reason: "Select a deal." },
      execute,
      reconcile: async () => ({ kind: "unknown" }),
    }))
    await act(async () => get().prepare(""))
    expect(get().state).toEqual({ status: "blocked", reason: "Select a deal." })
    await act(async () => get().confirm())
    expect(execute).not.toHaveBeenCalled()
    await act(async () => get().prepare("Northwind"))
    await act(async () => get().confirm())
    expect(get().state).toEqual({ status: "refused", reason: "Already changed." })
    expect(host.requests.some(({ method }) => method === "ui/update-model-context")).toBe(false)
  })
})

"use client"

import type { McpUiHostContext } from "@modelcontextprotocol/ext-apps/app-bridge"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { McpHostProvider } from "@/registry/mcpblocks/hooks/use-host"
import { createFakeHost, type FakeHostOptions } from "@/registry/mcpblocks/lib/host-harness"

type FakeHostProps = FakeHostOptions & {
  children: ReactNode
  className?: string
}

/** Run a React view in Storybook or another preview using a real MCP Apps bridge. */
export function FakeHost({ children, className, context, capabilities, tools, onRequest }: FakeHostProps) {
  const [target, setTarget] = useState<HTMLDivElement | null>(null)
  const [host, setHost] = useState<ReturnType<typeof createFakeHost>>()
  const requestCallback = useRef(onRequest)
  const latestContext = useRef<McpUiHostContext | undefined>(context)

  useEffect(() => { requestCallback.current = onRequest }, [onRequest])
  useEffect(() => {
    latestContext.current = context
    host?.setContext(context ?? {})
  }, [context, host])

  useEffect(() => {
    let active = true
    const harness = createFakeHost({
      context: latestContext.current,
      capabilities,
      tools,
      onRequest: (event) => requestCallback.current?.(event),
    })
    void harness.ready.then(() => {
      if (active) setHost(harness)
    })
    return () => {
      active = false
      void harness.bridge.close()
    }
  }, [capabilities, tools])

  return (
    <div className={className} ref={setTarget}>
      {host && target && (
        <McpHostProvider
          key={host.id}
          appInfo={{ name: "Preview view", version: "1.0.0" }}
          capabilities={{ availableDisplayModes: ["inline", "fullscreen", "pip"] }}
          createTransport={host.createTransport}
          styleTarget={target}
        >
          {children}
        </McpHostProvider>
      )}
    </div>
  )
}

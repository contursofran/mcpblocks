"use client"

import { SdkError, SdkErrorCode, type CallToolResult } from "@modelcontextprotocol/client"
import { useCallback } from "react"

import { useHost } from "@/hooks/use-host"

export type ToolCallOutcome =
  | { kind: "result"; result: CallToolResult }
  | { kind: "error"; error: Error; result?: CallToolResult }
  | { kind: "timeout"; error: Error }
  | { kind: "unavailable" }

/** Call a server tool through the host and distinguish timeouts from explicit failures. */
export function useToolCall(name: string) {
  const { app, capabilities } = useHost()
  const available = !!app && !!capabilities?.serverTools

  const call = useCallback(async (
    args: Record<string, unknown> = {},
    { timeoutMs }: { timeoutMs?: number } = {},
  ): Promise<ToolCallOutcome> => {
    if (!app || !available) return { kind: "unavailable" }

    try {
      const result = await app.callServerTool({ name, arguments: args }, { timeout: timeoutMs })
      if (result.isError) {
        const message = result.content?.find((block) => block.type === "text")?.text
        return { kind: "error", error: new Error(message ?? "The tool returned an error."), result }
      }
      return { kind: "result", result }
    } catch (cause) {
      const error = cause instanceof Error ? cause : new Error(String(cause))
      if (cause instanceof SdkError && cause.code === SdkErrorCode.RequestTimeout) return { kind: "timeout", error }
      return { kind: "error", error }
    }
  }, [app, available, name])

  return { call, available }
}

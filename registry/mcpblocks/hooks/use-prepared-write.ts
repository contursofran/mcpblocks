"use client"

import { useEffect, useRef, useState } from "react"

import { useHost } from "@/registry/mcpblocks/hooks/use-host"
import { tellModel } from "@/registry/mcpblocks/lib/host"

export type PreparedWrite<TPreview> = { preview: TPreview; idempotencyKey: string }

export type PrepareOutcome<TPreview> =
  | { kind: "preview"; preview: TPreview }
  | { kind: "blocked"; reason: string }

export type WriteOutcome<TResult> =
  | { kind: "saved"; result: TResult; summary: string }
  | { kind: "refused"; reason: string }
  | { kind: "unknown"; reason?: string }

export type PreparedWriteState<TPreview, TResult> =
  | { status: "idle" | "preparing" }
  | ({ status: "preview" | "confirming" | "checking" } & PreparedWrite<TPreview>)
  | ({ status: "unknown"; reason?: string } & PreparedWrite<TPreview>)
  | { status: "blocked" | "refused"; reason: string }
  | { status: "saved"; result: TResult }

type PreparedWriteOptions<TInput, TPreview, TResult> = {
  prepare: (input: TInput, idempotencyKey: string) => Promise<PrepareOutcome<TPreview>>
  execute: (write: PreparedWrite<TPreview>) => Promise<WriteOutcome<TResult>>
  reconcile: (write: PreparedWrite<TPreview>) => Promise<WriteOutcome<TResult>>
  /** A proposal already prepared by the tool that opened this view. Read on mount. */
  initialPreview?: TPreview
  fallbackToMessage?: boolean
}

function canCloseWrite(status: PreparedWriteState<unknown, unknown>["status"]) {
  return status !== "preparing" && status !== "confirming" && status !== "unknown" && status !== "checking"
}

/** Prepare one proposal, confirm once, and reconcile uncertain outcomes using the original key. */
export function usePreparedWrite<TInput, TPreview, TResult>(options: PreparedWriteOptions<TInput, TPreview, TResult>) {
  const { app } = useHost()
  const [state, setState] = useState<PreparedWriteState<TPreview, TResult>>(() =>
    options.initialPreview === undefined
      ? { status: "idle" }
      : { status: "preview", preview: options.initialPreview, idempotencyKey: crypto.randomUUID() },
  )
  const current = useRef(state)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  function transition(next: PreparedWriteState<TPreview, TResult>) {
    if (!mounted.current) return
    current.current = next
    setState(next)
  }

  async function prepare(input: TInput) {
    if (!mounted.current || !canCloseWrite(current.current.status)) return
    const idempotencyKey = crypto.randomUUID()
    transition({ status: "preparing" })
    try {
      const outcome = await options.prepare(input, idempotencyKey)
      transition(outcome.kind === "preview"
        ? { status: "preview", preview: outcome.preview, idempotencyKey }
        : { status: "blocked", reason: outcome.reason })
    } catch (cause) {
      transition({ status: "blocked", reason: cause instanceof Error ? cause.message : "The change could not be prepared." })
    }
  }

  async function settle(
    write: PreparedWrite<TPreview>,
    status: "confirming" | "checking",
    operation: PreparedWriteOptions<TInput, TPreview, TResult>["execute"],
  ) {
    const { preview, idempotencyKey } = write
    const proposal = { preview, idempotencyKey }
    transition({ ...proposal, status })
    let outcome: WriteOutcome<TResult>
    try {
      outcome = await operation(proposal)
    } catch {
      outcome = { kind: "unknown" }
    }
    if (!mounted.current) return

    switch (outcome.kind) {
      case "saved":
        transition({ status: "saved", result: outcome.result })
        if (app) void tellModel(app, outcome.summary, { fallbackToMessage: options.fallbackToMessage })
        break
      case "refused":
        transition({ status: "refused", reason: outcome.reason })
        break
      case "unknown":
        transition({ ...proposal, status: "unknown", reason: outcome.reason })
        break
    }
  }

  async function confirm() {
    const write = current.current
    if (mounted.current && write.status === "preview") await settle(write, "confirming", options.execute)
  }

  async function checkAgain() {
    const write = current.current
    if (mounted.current && write.status === "unknown") await settle(write, "checking", options.reconcile)
  }

  function reset() {
    if (canCloseWrite(current.current.status)) transition({ status: "idle" })
  }

  return { state, canClose: canCloseWrite(state.status), prepare, confirm, checkAgain, reset }
}

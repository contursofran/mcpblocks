"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"

import { cn } from "@/lib/utils"

export function CodeBlock({
  code,
  prompt,
  className,
}: {
  code: string
  /** Show a "$" prompt (for one-line shell commands). */
  prompt?: boolean
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={cn("group relative flex items-start rounded-xl bg-[#141413] text-[#faf9f5]", className)}>
      <pre className={cn(
        "min-w-0 flex-1 p-4 font-mono text-[13px] leading-relaxed",
        prompt ? "wrap-anywhere whitespace-pre-wrap" : "overflow-x-auto"
      )}>
        {prompt ? <span className="mr-2 select-none text-[#9c9a92]">$</span> : null}
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy code"}
        className="m-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-[#c2c0b6] hover:bg-white/10 hover:text-white"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}

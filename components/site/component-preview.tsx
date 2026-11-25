"use client"

import * as React from "react"

import { CodeBlock } from "@/components/site/code-block"
import { demos } from "@/components/site/demos"
import { HostPreview } from "@/components/site/host-preview"
import { cn } from "@/lib/utils"

export function ComponentPreview({
  slug,
  checks,
  variant,
  code,
}: {
  slug: string
  checks: string[]
  variant: "card" | "borderless"
  code?: string
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const Demo = demos[slug]
  if (!Demo) return null

  return (
    <div className="flex flex-col gap-3">
      {code ? (
        <div className="flex items-center justify-end">
          <div
            role="tablist"
            aria-label="Preview or code"
            className="inline-flex gap-1 rounded-full bg-[#141413]/[0.06] p-1 backdrop-blur-sm"
          >
            {(
              [
                ["preview", "Preview"],
                ["code", "Code"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs/4 font-semibold transition-colors",
                  tab === id
                    ? "bg-white text-[#141413] shadow-2xs"
                    : "text-[#141413]/55 hover:text-[#141413]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "code" && code ? (
        <CodeBlock code={code} />
      ) : (
        <HostPreview checks={checks} variant={variant}>
          <Demo />
        </HostPreview>
      )}
    </div>
  )
}

"use client"

import * as React from "react"

import { CodeBlock } from "@/components/site/code-block"
import { demos } from "@/components/site/demos"
import { Code2, Eye } from "lucide-react"

import { HostPreview, Segmented } from "@/components/site/host-preview"

export function ComponentPreview({
  slug,
  checks,
  variant,
  title,
  code,
}: {
  slug: string
  checks: string[]
  variant: "card" | "borderless"
  title: string
  code?: string
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview")
  const Demo = demos[slug]
  if (!Demo) return null

  const toggle = code ? (
    <Segmented
      label="Preview or code"
      value={tab}
      onChange={setTab}
      options={[
        { value: "preview", label: "Preview", icon: Eye },
        { value: "code", label: "Code", icon: Code2 },
      ]}
    />
  ) : null

  if (tab === "code" && code) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex">{toggle}</div>
        <CodeBlock code={code} />
      </div>
    )
  }

  return (
    <HostPreview checks={checks} variant={variant} appName={title} leading={toggle}>
      <Demo />
    </HostPreview>
  )
}

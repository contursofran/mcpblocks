"use client"

import { demos } from "@/components/site/demos"
import { HostPreview } from "@/components/site/host-preview"

export function ComponentPreview({
  slug,
  checks,
  variant,
}: {
  slug: string
  checks: string[]
  variant: "card" | "borderless"
}) {
  const Demo = demos[slug]
  if (!Demo) return null
  return (
    <HostPreview checks={checks} variant={variant}>
      <Demo />
    </HostPreview>
  )
}

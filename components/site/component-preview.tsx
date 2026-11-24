"use client"

import { demos } from "@/components/site/demos"
import { HostPreview } from "@/components/site/host-preview"

export function ComponentPreview({ slug, checks }: { slug: string; checks: string[] }) {
  const Demo = demos[slug]
  if (!Demo) return null
  return (
    <HostPreview checks={checks}>
      <Demo />
    </HostPreview>
  )
}

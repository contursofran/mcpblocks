"use client"

import * as React from "react"

import { Carousel } from "@/registry/inlinekit/components/carousel"
import { ConfirmAction } from "@/registry/inlinekit/components/confirm-action"
import { InlineCard } from "@/registry/inlinekit/components/inline-card"
import {
  CarouselSkeleton,
  InlineCardSkeleton,
} from "@/registry/inlinekit/components/skeleton"
import { StatusUpdate } from "@/registry/inlinekit/components/status-update"

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function InlineCardDemo() {
  return (
    <InlineCard
      title="Northwind renewal"
      description="Annual contract, renews in 32 days"
      badge={{ label: "At risk", tone: "warning" }}
      fields={[
        { label: "Owner", value: "M. Ortega" },
        { label: "Stage", value: "Proposal" },
        { label: "Seats", value: "48" },
        { label: "Last contact", value: "9 days ago" },
      ]}
      actions={[{ label: "Open record" }, { label: "Draft follow-up" }]}
    />
  )
}

export function ConfirmActionDemo() {
  return (
    <ConfirmAction
      title="Update deal stage"
      fields={[
        { label: "Deal", value: "Northwind" },
        { label: "Owner", value: "M. Ortega" },
        { label: "From", value: "Proposal" },
        { label: "To", value: "Negotiation" },
      ]}
      onApprove={() => wait(900)}
      onEditInChat={() => {}}
      onUndo={() => {}}
      doneTitle="Deal moved to Negotiation"
      doneDescription="Northwind renewal · updated just now"
    />
  )
}

export function CarouselDemo() {
  const [picked, setPicked] = React.useState<string | null>(null)
  const items = [
    { id: "lomas", title: "Casa Lomas", meta: ["2 guests · Chacras", "Garden, pool"] },
    { id: "loft", title: "Loft Arístides", meta: ["2 guests · Centro", "Walk to bars"] },
    { id: "finca", title: "Finca Andes", meta: ["4 guests · Luján", "Vineyard views"] },
    { id: "bodega", title: "Bodega House", meta: ["6 guests · Maipú", "Wine tasting"] },
  ].map((i) => ({
    ...i,
    cta: { label: picked === i.id ? "Selected" : "Select", onClick: () => setPicked(i.id) },
  }))
  return <Carousel items={items} label="Places to stay" />
}

export function StatusUpdateDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <StatusUpdate
        tone="success"
        title="Invoice sent to Northwind"
        description="INV-2041 · delivered just now"
        action={{ label: "View" }}
      />
      <StatusUpdate
        tone="warning"
        title="Calendar is almost full"
        description="2 open slots left this week"
      />
      <StatusUpdate
        tone="danger"
        title="Couldn't reach the CRM"
        description="Nothing was changed"
        action={{ label: "Retry" }}
      />
    </div>
  )
}

export function SkeletonDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <InlineCardSkeleton />
      <CarouselSkeleton />
    </div>
  )
}

export const demos: Record<string, React.ComponentType> = {
  "inline-card": InlineCardDemo,
  "confirm-action": ConfirmActionDemo,
  carousel: CarouselDemo,
  "status-update": StatusUpdateDemo,
  skeleton: SkeletonDemo,
}

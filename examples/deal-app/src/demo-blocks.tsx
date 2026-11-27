import { BrandedConfirmAction } from "@/components/branded-confirm-action"
import { Carousel } from "@/components/carousel"
import { ConfirmAction } from "@/components/confirm-action"
import { DocumentCard } from "@/components/document-card"
import { InlineCard } from "@/components/inline-card"
import { LineChart } from "@/components/line-chart"
import { ListView } from "@/components/list-view"
import { MediaPlayer } from "@/components/media-player"
import { RowsSkeleton } from "@/components/skeleton"
import { StatusUpdate } from "@/components/status-update"

import coast from "../../../public/demo/coast.jpg?inline"
import forest from "../../../public/demo/forest.jpg?inline"
import ridge from "../../../public/demo/ridge.jpg?inline"
import sampleChime from "./assets/sample-chime.wav?inline"
import { trend } from "../server/data"
import type { DemoBlock } from "../shared/demo-blocks"

export function RegistryBlockDemo({ block }: { block: DemoBlock }) {
  switch (block) {
    case "list-view":
      return (
        <ListView
          items={[
            { id: "northwind", title: "Northwind Traders", initials: "NT", meta: "Proposal", timestamp: "$48,000" },
            { id: "globex", title: "Globex Corp", initials: "GC", meta: "Negotiation", timestamp: "$120,000" },
            { id: "initech", title: "Initech", initials: "IN", meta: "Qualified", timestamp: "$22,500" },
          ]}
          summary="3 sample deals"
        />
      )
    case "inline-card":
      return (
        <InlineCard
          title="Northwind Traders"
          badge={{ label: "Proposal", tone: "info" }}
          fields={[{ label: "Value", value: "$48,000" }, { label: "Close date", value: "Dec 12" }]}
        />
      )
    case "confirm-action":
    case "branded-confirm-action": {
      const Component = block === "confirm-action" ? ConfirmAction : BrandedConfirmAction
      return (
        <Component
          title="Move Northwind Traders to Negotiation"
          subject={{ name: "Northwind Traders", detail: "Sample deal" }}
          changePreview={<p>Stage <strong>Proposal</strong> → <strong>Negotiation</strong></p>}
          doneTitle="Sample change confirmed"
        />
      )
    }
    case "line-chart":
      return <LineChart title="Pipeline and closed-won revenue" {...trend} formatValue={(value) => `$${value}k`} />
    case "media-player":
      return <MediaPlayer title="Sample chime" subtitle="Audio preview" src={sampleChime} duration={2} />
    case "document-card":
      return (
        <DocumentCard
          title="Sprint planning"
          editable={false}
          properties={[{ label: "Team", value: "Engineering", tag: true }]}
          sections={[
            { kind: "list", heading: "Agenda", items: ["Review completed work", "Plan the next sprint"] },
            { kind: "tasks", heading: "Action items", items: [{ text: "Share the sprint goals", done: true }] },
          ]}
        />
      )
    case "carousel":
      return (
        <Carousel
          label="Nearby hikes"
          items={[
            { id: "coast", title: "Ocean View Trail", image: coast, rating: 4.6, meta: ["2.8 mi", "Moderate"] },
            { id: "forest", title: "Redwood Forest Loop", image: forest, rating: 4.8, meta: ["4 mi", "Moderate"] },
            { id: "ridge", title: "Summit Ridge Path", image: ridge, rating: 4.5, meta: ["6.1 mi", "Hard"] },
          ]}
        />
      )
    case "skeleton":
      return <RowsSkeleton rows={3} columns={3} />
    case "status-update":
      return <StatusUpdate title="Invoice sent to Northwind" description="Sample invoice INV-2041" />
  }
}

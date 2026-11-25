"use client"

import * as React from "react"

import { Carousel } from "@/registry/mcpblocks/components/carousel"
import { ConfirmAction } from "@/registry/mcpblocks/components/confirm-action"
import { DocumentCard } from "@/registry/mcpblocks/components/document-card"
import { InlineCard } from "@/registry/mcpblocks/components/inline-card"
import { LineChart } from "@/registry/mcpblocks/components/line-chart"
import { ListView } from "@/registry/mcpblocks/components/list-view"
import { MediaPlayer } from "@/registry/mcpblocks/components/media-player"
import { CarouselSkeleton, InlineCardSkeleton, RowsSkeleton } from "@/registry/mcpblocks/components/skeleton"
import { StatusUpdate } from "@/registry/mcpblocks/components/status-update"

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

export function ListViewDemo() {
  return (
    <ListView
      items={[
        { id: "1", initials: "SC", avatarColor: "#6366E9", title: "Sarah Chen", meta: "#design", timestamp: "Nov 12", body: "I think the onboarding flow needs to start with the value prop before asking for permissions. Users are dropping off at step 2 because we're hitting them with the notification prompt too early." },
        { id: "2", initials: "MJ", avatarColor: "#835EEE", title: "Marcus Johnson", meta: "#design", timestamp: "Nov 12", body: "Agreed on the permissions issue. I mocked up an alternative where we delay the notification prompt until after they complete their first task" },
        { id: "3", initials: "ER", avatarColor: "#DA5597", title: "Emily Rodriguez", meta: "#design", timestamp: "Nov 13", body: "Here are the updated onboarding screens with the new copy from content team. Let me know if the flow makes more sense now." },
        { id: "4", initials: "SC", avatarColor: "#6366E9", title: "Sarah Chen", meta: "#design-critiques", timestamp: "Nov 15", body: "Quick update: we tested the revised onboarding with 5 users yesterday. Completion rate improved from 34% to 67%" },
      ]}
      summary="Showing 4 of 12 results"
      viewAll={{ label: "View in App" }}
    />
  )
}

export function ConfirmActionDemo() {
  return (
    <ConfirmAction
      title="Set lead assignment permission"
      subject={{ name: "Sarah Johnson", detail: "sarah.johnson@company.com" }}
      confirmLabel="Confirm assignment"
      onConfirm={() => wait(900)}
      onUndo={() => {}}
      details={{
        heading: "Lead assignment permissions",
        items: [
          "Read/Edit access to Leads",
          "Access to Lead Assignment Queue",
          "View Lead Conversion History",
          "Run Lead Assignment Rules",
        ],
      }}
      doneTitle="Permission assigned to Sarah Johnson"
      doneDescription="Lead assignment · just now"
    />
  )
}

export function MediaPlayerDemo() {
  return (
    <MediaPlayer
      title="Podcast Intro"
      subtitle="Rachel · Warm"
      duration={27}
      onRegenerate={() => {}}
      onDownload={() => {}}
    />
  )
}

const days = ["Oct 11", "Oct 12", "Oct 13", "Oct 14", "Oct 15", "Oct 16", "Oct 17", "Oct 18", "Oct 19", "Oct 20", "Oct 21", "Oct 22"]
export function LineChartDemo() {
  return (
    <LineChart
      title="Chats and messages"
      labels={days.map((d) => `${d}, 2025`)}
      labelEvery={3}
      series={[
        { name: "Messages", values: [1380, 1400, 1150, 1720, 1380, 1420, 1060, 1390, 1560, 1360, 1650, 2250] },
        { name: "Chats", values: [1050, 1080, 760, 1310, 1000, 1080, 640, 1060, 1230, 1020, 1300, 1830] },
      ]}
      ranges={["1D", "1W", "1M", "1Y"]}
    />
  )
}

export function DocumentCardDemo() {
  return (
    <DocumentCard
      icon="📋"
      title="Sprint Planning - Nov 18"
      properties={[
        { label: "Parent", value: "Engineering" },
        { label: "Type", value: "Meeting notes", tag: true },
        { label: "Date", value: "November 18, 2025" },
      ]}
      sections={[
        {
          kind: "list",
          heading: "Agenda",
          items: [
            "Review completed items from last week",
            "Discuss blockers and dependencies",
            "Assign new tickets for upcoming sprint",
            "Set sprint goals and success metrics",
          ],
        },
        { kind: "tasks", heading: "Action items", items: [], placeholder: "To be filled during meeting" },
      ]}
    />
  )
}

export function CarouselDemo() {
  return (
    <Carousel
      label="Nearby hikes"
      items={[
        { id: "ocean", image: "/demo/coast.jpg", imageAlt: "", title: "Ocean View Trail", subtitle: "Golden Gate National Park", rating: 4.6, meta: ["Moderate", "2.8 mi"], saved: false },
        { id: "cascade", image: "/demo/cliffs.jpg", imageAlt: "", title: "Cascade Waterfall Trail", subtitle: "Smith Wilderness Reserve", rating: 4.8, meta: ["Hard", "13 mi"], saved: false },
        { id: "redwood", image: "/demo/forest.jpg", imageAlt: "", title: "Redwood Forest Loop", subtitle: "Tall Timber Regional Park", rating: 4.8, meta: ["Moderate", "4 mi"], saved: false },
        { id: "ridge", image: "/demo/ridge.jpg", imageAlt: "", title: "Summit Ridge Path", subtitle: "Mount Diablo State Park", rating: 4.5, meta: ["Hard", "6.1 mi"], saved: false },
      ]}
    />
  )
}

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

export function StatusUpdateDemo() {
  return (
    <div className="flex w-full flex-col gap-3">
      <StatusUpdate tone="success" title="Invoice sent to Northwind" description="INV-2041 · delivered just now" action={{ label: "View" }} />
      <StatusUpdate tone="warning" title="Calendar is almost full" description="2 open slots left this week" />
      <StatusUpdate tone="danger" title="Couldn't reach the CRM" description="Nothing was changed" action={{ label: "Retry" }} />
    </div>
  )
}

export function SkeletonDemo() {
  return <RowsSkeleton />
}

export function SkeletonVariantsDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <InlineCardSkeleton />
      <CarouselSkeleton />
    </div>
  )
}

export const demos: Record<string, React.ComponentType> = {
  "list-view": ListViewDemo,
  "confirm-action": ConfirmActionDemo,
  "media-player": MediaPlayerDemo,
  "line-chart": LineChartDemo,
  "document-card": DocumentCardDemo,
  carousel: CarouselDemo,
  "inline-card": InlineCardDemo,
  "status-update": StatusUpdateDemo,
  skeleton: SkeletonDemo,
}

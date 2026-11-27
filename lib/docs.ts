export type ComponentCategory = "Inline cards" | "Data & media" | "Feedback"

export type ComponentDoc = {
  slug: string
  title: string
  category: ComponentCategory
  description: string
  displayModes: string
  /** How the host preview frames it: "card" (host border) or "borderless". */
  variant: "card" | "borderless"
  /** Where the design comes from. */
  source: string
  checks: string[]
  usage: string
  props: { name: string; type: string; description: string }[]
}

export const componentCategories: ComponentCategory[] = [
  "Inline cards",
  "Data & media",
  "Feedback",
]

const KIT = "MCP Apps for Claude kit"

export const components: ComponentDoc[] = [
  {
    slug: "list-view",
    title: "List view",
    category: "Inline cards",
    description:
      "A short list of rich rows (messages, tickets, search results) with avatars, metadata and a footer link to the rest.",
    displayModes: "inline",
    variant: "card",
    source: `${KIT} · Inline card / List views`,
    checks: ["4–5 rows inline, link to the rest", "Rows clamp to two lines", "Footer link opens your app or fullscreen"],
    usage: `import { ListView } from "@/components/list-view"

<ListView
  items={messages.map((m) => ({
    id: m.id,
    initials: m.author.initials,
    title: m.author.name,
    meta: m.channel,
    timestamp: m.date,
    body: m.text,
  }))}
  summary={\`Showing 4 of \${total} results\`}
  viewAll={{ label: "View in App", onClick: () => app.requestDisplayMode({ mode: "fullscreen" }) }}
/>`,
    props: [
      { name: "items", type: "ListViewItem[]", description: "id, initials, avatarColor?, title, meta?, timestamp?, body?, onClick?" },
      { name: "summary", type: "string", description: "Footer text, e.g. \"Showing 4 of 12 results\"." },
      { name: "viewAll", type: "{ label, href?, onClick? }", description: "Footer link to the full list." },
    ],
  },
  {
    slug: "confirm-action",
    title: "Confirm action",
    category: "Inline cards",
    description:
      "Confirmation for a change Claude has prepared: what will happen, who it applies to, one confirm button, and what the change includes.",
    displayModes: "inline",
    variant: "card",
    source: `${KIT} · Inline card / Confirmation actions`,
    checks: ["One confirm action", "Refusals show the reason", "Unconfirmed writes offer a check"],
    usage: `import { ConfirmAction } from "@/components/confirm-action"

<ConfirmAction
  title="Set lead assignment permission"
  subject={{ name: "Sarah Johnson", detail: "sarah.johnson@company.com" }}
  confirmLabel="Confirm assignment"
  changePreview={<p>Permission: Read only → Manage leads</p>}
  status={status}
  onConfirm={executePreparedAssignment}
  onCheckAgain={checkAssignment}
  details={{ heading: "Lead assignment permissions", items: permissions }}
  doneTitle="Permission assigned"
/>`,
    props: [
      { name: "title", type: "ReactNode", description: "What will happen." },
      { name: "subject", type: "{ name, detail?, initials?, avatarColor? }", description: "The person or record it applies to." },
      { name: "onConfirm", type: "() => unknown", description: "Return a promise to show the working state; a rejection shows the error state." },
      { name: "details", type: "{ heading, items[] }", description: "What the change includes, as a checklist." },
      { name: "changePreview", type: "ReactNode", description: "Shows the proposed change and the confirmation reminder." },
      { name: "status", type: "pending | working | done | error | refused | unknown", description: "Control the state from outside." },
      { name: "refusedTitle / refusedDescription", type: "ReactNode", description: "Explain why the server refused the proposal without a write." },
      { name: "unknownTitle / unknownDescription", type: "ReactNode", description: "Explain a write whose outcome could not be verified." },
      { name: "onCheckAgain", type: "() => void", description: "Reconcile the original write in the unknown state." },
    ],
  },
  {
    slug: "media-player",
    title: "Media player",
    category: "Data & media",
    description:
      "An inline audio card with play/pause, a waveform you can click to seek, the duration and optional regenerate/download actions.",
    displayModes: "inline",
    variant: "card",
    source: `${KIT} · Inline card / Media card`,
    checks: ["Playback stays inline, no new window", "Waveform is keyboard-seekable (←/→)", "Two actions at most"],
    usage: `import { MediaPlayer } from "@/components/media-player"

<MediaPlayer
  title="Podcast Intro"
  subtitle="Rachel · Warm"
  src={result.audioUrl}
  peaks={result.peaks}
  onRegenerate={() => app.sendMessage({ role: "user", content: [{ type: "text", text: "Try a different voice" }] })}
  onDownload={() => app.openLink({ url: result.audioUrl })}
/>`,
    props: [
      { name: "src", type: "string", description: "Audio URL. Without it the card is a static preview." },
      { name: "peaks", type: "number[]", description: "Waveform values 0–1. A stable placeholder is generated if omitted." },
      { name: "duration", type: "number", description: "Seconds, shown before metadata loads." },
      { name: "onRegenerate / onDownload", type: "() => void", description: "Show the matching icon buttons." },
    ],
  },
  {
    slug: "line-chart",
    title: "Line chart",
    category: "Data & media",
    description:
      "A borderless line chart with soft area fills, a hover tooltip, range tabs and a legend. Dependency-free SVG.",
    displayModes: "inline, borderless",
    variant: "borderless",
    source: `${KIT} · Inline card / Borderless card`,
    checks: ["Borderless: set _meta.ui.prefersBorder = false", "Tooltip on hover, no popovers", "Fits inline without scrolling"],
    usage: `import { LineChart } from "@/components/line-chart"

<LineChart
  title="Chats and messages"
  labels={days}
  series={[
    { name: "Messages", values: messages },
    { name: "Chats", values: chats },
  ]}
  ranges={["1D", "1W", "1M", "1Y"]}
  onRangeChange={(r) => app.callServerTool({ name: "get_usage", arguments: { range: r } })}
/>`,
    props: [
      { name: "labels", type: "string[]", description: "One label per point; also shown in the tooltip." },
      { name: "series", type: "{ name, values[], color? }[]", description: "Up to ~4 series." },
      { name: "ranges / range / onRangeChange", type: "string[] / string / fn", description: "Optional range tabs." },
      { name: "formatValue", type: "(v) => string", description: "Axis and tooltip formatting." },
    ],
  },
  {
    slug: "document-card",
    title: "Document card",
    category: "Inline cards",
    description:
      "A page or document preview with properties, lists and tasks that the user can edit in place, then hand back to Claude.",
    displayModes: "inline",
    variant: "card",
    source: `${KIT} · Inline card / Inline editing`,
    checks: ["Small edits in place, big changes in chat", "Checkboxes are real inputs", "onChange returns the full updated content"],
    usage: `import { DocumentCard } from "@/components/document-card"

<DocumentCard
  icon="📋"
  title={page.title}
  properties={[{ label: "Type", value: "Meeting notes", tag: true }]}
  sections={[
    { kind: "list", heading: "Agenda", items: page.agenda },
    { kind: "tasks", heading: "Action items", items: page.tasks, placeholder: "To be filled during meeting" },
  ]}
  onChange={(sections) => app.callServerTool({ name: "update_page", arguments: { id: page.id, sections } })}
/>`,
    props: [
      { name: "properties", type: "{ label, value, tag? }[]", description: "Key/value rows at the top." },
      { name: "sections", type: "DocumentSection[]", description: "\"list\" (editable text) or \"tasks\" (checkboxes)." },
      { name: "editable", type: "boolean", description: "Default true." },
      { name: "onChange", type: "(sections) => void", description: "Fires after each edit." },
    ],
  },
  {
    slug: "carousel",
    title: "Carousel",
    category: "Data & media",
    description:
      "A horizontal row of comparable items with tall images, a save toggle, a rating and a meta row, with a fading edge and next button.",
    displayModes: "inline, borderless",
    variant: "borderless",
    source: `${KIT} · Inline carousel`,
    checks: ["3–8 items (dev warning outside that range)", "Next card peeks behind a fade", "One action per card (save)"],
    usage: `import { Carousel } from "@/components/carousel"

<Carousel
  label="Nearby hikes"
  items={trails.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: t.park,
    image: t.photo,
    rating: t.rating,
    meta: [t.difficulty, t.distance],
    saved: t.saved,
    onSave: (saved) => app.callServerTool({ name: "save_trail", arguments: { id: t.id, saved } }),
  }))}
/>`,
    props: [
      { name: "items", type: "CarouselItem[]", description: "id, title, subtitle?, image?, rating?, meta?, saved?, onSave?, onClick?" },
      { name: "cardWidth / imageHeight", type: "number", description: "Default 220 × 280, as in the kit." },
      { name: "label", type: "string", description: "Accessible name for the scroll region." },
    ],
  },
  {
    slug: "skeleton",
    title: "Skeleton",
    category: "Feedback",
    description:
      "Loading placeholders. RowsSkeleton is the kit's loading state for lists and tables; InlineCardSkeleton and CarouselSkeleton match those components.",
    displayModes: "inline, fullscreen",
    variant: "card",
    source: `${KIT} · Inline card / Loading`,
    checks: ["Matches the final layout", "No spinners", "Announced as loading to screen readers"],
    usage: `import { RowsSkeleton } from "@/components/skeleton"

{data ? <ListView items={data.items} /> : <RowsSkeleton rows={4} columns={3} />}`,
    props: [
      { name: "RowsSkeleton", type: "{ rows?, columns?, avatar? }", description: "Avatar + columns, as in the kit." },
      { name: "InlineCardSkeleton", type: "{ fields?, actions? }", description: "Matches InlineCard." },
      { name: "CarouselSkeleton", type: "{ count?, cardWidth? }", description: "Matches Carousel." },
      { name: "HostSkeleton", type: "component", description: "A single pulsing block." },
    ],
  },
  {
    slug: "inline-card",
    title: "Inline card",
    category: "Inline cards",
    description:
      "A compact card for the conversation: a title, up to five data points and up to two actions. Its height always fits its content.",
    displayModes: "inline",
    variant: "borderless",
    source: "MCP Blocks UI",
    checks: [
      "At most 5 data points (dev warning above that)",
      "At most 2 actions, placed at the bottom",
      "No inner scrolling, height fits content",
      "44px tap targets",
    ],
    usage: `import { InlineCard } from "@/components/inline-card"

export function DealSummary({ deal }) {
  return (
    <InlineCard
      title={deal.name}
      badge={{ label: "At risk", tone: "warning" }}
      fields={[
        { label: "Owner", value: deal.owner },
        { label: "Stage", value: deal.stage },
      ]}
      actions={[
        { label: "Open record", onClick: () => app.requestDisplayMode({ mode: "fullscreen" }) },
        { label: "Draft follow-up", onClick: () => app.sendMessage({ role: "user", content: [{ type: "text", text: "Draft a follow-up" }] }) },
      ]}
    />
  )
}`,
    props: [
      { name: "title", type: "ReactNode", description: "Card heading." },
      { name: "badge", type: "{ label, tone? }", description: "Status chip: neutral, info, success, warning or danger." },
      { name: "fields", type: "{ label, value }[]", description: "Data points. Keep to 5 or fewer." },
      { name: "actions", type: "{ label, onClick?, variant? }[]", description: "Up to 2 buttons. First is primary." },
      { name: "columns", type: "1 | 2 | 3 | 4", description: "Field grid columns. 4 collapses to 2 on narrow widths." },
    ],
  },
  {
    slug: "status-update",
    title: "Status update",
    category: "Feedback",
    description:
      "Confirms what happened after an action, with the host's semantic colors and one optional follow-up.",
    displayModes: "inline",
    variant: "borderless",
    source: "MCP Blocks UI",
    checks: ["Semantic host tokens only", "Icon has a text label", "One follow-up action at most"],
    usage: `import { StatusUpdate } from "@/components/status-update"

<StatusUpdate
  tone="success"
  title="Invoice sent to Northwind"
  description="INV-2041 · delivered just now"
  action={{ label: "View", onClick: openInvoice }}
/>`,
    props: [
      { name: "tone", type: "success | info | warning | danger", description: "Sets icon and colors." },
      { name: "title", type: "ReactNode", description: "What happened." },
      { name: "action", type: "{ label, onClick? }", description: "Optional follow-up, like Undo or View." },
    ],
  },
];

export const roadmap = [
  { title: "Document editor", description: "Fullscreen editing with a toolbar and Claude's inline suggestions (kit: Full screen / Document editing)." },
  { title: "Cohort heatmap", description: "Fullscreen data view with range sliders and a heatmap table (kit: Full screen / Data visualization)." },
  { title: "Task table", description: "Fullscreen project table with status, priority and timeline tags (kit: Full screen / Task management)." },
]

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug)
}

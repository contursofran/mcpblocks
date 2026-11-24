export type ComponentDoc = {
  slug: string
  title: string
  description: string
  displayModes: string
  checks: string[]
  usage: string
  props: { name: string; type: string; description: string }[]
}

export const components: ComponentDoc[] = [
  {
    slug: "inline-card",
    title: "Inline card",
    description:
      "A compact card for the conversation: a title, up to five data points and up to two actions. Its height always fits its content.",
    displayModes: "inline",
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
    slug: "confirm-action",
    title: "Confirm action",
    description:
      "For changes Claude has prepared. The user approves in the widget; edits go back through the chat, as Claude's guidelines recommend.",
    displayModes: "inline",
    checks: [
      "Approve in the widget, free-text edits in the chat",
      "Working, done and error states in place, no layout jump",
      "Undo offered after success",
    ],
    usage: `import { ConfirmAction } from "@/components/confirm-action"

<ConfirmAction
  title="Update deal stage"
  fields={[
    { label: "From", value: "Proposal" },
    { label: "To", value: "Negotiation" },
  ]}
  onApprove={() => app.callServerTool({ name: "update_deal", arguments: { id, stage } })}
  onEditInChat={() => app.sendMessage({ role: "user", content: [{ type: "text", text: "Change the stage" }] })}
  doneTitle="Deal moved to Negotiation"
/>`,
    props: [
      { name: "onApprove", type: "() => unknown", description: "Return a promise to show the working state; a rejection shows the error state." },
      { name: "onEditInChat", type: "() => void", description: "Hand the edit back to the conversation." },
      { name: "onUndo", type: "() => void", description: "Shows an Undo button after success." },
      { name: "status", type: "pending | working | done | error", description: "Control the state from outside, e.g. from a tool result." },
    ],
  },
  {
    slug: "carousel",
    title: "Carousel",
    description:
      "A horizontal row of comparable items, each with an image, a title, up to three lines of metadata and one optional action.",
    displayModes: "inline, borderless",
    checks: [
      "3–8 items (dev warning outside that range)",
      "Consistent card size, next card peeks into view",
      "Scroll padding respects safe-area insets",
      "One CTA per card",
    ],
    usage: `import { Carousel } from "@/components/carousel"

// Register the resource with _meta.ui.prefersBorder = false
// so the row can bleed to the edges.
<Carousel
  label="Places to stay"
  items={stays.map((s) => ({
    id: s.id,
    title: s.name,
    image: s.photo,
    meta: [s.guests, s.area],
    cta: { label: "Select", onClick: () => select(s.id) },
  }))}
/>`,
    props: [
      { name: "items", type: "CarouselItem[]", description: "id, title, image?, meta? (max 3), cta?." },
      { name: "cardWidth", type: "number", description: "Card width in px. Default 210." },
      { name: "label", type: "string", description: "Accessible name for the scroll region." },
    ],
  },
  {
    slug: "status-update",
    title: "Status update",
    description:
      "Confirms what happened after an action, with the host's semantic colors and one optional follow-up.",
    displayModes: "inline",
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
  {
    slug: "skeleton",
    title: "Skeleton",
    description:
      "Loading placeholders shaped like InlineCard and Carousel, so content swaps in without a jump. Claude's guidelines prefer these to spinners.",
    displayModes: "inline, fullscreen",
    checks: ["Matches the final layout", "No spinners", "Announced as loading to screen readers"],
    usage: `import { InlineCardSkeleton } from "@/components/skeleton"

{data ? <InlineCard {...data} /> : <InlineCardSkeleton fields={4} actions={2} />}`,
    props: [
      { name: "HostSkeleton", type: "component", description: "A single pulsing block." },
      { name: "InlineCardSkeleton", type: "{ fields?, actions? }", description: "Matches InlineCard." },
      { name: "CarouselSkeleton", type: "{ count?, cardWidth? }", description: "Matches Carousel." },
    ],
  },
]

export const roadmap = [
  { title: "Data table", description: "Sort and filter in place, expands to fullscreen for more rows." },
  { title: "Form", description: "Short structured input. Free text stays in the chat composer." },
  { title: "Fullscreen shell", description: "Collapsible sidebar, tabs and a composer-safe bottom area." },
]

export function getComponent(slug: string) {
  return components.find((c) => c.slug === slug)
}

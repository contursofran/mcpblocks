# Inline card — MCP Blocks UI

> A compact card for the conversation: a title, up to five data points and up to two actions. Its height always fits its content.

- **Category:** Inline cards
- **Display modes:** inline
- **Host container variant:** `borderless` (set `_meta.ui.prefersBorder: false`)
- **Design source:** MCP Blocks UI
- **Docs URL:** https://mcpblocks.dev/components/inline-card
- **Registry JSON:** https://mcpblocks.dev/r/inline-card.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- At most 5 data points (dev warning above that)
- At most 2 actions, placed at the bottom
- No inner scrolling, height fits content
- 44px tap targets

## Usage

```tsx
import { InlineCard } from "@/components/inline-card"

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
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `ReactNode` | Card heading. |
| `badge` | `{ label, tone? }` | Status chip: neutral, info, success, warning or danger. |
| `fields` | `{ label, value }[]` | Data points. Keep to 5 or fewer. |
| `actions` | `{ label, onClick?, variant? }[]` | Up to 2 buttons. First is primary. |
| `columns` | `1 \| 2 \| 3 \| 4` | Field grid columns. 4 collapses to 2 on narrow widths. |

## Changelog

See the version stamp near the top of your copied source. Compare your copy with `npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json --diff components/inline-card.tsx`. Adjust the path to match your installation.

### 0.1.2 · 2026-11-27

- Composed the card, badge and fields from shared UI parts.

Public props are unchanged. Reinstall the block and its new registry dependencies together.

### 0.1.1 · 2026-11-27

- Made field columns and actions respond to container width.
- Adopted host app tokens for brand overrides.

### 0.1.0 · 2026-11-24

- Initial registry release.

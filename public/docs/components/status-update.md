# Status update — MCP Blocks UI

> Confirms what happened after an action, with the host's semantic colors and one optional follow-up.

- **Category:** Feedback
- **Display modes:** inline
- **Host container variant:** `borderless` (set `_meta.ui.prefersBorder: false`)
- **Design source:** MCP Blocks UI
- **Docs URL:** https://mcpblocks.dev/components/status-update
- **Registry JSON:** https://mcpblocks.dev/r/status-update.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/status-update.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- Semantic host tokens only
- Icon has a text label
- One follow-up action at most

## Usage

```tsx
import { StatusUpdate } from "@/components/status-update"

<StatusUpdate
  tone="success"
  title="Invoice sent to Northwind"
  description="INV-2041 · delivered just now"
  action={{ label: "View", onClick: openInvoice }}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `tone` | `success \| info \| warning \| danger` | Sets icon and colors. |
| `title` | `ReactNode` | What happened. |
| `action` | `{ label, onClick? }` | Optional follow-up, like Undo or View. |

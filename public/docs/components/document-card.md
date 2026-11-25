# Document card — MCP Blocks UI

> A page or document preview with properties, lists and tasks that the user can edit in place, then hand back to Claude.

- **Category:** Inline cards
- **Display modes:** inline
- **Host container variant:** `card`
- **Design source:** MCP Apps for Claude kit · Inline card / Inline editing
- **Docs URL:** https://mcpblocks.dev/components/document-card
- **Registry JSON:** https://mcpblocks.dev/r/document-card.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/document-card.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- Small edits in place, big changes in chat
- Checkboxes are real inputs
- onChange returns the full updated content

## Usage

```tsx
import { DocumentCard } from "@/components/document-card"

<DocumentCard
  icon="📋"
  title={page.title}
  properties={[{ label: "Type", value: "Meeting notes", tag: true }]}
  sections={[
    { kind: "list", heading: "Agenda", items: page.agenda },
    { kind: "tasks", heading: "Action items", items: page.tasks, placeholder: "To be filled during meeting" },
  ]}
  onChange={(sections) => app.callServerTool({ name: "update_page", arguments: { id: page.id, sections } })}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `properties` | `{ label, value, tag? }[]` | Key/value rows at the top. |
| `sections` | `DocumentSection[]` | "list" (editable text) or "tasks" (checkboxes). |
| `editable` | `boolean` | Default true. |
| `onChange` | `(sections) => void` | Fires after each edit. |

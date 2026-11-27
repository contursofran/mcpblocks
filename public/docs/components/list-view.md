# List view — MCP Blocks UI

> A short list of rich rows (messages, tickets, search results) with avatars, metadata and a footer link to the rest.

- **Category:** Inline cards
- **Display modes:** inline
- **Host container variant:** `card`
- **Design source:** MCP Apps for Claude kit · Inline card / List views
- **Docs URL:** https://mcpblocks.dev/components/list-view
- **Registry JSON:** https://mcpblocks.dev/r/list-view.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/list-view.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- 4–5 rows inline, link to the rest
- Rows clamp to two lines
- Footer link opens your app or fullscreen

## Usage

```tsx
import { ListView } from "@/components/list-view"

<ListView
  items={messages.map((m) => ({
    id: m.id,
    initials: m.author.initials,
    title: m.author.name,
    meta: m.channel,
    timestamp: m.date,
    body: m.text,
  }))}
  summary={`Showing 4 of ${total} results`}
  viewAll={{ label: "View in App", onClick: () => app.requestDisplayMode({ mode: "fullscreen" }) }}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `ListViewItem[]` | id, initials, avatarColor?, title, meta?, timestamp?, body?, onClick? |
| `summary` | `string` | Footer text, e.g. "Showing 4 of 12 results". |
| `viewAll` | `{ label, href?, onClick? }` | Footer link to the full list. |

## Changelog

See the version stamp near the top of your copied source. Compare your copy with `npx shadcn@latest add https://mcpblocks.dev/r/list-view.json --diff components/list-view.tsx`. Adjust the path to match your installation.

### 0.1.1 · 2026-11-27

- Wrapped list metadata and actions at narrow widths.
- Adopted host app tokens for brand overrides.

### 0.1.0 · 2026-11-24

- Initial registry release.

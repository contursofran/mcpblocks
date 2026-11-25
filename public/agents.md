# MCP Blocks UI — Agent Integration Guide

This file helps AI coding assistants (Claude Code, Cursor, Codex, Antigravity, etc.) choose, install, and wire **MCP Blocks UI** components when building **MCP Apps** (interactive UI views rendered inside Claude, ChatGPT, VS Code, Goose, and Vercel AI SDK hosts).

- **Homepage:** https://mcpblocks.dev
- **Full docs (single file):** https://mcpblocks.dev/llms-full.txt
- **LLM index:** https://mcpblocks.dev/llms.txt
- **Registry manifest:** https://mcpblocks.dev/r/registry.json
- **Live demo MCP server:** https://mcpblocks.dev/mcp
- **Source repo:** https://github.com/contursofran/mcpblocks

## Component Selection Matrix

| User need / UI pattern | Recommended component | Install command |
| --- | --- | --- |
| Search results, Slack threads, tickets, or short list of records (4–5 rows) | `ListView` | `npx shadcn@latest add https://mcpblocks.dev/r/list-view.json` |
| Compact summary card with ≤5 key/value fields and ≤2 action buttons | `InlineCard` | `npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json` |
| Approval / confirmation step for a write action Claude prepared | `ConfirmAction` | `npx shadcn@latest add https://mcpblocks.dev/r/confirm-action.json` |
| Success, info, warning, or error result banner with optional Undo/View button | `StatusUpdate` | `npx shadcn@latest add https://mcpblocks.dev/r/status-update.json` |
| Time-series / metrics trend chart (dependency-free SVG, borderless) | `LineChart` | `npx shadcn@latest add https://mcpblocks.dev/r/line-chart.json` |
| Inline audio playback with seekable waveform + regenerate/download | `MediaPlayer` | `npx shadcn@latest add https://mcpblocks.dev/r/media-player.json` |
| 3–8 visual comparable items (places, products, trails) with save toggle | `Carousel` | `npx shadcn@latest add https://mcpblocks.dev/r/carousel.json` |
| Editable document/notes card with properties, bullet items, and checkboxes | `DocumentCard` | `npx shadcn@latest add https://mcpblocks.dev/r/document-card.json` |
| Loading state while tool results arrive (use skeletons, never spinners) | `RowsSkeleton` / `InlineCardSkeleton` / `CarouselSkeleton` | `npx shadcn@latest add https://mcpblocks.dev/r/skeleton.json` |

## Hard Rules for Claude MCP Apps

Follow these rules whenever generating or modifying MCP App views:

1. **Use `host-*` Tailwind utilities only** (`bg-host-bg`, `bg-host-bg-secondary`, `text-host-fg`, `text-host-fg-tertiary`, `border-host-border-secondary`, `rounded-host-md`, etc.). Never hardcode hex/rgb colors — Claude injects host CSS variables at runtime for light and dark themes.
2. **No floating UI layers:** Do not use dropdowns, popovers, context menus, native `<select>`, or Radix floating primitives. They clip at iframe boundaries and conflict with host z-index.
3. **No nested vertical scrolling or viewport height units:** Inline widgets must auto-fit their content height (stay under ~520px). Never use `overflow-y-auto`, `overflow-auto`, `h-screen`, `vh`, or `dvh`.
4. **Inline limits:** Keep inline cards to ≤5 fields and ≤2 actions at the bottom. Keep carousels to 3–8 items. Send edits back through chat via `app.sendMessage(...)` rather than building full forms inline.
5. **44×44px minimum tap targets:** Use `HostButton` (`min-h-11`) or `size-11` for interactive icon buttons.
6. **Skeletons, not spinners:** Render `RowsSkeleton`, `InlineCardSkeleton`, or `CarouselSkeleton` while waiting for tool results.
7. **Borderless views:** For `LineChart`, `Carousel`, `InlineCard`, and `StatusUpdate`, set `_meta: { ui: { prefersBorder: false } }` on the `ui://` resource so the host does not draw a double border.
8. **Sandbox constraints:** Never rely on `localStorage`, `sessionStorage`, `document.cookie`, or `window.openai`.

## Standard View Wiring (`@modelcontextprotocol/ext-apps` 2.x)

```tsx
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react"
import { useEffect, useState } from "react"
import { InlineCard } from "@/components/inline-card"
import { RowsSkeleton } from "@/components/skeleton"
import { applyHostContext } from "@/lib/host"

export function View() {
  const [data, setData] = useState<any>(null)
  const { app } = useApp({
    appInfo: { name: "my-mcp-app", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (result) => setData(result.structuredContent)
      app.onhostcontextchanged = (ctx) => applyHostContext(ctx)
    },
  })

  useHostStyles(app, app?.getHostContext())
  useEffect(() => {
    if (app) applyHostContext(app.getHostContext())
  }, [app])

  if (!data) return <RowsSkeleton rows={3} columns={3} />
  return <InlineCard title={data.title} fields={data.fields} actions={data.actions} />
}
```

## Server Pattern (`@modelcontextprotocol/ext-apps/server`)

- Register tools with `registerAppTool` pointing `_meta: { ui: { resourceUri: "ui://my-app/view.html" } }`.
- Keep mutating confirmation tools hidden from the LLM using `visibility: ["app"]` so only the UI can invoke them via `app.callServerTool(...)`.
- Always return useful text in `content` alongside `structuredContent` so text-only hosts still work.
- Bundle the React view into a single HTML file (e.g. `vite-plugin-singlefile`) and serve it via `registerAppResource` with `mimeType: RESOURCE_MIME_TYPE` (`text/html;profile=mcp-app`).

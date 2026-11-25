# mcpblocks

Copy-paste React components for **MCP Apps** that feel native inside Claude, and still work in ChatGPT and other MCP hosts. Distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry).

Docs and live previews: <https://mcpblocks.dev>

## What's here

| Path | What it is |
| --- | --- |
| `registry/mcpblocks/` | The components you distribute (source of truth) |
| `registry.json` | Registry manifest; `pnpm registry:build` writes `public/r/*.json` |
| `app/` | Docs site: landing page, component pages, tokens, installation and MCP server guides |
| `components/site/` | Site-only pieces: host preview frame, demos, code blocks |
| `lib/docs.ts` | Component docs content (descriptions, usage, props, checks) |
| `examples/deal-app/` | Example MCP server rendering the blocks as MCP App views; add it to Claude as a custom connector |

### Components (free)

| Item | What it is |
| --- | --- |
| `list-view` | Short list of rich rows (avatar, title, meta, body) with a footer link |
| `confirm-action` | Confirmation for a change Claude prepared, with one confirm button and a checklist |
| `media-player` | Inline audio card with play/pause and a seekable waveform |
| `line-chart` | Borderless SVG line chart with tooltip, range tabs and legend |
| `document-card` | Document preview with properties, editable lists and tasks |
| `carousel` | 3–8 comparable items with tall images, save toggle and rating |
| `inline-card` | Compact card with up to 5 data points and 2 actions |
| `status-update` | Success, info, warning and error confirmations |
| `skeleton` | Loading placeholders (`RowsSkeleton`, `InlineCardSkeleton`, `CarouselSkeleton`) |

### Building blocks

- `host-tokens`: every color, type size and radius from the MCP Apps for Claude kit (light and dark) as fallbacks for the CSS variables the host injects, mapped to Tailwind utilities (`bg-host-bg`, `text-host-fg`, `text-host-heading-lg`, `rounded-host-md`, …). Inside Claude, the host's values win.
- `host` (lib): `applyHostContext()` for theme, display mode and safe-area insets, plus dev-only guideline warnings.
- `host-button`: button with host tokens and a 44px tap target.
- `icons`: 38 icons from the kit as `currentColor` components.

### Host preview

Each component page renders the demo inside `HostPreview`, a simulated host frame with light/dark, inline/fullscreen and web/mobile toggles. It sets the same token and safe-area variables the host does and flags inline widgets taller than ~520px. It is a visual simulation, not a sandboxed iframe speaking the MCP Apps protocol yet. That's the natural next step (the `AppBridge` in `@modelcontextprotocol/ext-apps` handles the protocol side).

## Develop

```bash
pnpm install
pnpm dev             # docs site on http://localhost:3000
pnpm registry:build  # regenerate public/r/*.json after changing registry/
pnpm build           # production build
```

## Install a component (consumers)

Requires a React project with Tailwind CSS v4 and a `components.json` (run `npx shadcn@latest init` if you don't have one).

```bash
npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json
```

The CLI also installs the dependencies of the component (`host-tokens`, `host`, `host-button`, `icons`) and adds the host CSS variables to your stylesheet. Swap `inline-card` for any item above.

Inside an MCP App, apply the host context once the app has connected and on every change:

```ts
import { applyHostContext } from "@/lib/host"

app.onhostcontextchanged = (ctx) => applyHostContext(ctx)
```

Full guides: [Installation](https://mcpblocks.dev/docs/installation) and [Using with an MCP server](https://mcpblocks.dev/docs/mcp-server) (register a tool and `ui://` resource with `@modelcontextprotocol/ext-apps`, then render the view with these components).

## Attribution

Component designs are adapted from [MCP Apps for Claude](https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude) by Anthropic, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Changes: rebuilt as React components and adapted for other MCP hosts. Fonts from that file (Anthropic Sans/Serif) are not included; Claude provides them at runtime.

The site is built on the [shadcn registry template](https://github.com/shadcn-ui/registry-template) (MIT).

mcpblocks is an independent project, not affiliated with or endorsed by Anthropic or OpenAI.

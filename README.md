# mcpblocks

Copy-paste React components for **MCP Apps** that feel native inside Claude, and still work in ChatGPT and other MCP hosts. Distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry).

> Replace the placeholder registry domain `inlinekit.dev` before publishing.

## What's here

| Path | What it is |
| --- | --- |
| `registry/inlinekit/` | The components you distribute (source of truth) |
| `registry.json` | Registry manifest; `pnpm registry:build` writes `public/r/*.json` |
| `app/` | Docs site: landing page and one page per component |
| `components/site/` | Site-only pieces: host preview frame, demos, code blocks |
| `lib/docs.ts` | Component docs content (descriptions, usage, props, checks) |

### Components (free)

- `host-tokens`: fallback values for the CSS variables the host injects, mapped to Tailwind utilities (`bg-host-bg`, `text-host-fg`, `border-host-border`, `rounded-host-md`, …). Inside Claude, the host's values win.
- `host` (lib): `applyHostContext()` for theme, display mode and safe-area insets, plus dev-only guideline warnings.
- `host-button`, `inline-card`, `confirm-action`, `carousel`, `status-update`, `skeleton`.

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

```bash
npx shadcn@latest add https://inlinekit.dev/r/inline-card.json
```

Inside an MCP App, apply the host context once after `ui/initialize`:

```ts
import { applyHostContext } from "@/lib/host"

app.onhostcontextchanged = (ctx) => applyHostContext(ctx)
```

## Attribution

Component designs are adapted from [MCP Apps for Claude](https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude) by Anthropic, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Changes: rebuilt as React components and adapted for other MCP hosts. Fonts from that file (Anthropic Sans/Serif) are not included; Claude provides them at runtime.

The site is built on the [shadcn registry template](https://github.com/shadcn-ui/registry-template) (MIT).

mcpblocks is an independent project, not affiliated with or endorsed by Anthropic or OpenAI.

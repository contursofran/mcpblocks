# MCP Blocks UI (`mcpblocks`)

**Claude-native React UI components for [MCP Apps](https://modelcontextprotocol.io/).**

Copy-and-paste cards, approvals, charts, media players, carousels, and skeletons built on Claude's host CSS tokens, display-mode rules, and mobile safe areas — degrading cleanly in ChatGPT, VS Code, Goose, and Vercel AI SDK hosts. Distributed as a free, open-source [shadcn/ui registry](https://ui.shadcn.com/docs/registry).

- **Docs & live previews:** <https://mcpblocks.dev>
- **Live demo MCP server:** `https://mcpblocks.dev/mcp` (add as a custom connector in Claude)
- **LLM / Agent docs:** [`llms.txt`](https://mcpblocks.dev/llms.txt) · [`llms-full.txt`](https://mcpblocks.dev/llms-full.txt) · [`agents.md`](https://mcpblocks.dev/agents.md) · [`r/registry.json`](https://mcpblocks.dev/r/registry.json)

---

## Quick start

Requires React 18+, Tailwind CSS v4 (`@theme inline`), and a `components.json` (`npx shadcn@latest init`).

```bash
npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json
```

The shadcn CLI copies the component source directly into your repo and installs its dependencies (`host-tokens`, `host`, `host-button`, `icons`). Swap `inline-card` for any component below.

Inside your MCP App view (`@modelcontextprotocol/ext-apps` 2.x), apply host styles and context on connect and change:

```tsx
import { useApp } from "@modelcontextprotocol/ext-apps/react"
import { useEffect } from "react"

import { applyHostContext } from "@/lib/host"

const { app } = useApp({
  appInfo: { name: "my-mcp-app", version: "1.0.0" },
  capabilities: {},
  onAppCreated: (app) => {
    app.onhostcontextchanged = () => applyHostContext(app.getHostContext())
  },
})

useEffect(() => {
  if (app) applyHostContext(app.getHostContext())
}, [app])
```

Full guides: **[Installation](https://mcpblocks.dev/docs/installation)** · **[Using with an MCP server](https://mcpblocks.dev/docs/mcp-server)** · **[Design tokens](https://mcpblocks.dev/tokens)**

---

## Components

| Component | Display mode | What it is | Install |
| --- | --- | --- | --- |
| [`list-view`](https://mcpblocks.dev/components/list-view) | inline | Short list of rich rows (avatar, title, meta, body) with a footer link | `.../r/list-view.json` |
| [`confirm-action`](https://mcpblocks.dev/components/confirm-action) | inline | Confirmation for a change Claude prepared, with one confirm button and a checklist | `.../r/confirm-action.json` |
| [`inline-card`](https://mcpblocks.dev/components/inline-card) | inline, borderless | Compact card with up to 5 data points and 2 actions | `.../r/inline-card.json` |
| [`document-card`](https://mcpblocks.dev/components/document-card) | inline | Document preview with properties, editable lists, and tasks | `.../r/document-card.json` |
| [`line-chart`](https://mcpblocks.dev/components/line-chart) | inline, borderless | Dependency-free SVG line chart with tooltip, range tabs, and legend | `.../r/line-chart.json` |
| [`media-player`](https://mcpblocks.dev/components/media-player) | inline | Inline audio card with play/pause and a keyboard-seekable waveform | `.../r/media-player.json` |
| [`carousel`](https://mcpblocks.dev/components/carousel) | inline, borderless | 3–8 comparable items with tall images, save toggle, rating, and safe-area scroll snap | `.../r/carousel.json` |
| [`status-update`](https://mcpblocks.dev/components/status-update) | inline, borderless | Success, info, warning, and error confirmations using semantic host tokens | `.../r/status-update.json` |
| [`skeleton`](https://mcpblocks.dev/components/skeleton) | inline, fullscreen | Loading placeholders (`RowsSkeleton`, `InlineCardSkeleton`, `CarouselSkeleton`) | `.../r/skeleton.json` |

### Building blocks

- **`host-tokens`**: Light and dark fallbacks for host colors, typography, and radii, mapped to Tailwind utilities (`bg-host-bg`, `text-host-fg`, `text-host-heading-lg`, `rounded-host-md`, …).
- **`host`** (`lib/host.ts`): `applyHostContext()`, `applySafeAreaInsets()`, `tellModel()`, and dev-only `guideline()` warnings.
- **`host-button`**: Button styled with host tokens and a 44px minimum tap target.
- **`icons`**: 38 `currentColor` icons adapted from Anthropic's *MCP Apps for Claude* kit.

---

## Host preview & conformance

- **Live DOM linter (`HostPreview`):** Every component page simulates Light/Dark, Inline/Fullscreen, and Web/Mobile frames while checking inline height (~520px cap), nested vertical scroll, floating menus, 44px tap targets, and horizontal overflow in real time.
- **Automated conformance ([`CONFORMANCE.md`](./CONFORMANCE.md)):** ESLint and `pnpm check:conformance` enforce Claude's MCP Apps rules (no floating Radix primitives, no vertical scroll containers, no `vh`/`dvh` units, no hardcoded colors, `currentColor` icons, token parity, and registry freshness).

---

## Repository layout

| Path | Purpose |
| --- | --- |
| `registry/mcpblocks/` | Distributable component source (source of truth) |
| `registry.json` | Registry manifest; `pnpm registry:build` writes `public/r/*.json` |
| `app/` | Docs site: landing page, component pages, tokens, and guides |
| `components/site/` | Site-only UI: `HostPreview`, demos, code blocks |
| `lib/` | Component docs content (`docs.ts`), tokens (`tokens.ts`), host context, and JSON-LD schema |
| `scripts/` | Conformance checker (`check-conformance.mjs`) and LLM/agent doc generator (`generate-llms.mjs`) |
| `examples/deal-app/` | Example MCP server (Node + Cloudflare Worker at `https://mcpblocks.dev/mcp`) |

---

## Develop & contribute

Contributions are welcome! Open an issue or pull request against `master`.

```bash
pnpm install
pnpm dev               # docs site at http://localhost:3000
pnpm storybook         # component stories at http://localhost:6006
pnpm registry:build    # regenerate public/r/*.json after editing registry/
pnpm llms:build        # regenerate public/llms*.txt, public/agents.md, and component .md docs
pnpm check:conformance # verify MCP Apps guidelines, token parity, and registry freshness
pnpm lint              # ESLint (includes MCP Apps rules for registry/mcpblocks/)
pnpm build             # production static export
```

Before opening a PR that modifies `registry/mcpblocks/` or `lib/docs.ts`, run `pnpm registry:build && pnpm llms:build && pnpm check:conformance && pnpm lint && pnpm build` and commit the updated generated files in `public/`.

---

## License & Attribution

Code in this repository is licensed under the **[MIT License](./LICENSE)**.

Component designs and icons are adapted from [MCP Apps for Claude](https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude) by Anthropic, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Changes: rebuilt as React components and adapted for other MCP hosts. Proprietary fonts from that file (Anthropic Sans/Serif) are not included; Claude provides them at runtime.

The docs site is based on the [shadcn registry template](https://github.com/shadcn-ui/registry-template) (MIT).

MCP Blocks UI is an independent project, not affiliated with or endorsed by Anthropic or OpenAI.

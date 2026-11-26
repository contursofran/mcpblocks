# Conformance

Tracks `mcpblocks` against Anthropic's [MCP Apps design guidelines](https://claude.com/docs/connectors/building/mcp-apps/design-guidelines) and the [MCP Apps specification](https://modelcontextprotocol.io/).

| | |
| --- | --- |
| **Last verified** | 2026-11-25 |
| **Automated checks** | `pnpm lint` + `pnpm check:conformance` + live DOM linter in `HostPreview` |

## Rules & Enforcement

| Rule | How `mcpblocks` enforces it |
| --- | --- |
| **No dropdowns, context menus, popovers or floating panels** | ESLint `no-restricted-imports` and `scripts/check-conformance.mjs` ban floating `@radix-ui/react-*` primitives and the `radix-ui` barrel in `registry/mcpblocks/`. `HostPreview` DOM linter flags `<select>` and `role="menu"` / `role="dialog"` / `role="listbox"` elements inline. |
| **Inline cards auto-fit height; no nested vertical scrolling** | ESLint and `scripts/check-conformance.mjs` ban `overflow-auto`, `overflow-y-auto`, `overflow-scroll`, and `overflow-y-scroll` in `registry/mcpblocks/`. `HostPreview` DOM linter checks rendered computed styles for vertical scroll containers (`scrollHeight > clientHeight` with `overflow-y: auto|scroll`) and flags inline widgets taller than ~520px. |
| **No viewport units for height** | ESLint and `scripts/check-conformance.mjs` ban `h-screen`, `vh`, `svh`, `lvh`, and `dvh` in `registry/mcpblocks/`. |
| **At most 2 actions and 4–5 fields in inline cards** | `InlineCard` logs dev-only `[mcpblocks]` warnings via `guideline()` when `actions.length > 2` or `fields.length > 5`, and slices actions to 2. `HostPreview` DOM linter flags >2 action buttons in inline mode. |
| **3–8 comparable items in inline carousels** | `Carousel` warns via `guideline()` outside 3–8 items and uses `scroll-padding-inline` with `--mb-safe-left` / `--mb-safe-right`. |
| **Tap targets at least 44×44px** | `HostButton` enforces `min-h-11` (44px); interactive icon buttons in `Carousel` and `MediaPlayer` use `size-11` (44×44px). Inline text links (such as the footer link in `ListView`) follow the WCAG 2.5.8 inline exception. `HostPreview` DOM linter flags interactive buttons under 44px. |
| **Host CSS tokens only (no hardcoded colors)** | Components use `host-*` Tailwind utilities backed by Claude's host variables (`--color-background-primary`, etc.) with light/dark fallbacks in `host-tokens`. `scripts/check-conformance.mjs` blocks literal hex/rgb/hsl colors in `registry/mcpblocks/` (allowlisting only `LineChart`'s categorical `PALETTE` array) and verifies `app/globals.css` matches `registry.json`. |
| **Icons use `currentColor`** | `scripts/check-conformance.mjs` checks `registry/mcpblocks/ui/icons.tsx` so icons inherit host text colors in light and dark themes. |
| **No sandbox-blocked APIs or ChatGPT globals** | ESLint and `scripts/check-conformance.mjs` ban `localStorage`, `sessionStorage`, `document.cookie`, and `window.openai` in `registry/mcpblocks/`. |
| **Skeletons, not spinners** | `skeleton` provides `RowsSkeleton`, `InlineCardSkeleton`, and `CarouselSkeleton`; no spinner component is shipped. |
| **Safe-area insets honored** | `applySafeAreaInsets()` writes `--mb-safe-{top,right,bottom,left}` from `hostContext.safeAreaInsets`; `Carousel` and fullscreen previews read them. |
| **Registry manifest & built artifacts stay in sync** | `scripts/check-conformance.mjs` validates `registry.json` paths, internal `registryDependencies`, and verifies every `public/r/*.json` matches source on disk. |

## Notes & Known Findings

- **WCAG AA contrast on `info` badges in light mode:** Claude's published `--color-text-info` (`#3266ad`) on `--color-background-info` (`#d6e4f6`) measures **4.47:1** in light mode (just under the 4.5:1 AA minimum for normal text). Text badges in `InlineCard` and `DocumentCard` therefore use `bg-host-info-bg` with `text-host-fg` and a subtle `border-host-info-border/40` (14.3:1 light / 10.0:1 dark). `StatusUpdate`'s info chip renders an icon only, where 4.47:1 clears WCAG's 3:1 non-text threshold.
- **Data visualization palette:** `LineChart` uses a four-color categorical `PALETTE` array because MCP Apps host tokens do not define multi-series chart colors. Consumers can override per-series `color` props.

# AGENTS.md — mcpblocks handoff

Read this first. It is the full context for continuing this project.

## What this is

**mcpblocks** (display name **MCP Blocks UI**; domain **mcpblocks.dev**, registered on Cloudflare) is a free, open-source shadcn-style component registry for **MCP Apps**: interactive UI widgets that MCP servers render inside AI hosts. It is designed Claude-first (Claude's host CSS tokens, display-mode rules, mobile safe areas) and should degrade gracefully in ChatGPT, VS Code and other MCP Apps hosts.

**Strategy (decided):** ship free first, measure traffic, waitlist signups and template votes. Only add paid templates/blocks if there is demand. A likely paid candidate later is a local CLI host preview (`npx mcpblocks preview`) that works with any MCP App. A "we build your MCP App" service is also a possible revenue path.

**Positioning vs existing work:** Manifest UI (mnfst/manifest-ui) and others already do shadcn-for-MCP-Apps but lean ChatGPT. Our differentiators are (1) Claude-native tokens and rules, (2) a Claude-accurate host preview with guideline checks, (3) later, templates for the new "full app inside Claude" mode (Nov 2026, in developer preview).

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn CLI v3 registry. Package manager: **pnpm**. Base: `shadcn-ui/registry-template` (MIT), example items removed.

```bash
pnpm install
pnpm dev             # http://localhost:3000
pnpm registry:build  # regenerates public/r/*.json from registry.json
pnpm build           # must pass (type-check + lint)
pnpm lint
```

Current state: `pnpm build`, `pnpm lint` and `pnpm registry:build` all pass. Pages were visually checked in light/dark, inline/fullscreen, web/mobile.

## Layout

| Path | Purpose |
| --- | --- |
| `registry.json` | Registry manifest (source of truth for distributable items) |
| `registry/mcpblocks/ui/host-button.tsx` | Shared button, host tokens, 44px min height |
| `registry/mcpblocks/lib/host.ts` | `applyHostContext`, `applySafeAreaInsets`, `guideline()` dev warnings |
| `registry/mcpblocks/components/*.tsx` | `inline-card`, `confirm-action`, `carousel`, `status-update`, `skeleton` |
| `public/r/*.json` | Built registry output (generated, commit it) |
| `app/globals.css` | Site theme + the host-token layer (mirror of the `host-tokens` item) |
| `app/page.tsx` | Landing page |
| `app/components/[name]/page.tsx` | Per-component docs page (SSG) |
| `components/site/host-preview.tsx` | Simulated host frame + guideline checks |
| `components/site/demos.tsx` | Demo usages rendered in previews |
| `components/site/chrome.tsx` | Header, footer (attribution), `GITHUB_URL` |
| `lib/docs.ts` | Docs content: descriptions, usage snippets, props, checks, roadmap |

## Key design decisions (keep these)

1. **Host tokens via Tailwind utilities.** Claude injects CSS variables like `--color-background-primary`, `--color-text-primary`, `--color-border-secondary`, `--border-radius-md`, `--font-sans` on the document. We define light/dark *fallbacks* in `:root` / `.dark` / `[data-host-theme="dark"]`, and map them in `@theme inline` to utilities: `bg-host-bg`, `bg-host-bg-secondary`, `text-host-fg`, `text-host-fg-tertiary`, `border-host-border-secondary`, `bg-host-success-bg`, `text-host-danger-fg`, `rounded-host-md`, etc. Inside the host, the host's inline values win. **Components must only use `host-*` utilities, never hardcoded colors.**
   - Do not define `--color-background-primary` etc. inside `@theme` (Tailwind v4 namespace collision / circular var). Keep fallbacks in `:root`, mapping in `@theme inline`.
   - The `host-tokens` registry item ships the same mapping via `cssVars` (theme/light/dark) in `registry.json`. If you change tokens, update **both** `app/globals.css` and `registry.json`.
2. **Safe areas** are CSS vars `--mb-safe-top|right|bottom|left` set by `applySafeAreaInsets()` from `hostContext.safeAreaInsets`.
3. **Claude guideline limits are enforced softly**: `guideline()` logs dev-only warnings (InlineCard >5 fields or >2 actions; Carousel outside 3–8 items). Inline widgets: no nested scrolling, no dropdowns/popovers, height fits content, max 2 actions, 44px tap targets, skeletons not spinners. Edits go back through chat (`ui/message`), not forms in the widget.
4. **Registry imports** use `@/registry/mcpblocks/...` paths; the shadcn CLI rewrites them on install. Internal `registryDependencies` use full URLs `https://mcpblocks.dev/r/<name>.json`.
5. **Font**: components use `font-[family-name:var(--font-sans)]` so Claude's injected font applies. Do NOT bundle Anthropic Sans/Serif (not covered by the CC BY license). Site uses Inter / Instrument Serif / JetBrains Mono via a Google Fonts `<link>` (not `next/font`, so builds don't need network).
6. **ext-apps API** (`@modelcontextprotocol/ext-apps`, class `App`): `app.callServerTool({ name, arguments })`, `app.sendMessage({ role: "user", content: [{ type: "text", text }] })`, `app.requestDisplayMode({ mode: "fullscreen" })`, `app.onhostcontextchanged = (ctx) => ...`. Verify against the package's `dist/src/app.d.ts` before adding new calls.

## Legal / attribution (must keep)

- Designs adapted from Anthropic's Figma kit **"MCP Apps for Claude"** (https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude), **CC BY 4.0** (confirmed on the Figma page). Attribution + "changes made" note lives in the footer (`components/site/chrome.tsx`) and README. Keep it.
- Keep "independent project, not affiliated with or endorsed by Anthropic or OpenAI".
- Don't use Claude/Anthropic logos or make the preview a pixel copy of Claude's UI. "Claude-like" behavior and tokens are fine.
- Site is based on shadcn registry-template (MIT).

## Placeholders to replace before launch

- Domain mcpblocks.dev is registered (Cloudflare). Still to claim: the `mcpblocks` npm name / `@mcpblocks` npm org, and the GitHub org. The code already uses `https://mcpblocks.dev`.
- `GITHUB_URL` in `components/site/chrome.tsx` (`your-org/mcpblocks`).
- Waitlist form in `app/page.tsx` has `action="#"`; wire to an email provider (server action + e.g. Resend/Loops/Buttondown) and add basic analytics (Vercel Analytics or Plausible) to measure the free-first experiment.

## Not yet verified

- End-to-end `npx shadcn add <url>` into a fresh Next.js + Tailwind v4 project (needs the registry deployed to a real URL). Check: cssVars land correctly, import paths rewrite, `host-tokens` utilities resolve.
- Rendering inside real Claude (deploy a sample MCP App using the components).

## SEO (decided)

Target searches like "claude mcp components", "mcp apps components", "claude widgets". Don't use "Claude" in the product name (trademark); use it in titles/taglines ("for Claude MCP Apps"). Site title: "mcpblocks — UI components for Claude MCP Apps". Add per-page `generateMetadata` titles like "Carousel component for Claude MCP Apps | mcpblocks", an OG image, sitemap.ts and robots.ts. Distribution: shadcn registry directory PR, ext-apps community list, awesome-mcp lists, r/ClaudeAI, r/mcp, Show HN, one tutorial post.

## Deploy (decided)

Cloudflare Pages, static export (domain is already in the same Cloudflare account):
- `next.config.ts`: `output: "export"`, `images: { unoptimized: true }`. Build writes `out/` incl. `out/r/*.json`.
- Pages project: build `pnpm build`, output `out`, env `NODE_VERSION=20`. Custom domain `mcpblocks.dev` (+ `www` redirect).
- If server features are needed later (waitlist API, OG images), move to Vercel with Cloudflare DNS set to "DNS only".
- After first deploy, verify `npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json` in a fresh Next.js + Tailwind v4 app.

## Brand (decided)

- Display name **MCP Blocks UI**; logo = "stacked blocks" mark (clay `#D97757` top bar, warm black `#141413` bars). Files: logo zip from the chat (`icon.svg`, `favicon.ico`, `apple-icon.png` go in `app/`).
- Palette: Claude neutrals + clay accent used sparingly (`#D97757` shapes/icons, `#B5543A` for accent text, contrast-safe on ivory). Buttons stay warm black.
- Fonts: Inter + JetBrains Mono. Never ship Anthropic Sans/Serif (proprietary). No Claude logo.
- No waitlist / "free and open source" section for now (opening later).
- Design reference canvas: https://claude.ai/artifact/GHvBjVQ1wSn3jG1Ps2x3dg (landing with chat-window hero, component page, logo concepts).

## Next steps (suggested order)

1. Deploy to Vercel, replace placeholders, run the install test above in a scratch app.
2. Add a minimal example MCP server (`examples/deal-app/`) using `@modelcontextprotocol/ext-apps` + these components, and test it as a custom connector in Claude.
3. **Real host preview:** upgrade `HostPreview` from CSS simulation to a sandboxed iframe host using ext-apps' `AppBridge`, sending `ui/initialize` with hostContext (theme, displayMode, safeAreaInsets, platform) and the token style variables; support pasting a mock tool result as JSON. Keep the guideline checks panel and add DOM-based lint (nested scroll containers, >2 buttons inline, `<select>`/popovers, tap targets <44px, hardcoded colors).
4. Roadmap components (shown as "Soon" in `lib/docs.ts` → `roadmap`): data table (inline → fullscreen), form (short structured input), fullscreen shell (sidebar, tabs, composer-safe bottom).
5. Later, only if demand: paid templates (approval inbox, record viewer, booking flow, full-app shell) and/or the local CLI preview.

## Conventions

- Add a component: create `registry/mcpblocks/components/<name>.tsx`, add an item to `registry.json`, add a demo to `components/site/demos.tsx` (+ `demos` map), add docs to `lib/docs.ts`, run `pnpm registry:build && pnpm build`.
- Accessibility: real `<button>`/`<a>`, `aria-label` on icon-only buttons, text contrast ≥ 4.5:1, status icons with labels.
- Keep components presentational (props + callbacks); host wiring stays in the consumer's app.

#!/usr/bin/env node
/**
 * Generates LLM- and agent-friendly Markdown documentation directly from
 * `lib/docs.ts`, `lib/tokens.ts`, `registry.json`, and `CONFORMANCE.md`:
 *
 *   - public/llms.txt
 *   - public/llms-full.txt
 *   - public/agents.md
 *   - public/docs/components/<slug>.md
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const publicDir = join(root, "public")
const compDocsDir = join(publicDir, "docs", "components")
mkdirSync(compDocsDir, { recursive: true })

async function loadTsModule(relPath) {
  const source = readFileSync(join(root, relPath), "utf8")
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  })
  const url = `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  return import(url)
}

const { components, roadmap } = await loadTsModule("lib/docs.ts")
const { colorGroups, radii, typeScale } = await loadTsModule("lib/tokens.ts")
const { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } = await loadTsModule("lib/site.ts")
const registry = JSON.parse(readFileSync(join(root, "registry.json"), "utf8"))
const conformance = readFileSync(join(root, "CONFORMANCE.md"), "utf8")

const GITHUB_URL = "https://github.com/contursofran/mcpblocks"
const MCP_DEMO_URL = `${SITE_URL}/mcp`

function renderComponentMarkdown(c) {
  const propsTable = [
    "| Prop | Type | Description |",
    "| --- | --- | --- |",
    ...c.props.map(
      (p) =>
        `| \`${p.name}\` | \`${p.type.replaceAll("|", "\\|")}\` | ${p.description} |`
    ),
  ].join("\n")

  return [
    `# ${c.title} — ${SITE_NAME}`,
    "",
    `> ${c.description}`,
    "",
    `- **Category:** ${c.category}`,
    `- **Display modes:** ${c.displayModes}`,
    `- **Host container variant:** \`${c.variant}\`${c.variant === "borderless" ? " (set `_meta.ui.prefersBorder: false`)" : ""}`,
    `- **Design source:** ${c.source}`,
    `- **Docs URL:** ${SITE_URL}/components/${c.slug}`,
    `- **Registry JSON:** ${SITE_URL}/r/${c.slug}.json`,
    "",
    "## Install",
    "",
    "```bash",
    `npx shadcn@latest add ${SITE_URL}/r/${c.slug}.json`,
    "```",
    "",
    "Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.",
    "",
    "## Guidelines",
    "",
    ...c.checks.map((chk) => `- ${chk}`),
    "",
    "## Usage",
    "",
    "```tsx",
    c.usage,
    "```",
    "",
    "## Props",
    "",
    propsTable,
    "",
  ].join("\n")
}

// 1. Per-component markdown pages: public/docs/components/<slug>.md
for (const c of components) {
  writeFileSync(join(compDocsDir, `${c.slug}.md`), renderComponentMarkdown(c), "utf8")
}

// 2. public/llms.txt (llmstxt.org index)
const buildingBlocks = registry.items.filter((i) => i.type !== "registry:component")

const llmsTxt = [
  `# ${SITE_NAME}`,
  "",
  `> ${SITE_TAGLINE}. ${SITE_DESCRIPTION} Distributed as a free, open-source shadcn CLI registry (MIT code; designs adapted from Anthropic's "MCP Apps for Claude" Figma kit under CC BY 4.0).`,
  "",
  "## Quick Install",
  "",
  "Install any component directly into a React + Tailwind CSS v4 project:",
  "",
  "```bash",
  `npx shadcn@latest add ${SITE_URL}/r/inline-card.json`,
  "```",
  "",
  `- [Full registry manifest (JSON)](${SITE_URL}/r/registry.json): Machine-readable shadcn v3 registry index of all ${registry.items.length} items.`,
  `- [Complete single-file LLM docs](${SITE_URL}/llms-full.txt): Full documentation, usage snippets, props, tokens, and server setup in one file.`,
  `- [Agent integration guide](${SITE_URL}/agents.md): Decision matrix, hard Claude MCP Apps rules, and copy-paste wiring for coding agents.`,
  "",
  "## Documentation",
  "",
  `- [Installation](${SITE_URL}/docs/installation): Prerequisites, shadcn CLI setup, and what files get added.`,
  `- [Using with an MCP server](${SITE_URL}/docs/mcp-server): Register tools + \`ui://\` resources with \`@modelcontextprotocol/ext-apps\` and wire \`useApp\` / \`useHostStyles\` / \`applyHostContext\`.`,
  `- [Design tokens](${SITE_URL}/tokens): Complete Claude MCP Apps light/dark CSS variables and Tailwind \`host-*\` utilities.`,
  `- [AppBridge Playground](${SITE_URL}/playground): Live sandboxed iframe host running \`@modelcontextprotocol/ext-apps/app-bridge\` for testing MCP App views and mock tool results.`,
  "",
  "## Components",
  "",
  ...components.map(
    (c) =>
      `- [${c.title}](${SITE_URL}/docs/components/${c.slug}.md) ([web](${SITE_URL}/components/${c.slug}), [registry](${SITE_URL}/r/${c.slug}.json)): ${c.description} (${c.displayModes})`
  ),
  "",
  "## Building Blocks",
  "",
  ...buildingBlocks.map(
    (b) => `- [${b.title}](${SITE_URL}/r/${b.name}.json): ${b.description}`
  ),
  "",
  "## Optional",
  "",
  `- [GitHub repository](${GITHUB_URL}): Source code, conformance checks, and example MCP server (\`examples/deal-app\`).`,
  `- [Live demo MCP server](${MCP_DEMO_URL}): Public Streamable HTTP MCP Apps server (add as a custom connector in Claude or connect from Vercel AI SDK \`@ai-sdk/mcp\`).`,
  `- [Planned fullscreen roadmap](${SITE_URL}/#roadmap): ${roadmap.map((r) => r.title).join(", ")}.`,
  "",
].join("\n")

writeFileSync(join(publicDir, "llms.txt"), llmsTxt, "utf8")

// 3. public/agents.md (agent-first playbook)
const selectionRows = [
  "| User need / UI pattern | Recommended component | Install command |",
  "| --- | --- | --- |",
  "| Search results, Slack threads, tickets, or short list of records (4–5 rows) | `ListView` | `npx shadcn@latest add https://mcpblocks.dev/r/list-view.json` |",
  "| Compact summary card with ≤5 key/value fields and ≤2 action buttons | `InlineCard` | `npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json` |",
  "| Approval / confirmation step for a write action Claude prepared | `ConfirmAction` | `npx shadcn@latest add https://mcpblocks.dev/r/confirm-action.json` |",
  "| Success, info, warning, or error result banner with optional Undo/View button | `StatusUpdate` | `npx shadcn@latest add https://mcpblocks.dev/r/status-update.json` |",
  "| Time-series / metrics trend chart (dependency-free SVG, borderless) | `LineChart` | `npx shadcn@latest add https://mcpblocks.dev/r/line-chart.json` |",
  "| Inline audio playback with seekable waveform + regenerate/download | `MediaPlayer` | `npx shadcn@latest add https://mcpblocks.dev/r/media-player.json` |",
  "| 3–8 visual comparable items (places, products, trails) with save toggle | `Carousel` | `npx shadcn@latest add https://mcpblocks.dev/r/carousel.json` |",
  "| Editable document/notes card with properties, bullet items, and checkboxes | `DocumentCard` | `npx shadcn@latest add https://mcpblocks.dev/r/document-card.json` |",
  "| Loading state while tool results arrive (use skeletons, never spinners) | `RowsSkeleton` / `InlineCardSkeleton` / `CarouselSkeleton` | `npx shadcn@latest add https://mcpblocks.dev/r/skeleton.json` |",
].join("\n")

const agentsMd = [
  `# ${SITE_NAME} — Agent Integration Guide`,
  "",
  `This file helps AI coding assistants (Claude Code, Cursor, Codex, Antigravity, etc.) choose, install, and wire **MCP Blocks UI** components when building **MCP Apps** (interactive UI views rendered inside Claude, ChatGPT, VS Code, Goose, and Vercel AI SDK hosts).`,
  "",
  `- **Homepage:** ${SITE_URL}`,
  `- **Full docs (single file):** ${SITE_URL}/llms-full.txt`,
  `- **LLM index:** ${SITE_URL}/llms.txt`,
  `- **Registry manifest:** ${SITE_URL}/r/registry.json`,
  `- **Live demo MCP server:** ${MCP_DEMO_URL}`,
  `- **Source repo:** ${GITHUB_URL}`,
  "",
  "## Component Selection Matrix",
  "",
  selectionRows,
  "",
  "## Hard Rules for Claude MCP Apps",
  "",
  "Follow these rules whenever generating or modifying MCP App views:",
  "",
  "1. **Use `host-*` Tailwind utilities only** (`bg-host-bg`, `bg-host-bg-secondary`, `text-host-fg`, `text-host-fg-tertiary`, `border-host-border-secondary`, `rounded-host-md`, etc.). Never hardcode hex/rgb colors — Claude injects host CSS variables at runtime for light and dark themes.",
  "2. **No floating UI layers:** Do not use dropdowns, popovers, context menus, native `<select>`, or Radix floating primitives. They clip at iframe boundaries and conflict with host z-index.",
  "3. **No nested vertical scrolling or viewport height units:** Inline widgets must auto-fit their content height (stay under ~520px). Never use `overflow-y-auto`, `overflow-auto`, `h-screen`, `vh`, or `dvh`.",
  "4. **Inline limits:** Keep inline cards to ≤5 fields and ≤2 actions at the bottom. Keep carousels to 3–8 items. Send edits back through chat via `app.sendMessage(...)` rather than building full forms inline.",
  "5. **44×44px minimum tap targets:** Use `HostButton` (`min-h-11`) or `size-11` for interactive icon buttons.",
  "6. **Skeletons, not spinners:** Render `RowsSkeleton`, `InlineCardSkeleton`, or `CarouselSkeleton` while waiting for tool results.",
  "7. **Borderless views:** For `LineChart`, `Carousel`, `InlineCard`, and `StatusUpdate`, set `_meta: { ui: { prefersBorder: false } }` on the `ui://` resource so the host does not draw a double border.",
  "8. **Sandbox constraints:** Never rely on `localStorage`, `sessionStorage`, `document.cookie`, or `window.openai`.",
  "",
  "## Standard View Wiring (`@modelcontextprotocol/ext-apps` 2.x)",
  "",
  "```tsx",
  'import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react"',
  'import { useEffect, useState } from "react"',
  'import { InlineCard } from "@/components/inline-card"',
  'import { RowsSkeleton } from "@/components/skeleton"',
  'import { applyHostContext } from "@/lib/host"',
  "",
  "export function View() {",
  "  const [data, setData] = useState<any>(null)",
  "  const { app } = useApp({",
  '    appInfo: { name: "my-mcp-app", version: "1.0.0" },',
  "    capabilities: {},",
  "    onAppCreated: (app) => {",
  "      app.ontoolresult = (result) => setData(result.structuredContent)",
  "      app.onhostcontextchanged = (ctx) => applyHostContext(ctx)",
  "    },",
  "  })",
  "",
  "  useHostStyles(app, app?.getHostContext())",
  "  useEffect(() => {",
  "    if (app) applyHostContext(app.getHostContext())",
  "  }, [app])",
  "",
  "  if (!data) return <RowsSkeleton rows={3} columns={3} />",
  "  return <InlineCard title={data.title} fields={data.fields} actions={data.actions} />",
  "}",
  "```",
  "",
  "## Server Pattern (`@modelcontextprotocol/ext-apps/server`)",
  "",
  "- Register tools with `registerAppTool` pointing `_meta: { ui: { resourceUri: \"ui://my-app/view.html\" } }`.",
  "- Keep mutating confirmation tools hidden from the LLM using `visibility: [\"app\"]` so only the UI can invoke them via `app.callServerTool(...)`.",
  "- Always return useful text in `content` alongside `structuredContent` so text-only hosts still work.",
  "- Bundle the React view into a single HTML file (e.g. `vite-plugin-singlefile`) and serve it via `registerAppResource` with `mimeType: RESOURCE_MIME_TYPE` (`text/html;profile=mcp-app`).",
  "",
].join("\n")

writeFileSync(join(publicDir, "agents.md"), agentsMd, "utf8")

// 4. public/llms-full.txt (complete self-contained Markdown bundle)
const tokenRows = [
  "| Group | Token | CSS Variable | Tailwind Utility | Light | Dark |",
  "| --- | --- | --- | --- | --- | --- |",
  ...colorGroups.flatMap((g) =>
    g.tokens.map(
      (t) =>
        `| ${g.group} | ${t.name} | \`${t.cssVar}\` | \`${t.utility}\` | \`${t.light}\` | \`${t.dark}\` |`
    )
  ),
].join("\n")

const typeRows = [
  "| Scale | Tailwind Utility | Size | Line Height |",
  "| --- | --- | --- | --- |",
  ...typeScale.map((t) => `| ${t.name} | \`${t.utility}\` | ${t.size} | ${t.lineHeight} |`),
].join("\n")

const radiusRows = [
  "| Name | Tailwind Utility | Value |",
  "| --- | --- | --- |",
  ...radii.map((r) => `| ${r.name} | \`${r.utility}\` | ${r.value} |`),
].join("\n")

const llmsFullTxt = [
  `# ${SITE_NAME} — Complete Documentation`,
  "",
  `> ${SITE_TAGLINE}. ${SITE_DESCRIPTION}`,
  "",
  `- Website: ${SITE_URL}`,
  `- Registry JSON: ${SITE_URL}/r/registry.json`,
  `- Live demo MCP server: ${MCP_DEMO_URL}`,
  `- GitHub: ${GITHUB_URL}`,
  "",
  "---",
  "",
  "## Installation",
  "",
  "Prerequisites: React 18+, Tailwind CSS v4 (`@theme inline`), `components.json` (`npx shadcn@latest init`), and `@modelcontextprotocol/ext-apps`.",
  "",
  "Install any component (dependencies such as `host-tokens`, `host`, `host-button`, and `icons` are installed automatically):",
  "",
  "```bash",
  `npx shadcn@latest add ${SITE_URL}/r/<component-slug>.json`,
  "```",
  "",
  "---",
  "",
  agentsMd,
  "---",
  "",
  "## Component Reference",
  "",
  ...components.map((c) => renderComponentMarkdown(c) + "\n---\n"),
  "## Design Tokens (`host-tokens`)",
  "",
  "Install tokens standalone with:",
  "",
  "```bash",
  `npx shadcn@latest add ${SITE_URL}/r/host-tokens.json`,
  "```",
  "",
  "### Colors",
  "",
  tokenRows,
  "",
  "### Typography Scale",
  "",
  typeRows,
  "",
  "### Border Radii",
  "",
  radiusRows,
  "",
  "---",
  "",
  conformance,
].join("\n")

writeFileSync(join(publicDir, "llms-full.txt"), llmsFullTxt, "utf8")

console.log(
  `Generated LLM/agent docs: public/llms.txt, public/llms-full.txt, public/agents.md, and ${components.length} component markdown files.`
)

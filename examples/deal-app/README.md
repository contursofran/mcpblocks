# Deal app: an example MCP server built with mcpblocks

A small MCP server that renders mcpblocks components as **MCP App views** inside Claude (and any other MCP Apps host). Ask Claude about "deals" and it answers with real UI instead of a wall of text.

| Tool | Block it renders | What it shows |
| --- | --- | --- |
| `list_deals` | `ListView` | Open deals; click a row to ask Claude about it (`app.sendMessage`) |
| `show_deal` | `InlineCard` | One deal with two actions (max 2, per Claude's guidelines) |
| `propose_stage_change` | `ConfirmAction` | Confirm moving a deal to the next stage; Confirm calls the app-only `update_deal_stage` tool (`app.callServerTool`) |
| `pipeline_trend` | `LineChart` | Pipeline vs. closed-won over six months |

While a tool result is on its way the view shows `RowsSkeleton` (skeleton, not a spinner).

## How it fits together

```
server/server.ts   registers tools + the ui:// resource (@modelcontextprotocol/ext-apps/server)
server/main.ts     Node: Streamable HTTP at /mcp (or --stdio)
src/view.tsx       the View: useApp() + useHostStyles(), switches on structuredContent.view
view.html          Vite entry, bundled to ONE file (dist/view.html) by vite-plugin-singlefile
worker/index.ts    Cloudflare Worker entry: the same server at https://mcpblocks.dev/mcp
src/components, src/lib/host.ts, src/styles.css   installed by `npx shadcn add` (see below)
```

- One resource (`ui://deal-app/view.html`) serves every tool. Each tool returns `content` (what the model reads) and `structuredContent` (what the view renders).
- `useHostStyles` applies the CSS variables Claude injects (`--color-background-primary`, fonts, theme). The blocks' `host-*` Tailwind utilities read them, so the UI matches light/dark automatically. `applyHostContext` handles safe-area insets.
- `update_deal_stage` has `visibility: ["app"]`, so the model can't call it directly; only the confirm button can.

## Run it

Requires Node 20+.

```bash
cd examples/deal-app
npm install
npm run build        # type-checks and bundles dist/view.html
npm start            # http://localhost:3001/mcp
```

`npm run dev` does build + start. Re-run `npm run build` after editing `src/` (the server reads `dist/view.html` on each request, so no server restart is needed).

> The blocks in `src/components` are exactly what `npx shadcn@latest add https://mcpblocks.dev/r/list-view.json` (and `inline-card`, `confirm-action`, `line-chart`, `skeleton`) writes into a project with the `components.json` in this folder, so this app doubles as an end-to-end test of the registry and the docs. To refresh them, re-run that command with `-o` to overwrite.

## Live demo (Cloudflare Worker)

The site at mcpblocks.dev is a Worker with static assets. `/mcp` goes to `worker/index.ts`, everything else is served from `out/`. Add `https://mcpblocks.dev/mcp` as a custom connector to try it without running anything. The Worker bundles `dist/view.html`, so **commit `dist/view.html` after changing `src/`** (`npm run build`). State (deal stages) lives in memory per Worker instance, so it can reset at any time.

Local Worker: from the repo root, `pnpm worker:dev` serves it at `http://localhost:8787/mcp`.

## Add it to Claude as a custom connector

Claude connects to remote servers over HTTPS, so expose your local port first.

1. **Tunnel the server.** For example with Cloudflare:
   ```bash
   cloudflared tunnel --url http://localhost:3001
   ```
   (or `ngrok http 3001`). Copy the `https://….trycloudflare.com` URL. Your MCP endpoint is that URL plus `/mcp`.
2. **Add the connector** in Claude: **Settings → Connectors → Add custom connector**. Name it "Deal app" and paste `https://<your-tunnel>/mcp`. On Team and Enterprise plans an owner may need to add it first.
3. **Enable it** for a chat from the **+** menu → **Connectors**.
4. **Try it:**
   - "Show me my open deals."
   - "Show the Northwind Traders deal."
   - "Move Northwind Traders to the next stage." (shows the confirm block)
   - "Chart our pipeline trend."

The server has **no authentication**, which is fine for a throwaway tunnel but not for anything public. Keep the tunnel short-lived, and add auth before deploying it.

### Other hosts

- **Claude Desktop (stdio):** add to `claude_desktop_config.json`, using your absolute path:
  ```json
  {
    "mcpServers": {
      "deal-app": {
        "command": "npx",
        "args": ["-y", "tsx", "/absolute/path/to/mcpblocks/examples/deal-app/server/main.ts", "--stdio"]
      }
    }
  }
  ```
- **Anything else** that supports MCP Apps (VS Code, Goose, MCPJam, the ext-apps `basic-host`): point it at `http://localhost:3001/mcp`.

## Verification

- Verified: builds; server answers `initialize`, `tools/list`, `tools/call`, `resources/read`; the bundled view renders all four blocks in light and dark against a scripted host and completes the confirm round trip (`tools/call` then `ui/update-model-context`).
- Verified against an `AppBridge` host in a browser (light and dark): `list_deals` row click sends the follow-up message, Confirm calls `update_deal_stage`, charts and cards render with the shadcn-installed blocks. The Worker answers `initialize`, `tools/list`, `tools/call` and `resources/read` under `wrangler dev`.

### Claude Desktop visual check (2026-11-25)

With the MCP Blocks connector enabled, ask Claude: “Use MCP Blocks to show every available widget with sample data.” In a dark-mode desktop chat, all four tools produced visible widgets:

| Tool | Observed in Claude |
| --- | --- |
| `list_deals` | Four deal rows with amounts, stages, and a count in the footer |
| `show_deal` | Deal details, a stage badge, and both action buttons |
| `propose_stage_change` | Proposed transition, confirmation button, and a summary of what would change |
| `pipeline_trend` | Two plotted series with axis labels and a legend |

The four layouts fit the tested desktop width without visible clipping or overlap. The check ended at the confirmation screen. Light mode, mobile widths, and the remaining five registry blocks still need visual checks in Claude. [Full registry coverage (#13)](https://github.com/contursofran/mcpblocks/issues/13)

The demo bundles component source installed by `shadcn add`. Earlier install tests in a fresh Vite app and in this demo caught two issues: self-referencing CSS variables in the generated theme and a host helper that required Node types. Both installs built after the fixes. The Claude check used the deployed bundle. [Install test and fixes (#8)](https://github.com/contursofran/mcpblocks/pull/8)

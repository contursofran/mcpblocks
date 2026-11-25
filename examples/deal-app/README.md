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
server/main.ts     Streamable HTTP at /mcp (or --stdio)
src/view.tsx       the View: useApp() + useHostStyles(), switches on structuredContent.view
view.html          Vite entry, bundled to ONE file (dist/view.html) by vite-plugin-singlefile
scripts/sync-blocks.mjs   copies the blocks into src/, like `npx shadcn add` would
```

- One resource (`ui://deal-app/view.html`) serves every tool. Each tool returns `content` (what the model reads) and `structuredContent` (what the view renders).
- `useHostStyles` applies the CSS variables Claude injects (`--color-background-primary`, fonts, theme). The blocks' `host-*` Tailwind utilities read them, so the UI matches light/dark automatically. `applyHostContext` handles safe-area insets.
- `update_deal_stage` has `visibility: ["app"]`, so the model can't call it directly; only the confirm button can.

## Run it

Requires Node 20+.

```bash
cd examples/deal-app
npm install
npm run build        # copies blocks from ../../registry, type-checks, bundles dist/view.html
npm start            # http://localhost:3001/mcp
```

`npm run dev` does build + start. Re-run `npm run build` after editing `src/` (the server reads `dist/view.html` on each request, so no server restart is needed).

> The blocks are copied from this repo's `registry/` so the example always matches the source. In your own project, install them from the registry instead: `npx shadcn@latest add https://mcpblocks.dev/r/list-view.json`.

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

## Verified vs. not yet verified

- Verified: builds; server answers `initialize`, `tools/list`, `tools/call`, `resources/read`; the bundled view renders all four blocks in light and dark against a scripted host and completes the confirm round trip (`tools/call` then `ui/update-model-context`).
- Not yet verified: running inside real Claude through a tunnel. Menu names above are from memory of the current Claude UI, so adjust if they've moved.

# MCP Blocks view starter

Copy this directory into your own project. Use Node 20.19+ or 22.12+.

```bash
npm install
npm run setup:blocks
npm run build
npm start
```

The startup command serves one read-only tool at `http://localhost:3001/mcp`. It reads the built HTML once and uses its SHA-256 prefix in the tool metadata and resource URI. Rebuild and restart after editing the view. The build logs raw and gzip bytes and warns if the gzip size exceeds 225 KiB. Set `MCP_VIEW_GZIP_BUDGET` to choose another byte budget.

Run `npm run storybook` to see the same React view using the fake host. Its sample arrives through the MCP Apps tool-result notification.

With Cloudflare's `cloudflared` installed, run `npm run tunnel` in a second terminal. Add the resulting HTTPS URL plus `/mcp` as a custom connector in Claude with **No sign in**, then ask Claude to run `show_record`. Use **Refresh tools list** after changing tool definitions and open a new chat when testing a new deployment.

See the [shipping guide](https://mcpblocks.dev/docs/ship-a-view) for CSP, caching, and bundle checks.

import type { Metadata } from "next"
import Link from "next/link"

import { OG_IMAGE } from "@/lib/site"
import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"

const description =
  "Build an MCP server that returns a UI resource, then render it with MCP Blocks components and wire up host theme, display mode and safe areas."

export const metadata: Metadata = {
  title: "Using with an MCP server: build a Claude MCP App",
  description,
  alternates: { canonical: "/docs/mcp-server" },
  openGraph: { title: "Using with an MCP server | MCP Blocks UI", description, images: [OG_IMAGE], url: "/docs/mcp-server" },
}

export default function McpServerPage() {
  return (
    <DocsShell
      current="/docs/mcp-server"
      title="Using with an MCP server"
      lead="An MCP App has two halves: a server that registers a tool plus a ui:// resource, and a React view that the host renders in a sandboxed iframe. MCP Blocks covers the view."
    >
      <Step n={1} title="Install the SDKs">
        <CodeBlock
          prompt
          code="npm install @modelcontextprotocol/ext-apps @modelcontextprotocol/server @modelcontextprotocol/node zod react react-dom"
        />
        <p className="text-sm text-muted-foreground">
          Package names and APIs follow ext-apps 2.x and may change. Check the{" "}
          <a className="underline underline-offset-2" href="https://apps.extensions.modelcontextprotocol.io/api/">
            ext-apps docs
          </a>{" "}
          before copying. ext-apps also needs <Code>@modelcontextprotocol/client</Code> and <Code>zod</Code> 4.2 or newer as
          peers; npm installs them for you, pnpm and yarn may ask you to add them.
        </p>
      </Step>

      <Step n={2} title="Register a tool and its UI resource">
        <p className="text-foreground/80">
          The tool points at a <Code>ui://</Code> resource. The resource returns your bundled view as a single HTML
          file.
        </p>
        <CodeBlock
          code={`import fs from "node:fs/promises"
import { McpServer } from "@modelcontextprotocol/server"
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server"
import { z } from "zod/v4"

const server = new McpServer({ name: "deals", version: "1.0.0" })
const viewUri = "ui://deals/summary.html"

registerAppTool(
  server,
  "show-deal",
  {
    description: "Show a deal as a card",
    inputSchema: z.object({ id: z.string() }),
    _meta: { ui: { resourceUri: viewUri } },
  },
  async ({ id }) => {
    const deal = await getDeal(id)
    return {
      content: [{ type: "text", text: \`\${deal.name}: \${deal.stage}\` }],
      structuredContent: deal,
    }
  }
)

registerAppResource(server, "Deal summary", viewUri, { mimeType: RESOURCE_MIME_TYPE }, async () => ({
  contents: [
    {
      uri: viewUri,
      mimeType: RESOURCE_MIME_TYPE,
      text: await fs.readFile("dist/view.html", "utf-8"),
    },
  ],
}))`}
        />
        <p className="text-foreground/80">
          Serve it over Streamable HTTP, then add the URL as a custom connector in Claude. On any runtime with web
          standard <Code>Request</Code> and <Code>Response</Code> (Cloudflare Workers, Deno, Bun) that is one line with{" "}
          <Code>createMcpHandler</Code>. On Node use <Code>NodeStreamableHTTPServerTransport</Code> from{" "}
          <Code>@modelcontextprotocol/node</Code>, or stdio for local use.
        </p>
        <CodeBlock
          code={`import { createMcpHandler } from "@modelcontextprotocol/server"

// Wrap your server setup above in a function so each request gets a fresh server.
const handler = createMcpHandler(() => createServer())

export default {
  fetch: (request: Request) => handler.fetch(request),
}`}
        />
        <p className="text-sm text-muted-foreground">
          This site runs exactly that: the demo server at <Code>https://mcpblocks.dev/mcp</Code> is a Cloudflare Worker
          next to the static docs. Its source is in{" "}
          <a
            className="underline underline-offset-2"
            href="https://github.com/contursofran/mcpblocks/tree/master/examples/deal-app"
          >
            examples/deal-app
          </a>
          .
        </p>
      </Step>

      <Step n={3} title="Add the components to the view">
        <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json" />
        <p className="text-foreground/80">
          Bundle the view into one HTML file (for example with <Code>vite-plugin-singlefile</Code>), because the host
          loads it as a single resource. See{" "}
          <Link className="underline underline-offset-2" href="/docs/installation">
            Installation
          </Link>{" "}
          for what the CLI adds.
        </p>
      </Step>

      <Step n={4} title="Connect the view to the host">
        <p className="text-foreground/80">
          <Code>useApp</Code> performs the handshake. <Code>useHostStyles</Code> applies the CSS variables Claude sends
          (colors, fonts, radii), and <Code>applyHostContext</Code> passes theme, display mode and safe-area insets on to
          the components. Without <Code>useHostStyles</Code> the components fall back to the built-in token values.
        </p>
        <CodeBlock
          code={`import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react"
import { useEffect, useState } from "react"

import { InlineCard } from "@/components/inline-card"
import { applyHostContext } from "@/lib/host"

type Deal = { name: string; owner: string; stage: string }

export function DealView() {
  const [deal, setDeal] = useState<Deal>()

  const { app } = useApp({
    appInfo: { name: "Deal summary", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (result) => setDeal(result.structuredContent as Deal)
      app.onhostcontextchanged = (ctx) => applyHostContext(ctx)
    },
  })

  // Applies the colors, fonts and theme the host sends, which the host-* utilities read.
  useHostStyles(app, app?.getHostContext())
  // First paint: apply the initial context once connected.
  useEffect(() => {
    if (app) applyHostContext(app.getHostContext())
  }, [app])

  if (!deal) return null

  return (
    <InlineCard
      title={deal.name}
      fields={[
        { label: "Owner", value: deal.owner },
        { label: "Stage", value: deal.stage },
      ]}
      actions={[
        { label: "Open record", onClick: () => app?.requestDisplayMode({ mode: "fullscreen" }) },
        {
          label: "Draft follow-up",
          onClick: () =>
            app?.sendMessage({ role: "user", content: [{ type: "text", text: "Draft a follow-up" }] }),
        },
      ]}
    />
  )
}`}
        />
        <p className="text-sm text-muted-foreground">
          The initial host context is available from <Code>app.getHostContext()</Code> once connected, which is why the
          effect above applies it too.
        </p>
      </Step>

      <Step n={5} title="Talk back to the host">
        <ul className="list-disc space-y-1 pl-5 text-foreground/80">
          <li>
            <Code>app.callServerTool</Code> runs another tool on your server, for example on a confirm button.
          </li>
          <li>
            <Code>app.sendMessage</Code> adds a message to the chat. Prefer this over in-widget forms for edits.
          </li>
          <li>
            <Code>app.requestDisplayMode</Code> asks for <Code>fullscreen</Code> or <Code>pip</Code>.
          </li>
        </ul>
      </Step>

      <Step n={6} title="Test it">
        <ul className="list-disc space-y-1 pl-5 text-foreground/80">
          <li>
            Run the server and add it as a custom connector in Claude (Settings, Connectors, Add custom connector, then paste
            the <Code>/mcp</Code> URL), or use the basic host from the ext-apps repo. To try ours first, add{" "}
            <Code>https://mcpblocks.dev/mcp</Code> and ask Claude to show your open deals.
          </li>
          <li>Check light and dark, inline and fullscreen, and a phone-sized window.</li>
          <li>
            Watch the console for <Code>[mcpblocks]</Code> warnings. They flag guideline limits such as more than two
            inline actions.
          </li>
        </ul>
      </Step>
    </DocsShell>
  )
}

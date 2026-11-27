import type { Metadata } from "next"
import Link from "next/link"

import { OG_IMAGE } from "@/lib/site"
import { guideJsonLd } from "@/lib/schema"
import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { JsonLd } from "@/components/site/json-ld"

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
      lead="An MCP App is a server that registers a tool and a ui:// resource, plus a React view the host renders. MCP Blocks covers the view."
    >
      <JsonLd
        data={guideJsonLd({
          title: "Using with an MCP server: build a Claude MCP App",
          description,
          path: "/docs/mcp-server",
        })}
      />
      <Step n={1} title="Install the SDKs">
        <CodeBlock
          prompt
          code="npm install @modelcontextprotocol/ext-apps @modelcontextprotocol/server @modelcontextprotocol/node zod react react-dom"
        />
        <p className="text-sm text-muted-foreground">
          APIs follow ext-apps 2.x. See the{" "}
          <a className="underline underline-offset-2" href="https://apps.extensions.modelcontextprotocol.io/api/">
            ext-apps docs
          </a>{" "}
          if something has changed.
        </p>
      </Step>

      <Step n={2} title="Register a tool and its UI resource">
        <p className="text-foreground/80">
          The tool points at a <Code>ui://</Code> resource. The resource returns your bundled view as a single HTML
          file.
        </p>
        <CodeBlock
          code={`import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import { McpServer } from "@modelcontextprotocol/server"
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server"
import { z } from "zod/v4"

const server = new McpServer({ name: "deals", version: "1.0.0" })
const viewHtml = await fs.readFile("dist/view.html", "utf-8")
const viewHash = createHash("sha256").update(viewHtml).digest("hex").slice(0, 12)
const viewUri = \`ui://deals/summary-\${viewHash}.html\`

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
      text: viewHtml,
    },
  ],
}))`}
        />
        <p className="text-foreground/80">
          Claude can cache a view by its <Code>ui://</Code> URI for the life of a chat. Include a hash of the bundled
          HTML in both the resource URI and the tool metadata. After updating the connector server, start a new chat
          to pick up its updated tool list and resource URIs.
        </p>
        <p className="text-foreground/80">
          Serve it over Streamable HTTP. On Workers, Deno or Bun, <Code>createMcpHandler</Code> does it in one line; on
          Node use <Code>NodeStreamableHTTPServerTransport</Code>.
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
          <Code>useApp</Code> performs the handshake. <Code>applyHostContext</Code> applies the variables and font CSS
          in <Code>hostContext.styles</Code> and sets the theme, native control color scheme, display mode and safe areas.
          Add the <Code>skeleton</Code> registry item to show a placeholder while the first tool result arrives.
        </p>
        <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/skeleton.json" />
        <CodeBlock
          code={`import { useApp } from "@modelcontextprotocol/ext-apps/react"
import { useEffect, useState } from "react"

import { InlineCard } from "@/components/inline-card"
import { InlineCardSkeleton } from "@/components/skeleton"
import { applyHostContext } from "@/lib/host"

type Deal = { name: string; owner: string; stage: string }

export function DealView() {
  const [deal, setDeal] = useState<Deal>()

  const { app } = useApp({
    appInfo: { name: "Deal summary", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.ontoolresult = (result) => setDeal(result.structuredContent as Deal)
      app.onhostcontextchanged = () => applyHostContext(app.getHostContext())
    },
  })

  useEffect(() => {
    if (app) applyHostContext(app.getHostContext())
  }, [app])

  if (!deal) return <InlineCardSkeleton />

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
          If the host font CSS references external URLs, the view&apos;s content security policy must allow those
          origins. Declare them in the resource content&apos;s <Code>_meta.ui.csp.resourceDomains</Code>.
        </p>
        <p className="text-foreground/80">
          In a fullscreen view, use the host safe areas to position fixed overlays and keep sticky footer controls
          above the bottom inset.
        </p>
        <CodeBlock
          code={`.fullscreen-overlay {
  position: fixed;
  inset: var(--mb-safe-top, 0px) var(--mb-safe-right, 0px)
    var(--mb-safe-bottom, 0px) var(--mb-safe-left, 0px);
}

.fullscreen-footer {
  position: sticky;
  bottom: var(--mb-safe-bottom, 0px);
}`}
        />
      </Step>

      <Step n={5} title="Test it in Claude">
        <p className="text-foreground/80">
          Run the server and add its <Code>/mcp</Code> URL under Settings, Connectors, Add custom connector. To try ours
          first, add <Code>https://mcpblocks.dev/mcp</Code> and ask Claude to show your open deals. Check light and dark,
          fullscreen and a narrow window, and watch the console for <Code>[mcpblocks]</Code> guideline warnings.
        </p>
        <p className="text-sm text-muted-foreground">
          From the view, <Code>app.callServerTool</Code> runs another tool, <Code>app.sendMessage</Code> adds a chat
          message (better than in-widget forms), and <Code>app.requestDisplayMode</Code> asks for fullscreen or pip.
        </p>
      </Step>
    </DocsShell>
  )
}

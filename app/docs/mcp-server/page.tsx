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
          code="npm install @modelcontextprotocol/ext-apps @modelcontextprotocol/server @modelcontextprotocol/node zod"
        />
        <p className="text-sm text-muted-foreground">
          Package names and APIs follow ext-apps 2.x and may change. Check the{" "}
          <a className="underline underline-offset-2" href="https://apps.extensions.modelcontextprotocol.io/api/">
            ext-apps docs
          </a>{" "}
          before copying, and add the other peer packages it lists if your setup needs them.
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

registerAppResource(server, "Deal summary", viewUri, {}, async () => ({
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
          Serve it over Streamable HTTP with <Code>NodeStreamableHTTPServerTransport</Code> from{" "}
          <Code>@modelcontextprotocol/node</Code>, or over stdio for local use, then add the URL as a custom connector
          in Claude.
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
          <Code>useApp</Code> performs the handshake. Pass every host context update to{" "}
          <Code>applyHostContext</Code> so theme, display mode and safe-area insets reach the components.
        </p>
        <CodeBlock
          code={`import { useApp } from "@modelcontextprotocol/ext-apps/react"
import { useState } from "react"

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
          The initial host context is available from <Code>app.getHostContext()</Code> once connected. Call{" "}
          <Code>applyHostContext</Code> with it too so the first paint matches the host.
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
            Run the server and add it as a custom connector in Claude, or use the basic host from the ext-apps repo.
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

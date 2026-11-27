import type { Metadata } from "next"

import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { OG_IMAGE } from "@/lib/site"
import { BrandedConfirmAction } from "@/registry/mcpblocks/examples/branded-confirm-action"

const description = "Use your brand accents and display font while your blocks follow the MCP host theme."

export const metadata: Metadata = {
  title: "Brand your blocks",
  description,
  alternates: { canonical: "/docs/brand-your-blocks" },
  openGraph: { title: "Brand your blocks | MCP Blocks UI", description, images: [OG_IMAGE], url: "/docs/brand-your-blocks" },
}

const appTokens = [
  ["--mb-surface", "Main surface"],
  ["--mb-surface-muted", "Secondary and subtle surfaces"],
  ["--mb-fg", "Main text"],
  ["--mb-fg-muted", "Secondary and subtle text"],
  ["--mb-border", "Neutral borders"],
  ["--mb-accent", "Primary control fill"],
  ["--mb-accent-fg", "Text on primary controls"],
  ["--mb-font-display", "Display font for block titles"],
  ["--mb-{info,success,warning,danger}-{bg,fg,border}", "Status colors"],
]

export default function BrandYourBlocksPage() {
  return (
    <DocsShell current="/docs/brand-your-blocks" title="Brand your blocks" lead={description}>
      <Step n={1} title="Apply the host context">
        <p>
          Call <Code>applyHostContext</Code> with the context from your MCP host. The reference tokens expose its
          palette and fonts through utilities such as <Code>bg-host-bg</Code>. Built-in light and dark defaults
          supply values the host leaves out.
        </p>
      </Step>
      <Step n={2} title="Set the app tokens you want to change">
        <p>
          Set <Code>--mb-*</Code> variables on a wrapper or on the document root. Blocks read them through
          <Code>host-app-*</Code> utilities. Each unset app token uses the corresponding reference value at the
          point where the block renders, including after a theme change.
        </p>
        <CodeBlock code={`.my-brand {
  --mb-accent: #09e1cd;
  --mb-accent-fg: #141413;
  --mb-font-display: Georgia, serif;
}`} />
        <dl className="grid gap-2 text-sm">
          {appTokens.map(([name, purpose]) => (
            <div key={name} className="grid gap-1 border-b border-border py-2">
              <dt><Code>{name}</Code></dt>
              <dd>{purpose}</dd>
            </div>
          ))}
        </dl>
      </Step>
      <Step n={3} title="Try a branded confirmation">
        <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/branded-confirm-action.json" />
        <p>The same teal button and display font appear in both host themes. The surface, body text, and borders follow the host.</p>
        <div className="grid gap-4">
          {(["Light", "Dark"] as const).map((theme) => (
            <div key={theme}>
              <h3 className="mb-2 text-sm font-semibold">{theme} host</h3>
              <div className={theme === "Dark" ? "dark" : undefined}>
                <BrandedConfirmAction
                  title="Move Northwind Traders to Negotiation"
                  subject={{ name: "Northwind Traders", detail: "Sample deal" }}
                  confirmLabel="Move to Negotiation"
                  changePreview={<p>Stage <strong>Proposal</strong> → <strong>Negotiation</strong></p>}
                  doneTitle="Sample change confirmed"
                />
              </div>
            </div>
          ))}
        </div>
        <p>
          To see it in Claude, add the MCP Blocks connector at <Code>https://mcpblocks.dev/mcp</Code> with
          {" "}<strong>No sign in</strong> selected and ask it to show the <Code>branded-confirm-action</Code> block.
          Switch Claude between light and dark to
          see its host colors change around the brand accents.
        </p>
      </Step>
    </DocsShell>
  )
}

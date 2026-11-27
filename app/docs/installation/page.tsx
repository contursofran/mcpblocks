import type { Metadata } from "next"
import Link from "next/link"

import { OG_IMAGE } from "@/lib/site"
import { guideJsonLd } from "@/lib/schema"
import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { JsonLd } from "@/components/site/json-ld"

const description =
  "Add MCP Blocks UI components to a React project with the shadcn CLI: prerequisites, one command per component, and what lands in your repo."

export const metadata: Metadata = {
  title: "Installation: shadcn CLI setup for Claude MCP Apps",
  description,
  alternates: { canonical: "/docs/installation" },
  openGraph: { title: "Installation | MCP Blocks UI", description, images: [OG_IMAGE], url: "/docs/installation" },
}

export default function InstallationPage() {
  return (
    <DocsShell
      current="/docs/installation"
      title="Installation"
      lead="An open source (MIT) shadcn registry. Blocks are copied into your repo, so you own the code and there is no package to keep updated."
    >
      <JsonLd
        data={guideJsonLd({
          title: "Installation: shadcn CLI setup for Claude MCP Apps",
          description,
          path: "/docs/installation",
        })}
      />
      <Step n={1} title="Requirements">
        <p className="text-foreground/80">
          A React 18+ project with Tailwind CSS v4 and a shadcn <Code>components.json</Code>. No project yet? Run{" "}
          <Code>npx shadcn@latest init</Code> first.
        </p>
      </Step>

      <Step n={2} title="Add a block">
        <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json" />
        <p className="text-foreground/80">
          The CLI copies the component plus its dependencies (<Code>host-tokens</Code>, <Code>host</Code>,{" "}
          <Code>host-button</Code>, <Code>icons</Code>) into the folders set in <Code>components.json</Code>. Swap{" "}
          <Code>inline-card</Code> for any name in the{" "}
          <Link className="underline underline-offset-2" href="/components/list-view">
            component list
          </Link>
          . With pnpm, bun or yarn, use <Code>pnpm dlx</Code>, <Code>bunx --bun</Code> or <Code>yarn dlx</Code>.
        </p>
      </Step>

      <Step n={3} title="Use it">
        <CodeBlock
          code={`import { InlineCard } from "@/components/inline-card"

export function App() {
  return (
    <InlineCard
      title="Acme renewal"
      fields={[{ label: "Owner", value: "Sam" }]}
      actions={[{ label: "Open record" }]}
    />
  )
}`}
        />
        <p className="text-foreground/80">
          Blocks read colors and fonts through <Code>host-*</Code> utilities. Pass the MCP host context to
          <Code>applyHostContext</Code> to apply the styles the host sends. The registry supplies fallbacks for values
          the host leaves out.
        </p>
        <CodeBlock
          code={`import { applyHostContext } from "@/lib/host"

// Example context. Once connected, pass app.getHostContext().
applyHostContext({
  theme: "dark",
  styles: {
    variables: { "--color-background-primary": "#262624" },
    // css.fonts can also contain font CSS supplied by the host.
  },
})`}
        />
      </Step>

      <Step n={4} title="Connect it to Claude">
        <p className="text-foreground/80">
          Your block needs an MCP server to render. To see one working first, add{" "}
          <Code>https://mcpblocks.dev/mcp</Code> in Claude under Customize, Connectors, Add custom connector. Choose{" "}
          <strong>No sign in</strong> under Authentication and ask for your open deals. Then follow{" "}
          <Link className="underline underline-offset-2" href="/docs/mcp-server">
            Using with an MCP server
          </Link>{" "}
          to build your own.
        </p>
      </Step>

    </DocsShell>
  )
}

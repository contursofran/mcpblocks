import type { Metadata } from "next"
import Link from "next/link"

import { OG_IMAGE } from "@/lib/site"
import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"

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
      lead="MCP Blocks UI is a shadcn registry. Each component is copied into your repo, so you own the code and there is no runtime package to keep up to date."
    >
      <Step n={1} title="Prerequisites">
        <ul className="list-disc space-y-1 pl-5 text-foreground/80">
          <li>A React 18+ project (Vite, Next.js or anything that builds a single-file MCP App view).</li>
          <li>
            Tailwind CSS v4. The tokens are mapped with <Code>@theme inline</Code>, which v3 does not support.
          </li>
          <li>
            A <Code>components.json</Code> file, the <Code>@/*</Code> path alias and a <Code>cn</Code> helper in{" "}
            <Code>lib/utils.ts</Code>. If you do not have them, run <Code>npx shadcn@latest init</Code> first.
          </li>
          <li>
            The <Code>@modelcontextprotocol/ext-apps</Code> package, if you want to talk to the host (see{" "}
            <Link className="underline underline-offset-2" href="/docs/mcp-server">
              Using with an MCP server
            </Link>
            ).
          </li>
        </ul>
      </Step>

      <Step n={2} title="Add a component">
        <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json" />
        <p className="text-foreground/80">
          The CLI also installs what the component depends on: <Code>host-tokens</Code> (CSS variables and Tailwind
          utilities), <Code>host</Code> (helpers), <Code>host-button</Code> and <Code>icons</Code> where needed. Swap{" "}
          <Code>inline-card</Code> for any name on the{" "}
          <Link className="underline underline-offset-2" href="/components/list-view">
            components pages
          </Link>
          .
        </p>
        <p className="text-foreground/80">
          Using pnpm, bun or yarn? Replace <Code>npx</Code> with <Code>pnpm dlx</Code>, <Code>bunx --bun</Code> or{" "}
          <Code>yarn dlx</Code>.
        </p>
      </Step>

      <Step n={3} title="What lands in your repo">
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Registry item</th>
                <th className="px-4 py-3 font-medium">Goes to</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-3 font-mono text-[13px]">host-tokens</td>
                <td className="px-4 py-3">Your global CSS file (variables in <Code>:root</Code> and <Code>.dark</Code>, mapping in <Code>@theme inline</Code>)</td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-mono text-[13px]">host</td>
                <td className="px-4 py-3"><Code>lib/host.ts</Code></td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-3 font-mono text-[13px]">host-button, icons</td>
                <td className="px-4 py-3"><Code>components/ui/</Code></td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono text-[13px]">carousel, inline-card, …</td>
                <td className="px-4 py-3"><Code>components/</Code></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">
          Folders follow the aliases in your <Code>components.json</Code>, so paths may differ in your project.
        </p>
      </Step>

      <Step n={4} title="Use it">
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
          Components only use <Code>host-*</Code> utilities such as <Code>bg-host-bg</Code> and{" "}
          <Code>text-host-fg</Code>. Inside Claude the host injects the real values; elsewhere the fallbacks apply.
        </p>
      </Step>

      <Step n={5} title="Install everything at once (optional)">
        <CodeBlock
          code={`npx shadcn@latest add \\
  https://mcpblocks.dev/r/list-view.json \\
  https://mcpblocks.dev/r/confirm-action.json \\
  https://mcpblocks.dev/r/media-player.json \\
  https://mcpblocks.dev/r/line-chart.json \\
  https://mcpblocks.dev/r/document-card.json \\
  https://mcpblocks.dev/r/carousel.json \\
  https://mcpblocks.dev/r/inline-card.json \\
  https://mcpblocks.dev/r/status-update.json \\
  https://mcpblocks.dev/r/skeleton.json`}
        />
      </Step>
    </DocsShell>
  )
}

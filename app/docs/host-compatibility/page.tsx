import type { Metadata } from "next"
import Link from "next/link"

import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { OG_IMAGE } from "@/lib/site"

const path = "/docs/host-compatibility"
const description = "See what MCP Apps hosts document or expose and how MCP Blocks behaves when a feature is unavailable."

export const metadata: Metadata = {
  title: "Host compatibility",
  description,
  alternates: { canonical: path },
  openGraph: { title: "Host compatibility | MCP Blocks UI", description, images: [OG_IMAGE], url: path },
}

const hosts = ["Claude web", "Claude Desktop", "Claude iOS", "Claude Android", "ChatGPT", "VS Code", "Goose Desktop", "Vercel AI SDK"]
type Evidence = { detail: string; kind: "Documented" | "Verified"; date: string }
type HostCells = readonly [Evidence?, Evidence?, Evidence?, Evidence?, Evidence?, Evidence?, Evidence?, Evidence?]

const date = "2026-11-27"
const documented = (detail: string): Evidence => ({ detail, kind: "Documented", date })
const verified = (detail: string): Evidence => ({ detail, kind: "Verified", date })
const missing = undefined

const rows: { capability: string; cells: HostCells; fallback: string }[] = [
  {
    capability: "serverTools",
    cells: [missing, missing, missing, missing, documented("App tool calls"), missing, missing, documented("Host supplies the tool proxy")],
    fallback: "useToolCall returns unavailable. Keep the read view and disable actions that need a tool call.",
  },
  {
    capability: "updateModelContext",
    cells: [missing, missing, missing, missing, documented("Text and other supported content"), documented("Appears as attachments")],
    fallback: "tellModel uses chat text only with explicit opt-in. The saved outcome stays visible in the view.",
  },
  {
    capability: "ui/message",
    cells: [documented("Text with host restrictions"), documented("Text with host restrictions"), missing, missing, documented("Text supported"), documented("Fills composer"), documented("Supported in chat view")],
    fallback: "Keep a readable result and let the user continue from the chat composer.",
  },
  {
    capability: "ui/open-link",
    cells: [documented("Host mediates opening"), documented("Host mediates opening")],
    fallback: "Offer a readable destination or omit the link action when the host cannot open it.",
  },
  {
    capability: "inline",
    cells: [documented("In conversation"), verified("Rendered and confirmed a sample"), documented("Interactive connectors"), documented("Interactive connectors"), documented("Supported"), documented("Only supported mode"), documented("In conversation"), documented("Inline renderer")],
    fallback: "Return a useful text result for hosts that cannot show the view.",
  },
  {
    capability: "fullscreen",
    cells: [documented("Panel or full screen"), documented("Panel or full screen"), missing, missing, documented("Supported"), documented("Unavailable")],
    fallback: "Use the mode the host returns. Keep compact widgets usable inline.",
  },
  {
    capability: "pip",
    cells: [missing, missing, missing, missing, documented("Unavailable"), documented("Unavailable")],
    fallback: "Offer the mode only when advertised.",
  },
  {
    capability: "Side panel",
    cells: [documented("Account availability varies"), verified("Opened directly and switched blocks"), documented("Unavailable"), documented("Unavailable"), missing, documented("Unavailable"), missing, documented("Host sets placement")],
    fallback: "The same view can render inline. Lay it out by container width.",
  },
  {
    capability: "styles.variables",
    cells: [documented("Host variables"), documented("Host variables"), missing, missing, documented("Host variables"), missing, documented("Theme context")],
    fallback: "Use the installed light and dark fallbacks. Apply host variables when provided.",
  },
  {
    capability: "styles.css.fonts",
    cells: [documented("Claude font CSS"), documented("Claude font CSS")],
    fallback: "Use system font fallbacks and declare the actual font origin if you load external fonts.",
  },
  {
    capability: "safeAreaInsets",
    cells: [documented("Insets in the panel"), documented("Insets in the panel")],
    fallback: "useHost writes zero pixels for omitted insets.",
  },
  {
    capability: "containerDimensions",
    cells: [documented("Varies by display mode"), documented("Varies by display mode")],
    fallback: "Use CSS container queries and let the layout respond to its own available width.",
  },
  {
    capability: "platform",
    cells: [],
    fallback: "Treat platform as optional and derive layout from size or input capabilities.",
  },
  {
    capability: "Resource caching",
    cells: [missing, verified("Refreshing tools exposed a new panel entry")],
    fallback: "Version the resource URI with its contents. Refresh the tool list and start a fresh chat after changing metadata.",
  },
  {
    capability: "CSP",
    cells: [documented("Resource origin declarations"), documented("Resource origin declarations"), missing, missing, documented("Resource origin declarations"), documented("Sandboxed with CSP"), documented("Sandboxed with CSP")],
    fallback: "Bundle into one HTML file and declare only the external origins the resource needs.",
  },
]

const sources = [
  ["Claude display modes and container context", "https://claude.com/docs/connectors/building/mcp-apps/display-modes"],
  ["Claude interactive connectors and mobile availability", "https://support.claude.com/en/articles/13454812-use-interactive-connectors-in-claude"],
  ["Claude messages", "https://claude.com/docs/connectors/building/mcp-apps/send-messages"],
  ["Claude links", "https://claude.com/docs/connectors/building/mcp-apps/external-links"],
  ["Claude theme variables", "https://claude.com/docs/connectors/building/mcp-apps/transparent-theming"],
  ["Claude troubleshooting and cache checks", "https://claude.com/docs/connectors/building/mcp-apps/troubleshooting"],
  ["ChatGPT MCP Apps specification", "https://github.com/openai/mcp-extensions/blob/main/docs/spec.md"],
  ["ChatGPT host variables", "https://developers.openai.com/plugins/changelog"],
  ["VS Code MCP Apps behavior", "https://code.visualstudio.com/api/extension-guides/ai/mcp#mcp-apps"],
  ["Goose MCP Apps tutorial", "https://github.com/aaif-goose/goose/blob/main/documentation/docs/tutorials/building-mcp-apps.md"],
  ["Vercel AI SDK renderer and tool proxy", "https://vercel.com/kb/guide/ai-sdk-mcp-apps"],
]

export default function HostCompatibilityPage() {
  return (
    <DocsShell current={path} title="Host compatibility" lead={description}>
      <Step n={1} title="Capability matrix">
        <p>
          Verified cells were exercised with the live MCP Blocks connector. Documented cells summarize vendor
          guidance. A dash marks capability details still to verify. Use the negotiated host context in each view
          because availability can vary by account, device and application version.
        </p>
        <div className="overflow-x-auto" tabIndex={0} aria-label="Scrollable host capability matrix">
          <table className="min-w-[78rem] border-collapse text-left text-sm">
            <caption className="sr-only">MCP Apps capabilities by host and the corresponding view fallback</caption>
            <thead>
              <tr className="border-b">
                <th className="p-2" scope="col">Capability</th>
                {hosts.map((host) => <th className="p-2 align-bottom" scope="col" key={host}>{host}</th>)}
                <th className="p-2 align-bottom" scope="col">Fallback</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ capability, cells, fallback }) => (
                <tr className="border-b align-top" key={capability}>
                  <th className="p-2 font-mono font-medium" scope="row">{capability}</th>
                  {hosts.map((host, index) => {
                    const evidence = cells[index]
                    return (
                      <td className="min-w-24 p-2" key={host}>
                        {evidence ? (
                          <>
                            <span>{evidence.detail}</span>
                            <small className="mt-1 block text-muted-foreground">
                              {evidence.kind} <time dateTime={evidence.date}>{evidence.date}</time>
                            </small>
                          </>
                        ) : <span aria-label="Unverified">—</span>}
                      </td>
                    )
                  })}
                  <td className="min-w-40 p-2">{fallback}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Step>
      <Step n={2} title="Build for the context you received">
        <p>
          <Code>useHost</Code> exposes the advertised modes and capabilities. Use <Code>useToolCall</Code> to
          distinguish an unavailable tool from an uncertain result. Preview missing capabilities and narrow
          containers with the fake host. See the <Link className="underline underline-offset-2" href="/docs/protocol-hooks">protocol hooks guide</Link>.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>Summary cards, lists, charts and carousels can stay inline when there is no expanded display mode.</li>
          <li>Confirmation views can disable an unavailable write and retain the receipt lookup for an uncertain one.</li>
          <li>When a host blocks media, keep the title and details readable and provide a host-approved link when available.</li>
        </ul>
        <ul className="grid gap-2 text-sm">
          {sources.map(([title, href]) => (
            <li key={href}><a className="underline underline-offset-2" href={href}>{title}</a></li>
          ))}
        </ul>
      </Step>
    </DocsShell>
  )
}

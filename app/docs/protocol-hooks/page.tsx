import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { OG_IMAGE } from "@/lib/site"

const description = "Connect a React view to its MCP host and handle tool calls, streaming results, and prepared writes."
const path = "/docs/protocol-hooks"

export const metadata: Metadata = {
  title: "Protocol hooks",
  description,
  alternates: { canonical: path },
  openGraph: { title: "Protocol hooks | MCP Blocks UI", description, images: [OG_IMAGE], url: path },
}

export default function ProtocolHooksPage() {
  return (
    <DocsShell current={path} title="Protocol hooks" lead={description}>
      <Step n={1} title="Connect the view">
        <CodeBlock code="npx shadcn@latest add https://mcpblocks.dev/r/hooks.json" />
        <CodeBlock code={`import { McpHostProvider, useHost } from "@/hooks/use-host"
import { useToolResult } from "@/hooks/use-tool-result"

export function App() {
  return (
    <McpHostProvider appInfo={{ name: "My view", version: "1.0.0" }}>
      <View />
    </McpHostProvider>
  )
}

function View() {
  const { app, error, context } = useHost()
  const { partialInput, input, result } = useToolResult()
  if (error) return <p role="alert">{error.message}</p>
  if (!app) return <p>Connecting…</p>
  return <pre>{JSON.stringify(result ?? input ?? partialInput ?? context)}</pre>
}`} />
        <p>
          Mount one provider per view. It applies the host theme, CSS variables, font styles and safe areas,
          and reports the view size. <Code>requestDisplayMode(mode)</Code> returns the mode the host grants.
          Use <Code>context.displayMode</Code> to lay out the view.
        </p>
      </Step>
      <Step n={2} title="Call a tool">
        <CodeBlock code={`const { call, available } = useToolCall("show_deal")
const outcome = await call({ id: "d1" }, { timeoutMs: 5000 })`} />
        <p>
          A missing tool capability yields <Code>unavailable</Code>. A reply marked as an error yields
          {" "}<Code>error</Code> with the server result attached. Transport failures also yield <Code>error</Code>,
          with no result. A request deadline yields <Code>timeout</Code>. A timeout or a transport failure
          after sending a write can leave its outcome unknown.
        </p>
      </Step>
      <Step n={3} title="Handle a prepared write">
        <CodeBlock code={`idle → preparing → preview → confirming
            ↓                     ├─→ saved
          blocked                 ├─→ refused
                                  └─→ unknown ⇄ checking
                                                    ├─→ saved
                                                    └─→ refused`} />
        <p>
          <Code>prepare</Code> returns a preview or a reason that blocks the proposal. <Code>confirm</Code> calls
          your execute function once with the preview and its idempotency key. A write with an uncertain
          outcome enters <Code>unknown</Code>. <Code>checkAgain</Code> calls your read-only reconcile function
          with the original key. Use <Code>canClose</Code> to lock the enclosing UI during the request
          and while the outcome remains unknown.
        </p>
        <p>
          On <Code>saved</Code>, the hook reports your result summary through <Code>tellModel</Code>.
          Set <Code>fallbackToMessage: true</Code> if you want a visible chat message when the host lacks
          text model-context updates. Your server should store the key and the write result together so
          it can return the same receipt on a later connection.
        </p>
        <p>
          The deal app uses <Code>usePreparedWrite</Code> to drive <Code>ConfirmAction</Code>. See the
          {" "}<Link className="underline underline-offset-2" href="/docs/prepared-writes">prepared writes guide</Link> for
          the confirmation UI and server responsibilities.
        </p>
      </Step>
      <Step n={4} title="Test in a fake host">
        <CodeBlock code="npx shadcn@latest add https://mcpblocks.dev/r/host-harness.json" />
        <p>
          Wrap a Storybook view with <Code>FakeHost</Code> in place of <Code>McpHostProvider</Code>. Pass
          host context, capabilities, and a tool map. Use <Code>toolStub</Code> to simulate success, refusals,
          slow responses, errors and timeouts. <Code>onRequest</Code> receives each message sent by the view.
        </p>
        <p>
          For Vitest, <Code>createFakeHost</Code> returns a bridge, a view transport and a request recorder.
          Supply the transport to <Code>McpHostProvider</Code>, then use the bridge to deliver tool inputs and results.
          The repository&apos;s Storybook prepared-write stories also let you change theme, mode, container width,
          safe areas and capabilities while testing the flow.
        </p>
      </Step>
    </DocsShell>
  )
}

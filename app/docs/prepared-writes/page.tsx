import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { OG_IMAGE } from "@/lib/site"

const description = "Prepare, review, confirm and reconcile writes made inside an MCP App view."

export const metadata: Metadata = {
  title: "Prepared writes",
  description,
  alternates: { canonical: "/docs/prepared-writes" },
  openGraph: { title: "Prepared writes | MCP Blocks UI", description, images: [OG_IMAGE], url: "/docs/prepared-writes" },
}

export default function PreparedWritesPage() {
  return (
    <DocsShell current="/docs/prepared-writes" title="Prepared writes" lead={description}>
      <Step n={1} title="Prepare">
        <p>
          Validate the proposal on the server before writing. Return the current value, proposed value and a
          proposal ID or idempotency key. If validation refuses the proposal, render <Code>{'status="refused"'}</Code>
          {" "}and pass the reason to <Code>refusedDescription</Code>.
        </p>
      </Step>
      <Step n={2} title="Review">
        <p>
          Show the record and the from and to values using <Code>changePreview</Code>. <Code>ConfirmAction</Code>
          {" "}adds a reminder that nothing is saved until the user confirms.
        </p>
      </Step>
      <Step n={3} title="Confirm">
        <p>
          Run the write when the user presses Confirm. Revalidate the proposal on the server and deduplicate
          repeated requests using the original key. Show <Code>working</Code> while the request is in flight and
          {" "}<Code>done</Code> after the server confirms the write.
        </p>
        <p>
          After a confirmed write, tell the model what changed using a short summary of information already
          visible in the view. <Code>tellModel</Code> caps summaries at 500 characters and uses host model context
          when text updates are supported. Set <Code>fallbackToMessage: true</Code> only if the view should post a
          visible chat message when context updates are unavailable.
        </p>
        <CodeBlock code={`import { tellModel } from "@/lib/host"

// Run after confirming the write and updating the view.
void tellModel(app, "Northwind Traders moved to Negotiation.")`} />
      </Step>
      <Step n={4} title="Reconcile">
        <p>
          If a timeout or connection loss leaves the outcome uncertain, show <Code>{'status="unknown"'}</Code>.
          Wire <Code>onCheckAgain</Code> to read the current state or check the original idempotency key. Keep the
          outcome unknown until you have enough evidence to resolve it. Use the retryable <Code>error</Code> state
          only if the server confirms the write did not happen and retrying is safe.
        </p>
        <p>See the <Link className="underline underline-offset-2" href="/components/confirm-action">Confirm action component</Link> for the full props.</p>
      </Step>
    </DocsShell>
  )
}

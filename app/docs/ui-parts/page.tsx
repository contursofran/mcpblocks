import type { Metadata } from "next"

import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { OG_IMAGE } from "@/lib/site"

const path = "/docs/ui-parts"
const description = "Compose host-styled views from the same parts used by MCP Blocks widgets."

export const metadata: Metadata = {
  title: "Composable UI parts",
  description,
  alternates: { canonical: path },
  openGraph: { title: "Composable UI parts | MCP Blocks UI", description, images: [OG_IMAGE], url: path },
}

export default function UiPartsPage() {
  return (
    <DocsShell current={path} title="Composable UI parts" lead={description}>
      <Step n={1} title="Compose a summary or document">
        <p>
          <Code>InlineCard</Code> combines a <Code>Surface</Code>, a <Code>StatusPill</Code>, and a
          {" "}<Code>DataList</Code>. <Code>DocumentCard</Code> uses the same parts with aligned property rows.
          Install the parts on their own when you need to bring your own layout or actions.
        </p>
        <CodeBlock code="npx shadcn@latest add https://mcpblocks.dev/r/surface.json https://mcpblocks.dev/r/status-pill.json https://mcpblocks.dev/r/data-list.json" />
        <CodeBlock code={`import { Surface } from "@/components/ui/surface"
import { StatusPill } from "@/components/ui/status-pill"
import { DataList } from "@/components/ui/data-list"

<Surface as="section" className="space-y-3 p-4">
  <h2>Northwind Traders</h2>
  <StatusPill tone="info">Proposal</StatusPill>
  <DataList layout="aligned" items={[{ label: "Value", value: "$48,000" }]} />
</Surface>`} />
      </Step>
      <Step n={2} title="Show a proposal and its outcome">
        <p>
          <Code>ConfirmAction</Code> uses <Code>ChangePreview</Code> for the review and <Code>OutcomeCard</Code> for
          the result. <Code>ChangePreview</Code> accepts label, from and to values. Omit <Code>from</Code> to
          show a single proposed value. <Code>StatusUpdate</Code> is the general-purpose outcome banner
          underlying <Code>OutcomeCard</Code>.
        </p>
        <CodeBlock code="npx shadcn@latest add https://mcpblocks.dev/r/change-preview.json https://mcpblocks.dev/r/outcome-card.json" />
        <CodeBlock code={`import { ChangePreview } from "@/components/ui/change-preview"
import { OutcomeCard } from "@/components/ui/outcome-card"

<ChangePreview rows={[{ label: "Stage", from: "Proposal", to: "Negotiation" }]} />
<OutcomeCard
  status="unknown"
  description="The server hasn't returned a receipt."
  action={{ label: "Check again", onClick: write.checkAgain }}
/>`} />
      </Step>
      <Step n={3} title="Edit in a panel">
        <p>
          <Code>Sheet</Code> opens to the side at 36rem of available container width and to the bottom
          below that width. Give it the current view through <Code>background</Code> and pass the trigger
          ref through <Code>returnFocusRef</Code>. The sheet keeps keyboard focus inside while open and handles
          Escape. Pass <Code>canClose</Code> from a prepared write to keep the sheet open during a request
          or while its outcome is unknown.
        </p>
        <CodeBlock code="npx shadcn@latest add https://mcpblocks.dev/r/field.json https://mcpblocks.dev/r/sheet.json" />
        <CodeBlock code={`import { TextField, SelectField } from "@/components/ui/field"
import { Sheet } from "@/components/ui/sheet"

<Sheet
  open={open}
  onOpenChange={setOpen}
  title="Edit deal"
  canClose={write.canClose}
  returnFocusRef={triggerRef}
  background={<button ref={triggerRef} onClick={() => setOpen(true)}>Edit</button>}
>
  <TextField label="Deal name" defaultValue="Northwind Traders" />
  <SelectField label="Stage" defaultValue="Proposal">
    <option>Proposal</option>
    <option>Negotiation</option>
  </SelectField>
</Sheet>`} />
        <p>
          Use <Code>Field</Code> to wrap your own native control. Use <Code>TextField</Code> and
          {" "}<Code>SelectField</Code> for a labelled 44px target and a control that inherits the host color scheme.
        </p>
      </Step>
    </DocsShell>
  )
}

import type { Metadata } from "next"
import Link from "next/link"

import { CodeBlock } from "@/components/site/code-block"
import { Code, DocsShell, Step } from "@/components/site/docs-shell"
import { OG_IMAGE } from "@/lib/site"

const path = "/docs/ship-a-view"
const description = "Bundle an MCP App as one HTML resource, declare its origins, and verify what Claude loads."

export const metadata: Metadata = {
  title: "Ship a view",
  description,
  alternates: { canonical: path },
  openGraph: { title: "Ship a view | MCP Blocks UI", description, images: [OG_IMAGE], url: path },
}

export default function ShipAViewPage() {
  return (
    <DocsShell current={path} title="Ship a view" lead={description}>
      <Step n={1} title="Start with a working view">
        <p>
          Copy the <a className="underline underline-offset-2" href="https://github.com/contursofran/mcpblocks/tree/master/examples/starter">starter</a>.
          It serves one read-only tool, uses the React protocol hooks, and previews the same view with the Storybook fake host.
        </p>
        <CodeBlock code={`npx degit contursofran/mcpblocks/examples/starter my-mcp-app
cd my-mcp-app
npm install
npm run setup:blocks
npm run build
npm start`} />
        <p>Use Node 20.19+ or 22.12+. Run <Code>npm run storybook</Code> to check the view before connecting Claude.</p>
      </Step>
      <Step n={2} title="Serve one HTML file">
        <p>
          The starter uses Vite and <Code>vite-plugin-singlefile</Code> to put the CSS and JavaScript into
          {" "}<Code>dist/view.html</Code>. Return the HTML in <Code>resources/read</Code> with MIME type
          {" "}<Code>text/html;profile=mcp-app</Code>. Check the built file when adding fonts, media or code splitting.
        </p>
        <CodeBlock code={`const html = await readFile("dist/view.html", "utf8")
const revision = createHash("sha256").update(html).digest("hex").slice(0, 12)
const uri = \`ui://my-app/view-\${revision}.html\`

registerAppResource(server, "My view", uri, { mimeType: RESOURCE_MIME_TYPE }, async () => ({
  contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
}))

// The tool's metadata points to the same uri.
// _meta: { ui: { resourceUri: uri } }`} />
        <p>Hash the final HTML bytes. Build first, then restart the server so the URI and bytes change together.</p>
      </Step>
      <Step n={3} title="Declare the origins the view uses">
        <p>
          Add <Code>resourceDomains</Code> for external images, fonts, styles and scripts.
          Add <Code>connectDomains</Code> for browser requests such as <Code>fetch</Code>. Put
          {" "}<Code>csp</Code> on the resource content in <Code>resources/read</Code>.
        </p>
        <CodeBlock code={`_meta: {
  ui: {
    csp: {
      resourceDomains: ["https://assets.claude.ai"],
      connectDomains: ["https://api.example.com"],
    },
  },
}`} />
        <p>
          Host font CSS in <Code>styles.css.fonts</Code> can point to an external origin. Include the actual
          font origin if you rely on that font, and keep a system fallback for views where it fails to load.
          Claude serves its host fonts from <Code>https://assets.claude.ai</Code>. Tool calls made through
          {" "}<Code>app.callServerTool</Code> use the host bridge. See the
          {" "}<a className="underline underline-offset-2" href="https://claude.com/docs/connectors/building/mcp-apps/transparent-theming#allow-the-host-font-origin-in-your-csp">Claude font and CSP documentation</a>.
        </p>
      </Step>
      <Step n={4} title="Measure the bundle">
        <p>
          The starter logs the raw and gzip sizes during <Code>npm run build</Code>. Its default budget is
          225 KiB gzip. Set <Code>MCP_VIEW_GZIP_BUDGET</Code> in bytes to fit your view. Check the gzip size as
          you add dependencies and test time to first render in the host.
        </p>
      </Step>
      <Step n={5} title="Verify the deployed view in Claude">
        <p>
          With <Code>cloudflared</Code> installed, run <Code>npm run tunnel</Code> while the starter is running.
          Add the tunnel HTTPS URL plus <Code>/mcp</Code> as a custom connector with <strong>No sign in</strong>.
          The starter serves public sample data. Ask Claude to run <Code>show_record</Code> and verify that the
          card renders.
        </p>
        <p>
          When tool definitions or resource URIs change, open the connector menu under <strong>Your plugins</strong>
          {" "}and select <strong>Refresh tools list</strong>. Use a fresh chat for the check because a chat can retain
          the previous tool catalog or cached HTML.
        </p>
        <p>
          See the <Link className="underline underline-offset-2" href="/docs/mcp-server">MCP server guide</Link> for
          tool registration and the <Link className="underline underline-offset-2" href="/docs/protocol-hooks">protocol hooks guide</Link> for view state.
        </p>
      </Step>
    </DocsShell>
  )
}

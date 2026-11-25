import type { Metadata } from "next"

import { AppBridgeHost } from "@/components/site/app-bridge-host"
import { OG_IMAGE } from "@/lib/site"

const description =
  "Test MCP Apps in a real sandboxed iframe running @modelcontextprotocol/ext-apps AppBridge with Claude host tokens, display modes, safe areas, and editable mock tool results."

export const metadata: Metadata = {
  title: "AppBridge Host Playground for Claude MCP Apps",
  description,
  alternates: { canonical: "/playground" },
  openGraph: {
    title: "AppBridge Host Playground | MCP Blocks UI",
    description,
    images: [OG_IMAGE],
    url: "/playground",
  },
}

export default function PlaygroundPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-wider text-[#B5543A]">
          Real MCP Apps Protocol Host
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          AppBridge Playground
        </h1>
        <p className="max-w-3xl text-lg text-[#3d3d3a]">
          Runs the bundled <code className="font-mono text-base">deal-app</code> view (or any single-file MCP App HTML
          you paste) inside an opaque-origin sandboxed iframe wired to{" "}
          <code className="font-mono text-base">AppBridge</code>. Toggle theme, display mode, and mobile safe areas or
          send custom tool results over JSON-RPC.
        </p>
      </header>

      <AppBridgeHost />
    </div>
  )
}

import type { Metadata } from "next"

import { AppBridgeHost } from "@/components/site/app-bridge-host"
import { PageShell } from "@/components/site/chrome"
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
    <PageShell rails="wide">
      <div className="border-t border-[#141413]/[0.075] px-4 sm:px-6">
        <div className="mx-auto max-w-7xl px-2 py-12 lg:py-16">
          <p className="mb-3 font-mono text-xs font-semibold tracking-widest text-[#B5543A] uppercase">
            Real MCP Apps Protocol Host
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#141413] sm:text-4xl">
            AppBridge Playground
          </h1>
          <p className="mt-3 max-w-3xl text-base/7 text-[#3d3d3a]">
            Runs the bundled{" "}
            <code className="rounded bg-[#141413]/[0.06] px-1.5 py-0.5 font-mono text-sm">deal-app</code> view (or any
            single-file MCP App HTML you paste) inside an opaque-origin sandboxed iframe wired to{" "}
            <code className="rounded bg-[#141413]/[0.06] px-1.5 py-0.5 font-mono text-sm">AppBridge</code>.
          </p>
        </div>
      </div>

      <main className="rounded-[2.5rem] bg-white/85 px-4 py-12 backdrop-blur-sm sm:px-6">
        <div className="mx-auto max-w-7xl px-2">
          <AppBridgeHost />
        </div>
      </main>
    </PageShell>
  )
}

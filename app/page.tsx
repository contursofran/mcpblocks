import Link from "next/link"

import { PageShell } from "@/components/site/chrome"
import { CodeBlock } from "@/components/site/code-block"
import { ComponentGallery } from "@/components/site/component-gallery"
import { HeroChat } from "@/components/site/hero-chat"
import { components, roadmap } from "@/lib/docs"

const features = [
  {
    title: "Host theme tokens",
    body: "Components read the CSS variables Claude injects at runtime, so light and dark mode match the host automatically.",
  },
  {
    title: "Display-mode aware",
    body: "Inline cards auto-fit height and cap at two actions. Fullscreen layouts leave room for the floating composer.",
  },
  {
    title: "Mobile safe areas built in",
    body: "Safe-area insets become CSS variables, tap targets hit 44px, and floating popovers are banned so nothing clips.",
  },
  {
    title: "You own the code",
    body: "A shadcn registry: components land directly in your repo with zero runtime lock-in when the spec evolves.",
  },
]

export default function Home() {
  return (
    <PageShell rails="home">
      {/* Headless UI–style full-width editorial hero above the rounded sheet */}
      <div className="relative z-10 border-t border-[#141413]/[0.075] px-4 sm:px-6">
        <div className="mx-auto max-w-7xl px-2 py-16 lg:py-24">
          <h1 className="max-w-5xl text-2xl font-semibold tracking-tight text-balance text-[#141413] sm:text-[clamp(2rem,3.75vw,3rem)]/tight">
            Claude-native, fully accessible React components for MCP Apps, designed to adapt to any host.
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/components/${components[0].slug}`}
              className="inline-flex min-h-10 items-center rounded-full bg-[#141413] px-4 text-sm font-semibold text-[#faf9f5] transition-opacity hover:opacity-90"
            >
              Browse components
            </Link>
            <Link
              href="/playground"
              className="inline-flex min-h-10 items-center rounded-full border border-[#141413]/10 bg-white px-4 text-sm font-semibold text-[#141413] transition-colors hover:bg-[#faf9f5]"
            >
              AppBridge playground
            </Link>
            <code className="hidden rounded-full border border-[#141413]/10 bg-white px-3.5 py-2 font-mono text-xs text-[#3d3d3a] lg:inline-block">
              npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json
            </code>
          </div>
        </div>
      </div>

      {/* Headless UI signature rounded-[2.5rem] main sheet */}
      <main className="relative z-10 rounded-[2.5rem] bg-white/95 px-4 pb-16 shadow-[0_1px_2px_rgba(20,20,19,0.03)] backdrop-blur-sm sm:px-6">
        <ComponentGallery />

        {/* Interactive Before / After comparison inside the same 3-rail sheet */}
        <section className="mx-auto mt-8 max-w-7xl border-t border-[#141413]/[0.075] px-2 pt-14 pb-10">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
            <div className="flex flex-col gap-5">
              <p className="font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
                Why MCP Apps
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-[#141413] sm:text-3xl">
                Replace walls of chat text with native host UI.
              </h2>
              <p className="text-sm/6 text-[#3d3d3a] sm:text-base/7">
                Copy components into your MCP App view with the shadcn CLI. Every block speaks Claude&apos;s CSS
                variables, honors mobile safe areas, and degrades gracefully in ChatGPT, VS Code, and AI SDK hosts.
              </p>
              <CodeBlock
                prompt
                code="npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json"
                className="max-w-lg"
              />
            </div>

            <div className="min-w-0">
              <HeroChat />
            </div>
          </div>
        </section>

        {/* Principles strip */}
        <section className="mx-auto max-w-7xl border-t border-[#141413]/[0.075] px-2 py-14">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-[#141413]">{f.title}</h3>
                <p className="text-sm/6 text-[#73726c]">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Fullscreen roadmap */}
        <section id="roadmap" className="mx-auto max-w-7xl scroll-mt-20 border-t border-[#141413]/[0.075] px-2 pt-14">
          <h2 className="mb-8 font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
            Roadmap · Fullscreen blocks
          </h2>
          <ul className="grid gap-8 sm:grid-cols-3">
            {roadmap.map((r) => (
              <li key={r.title} className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-[#141413]">{r.title}</h3>
                <p className="text-sm/6 text-[#73726c]">{r.description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </PageShell>
  )
}

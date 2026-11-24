import Link from "next/link"

import { CodeBlock } from "@/components/site/code-block"
import { GITHUB_URL } from "@/components/site/chrome"
import { CarouselDemo, ConfirmActionDemo } from "@/components/site/demos"
import { components, roadmap } from "@/lib/docs"

const features = [
  {
    title: "Host tokens, not hex codes",
    body: "Components read the CSS variables the host injects, so light and dark mode match Claude with no extra work.",
  },
  {
    title: "Display-mode aware",
    body: "Inline cards fit their height and cap at two actions. Fullscreen layouts leave room for the composer.",
  },
  {
    title: "Mobile safe areas built in",
    body: "Safe-area insets become CSS variables, tap targets are 44px, and there are no popovers to get clipped.",
  },
  {
    title: "You own the code",
    body: "A shadcn registry: components land in your repo, with no runtime dependency to break when the spec moves.",
  },
]

export default function Home() {
  return (
    <main>
      <section className="mx-auto flex max-w-6xl flex-wrap items-center gap-14 px-6 pt-16 pb-14 sm:pt-24">
        <div className="min-w-0 flex-[1_1_440px]">
          <span className="inline-flex rounded-full bg-[#d6e4f6] px-3 py-1 text-[13px] font-semibold text-[#3266ad]">
            MCP Apps · spec 2026-01-26
          </span>
          <h1 className="mt-5 mb-5 font-serif text-5xl leading-[1.02] font-normal tracking-tight sm:text-[64px]">
            Widgets that feel native inside Claude.
          </h1>
          <p className="mb-7 max-w-[520px] text-lg text-[#3d3d3a]">
            Copy-paste React components for MCP Apps. Built on Claude&apos;s host tokens, inline and
            fullscreen display rules, and mobile safe areas, and they still work in ChatGPT and other
            MCP hosts.
          </p>
          <div className="mb-7 flex flex-wrap gap-3">
            <Link
              href={`/components/${components[0].slug}`}
              className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-primary-foreground hover:opacity-90"
            >
              Browse components
            </Link>
            <a
              href={GITHUB_URL}
              className="inline-flex min-h-11 items-center rounded-lg border border-input bg-card px-5 font-semibold hover:bg-secondary"
            >
              Star on GitHub
            </a>
          </div>
          <CodeBlock prompt code="npx shadcn@latest add https://inlinekit.dev/r/inline-card.json" className="max-w-[560px]" />
        </div>

        <div className="flex min-w-0 flex-[1_1_400px] flex-col gap-4 overflow-hidden">
          <ConfirmActionDemo />
          <CarouselDemo />
        </div>
      </section>

      <section className="border-y bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title}>
              <h2 className="mb-1.5 font-semibold">{f.title}</h2>
              <p className="text-[15px] text-[#3d3d3a]">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16">
        <h2 className="mb-2 font-serif text-4xl font-normal sm:text-[44px]">Components</h2>
        <p className="mb-8 text-[#3d3d3a]">The small set Claude&apos;s guidelines actually allow, done well. Every one has a live host preview.</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="flex flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:border-input"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{c.title}</span>
                <span className="rounded-full bg-[#e9f1dc] px-2 py-0.5 text-xs font-semibold text-[#265b19]">Free</span>
              </div>
              <p className="text-sm text-[#3d3d3a]">{c.description}</p>
              <span className="font-mono text-xs text-muted-foreground">{c.displayModes}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-16">
        <h2 className="mb-2 font-serif text-4xl font-normal sm:text-[44px]">On the roadmap</h2>
        <p className="mb-8 text-[#3d3d3a]">Tell us which one you&apos;d use first.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {roadmap.map((r) => (
            <div key={r.title} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{r.title}</span>
                <span className="rounded-full bg-[#f6eedf] px-2 py-0.5 text-xs font-semibold text-[#5a4815]">Soon</span>
              </div>
              <p className="text-sm text-[#3d3d3a]">{r.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-2xl bg-[#141413] p-8 text-[#faf9f5] sm:p-10">
          <div className="min-w-0 flex-[1_1_360px]">
            <h2 className="mb-2 font-serif text-4xl font-normal">Free and open source.</h2>
            <p className="text-[#c2c0b6]">
              Every component is MIT. Leave your email to hear when templates ship, or if you need an MCP App built for your company.
            </p>
          </div>
          {/* Wire this form to your email provider (e.g. a server action or form endpoint). */}
          <form className="flex min-w-0 flex-[1_1_320px] flex-wrap gap-2" action="#">
            <label htmlFor="wl-email" className="sr-only">
              Email
            </label>
            <input
              id="wl-email"
              name="email"
              type="email"
              required
              placeholder="you@company.com"
              className="min-h-11 min-w-0 flex-[1_1_200px] rounded-lg border border-white/30 bg-[#30302e] px-3.5 text-[15px] text-[#faf9f5] placeholder:text-[#9c9a92]"
            />
            <button type="submit" className="min-h-11 rounded-lg bg-[#faf9f5] px-5 font-semibold text-[#141413] hover:opacity-90">
              Join the list
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

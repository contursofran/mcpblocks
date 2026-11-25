import Link from "next/link"

import { CodeBlock } from "@/components/site/code-block"
import { HeroChat } from "@/components/site/hero-chat"
import { components, roadmap } from "@/lib/docs"

const features = [
  {
    title: "Host theme tokens",
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
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-14">
        <div className="min-w-0">
          <h1 className="mb-5 max-w-[16ch] text-4xl leading-[1.08] font-semibold tracking-tight text-balance sm:text-5xl xl:text-6xl">
            React components for MCP Apps
          </h1>
          <p className="mb-7 max-w-lg text-base leading-relaxed text-foreground/80 sm:text-lg">
            Copy and paste cards, approvals, and other interactive widgets that adapt to the host&apos;s
            theme, display mode, and mobile safe areas. Built for Claude, with support for ChatGPT
            and other hosts.
          </p>
          <Link
            href={`/components/${components[0].slug}`}
            className="mb-6 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Browse components
          </Link>
          <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/inline-card.json" className="max-w-xl" />
        </div>

        <div className="min-w-0">
          <HeroChat />
        </div>
      </section>

      <section className="border-y bg-secondary">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title}>
              <h2 className="mb-1.5 font-semibold">{f.title}</h2>
              <p className="text-sm leading-relaxed text-foreground/80">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-16">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Components</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              className="flex flex-col gap-2 rounded-xl border bg-card p-5 transition-colors hover:border-input"
            >
              <h3 className="font-semibold">{c.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/80">{c.description}</p>
              <span className="mt-auto pt-2 text-xs text-muted-foreground">{c.displayModes}</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="roadmap" className="mx-auto max-w-6xl scroll-mt-20 px-6 pt-16">
        <h2 className="mb-6 text-3xl font-semibold tracking-tight">Roadmap</h2>
        <ul className="grid gap-x-6 sm:grid-cols-3">
          {roadmap.map((r) => (
            <li key={r.title} className="border-t py-4">
              <h3 className="mb-1 font-semibold">{r.title}</h3>
              <p className="text-sm leading-relaxed text-foreground/80">{r.description}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="pb-16" />
    </main>
  )
}

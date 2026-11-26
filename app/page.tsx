import Link from "next/link"

import { PageShell } from "@/components/site/chrome"
import { CodeBlock } from "@/components/site/code-block"
import { ComponentGallery } from "@/components/site/component-gallery"
import { HeroChat } from "@/components/site/hero-chat"
import { JsonLd } from "@/components/site/json-ld"
import { components } from "@/lib/docs"
import { homeJsonLd } from "@/lib/schema"

export default function Home() {
  return (
    <PageShell rails="home">
      <JsonLd data={homeJsonLd()} />
            <div className="relative z-10 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl px-2 py-20 lg:py-28">
          <h1 className="max-w-5xl text-2xl font-semibold tracking-tight text-balance text-[#141413] sm:text-[clamp(2rem,3.75vw,3rem)]/tight">
            React components for MCP Apps, built for Claude and adaptable to any host.
          </h1>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={`/components/${components[0].slug}`}
              className="inline-flex min-h-10 items-center rounded-md bg-[#141413] px-4 text-sm font-medium text-[#faf9f5] transition-opacity hover:opacity-90"
            >
              Browse components
            </Link>
            <a
              href="https://github.com/contursofran/mcpblocks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-10 items-center px-2 text-sm text-[#141413]/60 transition-colors hover:text-[#141413]"
            >
              Open source · MIT on GitHub
            </a>
          </div>
        </div>
      </div>

      <main className="relative z-10 bg-white px-4 pb-16 sm:px-6">
        <ComponentGallery />

        {/* Interactive Before / After comparison inside the same 3-rail sheet */}
        <section className="mx-auto mt-8 max-w-7xl px-2 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
            <div className="flex flex-col gap-5">
              <h2 className="text-2xl font-semibold tracking-tight text-[#141413] sm:text-3xl">
                Replace walls of chat text with native UI.
              </h2>
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

      </main>
    </PageShell>
  )
}

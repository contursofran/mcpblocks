import Link from "next/link"

import { PageShell } from "@/components/site/chrome"
import { cn } from "@/lib/utils"
import { components } from "@/lib/docs"
import { docsPages } from "@/lib/site"

export function DocsShell({
  current,
  title,
  lead,
  children,
}: {
  current: string
  title: string
  lead: string
  children: React.ReactNode
}) {
  return (
    <PageShell rails="docs">
      <main className="relative z-10 rounded-[2.5rem] bg-white/95 px-4 backdrop-blur-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl lg:gap-[14px]">
          <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 border-x border-[#141413]/[0.075] lg:block">
            <div className="h-full overflow-y-auto pb-24">
              <div className="flex gap-2 px-4 pt-16 pb-8">
                <Link
                  href={`/components/${components[0].slug}`}
                  className="rounded-full px-3 py-1 text-sm/6 font-semibold text-[#141413]/45 transition-colors hover:bg-[#141413]/[0.04] hover:text-[#141413]/75"
                >
                  Components
                </Link>
                <div className="rounded-full bg-[#141413]/[0.08] px-3 py-1 text-sm/6 font-semibold text-[#141413] select-none">
                  Docs
                </div>
              </div>

              <nav aria-label="Docs">
                <div className="border-t border-[#141413]/[0.075] py-7">
                  <h2 className="px-4 pb-4 font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
                    Guides
                  </h2>
                  <div className="flex flex-col gap-3.5 px-4">
                    {docsPages.map((p) => {
                      const active = p.href === current
                      return (
                        <Link
                          key={p.href}
                          href={p.href}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block whitespace-nowrap text-sm transition-colors",
                            active
                              ? "font-semibold text-[#141413]"
                              : "text-[#141413]/70 hover:text-[#141413]"
                          )}
                        >
                          {p.title}
                        </Link>
                      )
                    })}
                    <Link
                      href="/tokens"
                      className="block whitespace-nowrap text-sm text-[#141413]/70 transition-colors hover:text-[#141413]"
                    >
                      Host tokens
                    </Link>
                    <Link
                      href="/playground"
                      className="block whitespace-nowrap text-sm text-[#141413]/70 transition-colors hover:text-[#141413]"
                    >
                      AppBridge playground
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col pt-10 pb-20 lg:border-x lg:border-[#141413]/[0.075] lg:pt-16">
            <article className="mx-auto flex w-full max-w-[46rem] min-w-0 flex-col gap-10 px-2 md:px-8">
              <header>
                <h1 className="text-3xl font-semibold tracking-tight text-[#141413] sm:text-4xl">
                  {title}
                </h1>
                <p className="mt-4 text-base/7 text-[#3d3d3a]">{lead}</p>
              </header>
              {children}
            </article>
          </div>

          <div className="hidden w-[17rem] shrink-0 border-x border-[#141413]/[0.075] xl:block" aria-hidden="true" />
        </div>
      </main>
    </PageShell>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold tracking-tight text-[#141413]">
        <span className="mr-2 font-mono text-base text-[#141413]/45">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-[#141413]/[0.06] px-1.5 py-0.5 font-mono text-[0.88em] text-[#141413]">
      {children}
    </code>
  )
}

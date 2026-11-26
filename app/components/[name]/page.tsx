import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageShell } from "@/components/site/chrome"
import { CodeBlock } from "@/components/site/code-block"
import { ComponentPreview } from "@/components/site/component-preview"
import { JsonLd } from "@/components/site/json-ld"
import { cn } from "@/lib/utils"
import { componentCategories, components, getComponent } from "@/lib/docs"
import { componentJsonLd } from "@/lib/schema"
import { docsPages, OG_IMAGE, SITE_URL } from "@/lib/site"

export function generateStaticParams() {
  return components.map((c) => ({ name: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const { name } = await params
  const doc = getComponent(name)
  if (!doc) return {}
  const title = `${doc.title} component for Claude MCP Apps`
  const path = `/components/${doc.slug}`
  return {
    title,
    description: doc.description,
    alternates: {
      canonical: path,
      types: {
        "text/markdown": `${SITE_URL}/docs/components/${doc.slug}.md`,
      },
    },
    openGraph: {
      title: `${title} | MCP Blocks UI`,
      description: doc.description,
      images: [OG_IMAGE],
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MCP Blocks UI`,
      description: doc.description,
      images: [OG_IMAGE],
    },
  }
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="group relative scroll-mt-12 text-xl font-semibold tracking-tight text-[#141413]"
    >
      <a
        href={`#${id}`}
        aria-label={typeof children === "string" ? children : id}
        className="absolute -ml-5 font-normal text-[#141413]/30 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        #
      </a>
      {children}
    </h2>
  )
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  const doc = getComponent(name)
  if (!doc) notFound()

  return (
    <PageShell rails="docs">
      <JsonLd data={componentJsonLd(doc)} />
      <main className="relative z-10 rounded-[2.5rem] bg-white/95 px-4 sm:px-6">
        <div className="relative mx-auto flex max-w-7xl lg:gap-[14px]">
          {/* Left sticky sidebar (aligned inside w-68 rail) */}
          <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 lg:block">
            <div className="h-full overflow-y-auto pb-24">
              <div className="flex gap-2 px-4 pt-16 pb-8">
                <div className="rounded-full bg-[#141413]/[0.08] px-3 py-1 text-sm/6 font-semibold text-[#141413] select-none">
                  Components
                </div>
              </div>

              <nav aria-label="Components">
                {componentCategories.map((category) => {
                  const group = components.filter((c) => c.category === category)
                  return (
                    <div key={category} className=" py-7">
                      <h2 className="px-4 pb-4 font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
                        {category}
                      </h2>
                      <div className="flex flex-col gap-3.5 px-4">
                        {group.map((c) => {
                          const active = c.slug === doc.slug
                          return (
                            <Link
                              key={c.slug}
                              href={`/components/${c.slug}`}
                              aria-current={active ? "page" : undefined}
                              className={cn(
                                "block whitespace-nowrap text-sm transition-colors duration-150",
                                active
                                  ? "font-semibold text-[#141413]"
                                  : "text-[#141413]/70 hover:text-[#141413]"
                              )}
                            >
                              {c.title}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <div className=" py-7">
                  <h2 className="px-4 pb-4 font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
                    Guides
                  </h2>
                  <div className="flex flex-col gap-3.5 px-4">
                    {docsPages.map((p) => (
                      <Link
                        key={p.href}
                        href={p.href}
                        className="block whitespace-nowrap text-sm text-[#141413]/70 transition-colors hover:text-[#141413]"
                      >
                        {p.title}
                      </Link>
                    ))}
                    <Link
                      href="/tokens"
                      className="block whitespace-nowrap text-sm text-[#141413]/70 transition-colors hover:text-[#141413]"
                    >
                      Host tokens
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Center documentation column */}
          <div className="flex min-w-0 flex-1 flex-col pt-8 pb-20 lg:pt-16">
            {/* Mobile component strip */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
              {components.map((c) => (
                <Link
                  key={c.slug}
                  href={`/components/${c.slug}`}
                  aria-current={c.slug === doc.slug ? "page" : undefined}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                    c.slug === doc.slug
                      ? "bg-[#141413] text-[#faf9f5]"
                      : "bg-[#141413]/[0.06] text-[#141413]/70 hover:text-[#141413]"
                  )}
                >
                  {c.title}
                </Link>
              ))}
            </div>

            <article className="mx-auto w-full max-w-[46rem] min-w-0 px-2 md:px-8">
              <header>
                <h1 className="text-3xl font-semibold tracking-tight text-[#141413] sm:text-4xl">
                  {doc.title}
                </h1>
                <p className="mt-4 mb-2 text-base/7 text-[#3d3d3a]">
                  {doc.description}
                </p>
              </header>

              <section id="preview" className="mt-8 mb-12 scroll-mt-12">
                <ComponentPreview
                  slug={doc.slug}
                  checks={doc.checks}
                  variant={doc.variant}
                  code={doc.usage}
                />
              </section>

              <div className="flex flex-col gap-12">
                <section className="flex flex-col gap-4">
                  <SectionHeading id="installation">Installation</SectionHeading>
                  <p className="text-sm/6 text-[#3d3d3a]">
                    To get started, add the component to your project via the shadcn CLI:
                  </p>
                  <CodeBlock prompt code={`npx shadcn@latest add https://mcpblocks.dev/r/${doc.slug}.json`} />
                  <p className="text-sm/6 text-[#73726c]">
                    This also installs{" "}
                    <code className="rounded bg-[#141413]/[0.06] px-1.5 py-0.5 font-mono text-xs text-[#141413]">
                      host-tokens
                    </code>
                    , adding Claude&apos;s CSS variables and utilities like{" "}
                    <code className="rounded bg-[#141413]/[0.06] px-1.5 py-0.5 font-mono text-xs text-[#141413]">
                      bg-host-bg
                    </code>{" "}
                    to your stylesheet.
                  </p>
                </section>

                <section className="flex flex-col gap-4">
                  <SectionHeading id="basic-example">Basic example</SectionHeading>
                  <CodeBlock code={doc.usage} />
                </section>

                <section className="flex flex-col gap-4">
                  <SectionHeading id="component-api">Component API</SectionHeading>
                  <div className="overflow-x-auto border-y border-[#141413]/[0.08]">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b border-[#141413]/[0.08] font-mono text-xs text-[#141413]/55">
                        <tr>
                          <th className="py-3 pr-4 font-medium">Prop</th>
                          <th className="px-4 py-3 font-medium">Type</th>
                          <th className="py-3 pl-4 font-medium">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doc.props.map((p) => (
                          <tr key={p.name} className="border-b border-[#141413]/[0.06] last:border-0">
                            <td className="py-3.5 pr-4 align-top font-mono text-[13px] font-medium text-[#B5543A]">
                              {p.name}
                            </td>
                            <td className="px-4 py-3.5 align-top font-mono text-[12px] text-[#73726c]">
                              {p.type}
                            </td>
                            <td className="py-3.5 pl-4 align-top leading-relaxed text-[#3d3d3a]">
                              {p.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </article>
          </div>

          {/* Right sticky TOC (aligned inside w-68 rail) */}
          <aside className="sticky top-0 hidden h-screen w-[17rem] shrink-0 xl:block">
            <div className="h-full overflow-y-auto px-6 pt-16 pb-24">
              <p className="font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
                On this page
              </p>
              <nav aria-label="On this page">
                <ul className="text-sm text-[#141413]/70">
                  <li className="mt-4">
                    <a href="#preview" className="transition-colors hover:text-[#141413]">
                      Preview
                    </a>
                  </li>
                  <li className="mt-4">
                    <a href="#installation" className="transition-colors hover:text-[#141413]">
                      Installation
                    </a>
                  </li>
                  <li className="mt-4">
                    <a href="#basic-example" className="transition-colors hover:text-[#141413]">
                      Basic example
                    </a>
                  </li>
                  <li className="mt-4">
                    <a href="#component-api" className="transition-colors hover:text-[#141413]">
                      Component API
                    </a>
                  </li>
                </ul>
              </nav>


              <div className="mt-8 pt-6">
                <p className="font-mono text-xs font-semibold tracking-widest text-[#141413]/45 uppercase">
                  For Agents
                </p>
                <div className="mt-3 flex flex-col gap-2 font-mono text-xs text-[#73726c]">
                  <a
                    href={`/docs/components/${doc.slug}.md`}
                    className="transition-colors hover:text-[#141413]"
                  >
                    Markdown docs (.md)
                  </a>
                  <a
                    href={`/r/${doc.slug}.json`}
                    className="transition-colors hover:text-[#141413]"
                  >
                    Registry JSON (.json)
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </PageShell>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CodeBlock } from "@/components/site/code-block"
import { ComponentPreview } from "@/components/site/component-preview"
import { cn } from "@/lib/utils"
import { components, getComponent } from "@/lib/docs"

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
  return doc ? { title: doc.title } : {}
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
    <div className="mx-auto flex max-w-6xl flex-wrap gap-10 px-6 py-10">
      <aside className="w-full sm:w-48 sm:shrink-0">
        <nav aria-label="Components" className="flex flex-wrap gap-1 sm:flex-col">
          <p className="mb-1 hidden px-3 text-xs font-medium text-muted-foreground sm:block">
            Components
          </p>
          {components.map((c) => (
            <Link
              key={c.slug}
              href={`/components/${c.slug}`}
              aria-current={c.slug === doc.slug ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                c.slug === doc.slug && "bg-secondary font-medium text-foreground"
              )}
            >
              {c.title}
            </Link>
          ))}
        </nav>
      </aside>

      <article className="flex min-w-0 flex-[999_1_560px] flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{doc.title}</h1>
          <p className="max-w-2xl text-lg text-[#3d3d3a]">{doc.description}</p>
          <p className="font-mono text-xs text-muted-foreground">Display modes: {doc.displayModes}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Preview</h2>
          <ComponentPreview slug={doc.slug} checks={doc.checks} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Install</h2>
          <CodeBlock prompt code={`npx shadcn@latest add https://inlinekit.dev/r/${doc.slug}.json`} />
          <p className="text-sm text-muted-foreground">
            Pulls in <code className="font-mono">host-tokens</code> too, which adds the host CSS variables and
            Tailwind utilities like <code className="font-mono">bg-host-bg</code> to your stylesheet.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Usage</h2>
          <CodeBlock code={doc.usage} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Props</h2>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Prop</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {doc.props.map((p) => (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="px-4 py-3 font-mono text-[13px]">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-muted-foreground">{p.type}</td>
                    <td className="px-4 py-3">{p.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </div>
  )
}

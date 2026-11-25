import Link from "next/link"

import { cn } from "@/lib/utils"
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
    <div className="mx-auto flex max-w-6xl flex-wrap gap-10 px-6 py-10">
      <aside className="w-full sm:w-48 sm:shrink-0">
        <nav aria-label="Docs" className="flex flex-wrap gap-1 sm:flex-col">
          <p className="mb-1 hidden px-3 text-xs font-medium text-muted-foreground sm:block">Docs</p>
          {docsPages.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={p.href === current ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground",
                p.href === current && "bg-secondary font-medium text-foreground"
              )}
            >
              {p.title}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="flex min-w-0 max-w-3xl flex-[999_1_560px] flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
          <p className="text-lg text-foreground/80">{lead}</p>
        </header>
        {children}
      </article>
    </div>
  )
}

export function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">
        <span className="mr-2 text-muted-foreground">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-[0.9em]">{children}</code>
}

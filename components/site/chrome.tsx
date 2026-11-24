import Link from "next/link"

import { components } from "@/lib/docs"

export const GITHUB_URL = "https://github.com/your-org/inlinekit"

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-[17px] font-semibold">
      <span className="inline-flex size-7 items-center justify-center rounded-lg bg-foreground">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#faf9f5" strokeWidth="2.4" aria-hidden="true">
          <rect x="3" y="6" width="18" height="12" rx="3" />
        </svg>
      </span>
      inlinekit
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Logo />
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link href={`/components/${components[0].slug}`} className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">
            Components
          </Link>
          <Link href="/#roadmap" className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground">
            Roadmap
          </Link>
          <a
            href={GITHUB_URL}
            className="ml-2 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 font-semibold text-primary-foreground hover:opacity-90"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-muted-foreground">
        <p>
          Components adapted from{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude">
            MCP Apps for Claude
          </a>{" "}
          by Anthropic, licensed under{" "}
          <a className="underline underline-offset-2 hover:text-foreground" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          . Changes: rebuilt as React components, adapted for other MCP hosts. Site built on the shadcn registry template (MIT).
        </p>
        <p>inlinekit is an independent project, not affiliated with or endorsed by Anthropic or OpenAI.</p>
      </div>
    </footer>
  )
}

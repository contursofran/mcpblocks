import Link from "next/link"

import { components } from "@/lib/docs"

export const GITHUB_URL = "https://github.com/contursofran/mcpblocks"

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 text-[17px] font-semibold">
      <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="9" y="4" width="19" height="7" rx="2.2" fill="#D97757" />
        <rect x="4" y="12.5" width="24" height="7" rx="2.2" fill="currentColor" />
        <rect x="4" y="21" width="16" height="7" rx="2.2" fill="currentColor" />
      </svg>
      MCP Blocks UI
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-6 py-3">
        <Logo />
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link href={`/components/${components[0].slug}`} className="rounded-md px-2 py-2 text-muted-foreground hover:text-foreground sm:px-3">
            Components
          </Link>
          <Link href="/#roadmap" className="rounded-md px-2 py-2 text-muted-foreground hover:text-foreground sm:px-3">
            Roadmap
          </Link>
          <a
            href={GITHUB_URL}
            className="rounded-md px-2 py-2 text-muted-foreground hover:text-foreground sm:px-3"
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
        <p>MCP Blocks UI is an independent project, not affiliated with or endorsed by Anthropic or OpenAI.</p>
      </div>
    </footer>
  )
}

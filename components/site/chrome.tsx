import Link from "next/link"

import { components } from "@/lib/docs"

export const GITHUB_URL = "https://github.com/contursofran/mcpblocks"

export function Logo() {
  return (
    <Link
      href="/"
      aria-label="MCP Blocks UI home page"
      className="inline-flex items-center gap-2.5 text-[17px] font-semibold tracking-tight text-[#141413]"
    >
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="9" y="4" width="19" height="7" rx="2.2" fill="#D97757" />
        <rect x="4" y="12.5" width="24" height="7" rx="2.2" fill="currentColor" />
        <rect x="4" y="21" width="16" height="7" rx="2.2" fill="currentColor" />
      </svg>
      <span>MCP Blocks UI</span>
    </Link>
  )
}

export function SiteHeader() {
  return (
    <header className="relative z-20 px-4 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <Logo />
          <Link
            href="/docs/installation"
            className="hidden items-center gap-1 rounded-2xl bg-[#141413]/[0.06] px-3 py-0.5 text-sm/6 font-medium text-[#141413] backdrop-blur-sm transition-colors hover:bg-[#141413]/[0.1] sm:inline-flex"
          >
            v1 · Claude
          </Link>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <nav aria-label="Main" className="hidden items-center gap-5 text-sm/6 font-medium text-[#141413]/70 md:flex">
            <Link href={`/components/${components[0].slug}`} className="transition-colors hover:text-[#141413]">
              Components
            </Link>
            <Link href="/playground" className="transition-colors hover:text-[#141413]">
              Playground
            </Link>
            <Link href="/docs/installation" className="transition-colors hover:text-[#141413]">
              Docs
            </Link>
            <Link href="/tokens" className="transition-colors hover:text-[#141413]">
              Tokens
            </Link>
          </nav>
          <a
            aria-label="View project on GitHub"
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#141413] transition-opacity hover:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="relative z-20 px-4 py-12 text-center text-sm/6 text-[#141413]/65 sm:px-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        <p>
          Components adapted from{" "}
          <a
            className="underline decoration-[#141413]/25 underline-offset-2 hover:text-[#141413]"
            href="https://www.figma.com/community/file/1597641111449594397/mcp-apps-for-claude"
          >
            MCP Apps for Claude
          </a>{" "}
          by Anthropic (
          <a
            className="underline decoration-[#141413]/25 underline-offset-2 hover:text-[#141413]"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC BY 4.0
          </a>
          ). Rebuilt as React components and adapted for other MCP hosts.
        </p>
        <p className="text-xs text-[#141413]/50">
          MCP Blocks UI is an independent project, not affiliated with or endorsed by Anthropic or OpenAI. Built on the
          shadcn registry template (MIT).
        </p>
      </div>
    </footer>
  )
}

/**
 * Headless UI–inspired light-mode shell:
 * - Atmospheric daylight aura top & bottom
 * - Full-height z-10 vertical hairline rails matching either the 3-column home grid
 *   or the w-68 / flex-1 / w-68 documentation grid
 * - Header & footer sitting directly on the atmospheric canvas outside the rounded-[2.5rem] sheet
 */
export function PageShell({
  rails = "home",
  children,
}: {
  rails?: "home" | "docs" | "wide"
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-svh overflow-x-clip">
      <SiteHeader />

      {/* Top & bottom daylight atmospheric washes */}
      <div
        aria-hidden="true"
        className="headless-bg-top pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px]"
      />
      <div
        aria-hidden="true"
        className="headless-bg-bottom pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[420px]"
      />

      {/* Continuous architectural vertical hairline rails (sits behind foreground UI so lines never cut text or pills) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 px-4 sm:px-6"
      >
        {rails === "home" ? (
          <div className="mx-auto flex h-full max-w-[calc(80rem+2px)] gap-[14px]">
            <div className="flex-1 border-x border-[#141413]/[0.06]" />
            <div className="hidden flex-1 border-x border-[#141413]/[0.06] sm:block" />
            <div className="hidden flex-1 border-x border-[#141413]/[0.06] lg:block" />
          </div>
        ) : rails === "docs" ? (
          <div className="mx-auto flex h-full max-w-[calc(80rem+2px)] gap-[14px]">
            <div className="hidden w-[17rem] border-x border-[#141413]/[0.075] lg:block" />
            <div className="flex-1 border-x border-[#141413]/[0.075]" />
            <div className="hidden w-[17rem] border-x border-[#141413]/[0.075] xl:block" />
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-[calc(80rem+2px)]">
            <div className="flex-1 border-x border-[#141413]/[0.075]" />
          </div>
        )}
      </div>

      {children}

      <SiteFooter />
    </div>
  )
}

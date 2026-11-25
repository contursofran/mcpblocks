"use client"

import * as React from "react"

import { AppFrame } from "@/components/site/host-preview"
import { HeroSlackList } from "@/components/site/demos"

/**
 * Landing-page hero: a desktop chat window with an MCP App rendered inline,
 * with a Before/After toggle that shows the same answer as plain chat text.
 * Evokes Claude's chat layout and palette (warm canvas, beige user bubble,
 * serif assistant text) without copying its branding.
 */
type HeroChatProps = {
  title?: string
  prompt?: string
  reply?: string
  app?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  before?: React.ReactNode
}

type Mode = "before" | "after"

export function HeroChat({
  title = "Onboarding feedback",
  prompt = "What did the team say about onboarding?",
  reply = "Two threads stand out. The revised flow doubled completion in testing.",
  app = "Slack",
  icon = <SlackLogo />,
  children = <HeroSlackList />,
  before = <SlackPlainText />,
}: HeroChatProps) {
  const [mode, setMode] = React.useState<Mode>("after")
  const [auto, setAuto] = React.useState(true)

  // Flip between the two states on its own until the visitor picks one.
  // "With" stays up longer, since it's the point of the page.
  React.useEffect(() => {
    if (!auto) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const t = setTimeout(() => setMode((m) => (m === "after" ? "before" : "after")), mode === "after" ? 6000 : 4000)
    return () => clearTimeout(t)
  }, [auto, mode])
  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="Compare"
        className="flex self-center rounded-full border border-[#1f1e1d]/15 bg-[#f0eee6] p-1 text-xs font-medium dark:border-white/10 dark:bg-[#141413]"
      >
        {(
          [
            ["before", "Without MCP Apps"],
            ["after", "With MCP Apps"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setAuto(false)
              setMode(value)
            }}
            className={
              "min-h-8 rounded-full px-3.5 transition-colors " +
              (mode === value
                ? "bg-white text-[#141413] shadow-sm dark:bg-[#30302e] dark:text-[#faf9f5]"
                : "text-[#73726c] hover:text-[#141413] dark:text-[#a6a39a] dark:hover:text-[#faf9f5]")
            }
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex flex-col overflow-hidden rounded-xl border border-[#1f1e1d]/15 bg-[#faf9f5] font-[family-name:var(--font-sans)] text-[#141413] shadow-[0_24px_48px_-20px_rgba(20,20,19,0.28)] dark:border-white/10 dark:bg-[#262624] dark:text-[#faf9f5]">
        {/* Window title bar */}
        <div className="relative flex h-10 shrink-0 items-center border-b border-[#1f1e1d]/10 px-4 dark:border-white/10">
          <div className="flex gap-2" aria-hidden="true">
            <span className="size-3 rounded-full border border-black/10 bg-[#ff5f57]" />
            <span className="size-3 rounded-full border border-black/10 bg-[#febc2e]" />
            <span className="size-3 rounded-full border border-black/10 bg-[#28c840]" />
          </div>
          <span className="absolute inset-x-0 text-center text-xs text-[#73726c] dark:text-[#a6a39a]">{title}</span>
        </div>

        <div className="flex flex-col gap-4 px-4 pt-4 pb-3 sm:px-5">
          <div className="flex justify-end">
            <p className="max-w-[85%] rounded-xl bg-[#f0eee6] px-4 py-2.5 text-sm leading-relaxed dark:bg-[#141413]">
              {prompt}
            </p>
          </div>

          {/* Stack both panels in one grid cell so the window height stays fixed at max(before, after) with zero layout shift. */}
          <div className="grid">
            <div
              aria-hidden={mode !== "after"}
              className={
                "col-start-1 row-start-1 flex flex-col gap-2.5 transition-opacity duration-200 " +
                (mode === "after" ? "opacity-100" : "pointer-events-none invisible opacity-0 select-none")
              }
            >
              <p className="font-serif text-[15px] leading-relaxed">{reply}</p>
              <AppFrame name={app} icon={icon}>
                {children}
              </AppFrame>
            </div>

            <div
              aria-hidden={mode !== "before"}
              className={
                "col-start-1 row-start-1 transition-opacity duration-200 " +
                (mode === "before" ? "opacity-100" : "pointer-events-none invisible opacity-0 select-none")
              }
            >
              {before}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4 sm:px-5" aria-hidden="true">
          <div className="flex items-center justify-between rounded-2xl border border-[#1f1e1d]/15 bg-white py-2 pr-2 pl-4 text-sm text-[#73726c] shadow-[0_4px_16px_-8px_rgba(20,20,19,0.15)] dark:border-white/10 dark:bg-[#30302e] dark:text-[#a6a39a]">
            <span>Reply…</span>
            <span className="flex size-8 items-center justify-center rounded-lg bg-[#c96442] text-base text-white">
              ↑
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The same answer as a host without MCP Apps would give it: a wall of text. */
function SlackPlainText() {
  return (
    <div className="flex flex-col gap-3 font-serif text-[15px] leading-relaxed">
      <p className="flex items-center gap-1.5 font-[family-name:var(--font-sans)] text-xs text-[#73726c] dark:text-[#a6a39a]">
        <span aria-hidden="true">⌕</span> Searched Slack for &quot;onboarding&quot; · 12 results
      </p>
      <p>Here&apos;s what I found in Slack:</p>
      <p>
        1. Marcus Johnson in #design (Nov 12): &quot;Mocked up a version that delays the notification prompt until after
        the first task.&quot;
        <br />
        2. Sarah Chen in #design-critiques (Nov 15): &quot;Tested the revised onboarding with 5 users. Completion went
        from 34% to 67%.&quot;
      </p>
      <p className="break-all">
        There are 10 more results. You can see them here:
        https://acme.slack.com/archives/C04DESIGN/p1731672000123456?thread_ts=1731672000.123456&amp;cid=C04DESIGN
      </p>
      <p>Want me to summarize the rest?</p>
    </div>
  )
}

function SlackLogo() {
  return (
    <svg viewBox="0 0 122.8 122.8" className="size-4">
      <path
        fill="#e01e5a"
        d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z"
      />
      <path
        fill="#36c5f0"
        d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z"
      />
      <path
        fill="#2eb67d"
        d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z"
      />
      <path
        fill="#ecb22e"
        d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z"
      />
    </svg>
  )
}

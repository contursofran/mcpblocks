"use client"

import * as React from "react"
import Link from "next/link"
import { AlertTriangle, CheckCircle2, Maximize2, Monitor, Moon, Smartphone, Sun } from "lucide-react"

import { insetsFor, type PreviewDevice, type PreviewMode, type PreviewTheme } from "@/lib/host-context"
import { cn } from "@/lib/utils"
import { CodeIcon, XIcon } from "@/registry/mcpblocks/ui/icons"

/** Approximate inline height cap used to flag widgets that would get clipped. */
const INLINE_HEIGHT_CAP = 520
const MIN_TAP_TARGET = 43.5

type DomLintResult = {
  nestedScrollCount: number
  floatingControlCount: number
  smallTapTargets: number
  horizontalOverflow: boolean
  inlineButtons: number
}

function lintWidgetDom(root: HTMLElement): DomLintResult {
  let nestedScrollCount = 0
  let floatingControlCount = 0
  let smallTapTargets = 0
  let horizontalOverflow = false
  let inlineButtons = 0

  const descendants = root.querySelectorAll<HTMLElement>("*")
  for (const el of descendants) {
    const style = window.getComputedStyle(el)
    if (style.display === "none" || style.visibility === "hidden") continue

    // 1. Nested vertical scroll containers
    if (
      (style.overflowY === "auto" || style.overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 2
    ) {
      nestedScrollCount++
    }

    // 2. Floating menus / native selects / dialogs
    const tag = el.tagName.toLowerCase()
    const role = el.getAttribute("role")
    if (
      tag === "select" ||
      role === "menu" ||
      role === "listbox" ||
      role === "dialog" ||
      role === "alertdialog"
    ) {
      floatingControlCount++
    }

    // 3. Tap targets on buttons (exempting inline text links such as hover:underline)
    if (tag === "button" && !el.hasAttribute("disabled")) {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        const isInlineTextButton =
          el.className.includes("hover:underline") || el.dataset.inlineLink === "true"
        if (!isInlineTextButton && (rect.width < MIN_TAP_TARGET || rect.height < MIN_TAP_TARGET)) {
          smallTapTargets++
        }
        if (el.dataset.slot === "host-button") {
          inlineButtons++
        }
      }
    }
  }

  // 4. Horizontal overflow at current frame width (ignoring intentional horizontal scrollers)
  if (root.scrollWidth > root.clientWidth + 2) {
    const hasIntentionalScroller = root.querySelector('[class*="overflow-x-auto"]') !== null
    if (!hasIntentionalScroller) {
      horizontalOverflow = true
    }
  }

  return {
    nestedScrollCount,
    floatingControlCount,
    smallTapTargets,
    horizontalOverflow,
    inlineButtons,
  }
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { value: T; label: string; icon: React.ElementType }[]
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-secondary p-1">
      {options.map((o) => {
        const Icon = o.icon
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors",
              active && "bg-card text-foreground shadow-sm"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Simulated MCP Apps host frame with live DOM guideline checks. Sets the same
 * CSS variables the host injects (theme tokens, safe-area insets) and mimics
 * inline vs fullscreen layout. For a full sandboxed iframe running the real
 * MCP Apps JSON-RPC protocol (`AppBridge`), see `/playground`.
 */
export function HostPreview({
  children,
  checks = [],
  variant = "card",
  appName = "App",
}: {
  children: React.ReactNode
  checks?: string[]
  /** "card": host draws a bordered app container. "borderless": `_meta.ui.prefersBorder: false`. */
  variant?: "card" | "borderless"
  appName?: string
}) {
  const [theme, setTheme] = React.useState<PreviewTheme>("light")
  const [mode, setMode] = React.useState<PreviewMode>("inline")
  const [device, setDevice] = React.useState<PreviewDevice>("web")
  const [height, setHeight] = React.useState(0)
  const [lint, setLint] = React.useState<DomLintResult | null>(null)
  const widgetRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = widgetRef.current
    if (!el) return

    const run = () => {
      setHeight(Math.round(el.getBoundingClientRect().height))
      setLint(lintWidgetDom(el))
    }

    run()
    const ro = new ResizeObserver(run)
    ro.observe(el)
    const mo = new MutationObserver(run)
    mo.observe(el, { childList: true, subtree: true, attributes: true })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [mode, device, theme])

  const insets = insetsFor(device, mode)
  const hostVars = {
    "--mb-safe-top": `${insets.top}px`,
    "--mb-safe-right": `${insets.right}px`,
    "--mb-safe-bottom": `${insets.bottom}px`,
    "--mb-safe-left": `${insets.left}px`,
  } as React.CSSProperties

  const tooTall = mode === "inline" && height > INLINE_HEIGHT_CAP
  const tooManyActions = mode === "inline" && (lint?.inlineButtons ?? 0) > 2

  const liveChecks: { ok: boolean; label: string }[] = [
    {
      ok: !tooTall,
      label:
        mode === "inline"
          ? `Inline height ${height}px ${tooTall ? `exceeds ~${INLINE_HEIGHT_CAP}px, may be clipped` : "fits"}`
          : "Fullscreen: content clears the composer",
    },
    ...(lint
      ? [
          {
            ok: mode === "fullscreen" || lint.nestedScrollCount === 0,
            label:
              mode === "fullscreen" || lint.nestedScrollCount === 0
                ? "DOM check: no nested vertical scroll"
                : `DOM check: ${lint.nestedScrollCount} nested vertical scroll container(s)`,
          },
          {
            ok: lint.floatingControlCount === 0,
            label:
              lint.floatingControlCount === 0
                ? "DOM check: no <select> or floating menus"
                : `DOM check: ${lint.floatingControlCount} floating control(s) detected`,
          },
          {
            ok: lint.smallTapTargets === 0,
            label:
              lint.smallTapTargets === 0
                ? "DOM check: button tap targets ≥ 44px"
                : `DOM check: ${lint.smallTapTargets} button(s) below 44×44px`,
          },
          {
            ok: !lint.horizontalOverflow,
            label: lint.horizontalOverflow
              ? `DOM check: horizontal overflow at ${device} width`
              : `DOM check: fits ${device === "mobile" ? "375px mobile" : "desktop"} width`,
          },
          ...(tooManyActions
            ? [{ ok: false, label: `DOM check: ${lint.inlineButtons} inline actions (max 2)` }]
            : []),
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
            ]}
          />
          <Segmented
            label="Display mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "inline", label: "Inline", icon: Monitor },
              { value: "fullscreen", label: "Fullscreen", icon: Maximize2 },
            ]}
          />
          <Segmented
            label="Device"
            value={device}
            onChange={setDevice}
            options={[
              { value: "web", label: "Web", icon: Monitor },
              { value: "mobile", label: "Mobile", icon: Smartphone },
            ]}
          />
        </div>
        <Link
          href="/playground"
          className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Open live AppBridge playground →
        </Link>
      </div>

      {/* Host frame */}
      <div className="flex justify-center rounded-2xl border bg-secondary/60 p-4 sm:p-8">
        <div
          data-host-theme={theme}
          style={hostVars}
          className={cn(
            "relative flex w-full flex-col overflow-hidden bg-host-bg-secondary text-host-fg transition-[max-width]",
            device === "mobile" ? "max-w-[375px] rounded-[28px] border-[6px] border-[#141413]" : "max-w-[760px] rounded-xl border border-host-border-tertiary",
            mode === "fullscreen" ? (device === "mobile" ? "h-[720px]" : "h-[620px]") : "min-h-[360px]"
          )}
        >
          {mode === "fullscreen" ? (
            <>
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-host-border-tertiary bg-host-bg px-4 text-sm">
                <span className="font-medium">Your app</span>
                <span className="inline-flex size-8 items-center justify-center rounded-md text-host-fg-tertiary" aria-hidden="true">
                  <XIcon className="size-4" />
                </span>
              </div>
              <div className="relative flex-1 overflow-y-auto bg-host-bg">
                <div
                  ref={widgetRef}
                  className="p-5"
                  style={{ paddingBottom: `calc(20px + var(--mb-safe-bottom))` }}
                >
                  {children}
                </div>
              </div>
              <Composer floating />
            </>
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
              <div className="ml-auto max-w-[80%] rounded-xl bg-host-bg-tertiary px-4 py-2.5 text-sm">
                Can you take care of this?
              </div>
              <p className="text-sm">Here&apos;s what I found:</p>
              <div ref={widgetRef} className="w-full">
                <AppFrame name={appName} borderless={variant === "borderless"}>
                  {children}
                </AppFrame>
              </div>
              <div className="mt-auto pt-2">
                <Composer />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live DOM checks + static guidelines */}
      <div className="grid gap-2 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
        {liveChecks.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            {item.ok ? (
              <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Passes" />
            ) : (
              <AlertTriangle className="size-4 shrink-0 text-[#805c1f]" aria-label="Warning" />
            )}
            <span>{item.label}</span>
          </div>
        ))}
        {checks.map((c) => (
          <div key={c} className="flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Guideline" />
            <span>{c}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Composer({ floating }: { floating?: boolean }) {
  return (
    <div
      className={cn(
        floating && "absolute inset-x-0 bottom-0 p-3 sm:p-4",
      )}
      aria-hidden="true"
    >
      <div className="rounded-2xl border border-host-border-secondary bg-host-bg px-4 py-3 text-sm text-host-fg-tertiary shadow-sm">
        Reply…
      </div>
    </div>
  )
}

/**
 * The host's chrome around an inline app: app name and a view-source button.
 * Mirrors the "App container" in the MCP Apps for Claude kit. Your widget
 * renders inside it; you don't build this part yourself.
 */
export function AppFrame({
  name,
  icon,
  borderless,
  children,
}: {
  name: string
  icon?: React.ReactNode
  borderless?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden",
        !borderless && "rounded-host-lg border-[length:var(--border-width-regular,0.5px)] border-host-border-secondary bg-host-bg"
      )}
    >
      <div
        className={cn(
          "flex h-[52px] shrink-0 items-center justify-between",
          borderless ? "px-0" : "border-b-[length:var(--border-width-regular,0.5px)] border-host-border-tertiary px-3"
        )}
      >
        <span className="flex items-center gap-2 text-sm leading-[19.6px]">
          {icon ? (
            <span aria-hidden="true" className="flex size-5 items-center justify-center">
              {icon}
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-5 items-center justify-center rounded-host-xs border-[length:var(--border-width-regular,0.5px)] border-host-border bg-host-bg text-[11px] font-semibold"
            >
              {name.charAt(0).toUpperCase()}
            </span>
          )}
          {name}
        </span>
        <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-host-md text-host-fg">
          <CodeIcon className="size-5" />
        </span>
      </div>
      <div>{children}</div>
    </div>
  )
}

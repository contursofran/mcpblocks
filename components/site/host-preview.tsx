"use client"

import * as React from "react"
import { AlertTriangle, CheckCircle2, Maximize2, Monitor, Moon, Smartphone, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { CodeIcon, XIcon } from "@/registry/mcpblocks/ui/icons"

type Theme = "light" | "dark"
type Mode = "inline" | "fullscreen"
type Device = "web" | "mobile"

/** Approximate inline height cap used to flag widgets that would get clipped. */
const INLINE_HEIGHT_CAP = 520

/** Insets the simulated host reports, per device and mode. */
function insetsFor(device: Device, mode: Mode) {
  if (device === "mobile") {
    return mode === "fullscreen"
      ? { top: 56, right: 0, bottom: 96, left: 0 }
      : { top: 0, right: 16, bottom: 0, left: 16 }
  }
  return mode === "fullscreen"
    ? { top: 0, right: 0, bottom: 88, left: 0 }
    : { top: 0, right: 0, bottom: 0, left: 0 }
}

function Segmented<T extends string>({
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
 * Simulated MCP Apps host frame. It sets the same CSS variables the host
 * injects (theme tokens, safe-area insets) and mimics inline vs fullscreen
 * layout, so components render the way they would inside Claude.
 * It is a visual simulation, not a sandboxed iframe running the protocol.
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
  const [theme, setTheme] = React.useState<Theme>("light")
  const [mode, setMode] = React.useState<Mode>("inline")
  const [device, setDevice] = React.useState<Device>("web")
  const [height, setHeight] = React.useState(0)
  const widgetRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = widgetRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setHeight(Math.round(entry.contentRect.height)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode, device])

  const insets = insetsFor(device, mode)
  const hostVars = {
    "--mb-safe-top": `${insets.top}px`,
    "--mb-safe-right": `${insets.right}px`,
    "--mb-safe-bottom": `${insets.bottom}px`,
    "--mb-safe-left": `${insets.left}px`,
  } as React.CSSProperties

  const tooTall = mode === "inline" && height > INLINE_HEIGHT_CAP

  return (
    <div className="flex flex-col gap-3">
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

      {/* Checks */}
      <div className="grid gap-2 rounded-xl border bg-card p-4 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          {tooTall ? (
            <AlertTriangle className="size-4 shrink-0 text-[#805c1f]" aria-label="Warning" />
          ) : (
            <CheckCircle2 className="size-4 shrink-0 text-[#437426]" aria-label="Passes" />
          )}
          <span>
            {mode === "inline"
              ? `Inline height ${height}px ${tooTall ? `exceeds ~${INLINE_HEIGHT_CAP}px, may be clipped` : "fits"}`
              : "Fullscreen: content clears the composer"}
          </span>
        </div>
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

function Composer({ floating }: { floating?: boolean }) {
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
  borderless,
  children,
}: {
  name: string
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
          <span
            aria-hidden="true"
            className="flex size-5 items-center justify-center rounded-host-xs border-[length:var(--border-width-regular,0.5px)] border-host-border bg-host-bg text-[11px] font-semibold"
          >
            {name.charAt(0).toUpperCase()}
          </span>
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

/**
 * Small helpers for wiring inlinekit components to an MCP Apps host.
 *
 * The host sends a `hostContext` during `ui/initialize` and on change.
 * Pass it here to expose safe-area insets as CSS variables that
 * inlinekit components read (`--ik-safe-top` … `--ik-safe-left`).
 */

export type SafeAreaInsets = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

export type HostContextLike = {
  theme?: "light" | "dark"
  displayMode?: "inline" | "fullscreen" | "pip"
  safeAreaInsets?: SafeAreaInsets
}

/** Writes safe-area insets to CSS variables on `el` (defaults to <html>). */
export function applySafeAreaInsets(
  insets: SafeAreaInsets | undefined,
  el: HTMLElement = document.documentElement
) {
  const { top = 0, right = 0, bottom = 0, left = 0 } = insets ?? {}
  el.style.setProperty("--ik-safe-top", `${top}px`)
  el.style.setProperty("--ik-safe-right", `${right}px`)
  el.style.setProperty("--ik-safe-bottom", `${bottom}px`)
  el.style.setProperty("--ik-safe-left", `${left}px`)
}

/**
 * Applies the parts of hostContext inlinekit cares about.
 * Theme tokens themselves are injected by the host; this only
 * toggles the `.dark` class so fallback values match outside a host.
 */
export function applyHostContext(
  ctx: HostContextLike | undefined,
  el: HTMLElement = document.documentElement
) {
  if (!ctx) return
  if (ctx.theme) el.classList.toggle("dark", ctx.theme === "dark")
  if (ctx.displayMode) el.dataset.displayMode = ctx.displayMode
  applySafeAreaInsets(ctx.safeAreaInsets, el)
}

/** Logs a development-only warning when a guideline limit is exceeded. */
export function guideline(condition: boolean, message: string) {
  if (process.env.NODE_ENV !== "production" && condition) {
    console.warn(`[inlinekit] ${message}`)
  }
}

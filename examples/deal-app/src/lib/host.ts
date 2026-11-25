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
  el.style.setProperty("--mb-safe-top", `${top}px`)
  el.style.setProperty("--mb-safe-right", `${right}px`)
  el.style.setProperty("--mb-safe-bottom", `${bottom}px`)
  el.style.setProperty("--mb-safe-left", `${left}px`)
}

/**
 * Applies the host context fields used by mcpblocks.
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
    console.warn(`[mcpblocks] ${message}`)
  }
}

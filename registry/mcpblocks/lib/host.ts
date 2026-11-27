/**
 * Small helpers for wiring mcpblocks components to an MCP Apps host.
 *
 * The host sends a `hostContext` during `ui/initialize` and on change.
 * Pass it here to apply host styles and expose safe-area insets as CSS
 * variables that the components read (`--mb-safe-top` … `--mb-safe-left`).
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
  styles?: {
    variables?: Record<string, string | undefined>
    css?: { fonts?: string }
  }
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

const hostVariableName = /^--[\w-]+$/
const hostFontsId = "mcpblocks-host-fonts"

function applyHostFonts(fonts: string | undefined, doc: Document) {
  if (!fonts?.trim()) return

  const existing = doc.getElementById(hostFontsId)
  if (existing) {
    if (existing.textContent !== fonts) existing.textContent = fonts
    return
  }

  const style = doc.createElement("style")
  style.id = hostFontsId
  style.textContent = fonts
  doc.head.appendChild(style)
}

/** Applies the host's theme, display mode, safe areas, style variables, and fonts. */
export function applyHostContext(
  ctx: HostContextLike | undefined,
  el: HTMLElement = document.documentElement
) {
  if (!ctx) return
  if (ctx.theme) {
    el.classList.toggle("dark", ctx.theme === "dark")
    el.style.colorScheme = ctx.theme
  }
  if (ctx.displayMode) el.dataset.displayMode = ctx.displayMode
  applySafeAreaInsets(ctx.safeAreaInsets, el)

  let hasHostVariables = false
  for (const [name, value] of Object.entries(ctx.styles?.variables ?? {})) {
    if (!hostVariableName.test(name) || typeof value !== "string" || !value.trim()) continue
    el.style.setProperty(name, value)
    hasHostVariables = true
  }
  if (hasHostVariables) el.dataset.hostStyles = ""
  applyHostFonts(ctx.styles?.css?.fonts, el.ownerDocument)
}

// Bundlers (Vite, Next, webpack) replace `process.env.NODE_ENV` at build time. The
// declaration keeps this file compiling in projects without @types/node.
declare const process: { env: { NODE_ENV?: string } }

function isProduction() {
  try {
    return process.env.NODE_ENV === "production"
  } catch {
    // No bundler replacement and no `process` global: behave like development.
    return false
  }
}

/** Logs a development-only warning when a guideline limit is exceeded. */
export function guideline(condition: boolean, message: string) {
  if (condition && !isProduction()) {
    console.warn(`[mcpblocks] ${message}`)
  }
}

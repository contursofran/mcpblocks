import type {
  McpUiHostContext,
  McpUiStyles,
  McpUiStyleVariableKey,
} from "@modelcontextprotocol/ext-apps/app-bridge"

import { colorGroups, radii, typeScale } from "@/lib/tokens"

export type PreviewTheme = "light" | "dark"
export type PreviewMode = "inline" | "fullscreen"
export type PreviewDevice = "web" | "mobile"

/** Safe-area insets reported by the simulated host per device and display mode. */
export function insetsFor(device: PreviewDevice, mode: PreviewMode) {
  if (device === "mobile") {
    return mode === "fullscreen"
      ? { top: 56, right: 0, bottom: 96, left: 0 }
      : { top: 0, right: 16, bottom: 0, left: 16 }
  }
  return mode === "fullscreen"
    ? { top: 0, right: 0, bottom: 88, left: 0 }
    : { top: 0, right: 0, bottom: 0, left: 0 }
}

const typeVarMap: Record<string, { size: McpUiStyleVariableKey; lh: McpUiStyleVariableKey }> = {
  "text-host-xs": { size: "--font-text-xs-size", lh: "--font-text-xs-line-height" },
  "text-host-sm": { size: "--font-text-sm-size", lh: "--font-text-sm-line-height" },
  "text-host-md": { size: "--font-text-md-size", lh: "--font-text-md-line-height" },
  "text-host-lg": { size: "--font-text-lg-size", lh: "--font-text-lg-line-height" },
  "text-host-heading-xs": { size: "--font-heading-xs-size", lh: "--font-heading-xs-line-height" },
  "text-host-heading-sm": { size: "--font-heading-sm-size", lh: "--font-heading-sm-line-height" },
  "text-host-heading-md": { size: "--font-heading-md-size", lh: "--font-heading-md-line-height" },
  "text-host-heading-lg": { size: "--font-heading-lg-size", lh: "--font-heading-lg-line-height" },
  "text-host-heading-xl": { size: "--font-heading-xl-size", lh: "--font-heading-xl-line-height" },
  "text-host-heading-2xl": { size: "--font-heading-2xl-size", lh: "--font-heading-2xl-line-height" },
  "text-host-heading-3xl": { size: "--font-heading-3xl-size", lh: "--font-heading-3xl-line-height" },
}

const radiusVarMap: Record<string, McpUiStyleVariableKey> = {
  xs: "--border-radius-xs",
  sm: "--border-radius-sm",
  md: "--border-radius-md",
  lg: "--border-radius-lg",
  xl: "--border-radius-xl",
  full: "--border-radius-full",
}

/**
 * Builds the Claude-aligned MCP Apps host CSS style variables for light or dark mode.
 */
export function buildHostStyleVariables(theme: PreviewTheme): McpUiStyles {
  const variables: Partial<Record<McpUiStyleVariableKey, string>> = {
    "--font-sans": '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    "--font-mono": '"JetBrains Mono", ui-monospace, monospace',
    "--font-weight-normal": "400",
    "--font-weight-medium": "500",
    "--font-weight-semibold": "600",
    "--font-weight-bold": "700",
    "--border-width-regular": "0.5px",
  }

  for (const group of colorGroups) {
    for (const token of group.tokens) {
      variables[token.cssVar as McpUiStyleVariableKey] = token[theme]
    }
  }

  for (const t of typeScale) {
    const keys = typeVarMap[t.utility]
    if (keys) {
      variables[keys.size] = t.size
      variables[keys.lh] = t.lineHeight
    }
  }

  for (const r of radii) {
    const key = radiusVarMap[r.name]
    if (key) variables[key] = r.value
  }

  return variables as McpUiStyles
}

/**
 * Builds a complete `McpUiHostContext` matching Claude's host tokens and layout rules.
 */
export function buildHostContext({
  theme,
  mode,
  device,
}: {
  theme: PreviewTheme
  mode: PreviewMode
  device: PreviewDevice
}): McpUiHostContext {
  const width = device === "mobile" ? 351 : 712
  return {
    theme,
    displayMode: mode,
    availableDisplayModes: ["inline", "fullscreen"],
    platform: device === "mobile" ? "mobile" : "web",
    deviceCapabilities: {
      touch: device === "mobile",
      hover: device === "web",
    },
    safeAreaInsets: insetsFor(device, mode),
    containerDimensions:
      mode === "fullscreen"
        ? { width, height: device === "mobile" ? 600 : 520 }
        : { width, maxHeight: 520 },
    locale: "en-US",
    styles: {
      variables: buildHostStyleVariables(theme),
    },
  }
}

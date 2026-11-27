export const SITE_URL = "https://mcpblocks.dev"
export const SITE_NAME = "MCP Blocks UI"
export const SITE_TAGLINE = "UI components for Claude MCP Apps"
export const SITE_DESCRIPTION =
  "React components for Claude MCP Apps and interactive connectors, built on Claude's host tokens, display modes and mobile safe areas. Works in ChatGPT too."

export const docsPages = [
  { href: "/docs/installation", title: "Installation" },
  { href: "/docs/mcp-server", title: "Using with an MCP server" },
  { href: "/docs/prepared-writes", title: "Prepared writes" },
  { href: "/docs/protocol-hooks", title: "Protocol hooks" },
  { href: "/docs/ui-parts", title: "Composable UI parts" },
  { href: "/docs/brand-your-blocks", title: "Brand your blocks" },
] as const

/** Pages that set their own `openGraph` replace the parent's, so repeat the image. */
export const OG_IMAGE = "/opengraph-image"

import type { Metadata } from "next"

import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "MCP Blocks UI | UI components for Claude MCP Apps",
    template: "%s · MCP Blocks UI",
  },
  description:
    "React components for Claude MCP Apps and interactive connectors, built on Claude's host tokens, display modes and mobile safe areas. Works in ChatGPT too.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  )
}

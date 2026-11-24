import type { Metadata } from "next"

import { SiteFooter, SiteHeader } from "@/components/site/chrome"
import "./globals.css"

export const metadata: Metadata = {
  title: "inlinekit: widgets that feel native inside Claude",
  description:
    "Copy-paste React components for MCP Apps, built on Claude's host tokens and display-mode rules. Free and open source.",
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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif&family=JetBrains+Mono:wght@400;500&display=swap"
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

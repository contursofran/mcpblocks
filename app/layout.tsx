import type { Metadata } from "next"

import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Claude MCP Apps",
    "MCP Apps UI",
    "MCP Apps components",
    "Claude widgets",
    "shadcn MCP registry",
    "Model Context Protocol UI",
    "ext-apps React components",
    "MCP server UI",
    "Vercel AI SDK MCP Apps",
    "mcpblocks",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    types: {
      "text/plain": `${SITE_URL}/llms.txt`,
      "text/markdown": `${SITE_URL}/agents.md`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME}: ${SITE_TAGLINE}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full bg-[#f5f3eb]">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM documentation index" />
        <link rel="alternate" type="text/markdown" href="/agents.md" title="Agent integration guide" />
      </head>
      <body className="relative min-h-full bg-[#f5f3eb] text-[#141413] antialiased">
        {children}
      </body>
    </html>
  )
}

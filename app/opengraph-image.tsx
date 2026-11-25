import { ImageResponse } from "next/og"

import { SITE_NAME, SITE_TAGLINE } from "@/lib/site"

export const dynamic = "force-static"
export const alt = `${SITE_NAME}: ${SITE_TAGLINE}`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 96,
          background: "#FAF9F5",
          color: "#141413",
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <rect x="9" y="4" width="19" height="7" rx="2.2" fill="#D97757" />
          <rect x="4" y="12.5" width="24" height="7" rx="2.2" fill="#141413" />
          <rect x="4" y="21" width="16" height="7" rx="2.2" fill="#141413" />
        </svg>
        <div style={{ display: "flex", fontSize: 84, fontWeight: 700, marginTop: 40, letterSpacing: -2 }}>{SITE_NAME}</div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 16, color: "#3d3d3a" }}>{SITE_TAGLINE}</div>
        <div style={{ display: "flex", fontSize: 30, marginTop: 48, color: "#B5543A" }}>mcpblocks.dev</div>
      </div>
    ),
    size
  )
}

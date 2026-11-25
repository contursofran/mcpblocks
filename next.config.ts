import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages: `pnpm build` writes the site to out/
  output: "export",
  images: { unoptimized: true },
  // Pin the project root: a lockfile in a parent folder would otherwise be picked as the root
  turbopack: { root: __dirname },
  outputFileTracingRoot: __dirname,
}

export default nextConfig

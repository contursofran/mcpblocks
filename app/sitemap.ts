import type { MetadataRoute } from "next"

import { components } from "@/lib/docs"
import { docsPages, SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...docsPages.map((p) => p.href),
    ...components.map((c) => `/components/${c.slug}`),
    "/tokens",
  ]
  return paths.map((path) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly" }))
}

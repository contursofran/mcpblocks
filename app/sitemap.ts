import type { MetadataRoute } from "next"

import { components } from "@/lib/docs"
import { docsPages, SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    ...docsPages.map((p) => ({
      url: `${SITE_URL}${p.href}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...components.map((c) => ({
      url: `${SITE_URL}/components/${c.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/tokens`, lastModified, changeFrequency: "monthly", priority: 0.8 },
  ]
}

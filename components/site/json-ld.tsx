/**
 * Renders server-side JSON-LD structured data in static HTML so Google,
 * ChatGPT, Claude, and Perplexity crawlers can parse it without executing JS.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Escape `<` to prevent script-tag breakout in HTML.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replaceAll("<", "\\u003c"),
      }}
    />
  )
}

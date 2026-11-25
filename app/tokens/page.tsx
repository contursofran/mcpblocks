import type { Metadata } from "next"

import { CodeBlock } from "@/components/site/code-block"
import { colorGroups, radii, typeScale } from "@/lib/tokens"

export const metadata: Metadata = {
  title: "Design tokens for Claude MCP Apps",
  description:
    "The colors, type scale and radii from Anthropic's MCP Apps for Claude kit, in light and dark, as CSS variables and Tailwind utilities.",
  alternates: { canonical: "/tokens" },
  openGraph: { images: ["/opengraph-image"] },
}

function Swatch({ value, dark }: { value: string; dark?: boolean }) {
  return (
    <span
      className="relative inline-flex size-9 shrink-0 overflow-hidden rounded-md border"
      style={{ backgroundColor: dark ? "#262624" : "#ffffff" }}
    >
      <span className="absolute inset-0" style={{ backgroundColor: value }} />
    </span>
  )
}

export default function TokensPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12">
      <header className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Tokens</h1>
        <p className="text-lg text-foreground/80">
          Every color, type size and radius from the MCP Apps for Claude kit, in light and dark. Inside Claude the host
          injects these variables; outside it, these are the fallbacks your components use.
        </p>
        <CodeBlock prompt code="npx shadcn@latest add https://mcpblocks.dev/r/host-tokens.json" />
      </header>

      {colorGroups.map((g) => (
        <section key={g.group} className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold">{g.group}</h2>
          <div className="overflow-x-auto rounded-xl border bg-card">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Token</th>
                  <th className="px-4 py-3 font-medium">Light</th>
                  <th className="px-4 py-3 font-medium">Dark</th>
                  <th className="px-4 py-3 font-medium">Tailwind</th>
                </tr>
              </thead>
              <tbody>
                {g.tokens.map((t) => (
                  <tr key={t.cssVar} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium capitalize">{t.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">{t.cssVar}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <Swatch value={t.light} />
                        <code className="font-mono text-xs">{t.light}</code>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <Swatch value={t.dark} dark />
                        <code className="font-mono text-xs">{t.dark}</code>
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{t.utility}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Type scale</h2>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[560px] text-left text-sm">
            <tbody>
              {typeScale.map((t) => (
                <tr key={t.utility} className="border-b last:border-0">
                  <td className="px-4 py-3" style={{ fontSize: t.size, lineHeight: t.lineHeight, fontWeight: t.name.startsWith("Heading") ? 600 : 400 }}>
                    {t.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {t.size} / {t.lineHeight}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{t.utility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Radius</h2>
        <div className="flex flex-wrap gap-4">
          {radii.map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-2 text-xs">
              <span className="size-16 border-2 border-foreground/70 bg-card" style={{ borderRadius: r.value }} />
              <span className="font-mono">{r.utility}</span>
              <span className="text-muted-foreground">{r.value}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}

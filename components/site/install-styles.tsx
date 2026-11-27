"use client"

import { useId, useRef, useState, type KeyboardEvent } from "react"

import { CodeBlock } from "@/components/site/code-block"
import { Code } from "@/components/site/docs-shell"
import { cn } from "@/lib/utils"

const options = ["Tailwind v4", "Tailwind v3", "No Tailwind"] as const
const registry = "https://mcpblocks.dev/r"

export function InstallStyles() {
  const [active, setActive] = useState(0)
  const id = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>) {
    const last = options.length - 1
    const moves: Record<string, number> = {
      ArrowLeft: active === 0 ? last : active - 1,
      ArrowRight: active === last ? 0 : active + 1,
      Home: 0,
      End: last,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Stylesheet setup">
        {options.map((label, index) => (
          <button
            ref={(element) => { tabRefs.current[index] = element }}
            key={label}
            id={`${id}-tab-${index}`}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-controls={`${id}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            onKeyDown={onTabKey}
            onClick={() => setActive(index)}
            className={cn(
              "min-h-11 rounded-full px-3 text-sm font-medium",
              active === index ? "bg-[#141413] text-white" : "bg-[#141413]/[0.06] text-[#141413]",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div id={`${id}-panel-0`} role="tabpanel" aria-labelledby={`${id}-tab-0`} hidden={active !== 0} tabIndex={0}>
        <p>The component install adds the host fallbacks and <Code>@theme inline</Code> mappings to your Tailwind stylesheet.</p>
      </div>
      <div id={`${id}-panel-1`} role="tabpanel" aria-labelledby={`${id}-tab-1`} hidden={active !== 1} tabIndex={0}>
        <div className="space-y-3">
          <p>Use Tailwind 3.4. The preset includes the container query plugin and maps the <Code>host-*</Code> utilities.</p>
          <CodeBlock code={`npx shadcn@latest add ${registry}/tailwind-v3.json ${registry}/inline-card.json`} />
          <p>Add the preset to your Tailwind config and include your component files in <Code>content</Code>.</p>
          <CodeBlock code={`// tailwind.config.cjs
module.exports = {
  presets: [require("./tailwind.mcpblocks.cjs")],
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
}`} />
          <p>Import the host fallbacks from the project root. This example assumes your view entry is in <Code>src/</Code>.</p>
          <CodeBlock code={'import "../mcpblocks-tokens.css"'} />
        </div>
      </div>
      <div id={`${id}-panel-2`} role="tabpanel" aria-labelledby={`${id}-tab-2`} hidden={active !== 2} tabIndex={0}>
        <div className="space-y-3">
          <p>Import the compiled stylesheet in your view. It contains the block utilities, host fallbacks, and the Tailwind base reset.</p>
          <CodeBlock code={`npx shadcn@latest add ${registry}/blocks-css.json ${registry}/inline-card.json`} />
          <CodeBlock code={'import "../mcpblocks.css"'} />
          <p>
            For your own CSS, install <Code>host-tokens-css</Code> instead. The stylesheet exposes aliases such as
            {" "}<Code>var(--color-host-app-surface)</Code>. Set custom <Code>--mb-*</Code> values in the same scope
            as the aliases. Add <Code>data-mcpblocks-theme</Code> to a nested theme scope.
          </p>
        </div>
      </div>
    </div>
  )
}

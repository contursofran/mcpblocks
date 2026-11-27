import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import { fileURLToPath } from "node:url"

import postcss from "postcss"
import tailwind from "tailwindcss-v3"

import preset from "../registry/styles/tailwind-v3.cjs"

function readStyle(filename) {
  return readFileSync(new URL(`../registry/styles/${filename}`, import.meta.url), "utf8")
}

function selectors(root) {
  const classes = new Set()
  root.walkRules(({ selector }) => {
    // v3 uses a hex escape for commas, v4 escapes the comma directly.
    for (const match of selector.replaceAll(/\\2c\s?/gi, "\\,").matchAll(/\.((?:\\[^\n]|[\w-])+)/g)) {
      classes.add(match[1])
    }
  })
  return classes
}

test("Tailwind 3.4 compiles the same shipped component utility classes as the standalone CSS", async () => {
  const source = fileURLToPath(new URL("../registry/mcpblocks/", import.meta.url))
  const content = ["components", "ui", "examples"].map((folder) => `${source}${folder}/**/*.tsx`)
  const v3 = await postcss([tailwind({ content, presets: [preset] })])
    .process("@tailwind base;\n@tailwind components;\n@tailwind utilities;", { from: undefined })
  const shipped = selectors(postcss.parse(readStyle("blocks.css")))
  const compiled = selectors(v3.root)
  // This is a theme selector rather than a Tailwind utility.
  shipped.delete("dark")
  assert.deepEqual([...shipped].filter((name) => !compiled.has(name)), [])
  assert.ok(compiled.size > 200)
  assert.match(v3.css, /@container sheet \(min-width: 36rem\)/)
  assert.match(v3.css, /font-family: var\(--mb-font-display, var\(--font-sans\)\)/)
  assert.match(v3.css, /color-mix\(in oklab, var\(--mb-danger-border, var\(--color-border-danger\)\) calc\(0\.15 \* 100%\), transparent\)/)
})

test("plain CSS exposes semantic fallbacks and app variables for both themes", () => {
  const css = readStyle("host-tokens.css")
  assert.match(css, /\[data-host-theme="dark"\]/)
  assert.match(css, /--color-host-app-surface: var\(--mb-surface, var\(--color-background-primary\)\);/)
  assert.match(css, /--font-host-app-display: var\(--mb-font-display, var\(--font-sans\)\);/)
  assert.match(css, /--text-host-heading-md--line-height: var\(--font-heading-md-line-height\);/)
  assert.doesNotMatch(css, /@(theme|tailwind|source)\b/)
})

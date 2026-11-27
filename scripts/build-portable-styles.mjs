import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import tailwind from "@tailwindcss/postcss"
import postcss from "postcss"

const root = new URL("../", import.meta.url)
const manifest = JSON.parse(readFileSync(new URL("registry.json", root), "utf8"))
const host = manifest.items.find(({ name }) => name === "host-tokens")
const theme = host.cssVars.theme
const generated = "Generated from the host-tokens registry item by scripts/build-portable-styles.mjs."
const out = new URL("registry/styles/", root)
const check = process.argv.includes("--check")

function save(name, content) {
  const path = new URL(name, out)
  if (!check) {
    writeFileSync(path, content)
  } else if (readFileSync(path, "utf8") !== content) {
    throw new Error(`${name} is out of date. Run pnpm registry:build.`)
  }
}

function declarations(values) {
  return Object.entries(values).map(([name, value]) => `  ${name}: ${value};`).join("\n")
}

const aliases = Object.fromEntries(Object.entries(theme).map(([name, value]) => [`--${name}`, value]))
const tokens = `/* ${generated} */
:root {
${declarations(host.css[":root"])}
}
.dark, [data-host-theme="dark"] {
${declarations(host.css[".dark"])}
}
:root, .dark, [data-host-theme="dark"], [data-mcpblocks-theme] {
${declarations(aliases)}
}
`
save("host-tokens.css", tokens)

const colors = {}
const borderRadius = {}
const fontSize = {}
const fontFamily = {}
for (const [name, value] of Object.entries(theme)) {
  if (name.startsWith("color-")) colors[name.slice(6)] = value
  if (name.startsWith("radius-")) borderRadius[name.slice(7)] = value
  if (name.startsWith("font-")) fontFamily[name.slice(5)] = [value]
  if (name.startsWith("text-") && !name.endsWith("--line-height")) {
    const lineHeight = theme[`${name}--line-height`]
    fontSize[name.slice(5)] = lineHeight ? [value, { lineHeight }] : value
  }
}

const preset = `// ${generated}
const containerQueries = require("@tailwindcss/container-queries")

const colorVariables = ${JSON.stringify(colors, null, 2)}

module.exports = {
  darkMode: "class",
  plugins: [containerQueries],
  theme: {
    extend: {
      colors: Object.fromEntries(Object.entries(colorVariables).map(([name, value]) => [
        name,
        ({ opacityValue } = {}) => opacityValue == null
          ? value
          : \`color-mix(in oklab, \${value} calc(\${opacityValue} * 100%), transparent)\`,
      ])),
      borderRadius: ${JSON.stringify(borderRadius, null, 6).replaceAll("\n}", "\n      }")},
      fontSize: ${JSON.stringify(fontSize, null, 6).replaceAll("\n}", "\n      }")},
      fontFamily: ${JSON.stringify(fontFamily, null, 6).replaceAll("\n}", "\n      }")},
    },
  },
}
`
save("tailwind-v3.cjs", preset)

const v4Input = `@import "tailwindcss" source(none);
@source "../mcpblocks/components";
@source "../mcpblocks/ui";
@source "../mcpblocks/examples";
@theme inline {
${declarations(aliases)}
}
${tokens}`
const result = await postcss([tailwind({ base: fileURLToPath(root), optimize: { minify: false } })])
  .process(v4Input, { from: fileURLToPath(new URL("blocks.css", out)) })
save("blocks.css", `/* ${generated} */\n${result.css}`)

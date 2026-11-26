#!/usr/bin/env node
/**
 * Conformance and registry integrity check for mcpblocks.
 *
 * Verifies:
 * 1. Claude MCP Apps design guideline constraints in `registry/mcpblocks/`
 * 2. `registry.json` manifest validity and file existence
 * 3. `public/r/*.json` freshness against source files
 * 4. `app/globals.css` <-> `registry.json` `host-tokens` parity
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const registryDir = join(root, "registry", "mcpblocks")
const errors = []

function fail(scope, message) {
  errors.push(`[${scope}] ${message}`)
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

// ---------------------------------------------------------------------------
// 1. Source conformance checks on registry/mcpblocks/
// ---------------------------------------------------------------------------
const sourceFiles = walk(registryDir).filter((f) => /\.(tsx?|css)$/.test(f))

const sourceRules = [
  {
    name: "vertical scroll container",
    pattern: /\boverflow(-y)?-(auto|scroll)\b|overflow(-y)?:\s*(auto|scroll)/,
  },
  {
    name: "viewport height unit",
    pattern: /\b(min-|max-)?h-(screen|svh|lvh|dvh)\b|\b\d+(\.\d+)?(vh|svh|lvh|dvh)\b/,
  },
  {
    name: "floating Radix primitive",
    pattern:
      /@radix-ui\/react-(popover|dropdown-menu|select|tooltip|dialog|alert-dialog|hover-card|context-menu|navigation-menu|menubar|toast)\b|from\s+["']radix-ui["']/,
  },
  {
    name: "hardcoded literal color",
    pattern: /#[0-9a-fA-F]{3,8}\b(?![-\w])|\brgba?\(|\bhsla?\(/,
    // LineChart's PALETTE array is an intentional categorical series palette.
    ignoreLine: (rel, line) =>
      rel === "registry/mcpblocks/components/line-chart.tsx" &&
      line.includes("const PALETTE ="),
  },
  {
    name: "sandbox-blocked storage / ChatGPT bridge",
    pattern: /\b(localStorage|sessionStorage)\b|document\.cookie|window\.openai/,
  },
  {
    name: "unguarded console call",
    pattern: /\bconsole\.\w+/,
    allowFiles: new Set(["registry/mcpblocks/lib/host.ts"]),
  },
]

for (const file of sourceFiles) {
  const rel = relative(root, file).replaceAll("\\", "/")
  const text = readFileSync(file, "utf8")
  const lines = text.split("\n")

  for (const rule of sourceRules) {
    if (rule.allowFiles?.has(rel)) continue
    lines.forEach((line, idx) => {
      if (rule.ignoreLine?.(rel, line)) return
      if (rule.pattern.test(line)) {
        fail("conformance", `${rel}:${idx + 1} violates "${rule.name}": ${line.trim()}`)
      }
    })
  }
}

// Ensure dev-only console warning in host.ts stays gated behind NODE_ENV.
const hostSource = readFileSync(join(registryDir, "lib/host.ts"), "utf8")
if (!hostSource.includes('process.env.NODE_ENV === "production"')) {
  fail("conformance", "registry/mcpblocks/lib/host.ts: console.warn must stay guarded by NODE_ENV")
}

// Ensure icons use currentColor only (no hardcoded fill/stroke hexes).
const iconsSource = readFileSync(join(registryDir, "ui/icons.tsx"), "utf8")
if (/(?:fill|stroke)="(?!none"|currentColor")/.test(iconsSource)) {
  fail("conformance", "registry/mcpblocks/ui/icons.tsx: icons must use currentColor or none")
}

// ---------------------------------------------------------------------------
// 2. Registry manifest & public/r/*.json freshness
// ---------------------------------------------------------------------------
const registryPath = join(root, "registry.json")
const registry = JSON.parse(readFileSync(registryPath, "utf8"))

if (!Array.isArray(registry.items) || registry.items.length === 0) {
  fail("registry", "registry.json has no items")
}

const itemNames = new Set(registry.items.map((item) => item.name))
const baseUrl = registry.homepage.replace(/\/$/, "")

for (const item of registry.items) {
  if (!item.name || !item.type || !item.title || !item.description) {
    fail("registry", `Item "${item.name ?? "<unnamed>"}" is missing required metadata`)
  }

  for (const dep of item.registryDependencies ?? []) {
    const prefix = `${baseUrl}/r/`
    if (dep.startsWith(prefix) && dep.endsWith(".json")) {
      const target = dep.slice(prefix.length, -".json".length)
      if (!itemNames.has(target)) {
        fail("registry", `Item "${item.name}" references unknown registryDependency "${dep}"`)
      }
    }
  }

  for (const file of item.files ?? []) {
    if (!file.path.startsWith("registry/")) {
      fail("registry", `Item "${item.name}" has non-registry path "${file.path}"`)
      continue
    }
    const diskPath = join(root, file.path)
    if (!existsSync(diskPath)) {
      fail("registry", `Item "${item.name}" references missing file "${file.path}"`)
    }
  }

  // Verify built public/r/<name>.json exists and matches source on disk.
  const builtPath = join(root, "public", "r", `${item.name}.json`)
  if (!existsSync(builtPath)) {
    fail("registry", `Missing built registry output public/r/${item.name}.json (run pnpm registry:build)`)
    continue
  }

  const built = JSON.parse(readFileSync(builtPath, "utf8"))
  for (const file of item.files ?? []) {
    const diskContent = readFileSync(join(root, file.path), "utf8")
    const builtFile = (built.files ?? []).find((f) => f.path === file.path)
    if (!builtFile) {
      fail("registry", `public/r/${item.name}.json is missing file "${file.path}" (run pnpm registry:build)`)
    } else if (builtFile.content !== diskContent) {
      fail("registry", `public/r/${item.name}.json is stale for "${file.path}" (run pnpm registry:build)`)
    }
  }
}

// ---------------------------------------------------------------------------
// 3. app/globals.css <-> registry.json host-tokens parity
// ---------------------------------------------------------------------------
const hostTokens = registry.items.find((i) => i.name === "host-tokens")
if (!hostTokens?.css) {
  fail("tokens", "registry.json is missing the host-tokens item")
} else {
  const globalsCss = readFileSync(join(root, "app", "globals.css"), "utf8")

  // Extract CSS declarations from the host-tokens section of app/globals.css.
  const hostSectionIdx = globalsCss.indexOf("mcpblocks host tokens")
  if (hostSectionIdx === -1) {
    fail("tokens", "Could not locate 'mcpblocks host tokens' section in app/globals.css")
  } else {
    const hostCss = globalsCss.slice(hostSectionIdx)
    const blockRegex = /(@theme inline|:root|\.dark,\s*\[data-host-theme="dark"\])\s*\{([^}]*)\}/g
    const cssBlocks = new Map()
    for (const match of hostCss.matchAll(blockRegex)) {
      const key = match[1].startsWith(".dark") ? ".dark" : match[1]
      const vars = {}
      for (const line of match[2].split("\n")) {
        const decl = line.match(/^\s*(--[\w-]+)\s*:\s*(.+?)\s*;\s*$/)
        if (decl) vars[decl[1]] = decl[2]
      }
      cssBlocks.set(key, vars)
    }

    for (const blockName of ["@theme inline", ":root", ".dark"]) {
      const expected = hostTokens.css[blockName] ?? {}
      const actual = cssBlocks.get(blockName) ?? {}
      for (const [varName, value] of Object.entries(expected)) {
        if (actual[varName] !== value) {
          fail(
            "tokens",
            `Mismatch in app/globals.css ${blockName} for ${varName}: expected "${value}", got "${actual[varName] ?? "<missing>"}"`,
          )
        }
      }
      for (const varName of Object.keys(actual)) {
        if (!(varName in expected)) {
          fail(
            "tokens",
            `Extra token in app/globals.css ${blockName} not present in registry.json: ${varName}`,
          )
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 4. LLM / agent discovery docs presence
// ---------------------------------------------------------------------------
for (const rel of ["public/llms.txt", "public/llms-full.txt", "public/agents.md"]) {
  if (!existsSync(join(root, rel))) {
    fail("llms", `Missing ${rel} (run pnpm llms:build)`)
  }
}

if (errors.length > 0) {
  console.error(`Conformance check failed with ${errors.length} issue(s):\n`)
  for (const err of errors) console.error(`  - ${err}`)
  process.exit(1)
}

console.log(
  `Conformance check passed (${sourceFiles.length} registry files, ${registry.items.length} manifest items, host-tokens in sync).`,
)

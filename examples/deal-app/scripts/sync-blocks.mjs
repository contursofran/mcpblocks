// Copies the blocks into src/ the way `npx shadcn add` would in your own app:
//   registry/mcpblocks/**  ->  src/registry/mcpblocks/**   (imported as "@/registry/mcpblocks/...")
//   lib/utils.ts           ->  src/lib/utils.ts
//   host tokens CSS        ->  src/host-tokens.css
// Once mcpblocks.dev is live, replace this with `npx shadcn@latest add <url>`.
import fs from "node:fs"
import path from "node:path"

const here = import.meta.dirname
const root = path.resolve(here, "../../..")
const src = path.resolve(here, "../src")

fs.rmSync(path.join(src, "registry"), { recursive: true, force: true })
fs.cpSync(path.join(root, "registry/mcpblocks"), path.join(src, "registry/mcpblocks"), { recursive: true })
fs.mkdirSync(path.join(src, "lib"), { recursive: true })
fs.copyFileSync(path.join(root, "lib/utils.ts"), path.join(src, "lib/utils.ts"))

// Token layer = everything in globals.css from the "mcpblocks host tokens" banner
// up to the site's own @layer base.
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8")
const start = css.indexOf("   mcpblocks host tokens")
const end = css.indexOf("@layer base")
if (start < 0 || end < 0) throw new Error("globals.css layout changed; update sync-blocks.mjs")
const tokens = "/*" + css.slice(css.lastIndexOf("/* ---", start) + 2, end)
fs.writeFileSync(path.join(src, "host-tokens.css"), tokens)
console.log("synced blocks into src/")

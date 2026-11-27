import { readFile } from "node:fs/promises"
import { gzipSync } from "node:zlib"

const html = await readFile(new URL("../dist/view.html", import.meta.url))
const packed = gzipSync(html)
const budget = Number(process.env.MCP_VIEW_GZIP_BUDGET ?? 225 * 1024)

if (!Number.isSafeInteger(budget) || budget <= 0) {
  throw new Error("MCP_VIEW_GZIP_BUDGET must be a positive byte count.")
}
console.log(`MCP view: ${html.length} bytes, ${packed.length} gzip bytes`)
if (packed.length > budget) {
  console.warn(`MCP view exceeds the gzip budget of ${budget} bytes.`)
}

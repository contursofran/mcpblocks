import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import ts from "typescript"

// Transpile the distributable helper so the tests also run on Node 20.
const source = readFileSync(new URL("../registry/mcpblocks/lib/host.ts", import.meta.url), "utf8")
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
})
const { applyHostContext, tellModel } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`)

function createRoot() {
  const properties = new Map()
  const classes = new Set()
  const styles = []
  const el = {
    dataset: {},
    style: { setProperty: (name, value) => properties.set(name, value) },
    classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name) },
    ownerDocument: {
      getElementById: (id) => styles.find((style) => style.id === id),
      createElement: (tagName) => ({ tagName }),
      head: { appendChild: (style) => styles.push(style) },
    },
  }
  return { el, properties, classes, styles }
}

test("applies host variables alongside the theme, display mode and safe areas", () => {
  const { el, properties, classes } = createRoot()

  applyHostContext({
    theme: "dark",
    displayMode: "fullscreen",
    safeAreaInsets: { top: 8, bottom: 24 },
    styles: { variables: { "--color-background-primary": "#262624", "--font-sans": "Host Sans" } },
  }, el)

  assert.equal(properties.get("--color-background-primary"), "#262624")
  assert.equal(properties.get("--font-sans"), "Host Sans")
  assert.equal(el.dataset.hostStyles, "")
  assert.equal(el.dataset.displayMode, "fullscreen")
  assert.equal(properties.get("--mb-safe-top"), "8px")
  assert.equal(properties.get("--mb-safe-right"), "0px")
  assert.equal(properties.get("--mb-safe-bottom"), "24px")
  assert.equal(properties.get("--mb-safe-left"), "0px")
  assert.ok(classes.has("dark"))
  assert.equal(el.style.colorScheme, "dark")

  applyHostContext({ theme: "light", styles: { variables: { "--color-background-primary": "#faf9f5" } } }, el)

  assert.equal(properties.get("--color-background-primary"), "#faf9f5")
  assert.ok(!classes.has("dark"))
  assert.equal(el.style.colorScheme, "light")
})

test("ignores malformed variable names and empty or nonstring values", () => {
  const { el, properties } = createRoot()

  applyHostContext({
    styles: {
      variables: {
        color: "red",
        "--": "red",
        "--bad name": "red",
        "--bad:name": "red",
        "--empty": "",
        "--blank": "  ",
        "--numeric": 42,
        "--missing": undefined,
      },
    },
  }, el)

  assert.deepEqual([...properties.keys()], ["--mb-safe-top", "--mb-safe-right", "--mb-safe-bottom", "--mb-safe-left"])
  assert.equal(el.dataset.hostStyles, undefined)
})

test("uses one style element for host fonts and updates its CSS", () => {
  const { el, styles } = createRoot()
  const first = '@font-face { font-family: "Host Sans"; src: local("Arial"); }'
  const second = '@font-face { font-family: "Host Sans"; src: local("Helvetica"); }'

  applyHostContext({ styles: { css: { fonts: first } } }, el)
  applyHostContext({ styles: { css: { fonts: first } } }, el)

  assert.deepEqual(styles, [{ id: "mcpblocks-host-fonts", tagName: "style", textContent: first }])
  const fontStyle = styles[0]

  applyHostContext({ styles: { css: { fonts: second } } }, el)

  assert.equal(styles.length, 1)
  assert.equal(styles[0], fontStyle)
  assert.equal(fontStyle.textContent, second)
})

test("leaves host styles alone when the context omits styles", () => {
  const { el, properties, styles } = createRoot()
  const fonts = '@font-face { font-family: "Host Sans"; src: local("Arial"); }'

  applyHostContext({ displayMode: "inline" }, el)
  assert.equal(el.dataset.hostStyles, undefined)
  assert.equal(styles.length, 0)

  applyHostContext({ styles: { variables: { "--font-sans": "Host Sans" }, css: { fonts } } }, el)
  applyHostContext({ displayMode: "fullscreen" }, el)

  assert.equal(properties.get("--font-sans"), "Host Sans")
  assert.equal(styles[0].textContent, fonts)
  assert.equal(el.dataset.hostStyles, "")
})

function modelContextApp(capabilities, { rejectContext = false, rejectMessage = false } = {}) {
  const calls = []
  const app = {
    getHostCapabilities: () => capabilities,
    updateModelContext: async (params) => {
      calls.push(["context", params])
      if (rejectContext) throw new Error("Host disconnected")
      return {}
    },
    sendMessage: async (params) => {
      calls.push(["message", params])
      return { isError: rejectMessage }
    },
  }
  return { app, calls }
}

test("prefers host model context, trims text and caps the summary at 500 characters", async () => {
  const { app, calls } = modelContextApp({ updateModelContext: { text: {} } })

  assert.equal(await tellModel(app, `  ${"🌱".repeat(510)}  `, { fallbackToMessage: true }), true)
  assert.deepEqual(calls, [["context", { content: [{ type: "text", text: `${"🌱".repeat(499)}…` }] }]])
})

test("sends chat text only with opt-in when context updates are unavailable", async () => {
  const { app, calls } = modelContextApp({ updateModelContext: { image: {} }, message: { text: {} } })

  assert.equal(await tellModel(app, "  ", { fallbackToMessage: true }), false)
  assert.equal(await tellModel(app, "Stage updated"), false)
  assert.deepEqual(calls, [])
  assert.equal(await tellModel(app, " Stage updated ", { fallbackToMessage: true }), true)
  assert.deepEqual(calls, [["message", { role: "user", content: [{ type: "text", text: "Stage updated" }] }]])
})

test("a failed model-context update does not turn into a chat message", async () => {
  const { app, calls } = modelContextApp({ updateModelContext: { text: {} } }, { rejectContext: true })

  assert.equal(await tellModel(app, "Stage updated", { fallbackToMessage: true }), false)
  assert.deepEqual(calls.map(([kind]) => kind), ["context"])
})

test("reports a rejected chat fallback as undelivered", async () => {
  const { app } = modelContextApp(undefined, { rejectMessage: true })

  assert.equal(await tellModel(app, "Stage updated", { fallbackToMessage: true }), false)
})

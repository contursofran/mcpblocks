import { dirname } from "path"
import { fileURLToPath } from "url"
import { createRequire } from "node:module"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: dirname(createRequire(import.meta.url).resolve("eslint-config-next/package.json")),
})

const floatingRadix = [
  "popover",
  "dropdown-menu",
  "select",
  "tooltip",
  "dialog",
  "alert-dialog",
  "hover-card",
  "context-menu",
  "navigation-menu",
  "menubar",
  "toast",
]

const floatingMessage =
  "MCP Apps cannot use floating layers; they clip inside the host frame and fight its z-index. Use visible inline controls instead."

const eslintConfig = [
  { ignores: ["examples/**", "out/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["registry/mcpblocks/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "radix-ui",
              message:
                "Import individual @radix-ui/react-* packages so floating primitives remain blocked.",
            },
          ],
          patterns: [
            {
              group: floatingRadix.map((name) => `@radix-ui/react-${name}`),
              message: floatingMessage,
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "localStorage",
          message: "Storage is unavailable in sandboxed MCP App frames.",
        },
        {
          name: "sessionStorage",
          message: "Storage is unavailable in sandboxed MCP App frames.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "MemberExpression[object.name='window'][property.name=/^(openai|localStorage|sessionStorage)$/]",
          message: "Not available to MCP Apps in Claude.",
        },
        {
          selector:
            "MemberExpression[object.name='document'][property.name='cookie']",
          message: "Cookies are unavailable in sandboxed MCP App frames.",
        },
        {
          selector: "Literal[value=/\\boverflow(-y)?-(auto|scroll)\\b/]",
          message:
            "Inline MCP App widgets must not scroll vertically; use horizontal scroll or fullscreen.",
        },
        {
          selector:
            "TemplateElement[value.raw=/\\boverflow(-y)?-(auto|scroll)\\b/]",
          message:
            "Inline MCP App widgets must not scroll vertically; use horizontal scroll or fullscreen.",
        },
        {
          selector:
            "Literal[value=/\\b(min-|max-)?h-(screen|svh|lvh|dvh)\\b/]",
          message: "Never size height with viewport units inside an MCP App.",
        },
        {
          selector:
            "TemplateElement[value.raw=/\\b(min-|max-)?h-(screen|svh|lvh|dvh)\\b/]",
          message: "Never size height with viewport units inside an MCP App.",
        },
      ],
    },
  },
  {
    files: ["registry/mcpblocks/lib/host.ts"],
    rules: {
      // `guideline()` logs dev-only warnings guarded by NODE_ENV.
      "no-console": "off",
    },
  },
]

export default eslintConfig

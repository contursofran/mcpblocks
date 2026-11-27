import { fileURLToPath } from "node:url"
import type { StorybookConfig } from "@storybook/react-vite"
import { mergeConfig } from "vite"

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../stories/*.stories.tsx"],
  viteFinal: (config) => mergeConfig(config, {
    esbuild: { jsx: "automatic" },
    resolve: { alias: { "@": fileURLToPath(new URL("../", import.meta.url)) } },
  }),
}

export default config

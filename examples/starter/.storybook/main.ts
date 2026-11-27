import type { StorybookConfig } from "@storybook/react-vite"

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-vite",
    options: { builder: { viteConfigPath: ".storybook/vite.config.ts" } },
  },
  stories: ["../stories/*.stories.tsx"],
}

export default config

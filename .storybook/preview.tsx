import type { Preview } from "@storybook/react-vite"

import "../app/globals.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Host theme",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [(Story, { globals }) => (
    <div className={globals.theme === "dark" ? "dark" : undefined}>
      <div className="mx-auto max-w-xl bg-host-bg text-host-fg">
        <Story />
      </div>
    </div>
  )],
}

export default preview

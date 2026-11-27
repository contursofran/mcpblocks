import type { Preview } from "@storybook/react-vite"

import "../app/globals.css"

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Host theme",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
    displayMode: {
      description: "Display mode for the fake host",
      toolbar: { icon: "browser", items: ["inline", "side-panel", "fullscreen"], dynamicTitle: true },
    },
    width: {
      description: "Container width for the fake host",
      toolbar: { icon: "resize", items: ["auto", "351px", "600px", "960px"], dynamicTitle: true },
    },
    safeAreas: {
      description: "Safe areas for the fake host",
      toolbar: { icon: "outline", items: ["auto", "none", "mobile"], dynamicTitle: true },
    },
    capabilities: {
      description: "Capabilities for the fake host",
      toolbar: { icon: "switchalt", items: [
        { value: "all", title: "All capabilities" },
        { value: "serverTools", title: "Without server tools" },
        { value: "updateModelContext", title: "Without model context" },
        { value: "message", title: "Without chat messages" },
        { value: "openLinks", title: "Without open links" },
        { value: "none", title: "No capabilities" },
      ], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light", displayMode: "inline", width: "auto", safeAreas: "auto", capabilities: "all" },
  decorators: [(Story, { globals, parameters }) => parameters.fakeHost ? <Story /> : (
    <div className={globals.theme === "dark" ? "dark" : undefined}>
      <div className="mx-auto max-w-xl bg-host-bg text-host-fg">
        <Story />
      </div>
    </div>
  )],
}

export default preview

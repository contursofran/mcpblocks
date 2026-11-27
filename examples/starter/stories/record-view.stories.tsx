import type { Meta, StoryObj } from "@storybook/react-vite"

import { FakeHost } from "@/hooks/fake-host"
import { RecordView } from "@/record-view"
import "@/styles.css"

const result = { content: [], structuredContent: { name: "Northwind renewal", status: "In review" } }

const meta = {
  component: RecordView,
  decorators: [(Story) => (
    <FakeHost context={{ theme: "dark", displayMode: "inline" }} initialToolResult={result}>
      <Story />
    </FakeHost>
  )],
} satisfies Meta<typeof RecordView>

export default meta
export const Record: StoryObj<typeof meta> = {}

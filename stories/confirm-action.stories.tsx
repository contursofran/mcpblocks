import type { Meta, StoryObj } from "@storybook/react-vite"
import { fn } from "storybook/test"

import { ConfirmAction } from "@/registry/mcpblocks/components/confirm-action"

const meta = {
  component: ConfirmAction,
  args: {
    title: "Move Northwind Traders to Negotiation",
    subject: { name: "Northwind Traders", detail: "Deal stage" },
    changePreview: <p>Stage <strong>Proposal</strong> → <strong>Negotiation</strong></p>,
    doneTitle: "Northwind Traders moved to Negotiation",
    onConfirm: fn(),
  },
} satisfies Meta<typeof ConfirmAction>

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {}
export const Working: Story = { args: { status: "working" } }
export const Done: Story = { args: { status: "done", onUndo: fn() } }
export const Error: Story = { args: { status: "error" } }
export const Refused: Story = {
  args: { status: "refused", refusedDescription: "This deal is already in its final stage." },
}
export const Unknown: Story = {
  args: { status: "unknown", unknownDescription: "Check the current stage of the deal.", onCheckAgain: fn() },
}

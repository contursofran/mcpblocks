import type { Meta, StoryObj } from "@storybook/react-vite"
import { useMemo, useRef, useState } from "react"

import { buildHostContext, insetsFor, type PreviewMode, type PreviewTheme } from "@/lib/host-context"
import { FakeHost } from "@/registry/mcpblocks/hooks/fake-host"
import { ChangePreview } from "@/registry/mcpblocks/ui/change-preview"
import { DataList } from "@/registry/mcpblocks/ui/data-list"
import { SelectField, TextField } from "@/registry/mcpblocks/ui/field"
import { HostButton } from "@/registry/mcpblocks/ui/host-button"
import { OutcomeCard } from "@/registry/mcpblocks/ui/outcome-card"
import { Sheet } from "@/registry/mcpblocks/ui/sheet"
import { StatusPill } from "@/registry/mcpblocks/ui/status-pill"
import { Surface } from "@/registry/mcpblocks/ui/surface"

type PartsProps = {
  theme?: PreviewTheme
  mode?: PreviewMode
  width?: string
  safeAreas?: string
}

function Parts({ theme = "light", mode = "inline", width = "auto", safeAreas }: PartsProps) {
  const [open, setOpen] = useState(false)
  const [locked, setLocked] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const availableWidth = width === "auto" ? ({ inline: 712, "side-panel": 600, fullscreen: 960 })[mode] : Number.parseInt(width)
  const context = useMemo(() => {
    const device = availableWidth <= 375 ? "mobile" : "web"
    const host = buildHostContext({ theme, mode, device })
    return {
      ...host,
      containerDimensions: { ...host.containerDimensions, width: availableWidth },
      safeAreaInsets: safeAreas === "none" ? { top: 0, right: 0, bottom: 0, left: 0 }
        : safeAreas === "mobile" ? insetsFor("mobile", mode)
          : host.safeAreaInsets,
    }
  }, [availableWidth, mode, theme, safeAreas])

  const deal = (
    <Surface className="grid gap-4 p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Northwind Traders</h2>
        <StatusPill tone="info">Proposal</StatusPill>
      </header>
      <DataList className="grid-cols-2" items={[
        { label: "Deal value", value: "$48,000" },
        { label: "Account owner", value: "Sarah Chen" },
      ]} />
      <ChangePreview rows={[{ label: "Stage", from: "Proposal", to: "Negotiation" }]} />
      <OutcomeCard status="unknown" description="The server hasn't returned a receipt." />
      <HostButton ref={trigger} variant="secondary" onClick={() => setOpen(true)}>Review changes</HostButton>
    </Surface>
  )

  return (
    <div className="mx-auto max-w-full" style={{ width: availableWidth }}>
      <FakeHost context={context}>
        <Sheet title="Review stage change" open={open} onOpenChange={setOpen} canClose={!locked} returnFocusRef={trigger} background={deal}>
          <TextField label="Account owner" defaultValue="Sarah Chen" description="Use the account owner’s full name." />
          <SelectField label="New stage" defaultValue="Negotiation">
            <option>Proposal</option>
            <option>Negotiation</option>
          </SelectField>
          <HostButton variant="secondary" onClick={() => setLocked((previous) => !previous)}>
            {locked ? "Unlock sheet" : "Lock sheet"}
          </HostButton>
        </Sheet>
      </FakeHost>
    </div>
  )
}

const meta = {
  title: "UI/Composable parts",
  component: Parts,
  parameters: { fakeHost: true },
  render: (_, { globals }) => <Parts theme={globals.theme} mode={globals.displayMode} width={globals.width} safeAreas={globals.safeAreas} />,
} satisfies Meta<typeof Parts>

export default meta
type Story = StoryObj<typeof meta>

export const Inline: Story = {}
export const Fullscreen: Story = { globals: { displayMode: "fullscreen" } }
export const NarrowDarkPanel: Story = { globals: { width: "351px", displayMode: "side-panel", theme: "dark" } }

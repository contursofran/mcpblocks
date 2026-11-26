# Line chart — MCP Blocks UI

> A borderless line chart with soft area fills, a hover tooltip, range tabs and a legend. Dependency-free SVG.

- **Category:** Data & media
- **Display modes:** inline, borderless
- **Host container variant:** `borderless` (set `_meta.ui.prefersBorder: false`)
- **Design source:** MCP Apps for Claude kit · Inline card / Borderless card
- **Docs URL:** https://mcpblocks.dev/components/line-chart
- **Registry JSON:** https://mcpblocks.dev/r/line-chart.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/line-chart.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- Borderless: set _meta.ui.prefersBorder = false
- Tooltip on hover, no popovers
- Fits inline without scrolling

## Usage

```tsx
import { LineChart } from "@/components/line-chart"

<LineChart
  title="Chats and messages"
  labels={days}
  series={[
    { name: "Messages", values: messages },
    { name: "Chats", values: chats },
  ]}
  ranges={["1D", "1W", "1M", "1Y"]}
  onRangeChange={(r) => app.callServerTool({ name: "get_usage", arguments: { range: r } })}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `labels` | `string[]` | One label per point; also shown in the tooltip. |
| `series` | `{ name, values[], color? }[]` | Up to ~4 series. |
| `ranges / range / onRangeChange` | `string[] / string / fn` | Optional range tabs. |
| `formatValue` | `(v) => string` | Axis and tooltip formatting. |

# Skeleton — MCP Blocks UI

> Loading placeholders. RowsSkeleton is the kit's loading state for lists and tables; InlineCardSkeleton and CarouselSkeleton match those components.

- **Category:** Feedback
- **Display modes:** inline, fullscreen
- **Host container variant:** `card`
- **Design source:** MCP Apps for Claude kit · Inline card / Loading
- **Docs URL:** https://mcpblocks.dev/components/skeleton
- **Registry JSON:** https://mcpblocks.dev/r/skeleton.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/skeleton.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- Matches the final layout
- No spinners
- Announced as loading to screen readers

## Usage

```tsx
import { RowsSkeleton } from "@/components/skeleton"

{data ? <ListView items={data.items} /> : <RowsSkeleton rows={4} columns={3} />}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `RowsSkeleton` | `{ rows?, columns?, avatar? }` | Avatar + columns, as in the kit. |
| `InlineCardSkeleton` | `{ fields?, actions? }` | Matches InlineCard. |
| `CarouselSkeleton` | `{ count?, cardWidth? }` | Matches Carousel. |
| `HostSkeleton` | `component` | A single pulsing block. |

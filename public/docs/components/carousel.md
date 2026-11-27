# Carousel — MCP Blocks UI

> A horizontal row of comparable items with tall images, a save toggle, a rating and a meta row, with a fading edge and next button.

- **Category:** Data & media
- **Display modes:** inline, borderless
- **Host container variant:** `borderless` (set `_meta.ui.prefersBorder: false`)
- **Design source:** MCP Apps for Claude kit · Inline carousel
- **Docs URL:** https://mcpblocks.dev/components/carousel
- **Registry JSON:** https://mcpblocks.dev/r/carousel.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/carousel.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- 3–8 items (dev warning outside that range)
- Next card peeks behind a fade
- One action per card (save)

## Usage

```tsx
import { Carousel } from "@/components/carousel"

<Carousel
  label="Nearby hikes"
  items={trails.map((t) => ({
    id: t.id,
    title: t.name,
    subtitle: t.park,
    image: t.photo,
    rating: t.rating,
    meta: [t.difficulty, t.distance],
    saved: t.saved,
    onSave: (saved) => app.callServerTool({ name: "save_trail", arguments: { id: t.id, saved } }),
  }))}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `CarouselItem[]` | id, title, subtitle?, image?, rating?, meta?, saved?, onSave?, onClick? |
| `cardWidth / imageHeight` | `number` | Default 220 × 280, as in the kit. |
| `label` | `string` | Accessible name for the scroll region. |

## Changelog

See the version stamp near the top of your copied source. Compare your copy with `npx shadcn@latest add https://mcpblocks.dev/r/carousel.json --diff components/carousel.tsx`. Adjust the path to match your installation.

### 0.1.1 · 2026-11-27

- Adjusted card widths and controls for narrow panels.
- Adopted host app tokens for brand overrides.

### 0.1.0 · 2026-11-24

- Initial registry release.

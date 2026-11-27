# Media player — MCP Blocks UI

> An inline audio card with play/pause, a waveform you can click to seek, the duration and optional regenerate/download actions.

- **Category:** Data & media
- **Display modes:** inline
- **Host container variant:** `card`
- **Design source:** MCP Apps for Claude kit · Inline card / Media card
- **Docs URL:** https://mcpblocks.dev/components/media-player
- **Registry JSON:** https://mcpblocks.dev/r/media-player.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/media-player.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- Playback stays inline, no new window
- Waveform is keyboard-seekable (←/→)
- Two actions at most

## Usage

```tsx
import { MediaPlayer } from "@/components/media-player"

<MediaPlayer
  title="Podcast Intro"
  subtitle="Rachel · Warm"
  src={result.audioUrl}
  peaks={result.peaks}
  onRegenerate={() => app.sendMessage({ role: "user", content: [{ type: "text", text: "Try a different voice" }] })}
  onDownload={() => app.openLink({ url: result.audioUrl })}
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Audio URL. Without it the card is a static preview. |
| `peaks` | `number[]` | Waveform values 0–1. A stable placeholder is generated if omitted. |
| `duration` | `number` | Seconds, shown before metadata loads. |
| `onRegenerate / onDownload` | `() => void` | Show the matching icon buttons. |

## Changelog

See the version stamp near the top of your copied source. Compare your copy with `npx shadcn@latest add https://mcpblocks.dev/r/media-player.json --diff components/media-player.tsx`. Adjust the path to match your installation.

### 0.1.1 · 2026-11-27

- Allowed playback and secondary actions to wrap at narrow widths.
- Adopted host app tokens for brand overrides.

### 0.1.0 · 2026-11-24

- Initial registry release.

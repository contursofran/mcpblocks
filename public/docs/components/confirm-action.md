# Confirm action — MCP Blocks UI

> Confirmation for a change Claude has prepared: what will happen, who it applies to, one confirm button, and what the change includes.

- **Category:** Inline cards
- **Display modes:** inline
- **Host container variant:** `card`
- **Design source:** MCP Apps for Claude kit · Inline card / Confirmation actions
- **Docs URL:** https://mcpblocks.dev/components/confirm-action
- **Registry JSON:** https://mcpblocks.dev/r/confirm-action.json

## Install

```bash
npx shadcn@latest add https://mcpblocks.dev/r/confirm-action.json
```

Automatically installs `host-tokens` (Claude CSS variables + Tailwind v4 `host-*` utilities) and required helpers.

## Guidelines

- One confirm action
- Refusals show the reason
- Unconfirmed writes offer a check

## Usage

```tsx
import { ConfirmAction } from "@/components/confirm-action"

<ConfirmAction
  title="Set lead assignment permission"
  subject={{ name: "Sarah Johnson", detail: "sarah.johnson@company.com" }}
  confirmLabel="Confirm assignment"
  changePreview={<p>Permission: Read only → Manage leads</p>}
  status={status}
  onConfirm={executePreparedAssignment}
  onCheckAgain={checkAssignment}
  details={{ heading: "Lead assignment permissions", items: permissions }}
  doneTitle="Permission assigned"
/>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `ReactNode` | What will happen. |
| `subject` | `{ name, detail?, initials?, avatarColor? }` | The person or record it applies to. |
| `onConfirm` | `() => unknown` | Return a promise to show the working state; a rejection shows the error state. |
| `details` | `{ heading, items[] }` | What the change includes, as a checklist. |
| `changePreview` | `ReactNode` | Shows the proposed change and the confirmation reminder. |
| `status` | `pending \| working \| done \| error \| refused \| unknown` | Control the state from outside. |
| `refusedTitle / refusedDescription` | `ReactNode` | Explain why the server refused the proposal without a write. |
| `unknownTitle / unknownDescription` | `ReactNode` | Explain a write whose outcome could not be verified. |
| `onCheckAgain` | `() => void` | Reconcile the original write in the unknown state. |

## Changelog

See the version stamp near the top of your copied source. Compare your copy with `npx shadcn@latest add https://mcpblocks.dev/r/confirm-action.json --diff components/confirm-action.tsx`. Adjust the path to match your installation.

### 0.1.2 · 2026-11-27

- Composed the proposal and outcomes from shared UI parts and kept the controlled status API.

Public props are unchanged. Reinstall the block and its new registry dependencies together.

### 0.1.1 · 2026-11-27

- Wrapped the confirm control and long status text at narrow widths.
- Adopted host app tokens for brand overrides.
- Added refused and unknown states for prepared writes.

Apps with an uncertain write should display the unknown status and supply a receipt check.

### 0.1.0 · 2026-11-24

- Initial registry release.

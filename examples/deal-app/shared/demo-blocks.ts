export const DEMO_BLOCKS = [
  "list-view", "inline-card", "confirm-action", "line-chart", "media-player",
  "document-card", "carousel", "skeleton", "status-update", "branded-confirm-action",
] as const

export type DemoBlock = (typeof DEMO_BLOCKS)[number]

"use client"

import type { AppEventMap } from "@modelcontextprotocol/ext-apps"
import { createContext, useContext } from "react"

export type ToolNotifications = {
  input?: AppEventMap["toolinput"]
  partialInput?: AppEventMap["toolinputpartial"]
  result?: AppEventMap["toolresult"]
  cancelled?: AppEventMap["toolcancelled"]
}

export const ToolNotificationsContext = createContext<ToolNotifications | null>(null)

/** Latest partial input, complete input, result, and cancellation from the host. */
export function useToolResult() {
  const notifications = useContext(ToolNotificationsContext)
  if (!notifications) throw new Error("useToolResult must be used within McpHostProvider.")
  return notifications
}

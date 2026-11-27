import { ConfirmAction, type ConfirmActionProps } from "@/components/confirm-action"

import "./branded-confirm-action.css"

export function BrandedConfirmAction(props: ConfirmActionProps) {
  return (
    <div className="mcpblocks-brand-example rounded-host-xl bg-host-app-surface">
      <ConfirmAction {...props} />
    </div>
  )
}

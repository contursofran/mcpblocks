import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button styled with MCP Apps host tokens.
 * 44px minimum height so it meets mobile tap-target guidance.
 */
const hostButtonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-host-md px-4 text-sm font-semibold whitespace-nowrap transition-[opacity,background-color] outline-none focus-visible:ring-2 focus-visible:ring-host-ring disabled:pointer-events-none disabled:text-host-fg-disabled disabled:opacity-60 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-host-app-accent text-host-app-accent-fg hover:opacity-90",
        secondary:
          "border-[length:var(--border-width-regular,0.5px)] border-host-app-border bg-transparent text-host-app-fg hover:bg-host-app-surface-muted",
        ghost: "bg-transparent text-host-app-fg hover:bg-host-app-surface-muted",
        danger:
          "bg-host-app-danger-bg text-white hover:opacity-90",
      },
      block: {
        true: "w-full flex-1",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      block: false,
    },
  }
)

export type HostButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof hostButtonVariants>

export function HostButton({
  className,
  variant,
  block,
  type = "button",
  ...props
}: HostButtonProps) {
  return (
    <button
      type={type}
      data-slot="host-button"
      className={cn(hostButtonVariants({ variant, block }), className)}
      {...props}
    />
  )
}

export { hostButtonVariants }

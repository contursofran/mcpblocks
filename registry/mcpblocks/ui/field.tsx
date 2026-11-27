import { useId, type ComponentProps, type ReactNode } from "react"

import { cn } from "@/lib/utils"

type FieldProps = {
  label: ReactNode
  description?: ReactNode
  className?: string
}

const controlClass = "min-h-11 w-full min-w-0 rounded-host-md border-[length:var(--border-width-regular,0.5px)] border-host-app-border bg-host-app-surface px-3 py-2 text-base text-host-app-fg [color-scheme:inherit] focus-visible:outline-2 focus-visible:outline-host-ring disabled:bg-host-bg-disabled disabled:text-host-fg-disabled"

export function Field({
  label,
  children,
  description,
  descriptionId,
  className,
}: FieldProps & { children: ReactNode; descriptionId?: string }) {
  return (
    <div data-slot="field" className={cn("min-w-0 space-y-1 text-host-app-fg font-[family-name:var(--font-sans)]", className)}>
      <label className="flex flex-col gap-1.5 text-host-sm font-medium">
        <span className="[overflow-wrap:anywhere]">{label}</span>
        {children}
      </label>
      {description != null ? <p id={descriptionId} className="text-host-xs text-host-app-fg-muted">{description}</p> : null}
    </div>
  )
}

export function TextField({
  label,
  description,
  className,
  "aria-describedby": describedBy,
  ...props
}: ComponentProps<"input"> & FieldProps) {
  const descriptionId = useId()
  return (
    <Field label={label} description={description} descriptionId={descriptionId}>
      <input
        className={cn(controlClass, "placeholder:text-host-app-fg-subtle", className)}
        aria-describedby={[describedBy, description != null && descriptionId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
    </Field>
  )
}

export function SelectField({
  label,
  description,
  className,
  "aria-describedby": describedBy,
  ...props
}: ComponentProps<"select"> & FieldProps) {
  const descriptionId = useId()
  return (
    <Field label={label} description={description} descriptionId={descriptionId}>
      <select
        className={cn(controlClass, className)}
        aria-describedby={[describedBy, description != null && descriptionId].filter(Boolean).join(" ") || undefined}
        {...props}
      />
    </Field>
  )
}

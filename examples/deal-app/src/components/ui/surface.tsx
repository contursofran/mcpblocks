import { forwardRef, type ComponentPropsWithoutRef, type Ref } from "react"

import { cn } from "@/lib/utils"

type SurfaceProps = (ComponentPropsWithoutRef<"div"> & { as?: "div" } | ComponentPropsWithoutRef<"section"> & { as: "section" }) & {
  variant?: "card" | "borderless" | "subtle"
}

/** A named host surface with optional card chrome. */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface({ variant = "card", className, ...props }, ref) {
  const styles = cn(
    "w-full text-host-app-fg font-[family-name:var(--font-sans)]",
    variant === "card" && "rounded-host-xl border-[length:var(--border-width-regular,0.5px)] border-host-app-border-muted bg-host-app-surface",
    variant === "subtle" && "rounded-host-xl bg-host-app-surface-subtle",
    className,
  )
  if (props.as === "section") {
    const { as: Section, ...section } = props
    return <Section ref={ref} data-slot="surface" className={styles} {...section} />
  }
  const { as: Div = "div", ...div } = props
  return <Div ref={ref as Ref<HTMLDivElement>} data-slot="surface" className={styles} {...div} />
})

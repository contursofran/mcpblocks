"use client"

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react"

import { cn } from "@/lib/utils"
import { HostButton } from "@/registry/mcpblocks/ui/host-button"
import { Surface } from "@/registry/mcpblocks/ui/surface"

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  children: ReactNode
  background?: ReactNode
  canClose?: boolean
  returnFocusRef?: RefObject<HTMLElement | null>
  className?: string
}

const focusable = "button, a[href], input, select, textarea, summary, [contenteditable='true'], [tabindex]"

function tabStops(sheet: HTMLElement) {
  return Array.from(sheet.querySelectorAll<HTMLElement>(focusable)).filter((element) =>
    element.tabIndex >= 0 && !element.matches(":disabled") && !element.closest("[hidden], [inert]") && element.getClientRects().length > 0
  )
}

/** A modal within the view's layout. Narrow containers anchor it at the bottom. */
export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  background,
  canClose = true,
  returnFocusRef,
  className,
}: SheetProps) {
  const titleId = useId()
  const sheetRef = useRef<HTMLElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sheet = sheetRef.current
    if (!open || !sheet) return
    const doc = sheet.ownerDocument
    const previous = doc.activeElement
    const returnTarget = returnFocusRef?.current ?? (previous instanceof HTMLElement ? previous : null)
    const underlay = backgroundRef.current

    function keepFocus(event: FocusEvent) {
      if (event.target instanceof Node && !sheet?.contains(event.target)) sheet?.focus()
    }

    sheet.focus()
    if (underlay) underlay.inert = true
    doc.addEventListener("focusin", keepFocus)
    return () => {
      doc.removeEventListener("focusin", keepFocus)
      if (underlay) underlay.inert = false
      if (returnTarget?.isConnected) returnTarget.focus()
    }
  }, [open, returnFocusRef])

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      if (canClose) onOpenChange(false)
      return
    }
    if (event.key !== "Tab") return
    const sheet = event.currentTarget
    const stops = tabStops(sheet)
    const first = stops[0]
    const last = stops.at(-1)
    const focused = sheet.ownerDocument.activeElement
    if (!first || !last || focused === sheet || (event.shiftKey && focused === first) || (!event.shiftKey && focused === last)) {
      event.preventDefault()
      const next = event.shiftKey ? last : first
      if (next) next.focus()
      else sheet.focus()
    }
  }

  return (
    <div data-slot="sheet-container" className="@container/sheet isolate grid min-w-0">
      {background != null && <div className="col-start-1 row-start-1 min-w-0" ref={backgroundRef}>{background}</div>}
      {open && (
        <div className="col-start-1 row-start-1 z-10 flex min-w-0 items-end justify-end bg-host-app-fg/10 pt-[var(--mb-safe-top,0px)] pr-[var(--mb-safe-right,0px)] pb-[var(--mb-safe-bottom,0px)] pl-[var(--mb-safe-left,0px)] @[36rem]/sheet:items-stretch">
          <Surface
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-slot="sheet"
            tabIndex={-1}
            onKeyDown={onKeyDown}
            className={cn("flex min-w-0 flex-col gap-4 p-4 outline-none [overflow-wrap:anywhere] @[36rem]/sheet:w-[min(100%,28rem)]", className)}
          >
            <header className="flex flex-wrap items-center justify-between gap-3">
              <h2 id={titleId} className="text-host-heading-md font-host-app-display font-semibold">{title}</h2>
              <HostButton variant="secondary" onClick={() => canClose && onOpenChange(false)} disabled={!canClose}>Close</HostButton>
            </header>
            {children}
          </Surface>
        </div>
      )}
    </div>
  )
}

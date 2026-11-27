"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type DocumentProperty = {
  label: string
  value: string
  /** Render the value as a tag. */
  tag?: boolean
}

export type DocumentSection =
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "tasks"; heading: string; items: { text: string; done?: boolean }[]; placeholder?: string }

export type DocumentCardProps = {
  title: string
  /** Optional leading emoji or short glyph. */
  icon?: string
  properties?: DocumentProperty[]
  sections: DocumentSection[]
  /** Make list items and tasks editable in place. */
  editable?: boolean
  /** Called with the updated sections whenever the user edits. */
  onChange?: (sections: DocumentSection[]) => void
  className?: string
}

/**
 * A document or page preview with properties, lists and tasks, editable inline.
 * Matches the "Inline editing" pattern in the MCP Apps for Claude kit.
 */
export function DocumentCard({
  title,
  icon,
  properties,
  sections: initial,
  editable = true,
  onChange,
  className,
}: DocumentCardProps) {
  const [sections, setSections] = React.useState(initial)

  function update(next: DocumentSection[]) {
    setSections(next)
    onChange?.(next)
  }

  return (
    <div
      data-slot="document-card"
      className={cn("flex w-full flex-col gap-6 px-4 pt-4 pb-6 text-host-app-fg font-[family-name:var(--font-sans)] [overflow-wrap:anywhere]", className)}
    >
      <h3 className="flex items-center gap-2 text-xl leading-[1.4] font-host-app-display font-semibold">
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span className="min-w-0 truncate">{title}</span>
      </h3>

      {properties?.length ? (
        <dl className="flex flex-col gap-2 rounded-host-xl bg-host-app-surface-subtle px-4 py-2">
          {properties.map((p) => (
            <div key={p.label} className="flex items-center gap-3 text-sm leading-[1.4]">
              <dt className="w-[72px] max-w-[40%] shrink-0 text-host-app-fg-subtle">{p.label}</dt>
              <dd className="min-w-0 py-1 text-host-app-fg-muted">
                {p.tag ? (
                  <span className="inline-block max-w-full rounded-host-sm border-[length:var(--border-width-regular,0.5px)] border-host-app-info-border/40 bg-host-app-info-bg px-2 py-1 text-host-app-fg">{p.value}</span>
                ) : (
                  p.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {sections.map((section, si) => (
        <section key={section.heading + si} className={cn("flex flex-col", section.kind === "list" ? "gap-2" : "gap-3")}>
          <h4 className="text-sm leading-[1.4] font-semibold">{section.heading}</h4>

          {section.kind === "list" ? (
            <ul className="flex flex-col gap-0.5 px-2">
              {section.items.map((item, ii) => (
                <li key={ii}>
                  <div
                    contentEditable={editable}
                    suppressContentEditableWarning
                    role={editable ? "textbox" : undefined}
                    aria-label={editable ? `${section.heading} item ${ii + 1}` : undefined}
                    onBlur={(e) => {
                      const text = e.currentTarget.textContent ?? ""
                      if (text === item) return
                      const next = sections.map((s, i) =>
                        i === si && s.kind === "list" ? { ...s, items: s.items.map((it, j) => (j === ii ? text : it)) } : s
                      )
                      update(next)
                    }}
                    className={cn(
                      "rounded-host-sm border-[length:var(--border-width-regular,0.5px)] border-transparent px-1.5 py-1 text-sm leading-[1.4] text-host-app-fg-muted outline-none",
                      editable && "focus:border-host-app-border-subtle hover:bg-host-app-surface-subtle"
                    )}
                  >
                    {item}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col gap-2">
              {section.items.length === 0 && section.placeholder ? (
                <li className="flex items-center gap-3 text-sm leading-[1.4] text-host-app-fg-subtle opacity-75">
                  <span aria-hidden="true" className="size-4 shrink-0 rounded-host-xs border-[length:var(--border-width-regular,0.5px)] border-host-app-border-muted bg-host-app-surface" />
                  {section.placeholder}
                </li>
              ) : null}
              {section.items.map((task, ti) => (
                <li key={ti}>
                  <label className="flex cursor-pointer items-center gap-3 text-sm leading-[1.4] text-host-app-fg-muted">
                    <input
                      type="checkbox"
                      checked={!!task.done}
                      disabled={!editable}
                      onChange={(e) => {
                        const next = sections.map((s, i) =>
                          i === si && s.kind === "tasks"
                            ? { ...s, items: s.items.map((it, j) => (j === ti ? { ...it, done: e.target.checked } : it)) }
                            : s
                        )
                        update(next)
                      }}
                      className="size-4 shrink-0 rounded-host-xs accent-[var(--mb-accent,var(--color-text-primary))]"
                    />
                    <span className={cn(task.done && "text-host-app-fg-subtle line-through")}>{task.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}

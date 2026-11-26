"use client"

import * as React from "react"
import Link from "next/link"
import { Bookmark, Check, Play } from "lucide-react"

import {
  componentCategories,
  components,
  type ComponentCategory,
} from "@/lib/docs"
import { cn } from "@/lib/utils"

/**
 * Flat schematic previews on warm-neutral surfaces.
 */
function MiniPreview({ slug }: { slug: string }) {
  switch (slug) {
    case "list-view":
      return (
        <div className="flex w-full max-w-52 flex-col rounded-xl border border-[#141413]/[0.08] bg-white text-[0.6875rem]/4 text-[#141413]">
          {[
            { init: "SC", bg: "#6366E9", name: "Sarah Chen", meta: "#design", time: "Nov 12" },
            { init: "MJ", bg: "#835EEE", name: "Marcus Johnson", meta: "#design", time: "Nov 12" },
            { init: "ER", bg: "#DA5597", name: "Emily Rodriguez", meta: "#product", time: "Nov 13" },
          ].map((row, i) => (
            <div
              key={row.name}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2",
                i > 0 && "border-t border-[#141413]/[0.06]"
              )}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white"
                style={{ backgroundColor: row.bg }}
              >
                {row.init}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="truncate font-semibold">{row.name}</span>
                  <span className="shrink-0 text-[9px] text-[#73726c]">{row.time}</span>
                </div>
                <div className="truncate text-[10px] text-[#73726c]">{row.meta}</div>
              </div>
            </div>
          ))}
        </div>
      )

    case "confirm-action":
      return (
        <div className="flex w-full max-w-52 flex-col gap-2.5 rounded-xl border border-[#141413]/[0.08] bg-white p-3 text-[0.6875rem]/4 text-[#141413]">
          <div className="font-semibold">Approve permission</div>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-[#141413]/[0.08] bg-[#faf9f5] p-2">
            <div className="flex items-center gap-1.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#3266ad] text-[9px] font-semibold text-white">
                SJ
              </span>
              <span className="font-medium">Sarah J.</span>
            </div>
            <span className="rounded-md bg-[#141413] px-2 py-0.5 text-[10px] font-semibold text-white">
              Confirm
            </span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] text-[#73726c]">
            <div className="flex items-center gap-1.5">
              <Check className="size-3 text-[#437426]" />
              Edit access to Leads
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="size-3 text-[#437426]" />
              Run assignment rules
            </div>
          </div>
        </div>
      )

    case "media-player":
      return (
        <div className="flex w-full max-w-52 flex-col gap-3 rounded-xl border border-[#141413]/[0.08] bg-white p-3 text-[0.6875rem]/4 text-[#141413]">
          <div>
            <div className="font-semibold">Podcast Intro</div>
            <div className="text-[10px] text-[#73726c]">Rachel · Warm</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#141413] text-white">
              <Play className="size-3 translate-x-px fill-current" />
            </span>
            <div className="flex h-6 flex-1 items-center gap-[2px]">
              {[35, 65, 90, 50, 80, 100, 60, 75, 45, 85, 55, 40, 70, 50, 30].map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    "w-1 flex-1 rounded-full",
                    i < 6 ? "bg-[#141413]" : "bg-[#141413]/20"
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] text-[#73726c]">0:27</span>
          </div>
        </div>
      )

    case "line-chart":
      return (
        <div className="flex w-full max-w-52 flex-col gap-2 rounded-xl border border-[#141413]/[0.08] bg-white p-3 text-[0.6875rem]/4 text-[#141413]">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Usage</span>
            <span className="rounded-full bg-[#f5f4ed] px-1.5 py-0.5 font-mono text-[9px] text-[#73726c]">
              1M
            </span>
          </div>
          <svg viewBox="0 0 180 68" className="h-16 w-full overflow-visible">
            <line x1="0" y1="16" x2="180" y2="16" stroke="rgba(20,20,19,0.08)" strokeDasharray="3 3" />
            <line x1="0" y1="42" x2="180" y2="42" stroke="rgba(20,20,19,0.08)" strokeDasharray="3 3" />
            <path
              d="M0,54 C30,48 45,30 75,34 C105,38 125,18 180,10"
              fill="none"
              stroke="#D97757"
              strokeWidth="2"
            />
            <path
              d="M0,62 C35,56 55,44 90,46 C125,48 145,34 180,26"
              fill="none"
              stroke="#6366E9"
              strokeWidth="2"
            />
            <circle cx="128" cy="24" r="3" fill="#D97757" />
          </svg>
        </div>
      )

    case "document-card":
      return (
        <div className="flex w-full max-w-52 flex-col gap-2 rounded-xl border border-[#141413]/[0.08] bg-white p-3 text-[0.6875rem]/4 text-[#141413]">
          <div className="font-semibold">📋 Sprint Planning</div>
          <div className="flex items-center gap-2 rounded-md bg-[#faf9f5] px-2 py-1 text-[10px]">
            <span className="text-[#73726c]">Type</span>
            <span className="rounded bg-[#d6e4f6] px-1.5 py-0.5 text-[9px] font-medium text-[#141413]">
              Notes
            </span>
          </div>
          <div className="flex flex-col gap-1 text-[10px] text-[#3d3d3a]">
            <div className="flex items-center gap-1.5">
              <span className="flex size-3 items-center justify-center rounded-[3px] bg-[#141413] text-white">
                <Check className="size-2" />
              </span>
              <span className="line-through opacity-55">Review last sprint</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 rounded-[3px] border border-[#141413]/25" />
              <span>Assign new tickets</span>
            </div>
          </div>
        </div>
      )

    case "carousel":
      return (
        <div className="flex w-full max-w-52 items-center gap-2 overflow-hidden">
          {[
            { title: "Ocean View", meta: "4.6 · 2.8 mi", grad: "bg-[#d6e4f6]", saved: true },
            { title: "Redwood Loop", meta: "4.8 · 4 mi", grad: "bg-[#e9f1dc]", saved: false },
          ].map((card) => (
            <div
              key={card.title}
              className="flex w-28 shrink-0 flex-col gap-1.5 rounded-xl border border-[#141413]/[0.08] bg-white p-1.5"
            >
              <div className={cn("relative h-16 rounded-lg ", card.grad)}>
                <span className="absolute top-1.5 right-1.5 flex size-5 items-center justify-center rounded-full bg-white/90 text-[#141413]">
                  <Bookmark className="size-2.5" fill={card.saved ? "currentColor" : "none"} />
                </span>
              </div>
              <div className="px-0.5 text-[10px]/3.5">
                <div className="truncate font-semibold text-[#141413]">{card.title}</div>
                <div className="truncate text-[9px] text-[#73726c]">{card.meta}</div>
              </div>
            </div>
          ))}
        </div>
      )

    case "skeleton":
      return (
        <div className="flex w-full max-w-52 flex-col gap-2.5 rounded-xl border border-[#141413]/[0.08] bg-white p-3">
          {[0, 1, 2].map((r) => (
            <div key={r} className="flex items-center gap-2">
              <span className="size-5 shrink-0 rounded-full bg-[#141413]/[0.08]" />
              <span className="h-2.5 flex-1 rounded bg-[#141413]/[0.08]" />
              <span className="h-2.5 w-10 rounded bg-[#141413]/[0.05]" />
            </div>
          ))}
        </div>
      )

    case "inline-card":
      return (
        <div className="flex w-full max-w-52 flex-col gap-2.5 rounded-xl border border-[#141413]/[0.08] bg-white p-3 text-[0.6875rem]/4 text-[#141413]">
          <div className="flex items-center justify-between gap-1">
            <span className="font-semibold">Northwind renewal</span>
            <span className="rounded-full bg-[#f6eedf] px-1.5 py-0.5 text-[9px] font-semibold text-[#5a4815]">
              At risk
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div>
              <div className="text-[9px] text-[#73726c]">Owner</div>
              <div className="font-medium">M. Ortega</div>
            </div>
            <div>
              <div className="text-[9px] text-[#73726c]">Seats</div>
              <div className="font-medium">48</div>
            </div>
          </div>
          <div className="flex gap-1.5 pt-0.5">
            <span className="flex-1 rounded-md bg-[#141413] py-1 text-center text-[10px] font-semibold text-white">
              Open
            </span>
            <span className="flex-1 rounded-md border border-[#141413]/15 py-1 text-center text-[10px] font-semibold text-[#141413]">
              Follow up
            </span>
          </div>
        </div>
      )

    case "status-update":
      return (
        <div className="flex w-full max-w-52 flex-col gap-2 text-[0.6875rem]/4 text-[#141413]">
          <div className="flex items-center gap-2 rounded-xl border border-[#141413]/[0.08] bg-white p-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e9f1dc] text-[#265b19]">
              <Check className="size-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">Invoice sent</div>
              <div className="truncate text-[9px] text-[#73726c]">INV-2041 · just now</div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-[#141413]/[0.08] bg-white p-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f6eedf] text-[10px] font-bold text-[#5a4815]">
              !
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">2 slots left</div>
              <div className="truncate text-[9px] text-[#73726c]">Calendar almost full</div>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

export function ComponentGallery() {
  const [filter, setFilter] = React.useState<"All" | ComponentCategory>("All")

  const visible =
    filter === "All"
      ? components
      : components.filter((c) => c.category === filter)

  return (
    <div>
      {/* Exact Headless UI pill bar */}
      <div className="mx-auto max-w-7xl px-2">
        <div role="tablist" aria-label="Filter components" className="flex flex-wrap gap-3 py-8">
          {(["All", ...componentCategories] as const).map((tab) => {
            const active = filter === tab
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-sm/6 font-medium transition-colors select-none",
                  active
                    ? "bg-[#141413]/[0.08] text-[#141413]"
                    : "text-[#141413]/45 hover:bg-[#141413]/[0.04] hover:text-[#141413]/75"
                )}
              >
                {tab}
              </button>
            )
          })}
        </div>
      </div>

      {/* Headless UI signature horizontal hairline row bands + 3-column vertical tile rails */}
      <div className="relative">
        <div className="relative z-10 mx-auto max-w-7xl px-2 pb-8">
          <div className="mt-2 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((c) => (
              <Link
                key={c.slug}
                href={`/components/${c.slug}`}
                className="group focus:outline-none"
              >
                <div className="relative flex h-64 items-center justify-center bg-[#141413]/[0.03] px-4 transition-colors group-hover:bg-[#141413]/[0.055] group-focus-visible:ring-1 group-focus-visible:ring-[#141413]">
                  <div aria-hidden="true" className="relative z-10 flex w-full justify-center select-none">
                    <MiniPreview slug={c.slug} />
                  </div>
                </div>
                <div className="mt-2 truncate pt-2.5 text-sm font-semibold text-[#141413]">
                  {c.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

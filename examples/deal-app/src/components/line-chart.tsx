import * as React from "react"

import { cn } from "@/lib/utils"

export type LineChartSeries = {
  name: string
  /** One value per label. */
  values: number[]
  /** Line color. Defaults cycle through the kit's chart palette. */
  color?: string
}

export type LineChartProps = {
  title?: string
  /** X-axis labels, one per data point. */
  labels: string[]
  series: LineChartSeries[]
  /** Which labels to print under the axis (every Nth). Default: about 4 ticks. */
  labelEvery?: number
  /** Range tabs, e.g. ["1D","1W","1M","1Y"]. */
  ranges?: string[]
  range?: string
  onRangeChange?: (range: string) => void
  /** Chart plot height in px. */
  height?: number
  formatValue?: (v: number) => string
  className?: string
}

const PALETTE = ["#E0574F", "#6366E9", "#2C84DB", "#D1A041"]
const W = 640

function smoothPath(points: [number, number][]) {
  if (points.length < 2) return ""
  // Monotone cubic interpolation (Fritsch–Carlson) so lines never overshoot.
  const n = points.length
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1][0] - points[i][0])
    m.push((points[i + 1][1] - points[i][1]) / dx[i])
  }
  const t: number[] = [m[0]]
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2)
  t.push(m[n - 2])
  let d = `M${points[0][0]},${points[0][1]}`
  for (let i = 0; i < n - 1; i++) {
    const c1x = points[i][0] + dx[i] / 3
    const c1y = points[i][1] + (t[i] * dx[i]) / 3
    const c2x = points[i + 1][0] - dx[i] / 3
    const c2y = points[i + 1][1] - (t[i + 1] * dx[i]) / 3
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${points[i + 1][0]},${points[i + 1][1]}`
  }
  return d
}

function niceTicks(max: number, target = 5) {
  const raw = max / target
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)))
  const step = [1, 2, 2.5, 5, 10].map((s) => s * mag).find((s) => s >= raw) ?? raw
  const count = Math.max(1, Math.ceil(max / step))
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

/**
 * Borderless line chart with area fills, hover tooltip, range tabs and legend.
 * Matches the "Borderless card" data pattern in the MCP Apps for Claude kit.
 * Register the resource with `_meta.ui.prefersBorder: false`.
 */
export function LineChart({
  title,
  labels,
  series,
  labelEvery,
  ranges,
  range,
  onRangeChange,
  height = 200,
  formatValue = (v) => v.toLocaleString(),
  className,
}: LineChartProps) {
  const id = React.useId()
  const [hover, setHover] = React.useState<number | null>(null)
  const [activeRange, setActiveRange] = React.useState(range ?? ranges?.[0])
  const current = range ?? activeRange

  const max = Math.max(1, ...series.flatMap((s) => s.values))
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  const H = height
  const x = (i: number) => (labels.length <= 1 ? 0 : (i / (labels.length - 1)) * W)
  const y = (v: number) => H - (v / top) * (H - 8) - 4
  const every = labelEvery ?? Math.max(1, Math.round(labels.length / 4))

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const rel = ((e.clientX - rect.left) / rect.width) * W
    setHover(Math.max(0, Math.min(labels.length - 1, Math.round((rel / W) * (labels.length - 1)))))
  }

  return (
    <div
      data-slot="line-chart"
      className={cn("flex w-full flex-col gap-3 p-4 text-host-fg font-[family-name:var(--font-sans)]", className)}
    >
      {title ? <p className="text-sm leading-[1.4]">{title}</p> : null}

      <div className="flex gap-3 pt-3 pb-2">
        <div
          aria-hidden="true"
          className="flex flex-col-reverse justify-between text-right text-xs leading-[1.4] text-host-fg-tertiary tabular-nums"
          style={{ height: H }}
        >
          {ticks.map((t) => (
            <span key={t}>{formatValue(t)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="block w-full touch-none overflow-visible"
            style={{ height: H }}
            role="img"
            aria-label={`${title ?? "Line chart"}: ${series.map((s) => s.name).join(", ")}`}
            onPointerMove={onMove}
            onPointerLeave={() => setHover(null)}
          >
            <defs>
              {series.map((s, si) => (
                <linearGradient key={si} id={`${id}-g${si}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={s.color ?? PALETTE[si % PALETTE.length]} stopOpacity="0.12" />
                  <stop offset="100%" stopColor={s.color ?? PALETTE[si % PALETTE.length]} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {ticks.map((t) => (
              <line
                key={t}
                x1="0"
                x2={W}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--color-border-tertiary)"
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            {labels.map((_, i) =>
              i % every === 0 ? (
                <line key={i} x1={x(i)} x2={x(i)} y1="0" y2={H} stroke="var(--color-border-tertiary)" vectorEffect="non-scaling-stroke" />
              ) : null
            )}
            {series.map((s, si) => {
              const pts = s.values.map((v, i) => [x(i), y(v)] as [number, number])
              const line = smoothPath(pts)
              const color = s.color ?? PALETTE[si % PALETTE.length]
              return (
                <g key={s.name}>
                  <path d={`${line} L${W},${H} L0,${H} Z`} fill={`url(#${id}-g${si})`} />
                  <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </g>
              )
            })}
            {hover !== null ? (
              <line x1={x(hover)} x2={x(hover)} y1="0" y2={H} stroke="var(--color-border-primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            ) : null}
          </svg>

          {hover !== null
            ? series.map((s, si) => (
                <span
                  key={s.name}
                  aria-hidden="true"
                  className="pointer-events-none absolute size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    left: `${(x(hover) / W) * 100}%`,
                    top: y(s.values[hover] ?? 0),
                    backgroundColor: s.color ?? PALETTE[si % PALETTE.length],
                  }}
                />
              ))
            : null}

          {hover !== null ? (
            <div
              role="status"
              className="pointer-events-none absolute top-1/2 flex w-[120px] flex-col gap-[7px] rounded-host-md border-[length:var(--border-width-regular,0.5px)] border-host-border-tertiary bg-host-bg/90 p-2 backdrop-blur-[2px]"
              style={
                x(hover) / W > 0.7
                  ? { right: `calc(${100 - (x(hover) / W) * 100}% + 10px)` }
                  : { left: `calc(${(x(hover) / W) * 100}% + 10px)` }
              }
            >
              {series.map((s, si) => (
                <span key={s.name} className="flex items-center gap-[7px] text-sm leading-[1.4] font-medium">
                  <span aria-hidden="true" className="h-[3px] w-3 rounded-full" style={{ backgroundColor: s.color ?? PALETTE[si % PALETTE.length] }} />
                  {formatValue(s.values[hover] ?? 0)}
                </span>
              ))}
              <span className="text-xs leading-[1.4] text-host-fg-tertiary">{labels[hover]}</span>
            </div>
          ) : null}

          <div aria-hidden="true" className="relative mt-2 h-[17px] text-xs leading-[1.4] text-host-fg-tertiary">
            {labels.map((l, i) =>
              i % every === 0 && i > 0 && i < labels.length - 1 ? (
                <span key={i} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${(x(i) / W) * 100}%` }}>
                  {l}
                </span>
              ) : null
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {ranges?.length ? (
          <div role="tablist" aria-label="Range" className="flex items-center gap-2 rounded-3xl bg-host-bg-secondary p-1">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={r === current}
                onClick={() => {
                  setActiveRange(r)
                  onRangeChange?.(r)
                }}
                className={cn(
                  "rounded-full px-3 py-[5px] text-xs leading-[1.4]",
                  r === current ? "bg-host-bg text-host-fg-secondary" : "text-host-fg-tertiary hover:text-host-fg"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-4">
          {series.map((s, si) => (
            <span key={s.name} className="flex items-center gap-1.5 text-[10px] leading-[1.4] text-host-fg-secondary">
              <span aria-hidden="true" className="h-[3px] w-2 rounded-full" style={{ backgroundColor: s.color ?? PALETTE[si % PALETTE.length] }} />
              {s.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

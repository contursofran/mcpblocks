"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { DownloadIcon, PauseIcon, PlayIcon, ReloadIcon } from "@/registry/mcpblocks/ui/icons"

export type MediaPlayerProps = {
  title: string
  subtitle?: string
  /** Audio source. Without it the player renders as a static preview. */
  src?: string
  /** Duration in seconds, shown before metadata loads. */
  duration?: number
  /**
   * Waveform peaks between 0 and 1. If omitted, a stable placeholder
   * waveform is generated from the title.
   */
  peaks?: number[]
  onRegenerate?: () => void
  onDownload?: () => void
  className?: string
}

function formatTime(s: number) {
  if (!Number.isFinite(s)) return "0:00"
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, "0")}`
}

function placeholderPeaks(seed: string, n = 64) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const out: number[] = []
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    const r = ((h >>> 0) % 1000) / 1000
    const envelope = 0.35 + 0.65 * Math.sin((i / n) * Math.PI)
    out.push(Math.max(0.12, Math.min(1, r * envelope + 0.1)))
  }
  return out
}

/**
 * Inline audio card with play/pause, waveform scrubber and actions.
 * Matches the "Media card" pattern in the MCP Apps for Claude kit.
 */
export function MediaPlayer({
  title,
  subtitle,
  src,
  duration: initialDuration = 0,
  peaks,
  onRegenerate,
  onDownload,
  className,
}: MediaPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [duration, setDuration] = React.useState(initialDuration)
  const bars = React.useMemo(() => peaks ?? placeholderPeaks(title), [peaks, title])
  const progress = duration > 0 ? time / duration : 0

  function toggle() {
    const a = audioRef.current
    if (!a) return
    if (a.paused) void a.play()
    else a.pause()
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const a = audioRef.current
    if (!a || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    a.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  return (
    <div
      data-slot="media-player"
      className={cn("flex w-full flex-col gap-6 p-6 text-host-fg font-[family-name:var(--font-sans)]", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col text-base leading-[1.4]">
          <span className="truncate font-semibold">{title}</span>
          {subtitle ? <span className="truncate text-host-fg-tertiary">{subtitle}</span> : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {onRegenerate ? (
            <button
              type="button"
              onClick={onRegenerate}
              aria-label="Regenerate"
              className="inline-flex size-11 items-center justify-center rounded-host-md border-[length:var(--border-width-regular,0.5px)] border-host-border text-host-fg hover:bg-host-bg-secondary"
            >
              <ReloadIcon className="size-5" />
            </button>
          ) : null}
          {onDownload ? (
            <button
              type="button"
              onClick={onDownload}
              aria-label="Download"
              className="inline-flex size-11 items-center justify-center rounded-host-md bg-host-bg-inverse text-host-fg-inverse hover:opacity-90"
            >
              <DownloadIcon className="size-5" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          disabled={!src}
          aria-label={playing ? "Pause" : "Play"}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-host-bg-inverse text-host-fg-inverse disabled:cursor-default"
        >
          {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5 translate-x-px" />}
        </button>

        <div
          role="slider"
          tabIndex={0}
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          onClick={seek}
          onKeyDown={(e) => {
            const a = audioRef.current
            if (!a) return
            if (e.key === "ArrowRight") a.currentTime = Math.min(duration, a.currentTime + 5)
            if (e.key === "ArrowLeft") a.currentTime = Math.max(0, a.currentTime - 5)
          }}
          className="flex h-11 min-w-0 flex-1 cursor-pointer items-center gap-[3px] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
        >
          {bars.map((p, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={cn(
                "w-[3px] min-w-[2px] flex-1 rounded-full transition-colors",
                i / bars.length <= progress ? "bg-host-fg" : "bg-host-fg-tertiary/60"
              )}
              style={{ height: `${Math.round(p * 100)}%` }}
            />
          ))}
        </div>

        <span className="min-w-9 shrink-0 text-center text-sm leading-[1.4] text-host-fg-tertiary tabular-nums">
          {formatTime(playing || time > 0 ? time : duration)}
        </span>
      </div>

      {src ? (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      ) : null}
    </div>
  )
}

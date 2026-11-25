import { AppFrame } from "@/components/site/host-preview"
import { ConfirmActionDemo } from "@/components/site/demos"

/**
 * Landing-page hero: a desktop chat window with an MCP App rendered inline.
 * Evokes Claude's chat layout and palette (warm canvas, beige user bubble,
 * serif assistant text) without copying its branding.
 */
type HeroChatProps = {
  title?: string
  prompt?: string
  reply?: string
  app?: string
  children?: React.ReactNode
}

export function HeroChat({
  title = "Lead assignment",
  prompt = "Give Sarah Johnson access to lead assignment.",
  reply = "I found Sarah in your directory. Review the permissions below and confirm to apply them.",
  app = "Leads",
  children = <ConfirmActionDemo />,
}: HeroChatProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-[#1f1e1d]/15 bg-[#faf9f5] font-[family-name:var(--font-sans)] text-[#141413] shadow-[0_24px_48px_-20px_rgba(20,20,19,0.28)] dark:border-white/10 dark:bg-[#262624] dark:text-[#faf9f5]">
      {/* Window title bar */}
      <div className="relative flex h-10 shrink-0 items-center border-b border-[#1f1e1d]/10 px-4 dark:border-white/10">
        <div className="flex gap-2" aria-hidden="true">
          <span className="size-3 rounded-full border border-black/10 bg-[#ff5f57]" />
          <span className="size-3 rounded-full border border-black/10 bg-[#febc2e]" />
          <span className="size-3 rounded-full border border-black/10 bg-[#28c840]" />
        </div>
        <span className="absolute inset-x-0 text-center text-xs text-[#73726c] dark:text-[#a6a39a]">
          {title}
        </span>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-5 pb-4 sm:px-6">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-xl bg-[#f0eee6] px-4 py-2.5 text-sm leading-relaxed dark:bg-[#141413]">
            {prompt}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-serif text-[15px] leading-relaxed">
            {reply}
          </p>
          <AppFrame name={app}>
            {children}
          </AppFrame>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-6" aria-hidden="true">
        <div className="flex items-center justify-between rounded-2xl border border-[#1f1e1d]/15 bg-white px-4 py-3 text-sm text-[#73726c] shadow-[0_4px_16px_-8px_rgba(20,20,19,0.15)] dark:border-white/10 dark:bg-[#30302e] dark:text-[#a6a39a]">
          <span>Reply…</span>
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#c96442] text-base text-white">↑</span>
        </div>
      </div>
    </div>
  )
}

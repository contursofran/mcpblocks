import { AppFrame } from "@/components/site/host-preview"
import { ListViewDemo } from "@/components/site/demos"

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
  icon?: React.ReactNode
  children?: React.ReactNode
}

export function HeroChat({
  title = "Onboarding feedback",
  prompt = "What did the team say about onboarding?",
  reply = "Four threads stand out. The revised flow doubled completion in testing.",
  app = "Slack",
  icon = <SlackLogo />,
  children = <ListViewDemo />,
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
          <AppFrame name={app} icon={icon}>
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

function SlackLogo() {
  return (
    <svg viewBox="0 0 122.8 122.8" className="size-4">
      <path fill="#e01e5a" d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" />
      <path fill="#36c5f0" d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" />
      <path fill="#2eb67d" d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" />
      <path fill="#ecb22e" d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" />
    </svg>
  )
}

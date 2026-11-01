import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { ProviderResult, UsageWindow } from "../rpc"
import { isOverPace, windowPacePercent } from "../pace"
import { usageLevel } from "../tui-layout"
import type { definition } from "./definition"
import { usageState } from "./state"

function worstWindow(provider: ProviderResult): UsageWindow | undefined {
  let worst: UsageWindow | undefined
  for (const window of provider.windows ?? []) {
    if (window.percent == null) continue
    if (!worst || (worst.percent ?? 0) < window.percent) worst = window
  }
  return worst
}

function dotClass(percent: number | null | undefined): string {
  const level = usageLevel(percent)
  if (level === "critical") return "ous-dot ous-bad"
  if (level === "warn") return "ous-dot ous-warn"
  return "ous-dot ous-ok"
}

function shown(percent: number, mode: "used" | "remaining"): number {
  return Math.max(0, Math.min(100, mode === "remaining" ? 100 - percent : percent))
}

/**
 * Provider quota strip for `window.bottom`.
 *
 * One chip per enabled provider: the tightest window's label and share, a bar
 * with its on-pace marker, and the pace percentage when that readout is on.
 * Clicking a chip opens the full panel.
 */
export function ProviderStrip() {
  const ctx = usePlugin<typeof definition>()
  const state = usageState(ctx)
  const mode = createMemo(() => state.settings()?.providerUsageDisplay ?? "used")
  const showPace = () => state.settings()?.showPace ?? false

  const [nowMs, setNowMs] = createSignal(Date.now())
  const ticker = setInterval(() => setNowMs(Date.now()), 1000)
  onCleanup(() => clearInterval(ticker))

  const openPanel = () => {
    const session = ctx.sessions.current()
    if (session) ctx.layout.open(`${ctx.id}:usage`, session)
  }

  return (
    <div class="ous-pstrip">
      <Show
        when={state.providers().length > 0}
        fallback={<span class="ous-pstrip-empty">{ctx.t("providers.empty")}</span>}
      >
        <For each={state.providers()}>
          {(provider) => {
            const window = worstWindow(provider)
            const percent = () => window?.percent ?? null
            const position = () => shown(percent() ?? 0, mode())
            const pace = () => {
              if (!window) return null
              const value = windowPacePercent(window, nowMs())
              if (value == null) return null
              return mode() === "remaining" ? 100 - value : value
            }
            const over = () =>
              window
                ? isOverPace(
                    { percent: window.percent, startsAt: window.startsAt, resetsAt: window.resetsAt },
                    nowMs(),
                  )
                : false
            const meta = () =>
              window == null
                ? provider.status
                : `${window.label} ${Math.round(position())}%`
            return (
              <button class="ous-pchip" type="button" onClick={openPanel} title={provider.status}>
                <span class={dotClass(percent())} />
                <span class="ous-pchip-name">{provider.providerName}</span>
                <Show when={window}>
                  <span class="ous-pchip-track" aria-hidden="true">
                    <span
                      class="ous-pchip-fill"
                      style={{
                        width: `${position()}%`,
                        "background-color":
                          usageLevel(percent()) === "critical"
                            ? "#f85149"
                            : usageLevel(percent()) === "warn"
                              ? "#d29922"
                              : "#3fb950",
                      }}
                    />
                    <Show when={pace() != null}>
                      <span
                        class="ous-pchip-pace"
                        style={{
                          left: `${pace()}%`,
                          "background-color": over() ? "#f85149" : "#3fb950",
                        }}
                      />
                    </Show>
                  </span>
                </Show>
                <span class="ous-pchip-meta">
                  {meta()}
                  <Show when={showPace() && pace() != null}>{` │${Math.round(pace() ?? 0)}%`}</Show>
                </span>
              </button>
            )
          }}
        </For>
      </Show>
    </div>
  )
}

import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { ProviderResult, UsageWindow } from "../rpc"
import { isOverPace, windowPacePercent } from "../pace"
import { DOLLAR_POOL_LABEL } from "../provider-summary"
import { usageLevel } from "../tui-layout"
import type { definition } from "./definition"
import { usageState } from "./state"

function dotClass(percent: number | null | undefined): string {
  const level = usageLevel(percent)
  if (level === "critical") return "ous-dot ous-bad"
  if (level === "warn") return "ous-dot ous-warn"
  return "ous-dot ous-ok"
}

function levelColor(percent: number | null | undefined): string {
  const level = usageLevel(percent)
  if (level === "critical") return "#f85149"
  if (level === "warn") return "#d29922"
  return "#3fb950"
}

function shown(percent: number, mode: "used" | "remaining"): number {
  return Math.max(0, Math.min(100, mode === "remaining" ? 100 - percent : percent))
}

/** The tightest window decides the provider dot; every window is still drawn. */
function worstPercent(provider: ProviderResult): number | null {
  let worst: number | null = null
  for (const window of provider.windows ?? []) {
    if (window.percent == null) continue
    if (worst == null || window.percent > worst) worst = window.percent
  }
  return worst
}

/**
 * Provider quota strip for `window.bottom`.
 *
 * One row per enabled provider, each listing all of its windows: label, bar
 * with the on-pace marker, and the share in the chosen display mode. Clicking
 * a row opens the full panel.
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

  const valueText = (window: UsageWindow): string => {
    const label = window.valueLabel
    if (label && DOLLAR_POOL_LABEL.test(label)) return label
    if (window.percent == null) return label ?? "—"
    const position = `${Math.round(shown(window.percent, mode()))}%`
    return mode() === "remaining" ? `${position} ${ctx.t("providers.left")}` : position
  }

  return (
    <div class="ous-pstrip">
      <Show
        when={state.providers().length > 0}
        fallback={<span class="ous-pstrip-empty">{ctx.t("providers.empty")}</span>}
      >
        <For each={state.providers()}>
          {(provider) => {
            const windows = () => provider.windows ?? []
            const worst = worstPercent(provider)
            return (
              <div class="ous-prow">
                <button class="ous-pname" type="button" onClick={openPanel} title={provider.status}>
                  <span class={dotClass(worst)} />
                  <span class="ous-pname-text">{provider.providerName}</span>
                </button>

                <Show
                  when={windows().length > 0}
                  fallback={<span class="ous-pstatus">{provider.status}</span>}
                >
                  <div class="ous-pwins">
                    <For each={windows()}>
                      {(window) => {
                        const position = () => shown(window.percent ?? 0, mode())
                        const pace = () => {
                          const value = windowPacePercent(window, nowMs())
                          if (value == null) return null
                          return mode() === "remaining" ? 100 - value : value
                        }
                        const over = () =>
                          isOverPace(
                            { percent: window.percent, startsAt: window.startsAt, resetsAt: window.resetsAt },
                            nowMs(),
                          )
                        return (
                          <div class="ous-pwin">
                            <span class="ous-pwin-label">{window.label}</span>
                            <Show when={window.percent != null}>
                              <span class="ous-pwin-track" aria-hidden="true">
                                <span
                                  class="ous-pwin-fill"
                                  style={{
                                    width: `${position()}%`,
                                    "background-color": levelColor(window.percent),
                                  }}
                                />
                                <Show when={pace() != null}>
                                  <span
                                    class="ous-pwin-pace"
                                    title={`${ctx.t("providers.pace")}: ${Math.round(pace() ?? 0)}%`}
                                    style={{
                                      left: `${pace()}%`,
                                      "background-color": over() ? "#f85149" : "#3fb950",
                                    }}
                                  />
                                </Show>
                              </span>
                            </Show>
                            <span class="ous-pwin-meta">{valueText(window)}</span>
                            <Show when={showPace() && pace() != null}>
                              <span class="ous-pwin-pace-label">{`│${Math.round(pace() ?? 0)}%`}</span>
                            </Show>
                          </div>
                        )
                      }}
                    </For>
                  </div>
                </Show>
              </div>
            )
          }}
        </For>
      </Show>
    </div>
  )
}

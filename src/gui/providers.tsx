import { For, Show, createMemo, createSignal, onCleanup } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { ProviderResult, UsageWindow } from "../rpc"
import { isOverPace, windowPacePercent } from "../pace"
import { collapsedSummary, DOLLAR_POOL_LABEL } from "../provider-summary"
import { usageLevel } from "../tui-layout"
import type { definition } from "./definition"
import { usageState } from "./state"

function worstPercent(provider: ProviderResult): number | null {
  let worst: number | null = null
  for (const window of provider.windows ?? []) {
    if (window.percent == null) continue
    if (worst == null || window.percent > worst) worst = window.percent
  }
  return worst
}

function levelColor(percent: number | null): string {
  const level = usageLevel(percent)
  if (level === "critical") return "#f85149"
  if (level === "warn") return "#d29922"
  return "#3fb950"
}

function tone(percent: number | null): string {
  if (percent == null) return "ous-dot ous-muted"
  const level = usageLevel(percent)
  if (level === "critical") return "ous-dot ous-bad"
  if (level === "warn") return "ous-dot ous-warn"
  return "ous-dot ous-ok"
}

function shown(percent: number, mode: "used" | "remaining"): number {
  return Math.max(0, Math.min(100, mode === "remaining" ? 100 - percent : percent))
}

/** Pace position on the displayed axis, or null when the window has no bounds. */
function paceShown(window: UsageWindow, mode: "used" | "remaining", nowMs: number): number | null {
  const pace = windowPacePercent(window, nowMs)
  if (pace == null) return null
  return mode === "remaining" ? 100 - pace : pace
}

function resetLabel(window: UsageWindow, nowMs: number): string | undefined {
  if (!window.resetsAt) return undefined
  const at = Date.parse(window.resetsAt)
  if (!Number.isFinite(at)) return undefined
  const minutes = Math.max(0, Math.round((at - nowMs) / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}

/**
 * Provider quota rows, sourced from the server part over RPC.
 *
 * The renderer never sees a credential; it receives windows, status lines and
 * errors. Collapse state is per model key and shared with the session panel.
 */
export function ProviderUsage() {
  const ctx = usePlugin<typeof definition>()
  const state = usageState(ctx)

  const mode = createMemo(() => state.settings()?.providerUsageDisplay ?? "used")

  // Reset countdowns and the pace marker move every second, like the TUI.
  // This never polls a provider: the data refreshes on its own 2-minute cycle.
  const [nowMs, setNowMs] = createSignal(Date.now())
  const ticker = setInterval(() => setNowMs(Date.now()), 1000)
  onCleanup(() => clearInterval(ticker))

  const collapsed = (key: string) => ctx.stores.view.value.collapsed.includes(`provider:${key}`)

  function toggle(key: string) {
    ctx.stores.view.update((draft) => {
      const id = `provider:${key}`
      const index = draft.collapsed.indexOf(id)
      if (index >= 0) draft.collapsed.splice(index, 1)
      else draft.collapsed.push(id)
    })
  }

  return (
    <div class="ous-providers">
      <div class="ous-line">
        <span class="ous-section">{ctx.t("providers.title")}</span>
        <button
          type="button"
          class="ous-link"
          disabled={state.loading()}
          onClick={() => void state.refresh(true)}
          title={ctx.t("providers.refresh")}
        >
          {state.loading() ? "…" : "↻"}
        </button>
      </div>

      <Show when={state.error()}>
        <div class="ous-line">
          <span class="ous-bad">{ctx.t("providers.error")}</span>
          <span class="ous-muted">{state.error()}</span>
        </div>
      </Show>

      <Show when={state.providers().length > 0} fallback={<div class="ous-empty">{ctx.t("providers.empty")}</div>}>
        <For each={state.providers()}>
          {(provider) => {
            const worst = worstPercent(provider)
            const expandable = (provider.windows?.length ?? 0) > 0
            const open = () => expandable && !collapsed(provider.providerId)
            return (
              <div class="ous-provider">
                <button
                  class="ous-model-head"
                  type="button"
                  disabled={!expandable}
                  onClick={() => {
                    if (expandable) toggle(provider.providerId)
                  }}
                >
                  <span class={tone(worst)} />
                  <span class="ous-model-name">
                    {provider.providerName}
                    <Show when={provider.planLabel}>
                      <span class="ous-plan">{provider.planLabel}</span>
                    </Show>
                  </span>
                  <span class="ous-model-meta">
                    {collapsedSummary(provider.windows, mode()) ?? provider.status}
                    {expandable ? (open() ? " ▾" : " ▸") : ""}
                  </span>
                </button>

                <Show when={open()}>
                  <Show
                    when={(provider.windows?.length ?? 0) > 0}
                    fallback={null}
                  >
                    <For each={provider.windows ?? []}>
                      {(window) => {
                        const position = () => shown(window.percent ?? 0, mode())
                        const pace = () => paceShown(window, mode(), nowMs())
                        const over = () =>
                          isOverPace({
                            percent: window.percent,
                            startsAt: window.startsAt,
                            resetsAt: window.resetsAt,
                          }, nowMs())
                        // Hover swaps the reset suffix for the pace readout,
                        // like the TUI's hover line.
                        const [hover, setHover] = createSignal(false)
                        const paceText = () => (pace() == null ? "" : `│${Math.round(pace() ?? 0)}%`)
                        // The pinned readout and the hover readout are the same
                        // value; never print both.
                        const showPace = () => state.settings()?.showPace ?? false
                        const hoverPace = () => hover() && !showPace() && pace() != null
                        // Percentages follow the display mode; a dollar-pool
                        // label stays as the provider reports it.
                        const valueText = () => {
                          const label = window.valueLabel
                          if (label && DOLLAR_POOL_LABEL.test(label)) return label
                          if (window.percent == null) return label ?? "—"
                          const shown = `${Math.round(position())}%`
                          return mode() === "remaining" ? `${shown} ${ctx.t("providers.left")}` : shown
                        }
                        return (
                          <div
                            class="ous-window"
                            onPointerEnter={() => setHover(true)}
                            onPointerLeave={() => setHover(false)}
                          >
                            <div class="ous-line">
                              <span class="ous-muted">{window.label}</span>
                              <span class="ous-muted">
                                {valueText()}
                                <Show when={showPace() && pace() != null}>
                                  {` ${paceText()}`}
                                </Show>
                                <Show when={hoverPace()}>
                                  {` ${paceText()}`}
                                </Show>
                                <Show when={resetLabel(window, nowMs()) && !hoverPace()}>
                                  {` · ${ctx.t("providers.resets")} ${resetLabel(window, nowMs())}`}
                                </Show>
                              </span>
                            </div>
                            <div class="ous-pbar" aria-hidden="true">
                              <span class="ous-pbar-track">
                                <span
                                  style={{
                                    width: `${position()}%`,
                                    "background-color": levelColor(window.percent),
                                  }}
                                />
                              </span>
                              <Show when={pace() != null}>
                                <span
                                  class="ous-pace"
                                  title={`${ctx.t("providers.pace")}: ${Math.round(pace() ?? 0)}%`}
                                  style={{
                                    left: `${pace()}%`,
                                    "background-color": over() ? "#f85149" : "#3fb950",
                                  }}
                                />
                              </Show>
                            </div>
                          </div>
                        )
                      }}
                    </For>
                  </Show>
                </Show>
              </div>
            )
          }}
        </For>
      </Show>
    </div>
  )
}

import type { PanelProps } from "@opencode/plugin/gui"
import { usePlugin } from "@opencode/plugin/gui"
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js"
import { formatCost, formatDuration, formatTokens } from "../formatter"
import type { PerfSnapshot } from "../rpc"
import type { definition } from "./definition"
import { cacheStat, overhead } from "./usage-data"
import { ProviderUsage } from "./providers"
import { createSessionUsage } from "./session-usage"
import { usageState } from "./state"

function toneClass(rate: number | null, missing: boolean): string {
  if (missing) return "ous-dot ous-missing"
  if (rate == null) return "ous-dot ous-muted"
  if (rate >= 85) return "ous-dot ous-ok"
  if (rate >= 70) return "ous-dot ous-warn"
  return "ous-dot ous-bad"
}

function percent(rate: number | null): string {
  return rate == null ? "—" : `${rate.toFixed(1)}%`
}

function formatTps(value: number | null): string {
  return value == null ? "—" : value.toFixed(1)
}

/**
 * Live usage for the session the panel is mounted on.
 *
 * Data comes from the host's synced store for the session's own server, so the
 * panel works for sessions on any connected server and updates as events land,
 * with no polling and no database access in the renderer.
 */
export function UsagePanel(props: PanelProps) {
  const ctx = usePlugin<typeof definition>()
  const state = usageState(ctx)
  const showPricing = () => state.settings()?.showPricing ?? true
  const showPerformance = () => state.settings()?.showPerformance ?? false

  const data = () => ctx.servers.get(props.session.server.id)?.data

  const usage = createSessionUsage(ctx, () => props.session)
  const family = usage.family
  const rows = usage.rows
  const messageTotals = usage.messageTotals
  const sessionTotals = usage.totals
  const cacheRate = usage.cacheRate
  const extra = createMemo(() => overhead(sessionTotals(), messageTotals()))

  // Performance statistics come from the persisted perf log via the server.
  // Steps still in flight are not on disk yet; they appear once settled.
  const [perf, setPerf] = createSignal<PerfSnapshot>()
  let perfSeq = 0

  async function refreshPerf(): Promise<void> {
    const ids = family()
    if (ids.length === 0) return
    const seq = ++perfSeq
    try {
      const snapshot = await state.perf(ids)
      if (seq === perfSeq) setPerf(snapshot)
    } catch {
      // Optional data: keep the last snapshot when the RPC fails.
    }
  }

  createEffect(() => {
    family()
    void refreshPerf()
  })
  const perfTimer = setInterval(() => void refreshPerf(), 15_000)
  onCleanup(() => clearInterval(perfTimer))

  const perfFor = (key: string) => perf()?.models.find(model => model.key === key)

  const collapsed = (key: string) => ctx.stores.view.value.collapsed.includes(key)

  function toggle(key: string) {
    ctx.stores.view.update((draft) => {
      const index = draft.collapsed.indexOf(key)
      if (index >= 0) draft.collapsed.splice(index, 1)
      else draft.collapsed.push(key)
    })
  }

  return (
    <div class="ous-root">
      <Show when={data()} fallback={<div class="ous-empty">{ctx.t("panel.unavailable")}</div>}>
        <Show when={rows().length > 0} fallback={<div class="ous-empty">{ctx.t("panel.empty")}</div>}>
          <div class="ous-grid">
            <div class="ous-kpi">
              <span class="ous-kpi-value">{formatTokens(sessionTotals().tokens)}</span>
              <span class="ous-kpi-label">{ctx.t("panel.total")}</span>
            </div>
            <div class="ous-kpi">
              <span class="ous-kpi-value">{sessionTotals().requests}</span>
              <span class="ous-kpi-label">{ctx.t("panel.requests")}</span>
            </div>
            <div class="ous-kpi">
              <span class="ous-kpi-value">
                {formatTokens(sessionTotals().input + sessionTotals().cacheWrite)}
              </span>
              <span class="ous-kpi-label">{ctx.t("panel.input")}</span>
            </div>
            <div class="ous-kpi">
              <span class="ous-kpi-value">{formatTokens(sessionTotals().output)}</span>
              <span class="ous-kpi-label">{ctx.t("panel.output")}</span>
            </div>
          </div>

          <div class="ous-line">
            <span class="ous-muted">
              {ctx.t("panel.cache")} {percent(cacheRate())}
            </span>
            <Show when={showPricing() && sessionTotals().cost > 0}>
              <span class="ous-muted">
                {ctx.t("panel.cost")} {formatCost(sessionTotals().cost)}
              </span>
            </Show>
          </div>

          <For each={rows()}>
            {(row) => {
              const stat = cacheStat(row)
              const total = row.input + row.output + row.reasoning + row.cacheRead + row.cacheWrite
              const input = row.input + row.cacheWrite
              const output = row.output + row.reasoning
              const segments = () => {
                const cache = stat.missing ? 0 : row.cacheRead
                const sum = cache + input + output || 1
                return {
                  cache: (cache / sum) * 100,
                  input: (input / sum) * 100,
                  output: (output / sum) * 100,
                }
              }
              return (
                <div class="ous-model">
                  <button class="ous-model-head" onClick={() => toggle(row.key)} type="button">
                    <span class={toneClass(stat.rate, stat.missing)} />
                    <span class="ous-model-name">
                      {row.providerID}/{row.modelID}
                    </span>
                    <span class="ous-model-meta">
                      {collapsed(row.key) ? formatTokens(total) : `×${row.requests}`}
                      {collapsed(row.key) ? " ▸" : " ▾"}
                    </span>
                  </button>

                  <Show when={!collapsed(row.key)}>
                    <div class="ous-bar" aria-hidden="true">
                      <span style={{ width: `${segments().cache}%`, "background-color": "var(--ous-cache)" }} />
                      <span style={{ width: `${segments().input}%`, "background-color": "var(--ous-input)" }} />
                      <span style={{ width: `${segments().output}%`, "background-color": "var(--ous-output)" }} />
                    </div>
                    <div class="ous-line">
                      <span class="ous-muted">
                        {stat.missing ? "MISSING" : percent(stat.rate)}
                      </span>
                      <Show when={showPricing() && row.cost > 0}>
                        <span class="ous-muted">{formatCost(row.cost)}</span>
                      </Show>
                    </div>
                    <div class="ous-details">
                      <div class="ous-kpi">
                        <span class="ous-kpi-value">{formatTokens(total)}</span>
                        <span class="ous-kpi-label">{ctx.t("panel.total")}</span>
                      </div>
                      <div class="ous-kpi">
                        <span class="ous-kpi-value">{formatTokens(input)}</span>
                        <span class="ous-kpi-label">{ctx.t("panel.input")}</span>
                      </div>
                      <div class="ous-kpi">
                        <span class="ous-kpi-value">{formatTokens(row.output)}</span>
                        <span class="ous-kpi-label">{ctx.t("panel.output")}</span>
                      </div>
                    </div>

                    <Show when={showPerformance() && perfFor(row.key)}>
                      {(stats) => (
                        <div class="ous-perf">
                          <span>
                            {ctx.t("panel.ttft")} {formatDuration(stats().avgTTFT)}
                          </span>
                          <span>
                            {formatTps(stats().avgTPS)} {ctx.t("panel.tps")}
                          </span>
                          <span>
                            {ctx.t("panel.latency")} {formatDuration(stats().avgLatency)}
                          </span>
                        </div>
                      )}
                    </Show>
                  </Show>
                </div>
              )
            }}
          </For>

          <Show when={extra().tokens > 0}>
            <div class="ous-foot">
              + {ctx.t("panel.overhead")} · {formatTokens(extra().tokens)}
            </div>
          </Show>
        </Show>
      </Show>

      <ProviderUsage />
    </div>
  )
}

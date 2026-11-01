import type { PanelProps } from "@opencode/plugin/gui"
import { usePlugin } from "@opencode/plugin/gui"
import { createMemo, For, Show } from "solid-js"
import { formatCost, formatTokens } from "../formatter"
import { messageToTokenMessage, type TokenMessage } from "../token-messages"
import type { definition } from "./definition"
import { aggregateModels, cacheStat, overhead, overallCacheRate, sumModels, sumSessions } from "./usage-data"
import { ProviderUsage } from "./providers"
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

  const data = () => ctx.servers.get(props.session.server.id)?.data

  const family = createMemo(() => {
    const store = data()
    const root = props.session.id
    if (!store) return [root]
    const members = store.session.family(root)
    return members.length > 0 ? members : [root]
  })

  const messages = createMemo(() => {
    const store = data()
    if (!store) return [] as TokenMessage[]
    const collected: TokenMessage[] = []
    for (const sessionID of family()) {
      for (const message of store.session.message.list(sessionID)) {
        const tokenMessage = messageToTokenMessage(message, sessionID)
        if (tokenMessage) collected.push(tokenMessage)
      }
    }
    return collected
  })

  const rows = createMemo(() => aggregateModels(messages()))
  const messageTotals = createMemo(() => sumModels(rows()))
  const sessionTotals = createMemo(() => {
    const store = data()
    if (!store) return sumModels(rows())
    const totals = sumSessions(family().map(sessionID => store.session.get(sessionID)))
    totals.requests = messageTotals().requests
    return totals
  })
  const extra = createMemo(() => overhead(sessionTotals(), messageTotals()))
  const cacheRate = createMemo(() => overallCacheRate(rows()))

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

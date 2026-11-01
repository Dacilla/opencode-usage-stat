import type { MountedSession } from "@opencode/plugin/gui"
import { usePlugin } from "@opencode/plugin/gui"
import { Show } from "solid-js"
import { formatCost, formatTokens } from "../formatter"
import type { definition } from "./definition"
import { createSessionUsage } from "./session-usage"
import { usageState } from "./state"

/**
 * The permanent usage readout.
 *
 * Rendered in the session header (default) or as a full-width strip at the
 * bottom of the window. Reads the mounted session from `ctx` when no session is
 * passed in, so the bottom strip follows whatever session is routed.
 */
export function UsageBar(props: { session?: MountedSession }) {
  const ctx = usePlugin<typeof definition>()
  const state = usageState(ctx)
  const usage = createSessionUsage(ctx, () => props.session ?? ctx.sessions.current())

  const showPricing = () => state.settings()?.showPricing ?? true
  const total = () => usage.totals().tokens
  const cache = () => usage.cacheRate()

  const segments = () => {
    const totals = usage.totals()
    const cacheTokens = totals.cacheRead
    const input = totals.input + totals.cacheWrite
    const output = totals.output + totals.reasoning
    const sum = cacheTokens + input + output || 1
    return {
      cache: (cacheTokens / sum) * 100,
      input: (input / sum) * 100,
      output: (output / sum) * 100,
    }
  }

  return (
    <Show when={total() > 0}>
      <div class="ous-uibar">
        <span class="ous-uibar-total" title={ctx.t("panel.total")}>
          {formatTokens(total())}
        </span>
        <span class="ous-uibar-track" aria-hidden="true">
          <span style={{ width: `${segments().cache}%`, "background-color": "var(--ous-cache)" }} />
          <span style={{ width: `${segments().input}%`, "background-color": "var(--ous-input)" }} />
          <span style={{ width: `${segments().output}%`, "background-color": "var(--ous-output)" }} />
        </span>
        <span class="ous-uibar-meta">
          <Show when={cache() != null}>
            {`${(cache() ?? 0).toFixed(0)}% ${ctx.t("panel.cache").toLowerCase()}`}
          </Show>
          <Show when={showPricing() && usage.totals().cost > 0}>
            {` · ${formatCost(usage.totals().cost)}`}
          </Show>
        </span>
      </div>
    </Show>
  )
}

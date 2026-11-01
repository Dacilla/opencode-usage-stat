import { For, Show, createMemo } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { ProviderResult, UsageWindow } from "../rpc"
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

function tone(percent: number | null): string {
  if (percent == null) return "ous-dot ous-muted"
  if (percent >= 90) return "ous-dot ous-bad"
  if (percent >= 70) return "ous-dot ous-warn"
  return "ous-dot ous-ok"
}

function shown(percent: number, mode: "used" | "remaining"): number {
  return Math.max(0, Math.min(100, mode === "remaining" ? 100 - percent : percent))
}

function resetLabel(window: UsageWindow): string | undefined {
  if (!window.resetsAt) return undefined
  const at = Date.parse(window.resetsAt)
  if (!Number.isFinite(at)) return undefined
  const minutes = Math.max(0, Math.round((at - Date.now()) / 60_000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 48) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}

function shortform(provider: ProviderResult, mode: "used" | "remaining"): string {
  const windows = (provider.windows ?? []).filter(window => window.percent != null).slice(0, 2)
  if (windows.length === 0) return provider.status
  return windows
    .map(window => {
      const value = shown(window.percent ?? 0, mode)
      return `${window.label} ${Math.round(value)}%`
    })
    .join(" · ")
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
            const open = () => !collapsed(provider.providerId)
            return (
              <div class="ous-provider">
                <button class="ous-model-head" type="button" onClick={() => toggle(provider.providerId)}>
                  <span class={tone(worst)} />
                  <span class="ous-model-name">{provider.providerName}</span>
                  <span class="ous-model-meta">
                    {shortform(provider, mode())} {open() ? "▾" : "▸"}
                  </span>
                </button>

                <Show when={open()}>
                  <Show
                    when={(provider.windows?.length ?? 0) > 0}
                    fallback={<div class="ous-muted ous-indent">{provider.error ?? provider.status}</div>}
                  >
                    <For each={provider.windows ?? []}>
                      {(window) => (
                        <div class="ous-window">
                          <div class="ous-line">
                            <span class="ous-muted">{window.label}</span>
                            <span class="ous-muted">
                              {window.valueLabel ?? `${window.percent == null ? "—" : `${Math.round(shown(window.percent, mode()))}%`}`}
                              <Show when={resetLabel(window)}>
                                {` · ${ctx.t("providers.resets")} ${resetLabel(window)}`}
                              </Show>
                            </span>
                          </div>
                          <div class="ous-bar" aria-hidden="true">
                            <span
                              style={{
                                width: `${shown(window.percent ?? 0, mode())}%`,
                                "background-color": worst != null && worst >= 90 ? "#f85149" : "var(--ous-cache)",
                              }}
                            />
                          </div>
                        </div>
                      )}
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

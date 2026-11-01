import { For, Show, createSignal } from "solid-js"
import { usePlugin } from "@opencode/plugin/gui"
import type { ReportScope, SettingsPatch } from "../rpc"
import type { definition } from "./definition"
import { usageState } from "./state"

const REPORT_SCOPES: { id: string; scope: ReportScope; label: string }[] = [
  { id: "7d", scope: { kind: "7d" }, label: "7d" },
  { id: "30d", scope: { kind: "30d" }, label: "30d" },
  { id: "all", scope: { kind: "all" }, label: "all" },
]

/**
 * The desktop settings page. Toggles write straight to the server-side store, so
 * the CLI and the desktop always agree on what is on.
 */
export function UsageSettings() {
  const ctx = usePlugin<typeof definition>()
  const state = usageState(ctx)
  const ui = ctx.ui

  const [busy, setBusy] = createSignal<string>()
  const [lastReport, setLastReport] = createSignal<string>()

  const settings = () => state.settings()

  async function patch(update: SettingsPatch) {
    try {
      await state.save(update)
    } catch (error) {
      ctx.toast.show({
        variant: "error",
        title: ctx.t("settings.saveFailed"),
        description: error instanceof Error ? error.message : String(error),
      })
    }
  }

  async function generate(scope: ReportScope) {
    setBusy(scope.kind)
    try {
      const result = await state.report(scope, "html", ctx.sessions.current()?.id)
      setLastReport(result.path)
      ctx.toast.show({
        variant: "success",
        title: ctx.t("settings.reportReady"),
        description: result.path,
        actions: [
          {
            label: ctx.t("settings.open"),
            run: () => void ctx.desktop?.reveal(result.path).then(opened => {
              if (!opened) ctx.system.openExternal(`file://${result.path.replace(/\\/g, "/")}`)
            }),
          },
        ],
      })
    } catch (error) {
      ctx.toast.show({
        variant: "error",
        title: ctx.t("settings.reportFailed"),
        description: error instanceof Error ? error.message : String(error),
      })
    } finally {
      setBusy(undefined)
    }
  }

  return (
    <div class="ous-settings">
      <Show when={settings()} fallback={<ui.Loader size="small" />}>
        {(value) => (
          <>
            <section class="ous-section-block">
              <h3>{ctx.t("settings.display")}</h3>
              <ui.Switch
                label={ctx.t("settings.showPricing")}
                description={ctx.t("settings.showPricingHint")}
                checked={value().showPricing}
                onChange={showPricing => void patch({ showPricing })}
              />
              <ui.Switch
                label={ctx.t("settings.showTrend")}
                checked={value().showTrend}
                onChange={showTrend => void patch({ showTrend })}
              />
              <ui.Switch
                label={ctx.t("settings.showPerformance")}
                checked={value().showPerformance}
                onChange={showPerformance => void patch({ showPerformance })}
              />
              <ui.Switch
                label={ctx.t("settings.showPace")}
                description={ctx.t("settings.showPaceHint")}
                checked={value().showPace}
                onChange={showPace => void patch({ showPace })}
              />
            </section>

            <section class="ous-section-block">
              <h3>{ctx.t("settings.providers")}</h3>
              <ui.Switch
                label={ctx.t("settings.remaining")}
                description={ctx.t("settings.remainingHint")}
                checked={value().providerUsageDisplay === "remaining"}
                onChange={remaining =>
                  void patch({ providerUsageDisplay: remaining ? "remaining" : "used" })
                }
              />
              <Show
                when={state.catalog().length > 0}
                fallback={<p class="ous-muted">{ctx.t("providers.empty")}</p>}
              >
                <For each={state.catalog()}>
                  {provider => (
                    <ui.Switch
                      label={provider.name}
                      checked={provider.enabled}
                      onChange={enabled => void patch({ providerUsage: { [provider.id]: enabled } })}
                    />
                  )}
                </For>
              </Show>
            </section>

            <section class="ous-section-block">
              <h3>{ctx.t("settings.language")}</h3>
              <div class="ous-actions">
                <ui.Button
                  variant={value().language === "auto" ? "contrast" : "neutral"}
                  size="small"
                  onClick={() => void patch({ language: "auto" })}
                >
                  {ctx.t("settings.languageAuto")}
                </ui.Button>
                <ui.Button
                  variant={value().language === "en" ? "contrast" : "neutral"}
                  size="small"
                  onClick={() => void patch({ language: "en" })}
                >
                  English
                </ui.Button>
                <ui.Button
                  variant={value().language === "zh" ? "contrast" : "neutral"}
                  size="small"
                  onClick={() => void patch({ language: "zh" })}
                >
                  中文
                </ui.Button>
              </div>
            </section>

            <section class="ous-section-block">
              <h3>{ctx.t("settings.reports")}</h3>
              <p class="ous-muted">{ctx.t("settings.reportsHint")}</p>
              <div class="ous-actions">
                <For each={REPORT_SCOPES}>
                  {entry => (
                    <ui.Button
                      size="small"
                      busy={busy() === entry.scope.kind}
                      onClick={() => void generate(entry.scope)}
                    >
                      {entry.label}
                    </ui.Button>
                  )}
                </For>
              </div>
              <Show when={lastReport()}>
                {(path) => <code class="ous-path">{path()}</code>}
              </Show>
            </section>
          </>
        )}
      </Show>
    </div>
  )
}

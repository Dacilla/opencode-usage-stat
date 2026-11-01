// gui.tsx - OpenCode Desktop entry (`./gui-experimental`).
//
// The desktop window is a browser renderer: it has no filesystem, no SQLite and
// no credentials. Session usage comes from the host's synced store; settings,
// provider quotas and reports come from the server part over RPC.
import type { SetupContext } from "@opencode/plugin/gui"
import {
  Command,
  ComposerPill,
  MenuItem,
  Panel,
  Plugin,
  SettingsPage,
  Slot,
  Style,
  type PanelTab,
} from "@opencode/plugin/gui"
import type { Data } from "@opencode/client/solid"
import { Show } from "solid-js"
import { formatTokens } from "../src/formatter"
import { messageToTokenMessage, type TokenMessage } from "../src/token-messages"
import type { ReportScope } from "../src/rpc"
import { definition } from "./gui/definition"
import { UsagePanel } from "./gui/panel"
import { UsageSettings } from "./gui/settings"
import { usageState } from "./gui/state"
import { panelCss } from "./gui/style"
import { UsageBar } from "./gui/usage-bar"
import { aggregateModels, overallCacheRate, sumSessions } from "./gui/usage-data"

/** Session-level totals and cache rate for the composer pill, from the synced store. */
function pillLabel(store: Data | undefined, sessionID: string): string | undefined {
  if (!store) return undefined
  const family = store.session.family(sessionID)
  const ids = family.length > 0 ? family : [sessionID]
  const totals = sumSessions(ids.map(id => store.session.get(id)))
  if (totals.tokens <= 0) return undefined
  const messages: TokenMessage[] = []
  for (const id of ids) {
    for (const message of store.session.message.list(id)) {
      const tokenMessage = messageToTokenMessage(message, id)
      if (tokenMessage) messages.push(tokenMessage)
    }
  }
  const rate = overallCacheRate(aggregateModels(messages))
  return `${formatTokens(totals.tokens)}${rate == null ? "" : ` · ${rate.toFixed(0)}%`}`
}

async function buildReport(ctx: SetupContext<typeof definition>, scope: ReportScope, sessionID?: string): Promise<void> {
  const pending = ctx.toast.show({
    variant: "loading",
    title: ctx.t("settings.reportGenerating"),
    persistent: true,
  })
  try {
    const result = await usageState(ctx).report(scope, "html", sessionID)
    pending.dismiss()
    ctx.toast.show({
      variant: "success",
      title: ctx.t("settings.reportReady"),
      description: result.path,
      actions: [
        {
          label: ctx.t("settings.open"),
          run: () => {
            void ctx.desktop?.reveal(result.path).then((opened) => {
              if (!opened) ctx.system.openExternal(`file://${result.path.replace(/\\/g, "/")}`)
            })
          },
        },
      ],
    })
  } catch (error) {
    pending.dismiss()
    ctx.toast.show({
      variant: "error",
      title: ctx.t("settings.reportFailed"),
      description: error instanceof Error ? error.message : String(error),
    })
  }
}

function openPanel(ctx: SetupContext<typeof definition>): void {
  const session = ctx.sessions.current()
  if (!session) {
    ctx.toast.show({ title: ctx.t("command.usage"), description: ctx.t("panel.empty") })
    return
  }
  ctx.layout.open(`${ctx.id}:usage`, session, { background: true })
}

export default Plugin.define({
  ...definition,
  setup(ctx) {
    ctx.add(Style, panelCss)

    const surface = () => usageState(ctx).settings()?.usageSurface ?? "header"

    ctx.add(Slot, {
      at: "session.header",
      order: 30,
      render: input => (
        <Show when={surface() === "header"}>
          <UsageBar session={input.session} />
        </Show>
      ),
    })

    ctx.add(Slot, {
      at: "window.bottom",
      order: 30,
      render: () => (
        <Show when={surface() === "bottom"}>
          <UsageBar wide />
        </Show>
      ),
    })

    const tab: PanelTab = {
      id: "usage",
      get title() {
        return ctx.t("panel.title")
      },
      closable: "compact",
      fallback: true,
    }

    ctx.add(Panel, {
      id: "usage",
      region: "side",
      mobile: {
        get title() {
          return ctx.t("panel.mobile")
        },
        order: 45,
        kind: "menu",
        icon: "window-analytics",
      },
      list: input => (input.open.includes("usage") ? [tab] : []),
      render: props => <UsagePanel session={props.session} screen={props.screen} tab={props.tab} />,
    })

    ctx.add(SettingsPage, {
      id: "usage-stat",
      icon: "sliders",
      get title() {
        return ctx.t("settings.title")
      },
      get entries() {
        return [
          { id: "display", title: ctx.t("settings.display"), keywords: "cost trend performance cache" },
          { id: "providers", title: ctx.t("settings.providers"), keywords: "quota limits usage remaining" },
          { id: "reports", title: ctx.t("settings.reports"), keywords: "html export download" },
        ]
      },
      render: () => <UsageSettings />,
    })

    ctx.add(MenuItem, (): MenuItem => ({
      menu: "session.panel",
      id: "usage",
      title: ctx.t("panel.title"),
      icon: "window-analytics",
      keybind: `${ctx.id}.usage`,
      run: () => openPanel(ctx),
    }))

    ctx.add(Command, (): Command => ({
      id: "usage",
      title: ctx.t("command.usage"),
      description: ctx.t("command.usage.description"),
      keywords: "usage tokens cache cost stats report settings",
      group: ctx.t("command.group"),
      section: "session",
      bind: "mod+shift+u",
      slash: { name: "usage", arguments: true },
      featured: true,
      run: (input) => {
        const argument = (input ?? "").trim().toLowerCase()
        if (argument === "settings" || argument === "config") {
          ctx.layout.settings("usage-stat")
          return
        }
        if (argument === "all" || argument === "0") {
          void buildReport(ctx, { kind: "all" })
          return
        }
        if (/^\d+$/.test(argument)) {
          const days = Number(argument)
          if (days >= 1 && days <= 3650) {
            void buildReport(ctx, { kind: "days", days })
            return
          }
        }
        openPanel(ctx)
      },
    }))

    ctx.add(ComposerPill, {
      id: "usage",
      order: 40,
      show: (input) => {
        if (surface() !== "pill") return undefined
        const store = ctx.servers.get(input.session.server.id)?.data
        const label = pillLabel(store, input.session.id)
        if (!label) return undefined
        return {
          label,
          icon: "window-analytics",
          title: ctx.t("pill.title"),
          run: () => ctx.layout.open(`${ctx.id}:usage`, input.session),
        }
      },
    })

    return () => usageState(ctx).dispose()
  },
})

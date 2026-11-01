// gui.tsx - OpenCode Desktop entry (`./gui-experimental`).
//
// The desktop window is a browser renderer: it has no filesystem, no SQLite and
// no credentials. Everything this part needs is already in the host's synced
// session store, so the panel renders live usage without any I/O. Reporting,
// provider quotas and durability stay in the server part and arrive over RPC.
import {
  ComposerPill,
  Command,
  MenuItem,
  Panel,
  Plugin,
  Style,
  type PanelTab,
} from "@opencode/plugin/gui"
import type { Data } from "@opencode/client/solid"
import { formatTokens } from "../src/formatter"
import { messageToTokenMessage, type TokenMessage } from "../src/token-messages"
import { definition } from "./gui/definition"
import { UsagePanel } from "./gui/panel"
import { panelCss } from "./gui/style"
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

export default Plugin.define({
  ...definition,
  setup(ctx) {
    ctx.add(Style, panelCss)

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
      list: (input) => (input.open.includes("usage") ? [tab] : []),
      render: (props) => <UsagePanel session={props.session} screen={props.screen} tab={props.tab} />,
    })

    ctx.add(MenuItem, (): MenuItem => ({
      menu: "session.panel",
      id: "usage",
      title: ctx.t("panel.title"),
      icon: "window-analytics",
      keybind: `${ctx.id}.usage`,
      run: () => {
        const session = ctx.sessions.current()
        if (session) ctx.layout.open(`${ctx.id}:usage`, session)
      },
    }))

    ctx.add(Command, (): Command => ({
      id: "usage",
      title: ctx.t("command.usage"),
      description: ctx.t("command.usage.description"),
      keywords: "usage tokens cache cost stats report",
      group: ctx.t("command.group"),
      section: "session",
      bind: "mod+shift+u",
      slash: { name: "usage", arguments: true },
      featured: true,
      run: () => {
        const session = ctx.sessions.current()
        if (!session) return
        ctx.layout.open(`${ctx.id}:usage`, session, { background: true })
        ctx.layout.side.toggle(session)
      },
    }))

    ctx.add(ComposerPill, {
      id: "usage",
      order: 40,
      show: (input) => {
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
  },
})

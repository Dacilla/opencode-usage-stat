// gui/state.ts - One RPC-backed store per window.
//
// Settings, the provider catalog and the provider snapshots all live in the
// server part. The window keeps a reactive mirror so the panel, the settings
// page and the command palette agree without passing data around.
import type { SetupContext } from "@opencode/plugin/gui"
import { createSignal, type Accessor } from "solid-js"
import { Usage } from "../rpc"
import type {
  ProviderConfig,
  ProviderResult,
  ReportFormat,
  ReportResult,
  ReportScope,
  Settings,
  SettingsPatch,
} from "../rpc"
import type { definition } from "./definition"

const REFRESH_MS = 120_000

export interface UsageState {
  settings: Accessor<Settings | undefined>
  providers: Accessor<ProviderResult[]>
  catalog: Accessor<ProviderConfig[]>
  loading: Accessor<boolean>
  error: Accessor<string | undefined>
  refresh(force?: boolean): Promise<void>
  save(patch: SettingsPatch): Promise<void>
  report(scope: ReportScope, format: ReportFormat, sessionID?: string): Promise<ReportResult>
  dispose(): void
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

export function createUsageState(ctx: SetupContext<typeof definition>): UsageState {
  const [settings, setSettings] = createSignal<Settings>()
  const [providers, setProviders] = createSignal<ProviderResult[]>([])
  const [catalog, setCatalog] = createSignal<ProviderConfig[]>([])
  const [loading, setLoading] = createSignal(false)
  const [error, setError] = createSignal<string>()

  let disposed = false
  let inFlight: Promise<void> | undefined

  async function load(force: boolean): Promise<void> {
    if (disposed) return
    setLoading(true)
    try {
      // Read the client here: it changes when the server restarts.
      const rpc = ctx.client.rpc(Usage)
      const [nextSettings, nextCatalog] = await Promise.all([rpc.settingsGet({}), rpc.providerConfig({})])
      if (disposed) return
      setSettings(nextSettings)
      setCatalog(nextCatalog)
      const ids = nextCatalog.filter(entry => entry.enabled).map(entry => entry.id)
      const snapshots = ids.length > 0 ? await rpc.providers({ ids, force }) : []
      if (disposed) return
      setProviders(snapshots)
      setError(undefined)
    } catch (cause) {
      if (!disposed) setError(message(cause))
    } finally {
      if (!disposed) setLoading(false)
    }
  }

  function refresh(force = false): Promise<void> {
    // Collapse concurrent refreshes; the panel and the timer often overlap.
    if (inFlight) return inFlight
    inFlight = load(force).finally(() => {
      inFlight = undefined
    })
    return inFlight
  }

  const timer = setInterval(() => void refresh(), REFRESH_MS)
  void refresh()

  return {
    settings,
    providers,
    catalog,
    loading,
    error,
    refresh,
    async save(patch) {
      const next = await ctx.client.rpc(Usage).settingsSet({ patch })
      if (disposed) return
      setSettings(next)
      if (patch.providerUsage) void refresh(true)
    },
    report(scope, format, sessionID) {
      return ctx.client.rpc(Usage).report({ scope, format, sessionID })
    },
    dispose() {
      disposed = true
      clearInterval(timer)
    },
  }
}

let shared: UsageState | undefined

/** The window's single state instance, created on first use. */
export function usageState(ctx: SetupContext<typeof definition>): UsageState {
  shared ??= createUsageState(ctx)
  return shared
}

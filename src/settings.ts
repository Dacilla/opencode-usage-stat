// settings.ts - Shared settings for the TUI, backed by the server store.
//
// The server part owns the values; this module keeps a reactive Solid mirror so
// the existing synchronous reads in the sidebar and dialogs keep working. A
// change made in the desktop app arrives over the `settingsChanged` RPC event,
// and a change made here is written through the same RPC.
//
// The first hydrate also performs the one-shot legacy migration: values still in
// the old "usage-stat-config" TUI storage key seed the server store when the
// server is still at its defaults.
import type { Context } from "@opencode/plugin/tui/context"
import { createStore, type SetStoreFunction } from "solid-js/store"
import { Usage } from "./rpc.js"
import type { SettingsPatch } from "./rpc.js"
import { DEFAULT_SETTINGS, LEGACY_KEY, legacyPatch, optionsToSettings, SETTING_KEYS, type UsageStatSettings } from "./settings-core.js"

export {
  DEFAULT_SETTINGS,
  SETTING_KEYS,
  LEGACY_KEY,
  SETTINGS_KEY,
  optionsToSettings,
  type LanguageSetting,
  type UsageDisplayMode,
  type UsageStatSettings,
} from "./settings-core.js"

type SettingsMutation = (mutation: (draft: UsageStatSettings) => void) => Promise<void>
/** `[reactive values, write-through mutation, first-hydrate promise]`. */
export type SettingsMirror = readonly [UsageStatSettings, SettingsMutation, Promise<void>]
type SettingsStore = SettingsMirror

function readLegacy(context: Context): Partial<UsageStatSettings> {
  try {
    const [legacy] = context.storage.store<Partial<UsageStatSettings>>(LEGACY_KEY, { initial: {} })
    return { ...legacy }
  } catch {
    return {}
  }
}

/**
 * Build a mirror over the server store.
 *
 * Reads are synchronous and reactive; writes go over RPC and reconcile with the
 * server's response. `ready` settles after the first hydrate, including the
 * legacy migration, and never rejects.
 */
export function createSettingsMirror(context: Context): SettingsMirror {
  const [store, setStore] = createStore<UsageStatSettings>({
    ...DEFAULT_SETTINGS,
    providerUsage: {},
    ...optionsToSettings(context.options),
  })

  const apply = (next: UsageStatSettings): void => {
    setStore({
      showPerformance: next.showPerformance,
      showPricing: next.showPricing,
      showTrend: next.showTrend,
      showPace: next.showPace,
      providerUsageDisplay: next.providerUsageDisplay,
      language: next.language,
      providerUsage: { ...next.providerUsage },
    })
  }

  const ready = (async () => {
    try {
      const rpc = context.client.rpc(Usage)
      const remote = await rpc.settingsGet({})
      const patch = legacyPatch(remote, readLegacy(context))
      const next = Object.keys(patch).length > 0 ? await rpc.settingsSet({ patch }) : remote
      apply(next)
      rpc.events.on("settingsChanged", event => apply(event.data))
    } catch (error) {
      // Keep the option-seeded defaults; the next mutation retries the write.
      console.warn("[opencode-usage-stat] settings sync unavailable:", error)
    }
  })()

  const mutate: SettingsMutation = async (mutation) => {
    const draft: UsageStatSettings = { ...store }
    mutation(draft)

    const patch: SettingsPatch = {}
    for (const key of SETTING_KEYS) {
      if (draft[key] !== store[key]) (patch as Record<string, unknown>)[key] = draft[key]
    }
    if (JSON.stringify(draft.providerUsage) !== JSON.stringify(store.providerUsage)) {
      patch.providerUsage = { ...draft.providerUsage }
    }
    if (Object.keys(patch).length === 0) return

    apply(draft)
    try {
      const next = await context.client.rpc(Usage).settingsSet({ patch })
      apply(next)
    } catch (error) {
      console.warn("[opencode-usage-stat] settings write failed:", error)
    }
  }

  return [store, mutate, ready] as const
}

let shared: SettingsMirror | null = null

/**
 * The TUI's single settings mirror. Reads stay synchronous and reactive; writes
 * go to the server and reconcile with its response.
 */
export function getSettingsStore(context: Context): SettingsStore {
  shared ??= createSettingsMirror(context)
  return shared
}

/** Kept for callers that used the old migration hook; hydration does it once. */
export async function migrateLegacySettings(context: Context): Promise<void> {
  const [, , ready] = getSettingsStore(context)
  await ready
}

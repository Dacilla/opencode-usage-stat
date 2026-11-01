// settings-core.ts - Settings shape, defaults and option seeding.
//
// Pure: no Solid, no RPC, no filesystem. Shared by the server store, the TUI
// mirror and the desktop state so all three agree on the same fields.
export type UsageDisplayMode = "used" | "remaining"
export type LanguageSetting = "zh" | "en" | "auto"
/** Where the always-on usage readout lives. */
export type UsageSurface = "header" | "bottom" | "pill" | "off"

export interface UsageStatSettings {
  showPerformance: boolean
  showPricing: boolean
  showTrend: boolean
  /** Whether provider usage rows show the pace-marker percentage (`│43%`). */
  showPace: boolean
  /** Whether provider usage percentages show used or remaining quota. */
  providerUsageDisplay: UsageDisplayMode
  language: LanguageSetting
  /** Per-provider overrides; empty falls back to the plugin's `providerUsage` options. */
  providerUsage: Record<string, boolean>
  /** Permanent usage readout placement. */
  usageSurface: UsageSurface
}

export const SETTINGS_KEY = "usage-stat-settings"
export const LEGACY_KEY = "usage-stat-config"

export const DEFAULT_SETTINGS: UsageStatSettings = {
  showPerformance: true,
  showPricing: true,
  showTrend: true,
  // Off by default: at ~31 usable row cells an inline readout makes the reset
  // wrap at a different point per row (Monthly's label is longest), which
  // renders ragged. The pace % is on hover instead; enable in /usage to try it.
  showPace: false,
  providerUsageDisplay: "used",
  language: "auto",
  providerUsage: {},
  usageSurface: "header",
}

/** Seed values from plugin options (`sidebar.*`, `showPace`, `language`, `providerUsageDisplay`). */
export function optionsToSettings(options: unknown): Partial<UsageStatSettings> {
  const out: Partial<UsageStatSettings> = {}
  try {
    const cfg = options && typeof options === "object" ? options as Record<string, any> : {}
    if (cfg?.sidebar && typeof cfg.sidebar === "object") {
      if (typeof cfg.sidebar.showPerformance === "boolean") out.showPerformance = cfg.sidebar.showPerformance
      if (typeof cfg.sidebar.showPricing === "boolean") out.showPricing = cfg.sidebar.showPricing
      if (typeof cfg.sidebar.showTrend === "boolean") out.showTrend = cfg.sidebar.showTrend
    }
    if (typeof cfg?.showPace === "boolean") out.showPace = cfg.showPace
    if (cfg?.language === "zh" || cfg?.language === "en" || cfg?.language === "auto") out.language = cfg.language
    if (cfg?.providerUsageDisplay === "used" || cfg?.providerUsageDisplay === "remaining") {
      out.providerUsageDisplay = cfg.providerUsageDisplay
    }
  } catch { /* defaults */ }
  return out
}

export const SETTING_KEYS = [
  "showPerformance",
  "showPricing",
  "showTrend",
  "showPace",
  "providerUsageDisplay",
  "language",
  "usageSurface",
] as const

/**
 * Values from the old `usage-stat-config` key that should seed the shared store.
 *
 * Only fills fields the server still holds at its default, so a value the user
 * already set (in the TUI or in the desktop) is never overwritten.
 */
export function legacyPatch(
  remote: UsageStatSettings,
  legacy: Partial<UsageStatSettings>,
): Partial<UsageStatSettings> {
  const patch: Partial<UsageStatSettings> = {}
  for (const key of SETTING_KEYS) {
    const value = legacy[key]
    if (value === undefined || value === null) continue
    if (remote[key] !== DEFAULT_SETTINGS[key]) continue
    if (value === remote[key]) continue
    ;(patch as Record<string, unknown>)[key] = value
  }
  return patch
}

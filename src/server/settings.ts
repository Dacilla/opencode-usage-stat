// server/settings.ts - Durable plugin settings owned by the server part.
//
// Both front-ends read the same values, so a preference changed in the desktop
// panel is the one the TUI sees. Plugin options seed the first read; stored
// values win afterwards.
import type { Context } from "@opencode/plugin/promise/plugin"
import { DEFAULT_SETTINGS, optionsToSettings } from "../settings.js"
import type { Settings, SettingsPatch } from "../rpc.js"

const SETTINGS_KEY = "settings"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/** Drop anything that is not a known, correctly typed setting. */
function sanitize(value: unknown): SettingsPatch {
  if (!isRecord(value)) return {}
  const out: SettingsPatch = {}
  for (const key of ["showPerformance", "showPricing", "showTrend", "showPace"] as const) {
    const candidate = value[key]
    if (typeof candidate === "boolean") out[key] = candidate
  }
  if (value.providerUsageDisplay === "used" || value.providerUsageDisplay === "remaining") {
    out.providerUsageDisplay = value.providerUsageDisplay
  }
  if (value.language === "zh" || value.language === "en" || value.language === "auto") {
    out.language = value.language
  }
  if (isRecord(value.providerUsage)) {
    const usage: Record<string, boolean> = {}
    for (const [id, enabled] of Object.entries(value.providerUsage)) {
      if (typeof enabled === "boolean") usage[id] = enabled
    }
    out.providerUsage = usage
  }
  return out
}

export async function readSettings(context: Context): Promise<Settings> {
  const stored = sanitize(await context.storage.get(SETTINGS_KEY).catch(() => undefined))
  return {
    ...DEFAULT_SETTINGS,
    ...optionsToSettings(context.options),
    providerUsage: {},
    ...stored,
  }
}

export async function writeSettings(context: Context, patch: SettingsPatch): Promise<Settings> {
  const next = { ...(await readSettings(context)), ...sanitize(patch) }
  await context.storage.set(SETTINGS_KEY, next)
  return next
}

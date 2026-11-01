// server/providers.ts - Provider quota snapshots, resolved and fetched server-side.
//
// The renderer never sees a credential: it asks for provider ids and receives
// windows, status lines and errors. Results are cached briefly so several open
// windows and the TUI share one poll per provider instead of one per caller.
import { checkProviderUsage, PROVIDERS, resolveProviderUsageConfig, type ProviderId } from "../provider-usage.js"
import type { ProviderConfig, ProviderResult, Settings } from "../rpc.js"

const TTL_MS = 60_000
const CONCURRENCY = 4

const cache = new Map<string, { at: number; ttl: number; value: ProviderResult }>()

async function snapshot(providerId: string): Promise<ProviderResult> {
  try {
    return await checkProviderUsage(providerId as ProviderId)
  } catch (error) {
    return {
      providerId,
      providerName: providerId,
      configured: false,
      ok: false,
      status: `${providerId} — request failed`,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function providerSnapshots(ids: readonly string[], force = false): Promise<ProviderResult[]> {
  const now = Date.now()
  const results = new Map<string, ProviderResult>()
  const pending: string[] = []

  for (const id of ids) {
    const hit = cache.get(id)
    if (!force && hit && now - hit.at < hit.ttl) results.set(id, hit.value)
    else pending.push(id)
  }

  for (let index = 0; index < pending.length; index += CONCURRENCY) {
    const batch = pending.slice(index, index + CONCURRENCY)
    const settled = await Promise.all(batch.map(id => snapshot(id)))
    settled.forEach((value, offset) => {
      const id = batch[offset]!
      // A provider's own Retry-After wins over the default TTL, so a 429 is
      // not re-requested every poll while its window is still open.
      const ttl = value.retryAfterMs != null && value.retryAfterMs > 0
        ? Math.min(value.retryAfterMs, 6 * 60 * 60_000)
        : TTL_MS
      cache.set(id, { at: Date.now(), value, ttl })
      results.set(id, value)
    })
  }

  return ids.map(id => results.get(id)).filter((value): value is ProviderResult => value !== undefined)
}

/** Forget cached snapshots, e.g. after the user disables a provider. */
export function clearProviderCache(): void {
  cache.clear()
}

/**
 * The provider catalog with the effective enabled set: stored overrides win
 * over the plugin's `providerUsage` options, which win over "disabled".
 */
export function providerCatalog(options: unknown, settings: Settings): ProviderConfig[] {
  const configured = resolveProviderUsageConfig(options)
  return PROVIDERS.map(spec => ({
    id: spec.id,
    name: spec.name,
    enabled: settings.providerUsage[spec.id] ?? configured[spec.id] === true,
    available: true,
  }))
}

/** Enabled provider ids, in catalog order. */
export function enabledProviderIds(options: unknown, settings: Settings): string[] {
  return providerCatalog(options, settings).filter(entry => entry.enabled).map(entry => entry.id)
}

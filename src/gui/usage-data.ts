// usage-data.ts - Pure aggregation shared by the desktop panel and pill.
//
// The renderer has no database access, so everything here works on the synced
// session store plus assistant messages the host already holds. Keeping the
// maths pure means it is the same contract the TUI panel and the HTML reports
// use, and it stays unit-testable without a window.
import { cacheHitRate, isMissingCache, totalInputTokens } from "../formatter"
import type { TokenMessage } from "../token-messages"

export interface ModelUsage {
  key: string
  providerID: string
  modelID: string
  /** Uncached input tokens. */
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheWrite: number
  cost: number
  requests: number
  /** Order of the last message, so the newest model sorts first. */
  lastIndex: number
}

export interface UsageTotals {
  input: number
  output: number
  reasoning: number
  cacheRead: number
  cacheWrite: number
  cost: number
  requests: number
  tokens: number
}

export interface CacheStat {
  /** `null` when the model never reported cache activity. */
  rate: number | null
  missing: boolean
}

export function aggregateModels(messages: readonly TokenMessage[]): ModelUsage[] {
  const map = new Map<string, ModelUsage>()
  messages.forEach((message, index) => {
    const key = `${message.providerID}/${message.modelID}`
    let entry = map.get(key)
    if (!entry) {
      entry = {
        key,
        providerID: message.providerID,
        modelID: message.modelID,
        input: 0,
        output: 0,
        reasoning: 0,
        cacheRead: 0,
        cacheWrite: 0,
        cost: 0,
        requests: 0,
        lastIndex: -1,
      }
      map.set(key, entry)
    }
    entry.input += message.inputTokens
    entry.output += message.outputTokens
    entry.reasoning += message.reasoningTokens
    entry.cacheRead += message.cacheRead
    entry.cacheWrite += message.cacheWrite
    entry.cost += message.cost
    entry.requests++
    entry.lastIndex = index
  })
  return Array.from(map.values())
    .filter(entry => entry.input + entry.output + entry.reasoning + entry.cacheRead + entry.cacheWrite > 0)
    .sort((a, b) => b.lastIndex - a.lastIndex)
}

export function sumModels(rows: readonly ModelUsage[]): UsageTotals {
  const totals: UsageTotals = {
    input: 0,
    output: 0,
    reasoning: 0,
    cacheRead: 0,
    cacheWrite: 0,
    cost: 0,
    requests: 0,
    tokens: 0,
  }
  for (const row of rows) {
    totals.input += row.input
    totals.output += row.output
    totals.reasoning += row.reasoning
    totals.cacheRead += row.cacheRead
    totals.cacheWrite += row.cacheWrite
    totals.cost += row.cost
    totals.requests += row.requests
  }
  totals.tokens = totals.input + totals.output + totals.reasoning + totals.cacheRead + totals.cacheWrite
  return totals
}

/** Session-level totals, which include title generation and compaction. */
export interface SessionLike {
  tokens?: {
    input?: number
    output?: number
    reasoning?: number
    cache?: { read?: number; write?: number }
  }
  cost?: number
}

export function sumSessions(sessions: readonly (SessionLike | undefined)[]): UsageTotals {
  const totals: UsageTotals = {
    input: 0,
    output: 0,
    reasoning: 0,
    cacheRead: 0,
    cacheWrite: 0,
    cost: 0,
    requests: 0,
    tokens: 0,
  }
  for (const session of sessions) {
    if (!session) continue
    totals.input += session.tokens?.input ?? 0
    totals.output += session.tokens?.output ?? 0
    totals.reasoning += session.tokens?.reasoning ?? 0
    totals.cacheRead += session.tokens?.cache?.read ?? 0
    totals.cacheWrite += session.tokens?.cache?.write ?? 0
    totals.cost += session.cost ?? 0
  }
  totals.tokens = totals.input + totals.output + totals.reasoning + totals.cacheRead + totals.cacheWrite
  return totals
}

export function cacheStat(row: Pick<ModelUsage, "requests" | "cacheRead" | "cacheWrite" | "input">): CacheStat {
  if (isMissingCache(row.requests, row.cacheRead, row.cacheWrite)) return { rate: null, missing: true }
  const denominator = totalInputTokens(row.input, row.cacheWrite) + row.cacheRead
  if (denominator === 0) return { rate: null, missing: false }
  return { rate: cacheHitRate(row.input, row.cacheRead, row.cacheWrite) * 100, missing: false }
}

export function overallCacheRate(rows: readonly ModelUsage[]): number | null {
  let cached = 0
  let denominator = 0
  for (const row of rows) {
    if (isMissingCache(row.requests, row.cacheRead, row.cacheWrite)) continue
    cached += row.cacheRead
    denominator += totalInputTokens(row.input, row.cacheWrite) + row.cacheRead
  }
  return denominator > 0 ? (cached / denominator) * 100 : null
}

/** Overhead is session-level usage that no assistant message accounts for. */
export function overhead(session: UsageTotals, messages: UsageTotals) {
  return {
    tokens: Math.max(0, session.tokens - messages.tokens),
    cost: Math.max(0, session.cost - messages.cost),
  }
}

// server/perf.ts - Performance snapshots for a session family.
//
// The tracker aggregates by model over whatever entries it is given, so the
// server filters the persisted log by session before aggregating. Entries for
// steps still in flight are not on disk yet; they appear once the step settles,
// which is the same latency the TUI sees after a restart.
import { statSync } from "node:fs"
import { createPerfTracker, perfLogPath, readPerfEntries } from "../perf-tracker.js"
import type { LogEntry } from "../formatter.js"
import type { PerfModel, PerfSnapshot } from "../rpc.js"

interface Cache {
  key: string
  entries: LogEntry[]
}

let cache: Cache | null = null

/** Parsed log entries, re-read only when the file changes. */
function entries(): LogEntry[] {
  try {
    const stat = statSync(perfLogPath())
    const key = `${stat.mtimeMs}:${stat.size}`
    if (cache && cache.key === key) return cache.entries
    const read = readPerfEntries()
    cache = { key, entries: read }
    return read
  } catch {
    return []
  }
}

export function perfSnapshot(sessionIDs: readonly string[]): PerfSnapshot {
  if (sessionIDs.length === 0) return { models: [], samples: 0 }
  const tracker = createPerfTracker()
  tracker.ingestEntries(entries(), sessionIDs)
  const stats = tracker.getSessionStats()

  const models: PerfModel[] = Object.entries(stats.models).map(([key, model]) => ({
    key,
    model: model.model,
    providerID: model.providerID,
    requestCount: model.requestCount,
    avgTTFT: model.avgTTFT,
    p95TTFT: model.p95TTFT,
    avgTPS: model.avgTPS,
    p95TPS: model.p95TPS,
    avgLatency: model.avgLatency,
    p95Latency: model.p95Latency,
  }))

  models.sort((a, b) => b.requestCount - a.requestCount)
  return { models, samples: stats.totals.totalRequests }
}

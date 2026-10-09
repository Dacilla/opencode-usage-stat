import assert from "node:assert/strict"
import { test } from "node:test"
import { formatResetDuration } from "../src/formatter.js"
import {
  parseCodexUsage,
  collapsedSummary,
  windowPacePercent,
  paceMarkerIndex,
  isOverPace,
} from "../src/provider-usage.js"

const now = Date.parse("2026-10-03T12:00:00Z")
const resetIn = (seconds: number): string => new Date(now + seconds * 1000).toISOString()

test("countdowns retain days, hours and minutes instead of rounding to days", () => {
  assert.equal(formatResetDuration(resetIn(4 * 86400 + 3 * 3600 + 12 * 60), now), "4d 3h 12m")
  assert.equal(formatResetDuration(resetIn(3 * 3600 + 12 * 60), now), "3h 12m")
  assert.equal(formatResetDuration(resetIn(49 * 3600), now), "2d 1h")
  assert.equal(formatResetDuration(resetIn(48 * 3600), now), "2d")
  assert.equal(formatResetDuration(resetIn(3600), now), "1h")
  assert.equal(formatResetDuration(resetIn(5 * 60), now), "5m")
})

test("countdowns show seconds near reset and never reset early", () => {
  assert.equal(formatResetDuration(resetIn(59), now), "59s")
  assert.equal(formatResetDuration(resetIn(1), now), "1s")
  assert.equal(formatResetDuration(resetIn(0.1), now), "1s")
  assert.equal(formatResetDuration(resetIn(60), now), "1m")
  assert.equal(formatResetDuration(resetIn(0), now), "now")
  assert.equal(formatResetDuration(resetIn(-1), now), "now")
  assert.equal(formatResetDuration("invalid", now), "invalid")
  assert.equal(formatResetDuration(resetIn(59), now + 1000), "58s")
})

test("Codex preserves both window timestamps, lengths, and fractional usage", () => {
  const windows = parseCodexUsage({
    rate_limit: {
      primary_window: { used_percent: 33.3, limit_window_seconds: 18000, reset_at: (now + 3 * 3600000) / 1000 },
      secondary_window: { used_percent: 12.7, limit_window_seconds: 604800, reset_at: resetIn(4 * 86400 + 3 * 3600 + 12 * 60) },
    },
  })
  assert.deepEqual(windows.map(w => w.label), ["5h", "7d"])
  assert.equal(windows[0].percent, 33.3)
  assert.equal(windows[0].resetsAt, resetIn(3 * 3600))
  assert.equal(windows[0].startsAt, resetIn(-2 * 3600))
  assert.equal(formatResetDuration(windows[1].resetsAt!, now), "4d 3h 12m")
  assert.equal(collapsedSummary(windows, "used"), "33.3%/5h 12.7%/7d")
  assert.equal(collapsedSummary(windows, "remaining"), "66.7%/5h 87.3%/7d")
})

test("pace follows the supplied display clock in both display modes", () => {
  const win = { percent: 60, startsAt: resetIn(0), resetsAt: resetIn(100) }
  assert.equal(windowPacePercent(win, now + 50000), 50)
  assert.equal(paceMarkerIndex(win, "used", 12, now + 25000), 3)
  assert.equal(paceMarkerIndex(win, "remaining", 12, now + 25000), 9)
  assert.equal(isOverPace(win, now + 50000), true)
  assert.equal(isOverPace(win, now + 75000), false)
  assert.equal(windowPacePercent({ resetsAt: win.resetsAt }, now), null)
})

test("collapsed summaries handle zero, full, balance-only, and absent quotas", () => {
  const win = { label: "5h", percent: 0, resetsAt: null, valueLabel: null }
  assert.equal(collapsedSummary([win], "used"), "0.0%/5h")
  assert.equal(collapsedSummary([win], "remaining"), "100.0%/5h")
  assert.equal(collapsedSummary([{ ...win, percent: null, valueLabel: "$1.50" }], "used"), "$1.50")
  assert.equal(collapsedSummary([], "used"), null)
})

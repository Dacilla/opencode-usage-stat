// pace.ts - On-pace budget maths for quota windows.
//
// A window with a known start and reset has an even-pace budget: by `nowMs` the
// window should have spent `(now - start) / (end - start)` of its quota. Bars
// draw a marker there, and the marker turns red once usage passes it.
//
// Pure and dependency-free so the TUI and the desktop renderer compute the same
// position from the same data.

export interface PaceWindow {
  startsAt?: string | null
  resetsAt?: string | null
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value))
}

/**
 * On-pace used percentage (0-100) for a window with known start and reset:
 * the share of the quota even pacing would have spent by `nowMs`.
 * Null when the window bounds are missing or invalid.
 */
export function windowPacePercent(win: PaceWindow, nowMs: number = Date.now()): number | null {
  if (!win.startsAt || !win.resetsAt) return null
  const start = Date.parse(win.startsAt)
  const end = Date.parse(win.resetsAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null
  return clampPercent(((nowMs - start) / (end - start)) * 100)
}

/** True when the window's used share has moved past its even-pace budget. */
export function isOverPace(
  win: PaceWindow & { percent?: number | null },
  nowMs: number = Date.now(),
): boolean {
  const pace = windowPacePercent(win, nowMs)
  return win.percent != null && pace != null && win.percent > pace
}

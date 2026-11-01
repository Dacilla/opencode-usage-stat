// provider-summary.ts - Compact provider summaries shared by both front-ends.
//
// Pure string maths over quota windows: no fetch, no credentials, no filesystem,
// so the desktop renderer and the TUI produce identical labels.

export interface SummaryWindow {
  label: string
  percent: number | null
  valueLabel: string | null
}

export type SummaryMode = "used" | "remaining"

export const DOLLAR_POOL_LABEL = /^\s*\$[\d,.]+\s*\/\s*\$[\d,.]+\s*left\s*$/

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value)
  return null
}

/** Remaining dollars from a dollar-pool value label, null when not one. */
export function dollarPoolRemaining(valueLabel: string | null): number | null {
  if (!valueLabel || !DOLLAR_POOL_LABEL.test(valueLabel)) return null
  return toNumber(valueLabel.match(/\$([\d,.]+)/)?.[1]?.replace(/,/g, ""))
}

/** Compact dollar amount without symbol: "60" / "47.5" / "12.34". */
export function shortDollars(value: number): string {
  return value.toFixed(2).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "")
}

/**
 * One-line summary for a collapsed provider row: `n%/5h m%/7d` when the window
 * labels are recognisable, otherwise a dollar-pool or plain percentage.
 */
export function collapsedSummary<W extends SummaryWindow>(
  windows: readonly W[] | undefined,
  mode: SummaryMode,
): string | null {
  if (!windows || windows.length === 0) return null
  const shown = (win: W): string | null => {
    if (win.percent == null) return null
    return (mode === "remaining" ? 100 - win.percent : win.percent).toFixed(1)
  }
  const isSessionWin = (label: string): boolean => /(^|\b)(5h|session|rolling)\b/i.test(label)
  const isWeeklyWin = (label: string): boolean => /(^|\b)(weekly|7d)\b/i.test(label)
  const session = windows.find(w => isSessionWin(w.label))
  const weekly = windows.find(w => isWeeklyWin(w.label))
  const n = session ? shown(session) : null
  const m = weekly ? shown(weekly) : null
  if (n != null && m != null) return `${n}%/5h ${m}%/7d`
  if (n != null) return `${n}%/5h`
  if (m != null) return `${m}%/7d`
  // Dollar-pool windows (Ollama Cloud new billing): "[percent]%/[credits]$" -
  // remaining mode shows credits left, used mode shows credits spent.
  const pool = windows.find(w => DOLLAR_POOL_LABEL.test(w.valueLabel ?? ""))
  if (pool) {
    const remaining = dollarPoolRemaining(pool.valueLabel)
    const total = toNumber((pool.valueLabel ?? "").match(/\/\s*\$([\d,.]+)/)?.[1]?.replace(/,/g, ""))
    const p = shown(pool)
    if (p != null && remaining != null && total != null) {
      const dollars = mode === "remaining" ? remaining : Math.max(0, total - remaining)
      return `${p}%/${shortDollars(dollars)}$`
    }
  }
  const firstPercent = windows.map(shown).find(v => v != null)
  if (firstPercent != null) return `${firstPercent}%`
  return windows.find(w => w.valueLabel)?.valueLabel ?? null
}

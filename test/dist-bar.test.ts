import { test } from "node:test"
import assert from "node:assert/strict"
import {
  distSegments,
  distBarWidth,
  providerRowLayout,
  providerHeaderFit,
  providerBarWidth,
  PROVIDER_SUFFIX_USED,
  PROVIDER_SUFFIX_REMAINING,
  PROVIDER_SUFFIX_PACE,
  usageLevel,
  percentBar,
  percentBarSmooth,
  solidBar,
  DIST_BAR_MIN,
  PROVIDER_BAR_MIN,
  PROVIDER_BAR_MAX,
} from "../src/tui-layout.js"
import { visualWidth, padEndToWidth } from "../src/text-width.js"

const sum = (s: { cache: number; input: number; output: number }) => s.cache + s.input + s.output

test("distSegments splits by token share and fills the width exactly", () => {
  assert.deepEqual(distSegments({ cacheRead: 50, input: 30, output: 20 }, 10), { cache: 5, input: 3, output: 2 })
  assert.deepEqual(distSegments({ cacheRead: 1, input: 1, output: 1 }, 10), { cache: 4, input: 3, output: 3 })
  assert.deepEqual(distSegments({ cacheRead: 0, input: 0, output: 0 }, 10), { cache: 0, input: 0, output: 0 })
  assert.deepEqual(distSegments({ cacheRead: 5, input: 0, output: 0 }, 8), { cache: 8, input: 0, output: 0 })
})

test("distSegments gives every non-zero category at least one cell", () => {
  const s = distSegments({ cacheRead: 1_000_000, input: 10, output: 5 }, 12)
  assert.equal(s.input, 1)
  assert.equal(s.output, 1)
  assert.equal(s.cache, 10)
  assert.equal(sum(s), 12)
})

test("distSegments with fewer cells than categories keeps the largest", () => {
  assert.deepEqual(distSegments({ cacheRead: 100, input: 50, output: 10 }, 2), { cache: 1, input: 1, output: 0 })
  assert.deepEqual(distSegments({ cacheRead: 100, input: 50, output: 10 }, 0), { cache: 0, input: 0, output: 0 })
})

test("distSegments sums to width across many inputs", () => {
  const samples = [
    [952, 30, 18], [1, 2, 3], [0, 7, 3], [123456, 0, 1], [9, 9, 9999], [0.4, 0.4, 0.2],
  ]
  for (const [cacheRead, input, output] of samples) {
    for (let w = 3; w <= 48; w++) {
      const s = distSegments({ cacheRead, input, output }, w)
      assert.equal(sum(s), w, `w=${w} ${cacheRead}/${input}/${output}`)
      if (cacheRead > 0) assert.ok(s.cache >= 1)
      if (input > 0) assert.ok(s.input >= 1)
      if (output > 0) assert.ok(s.output >= 1)
    }
  }
})

test("distSegments ignores negative and non-finite values", () => {
  assert.deepEqual(distSegments({ cacheRead: -5, input: Number.NaN, output: 10 }, 6), { cache: 0, input: 0, output: 6 })
})

// Layout insets mirrored from sidebar.tsx / provider-usage-blocks.tsx.
const MODEL_ROW = (panel: number) => panel - 4
const PROVIDER_HEADER = (panel: number) => panel - 4
const PROVIDER_BODY = (panel: number) => panel - 6
const PANEL_WIDTHS = [30, 34, 38, 45, 60, 80]

test("Dist line never exceeds the model row width", () => {
  for (const panel of PANEL_WIDTHS) {
    for (const prefix of ["Dist: ", "分布: "]) {
      for (const suffix of [" 95.2%", " 100.0% ↑12.3%", " 0.0% ↓100.0%", " MISSING", " 9.1%"]) {
        for (const showTrend of [true, false]) {
          const bar = distBarWidth(MODEL_ROW(panel), visualWidth(prefix), suffix, showTrend)
          const line = visualWidth(prefix) + bar + visualWidth(suffix)
          if (MODEL_ROW(panel) - visualWidth(prefix) - visualWidth(suffix) >= DIST_BAR_MIN) {
            assert.ok(line <= MODEL_ROW(panel), `panel=${panel} ${prefix}${suffix} → ${line}`)
          }
        }
      }
    }
  }
  // Wider panels get longer bars than the old fixed budget (panel-4-6-11-7).
  assert.ok(distBarWidth(MODEL_ROW(38), 6, " 95.2%", true) > 38 - 4 - 6 - 11 - 7)
  // Bars of different models stay aligned when suffixes fit the budget.
  assert.equal(distBarWidth(34, 6, " 95.2%", true), distBarWidth(34, 6, " 9.1% ↑0.1%", true))
})

const WINDOW_LABELS = [
  "5h: ", "Weekly: ", "Monthly: ", "Daily: ", "Credits: ", "Extra usage: ", "Session FSC: ", "Account quota: ",
]
const SUFFIXES = [" 100%", " 7%", " 100% left", " 0% left", " 100% 剩余"]
const RESETS: Array<[string, string]> = [
  [" · Resets 6d", " · 6d"], [" · Resets 59m", " · 59m"], [" · 重置 23h", " · 23h"], ["", ""],
]

test("provider percent rows fit at 38/45/60 columns, droid group included", () => {
  for (const panel of [38, 45, 60]) {
    for (const indent of [0, 1]) {
      const width = PROVIDER_BODY(panel) - indent
      for (const label of WINDOW_LABELS) {
        for (const suffix of SUFFIXES) {
          for (const [reset, compact] of RESETS) {
            const r = providerRowLayout(width, label, suffix, reset, compact)
            const line = visualWidth(label) + r.barWidth + visualWidth(suffix) + visualWidth(r.reset)
            assert.ok(r.barWidth >= PROVIDER_BAR_MIN && r.barWidth <= PROVIDER_BAR_MAX)
            assert.ok(line <= width, `panel=${panel} indent=${indent} "${label}${suffix}${reset}" → ${line}/${width}`)
          }
        }
      }
    }
  }
})

test("provider row keeps the full reset text when it fits and drops it last", () => {
  const wide = providerRowLayout(54, "Weekly: ", " 100%", " · Resets 6d", " · 6d")
  assert.equal(wide.reset, " · Resets 6d")
  assert.equal(wide.barWidth, PROVIDER_BAR_MAX)
  // Default 38-column panel: "Weekly: ████████████ 100% · Resets 6d" used to wrap.
  const def = providerRowLayout(32, "Weekly: ", " 100%", " · Resets 6d", " · 6d")
  assert.equal(def.reset, " · Resets 6d")
  assert.equal(visualWidth("Weekly: ") + def.barWidth + 5 + 12, 32)
  const remaining = providerRowLayout(32, "Weekly: ", " 100% left", " · Resets 6d", " · 6d")
  assert.equal(remaining.reset, " · 6d")
  const tiny = providerRowLayout(20, "Weekly: ", " 100% left", " · Resets 6d", " · 6d")
  assert.equal(tiny.reset, "")
})

test("provider header right text is cut by remaining width", () => {
  for (const panel of [38, 45, 60]) {
    const avail = PROVIDER_HEADER(panel)
    for (const name of ["Codex", "MiniMax CN Coding Plan", "GitHub Copilot Add-on", "智谱 Coding Plan"]) {
      for (const right of ["12%/5h 40%/7d", "Unavailable: request timed out after 15s", "刷新中…", "未配置"]) {
        const fit = providerHeaderFit(avail, name, right)
        const line = 2 + visualWidth(fit.name) + 2 + (fit.right ? 1 + visualWidth(fit.right) : 0)
        assert.ok(line <= avail, `panel=${panel} ${name} | ${right} → ${line}/${avail}`)
      }
    }
  }
  assert.deepEqual(providerHeaderFit(34, "Codex", "12%/5h 40%/7d"), { name: "Codex", right: "12%/5h 40%/7d" })
})

test("usageLevel colors by used percent", () => {
  assert.equal(usageLevel(95), "critical")
  assert.equal(usageLevel(90), "critical")
  assert.equal(usageLevel(70), "warn")
  assert.equal(usageLevel(69.9), "ok")
  assert.equal(usageLevel(null), "ok")
  assert.equal(usageLevel(Number.NaN), "ok")
})

test("percentBar fills proportionally", () => {
  assert.equal(percentBar(50, 10), "█████░░░░░")
  assert.equal(percentBar(100, 4), "████")
  assert.equal(percentBar(150, 4), "████")
  assert.equal(percentBar(-5, 4), "░░░░")
})

test("percentBarSmooth renders an eighth-block head cell", () => {
  // 50% of 12 cells = 6.0 exactly -> no head glyph, same as percentBar.
  assert.equal(percentBarSmooth(50, 12), percentBar(50, 12))
  // 4.5% of 12 = 0.54 cells -> 4/8 eighths: a half-cell head.
  assert.equal(percentBarSmooth(4.5, 12), "\u258c" + "\u2591".repeat(11))
  // 8.75% of 12 = 1.05 cells -> 0.4 eighths rounds to 0: plain full cell.
  assert.equal(percentBarSmooth(8.75, 12), "\u2588" + "\u2591".repeat(11))
  // 12.5% of 12 = 1.5 cells -> one full + half.
  assert.equal(percentBarSmooth(12.5, 12), "\u2588\u258c" + "\u2591".repeat(10))
  // 96% of 12 = 11.52 -> 11 full + ~4 eighths (rounds up to a partial head).
  assert.equal(percentBarSmooth(96, 12), "\u2588".repeat(11) + "\u258c")
  // Rounding to a full cell must not overflow the width.
  assert.equal(percentBarSmooth(99.9, 12), "\u2588".repeat(12))
  assert.equal(percentBarSmooth(100, 12), "\u2588".repeat(12))
})

test("percentBarSmooth clamps and keeps the width invariant", () => {
  for (const pct of [-5, 0, 3.3, 12.5, 50, 87.6, 100, 150]) {
    const bar = percentBarSmooth(pct, 12)
    assert.equal(bar.length, 12, `width for ${pct}%`)
    assert.ok(/^[\u2588\u2589\u258a\u258b\u258c\u258d\u258e\u258f\u2591]*$/.test(bar), `glyphs for ${pct}%`)
  }
  assert.equal(percentBarSmooth(50, 0), "")
})

test("opencode-go screenshot rows fit at the 38-column default without wrapping", () => {
  // Regression for: Rolling/Weekly/Monthly wrapped at different points
  // (fixed 12-cell bar + inline pace + always-reset = 39-42 cells in a 32-cell
  // row), splitting bars across lines and hiding the pace line.
  const width = PROVIDER_BODY(38)
  const rows: Array<[string, string, string]> = [
    ["Rolling: ", " 0.0%", " ↻ 4h 36m"],
    ["Weekly: ", " 20.0%", " ↻ 1d 11h"],
    ["Monthly: ", " 10.0%", " ↻ 25d 11h"],
  ]
  for (const [label, suffix, reset] of rows) {
    const r = providerRowLayout(width, label, suffix, reset, "")
    const line = visualWidth(label) + r.barWidth + visualWidth(suffix) + visualWidth(r.reset)
    assert.ok(line <= width, `"${label}${suffix}${reset}" → ${line}/${width}`)
    assert.equal(r.reset, reset, `${label} keeps its countdown at the default width`)
  }
})

test("opencode-go rows with the pace readout still fit by dropping the reset", () => {
  const width = PROVIDER_BODY(38)
  for (const [label, suffix, pace, reset] of [
    ["Rolling: ", " 0.0%", " │8%", " ↻ 4h 36m"],
    ["Weekly: ", " 20.0%", " │79%", " ↻ 1d 11h"],
    ["Monthly: ", " 10.0%", " │18%", " ↻ 25d 11h"],
  ] as Array<[string, string, string, string]>) {
    const r = providerRowLayout(width, label, suffix + pace, reset, "")
    const line = visualWidth(label) + r.barWidth + visualWidth(suffix + pace) + visualWidth(r.reset)
    assert.ok(line <= width, `"${label}${suffix}${pace}${reset}" → ${line}/${width}`)
  }
})

test("provider gutter aligns bars; per-provider width is the max that fits", () => {
  // Labels pad to one gutter ("Monthly: " is widest), so bars start aligned.
  const gutter = Math.max(...["Rolling: ", "Weekly: ", "Monthly: "].map(l => visualWidth(l)))
  assert.equal(gutter, 9)
  for (const raw of ["Rolling: ", "Weekly: ", "Monthly: "]) {
    assert.equal(visualWidth(padEndToWidth(raw, gutter)), gutter)
  }
  // OpenCode Go at the 38 default: 32 - 9 - 7 leaves 16 cells — finer than
  // the old fixed 12, identical for every row of the provider.
  assert.equal(providerBarWidth(PROVIDER_BODY(38), 9, PROVIDER_SUFFIX_USED), 16)
  // Real 42 host panel caps at the 20-cell max (5% steps).
  assert.equal(providerBarWidth(PROVIDER_BODY(42), 9, PROVIDER_SUFFIX_USED), PROVIDER_BAR_MAX)
  // Remaining mode's longer suffix narrows the bar instead of wrapping it.
  assert.equal(providerBarWidth(PROVIDER_BODY(38), 9, PROVIDER_SUFFIX_REMAINING), 11)
  // Pace readout budgeted the same way.
  assert.equal(providerBarWidth(PROVIDER_BODY(38), 9, PROVIDER_SUFFIX_USED + PROVIDER_SUFFIX_PACE), 10)
  // Pathological narrowness floors at the min rather than going negative.
  assert.equal(providerBarWidth(20, 15, PROVIDER_SUFFIX_REMAINING), PROVIDER_BAR_MIN)
  // Line 1 fits by construction wherever the bar isn't floored.
  for (const [panel, g, suffix] of [[38, 9, 7], [42, 9, 7], [38, 9, 12], [42, 15, 12], [38, 9, 13]] as Array<[number, number, number]>) {
    const w = providerBarWidth(PROVIDER_BODY(panel), g, suffix)
    if (w > PROVIDER_BAR_MIN) {
      assert.ok(g + w + suffix <= PROVIDER_BODY(panel), `panel=${panel} gutter=${g} suffix=${suffix} bar=${w}`)
    }
  }
  // Second line (gutter indent + longest reset) always fits.
  assert.ok(gutter + visualWidth("↻ 25d 11h") <= PROVIDER_BODY(38))
})

test("solidBar paints whole cells only: no background-showing glyphs", () => {
  // 0% bar with a pace marker at 0: marker run exists with no fill.
  const empty = solidBar(0, 9, 0)
  assert.deepEqual(empty.map(p => p.kind), ["marker", "empty"])
  assert.equal(empty[0].text, "│")
  // Fill floors to whole cells: 20% of 9 = 1.8 → 1 filled cell, then solid
  // remainder, marker, tail.
  const parts = solidBar(20, 9, 7)
  assert.deepEqual(parts.map(p => p.kind), ["filled", "empty", "marker", "empty"])
  assert.equal(parts[0].text, "█")
  // Sweep: only █ and │ appear at any percent, width, or marker — never a
  // partial, dotted, or blank-showing glyph.
  for (let pct = 0; pct <= 100; pct += 2.5) {
    for (const w of [5, 9, 12, 16, 20]) {
      for (const m of [null, 0, 5, 11, 19]) {
        const glyphs = solidBar(pct, w, m as number | null).map(p => p.text).join("")
        assert.ok(/^[█│]*$/.test(glyphs), `solid glyphs only at ${pct}%/${w}/m=${m}`)
        assert.equal(visualWidth(glyphs), w)
      }
    }
  }
  assert.deepEqual(solidBar(50, 0, null), [])
})

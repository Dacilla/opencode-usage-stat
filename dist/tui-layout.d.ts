export interface DistInput {
    cacheRead: number;
    /** Uncached input + cache write. */
    input: number;
    /** Output + reasoning. */
    output: number;
}
export interface DistSegments {
    cache: number;
    input: number;
    output: number;
}
/**
 * Split `width` cells across cache / input / output by token share using
 * largest-remainder rounding. Every non-zero category gets at least one cell
 * (when width allows), and the sum is exactly `width` whenever any category
 * is non-zero.
 */
export declare function distSegments(data: DistInput, width: number): DistSegments;
export declare const DIST_BAR_MIN = 6;
export declare const DIST_BAR_MAX = 48;
/** " 100.0%" */
export declare const DIST_RATE_BUDGET = 7;
/** " ↑12.3%" */
export declare const DIST_TREND_BUDGET = 7;
/**
 * Dist bar width inside a model block. `contentWidth` is the usable row
 * width, `prefixWidth` the padded "Dist: " label, `suffix` the actual text
 * after the bar (rate/MISSING + trend). A fixed suffix budget keeps bars of
 * different models aligned; a longer real suffix shrinks the bar instead of
 * wrapping.
 */
export declare function distBarWidth(contentWidth: number, prefixWidth: number, suffix: string, showTrend: boolean): number;
export declare const PROVIDER_BAR_MIN = 5;
export declare const PROVIDER_BAR_MAX = 20;
/** Line-1 suffix budgets (worst case) so per-provider bar widths stay stable
 * as numbers change: " 100.0%", " 100.0% left", " │100%". */
export declare const PROVIDER_SUFFIX_USED = 7;
export declare const PROVIDER_SUFFIX_REMAINING = 12;
export declare const PROVIDER_SUFFIX_PACE = 6;
/**
 * Widest bar that fits `label + bar + suffix` into `contentWidth` cells —
 * same for every row of a provider, so bars stay comparable where comparison
 * matters, and as wide as the budget allows (granularity comes from width,
 * since cells are atomic). Clamped to PROVIDER_BAR_MIN..MAX; below the min
 * the caller still renders (wrapMode="none" clips the tail rather than
 * wrapping mid-row).
 */
export declare function providerBarWidth(contentWidth: number, gutterWidth: number, suffixBudget: number): number;
export interface ProviderRowLayout {
    barWidth: number;
    /** Reset suffix to render (may be shortened or "" to make the row fit). */
    reset: string;
}
/**
 * Fit "label + bar + suffix + reset" into `contentWidth` cells. The bar
 * shrinks first; below PROVIDER_BAR_MIN the reset suffix falls back to
 * `compactReset`, then disappears.
 */
export declare function providerRowLayout(contentWidth: number, label: string, suffix: string, reset: string, compactReset: string): ProviderRowLayout;
/**
 * Provider header "● Name ▾" + gap + right text within `available` cells.
 * The right text is cut first; the name only shrinks when it alone is too wide.
 */
export declare function providerHeaderFit(available: number, name: string, right: string): {
    name: string;
    right: string;
};
export type UsageLevel = "ok" | "warn" | "critical";
/** Color level from the *used* percent, regardless of display mode. */
export declare function usageLevel(usedPercent: number | null | undefined): UsageLevel;
export declare function percentBar(percent: number, width: number): string;
/**
 * Bar with eighth-block resolution: the head cell renders a partial glyph
 * instead of flooring to whole cells, so a 12-cell bar expresses 96 steps.
 * Same clamping/width contract as percentBar, so it drops into splitBar and
 * the pace-marker index space unchanged.
 */
export declare function percentBarSmooth(percent: number, width: number): string;
export declare function clamp(value: number, min: number, max: number): number;
export type BarPartKind = "filled" | "empty" | "marker";
export interface BarPart {
    text: string;
    kind: BarPartKind;
}
/**
 * Solid quota bar, whole cells only: every cell paints a full block, so the
 * bar can never show terminal background — no dotted tracks, no partial-head
 * slivers, no exceptions. Fill level is whole-cell floor (the classic
 * progress-bar convention); the exact value always rides alongside in the
 * percent label, and the pace position is a thin │ tick whose cell padding
 * reads as a notch in every color state.
 *
 * Why no eighth-block heads: a partial glyph is paint + background by
 * definition, and those background fractions are precisely the intermittent
 * "blank gaps" (a ▎ head is 75% background). Sub-cell precision and
 * zero-background cells are mutually exclusive in a cell renderer — so
 * precision comes from bar *width* (see providerBarWidth), not fragments.
 */
export declare function solidBar(percent: number, width: number, markerIndex: number | null): BarPart[];

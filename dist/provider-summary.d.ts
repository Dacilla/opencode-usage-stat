export interface SummaryWindow {
    label: string;
    percent: number | null;
    valueLabel: string | null;
}
export type SummaryMode = "used" | "remaining";
export declare const DOLLAR_POOL_LABEL: RegExp;
/** Remaining dollars from a dollar-pool value label, null when not one. */
export declare function dollarPoolRemaining(valueLabel: string | null): number | null;
/** Compact dollar amount without symbol: "60" / "47.5" / "12.34". */
export declare function shortDollars(value: number): string;
/**
 * One-line summary for a collapsed provider row: `n%/5h m%/7d` when the window
 * labels are recognisable, otherwise a dollar-pool or plain percentage.
 */
export declare function collapsedSummary<W extends SummaryWindow>(windows: readonly W[] | undefined, mode: SummaryMode): string | null;

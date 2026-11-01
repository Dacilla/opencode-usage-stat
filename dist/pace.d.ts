export interface PaceWindow {
    startsAt?: string | null;
    resetsAt?: string | null;
}
/**
 * On-pace used percentage (0-100) for a window with known start and reset:
 * the share of the quota even pacing would have spent by `nowMs`.
 * Null when the window bounds are missing or invalid.
 */
export declare function windowPacePercent(win: PaceWindow, nowMs?: number): number | null;
/** True when the window's used share has moved past its even-pace budget. */
export declare function isOverPace(win: PaceWindow & {
    percent?: number | null;
}, nowMs?: number): boolean;

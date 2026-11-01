export type UsageDisplayMode = "used" | "remaining";
export type LanguageSetting = "zh" | "en" | "auto";
export interface UsageStatSettings {
    showPerformance: boolean;
    showPricing: boolean;
    showTrend: boolean;
    /** Whether provider usage rows show the pace-marker percentage (`│43%`). */
    showPace: boolean;
    /** Whether provider usage percentages show used or remaining quota. */
    providerUsageDisplay: UsageDisplayMode;
    language: LanguageSetting;
    /** Per-provider overrides; empty falls back to the plugin's `providerUsage` options. */
    providerUsage: Record<string, boolean>;
}
export declare const SETTINGS_KEY = "usage-stat-settings";
export declare const LEGACY_KEY = "usage-stat-config";
export declare const DEFAULT_SETTINGS: UsageStatSettings;
/** Seed values from plugin options (`sidebar.*`, `showPace`, `language`, `providerUsageDisplay`). */
export declare function optionsToSettings(options: unknown): Partial<UsageStatSettings>;
export declare const SETTING_KEYS: readonly ["showPerformance", "showPricing", "showTrend", "showPace", "providerUsageDisplay", "language"];
/**
 * Values from the old `usage-stat-config` key that should seed the shared store.
 *
 * Only fills fields the server still holds at its default, so a value the user
 * already set (in the TUI or in the desktop) is never overwritten.
 */
export declare function legacyPatch(remote: UsageStatSettings, legacy: Partial<UsageStatSettings>): Partial<UsageStatSettings>;

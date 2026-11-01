import type { Context } from "@opencode/plugin/tui/context";
import { type UsageStatSettings } from "./settings-core.js";
export { DEFAULT_SETTINGS, SETTING_KEYS, LEGACY_KEY, SETTINGS_KEY, optionsToSettings, type LanguageSetting, type UsageDisplayMode, type UsageStatSettings, } from "./settings-core.js";
type SettingsMutation = (mutation: (draft: UsageStatSettings) => void) => Promise<void>;
/** `[reactive values, write-through mutation, first-hydrate promise]`. */
export type SettingsMirror = readonly [UsageStatSettings, SettingsMutation, Promise<void>];
type SettingsStore = SettingsMirror;
/**
 * Build a mirror over the server store.
 *
 * Reads are synchronous and reactive; writes go over RPC and reconcile with the
 * server's response. `ready` settles after the first hydrate, including the
 * legacy migration, and never rejects.
 */
export declare function createSettingsMirror(context: Context): SettingsMirror;
/**
 * The TUI's single settings mirror. Reads stay synchronous and reactive; writes
 * go to the server and reconcile with its response.
 */
export declare function getSettingsStore(context: Context): SettingsStore;
/** Kept for callers that used the old migration hook; hydration does it once. */
export declare function migrateLegacySettings(context: Context): Promise<void>;

import type { ProviderConfig, ProviderResult, Settings } from "../rpc.js";
export declare function providerSnapshots(ids: readonly string[], force?: boolean): Promise<ProviderResult[]>;
/** Forget cached snapshots, e.g. after the user disables a provider. */
export declare function clearProviderCache(): void;
/**
 * The provider catalog with the effective enabled set: stored overrides win
 * over the plugin's `providerUsage` options, which win over "disabled".
 */
export declare function providerCatalog(options: unknown, settings: Settings): ProviderConfig[];
/** Enabled provider ids, in catalog order. */
export declare function enabledProviderIds(options: unknown, settings: Settings): string[];

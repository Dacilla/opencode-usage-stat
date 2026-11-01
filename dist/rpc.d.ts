import { z } from "zod";
export declare const SettingsSchema: z.ZodObject<{
    showPerformance: z.ZodBoolean;
    showPricing: z.ZodBoolean;
    showTrend: z.ZodBoolean;
    showPace: z.ZodBoolean;
    providerUsageDisplay: z.ZodEnum<{
        remaining: "remaining";
        used: "used";
    }>;
    language: z.ZodEnum<{
        auto: "auto";
        en: "en";
        zh: "zh";
    }>;
    providerUsage: z.ZodRecord<z.ZodString, z.ZodBoolean>;
}, z.core.$strip>;
export declare const SettingsPatchSchema: z.ZodObject<{
    showPerformance: z.ZodOptional<z.ZodBoolean>;
    showPricing: z.ZodOptional<z.ZodBoolean>;
    showTrend: z.ZodOptional<z.ZodBoolean>;
    showPace: z.ZodOptional<z.ZodBoolean>;
    providerUsageDisplay: z.ZodOptional<z.ZodEnum<{
        remaining: "remaining";
        used: "used";
    }>>;
    language: z.ZodOptional<z.ZodEnum<{
        auto: "auto";
        en: "en";
        zh: "zh";
    }>>;
    providerUsage: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
}, z.core.$strip>;
export declare const ProviderConfigSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    enabled: z.ZodBoolean;
    available: z.ZodBoolean;
}, z.core.$strip>;
export declare const UsageWindowSchema: z.ZodObject<{
    label: z.ZodString;
    percent: z.ZodNullable<z.ZodNumber>;
    resetsAt: z.ZodNullable<z.ZodString>;
    valueLabel: z.ZodNullable<z.ZodString>;
    startsAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const ProviderResultSchema: z.ZodObject<{
    providerId: z.ZodString;
    providerName: z.ZodString;
    configured: z.ZodBoolean;
    ok: z.ZodBoolean;
    status: z.ZodString;
    error: z.ZodOptional<z.ZodString>;
    windows: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        percent: z.ZodNullable<z.ZodNumber>;
        resetsAt: z.ZodNullable<z.ZodString>;
        valueLabel: z.ZodNullable<z.ZodString>;
        startsAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$strip>>>;
    planLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$strip>;
export declare const ReportScopeSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        "30d": "30d";
        "5h": "5h";
        "7d": "7d";
        all: "all";
        days: "days";
        session: "session";
    }>;
    days: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const ReportFormatSchema: z.ZodEnum<{
    html: "html";
    json: "json";
    text: "text";
}>;
export declare const ReportResultSchema: z.ZodObject<{
    path: z.ZodString;
    format: z.ZodEnum<{
        html: "html";
        json: "json";
        text: "text";
    }>;
    bytes: z.ZodNumber;
    scope: z.ZodObject<{
        kind: z.ZodEnum<{
            "30d": "30d";
            "5h": "5h";
            "7d": "7d";
            all: "all";
            days: "days";
            session: "session";
        }>;
        days: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const PerfModelSchema: z.ZodObject<{
    key: z.ZodString;
    model: z.ZodString;
    providerID: z.ZodString;
    requestCount: z.ZodNumber;
    avgTTFT: z.ZodNullable<z.ZodNumber>;
    p95TTFT: z.ZodNullable<z.ZodNumber>;
    avgTPS: z.ZodNullable<z.ZodNumber>;
    p95TPS: z.ZodNullable<z.ZodNumber>;
    avgLatency: z.ZodNullable<z.ZodNumber>;
    p95Latency: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const PerfSnapshotSchema: z.ZodObject<{
    models: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        model: z.ZodString;
        providerID: z.ZodString;
        requestCount: z.ZodNumber;
        avgTTFT: z.ZodNullable<z.ZodNumber>;
        p95TTFT: z.ZodNullable<z.ZodNumber>;
        avgTPS: z.ZodNullable<z.ZodNumber>;
        p95TPS: z.ZodNullable<z.ZodNumber>;
        avgLatency: z.ZodNullable<z.ZodNumber>;
        p95Latency: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
    samples: z.ZodNumber;
}, z.core.$strip>;
export declare const Usage: {
    readonly id: "opencode-usage-stat";
    readonly methods: {
        /** Current durable settings, seeded from plugin options on first read. */
        settingsGet: {
            input: z.ZodObject<{}, z.core.$strip>;
            output: z.ZodObject<{
                showPerformance: z.ZodBoolean;
                showPricing: z.ZodBoolean;
                showTrend: z.ZodBoolean;
                showPace: z.ZodBoolean;
                providerUsageDisplay: z.ZodEnum<{
                    remaining: "remaining";
                    used: "used";
                }>;
                language: z.ZodEnum<{
                    auto: "auto";
                    en: "en";
                    zh: "zh";
                }>;
                providerUsage: z.ZodRecord<z.ZodString, z.ZodBoolean>;
            }, z.core.$strip>;
        };
        settingsSet: {
            input: z.ZodObject<{
                patch: z.ZodObject<{
                    showPerformance: z.ZodOptional<z.ZodBoolean>;
                    showPricing: z.ZodOptional<z.ZodBoolean>;
                    showTrend: z.ZodOptional<z.ZodBoolean>;
                    showPace: z.ZodOptional<z.ZodBoolean>;
                    providerUsageDisplay: z.ZodOptional<z.ZodEnum<{
                        remaining: "remaining";
                        used: "used";
                    }>>;
                    language: z.ZodOptional<z.ZodEnum<{
                        auto: "auto";
                        en: "en";
                        zh: "zh";
                    }>>;
                    providerUsage: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodBoolean>>;
                }, z.core.$strip>;
            }, z.core.$strip>;
            output: z.ZodObject<{
                showPerformance: z.ZodBoolean;
                showPricing: z.ZodBoolean;
                showTrend: z.ZodBoolean;
                showPace: z.ZodBoolean;
                providerUsageDisplay: z.ZodEnum<{
                    remaining: "remaining";
                    used: "used";
                }>;
                language: z.ZodEnum<{
                    auto: "auto";
                    en: "en";
                    zh: "zh";
                }>;
                providerUsage: z.ZodRecord<z.ZodString, z.ZodBoolean>;
            }, z.core.$strip>;
        };
        /** Provider ids, display names and the effective enabled set. */
        providerConfig: {
            input: z.ZodObject<{}, z.core.$strip>;
            output: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                name: z.ZodString;
                enabled: z.ZodBoolean;
                available: z.ZodBoolean;
            }, z.core.$strip>>;
        };
        /** Provider quota snapshots. Credentials never cross this boundary. */
        providers: {
            input: z.ZodObject<{
                ids: z.ZodArray<z.ZodString>;
                force: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>;
            output: z.ZodArray<z.ZodObject<{
                providerId: z.ZodString;
                providerName: z.ZodString;
                configured: z.ZodBoolean;
                ok: z.ZodBoolean;
                status: z.ZodString;
                error: z.ZodOptional<z.ZodString>;
                windows: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    label: z.ZodString;
                    percent: z.ZodNullable<z.ZodNumber>;
                    resetsAt: z.ZodNullable<z.ZodString>;
                    valueLabel: z.ZodNullable<z.ZodString>;
                    startsAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                }, z.core.$strip>>>;
                planLabel: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            }, z.core.$strip>>;
        };
        /** Build a report on the server and return where it landed. */
        report: {
            input: z.ZodObject<{
                scope: z.ZodObject<{
                    kind: z.ZodEnum<{
                        "30d": "30d";
                        "5h": "5h";
                        "7d": "7d";
                        all: "all";
                        days: "days";
                        session: "session";
                    }>;
                    days: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
                format: z.ZodEnum<{
                    html: "html";
                    json: "json";
                    text: "text";
                }>;
                sessionID: z.ZodOptional<z.ZodString>;
            }, z.core.$strip>;
            output: z.ZodObject<{
                path: z.ZodString;
                format: z.ZodEnum<{
                    html: "html";
                    json: "json";
                    text: "text";
                }>;
                bytes: z.ZodNumber;
                scope: z.ZodObject<{
                    kind: z.ZodEnum<{
                        "30d": "30d";
                        "5h": "5h";
                        "7d": "7d";
                        all: "all";
                        days: "days";
                        session: "session";
                    }>;
                    days: z.ZodOptional<z.ZodNumber>;
                }, z.core.$strip>;
            }, z.core.$strip>;
        };
        /** TTFT/TPS/latency for a session family, from the persisted perf log. */
        perf: {
            input: z.ZodObject<{
                sessionIDs: z.ZodArray<z.ZodString>;
            }, z.core.$strip>;
            output: z.ZodObject<{
                models: z.ZodArray<z.ZodObject<{
                    key: z.ZodString;
                    model: z.ZodString;
                    providerID: z.ZodString;
                    requestCount: z.ZodNumber;
                    avgTTFT: z.ZodNullable<z.ZodNumber>;
                    p95TTFT: z.ZodNullable<z.ZodNumber>;
                    avgTPS: z.ZodNullable<z.ZodNumber>;
                    p95TPS: z.ZodNullable<z.ZodNumber>;
                    avgLatency: z.ZodNullable<z.ZodNumber>;
                    p95Latency: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>>;
                samples: z.ZodNumber;
            }, z.core.$strip>;
        };
    };
    readonly events: {
        reportCreated: {
            schema: z.ZodObject<{
                path: z.ZodString;
                format: z.ZodString;
                scope: z.ZodString;
            }, z.core.$strip>;
        };
        settingsChanged: {
            schema: z.ZodObject<{
                showPerformance: z.ZodBoolean;
                showPricing: z.ZodBoolean;
                showTrend: z.ZodBoolean;
                showPace: z.ZodBoolean;
                providerUsageDisplay: z.ZodEnum<{
                    remaining: "remaining";
                    used: "used";
                }>;
                language: z.ZodEnum<{
                    auto: "auto";
                    en: "en";
                    zh: "zh";
                }>;
                providerUsage: z.ZodRecord<z.ZodString, z.ZodBoolean>;
            }, z.core.$strip>;
        };
    };
};
export type Settings = z.infer<typeof SettingsSchema>;
export type SettingsPatch = z.infer<typeof SettingsPatchSchema>;
export type UsageWindow = z.infer<typeof UsageWindowSchema>;
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>;
export type ProviderResult = z.infer<typeof ProviderResultSchema>;
export type ReportScope = z.infer<typeof ReportScopeSchema>;
export type ReportFormat = z.infer<typeof ReportFormatSchema>;
export type ReportResult = z.infer<typeof ReportResultSchema>;
export type PerfModel = z.infer<typeof PerfModelSchema>;
export type PerfSnapshot = z.infer<typeof PerfSnapshotSchema>;

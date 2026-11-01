// rpc.ts - Typed contract between the server part and every front-end.
//
// The desktop window has no filesystem, no SQLite and no credentials, and the
// TUI should not grow a second copy of the same I/O. Everything durable or
// secret lives in the server part; this contract is the only door to it.
//
// Schemas are Zod (Standard Schema), which the RPC layer decodes on both sides,
// so a shape drift fails loudly instead of producing `undefined` in a panel.
import { Rpc } from "@opencode/plugin/rpc"
import { z } from "zod"

export const SettingsSchema = z.object({
  showPerformance: z.boolean(),
  showPricing: z.boolean(),
  showTrend: z.boolean(),
  showPace: z.boolean(),
  providerUsageDisplay: z.enum(["used", "remaining"]),
  language: z.enum(["zh", "en", "auto"]),
  /** Per-provider overrides; empty falls back to the plugin's `providerUsage` options. */
  providerUsage: z.record(z.string(), z.boolean()),
  /** Where the permanent usage readout lives. */
  usageSurface: z.enum(["header", "bottom", "pill", "off"]),
})

export const SettingsPatchSchema = SettingsSchema.partial()

export const ProviderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  /** False when provider usage is switched off for this location entirely. */
  available: z.boolean(),
})

export const UsageWindowSchema = z.object({
  label: z.string(),
  percent: z.number().nullable(),
  resetsAt: z.string().nullable(),
  valueLabel: z.string().nullable(),
  startsAt: z.string().nullable().optional(),
})

export const ProviderResultSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  configured: z.boolean(),
  ok: z.boolean(),
  status: z.string(),
  error: z.string().optional(),
  windows: z.array(UsageWindowSchema).optional(),
  planLabel: z.string().nullable().optional(),
  /** Suppress polling until this delay elapses (from a provider's Retry-After). */
  retryAfterMs: z.number().optional(),
})

export const ReportScopeSchema = z.object({
  kind: z.enum(["session", "5h", "7d", "30d", "all", "days"]),
  days: z.number().optional(),
})

export const ReportFormatSchema = z.enum(["html", "text", "json"])

export const ReportResultSchema = z.object({
  path: z.string(),
  format: ReportFormatSchema,
  bytes: z.number(),
  scope: ReportScopeSchema,
})

export const PerfModelSchema = z.object({
  key: z.string(),
  model: z.string(),
  providerID: z.string(),
  requestCount: z.number(),
  avgTTFT: z.number().nullable(),
  p95TTFT: z.number().nullable(),
  avgTPS: z.number().nullable(),
  p95TPS: z.number().nullable(),
  avgLatency: z.number().nullable(),
  p95Latency: z.number().nullable(),
})

export const PerfSnapshotSchema = z.object({
  models: z.array(PerfModelSchema),
  samples: z.number(),
})

export const Usage = Rpc.define({
  id: "opencode-usage-stat",
  methods: {
    /** Current durable settings, seeded from plugin options on first read. */
    settingsGet: {
      input: z.object({}),
      output: SettingsSchema,
    },
    settingsSet: {
      input: z.object({ patch: SettingsPatchSchema }),
      output: SettingsSchema,
    },
    /** Provider ids, display names and the effective enabled set. */
    providerConfig: {
      input: z.object({}),
      output: z.array(ProviderConfigSchema),
    },
    /** Provider quota snapshots. Credentials never cross this boundary. */
    providers: {
      input: z.object({
        ids: z.array(z.string()),
        force: z.boolean().optional(),
      }),
      output: z.array(ProviderResultSchema),
    },
    /** Build a report on the server and return where it landed. */
    report: {
      input: z.object({
        scope: ReportScopeSchema,
        format: ReportFormatSchema,
        sessionID: z.string().optional(),
      }),
      output: ReportResultSchema,
    },
    /** TTFT/TPS/latency for a session family, from the persisted perf log. */
    perf: {
      input: z.object({ sessionIDs: z.array(z.string()) }),
      output: PerfSnapshotSchema,
    },
  },
  events: {
    reportCreated: {
      schema: z.object({
        path: z.string(),
        format: z.string(),
        scope: z.string(),
      }),
    },
    settingsChanged: {
      schema: SettingsSchema,
    },
  },
})

export type Settings = z.infer<typeof SettingsSchema>
export type SettingsPatch = z.infer<typeof SettingsPatchSchema>
export type UsageWindow = z.infer<typeof UsageWindowSchema>
export type ProviderConfig = z.infer<typeof ProviderConfigSchema>
export type ProviderResult = z.infer<typeof ProviderResultSchema>
export type ReportScope = z.infer<typeof ReportScopeSchema>
export type ReportFormat = z.infer<typeof ReportFormatSchema>
export type ReportResult = z.infer<typeof ReportResultSchema>
export type PerfModel = z.infer<typeof PerfModelSchema>
export type PerfSnapshot = z.infer<typeof PerfSnapshotSchema>

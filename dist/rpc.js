// src/rpc.ts
import { Rpc } from "@opencode/plugin/rpc";
import { z } from "zod";
var SettingsSchema = z.object({
  showPerformance: z.boolean(),
  showPricing: z.boolean(),
  showTrend: z.boolean(),
  showPace: z.boolean(),
  providerUsageDisplay: z.enum(["used", "remaining"]),
  language: z.enum(["zh", "en", "auto"]),
  /** Per-provider overrides; empty falls back to the plugin's `providerUsage` options. */
  providerUsage: z.record(z.string(), z.boolean())
});
var SettingsPatchSchema = SettingsSchema.partial();
var ProviderConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  /** False when provider usage is switched off for this location entirely. */
  available: z.boolean()
});
var UsageWindowSchema = z.object({
  label: z.string(),
  percent: z.number().nullable(),
  resetsAt: z.string().nullable(),
  valueLabel: z.string().nullable(),
  startsAt: z.string().nullable().optional()
});
var ProviderResultSchema = z.object({
  providerId: z.string(),
  providerName: z.string(),
  configured: z.boolean(),
  ok: z.boolean(),
  status: z.string(),
  error: z.string().optional(),
  windows: z.array(UsageWindowSchema).optional(),
  planLabel: z.string().nullable().optional()
});
var ReportScopeSchema = z.object({
  kind: z.enum(["session", "5h", "7d", "30d", "all", "days"]),
  days: z.number().optional()
});
var ReportFormatSchema = z.enum(["html", "text", "json"]);
var ReportResultSchema = z.object({
  path: z.string(),
  format: ReportFormatSchema,
  bytes: z.number(),
  scope: ReportScopeSchema
});
var PerfModelSchema = z.object({
  key: z.string(),
  model: z.string(),
  providerID: z.string(),
  requestCount: z.number(),
  avgTTFT: z.number().nullable(),
  p95TTFT: z.number().nullable(),
  avgTPS: z.number().nullable(),
  p95TPS: z.number().nullable(),
  avgLatency: z.number().nullable(),
  p95Latency: z.number().nullable()
});
var PerfSnapshotSchema = z.object({
  models: z.array(PerfModelSchema),
  samples: z.number()
});
var Usage = Rpc.define({
  id: "opencode-usage-stat",
  methods: {
    /** Current durable settings, seeded from plugin options on first read. */
    settingsGet: {
      input: z.object({}),
      output: SettingsSchema
    },
    settingsSet: {
      input: z.object({ patch: SettingsPatchSchema }),
      output: SettingsSchema
    },
    /** Provider ids, display names and the effective enabled set. */
    providerConfig: {
      input: z.object({}),
      output: z.array(ProviderConfigSchema)
    },
    /** Provider quota snapshots. Credentials never cross this boundary. */
    providers: {
      input: z.object({
        ids: z.array(z.string()),
        force: z.boolean().optional()
      }),
      output: z.array(ProviderResultSchema)
    },
    /** Build a report on the server and return where it landed. */
    report: {
      input: z.object({
        scope: ReportScopeSchema,
        format: ReportFormatSchema,
        sessionID: z.string().optional()
      }),
      output: ReportResultSchema
    },
    /** TTFT/TPS/latency for a session family, from the persisted perf log. */
    perf: {
      input: z.object({ sessionIDs: z.array(z.string()) }),
      output: PerfSnapshotSchema
    }
  },
  events: {
    reportCreated: {
      schema: z.object({
        path: z.string(),
        format: z.string(),
        scope: z.string()
      })
    },
    settingsChanged: {
      schema: SettingsSchema
    }
  }
});
export {
  PerfModelSchema,
  PerfSnapshotSchema,
  ProviderConfigSchema,
  ProviderResultSchema,
  ReportFormatSchema,
  ReportResultSchema,
  ReportScopeSchema,
  SettingsPatchSchema,
  SettingsSchema,
  Usage,
  UsageWindowSchema
};

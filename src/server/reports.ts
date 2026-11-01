// server/reports.ts - Build and persist usage reports.
//
// Reports are assembled where the data and the disk are: in the server part.
// The front-end only chooses a scope and format, and gets back the path.
import { getSessionReportInput } from "../queries.js"
import { writeReportFile } from "../report-file.js"
import {
  buildCombinedData,
  buildRecentHoursReportData,
  getDateRangeForScope,
  renderPeriodTextReport,
  renderSessionTextReport,
  toPeriodJsonReport,
  toSessionJsonReport,
} from "../report-formats.js"
import { buildSessionReportData, generateSessionUsageHtml } from "../session-usage-html.js"
import { generateTotalUsageHtml } from "../total-usage-html.js"
import type { ReportFormat, ReportResult, ReportScope } from "../rpc.js"

function scopeLabel(scope: ReportScope): string {
  switch (scope.kind) {
    case "session":
      return "current session"
    case "5h":
      return "last 5 hours"
    case "7d":
      return "last 7 days"
    case "30d":
      return "last 30 days"
    case "days":
      return `last ${scope.days ?? 1} days`
    default:
      return "all time"
  }
}

async function sessionReport(sessionID: string, format: ReportFormat): Promise<string> {
  const input = await getSessionReportInput(sessionID)
  const data = await buildSessionReportData(input)
  if (format === "html") return generateSessionUsageHtml(data)
  if (format === "text") return renderSessionTextReport(data)
  return JSON.stringify(toSessionJsonReport(data), null, 2)
}

async function periodReport(scope: ReportScope, format: ReportFormat): Promise<string> {
  const data = scope.kind === "5h"
    ? await buildRecentHoursReportData(undefined, 5)
    : await buildCombinedData(undefined, getDateRangeForScope({ kind: scope.kind, label: scopeLabel(scope), days: scope.days }))
  if (format === "html") return generateTotalUsageHtml(data)
  if (format === "text") return renderPeriodTextReport(data)
  return JSON.stringify(toPeriodJsonReport(data), null, 2)
}

export async function generateReport(
  scope: ReportScope,
  format: ReportFormat,
  sessionID?: string,
): Promise<ReportResult> {
  const content = scope.kind === "session"
    ? await sessionReport(requireSession(sessionID), format)
    : await periodReport(scope, format)
  const extension = format === "text" ? "txt" : format
  const path = writeReportFile(scope.kind, extension, content)
  return { path, format, bytes: content.length, scope }
}

function requireSession(sessionID: string | undefined): string {
  if (!sessionID) throw new Error("No session selected")
  return sessionID
}

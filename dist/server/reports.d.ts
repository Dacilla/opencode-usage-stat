import type { ReportFormat, ReportResult, ReportScope } from "../rpc.js";
export declare function generateReport(scope: ReportScope, format: ReportFormat, sessionID?: string): Promise<ReportResult>;

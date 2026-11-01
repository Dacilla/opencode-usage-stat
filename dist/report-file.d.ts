export declare const REPORT_PREFIX = "usage-stat-";
export declare const MAX_REPORTS = 50;
export type ReportExtension = "html" | "txt" | "json";
export declare function ensureReportDir(): string;
export declare function cleanupOldReports(dir: string): void;
export declare function dateTimeStamp(now?: Date): string;
/** Write a report and return its absolute path. */
export declare function writeReportFile(kind: string, ext: ReportExtension, content: string): string;
/** Open a local file in the platform's default handler. */
export declare function openInBrowser(filePath: string): void;

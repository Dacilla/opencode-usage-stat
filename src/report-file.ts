// report-file.ts - Report filesystem helpers shared by every front-end.
//
// Reports live outside the plugin so users keep them across plugin updates:
// `~/.opencode/reports/usage-stat-<kind>-<stamp>.<ext>`, newest 50 retained.
// Only the server part and the TUI call this; the desktop renderer has no fs.
import { execSync, spawn } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

export const REPORT_PREFIX = "usage-stat-"
export const MAX_REPORTS = 50

export type ReportExtension = "html" | "txt" | "json"

export function ensureReportDir(): string {
  const dir = join(homedir(), ".opencode", "reports")
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

export function cleanupOldReports(dir: string): void {
  try {
    const files = readdirSync(dir)
      .filter(file => file.startsWith(REPORT_PREFIX) && /\.(html|txt|json)$/.test(file))
      .map(file => ({ path: join(dir, file), mtime: statSync(join(dir, file)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime)
    for (const file of files.slice(MAX_REPORTS)) {
      try {
        unlinkSync(file.path)
      } catch {
        // Another process may have rotated it already.
      }
    }
  } catch {
    // A missing or unreadable directory is not worth failing a report over.
  }
}

export function dateTimeStamp(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
}

/** Write a report and return its absolute path. */
export function writeReportFile(kind: string, ext: ReportExtension, content: string): string {
  const dir = ensureReportDir()
  const filePath = join(dir, `${REPORT_PREFIX}${kind}-${dateTimeStamp()}.${ext}`)
  writeFileSync(filePath, content, "utf-8")
  cleanupOldReports(dir)
  return filePath
}

/** Open a local file in the platform's default handler. */
export function openInBrowser(filePath: string): void {
  try {
    const platform = process.platform
    if (platform === "win32") {
      try {
        spawn("explorer.exe", [filePath], { detached: true, stdio: "ignore" }).unref()
        return
      } catch {
        // Fall through to `start`.
      }
      try {
        execSync(`start "" "${filePath}"`, { timeout: 5000 })
      } catch {
        // Ignore.
      }
    } else if (platform === "darwin") {
      execSync(`open "${filePath}"`, { timeout: 5000 })
    } else {
      execSync(`xdg-open "${filePath}"`, { timeout: 5000 })
    }
  } catch {
    // Opening is best-effort; the caller still has the path.
  }
}

// server.ts - OpenCode V2 plugin server entry.
//
// The server part owns everything that touches the machine: settings, provider
// credentials and fetches, report files, and the aggregation client. The TUI and
// the desktop GUI are front-ends that render what this part returns.
//
// The unified /usage slash stays registered in the front-end layers (TUI keymap,
// GUI command) so it is intercepted locally and never sent to the LLM.
import { define } from "@opencode/plugin/promise/plugin"
import type { Context } from "@opencode/plugin/promise/plugin"
import { setV2Client } from "./queries.js"
import { Usage } from "./rpc.js"
import { providerSnapshots, providerCatalog } from "./server/providers.js"
import { generateReport } from "./server/reports.js"
import { readSettings, writeSettings } from "./server/settings.js"
import { createUsageClient } from "./server/usage-client.js"

export async function setup(context: Context): Promise<() => Promise<void>> {
  setV2Client(createUsageClient(context))

  const registration = await context.rpc.register(Usage, {
    settingsGet: async () => readSettings(context),
    settingsSet: async ({ patch }) => writeSettings(context, patch),
    providerConfig: async () => providerCatalog(context.options, await readSettings(context)),
    providers: async ({ ids, force }) => providerSnapshots(ids, force === true),
    report: async ({ scope, format, sessionID }) => generateReport(scope, format, sessionID),
  })

  return async () => {
    await registration.dispose()
  }
}

const plugin = define({
  id: "opencode-usage-stat",
  setup,
})

export default plugin

export type { Context }

// server.ts - OpenCode V2 plugin server entry.
//
// Uses the official V2 API: `import { define } from "@opencode/plugin/promise/plugin"`
// and `define({ id, setup })`. The package also ships a TUI part (./tui) and a
// GUI part (./gui-experimental); the host discovers them from package exports.
// The unified /usage slash is registered only in the front-end layers (TUI
// keymap, GUI command) so it is intercepted locally and never sent to the LLM.

import { define } from "@opencode/plugin/promise/plugin"
import type { Context } from "@opencode/plugin/promise/plugin"

export async function setup(_context: Context): Promise<void> {
  // No server-command templates are registered here: the TUI registers the
  // keymap slash /usage locally and those stale "empty" command entries caused
  // empty messages to be sent to the LLM and duplicated slash completion.
}

const plugin = define({
  id: "opencode-usage-stat",
  setup,
})

export default plugin

export type { Context }

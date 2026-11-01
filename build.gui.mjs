// build.gui.mjs - Build the desktop (GUI) part.
//
// `@opencode/plugin/gui/vite` emits one CommonJS file with every dependency
// inlined except the modules the app provides. The local development plugin
// directory has no package.json exports, so the host looks for
// `local-plugin/gui-experimental.cjs`; we copy the bundle there as well.
import { build } from "vite"
import { copyFile, mkdir } from "node:fs/promises"

await build()

await mkdir("local-plugin", { recursive: true })
await copyFile("dist/gui-experimental.cjs", "local-plugin/gui-experimental.cjs")

console.log("V vite: dist/gui-experimental.cjs + local-plugin/gui-experimental.cjs")

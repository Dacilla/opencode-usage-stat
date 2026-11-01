import { build } from "esbuild"
import { readdir } from "node:fs/promises"

/**
 * Bundle each test/*.test.ts -> dist-test/*.test.mjs with esbuild so we can run
 * `node --test dist-test` (TS sources are bundled; node builtins stay external).
 *
 * Every *.test.ts in test/ is picked up, so a new test file cannot be silently
 * skipped.
 */

const external = [
  "@opencode/plugin",
  "@opencode/plugin/*",
  "@opencode/client",
  "@opencode/client/*",
  "@opencode/theme",
  "@opencode/theme/*",
  "@opentui/core",
  "@opentui/core/*",
  "@opentui/solid",
  "@opentui/solid/*",
  "solid-js",
  "solid-js/*",
  "zod",
]

const files = (await readdir("test"))
  .filter(file => file.endsWith(".test.ts"))
  .map(file => `test/${file}`)

await Promise.all(
  files.map(file => {
    const name = file.split("/").pop().replace(/\.test\.ts$/, "")
    return build({
      bundle: true,
      platform: "node",
      format: "esm",
      target: "es2022",
      external,
      logLevel: "info",
      entryPoints: [file],
      outfile: `dist-test/${name}.test.mjs`,
    })
  }),
)

console.log(`✓ esbuild: ${files.length} test files -> dist-test/*.test.mjs`)

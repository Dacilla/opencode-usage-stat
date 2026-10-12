import { build } from "esbuild"
import { readFile } from "node:fs/promises"
import { transformAsync } from "@babel/core"
import ts from "@babel/preset-typescript"
import solid from "babel-preset-solid"

/**
 * Bundle render-harness/render.tsx -> dist-render/render.mjs with the same
 * Babel Solid universal preset the host uses (see build.tui.mjs).
 * OpenTUI/Solid/opencode packages stay external and load from node_modules
 * at runtime, where @opentui/core/testing provides the test renderer.
 */

const external = [
  "solid-js",
  "solid-js/*",
  "@opentui/solid",
  "@opentui/solid/*",
  "@opentui/core",
  "@opentui/core/*",
  "@opencode-ai/client",
  "@opencode-ai/client/*",
  "@opencode-ai/plugin",
  "@opencode-ai/plugin/*",
  "@opencode-ai/theme",
  "@opencode-ai/theme/*",
]

const solidUniversalPlugin = {
  name: "solid-universal",
  setup(build) {
    build.onLoad({ filter: /\.tsx$/ }, async (args) => {
      const code = await readFile(args.path, "utf8")
      const result = await transformAsync(code, {
        filename: args.path,
        configFile: false,
        babelrc: false,
        presets: [
          [solid, { moduleName: "@opentui/solid", generate: "universal" }],
          [ts],
        ],
      })
      return { contents: result.code, loader: "js" }
    })
  },
}

await build({
  bundle: true,
  platform: "node",
  format: "esm",
  target: "es2022",
  external,
  logLevel: "info",
  entryPoints: ["render-harness/render.tsx"],
  outfile: "dist-render/render.mjs",
  plugins: [solidUniversalPlugin],
  banner: { js: "/** @jsxImportSource @opentui/solid */" },
})

console.log("✓ esbuild: render-harness -> dist-render/render.mjs")

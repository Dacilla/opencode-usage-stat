import { defineConfig } from "vite"
import { gui } from "@opencode/plugin/gui/vite"

// Compiles the desktop part into one CommonJS bundle. The app provides
// solid-js, effect and @opencode/* at runtime, so the preset keeps them
// external and inlines everything else.
export default defineConfig({
  plugins: [gui({ entry: "src/gui.tsx", outFile: "dist/gui-experimental.cjs" })],
})

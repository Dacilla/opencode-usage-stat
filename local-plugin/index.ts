// Local development entrypoint for OpenCode V2.
// Re-exports the built server plugin so a local plugin directory can be
// configured directly (opencode.json -> "plugins": [".../local-plugin"]).
export { default } from "../dist/server.js"

// node_modules/@opencode/plugin/dist/promise/plugin.js
function define(plugin2) {
  return plugin2;
}

// src/server.ts
async function setup(_context) {
}
var plugin = define({
  id: "opencode-usage-stat",
  setup
});
var server_default = plugin;
export {
  server_default as default,
  setup
};

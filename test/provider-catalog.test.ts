// provider-catalog.test.ts - Effective provider set shared by both front-ends.
import { test } from "node:test"
import assert from "node:assert/strict"
import { providerCatalog } from "../src/server/providers.js"
import { DEFAULT_SETTINGS } from "../src/settings-core.js"
import type { Settings } from "../src/rpc.js"

function settings(overrides: Record<string, boolean> = {}): Settings {
  return { ...DEFAULT_SETTINGS, providerUsage: overrides }
}

test("options enable providers when there is no override", () => {
  const catalog = providerCatalog({ providerUsage: { "opencode-go": true, codex: true } }, settings())
  assert.equal(catalog.find(entry => entry.id === "opencode-go")?.enabled, true)
  assert.equal(catalog.find(entry => entry.id === "codex")?.enabled, true)
  assert.equal(catalog.find(entry => entry.id === "deepseek")?.enabled, false)
})

test("a stored override wins over the config option in both directions", () => {
  const catalog = providerCatalog(
    { providerUsage: { codex: true, deepseek: true } },
    settings({ codex: false, deepseek: true }),
  )
  assert.equal(catalog.find(entry => entry.id === "codex")?.enabled, false)
  assert.equal(catalog.find(entry => entry.id === "deepseek")?.enabled, true)
})

test("the catalog covers every provider with a name and stable order", () => {
  const catalog = providerCatalog({}, settings())
  assert.ok(catalog.length > 10)
  assert.equal(new Set(catalog.map(entry => entry.id)).size, catalog.length)
  assert.ok(catalog.every(entry => entry.name.length > 0 && entry.available))
})

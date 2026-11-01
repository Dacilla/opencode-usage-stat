// settings.test.ts - Pure and fake-client tests for the shared settings mirror.
//
// The server owns the values now, so these exercise three things without a host
// or a disk: seeding from legacy storage, write-through of a mutation as a
// minimal patch, and applying a `settingsChanged` event.
import { test } from "node:test"
import assert from "node:assert/strict"
import type { Settings as SharedSettings, SettingsPatch } from "../src/rpc.js"
import { createSettingsMirror, DEFAULT_SETTINGS, LEGACY_KEY, optionsToSettings } from "../src/settings.js"

const base: SharedSettings = { ...DEFAULT_SETTINGS, providerUsage: {} }

function fakeContext(options: { remote?: Partial<SharedSettings>; legacy?: Record<string, unknown> } = {}) {
  const remote: SharedSettings = { ...base, ...options.remote }
  const patches: SettingsPatch[] = []
  const listeners: ((event: { data: SharedSettings }) => void)[] = []

  const client = {
    rpc: () => ({
      settingsGet: async () => ({ ...remote }),
      settingsSet: async ({ patch }: { patch: SettingsPatch }) => {
        patches.push(patch)
        Object.assign(remote, patch)
        const snapshot = { ...remote }
        listeners.forEach(listener => listener({ data: snapshot }))
        return snapshot
      },
      events: {
        on: (_name: string, handler: (event: { data: SharedSettings }) => void) => {
          listeners.push(handler)
          return () => {}
        },
      },
    }),
  }

  return {
    context: {
      options: {},
      client,
      storage: {
        store: (key: string, opts: { initial: Record<string, unknown> }) =>
          [key === LEGACY_KEY ? options.legacy ?? opts.initial : opts.initial, async () => {}] as const,
      },
    } as unknown as import("@opencode/plugin/tui/context").Context,
    patches,
    remote,
    emit: (next: SharedSettings) => listeners.forEach(listener => listener({ data: next })),
  }
}

test("hydrate adopts the server values", async () => {
  const { context } = fakeContext({ remote: { showTrend: false, language: "zh" } })
  const [settings, , ready] = createSettingsMirror(context)
  await ready
  assert.equal(settings.showTrend, false)
  assert.equal(settings.language, "zh")
  assert.equal(settings.showPricing, DEFAULT_SETTINGS.showPricing)
})

test("legacy values seed the server only where it is still at its default", async () => {
  const { context, patches } = fakeContext({
    legacy: { language: "zh", showTrend: false },
    // The user already turned pricing off in the desktop; the legacy file must not win.
    remote: { showPricing: false },
  })
  const [, , ready] = createSettingsMirror(context)
  await ready
  assert.deepEqual(patches, [{ language: "zh", showTrend: false }])
})

test("no legacy patch is written when everything already matches", async () => {
  const { context, patches } = fakeContext({ legacy: { language: "auto" } })
  const [, , ready] = createSettingsMirror(context)
  await ready
  assert.equal(patches.length, 0)
})

test("a mutation writes only the changed fields", async () => {
  const { context, patches } = fakeContext()
  const [settings, mutate, ready] = createSettingsMirror(context)
  await ready
  await mutate(draft => {
    draft.showPace = true
  })
  assert.deepEqual(patches, [{ showPace: true }])
  assert.equal(settings.showPace, true)
})

test("a no-op mutation does not call the server", async () => {
  const { context, patches } = fakeContext()
  const [, mutate, ready] = createSettingsMirror(context)
  await ready
  await mutate(() => {})
  assert.equal(patches.length, 0)
})

test("a settingsChanged event updates the mirror", async () => {
  const { context, emit } = fakeContext()
  const [settings, , ready] = createSettingsMirror(context)
  await ready
  emit({ ...base, providerUsageDisplay: "remaining", language: "zh" })
  assert.equal(settings.providerUsageDisplay, "remaining")
  assert.equal(settings.language, "zh")
})

test("settings sync tolerates a server without the RPC", async () => {
  const context = {
    options: {},
    client: {
      rpc: () => {
        throw new Error("rpc unavailable")
      },
    },
    storage: { store: () => [{}, async () => {}] },
  } as unknown as import("@opencode/plugin/tui/context").Context
  const [settings, , ready] = createSettingsMirror(context)
  await assert.doesNotReject(ready)
  assert.equal(settings.showPerformance, DEFAULT_SETTINGS.showPerformance)
})

test("options seed the first paint", () => {
  assert.deepEqual(optionsToSettings({ sidebar: { showTrend: false }, language: "en" }), {
    showTrend: false,
    language: "en",
  })
})

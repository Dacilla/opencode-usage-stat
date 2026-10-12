/** @jsxImportSource @opentui/solid */
import { testRender } from "@opentui/solid"
import { ProviderUsageBlocks } from "../src/provider-usage-blocks.jsx"

/**
 * Headless render harness for the provider usage blocks.
 * Renders the REAL component with canned provider data through OpenTUI's
 * documented test renderer and prints the exact character frame, so layout
 * (wrapping, alignment, markers) can be inspected without eyeballing the TUI.
 *
 * Usage: HARNESS_PANEL=38 node dist-render/render.mjs
 */

// Canned OpenCode Go payload mirroring the reported screenshot:
// Rolling ~0%, Weekly ~20%, Monthly ~10%, each with a reset in the future
// so pace markers resolve (low / high / mid pace respectively).
const now = Date.now()
const iso = (ms: number) => new Date(ms).toISOString()
const H = 3600 * 1000
const usage = {
  rolling: { percent: 0.0, resetsAt: iso(now + (4 * 60 + 29) * 60 * 1000) },
  weekly: { percent: 20.0, resetsAt: iso(now + 35 * H) },
  monthly: { percent: 10.0, resetsAt: iso(now + (25 * 24 + 11) * H) },
}

process.env.OPENCODE_GO_API_KEY = "harness-key"

globalThis.fetch = (async (input: any) => {
  const url = String(typeof input === "string" ? input : input?.url)
  if (url.includes("/zen/go/v1/usage")) {
    return new Response(JSON.stringify({ usage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
  throw new Error("harness: unexpected fetch " + url)
}) as any

function makeContext(): any {
  const stores = new Map<string, any>()
  const storage = {
    store(key: string, opts: { initial: any }) {
      if (!stores.has(key)) {
        // Start expanded so the rows under test actually render.
        const seed = key.includes("collapse") ? { "opencode-go": false } : opts.initial
        stores.set(key, JSON.parse(JSON.stringify(seed)))
      }
      const value = stores.get(key)
      return [value, async (fn: (d: any) => void) => { fn(value) }]
    },
  }
  const location = { directory: "harness", workspaceID: "harness" }
  const mode = process.env.HARNESS_MODE === "remaining" ? "remaining" : "used"
  const options: any = { providerUsage: { "opencode-go": true } }
  if (mode !== "used") options.providerUsageDisplay = mode
  return {
    options,
    theme: {},
    client: {},
    location,
    data: {
      on: () => () => {},
      session: { get: () => undefined, family: () => [] },
      location: { default: () => location },
    },
    storage,
  }
}

const PANEL = Number(process.env.HARNESS_PANEL ?? 38)

const setup = await testRender(
  () => (
    <box width={PANEL} border={true} borderStyle="rounded" flexDirection="column">
      <ProviderUsageBlocks context={makeContext()} sessionID={""} panelWidth={PANEL} />
    </box>
  ),
  { width: PANEL + 2, height: 30 },
)

const deadline = Date.now() + 15000
let frame = ""
for (;;) {
  await setup.renderOnce()
  frame = setup.captureCharFrame()
  if (frame.includes("Weekly") || Date.now() > deadline) break
  await new Promise(r => setTimeout(r, 50))
}
// Let the bar tween and countdown tick settle, then capture the final frame.
await new Promise(r => setTimeout(r, 700))
await setup.renderOnce()
frame = setup.captureCharFrame()

const lines = frame.split("\n")
console.log(`--- panel=${PANEL} rows=${lines.length} ---`)
for (let i = 0; i < lines.length; i++) {
  console.log(`${String(i).padStart(2, "0")}|${lines[i]}|`)
}

function checkSpans(tag: string): void {
  const spans = setup.captureSpans()
  let rollingFlat = ""
  let dotted = 0
  let nonzeroBg = 0
  for (let i = 0; i < spans.lines.length; i++) {
    for (const s of spans.lines[i].spans) {
      if (JSON.stringify((s as any).bg) !== '{"buffer":{"0":0,"1":0,"2":0,"3":0}}') nonzeroBg++
      if (s.text.includes("░")) dotted++
    }
    const flat = spans.lines[i].spans.map(s => s.text).join("")
    if (flat.includes("Rolling")) rollingFlat = flat
  }
  console.log(`--- [${tag}] rolling=${JSON.stringify(rollingFlat)} dotted-cells=${dotted} nonzero-bg-spans=${nonzeroBg}`)
}

checkSpans("steady")

// Hover the Rolling bar row: the second line must swap to the concise pace
// number only — quick and checkable, never wrapped or truncated.
await setup.mockMouse.moveTo(15, 3)
await setup.flush()
await setup.renderOnce()
const hoverFrame = setup.captureCharFrame()
const hoverLines = hoverFrame.split("\n")
console.log(`--- hover frame ---`)
for (let i = 0; i < hoverLines.length; i++) {
  console.log(`${String(i).padStart(2, "0")}|${hoverLines[i]}|`)
}
const paceLine = hoverLines.find(l => /│\d+%/.test(l) && !/Rolling|Weekly|Monthly/.test(l))
console.log(`--- hover pace line=${JSON.stringify(paceLine)} reset-hidden=${!hoverLines.some(l => l.includes("↻ 4h"))} ---`)

// Move away: reset line returns.
await setup.mockMouse.moveTo(0, 29)
await setup.flush()
await setup.renderOnce()
const backFrame = setup.captureCharFrame()
console.log(`--- unhover restores reset=${backFrame.includes("↻ 4h")} ---`)

if (process.env.HARNESS_DUMP === "spans") {
  const spans = setup.captureSpans()
  for (let i = 0; i < spans.lines.length; i++) {
    const line = spans.lines[i]
    const flat = line.spans.map(s => s.text).join("")
    if (!/Rolling|Weekly|Monthly|↻/.test(flat)) continue
    console.log(`--- spans row ${i}: ${JSON.stringify(flat)}`)
    for (const s of line.spans) {
      const codes = [...s.text].map(c => "U+" + (c.codePointAt(0) ?? 0).toString(16).toUpperCase()).join(" ")
      console.log(`  kind text=${JSON.stringify(s.text)} codes=[${codes}] fg=${JSON.stringify(s.fg)} bg=${JSON.stringify(s.bg)} attr=${s.attributes} w=${s.width}`)
    }
  }
}
process.exit(0)

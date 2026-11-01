// session-usage.ts - One aggregation for every surface that shows usage.
//
// The panel, the header bar and the bottom strip all need the same numbers for
// the mounted session family. Building them in one place keeps the three in
// agreement and means a new surface costs only markup.
import type { MountedSession, SetupContext } from "@opencode/plugin/gui"
import type { Data } from "@opencode/client/solid"
import { createMemo } from "solid-js"
import { messageToTokenMessage, type TokenMessage } from "../token-messages"
import type { definition } from "./definition"
import {
  aggregateModels,
  overallCacheRate,
  sumModels,
  sumSessions,
  type ModelUsage,
  type UsageTotals,
} from "./usage-data"

export interface SessionUsage {
  /** The synced store of the session's own server, undefined until it loads. */
  data: () => Data | undefined
  family: () => string[]
  rows: () => ModelUsage[]
  messageTotals: () => UsageTotals
  totals: () => UsageTotals
  cacheRate: () => number | null
}

export function createSessionUsage(
  ctx: SetupContext<typeof definition>,
  session: () => MountedSession | undefined,
): SessionUsage {
  const data = () => {
    const current = session()
    return current ? ctx.servers.get(current.server.id)?.data : undefined
  }

  const family = createMemo(() => {
    const current = session()
    if (!current) return [] as string[]
    const store = data()
    if (!store) return [current.id]
    const members = store.session.family(current.id)
    return members.length > 0 ? members : [current.id]
  })

  const messages = createMemo(() => {
    const store = data()
    if (!store) return [] as TokenMessage[]
    const collected: TokenMessage[] = []
    for (const sessionID of family()) {
      for (const message of store.session.message.list(sessionID)) {
        const tokenMessage = messageToTokenMessage(message, sessionID)
        if (tokenMessage) collected.push(tokenMessage)
      }
    }
    return collected
  })

  const rows = createMemo(() => aggregateModels(messages()))
  const messageTotals = createMemo(() => sumModels(rows()))
  const totals = createMemo(() => {
    const store = data()
    if (!store) return sumModels(rows())
    const summed = sumSessions(family().map(sessionID => store.session.get(sessionID)))
    summed.requests = messageTotals().requests
    return summed
  })
  const cacheRate = createMemo(() => overallCacheRate(rows()))

  return { data, family, rows, messageTotals, totals, cacheRate }
}

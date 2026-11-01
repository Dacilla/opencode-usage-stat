// server/usage-client.ts - The aggregation layer's view of the server context.
//
// `queries.ts` asks for a tiny client (session list/get, message list). The
// server's session domain answers the same questions, and `context` returns a
// session's whole transcript in one call, so no cursor loop is needed there.
import type { Context } from "@opencode/plugin/promise/plugin"
import type { UsageClient } from "../queries.js"

export function createUsageClient(context: Context): UsageClient {
  return {
    session: {
      list: input => context.session.list(input),
      get: input => context.session.get(input),
    },
    message: {
      list: async ({ sessionID }) => ({ data: await context.session.context({ sessionID }) }),
    },
  }
}

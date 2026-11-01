import { Plugin, Store } from "@opencode/plugin/gui"
import { Schema } from "effect"

/**
 * Declarations are read by the host before any setup runs, so stores are
 * available synchronously in `setup` and in every component.
 */
export const definition = Plugin.define({
  stores: {
    view: Store.global(
      Schema.Struct({
        collapsed: Schema.Array(Schema.String),
        showCost: Schema.Boolean,
      }),
      { collapsed: [], showCost: true },
    ),
  },
  i18n: {
    en: {
      "command.usage": "Usage Stat",
      "command.usage.description": "Open the live token, cache and cost panel",
      "command.group": "Usage",
      "panel.title": "Usage",
      "panel.mobile": "Usage",
      "panel.total": "Total",
      "panel.requests": "Requests",
      "panel.input": "Input",
      "panel.output": "Output",
      "panel.cost": "Cost",
      "panel.cache": "Cache",
      "panel.overhead": "Includes title, compaction and other non-message usage",
      "panel.empty": "No usage recorded in this session yet.",
      "panel.unavailable": "Usage data is not available for this server.",
      "pill.title": "Session usage",
    },
    zh: {
      "command.usage": "用量统计",
      "command.usage.description": "打开实时 Token、缓存与费用面板",
      "command.group": "用量",
      "panel.title": "用量",
      "panel.mobile": "用量",
      "panel.total": "总计",
      "panel.requests": "请求",
      "panel.input": "输入",
      "panel.output": "输出",
      "panel.cost": "费用",
      "panel.cache": "缓存",
      "panel.overhead": "包含标题生成、压缩等其他用量",
      "panel.empty": "此会话尚无用量记录。",
      "panel.unavailable": "该服务端暂不提供用量数据。",
      "pill.title": "会话用量",
    },
  },
})

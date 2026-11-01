import type { Context } from "@opencode/plugin/promise/plugin";
export declare function setup(context: Context): Promise<() => Promise<void>>;
declare const plugin: import("@opencode/plugin/promise/plugin").Plugin;
export default plugin;
export type { Context };

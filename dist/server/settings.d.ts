import type { Context } from "@opencode/plugin/promise/plugin";
import type { Settings, SettingsPatch } from "../rpc.js";
export declare function readSettings(context: Context): Promise<Settings>;
export declare function writeSettings(context: Context, patch: SettingsPatch): Promise<Settings>;

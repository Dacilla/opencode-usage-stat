// theme-map.ts - Map the V2 ResolvedTheme to the semantic colors the panel uses.
//
// The 2.2.x theme schema replaced the flat `text.default` / `text.subdued`
// names with `text.base` / `text.muted` / `text.faint`, and reduced the hue set
// to accent / interactive / neutral. Distribution segments follow the theme's
// own hues at the same step as the success colour, so they stay legible in both
// light and dark themes.
import type { ResolvedTheme, SemanticHue } from "@opencode/theme/tui"
import { RGBA } from "@opentui/core"

export interface ThemeColorMap {
  primary: RGBA
  muted: RGBA
  dim: RGBA
  green: RGBA
  red: RGBA
  amber: RGBA
  purple: RGBA
  cyan: RGBA
  border: RGBA
  /** Dist bar: cache read (hit). */
  distCache: RGBA
  /** Dist bar: uncached input + cache write. */
  distInput: RGBA
  /** Dist bar: output + reasoning. */
  distOutput: RGBA
}

/**
 * Pick a theme hue at the same step the theme uses for success text, so the
 * accent/interactive segments match the green one in both light and dark themes.
 */
function hueLike(theme: ResolvedTheme, hue: SemanticHue, reference: RGBA | undefined): RGBA | undefined {
  try {
    const step = reference ? theme.source(reference)?.step : undefined
    if (step == null) return undefined
    return theme.hue[hue]?.[step]
  } catch {
    return undefined
  }
}

export function resolveThemeColors(theme: ResolvedTheme): ThemeColorMap {
  const primary = theme.text?.base ?? RGBA.fromInts(200, 210, 230, 255)
  const muted = theme.text?.muted ?? RGBA.fromInts(140, 150, 170, 255)
  const dim = theme.text?.faint ?? RGBA.fromInts(100, 108, 122, 255)
  const success = theme.text?.feedback?.success?.base
  const warning = theme.text?.feedback?.warning?.base
  const green = success ?? RGBA.fromInts(63, 185, 80, 255)
  const red = theme.text?.feedback?.error?.base ?? RGBA.fromInts(244, 67, 54, 255)
  const amber = warning ?? RGBA.fromInts(255, 193, 7, 255)
  const purple = RGBA.fromInts(180, 120, 255, 255)
  const cyan = RGBA.fromInts(80, 190, 255, 255)
  const border = theme.border?.base ?? RGBA.fromInts(55, 65, 80, 255)
  const distCache = green
  const distInput = hueLike(theme, "accent", success) ?? warning ?? RGBA.fromInts(255, 152, 0, 255)
  const distOutput = hueLike(theme, "interactive", success) ?? RGBA.fromInts(66, 135, 245, 255)
  return { primary, muted, dim, green, red, amber, purple, cyan, border, distCache, distInput, distOutput }
}

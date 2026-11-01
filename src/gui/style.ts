/**
 * Everything is scoped under `ous-` so it cannot collide with the host's styles
 * or another plugin's. Colours come from `currentColor` and a small fixed
 * palette so the panel reads correctly in light and dark themes.
 */
export const panelCss = `
:root {
  --ous-cache: #3fb950;
  --ous-input: #d29922;
  --ous-output: #58a6ff;
}
.ous-root {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.45;
}
.ous-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
.ous-kpi { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ous-kpi-value {
  font-variant-numeric: tabular-nums;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ous-kpi-label {
  opacity: .55;
  font-size: 10px;
  letter-spacing: .04em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ous-line { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.ous-muted { opacity: .55; }
.ous-model { border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent); padding-top: 8px; }
.ous-model-head {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  background: none;
  border: 0;
  padding: 0;
  color: inherit;
  cursor: pointer;
  text-align: left;
  font: inherit;
}
.ous-model-head:hover .ous-model-name { text-decoration: underline; text-underline-offset: 2px; }
.ous-model-head:disabled { cursor: default; }
.ous-model-head:disabled:hover .ous-model-name { text-decoration: none; }
.ous-model-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}
.ous-plan {
  margin-left: 6px;
  padding: 0 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  opacity: .6;
  border: 1px solid color-mix(in srgb, currentColor 25%, transparent);
}
.ous-model-meta { flex: none; opacity: .55; font-variant-numeric: tabular-nums; }
.ous-dot { width: 6px; height: 6px; border-radius: 50%; flex: none; background: currentColor; }
.ous-ok { color: var(--ous-cache); }
.ous-warn { color: #d29922; }
.ous-bad { color: #f85149; }
.ous-missing { color: #b478ff; }
.ous-bar {
  display: flex;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 10%, transparent);
  margin: 6px 0 5px;
}
.ous-bar > span { height: 100%; }
.ous-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-top: 6px; }
.ous-perf {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 6px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  opacity: .6;
}
.ous-uibar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  min-width: 0;
}
.ous-uibar-total { font-weight: 600; white-space: nowrap; }
.ous-uibar-track {
  display: flex;
  width: 64px;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
  flex: none;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
.ous-uibar-track > span { height: 100%; }
.ous-uibar-wide .ous-uibar-track { width: 180px; }
.ous-uibar-meta { opacity: .6; white-space: nowrap; }
.ous-empty { opacity: .55; padding: 20px 0; text-align: center; }
.ous-foot { opacity: .45; font-size: 11px; }
.ous-providers {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  padding-top: 10px;
  margin-top: 2px;
}
.ous-section {
  font-size: 10px;
  letter-spacing: .04em;
  text-transform: uppercase;
  opacity: .55;
}
.ous-link {
  background: none;
  border: 0;
  padding: 0 2px;
  color: inherit;
  opacity: .6;
  cursor: pointer;
  font: inherit;
}
.ous-link:hover { opacity: 1; }
.ous-link:disabled { cursor: default; opacity: .35; }
.ous-provider { display: flex; flex-direction: column; gap: 4px; }
.ous-window { display: flex; flex-direction: column; gap: 2px; padding-left: 12px; }
.ous-pbar { position: relative; height: 4px; margin: 5px 0 4px; }
.ous-pbar-track {
  display: block;
  height: 100%;
  border-radius: 2px;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 10%, transparent);
}
.ous-pbar-track > span { display: block; height: 100%; transition: width 260ms ease; }
.ous-pace {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  border-radius: 1px;
  pointer-events: auto;
  transition: left 260ms ease, background-color 260ms ease;
}
.ous-indent { padding-left: 12px; }
.ous-settings { display: flex; flex-direction: column; gap: 22px; padding: 4px 0 24px; max-width: 640px; }
.ous-section-block { display: flex; flex-direction: column; gap: 10px; }
.ous-section-block h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: .02em;
  opacity: .7;
}
.ous-actions { display: flex; flex-wrap: wrap; gap: 8px; }
.ous-path {
  font-family: var(--ous-mono, monospace);
  font-size: 11px;
  opacity: .6;
  overflow-wrap: anywhere;
}
.ous-pstrip {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 5px 12px;
  border-top: 1px solid color-mix(in srgb, currentColor 12%, transparent);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
}
.ous-pstrip-empty { opacity: .5; }
.ous-pchip {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.ous-pchip:hover .ous-pchip-name { text-decoration: underline; text-underline-offset: 2px; }
.ous-pchip-name { font-weight: 500; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.ous-pchip-track {
  position: relative;
  display: block;
  width: 64px;
  height: 4px;
  border-radius: 2px;
  flex: none;
  background: color-mix(in srgb, currentColor 12%, transparent);
}
.ous-pchip-fill {
  display: block;
  height: 100%;
  border-radius: 2px;
  transition: width 260ms ease, background-color 260ms ease;
}
.ous-pchip-pace {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  border-radius: 1px;
  transition: left 260ms ease, background-color 260ms ease;
}
.ous-pchip-meta { opacity: .6; white-space: nowrap; }
`

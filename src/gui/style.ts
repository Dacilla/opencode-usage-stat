/**
 * Everything is scoped under `ous-` so it cannot collide with the host's styles
 * or another plugin's. Colours come from `currentColor` and a small fixed
 * palette so the panel reads correctly in light and dark themes.
 */
export const panelCss = `
.ous-root {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  font-size: 12px;
  line-height: 1.45;
  --ous-cache: #3fb950;
  --ous-input: #d29922;
  --ous-output: #58a6ff;
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
.ous-model-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
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
.ous-empty { opacity: .55; padding: 20px 0; text-align: center; }
.ous-foot { opacity: .45; font-size: 11px; }
`

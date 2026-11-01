"use strict";Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const s=require("solid-js/web"),k=require("@opencode/plugin/gui"),D=require("effect"),p=require("solid-js");function B(e,t,n=0){return e>=2&&t===0&&n===0}function $(e){return e>=1e9?`${(e/1e9).toFixed(1)}B`:e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:String(e)}function O(e){return e===0?"$0.00":e<.01?`$${e.toFixed(4)}`:`$${e.toFixed(2)}`}function E(e,t){return e+t}function V(e,t,n=0){const i=e+t+n;return i===0?0:t/i}function G(e,t){if(!e||e.type!=="assistant"||!e.tokens)return null;const n=e.tokens,i=n.input??0,c=n.output??0,r=n.reasoning??0,b=n.cache?.read??0,l=n.cache?.write??0;return i+c+r+b+l===0?null:{id:e.id,sessionID:t,providerID:e.model?.providerID??"unknown",modelID:e.model?.id??"unknown",inputTokens:i,outputTokens:c,reasoningTokens:r,cacheRead:b,cacheWrite:l,cost:e.cost??0}}const X=k.Plugin.define({stores:{view:k.Store.global(D.Schema.Struct({collapsed:D.Schema.Array(D.Schema.String),showCost:D.Schema.Boolean}),{collapsed:[],showCost:!0})},i18n:{en:{"command.usage":"Usage Stat","command.usage.description":"Open the live token, cache and cost panel","command.group":"Usage","panel.title":"Usage","panel.mobile":"Usage","panel.total":"Total","panel.requests":"Requests","panel.input":"Input","panel.output":"Output","panel.cost":"Cost","panel.cache":"Cache","panel.overhead":"Includes title, compaction and other non-message usage","panel.empty":"No usage recorded in this session yet.","panel.unavailable":"Usage data is not available for this server.","pill.title":"Session usage"},zh:{"command.usage":"用量统计","command.usage.description":"打开实时 Token、缓存与费用面板","command.group":"用量","panel.title":"用量","panel.mobile":"用量","panel.total":"总计","panel.requests":"请求","panel.input":"输入","panel.output":"输出","panel.cost":"费用","panel.cache":"缓存","panel.overhead":"包含标题生成、压缩等其他用量","panel.empty":"此会话尚无用量记录。","panel.unavailable":"该服务端暂不提供用量数据。","pill.title":"会话用量"}}});function H(e){const t=new Map;return e.forEach((n,i)=>{const c=`${n.providerID}/${n.modelID}`;let r=t.get(c);r||(r={key:c,providerID:n.providerID,modelID:n.modelID,input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,cost:0,requests:0,lastIndex:-1},t.set(c,r)),r.input+=n.inputTokens,r.output+=n.outputTokens,r.reasoning+=n.reasoningTokens,r.cacheRead+=n.cacheRead,r.cacheWrite+=n.cacheWrite,r.cost+=n.cost,r.requests++,r.lastIndex=i}),Array.from(t.values()).filter(n=>n.input+n.output+n.reasoning+n.cacheRead+n.cacheWrite>0).sort((n,i)=>i.lastIndex-n.lastIndex)}function N(e){const t={input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,cost:0,requests:0,tokens:0};for(const n of e)t.input+=n.input,t.output+=n.output,t.reasoning+=n.reasoning,t.cacheRead+=n.cacheRead,t.cacheWrite+=n.cacheWrite,t.cost+=n.cost,t.requests+=n.requests;return t.tokens=t.input+t.output+t.reasoning+t.cacheRead+t.cacheWrite,t}function J(e){const t={input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,cost:0,requests:0,tokens:0};for(const n of e)n&&(t.input+=n.tokens?.input??0,t.output+=n.tokens?.output??0,t.reasoning+=n.tokens?.reasoning??0,t.cacheRead+=n.tokens?.cache?.read??0,t.cacheWrite+=n.tokens?.cache?.write??0,t.cost+=n.cost??0);return t.tokens=t.input+t.output+t.reasoning+t.cacheRead+t.cacheWrite,t}function Y(e){return B(e.requests,e.cacheRead,e.cacheWrite)?{rate:null,missing:!0}:E(e.input,e.cacheWrite)+e.cacheRead===0?{rate:null,missing:!1}:{rate:V(e.input,e.cacheRead,e.cacheWrite)*100,missing:!1}}function K(e){let t=0,n=0;for(const i of e)B(i.requests,i.cacheRead,i.cacheWrite)||(t+=i.cacheRead,n+=E(i.input,i.cacheWrite)+i.cacheRead);return n>0?t/n*100:null}function Z(e,t){return{tokens:Math.max(0,e.tokens-t.tokens),cost:Math.max(0,e.cost-t.cost)}}var ee=s.template("<div class=ous-grid><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label>"),te=s.template("<span class=ous-muted> "),ne=s.template("<div class=ous-line><span class=ous-muted> "),se=s.template("<div class=ous-foot>+ <!> · "),oe=s.template("<div class=ous-root>"),j=s.template("<div class=ous-empty>"),ie=s.template("<div class=ous-bar aria-hidden=true><span style=background-color:var(--ous-cache)></span><span style=background-color:var(--ous-input)></span><span style=background-color:var(--ous-output)>"),ae=s.template("<span class=ous-muted>"),re=s.template("<div class=ous-line><span class=ous-muted>"),le=s.template("<div class=ous-details><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label>"),ue=s.template("<div class=ous-model><button class=ous-model-head type=button><span></span><span class=ous-model-name>/</span><span class=ous-model-meta>");function ce(e,t){return t?"ous-dot ous-missing":e==null?"ous-dot ous-muted":e>=85?"ous-dot ous-ok":e>=70?"ous-dot ous-warn":"ous-dot ous-bad"}function A(e){return e==null?"—":`${e.toFixed(1)}%`}function pe(e){const t=k.usePlugin(),n=()=>t.servers.get(e.session.server.id)?.data,i=p.createMemo(()=>{const u=n(),o=e.session.id;if(!u)return[o];const a=u.session.family(o);return a.length>0?a:[o]}),c=p.createMemo(()=>{const u=n();if(!u)return[];const o=[];for(const a of i())for(const h of u.session.message.list(a)){const d=G(h,a);d&&o.push(d)}return o}),r=p.createMemo(()=>H(c())),b=p.createMemo(()=>N(r())),l=p.createMemo(()=>{const u=n();if(!u)return N(r());const o=J(i().map(a=>u.session.get(a)));return o.requests=b().requests,o}),M=p.createMemo(()=>Z(l(),b())),q=p.createMemo(()=>K(r())),P=u=>t.stores.view.value.collapsed.includes(u);function L(u){t.stores.view.update(o=>{const a=o.collapsed.indexOf(u);a>=0?o.collapsed.splice(a,1):o.collapsed.push(u)})}return(()=>{var u=oe();return s.insert(u,s.createComponent(p.Show,{get when(){return n()},get fallback(){return(()=>{var o=j();return s.insert(o,()=>t.t("panel.unavailable")),o})()},get children(){return s.createComponent(p.Show,{get when(){return r().length>0},get fallback(){return(()=>{var o=j();return s.insert(o,()=>t.t("panel.empty")),o})()},get children(){return[(()=>{var o=ee(),a=o.firstChild,h=a.firstChild,d=h.nextSibling,x=a.nextSibling,S=x.firstChild,_=S.nextSibling,v=x.nextSibling,w=v.firstChild,C=w.nextSibling,F=v.nextSibling,R=F.firstChild,m=R.nextSibling;return s.insert(h,()=>$(l().tokens)),s.insert(d,()=>t.t("panel.total")),s.insert(S,()=>l().requests),s.insert(_,()=>t.t("panel.requests")),s.insert(w,()=>$(l().input+l().cacheWrite)),s.insert(C,()=>t.t("panel.input")),s.insert(R,()=>$(l().output)),s.insert(m,()=>t.t("panel.output")),o})(),(()=>{var o=ne(),a=o.firstChild,h=a.firstChild;return s.insert(a,()=>t.t("panel.cache"),h),s.insert(a,()=>A(q()),null),s.insert(o,s.createComponent(p.Show,{get when(){return s.memo(()=>!!t.stores.view.value.showCost)()&&l().cost>0},get children(){var d=te(),x=d.firstChild;return s.insert(d,()=>t.t("panel.cost"),x),s.insert(d,()=>O(l().cost),null),d}}),null),o})(),s.createComponent(p.For,{get each(){return r()},children:o=>{const a=Y(o),h=o.input+o.output+o.reasoning+o.cacheRead+o.cacheWrite,d=o.input+o.cacheWrite,x=o.output+o.reasoning,S=()=>{const _=a.missing?0:o.cacheRead,v=_+d+x||1;return{cache:_/v*100,input:d/v*100,output:x/v*100}};return(()=>{var _=ue(),v=_.firstChild,w=v.firstChild,C=w.nextSibling,F=C.firstChild,R=C.nextSibling;return v.$$click=()=>L(o.key),s.insert(C,()=>o.providerID,F),s.insert(C,()=>o.modelID,null),s.insert(R,(()=>{var m=s.memo(()=>!!P(o.key));return()=>m()?$(h):`×${o.requests}`})(),null),s.insert(R,()=>P(o.key)?" ▸":" ▾",null),s.insert(_,s.createComponent(p.Show,{get when(){return!P(o.key)},get children(){return[(()=>{var m=ie(),y=m.firstChild,g=y.nextSibling,U=g.nextSibling;return s.effect(f=>{var I=`${S().cache}%`,W=`${S().input}%`,T=`${S().output}%`;return I!==f.e&&s.setStyleProperty(y,"width",f.e=I),W!==f.t&&s.setStyleProperty(g,"width",f.t=W),T!==f.a&&s.setStyleProperty(U,"width",f.a=T),f},{e:void 0,t:void 0,a:void 0}),m})(),(()=>{var m=re(),y=m.firstChild;return s.insert(y,(()=>{var g=s.memo(()=>!!a.missing);return()=>g()?"MISSING":A(a.rate)})()),s.insert(m,s.createComponent(p.Show,{get when(){return s.memo(()=>!!t.stores.view.value.showCost)()&&o.cost>0},get children(){var g=ae();return s.insert(g,()=>O(o.cost)),g}}),null),m})(),(()=>{var m=le(),y=m.firstChild,g=y.firstChild,U=g.nextSibling,f=y.nextSibling,I=f.firstChild,W=I.nextSibling,T=f.nextSibling,z=T.firstChild,Q=z.nextSibling;return s.insert(g,()=>$(h)),s.insert(U,()=>t.t("panel.total")),s.insert(I,()=>$(d)),s.insert(W,()=>t.t("panel.input")),s.insert(z,()=>$(o.output)),s.insert(Q,()=>t.t("panel.output")),m})()]}}),null),s.effect(()=>s.className(w,ce(a.rate,a.missing))),_})()}}),s.createComponent(p.Show,{get when(){return M().tokens>0},get children(){var o=se(),a=o.firstChild,h=a.nextSibling;return h.nextSibling,s.insert(o,()=>t.t("panel.overhead"),h),s.insert(o,()=>$(M().tokens),null),o}})]}})}})),u})()}s.delegateEvents(["click"]);const de=`
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
`;function me(e,t){if(!e)return;const n=e.session.family(t),i=n.length>0?n:[t],c=J(i.map(l=>e.session.get(l)));if(c.tokens<=0)return;const r=[];for(const l of i)for(const M of e.session.message.list(l)){const q=G(M,l);q&&r.push(q)}const b=K(H(r));return`${$(c.tokens)}${b==null?"":` · ${b.toFixed(0)}%`}`}const he=k.Plugin.define({...X,setup(e){e.add(k.Style,de);const t={id:"usage",get title(){return e.t("panel.title")},closable:"compact",fallback:!0};e.add(k.Panel,{id:"usage",region:"side",mobile:{get title(){return e.t("panel.mobile")},order:45,kind:"menu",icon:"window-analytics"},list:n=>n.open.includes("usage")?[t]:[],render:n=>s.createComponent(pe,{get session(){return n.session},get screen(){return n.screen},get tab(){return n.tab}})}),e.add(k.MenuItem,()=>({menu:"session.panel",id:"usage",title:e.t("panel.title"),icon:"window-analytics",keybind:`${e.id}.usage`,run:()=>{const n=e.sessions.current();n&&e.layout.open(`${e.id}:usage`,n)}})),e.add(k.Command,()=>({id:"usage",title:e.t("command.usage"),description:e.t("command.usage.description"),keywords:"usage tokens cache cost stats report",group:e.t("command.group"),section:"session",bind:"mod+shift+u",slash:{name:"usage",arguments:!0},featured:!0,run:()=>{const n=e.sessions.current();n&&(e.layout.open(`${e.id}:usage`,n,{background:!0}),e.layout.side.toggle(n))}})),e.add(k.ComposerPill,{id:"usage",order:40,show:n=>{const i=e.servers.get(n.session.server.id)?.data,c=me(i,n.session.id);if(c)return{label:c,icon:"window-analytics",title:e.t("pill.title"),run:()=>e.layout.open(`${e.id}:usage`,n.session)}}})}});exports.default=he;

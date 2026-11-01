Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:`Module`}});let e=require("solid-js/web"),t=require("@opencode/plugin/gui"),n=require("effect"),r=require("solid-js");function i(e,t,n=0){return e>=2&&t===0&&n===0}function a(e){return e>=1e9?`${(e/1e9).toFixed(1)}B`:e>=1e6?`${(e/1e6).toFixed(1)}M`:e>=1e3?`${(e/1e3).toFixed(1)}K`:String(e)}function o(e){return e===0?`$0.00`:e<.01?`$${e.toFixed(4)}`:`$${e.toFixed(2)}`}function s(e,t){return e+t}function c(e,t,n=0){let r=e+t+n;return r===0?0:t/r}function l(e,t){if(!e||e.type!==`assistant`||!e.tokens)return null;let n=e.tokens,r=n.input??0,i=n.output??0,a=n.reasoning??0,o=n.cache?.read??0,s=n.cache?.write??0;return r+i+a+o+s===0?null:{id:e.id,sessionID:t,providerID:e.model?.providerID??`unknown`,modelID:e.model?.id??`unknown`,inputTokens:r,outputTokens:i,reasoningTokens:a,cacheRead:o,cacheWrite:s,cost:e.cost??0}}var u=t.Plugin.define({stores:{view:t.Store.global(n.Schema.Struct({collapsed:n.Schema.Array(n.Schema.String),showCost:n.Schema.Boolean}),{collapsed:[],showCost:!0})},i18n:{en:{"command.usage":`Usage Stat`,"command.usage.description":`Open the live token, cache and cost panel`,"command.group":`Usage`,"panel.title":`Usage`,"panel.mobile":`Usage`,"panel.total":`Total`,"panel.requests":`Requests`,"panel.input":`Input`,"panel.output":`Output`,"panel.cost":`Cost`,"panel.cache":`Cache`,"panel.overhead":`Includes title, compaction and other non-message usage`,"panel.empty":`No usage recorded in this session yet.`,"panel.unavailable":`Usage data is not available for this server.`,"pill.title":`Session usage`},zh:{"command.usage":`用量统计`,"command.usage.description":`打开实时 Token、缓存与费用面板`,"command.group":`用量`,"panel.title":`用量`,"panel.mobile":`用量`,"panel.total":`总计`,"panel.requests":`请求`,"panel.input":`输入`,"panel.output":`输出`,"panel.cost":`费用`,"panel.cache":`缓存`,"panel.overhead":`包含标题生成、压缩等其他用量`,"panel.empty":`此会话尚无用量记录。`,"panel.unavailable":`该服务端暂不提供用量数据。`,"pill.title":`会话用量`}}});function d(e){let t=new Map;return e.forEach((e,n)=>{let r=`${e.providerID}/${e.modelID}`,i=t.get(r);i||(i={key:r,providerID:e.providerID,modelID:e.modelID,input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,cost:0,requests:0,lastIndex:-1},t.set(r,i)),i.input+=e.inputTokens,i.output+=e.outputTokens,i.reasoning+=e.reasoningTokens,i.cacheRead+=e.cacheRead,i.cacheWrite+=e.cacheWrite,i.cost+=e.cost,i.requests++,i.lastIndex=n}),Array.from(t.values()).filter(e=>e.input+e.output+e.reasoning+e.cacheRead+e.cacheWrite>0).sort((e,t)=>t.lastIndex-e.lastIndex)}function f(e){let t={input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,cost:0,requests:0,tokens:0};for(let n of e)t.input+=n.input,t.output+=n.output,t.reasoning+=n.reasoning,t.cacheRead+=n.cacheRead,t.cacheWrite+=n.cacheWrite,t.cost+=n.cost,t.requests+=n.requests;return t.tokens=t.input+t.output+t.reasoning+t.cacheRead+t.cacheWrite,t}function p(e){let t={input:0,output:0,reasoning:0,cacheRead:0,cacheWrite:0,cost:0,requests:0,tokens:0};for(let n of e)n&&(t.input+=n.tokens?.input??0,t.output+=n.tokens?.output??0,t.reasoning+=n.tokens?.reasoning??0,t.cacheRead+=n.tokens?.cache?.read??0,t.cacheWrite+=n.tokens?.cache?.write??0,t.cost+=n.cost??0);return t.tokens=t.input+t.output+t.reasoning+t.cacheRead+t.cacheWrite,t}function m(e){return i(e.requests,e.cacheRead,e.cacheWrite)?{rate:null,missing:!0}:s(e.input,e.cacheWrite)+e.cacheRead===0?{rate:null,missing:!1}:{rate:c(e.input,e.cacheRead,e.cacheWrite)*100,missing:!1}}function h(e){let t=0,n=0;for(let r of e)i(r.requests,r.cacheRead,r.cacheWrite)||(t+=r.cacheRead,n+=s(r.input,r.cacheWrite)+r.cacheRead);return n>0?t/n*100:null}function g(e,t){return{tokens:Math.max(0,e.tokens-t.tokens),cost:Math.max(0,e.cost-t.cost)}}var _=(0,e.template)(`<div class=ous-grid><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label>`),v=(0,e.template)(`<span class=ous-muted> `),y=(0,e.template)(`<div class=ous-line><span class=ous-muted> `),b=(0,e.template)(`<div class=ous-foot>+ <!> · `),x=(0,e.template)(`<div class=ous-root>`),S=(0,e.template)(`<div class=ous-empty>`),C=(0,e.template)(`<div class=ous-bar aria-hidden=true><span style=background-color:var(--ous-cache)></span><span style=background-color:var(--ous-input)></span><span style=background-color:var(--ous-output)>`),w=(0,e.template)(`<span class=ous-muted>`),T=(0,e.template)(`<div class=ous-line><span class=ous-muted>`),E=(0,e.template)(`<div class=ous-details><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label></span></div><div class=ous-kpi><span class=ous-kpi-value></span><span class=ous-kpi-label>`),D=(0,e.template)(`<div class=ous-model><button class=ous-model-head type=button><span></span><span class=ous-model-name>/</span><span class=ous-model-meta>`);function O(e,t){return t?`ous-dot ous-missing`:e==null?`ous-dot ous-muted`:e>=85?`ous-dot ous-ok`:e>=70?`ous-dot ous-warn`:`ous-dot ous-bad`}function k(e){return e==null?`—`:`${e.toFixed(1)}%`}function A(n){let i=(0,t.usePlugin)(),s=()=>i.servers.get(n.session.server.id)?.data,c=(0,r.createMemo)(()=>{let e=s(),t=n.session.id;if(!e)return[t];let r=e.session.family(t);return r.length>0?r:[t]}),u=(0,r.createMemo)(()=>{let e=s();if(!e)return[];let t=[];for(let n of c())for(let r of e.session.message.list(n)){let e=l(r,n);e&&t.push(e)}return t}),A=(0,r.createMemo)(()=>d(u())),j=(0,r.createMemo)(()=>f(A())),M=(0,r.createMemo)(()=>{let e=s();if(!e)return f(A());let t=p(c().map(t=>e.session.get(t)));return t.requests=j().requests,t}),N=(0,r.createMemo)(()=>g(M(),j())),P=(0,r.createMemo)(()=>h(A())),F=e=>i.stores.view.value.collapsed.includes(e);function I(e){i.stores.view.update(t=>{let n=t.collapsed.indexOf(e);n>=0?t.collapsed.splice(n,1):t.collapsed.push(e)})}return(()=>{var t=x();return(0,e.insert)(t,(0,e.createComponent)(r.Show,{get when(){return s()},get fallback(){return(()=>{var t=S();return(0,e.insert)(t,()=>i.t(`panel.unavailable`)),t})()},get children(){return(0,e.createComponent)(r.Show,{get when(){return A().length>0},get fallback(){return(()=>{var t=S();return(0,e.insert)(t,()=>i.t(`panel.empty`)),t})()},get children(){return[(()=>{var t=_(),n=t.firstChild,r=n.firstChild,o=r.nextSibling,s=n.nextSibling,c=s.firstChild,l=c.nextSibling,u=s.nextSibling,d=u.firstChild,f=d.nextSibling,p=u.nextSibling.firstChild,m=p.nextSibling;return(0,e.insert)(r,()=>a(M().tokens)),(0,e.insert)(o,()=>i.t(`panel.total`)),(0,e.insert)(c,()=>M().requests),(0,e.insert)(l,()=>i.t(`panel.requests`)),(0,e.insert)(d,()=>a(M().input+M().cacheWrite)),(0,e.insert)(f,()=>i.t(`panel.input`)),(0,e.insert)(p,()=>a(M().output)),(0,e.insert)(m,()=>i.t(`panel.output`)),t})(),(()=>{var t=y(),n=t.firstChild,a=n.firstChild;return(0,e.insert)(n,()=>i.t(`panel.cache`),a),(0,e.insert)(n,()=>k(P()),null),(0,e.insert)(t,(0,e.createComponent)(r.Show,{get when(){return(0,e.memo)(()=>!!i.stores.view.value.showCost)()&&M().cost>0},get children(){var t=v(),n=t.firstChild;return(0,e.insert)(t,()=>i.t(`panel.cost`),n),(0,e.insert)(t,()=>o(M().cost),null),t}}),null),t})(),(0,e.createComponent)(r.For,{get each(){return A()},children:t=>{let n=m(t),s=t.input+t.output+t.reasoning+t.cacheRead+t.cacheWrite,c=t.input+t.cacheWrite,l=t.output+t.reasoning,u=()=>{let e=n.missing?0:t.cacheRead,r=e+c+l||1;return{cache:e/r*100,input:c/r*100,output:l/r*100}};return(()=>{var l=D(),d=l.firstChild,f=d.firstChild,p=f.nextSibling,m=p.firstChild,h=p.nextSibling;return d.$$click=()=>I(t.key),(0,e.insert)(p,()=>t.providerID,m),(0,e.insert)(p,()=>t.modelID,null),(0,e.insert)(h,(()=>{var n=(0,e.memo)(()=>!!F(t.key));return()=>n()?a(s):`×${t.requests}`})(),null),(0,e.insert)(h,()=>F(t.key)?` ▸`:` ▾`,null),(0,e.insert)(l,(0,e.createComponent)(r.Show,{get when(){return!F(t.key)},get children(){return[(()=>{var t=C(),n=t.firstChild,r=n.nextSibling,i=r.nextSibling;return(0,e.effect)(t=>{var a=`${u().cache}%`,o=`${u().input}%`,s=`${u().output}%`;return a!==t.e&&(0,e.setStyleProperty)(n,`width`,t.e=a),o!==t.t&&(0,e.setStyleProperty)(r,`width`,t.t=o),s!==t.a&&(0,e.setStyleProperty)(i,`width`,t.a=s),t},{e:void 0,t:void 0,a:void 0}),t})(),(()=>{var a=T(),s=a.firstChild;return(0,e.insert)(s,(()=>{var t=(0,e.memo)(()=>!!n.missing);return()=>t()?`MISSING`:k(n.rate)})()),(0,e.insert)(a,(0,e.createComponent)(r.Show,{get when(){return(0,e.memo)(()=>!!i.stores.view.value.showCost)()&&t.cost>0},get children(){var n=w();return(0,e.insert)(n,()=>o(t.cost)),n}}),null),a})(),(()=>{var n=E(),r=n.firstChild,o=r.firstChild,l=o.nextSibling,u=r.nextSibling,d=u.firstChild,f=d.nextSibling,p=u.nextSibling.firstChild,m=p.nextSibling;return(0,e.insert)(o,()=>a(s)),(0,e.insert)(l,()=>i.t(`panel.total`)),(0,e.insert)(d,()=>a(c)),(0,e.insert)(f,()=>i.t(`panel.input`)),(0,e.insert)(p,()=>a(t.output)),(0,e.insert)(m,()=>i.t(`panel.output`)),n})()]}}),null),(0,e.effect)(()=>(0,e.className)(f,O(n.rate,n.missing))),l})()}}),(0,e.createComponent)(r.Show,{get when(){return N().tokens>0},get children(){var t=b(),n=t.firstChild.nextSibling;return n.nextSibling,(0,e.insert)(t,()=>i.t(`panel.overhead`),n),(0,e.insert)(t,()=>a(N().tokens),null),t}})]}})}})),t})()}(0,e.delegateEvents)([`click`]);var j=`
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
`;function M(e,t){if(!e)return;let n=e.session.family(t),r=n.length>0?n:[t],i=p(r.map(t=>e.session.get(t)));if(i.tokens<=0)return;let o=[];for(let t of r)for(let n of e.session.message.list(t)){let e=l(n,t);e&&o.push(e)}let s=h(d(o));return`${a(i.tokens)}${s==null?``:` · ${s.toFixed(0)}%`}`}var N=t.Plugin.define({...u,setup(n){n.add(t.Style,j);let r={id:`usage`,get title(){return n.t(`panel.title`)},closable:`compact`,fallback:!0};n.add(t.Panel,{id:`usage`,region:`side`,mobile:{get title(){return n.t(`panel.mobile`)},order:45,kind:`menu`,icon:`window-analytics`},list:e=>e.open.includes(`usage`)?[r]:[],render:t=>(0,e.createComponent)(A,{get session(){return t.session},get screen(){return t.screen},get tab(){return t.tab}})}),n.add(t.MenuItem,()=>({menu:`session.panel`,id:`usage`,title:n.t(`panel.title`),icon:`window-analytics`,keybind:`${n.id}.usage`,run:()=>{let e=n.sessions.current();e&&n.layout.open(`${n.id}:usage`,e)}})),n.add(t.Command,()=>({id:`usage`,title:n.t(`command.usage`),description:n.t(`command.usage.description`),keywords:`usage tokens cache cost stats report`,group:n.t(`command.group`),section:`session`,bind:`mod+shift+u`,slash:{name:`usage`,arguments:!0},featured:!0,run:()=>{let e=n.sessions.current();e&&(n.layout.open(`${n.id}:usage`,e,{background:!0}),n.layout.side.toggle(e))}})),n.add(t.ComposerPill,{id:`usage`,order:40,show:e=>{let t=n.servers.get(e.session.server.id)?.data,r=M(t,e.session.id);if(r)return{label:r,icon:`window-analytics`,title:n.t(`pill.title`),run:()=>n.layout.open(`${n.id}:usage`,e.session)}}})}});exports.default=N;
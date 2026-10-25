'use strict';
// FaunaSphere v5 i18n: English / Español. Translates the DOM live (MutationObserver) + exposes T() for canvas text.
(()=>{const Q=new URLSearchParams(location.search);let L=Q.get('lang')||localStorage.getItem('fs_lang')||((navigator.language||'').toLowerCase().startsWith('es')?'es':'en');if(!['en','es'].includes(L))L='en';
 if(Q.get('lang'))localStorage.setItem('fs_lang',L);window.LANG=L;document.documentElement.lang=L;
 const D=L==='es'?(window.I18N_ES||{}):{},RX=L==='es'?(window.I18N_ES_RX||[]):[];
 const frags=Object.keys(D).filter(k=>k.length>=8&&D[k]&&/[ .!?:]/.test(k)).sort((a,b)=>b.length-a.length);
 function look(t){if(D[t])return D[t];for(const[r,f]of RX)if(r.test(t))return t.replace(r,f);return null}
 function seg(s){const t=s.trim();if(!t)return null;let v=look(t);if(v!=null)return s.replace(t,v);
  const m=t.match(/^([^\p{L}\d]*)(.*?)([^\p{L}\d!?.…]*)$/u);if(m&&m[2]&&m[2]!==t){v=look(m[2]);if(v!=null)return s.replace(m[2],v)}return null}
 const T=window.T=function(s){if(L!=='es'||typeof s!=='string'||!s.trim())return s;const a=seg(s);if(a!=null)return a;
  const parts=s.split(/( · | \/ |: |, | \| | — | & |\n|\()/);if(parts.length>1){let ch=false;const o=parts.map((p,i)=>{if(i%2)return p;const r=seg(p.replace(/\)$/,''));if(r!=null){ch=true;return r+(p.endsWith(')')?')':'')}return p});if(ch)s=o.join('')}
  for(const f of frags)if(s.includes(f))s=s.split(f).join(D[f]);return s};
 const SKIP=/^(SCRIPT|STYLE|TEXTAREA|CANVAS)$/;
 function tr(n){if(n.nodeType===3){const p=n.parentNode;if(!p||SKIP.test(p.nodeName)||p.closest&&p.closest('[data-notr]'))return;const v=T(n.data);if(v!==n.data)n.data=v}
  else if(n.nodeType===1&&!SKIP.test(n.nodeName)){for(const a of['placeholder','title'])if(n.hasAttribute(a)){const v=T(n.getAttribute(a));if(v!==n.getAttribute(a))n.setAttribute(a,v)}for(const c of n.childNodes)tr(c)}}
 window.I18N={lang:L,T,tr,set(l){localStorage.setItem('fs_lang',l);const u=new URL(location.href);u.searchParams.delete('lang');location.href=u}};
 if(L==='es')new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')tr(m.target);else if(m.type==='attributes')tr(m.target);else m.addedNodes.forEach(tr)}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title']});
 function toggles(){const lbl=L==='es'?'🌐 English':'🌐 Español',mk=()=>{const a=document.createElement('a');a.href='#';a.className='langbtn';a.setAttribute('data-notr','');a.textContent=lbl;a.onclick=e=>{e.preventDefault();I18N.set(L==='es'?'en':'es')};return a};
  const hi=document.getElementById('hi');if(hi&&!hi.querySelector('.langbtn')){hi.append(' | ');hi.append(mk())}
  const ti=document.getElementById('title');if(ti&&!ti.querySelector('.langbtn')){const d=document.createElement('div');d.style.cssText='margin-top:10px';const b=mk();b.style.cssText='display:inline-block;background:#fff;color:#2d7a1a;font-weight:800;padding:6px 14px;border-radius:14px;border:2px solid #3ea318;text-decoration:none';d.append(b);ti.querySelector('.box,div')?(ti.querySelector('.box')||ti).append(d):ti.append(d)}
  if(L==='es')tr(document.body)}
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',toggles);else toggles();
})();

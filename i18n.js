'use strict';
// FaunaSphere v5 i18n: English / Español. Translates the DOM live (MutationObserver) + exposes T() for canvas text.
(()=>{const Q=new URLSearchParams(location.search);let L=Q.get('lang')||localStorage.getItem('fs_lang')||((navigator.language||'').toLowerCase().startsWith('es')?'es':'en');if(!['en','es'].includes(L))L='en';
 if(Q.get('lang'))localStorage.setItem('fs_lang',L);window.LANG=L;document.documentElement.lang=L;
 const D=window.I18N_ES||{},RX=window.I18N_ES_RX||[];
 const frags=Object.keys(D).filter(k=>k.length>=8&&D[k]&&/[ .!?:]/.test(k)).sort((a,b)=>b.length-a.length);
 const DONE=new WeakMap(),ORIG=new WeakMap(),ORIGA=new WeakMap();let busy=false; // originals so we can switch back to English live
 function look(t){if(D[t])return D[t];for(const[r,f]of RX)if(r.test(t))return t.replace(r,f);return null}
 function seg(s){const t=s.trim();if(!t)return null;let v=look(t);if(v!=null)return s.replace(t,v);
  const m=t.match(/^([^\p{L}\d]*)(.*?)([^\p{L}\d!?.…]*)$/u);if(m&&m[2]&&m[2]!==t){v=look(m[2]);if(v!=null)return s.replace(m[2],v)}const m2=t.match(/^([^\p{L}]*)(.*?)([^\p{L}!?.…]*)$/u);if(m2&&m2[2]&&m2[2]!==t&&m2[2]!==(m&&m[2])){v=look(m2[2]);if(v!=null)return s.replace(m2[2],v)}return null}
 const T=window.T=function(s){if(L!=='es'||typeof s!=='string'||!s.trim())return s;const a=seg(s);if(a!=null)return a;
  const parts=s.split(/( · | \/ |: |, | \| | — | & |\n|\()/);if(parts.length>1){let ch=false;const o=parts.map((p,i)=>{if(i%2)return p;const r=seg(p.replace(/\)$/,''));if(r!=null){ch=true;return r+(p.endsWith(')')?')':'')}return p});if(ch)s=o.join('')}
  for(const f of frags)if(s.includes(f))s=s.split(f).join(D[f]);return s};
 const SKIP=/^(SCRIPT|STYLE|TEXTAREA|CANVAS)$/;
 function tr(n){if(L!=='es')return;if(n.nodeType===3){const p=n.parentNode;if(!p||SKIP.test(p.nodeName)||p.closest&&p.closest('[data-notr]'))return;if(DONE.get(n)===n.data)return;const v=T(n.data);if(v!==n.data){ORIG.set(n,n.data);busy=true;n.data=v;busy=false}DONE.set(n,n.data)}
  else if(n.nodeType===1&&!SKIP.test(n.nodeName)){for(const a of['placeholder','title'])if(n.hasAttribute(a)){const o=n.getAttribute(a),v=T(o);if(v!==o){const m=ORIGA.get(n)||{};m[a]=o;ORIGA.set(n,m);busy=true;n.setAttribute(a,v);busy=false}}for(const c of n.childNodes)tr(c)}}
 function untr(n){if(n.nodeType===3){DONE.delete(n);if(ORIG.has(n)){n.data=ORIG.get(n);ORIG.delete(n)}}else if(n.nodeType===1){const m=ORIGA.get(n);if(m){for(const a in m)n.setAttribute(a,m[a]);ORIGA.delete(n)}for(const c of n.childNodes)untr(c)}}
 window.I18N={lang:L,T,tr,set(l){if(!['en','es'].includes(l))return;try{localStorage.setItem('fs_lang',l)}catch(e){}if(l===L)return;
  try{const u=new URL(location.href);if(u.searchParams.has('lang')){u.searchParams.delete('lang');history.replaceState(null,'',u)}}catch(e){}
  L=l;window.LANG=L;I18N.lang=L;document.documentElement.lang=L;busy=true;try{if(L==='es')tr(document.body);else untr(document.body)}finally{busy=false}
  document.querySelectorAll('.langbtn').forEach(a=>a.textContent=L==='es'?'🌐 English':'🌐 Español');
  try{const m=document.getElementById('modal');if(m&&!m.classList.contains('hidden')&&typeof cur!=='undefined'&&cur&&cur.v&&typeof ui==='function')ui(cur.v,cur)}catch(e){}
  try{window.dispatchEvent(new CustomEvent('fs:lang',{detail:L}))}catch(e){}try{toast(L==='es'?'🌐 Español':'🌐 English')}catch(e){}}};
 new MutationObserver(ms=>{if(L!=='es'||busy)return;for(const m of ms){if(m.type==='characterData')tr(m.target);else if(m.type==='attributes')tr(m.target);else m.addedNodes.forEach(tr)}}).observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['placeholder','title']});
 function toggles(){const mk=()=>{const a=document.createElement('a');a.href='#';a.className='langbtn';a.setAttribute('data-notr','');a.textContent=L==='es'?'🌐 English':'🌐 Español';a.style.position='relative';a.style.zIndex='50';a.onclick=e=>{e.preventDefault();e.stopPropagation();I18N.set(L==='es'?'en':'es')};return a};
  const hi=document.getElementById('hi');if(hi&&!hi.querySelector('.langbtn')){hi.append(' | ');hi.append(mk())}
  const ti=document.getElementById('title');if(ti&&!ti.querySelector('.langbtn')){const d=document.createElement('div');d.style.cssText='margin-top:10px';const b=mk();b.style.cssText='position:relative;z-index:50;display:inline-block;background:#fff;color:#2d7a1a;font-weight:800;padding:6px 14px;border-radius:14px;border:2px solid #3ea318;text-decoration:none';d.append(b);ti.querySelector('.box,div')?(ti.querySelector('.box')||ti).append(d):ti.append(d)}
  if(L==='es')tr(document.body)}
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',toggles);else toggles();
})();

'use strict';
// IndexedDB mirror of the save (survives localStorage failures / private-mode quirks) + ask for persistent storage.
window.FSidb=(()=>{let db=null,q=null,pending=null,t=0;const K='faunasphere_save_v3';
 const open=()=>q||(q=new Promise(res=>{try{const r=indexedDB.open('faunasphere',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>res(null)}catch(e){res(null)}}));
 const write=j=>open().then(d=>{if(!d)return;try{d.transaction('s','readwrite').objectStore('s').put(j,K)}catch(e){}});
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 return{put(j){pending=j;const n=Date.now();if(n-t>2000){t=n;write(j);pending=null}else setTimeout(()=>{if(pending){t=Date.now();write(pending);pending=null}},2100)},
  flush(j){write(j)},get:()=>open().then(d=>new Promise(res=>{if(!d)return res(null);try{const g=d.transaction('s').objectStore('s').get(K);g.onsuccess=()=>res(g.result||null);g.onerror=()=>res(null)}catch(e){res(null)}}))}})();

// v4.23 save safety: read the IDB copy BEFORE the game boots (so a fresh boot can't overwrite it first),
// and keep rolling boot backups of whatever was in localStorage (last 5), so nothing is ever lost.
window.FSidbBoot=FSidb.get();try{const o=JSON.parse(localStorage.getItem('faunasphere_save_v3')||'null');window.__lsBootTick=o&&o.lastTick||0}catch(e){window.__lsBootTick=0}
(()=>{try{const raw=localStorage.getItem('faunasphere_save_v3');if(!raw)return;const r=indexedDB.open('faunasphere_bk',1);r.onupgradeneeded=()=>r.result.createObjectStore('b');
 r.onsuccess=()=>{try{const d=r.result,st=d.transaction('b','readwrite').objectStore('b');st.put(raw,Date.now());const k=st.getAllKeys();k.onsuccess=()=>{const ks=k.result.sort((a,b)=>a-b);while(ks.length>5)st.delete(ks.shift())}}catch(e){}}}catch(e){}})();
window.FSbackups=()=>new Promise(res=>{try{const r=indexedDB.open('faunasphere_bk',1);r.onupgradeneeded=()=>r.result.createObjectStore('b');r.onsuccess=()=>{const st=r.result.transaction('b').objectStore('b'),a=st.getAll(),k=st.getAllKeys();a.onsuccess=()=>{k.onsuccess=()=>res(k.result.map((t,i)=>({t,j:a.result[i]})).sort((x,y)=>y.t-x.t))}};r.onerror=()=>res([])}catch(e){res([])}});

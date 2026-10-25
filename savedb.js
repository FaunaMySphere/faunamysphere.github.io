'use strict';
// IndexedDB mirror of the save (survives localStorage failures / private-mode quirks) + ask for persistent storage.
window.FSidb=(()=>{let db=null,q=null,pending=null,t=0;const K='faunasphere_save_v3';
 const open=()=>q||(q=new Promise(res=>{try{const r=indexedDB.open('faunasphere',1);r.onupgradeneeded=()=>r.result.createObjectStore('s');r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>res(null)}catch(e){res(null)}}));
 const write=j=>open().then(d=>{if(!d)return;try{d.transaction('s','readwrite').objectStore('s').put(j,K)}catch(e){}});
 try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
 return{put(j){pending=j;const n=Date.now();if(n-t>2000){t=n;write(j);pending=null}else setTimeout(()=>{if(pending){t=Date.now();write(pending);pending=null}},2100)},
  flush(j){write(j)},get:()=>open().then(d=>new Promise(res=>{if(!d)return res(null);try{const g=d.transaction('s').objectStore('s').get(K);g.onsuccess=()=>res(g.result||null);g.onerror=()=>res(null)}catch(e){res(null)}}))}})();

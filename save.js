'use strict';
// Save hotfix: visible "Saved" indicator, manual Save, export/import backup code, flush on hide.
(()=>{const top=document.getElementById('top');const pill=document.createElement('button');pill.id='savepill';pill.title='Save & backup';pill.textContent='💾';
 pill.style.cssText='background:rgba(23,60,15,.8);color:#bfff8a;border:2px solid #3ea318;border-radius:14px;font:700 12px sans-serif;padding:4px 8px;margin-right:4px;cursor:pointer';
 const hi=document.getElementById('hi');if(top)top.insertBefore(pill,hi?hi.nextSibling:top.firstChild);
 let shown=0;setInterval(()=>{const t=window.__lastSave;if(window.__saveErr){pill.textContent='⚠️ Save failed';pill.style.color='#ffb3a0'}else if(t&&t!==shown){shown=t;pill.style.color='';pill.innerHTML='💾 <span class="svl">Saved</span>';const l=pill.querySelector('.svl');requestAnimationFrame(()=>{setTimeout(()=>{l.style.opacity='0'},900)})}},1000);
 const flush=()=>{if(window.__importing)return;try{save();if(window.FSidb&&S&&S.fauna&&S.fauna.length)FSidb.flush(JSON.stringify(S))}catch(e){}};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});addEventListener('pagehide',flush);addEventListener('beforeunload',flush);addEventListener('freeze',flush);
 // autosave every 5 s when anything changed; toast on failure instead of failing silently
 let lastJ='',errShown=0;setInterval(()=>{try{if(!S||!S.fauna||!S.fauna.length)return;const j=JSON.stringify(S);if(j===lastJ)return;lastJ=j;save()}catch(e){window.__saveErr=e}if(window.__saveErr&&Date.now()-errShown>30000){errShown=Date.now();try{toast('⚠️ Save failed ('+(window.__saveErr.name||'error')+'). Open 💾 and copy your backup code.')}catch(_){}}},5000);
 // newest save wins: if the IndexedDB copy (read before boot) is newer than what localStorage gave us, restore it once
 try{(window.FSidbBoot||Promise.resolve(null)).then(j=>{try{const o=j&&JSON.parse(j);if(!o||!Array.isArray(o.fauna)||!o.fauna.length)return;const cur=S&&S.fauna&&S.fauna.length?S:null;const ct=cur?(window.__lsBootTick||0):0;
  if((!cur||(o.lastTick||0)>ct+3000)&&!sessionStorage.getItem('fs_idb_restored')){sessionStorage.setItem('fs_idb_restored','1');localStorage.setItem(KEY,j);toast('💾 Restored your newest save…');setTimeout(()=>location.reload(),600)}}catch(e){}})}catch(e){}
 const enc=s=>btoa(unescape(encodeURIComponent(s))),dec=s=>decodeURIComponent(escape(atob(s.trim())));
 const ES=()=>window.LANG==='es';
 window.FSsave={now(){save();toast(window.__saveErr?'⚠️ Could not save: '+window.__saveErr.name:'💾 Game saved!')},
  exportCode(){save();return 'FS1:'+enc(JSON.stringify(S))},
  parseCode(c){let t=String(c||'').trim();if(!t)throw new Error('empty');
   if(/%[0-9A-F]{2}/i.test(t))try{t=decodeURIComponent(t)}catch(e){}
   const m=t.match(/FS\d*:\s*([A-Za-z0-9+/=_\-\s]+)/);let o=null;
   if(t[0]==='{'||t[0]==='"'){o=JSON.parse(t);if(typeof o==='string')o=JSON.parse(o)}
   else{let b=(m?m[1]:t).replace(/\s+/g,'').replace(/-/g,'+').replace(/_/g,'/');while(b.length%4)b+='=';o=JSON.parse(dec(b))}
   if(o&&o.S&&o.S.fauna)o=o.S;if(!o||!Array.isArray(o.fauna)||!o.fauna.length)throw new Error('nofauna');
   if(!o.player)o.player={lux:0};if(!o.zones){o.zones={};if(o.tut==null)o.tut=99}return o},
  importCode(c){let o;try{o=FSsave.parseCode(c)}catch(e){FSsave.err(e.message==='empty'?(ES()?'Pega tu código de respaldo primero.':'Paste your backup code first.'):(ES()?'Ese código de guardado no es válido. Cópialo completo e inténtalo de nuevo.':'That save code is not valid. Copy the whole code and try again.'));return false}
   try{o.lastTick=Date.now();window.__importing=1;const j=JSON.stringify(o);localStorage.setItem(KEY,j);window.FSidb&&FSidb.flush(j);try{sessionStorage.setItem('fs_idb_restored','1')}catch(e){}
    toast(ES()?'¡Partida importada! Recargando…':'Save imported! Reloading…');setTimeout(()=>location.reload(),900);return true}catch(e){FSsave.err((ES()?'No se pudo importar: ':'Could not import: ')+(e.name||e));return false}},
  err(m){try{toast('⚠️ '+m)}catch(e){}const x=document.getElementById('sverr');if(x)x.textContent=m;else alert(m)}};

 pill.onclick=()=>{try{Sound.init();Sound.sfx('click')}catch(e){}save();const f=fa();
  open(`<h2>💾 Save & Backup</h2><p>Your game saves automatically every second and whenever you leave the page.${window.__lastSave?' Last save: '+new Date(window.__lastSave).toLocaleTimeString()+'.':''}</p>${f?`<p class="small">Saved: ${f.name} · Level ${f.level} · ${S.player.lux} Lux · ${S.fauna.length} fauna</p>`:''}
   <p><button class="btn" id="svnow">Save now</button></p><h3>Backup code</h3><p class="small">Copy this code somewhere safe. Paste it on another device or browser to restore your game.</p>
   <textarea id="svcode" readonly style="width:100%;height:70px;font:11px monospace">${FSsave.exportCode()}</textarea><p><button class="btn" id="svcopy">Copy code</button></p>
   <p><button class="btn" id="svdl">⬇️ Download save file</button></p><h3>Restore from code</h3><textarea id="svin" style="width:100%;height:60px;font:11px monospace" placeholder="Paste a backup code"></textarea><p><button class="btn" id="svimp" style="position:relative;z-index:5;touch-action:manipulation">Import</button> <label class="btn" style="display:inline-block;cursor:pointer">📂 Load save file<input type="file" id="svfile" accept=".txt,.json,text/plain,application/json" style="display:none"></label></p><p id="sverr" class="small" style="color:#ffb3a0;min-height:1em"></p><p class="small" style="opacity:.6">FaunaMySphere v6.17.1</p>`);
  document.getElementById('svnow').onclick=()=>FSsave.now();document.getElementById('svcopy').onclick=()=>{const t=document.getElementById('svcode');t.select();(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>toast('Code copied!')).catch(()=>{document.execCommand('copy');toast('Code copied!')})};
  document.getElementById('svdl').onclick=()=>{try{const b=new Blob([FSsave.exportCode()],{type:'text/plain'}),u=URL.createObjectURL(b),x=document.createElement('a');x.href=u;x.download='faunamysphere-save-'+new Date().toISOString().slice(0,10)+'.txt';document.body.appendChild(x);x.click();x.remove();setTimeout(()=>URL.revokeObjectURL(u),4000)}catch(e){toast('Download not supported here; use Copy code.')}};const ib=document.getElementById('svimp');let armed=null,busy=0;const go=ev=>{if(ev){ev.preventDefault();ev.stopPropagation()}if(busy)return;busy=1;setTimeout(()=>busy=0,400);try{const v=document.getElementById('svin').value;
   if(armed&&armed===v){FSsave.importCode(v);return}let o;try{o=FSsave.parseCode(v)}catch(e){FSsave.err(e.message==='empty'?(ES()?'Pega tu código de respaldo primero.':'Paste your backup code first.'):(ES()?'Ese código de guardado no es válido. Cópialo completo e inténtalo de nuevo.':'That save code is not valid. Copy the whole code and try again.'));return}
   const f0=o.fauna[0]||{};armed=v;document.getElementById('sverr').style.color='#bfff8a';document.getElementById('sverr').textContent=(ES()?'Se cargará: ':'Will load: ')+(f0.name||'?')+' · '+o.fauna.length+' fauna · '+((o.player&&o.player.lux)||0)+' Lux. '+(ES()?'Toca Importar otra vez para reemplazar tu partida actual.':'Tap Import again to replace your current game.');ib.textContent=ES()?'✅ Confirmar importación':'✅ Confirm import'}catch(e){FSsave.err(String(e&&e.message||e))}};
  ib.addEventListener('touchend',go,{passive:false});ib.addEventListener('click',go);document.getElementById('svin').addEventListener('input',()=>{armed=null;ib.textContent='Import'});
  document.getElementById('svfile').onchange=e=>{const fl=e.target.files&&e.target.files[0];if(!fl)return;const r=new FileReader();r.onload=()=>{document.getElementById('svin').value=String(r.result);armed=null;go()};r.onerror=()=>FSsave.err(ES()?'No se pudo leer el archivo.':'Could not read the file.');r.readAsText(fl)}};
})();
// Naming hotfix: Enter/Done submits, and the typed name is applied live (so closing the panel or the keyboard never loses it).
(()=>{const ren=v=>{try{const fid=cur&&cur.v==='cert'?cur.fid:null;if(fid==null||!S.fauna[fid])return;const n=String(v).trim().slice(0,16);if(n&&S.fauna[fid].name!==n){S.fauna[fid].name=n;save();renderHUD()}}catch(e){}};
 document.addEventListener('input',e=>{if(e.target&&e.target.id==='cn')ren(e.target.value)},true);
 document.addEventListener('change',e=>{if(e.target&&e.target.id==='cn')ren(e.target.value)},true);
 document.addEventListener('focusout',e=>{if(e.target&&e.target.id==='cn')ren(e.target.value)},true);
 document.addEventListener('keydown',e=>{const t=e.target;if(!t||e.key!=='Enter')return;if(t.id==='cn'){e.preventDefault();ren(t.value);const b=document.getElementById('csign');b&&b.click()}else if(t.id==='hn'){e.preventDefault();const b=document.querySelector('button[data-a="hatch"],button[data-p*="hatching"]');b&&b.click()}else if(t.id==='pn'){e.preventDefault();const b=document.getElementById('go');b&&b.click()}},true);
 // remember the nest name field so a re-render doesn't wipe it
 let hn='';document.addEventListener('input',e=>{if(e.target&&e.target.id==='hn')hn=e.target.value},true);
 new MutationObserver(()=>{const i=document.getElementById('hn');if(i&&!i.value&&hn)i.value=hn;if(!i&&!document.getElementById('cn'))hn=hn}).observe(document.getElementById('mb')||document.body,{childList:true,subtree:true});
 window.__hnName=()=>hn;})();
// v6.11.2 self-update: check for a new service worker on load/focus/return; when a new one takes control, save then reload once.
(()=>{try{if(!('serviceWorker'in navigator)||!location.protocol.startsWith('http'))return;const sw=navigator.serviceWorker,had=!!sw.controller;let done=0;
 sw.addEventListener('controllerchange',()=>{if(!had||done||window.__importing)return;const k='fs_sw_reload',l=+(sessionStorage.getItem('fs_sw_reload')||0);if(Date.now()-l<30000)return;
  done=1;try{sessionStorage.setItem(k,String(Date.now()))}catch(e){}try{save();if(window.FSidb&&S&&S.fauna&&S.fauna.length)FSidb.flush(JSON.stringify(S))}catch(e){}setTimeout(()=>location.reload(),300)});
 let t=0;const up=()=>{const n=Date.now();if(n-t<10000)return;t=n;sw.getRegistration().then(r=>r&&r.update()).catch(()=>{})};
 if(document.readyState==='complete')setTimeout(up,1500);else addEventListener('load',()=>setTimeout(up,1500));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')up()});addEventListener('focus',up);addEventListener('pageshow',up);setInterval(up,30*60000)}catch(e){}})();

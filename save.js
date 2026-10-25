'use strict';
// Save hotfix: visible "Saved" indicator, manual Save, export/import backup code, flush on hide.
(()=>{const top=document.getElementById('top');const pill=document.createElement('button');pill.id='savepill';pill.title='Save & backup';pill.textContent='💾';
 pill.style.cssText='background:rgba(23,60,15,.8);color:#bfff8a;border:2px solid #3ea318;border-radius:14px;font:700 12px sans-serif;padding:4px 8px;margin-right:4px;cursor:pointer';
 const hi=document.getElementById('hi');if(top)top.insertBefore(pill,hi?hi.nextSibling:top.firstChild);
 let shown=0;setInterval(()=>{const t=window.__lastSave;if(window.__saveErr){pill.textContent='⚠️ Save failed';pill.style.color='#ffb3a0'}else if(t&&t!==shown){shown=t;pill.style.color='';pill.innerHTML='💾 <span class="svl">Saved</span>';const l=pill.querySelector('.svl');requestAnimationFrame(()=>{setTimeout(()=>{l.style.opacity='0'},900)})}},1000);
 const flush=()=>{try{save();if(window.FSidb&&S&&S.fauna&&S.fauna.length)FSidb.flush(JSON.stringify(S))}catch(e){}};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush()});addEventListener('pagehide',flush);addEventListener('beforeunload',flush);
 const enc=s=>btoa(unescape(encodeURIComponent(s))),dec=s=>decodeURIComponent(escape(atob(s.trim())));
 window.FSsave={now(){save();toast(window.__saveErr?'⚠️ Could not save: '+window.__saveErr.name:'💾 Game saved!')},
  exportCode(){save();return 'FS1:'+enc(JSON.stringify(S))},
  importCode(c){try{const o=JSON.parse(dec(String(c).replace(/^FS1:/,'')));if(!o||!Array.isArray(o.fauna)||!o.fauna.length)throw 0;localStorage.setItem(KEY,JSON.stringify(o));window.FSidb&&FSidb.flush(JSON.stringify(o));toast('Save imported! Reloading…');setTimeout(()=>location.reload(),700)}catch(e){toast('That save code is not valid.')}}};
 pill.onclick=()=>{try{Sound.init();Sound.sfx('click')}catch(e){}save();const f=fa();
  open(`<h2>💾 Save & Backup</h2><p>Your game saves automatically every second and whenever you leave the page.${window.__lastSave?' Last save: '+new Date(window.__lastSave).toLocaleTimeString()+'.':''}</p>${f?`<p class="small">Saved: ${f.name} · Level ${f.level} · ${S.player.lux} Lux · ${S.fauna.length} fauna</p>`:''}
   <p><button class="btn" id="svnow">Save now</button></p><h3>Backup code</h3><p class="small">Copy this code somewhere safe. Paste it on another device or browser to restore your game.</p>
   <textarea id="svcode" readonly style="width:100%;height:70px;font:11px monospace">${FSsave.exportCode()}</textarea><p><button class="btn" id="svcopy">Copy code</button></p>
   <h3>Restore from code</h3><textarea id="svin" style="width:100%;height:60px;font:11px monospace" placeholder="Paste a backup code"></textarea><p><button class="btn" id="svimp">Import</button></p>`);
  document.getElementById('svnow').onclick=()=>FSsave.now();document.getElementById('svcopy').onclick=()=>{const t=document.getElementById('svcode');t.select();(navigator.clipboard?navigator.clipboard.writeText(t.value):Promise.reject()).then(()=>toast('Code copied!')).catch(()=>{document.execCommand('copy');toast('Code copied!')})};
  document.getElementById('svimp').onclick=()=>{const v=document.getElementById('svin').value;if(v.trim()&&confirm('Replace your current game with this backup?'))FSsave.importCode(v)}};
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

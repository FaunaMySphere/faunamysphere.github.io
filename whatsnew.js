// v8.1 — "What's new" popup (once per version, at game start) + small always-visible version badge. EN/ES.
// The last seen version lives in localStorage key fs_seen_ver (NOT the save).
(function(){
const VER='8.1',K='fs_seen_ver';
const es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')}catch(e){return false}};
const L=(en,s)=>es()?s:en;
const NOTES=[
 ['8.1',[
  ['🌅','Living skies: drifting clouds, warm sunsets and deeper nights.','Cielos vivos: nubes que se mueven, atardeceres cálidos y noches más profundas.'],
  ['💧','New water that reflects the sky, with ripples, sparkles and foam.','Agua nueva que refleja el cielo, con ondas, destellos y espuma.'],
  ['🐾','Your fauna feels alive: blinks, yawns, stretches, moods and little reactions.','Tu fauna cobra vida: parpadea, bosteza, se estira, tiene estados de ánimo y reacciones.'],
  ['💗','Tap your fauna to pet it — it gets a little happier.','Toca a tu fauna para acariciarla: se pone un poco más feliz.'],
  ['📜','Quests and stories in 29 worlds, with friendly characters, Lux and an egg as rewards.','Misiones e historias en 29 mundos, con personajes amigables, Lux y un huevo de premio.']]],
 ['8.0',[
  ['🎨','A cleaner, friendlier look for every panel and button.','Un aspecto más limpio y amable en todos los paneles y botones.'],
  ['🎵','New music that changes as you restore each world, plus new sounds.','Música nueva que cambia al restaurar cada mundo, y sonidos nuevos.'],
  ['🔊','The speaker button opens Sound settings (music and effects volume).','El botón del altavoz abre los ajustes de sonido (volumen de música y efectos).'],
  ['⚔️','Better battles: dodge warning rings, health bars and a boss in every world.','Mejores batallas: anillos de aviso para esquivar, barras de vida y un jefe en cada mundo.']]]];
const css=document.createElement('style');css.textContent=`
#ver81{position:fixed;left:8px;z-index:30;font:700 10px/1.2 var(--font,system-ui),system-ui,sans-serif;color:#fff;background:#0b3d12b3;border:1px solid #ffffff40;border-radius:9px;padding:2px 7px;cursor:pointer;user-select:none;letter-spacing:.2px;opacity:.85}
#ver81:hover{opacity:1}
.wn81 h4{margin:12px 2px 4px;font-size:15px;color:#ffe36e}
.wn81 .r{display:flex;gap:9px;align-items:flex-start;margin:5px 0;padding:7px 9px;border-radius:10px;background:#ffffff1f;font-size:14.5px;line-height:1.35}
.wn81 .r b{font-size:18px;line-height:1.1}
.wn81 .ok{display:block;margin:14px auto 2px;min-width:140px;font-size:17px}`;
document.head.appendChild(css);
function show(){
 let h=`<h2>✨ ${L("What's new","Novedades")}</h2><div class="wn81">`;
 for(const [v,rows] of NOTES){h+=`<h4>${L('Version','Versión')} ${v}</h4>`;for(const r of rows)h+=`<div class="r"><b>${r[0]}</b><span>${es()?r[2]:r[1]}</span></div>`}
 h+=`<button class="btn big ok" id="wn81ok">${L('OK','Vale')}</button></div>`;
 open(h);try{localStorage.setItem(K,VER)}catch(e){}
 const b=document.getElementById('wn81ok');if(b)b.onclick=()=>close();
}
window.FS_WHATSNEW={show,VER,K};
const badge=document.createElement('div');badge.id='ver81';badge.setAttribute('role','button');badge.onclick=()=>{try{Sound.sfx('click')}catch(e){}show()};
document.body.appendChild(badge);
const vis=el=>el&&!el.classList.contains('hidden')&&getComputedStyle(el).display!=='none';
let done=false;
function tick(){
 const tx=L('Version ','Versión ')+VER;if(badge.textContent!==tx){badge.textContent=tx;badge.title=L("What's new","Novedades")}
 const hb=document.getElementById('hudbar');const top=hb?hb.getBoundingClientRect().top:innerHeight;badge.style.top=Math.max(40,top-22)+'px';
 if(done)return;
 let seen=null;try{seen=localStorage.getItem(K)}catch(e){done=true;return}
 if(seen===VER){done=true;return}
 if(typeof S==='undefined'||typeof fa!=='function'||!fa())return;
 if(vis(document.getElementById('loading'))||vis(document.getElementById('title')))return;
 // brand-new players are in the tutorial: everything is new to them, so just remember this version
 if(!seen&&(S.tut|0)<5){try{localStorage.setItem(K,VER)}catch(e){}done=true;return}
 const M=document.getElementById('modal');if(M&&!M.classList.contains('hidden'))return;
 done=true;show();
}
setInterval(tick,600);tick();
})();

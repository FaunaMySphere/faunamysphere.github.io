// v8.1 — "What's new" popup (once per version, at game start) + small always-visible version badge. EN/ES.
// The last seen version lives in localStorage key fs_seen_ver (NOT the save).
(function(){
const VER='8.1.3',K='fs_seen_ver';
const es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')}catch(e){return false}};
const L=(en,s)=>es()?s:en;
const NOTES=[
 ['8.1.3',[
  ['🌈','Worlds now really light up as you save them: every monster and every bit of pollution you clear makes the world brighter and more colorful, until it is fully bright at 100%. Pollution no longer creeps back while you are there, and the sky changes too. When you leave, the world goes back to dark so you can save it again.','Ahora los mundos de verdad se iluminan al salvarlos: cada monstruo y cada mancha de contaminación que limpias hace el mundo más brillante y colorido, hasta quedar totalmente brillante al 100%. La contaminación ya no vuelve sola mientras estás ahí, y el cielo también cambia. Al irte, el mundo vuelve a oscurecerse para que puedas salvarlo otra vez.']]],
 ['8.1.2',[
  ['🏊','Visiting a friend? Your fauna can now swim in their pool! Tap the pool (or the 🛁 Bathe button when close). Your friend\'s home is not changed.','¿Visitas a un amigo? ¡Ahora tu fauna puede nadar en su piscina! Toca la piscina (o el botón 🛁 Bañar cuando estés cerca). La casa de tu amigo no cambia.'],
  ['🛠️','Fixed a rare freeze when visiting some friends\' homes.','Arreglamos un congelamiento poco común al visitar la casa de algunos amigos.']]],
 ['8.1.1',[
  ['🖼️','Bigger game view on iPhone and Android: the top bar is now see-through, the bottom controls are slimmer, and the 3D view always fits the screen (no more stretched or squashed view after rotating or when the browser bars move).','Vista del juego más grande en iPhone y Android: la barra de arriba ahora es transparente, los controles de abajo son más delgados y la vista 3D siempre se ajusta a la pantalla (ya no se estira ni se aplasta al girar o cuando se mueven las barras del navegador).'],
  ['💬','Chat is now local: you only see messages from players in the same place as you (the same home or the same world). When you move, the old place\'s messages go away.','El chat ahora es local: solo ves mensajes de jugadores que están en el mismo lugar que tú (la misma casa o el mismo mundo). Al moverte, los mensajes del lugar anterior desaparecen.'],
  ['✨','Everyone now plays on High graphics. If you were on Low, you have been moved to High once; you can still switch with the ⚙ button, and a slow phone still drops to Low by itself to stay smooth.','Ahora todos juegan con gráficos Altos. Si estabas en Bajo, te pasamos a Alto una vez; puedes cambiarlo con el botón ⚙, y un teléfono lento sigue bajando solo a Bajo para ir fluido.'],
  ['📲','Slimmer controls at the bottom on phones, so you see more of your world. Buttons are still easy to tap.','Controles más delgados abajo en el teléfono, para que veas más de tu mundo. Los botones siguen siendo fáciles de tocar.'],
  ['🔽','New "Less" button: it hides everything at the bottom except the main buttons. Tap "More" to bring it all back. Your choice is remembered.','Nuevo botón "Menos": oculta todo lo de abajo excepto los botones principales. Toca "Más" para que vuelva todo. Se recuerda tu elección.']]],
 ['8.1',[
  ['🌅','Living skies: drifting clouds, warm sunsets and deeper nights.','Cielos vivos: nubes que se mueven, atardeceres cálidos y noches más profundas.'],
  ['💧','New water that reflects the sky, with ripples, sparkles and foam.','Agua nueva que refleja el cielo, con ondas, destellos y espuma.'],
  ['🐾','Your fauna feels alive: blinks, yawns, stretches, moods and little reactions.','Tu fauna cobra vida: parpadea, bosteza, se estira, tiene estados de ánimo y reacciones.'],
  ['💗','Tap your fauna to pet it — it gets a little happier.','Toca a tu fauna para acariciarla: se pone un poco más feliz.'],
  ['📜','Quests and stories in 29 worlds, with friendly characters, Lux and an egg as rewards.','Misiones e historias en 29 mundos, con personajes amigables, Lux y un huevo de premio.'],
  ['📱','Full screen on phones: the Home Screen app fills the whole screen, and on Android the browser goes full screen after your first tap. Buttons stay clear of the notch.','Pantalla completa en teléfonos: la app de la pantalla de inicio ocupa toda la pantalla y, en Android, el navegador pasa a pantalla completa tras tu primer toque. Los botones no quedan bajo la muesca.'],
  ['✖️','Every panel closes easily on phones: a big ✕ that always stays in view, or tap outside, or press Back. Fixes the Friends panel that could not be closed.','Todos los paneles se cierran fácil en el teléfono: una ✕ grande que siempre se ve, tocar fuera o el botón Atrás. Arregla el panel de Amigos que no se podía cerrar.'],
  ['🧭','Tidier top bar: buttons and pills no longer overlap, with even spacing and sizes.','Barra superior más ordenada: los botones y etiquetas ya no se enciman, con espacios y tamaños parejos.'],
  ['🏷️','This "What\'s new" list and a version label in the corner (tap it to see this again).','Esta lista de "Novedades" y una etiqueta de versión en la esquina (tócala para verla otra vez).']]],
 ['8.0',[
  ['🎨','A cleaner, friendlier look for every panel and button.','Un aspecto más limpio y amable en todos los paneles y botones.'],
  ['🎵','New music that changes as you restore each world, plus new sounds.','Música nueva que cambia al restaurar cada mundo, y sonidos nuevos.'],
  ['🔊','The speaker button opens Sound settings (music and effects volume).','El botón del altavoz abre los ajustes de sonido (volumen de música y efectos).'],
  ['⚔️','Better battles: dodge warning rings, health bars and a boss in every world.','Mejores batallas: anillos de aviso para esquivar, barras de vida y un jefe en cada mundo.']]]];
const css=document.createElement('style');css.textContent=`
#ver81{position:fixed;left:8px;z-index:30;font:700 10px/1.2 var(--font,system-ui),system-ui,sans-serif;color:#fff;background:#0b3d12b3;border:1px solid #ffffff40;border-radius:9px;padding:2px 7px;cursor:pointer;user-select:none;letter-spacing:.2px;opacity:.85}
#ver81:hover{opacity:1}
body:has(#modal:not(.hidden)) #ver81{display:none}
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

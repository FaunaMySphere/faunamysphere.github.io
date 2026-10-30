// v8.1 — "What's new" popup (once per version, at game start) + small always-visible version badge. EN/ES.
// The last seen version lives in localStorage key fs_seen_ver (NOT the save).
(function(){
const VER='8.4',K='fs_seen_ver';window.FS_VER=VER;
const es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')}catch(e){return false}};
const L=(en,s)=>es()?s:en;
const NOTES=[
 ['8.4',[["More realistic worlds: grass tufts, ground detail, sculpted rocks and soft contact shadows; on PC High/Ultra also sun shadows, finer trees, water reflections and a richer sky.","Mundos más realistas: matas de hierba, detalle del suelo, rocas esculpidas y sombras de contacto suaves; en PC Alta/Ultra también sombras del sol, árboles más finos, reflejos en el agua y un cielo más rico."],["Phones on High: soft shadows under fauna and props, and distant fog that blends into the sky.","Móviles en Alta: sombras suaves bajo la fauna y los objetos, y niebla lejana que se funde con el cielo."],["Cleaner top-left corner on phones: your name, then Reload, Help and Language buttons that are easier to tap.","Esquina superior izquierda más limpia en móviles: tu nombre y luego botones de Recargar, Ayuda e Idioma más fáciles de tocar."],["Low quality is unchanged, and add ?v82off to the address to turn the new graphics off.","La calidad Baja no cambia, y añade ?v82off a la dirección para desactivar los nuevos gráficos."]]],
 ['8.3.9',[["On computers, the name box and Adopt button now stay visible at the bottom of the adoption screen.","En ordenador, la casilla del nombre y el botón Adoptar ahora siguen visibles al final de la pantalla de adopción."],["The map says 'Tap' on touch screens and 'Click' with a mouse.","El mapa dice 'Toca' en pantallas táctiles y 'Haz clic' con ratón."],["The Rock Island quest intro now waits until the tutorial ends.","La introducción de la misión de Isla Roca ahora espera a que termine el tutorial."],["The friend gate label is now in Spanish too.","La etiqueta de la puerta de amigos ahora también está en español."]]],
 ['8.3.8',[['🐾 New players now see the title, then adopt their fauna (the title no longer pops back after adopting)','🐾 Los jugadores nuevos ven primero la portada y luego adoptan su fauna (la portada ya no reaparece después de adoptar)'],['📱 The Pool button no longer covers the tutorial\'s Skip button on phones','📱 El botón de Piscina ya no tapa el botón Saltar del tutorial en teléfonos'],['🖥️ On PC the Server pill no longer sits on top of the world name','🖥️ En PC la etiqueta del servidor ya no se encima sobre el nombre del mundo'],['🇪🇸 Spanish fixes: adoption screen, a tutorial step, level-up and egg messages','🇪🇸 Correcciones en español: pantalla de adopción, un paso del tutorial y mensajes de nivel y de huevo']]],
 ['8.3.7',[['🐣 The hatch message and the "egg hatched" card now name the species that really hatched','🐣 El aviso de eclosión y la tarjeta de "huevo eclosionado" ahora muestran la especie que nació de verdad'],['🎚 The Sound panel now shows your saved volumes and the right mute state','🎚 El panel de Sonido ahora muestra tus volúmenes guardados y el estado de silencio correcto'],['🎵 Music comes back at your volume after a dance song, and dance songs follow the Music slider','🎵 La música vuelve a tu volumen después de una canción de baile, y las canciones de baile siguen el control de Música'],['🇪🇸 Spanish fixes for feeding, hatching, faunawear and the fauna list','🇪🇸 Correcciones en español al alimentar, eclosionar, en la faunarropa y en la lista de fauna']]],
 ['8.3.6',[
  ['🛠️','Smoother long sessions on phones: worlds you leave now free their 3D shapes, so memory no longer keeps growing as you travel between worlds.','Sesiones largas más fluidas en teléfonos: los mundos que dejas liberan sus formas 3D, así la memoria ya no sigue creciendo al viajar entre mundos.'],
  ['🏗️','Build fixes: Undo now brings back a house you stored or recolored, the Market shop no longer sells Build items at triple their price, and Build items can no longer be sold back for more than they cost.','Arreglos al construir: Deshacer ahora recupera una casa que guardaste o recoloreaste, la tienda del Mercado ya no vende objetos de Construir al triple de su precio, y esos objetos ya no se pueden revender por más de lo que cuestan.'],
  ['⚠️','Two monsters of the same kind showing up together now give one message (×2) instead of the same message twice.','Dos monstruos del mismo tipo que aparecen juntos ahora dan un solo mensaje (×2) en vez del mismo mensaje dos veces.'],
  ['🌎','Spanish: the room badge says "Sala", "Placed!" is "¡Colocado!", and about 50 item names in the Market and inventory are now in Spanish.','Español: la insignia de la sala dice "Sala", "Placed!" ahora es "¡Colocado!" y unos 50 nombres de objetos del Mercado y del inventario ya están en español.']]],
 ['8.3.5',[
  ['💬','Messages no longer pile up over the quest card on phones: at most 2 show at once, the rest wait their turn, and the same message repeated shows ×2, ×3… instead of stacking.','Los mensajes ya no se amontonan sobre la tarjeta de misión en teléfonos: se ven 2 como máximo, los demás esperan su turno, y un mismo mensaje repetido muestra ×2, ×3… en vez de apilarse.'],
  ['👥','Fixed: opening a shared room link (🔗 Share link) now joins that room again, and reloading inside a private room keeps you in it. Names with an apostrophe (Bo\'s Caretaker) show correctly in visit messages, the room status no longer says online while your phone has no network, and leaving a room no longer reopens it by itself.','Arreglado: abrir un enlace de sala compartido (🔗 Compartir enlace) vuelve a unirte a esa sala, y recargar dentro de una sala privada te mantiene en ella. Los nombres con apóstrofo se ven bien en los mensajes de visita, el estado de la sala ya no dice en línea cuando tu teléfono no tiene red, y salir de una sala ya no la vuelve a abrir sola.']]],
 ['8.3.4',[
  ['📱','Smoother on phones: the scenery in each world is now drawn in fewer batches (up to ~14% fewer draw calls), and it looks exactly the same.','Más fluido en teléfonos: el paisaje de cada mundo se dibuja en menos tandas (hasta ~14% menos llamadas de dibujo) y se ve exactamente igual.'],
  ['👥','Friends online: if a chat relay is down, the game now waits longer between retries and pauses while you are offline, saving battery and data. Friend names from other players are cleaned up before they show.','Amigos en línea: si un servidor de chat no responde, el juego espera más entre reintentos y se pausa mientras no tienes conexión, para ahorrar batería y datos. Los nombres de otros jugadores se limpian antes de mostrarse.']]],
 ['8.3.3',[
  ['⚔️','Clearer battle feedback: one message per defeated monster with the right name and total Lux, one boss announcement, and the screen only shakes when a monster really hits you.','Batallas más claras: un solo mensaje por monstruo derrotado con su nombre correcto y el Lux total, un solo aviso del jefe, y la pantalla solo tiembla cuando un monstruo te golpea de verdad.'],
  ['🐾','If your fauna faints on the zap that defeats a monster, the win now still counts (Lux, XP and quest progress).','Si tu fauna se desmaya con el rayo que derrota a un monstruo, la victoria ahora cuenta (Lux, XP y progreso de misión).'],
  ['📜','Finished quest steps are easy to read again in the quest card.','Los pasos de misión completados vuelven a leerse bien en la tarjeta de misión.']]],
 ['8.3.2',[
  ['🎩','More Spanish: the Faunawear tab, the Collar Store, the Wear and Remove Hat buttons, item types and the Morning Cap gift message.','Más español: la pestaña Ropa de fauna, la Tienda de collares, los botones Ponerse y Quitar gorro, los tipos de objeto y el mensaje del Gorro Mañanero.']]],
 ['8.3.1',[
  ['🛠️','Polish and fixes: Spanish now covers the Save panel, fauna cards and certificates, item cards (energy, counts), the world map tiers, quest guide names and room messages.','Pulido y arreglos: el español ahora cubre el panel de Guardado, las tarjetas y certificados de fauna, las tarjetas de objetos (energía, cantidades), los niveles del mapa, los nombres de los guías de misiones y los mensajes de sala.'],
  ['🐾','Fixes: the Fauna panel showed the wrong number of free spots (now matches 10), and the Tricks wheel no longer stays open behind other windows. The Save panel shows the current version.','Arreglos: el panel de Fauna mostraba mal los espacios libres (ahora cuadra con 10) y la rueda de Trucos ya no se queda abierta detrás de otras ventanas. El panel de Guardado muestra la versión actual.']]],
 ['8.3',[
  ['🏗️','Bigger Build menu: 54 new pieces for your home base in 7 categories: Furniture, Plants, Paths & Fences, Lights, Water, Fauna Play and World Sets (pieces themed on the Rock Garden, Ruins, Frost Village, Whalebone Isthmus, Bogs, Quarry and the sky islands).','Menú de construcción más grande: 54 piezas nuevas para tu casa en 7 categorías: Muebles, Plantas, Caminos y vallas, Luces, Agua, Juegos de fauna y Sets de mundos (piezas inspiradas en el Jardín de rocas, las Ruinas, la Aldea helada, el Istmo de ballena, los Pantanos, la Cantera y las islas del cielo).'],
  ['🎨','Pick a color before you buy, and in Edit Home you can move, rotate, recolor, stack and now resize pieces (⤢ Size).','Elige un color antes de comprar. En Editar casa puedes mover, girar, recolorear, apilar y ahora cambiar el tamaño de las piezas (⤢ Tamaño).'],
  ['🧱','Ground tab: lay free paths (stone, boardwalk, brick, sand, gravel, flower meadow, mossy stone, crystal) and paint tiles. Themes tab: 8 new home-base themes.','Pestaña Suelo: pon caminos gratis (piedra, tablones, ladrillo, arena, grava, prado florido, piedra musgosa, cristal) y pinta casillas. Pestaña Temas: 8 temas nuevos para tu casa.'],
  ['🎾','Fauna play: tap a trampoline, slide, swing, ball and more, and your fauna runs over to play (+5 happiness).','Juegos de fauna: toca una cama elástica, tobogán, columpio, pelota y más, y tu fauna corre a jugar (+5 de felicidad).']]],
 ['8.1.4',[
  ['🏠','When you visit a friend, the "Visiting" card now sits neatly where the world name was, instead of on top of it.','Cuando visitas a un amigo, la tarjeta "Visitando" ahora queda bien en el lugar del nombre del mundo, en vez de encima.']]],
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
body:has(#toast>div) #ver81{visibility:hidden}
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

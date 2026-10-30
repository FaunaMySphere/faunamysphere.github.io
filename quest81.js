// v8.1 PREVIEW (F): a short original questline per world, tied to restoration. EN + ES.
// Save: additive key S.q81 = {zoneId:{s:step,b:counterBase,d:1 when finished}} inside faunasphere_save_v3 — nothing else is touched or wiped.
// Tracker card (v8.0 style) + journal panel. Rewards: Lux per step, Lux + an egg per finished questline. ?v81off disables.
(function(){if(new URLSearchParams(location.search).has('v81off'))return;
const G=window,es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')||(typeof LANG!=='undefined'&&String(LANG).startsWith('es'))}catch(e){return false}},L=(a,b)=>es()?b:a;
// ---- original story per world: guide, title, intro, outro (EN / ES) ----
const STORY={
 rockgarden:['🐌','Pebble the Snail',['The Quiet Garden','El Jardín Silencioso'],['The stones here used to hum when the wind passed. Since the smog came, they are silent. Help me wake them!','Las piedras de aquí zumbaban cuando pasaba el viento. Desde que llegó el smog, están en silencio. ¡Ayúdame a despertarlas!'],['Listen… the stones are humming again! Take this, little caretaker.','Escucha… ¡las piedras vuelven a zumbar! Toma esto, pequeño cuidador.']],
 rockisland:['🦀','Captain Clatter',['Tides of Grit','Mareas de Arena'],['My island is drowning in grime and the tide pools have gone grey. Lend me your fauna\'s zaps!','Mi isla se ahoga en mugre y las pozas se han vuelto grises. ¡Préstame los rayos de tu fauna!'],['The tide pools sparkle again! Old Clatter owes you one.','¡Las pozas vuelven a brillar! El viejo Clatter te debe una.']],
 ruins:['🦉','Elder Hoot',['Echoes of the Ruins','Ecos de las Ruinas'],['The carvings in these ruins tell of a bright forest. Something dark has crept in. Clear it, and the old songs may return.','Los grabados de estas ruinas hablan de un bosque luminoso. Algo oscuro se ha colado. Límpialo y quizá vuelvan los viejos cantos.'],['The carvings glow! The forest remembers its song.','¡Los grabados brillan! El bosque recuerda su canción.']],
 amph:['🐸','Maestro Ribbit',['The Silent Stage','El Escenario Mudo'],['No show can go on in this gloom! The audience has fled from the monsters. Will you clear the stage?','¡Ningún espectáculo puede seguir con esta penumbra! El público huyó de los monstruos. ¿Limpiarás el escenario?'],['Bravo! Bravissimo! The stage is ready for a grand encore.','¡Bravo! ¡Bravísimo! El escenario está listo para un gran bis.']],
 avalanche:['🐧','Scout Flurry',['Under the Snow','Bajo la Nieve'],['The snow up here has turned sooty and the slopes keep rumbling. Help me make the mountain safe!','La nieve se ha vuelto tiznada y las laderas no paran de retumbar. ¡Ayúdame a que la montaña sea segura!'],['Fresh white snow as far as I can see! Thank you, friend.','¡Nieve blanca y fresca hasta donde alcanza la vista! Gracias, amigo.']],
 village:['🦭','Granny Floe',['A Warm Hearth','Un Hogar Cálido'],['Our little village lost its warmth when the smog drifted in. Bring the light back to our homes, dear.','Nuestra aldea perdió su calidez cuando llegó el smog. Devuelve la luz a nuestros hogares, cariño.'],['The lanterns are lit and the cocoa is warm. You are always welcome here.','Los faroles están encendidos y el chocolate caliente. Siempre serás bienvenido aquí.']],
 isthmus:['🦎','Sunny the Gecko',['Bones and Embers','Huesos y Brasas'],['The old whalebones are choking in ash. Even the sun looks tired. Help me clear the path!','Los viejos huesos de ballena se ahogan en ceniza. Hasta el sol parece cansado. ¡Ayúdame a despejar el camino!'],['The bones shine like pearls in the sun. What a sight!','Los huesos brillan como perlas al sol. ¡Qué vista!']],
 bogs:['🐢','Old Mossback',['The Bog Breathes','El Pantano Respira'],['Slow and steady, that is my way… but the bog is sick and cannot wait. Please, hurry.','Lento y seguro, así soy yo… pero el pantano está enfermo y no puede esperar. Por favor, date prisa.'],['Can you hear it? The bog is breathing again. Thank you, young one.','¿Lo oyes? El pantano vuelve a respirar. Gracias, joven.']],
 dungeon:['🦇','Echo the Bat',['Light in the Deep','Luz en las Profundidades'],['Down here, the darkness has teeth. The strongest monsters gather where the smog is thickest. Are you brave enough?','Aquí abajo, la oscuridad tiene dientes. Los monstruos más fuertes se reúnen donde el smog es más espeso. ¿Eres valiente?'],['Light reaches the deepest cave! You are a true hero of the spheres.','¡La luz llega a la cueva más profunda! Eres un verdadero héroe de las esferas.']]};
const BIO={garden:['🐝','Buzzy',['Bloom Again','Florecer de Nuevo'],['The flowers of {w} have closed up tight. Clear the smog so they can bloom!','Las flores de {w} se han cerrado. ¡Limpia el smog para que florezcan!'],['Petals everywhere! {w} is in bloom again.','¡Pétalos por todas partes! {w} florece de nuevo.']],
 rock:['🦔','Prickles',['Shine the Stones','Que Brillen las Piedras'],['Grime covers every rock in {w}. Let\'s make them shine!','La mugre cubre cada roca de {w}. ¡Hagamos que brillen!'],['Sparkly stones all around! {w} looks brand new.','¡Piedras brillantes por todas partes! {w} parece nuevo.']],
 forest:['🦊','Fern the Fox',['Whispering Woods','Bosque Susurrante'],['The trees of {w} have stopped whispering. Something is wrong in the woods.','Los árboles de {w} han dejado de susurrar. Algo va mal en el bosque.'],['The leaves are whispering thanks. {w} is alive again!','Las hojas susurran gracias. ¡{w} vuelve a la vida!']],
 arctic:['🐻‍❄️','Mitts',['Clear Skies, Cold Toes','Cielos Limpios, Pies Fríos'],['Grey snow falls on {w}. Help me find the white again!','Cae nieve gris sobre {w}. ¡Ayúdame a recuperar el blanco!'],['Snowflakes as white as clouds! {w} is saved.','¡Copos tan blancos como las nubes! {w} está a salvo.']],
 scorch:['🦂','Dusty',['Heat and Haze','Calor y Bruma'],['Thick haze hangs over {w}. Even the cacti are coughing!','Una bruma espesa cubre {w}. ¡Hasta los cactus tosen!'],['The air shimmers clean and bright over {w}.','El aire brilla limpio sobre {w}.']],
 swamp:['🦆','Puddles',['Muddy Waters','Aguas Turbias'],['The water in {w} has turned to sludge. My ducklings can\'t swim!','El agua de {w} se ha vuelto lodo. ¡Mis patitos no pueden nadar!'],['Splash! The water is clear and my ducklings are happy.','¡Chapuzón! El agua está clara y mis patitos están felices.']],
 beach:['🐚','Shelly',['Sandcastle Rescue','Rescate de Castillos'],['Smog is washing up on the shores of {w}. Help me tidy the beach!','El smog llega a las orillas de {w}. ¡Ayúdame a limpiar la playa!'],['Golden sand and blue waves. {w} is perfect again!','Arena dorada y olas azules. ¡{w} vuelve a ser perfecto!']],
 sea:['🐙','Inky',['Currents of Hope','Corrientes de Esperanza'],['The currents in {w} carry nothing but murk. Will you help clear the deep?','Las corrientes de {w} solo traen turbiedad. ¿Ayudarás a limpiar el fondo?'],['The currents sparkle! Fish are dancing all over {w}.','¡Las corrientes brillan! Los peces bailan por todo {w}.']],
 candy:['🍬','Taffy',['Sour Sweets','Dulces Amargos'],['Someone made {w} taste sour! Zap the smog and bring the sweetness back.','¡Alguien hizo que {w} supiera amargo! Elimina el smog y devuelve el dulzor.'],['Mmm, sweet again! {w} smells like candy.','¡Mmm, dulce otra vez! {w} huele a caramelo.']],
 mesa:['🐪','Dune',['Winds of the Mesa','Vientos de la Meseta'],['Sooty winds sweep across {w}. Help me calm them.','Vientos tiznados barren {w}. Ayúdame a calmarlos.'],['A clean breeze over {w}. Thank you, traveller.','Una brisa limpia sobre {w}. Gracias, viajero.']],
 night:['🦉','Hush',['Stars Return','Vuelven las Estrellas'],['The glow of {w} is fading under the smog.','El brillo de {w} se apaga bajo el smog.'],['{w} glows like a lantern again.','{w} brilla otra vez como un farol.']],
 dungeon:['🦇','Squeak',['Into the Dark','Hacia la Oscuridad'],['The tunnels of {w} are thick with smog and monsters. Careful!','Los túneles de {w} están llenos de smog y monstruos. ¡Cuidado!'],['The tunnels of {w} are safe once more. Well done!','Los túneles de {w} vuelven a ser seguros. ¡Bien hecho!']]};
const WHO_ES={'Pebble the Snail':'Pebble el Caracol','Captain Clatter':'Capitán Clatter','Elder Hoot':'Anciano Hoot','Scout Flurry':'Exploradora Flurry','Granny Floe':'Abuela Floe','Sunny the Gecko':'Sunny el Geco','Old Mossback':'Viejo Mossback','Echo the Bat':'Echo el Murciélago','Fern the Fox':'Fern el Zorro'};
function zinfo(id){try{return Z(id)}catch(e){return null}}
function story(id){const z=zinfo(id);if(!z)return null;const s=STORY[id]||BIO[z.biome]||BIO.garden,w=z.name;const f=x=>x.replace(/\{w\}/g,w);
 return{ico:s[0],who:es()&&WHO_ES[s[1]]||s[1],title:L(s[2][0],s[2][1]),intro:f(L(s[3][0],s[3][1])),outro:f(L(s[4][0],s[4][1]))}}
function hasQ(id){const z=zinfo(id);return!!(z&&id!=='home'&&id!=='visit'&&(z.poll|0)>0)}
// ---- steps (generated from the world's size so every world works, incl. future ones) ----
function steps(id){const z=zinfo(id),tier=z.tier|0,poll=z.poll|0,tox=z.tox|0,w=z.name;const st=[];
 st.push({k:'visit',n:1,txt:L('Meet '+story(id).who+' in '+w,'Conoce a '+story(id).who+' en '+w),get:()=>S.zone===id?1:0,abs:1});
 const zn=Math.min(poll,3+tier);st.push({k:'zap',n:zn,txt:L('Zap '+zn+' pollution in '+w,'Elimina '+zn+' contaminaciones en '+w),get:()=>(S.stats.zap&&S.stats.zap[id])||0});
 if(tox>0){const mn=Math.min(tox,1+(tier>>1));st.push({k:'mon',n:mn,txt:L('Defeat '+mn+' monster'+(mn>1?'s':'')+' in '+w,'Derrota '+mn+' monstruo'+(mn>1?'s':'')+' en '+w),get:()=>(S.stats.toxZ&&S.stats.toxZ[id])||0})}
 else st.push({k:'pet',n:3,txt:L('Pet your fauna 3 times (tap it)','Acaricia a tu fauna 3 veces (tócala)'),get:()=>S.stats.pet81||0});
 const p=tier<=1?60:75;st.push({k:'rest',n:p,txt:L('Restore '+w+' to '+p+'%','Restaura '+w+' al '+p+'%'),get:()=>S.zone===id&&G.FSrestoreTarget?Math.round(FSrestoreTarget(id)*100):0,abs:1});
 return st}
const stepLux=id=>10+(zinfo(id).tier|0)*5,endLux=id=>40+(zinfo(id).tier|0)*20;
function rec(id){S.q81=S.q81||{};return S.q81[id]}
function prog(id){const r=rec(id),st=steps(id);if(!r)return{st,i:0,p:0,r:null};if(r.d)return{st,i:st.length,p:0,r};const s=st[r.s];if(!s)return{st,i:st.length,p:0,r};const v=s.get();return{st,i:r.s,p:Math.max(0,Math.min(s.n,s.abs?v:v-(r.b||0))),r}}
function startStep(id,i){const r=rec(id),s=steps(id)[i];r.s=i;r.b=s&&!s.abs?s.get():0}
// ---- tick: advance the quest for the current world ----
let introShown={};
function tick(){try{if(typeof S==='undefined'||!S||!fa()||document.getElementById('title'))return draw(null);const id=S.zone;S.stats=S.stats||{};
 if(hasQ(id)){S.q81=S.q81||{};if(!S.q81[id]){S.q81[id]={s:0,b:0};if((S.tut|0)>=5){if(tutOn())S.q81[id].pi=1;else intro(id)}}else if(S.q81[id].pi&&!tutOn()){delete S.q81[id].pi;intro(id)}// v8.3.9: the intro waits until the tutorial ends (it covered the last tutorial step)
  const P=prog(id),r=P.r;if(r&&!r.d){const s=P.st[r.s];if(s&&P.p>=s.n){
   if(r.s>=P.st.length-1){r.d=1;finish(id)}else{gainLux(stepLux(id));toast('📜 '+L('Quest step done!','¡Paso de misión completado!')+' +'+stepLux(id)+' Lux');try{Sound.sfx('coin')}catch(e){}startStep(id,r.s+1)}
   try{save()}catch(e){}}}}
 draw(id)}catch(e){console.warn('q81',e)}}
function finish(id){const s=story(id),lx=endLux(id);gainLux(lx);let egg='';
 try{if(S.zone==='home'&&typeof layEgg==='function')layEgg();else{S.player.pendingEggs=(S.player.pendingEggs||0)+1}egg=L(' and an egg 🥚 (laid at home)',' y un huevo 🥚 (se pone en casa)')}catch(e){}
 try{Sound.sfx(G.FS_A80?'level':'coin')}catch(e){}try{banner(L('QUEST COMPLETE!','¡MISIÓN COMPLETADA!'))}catch(e){}
 toast('📜 '+s.title+' — +'+lx+' Lux'+egg);
 setTimeout(()=>{if(modalFree())open(card(id,true))},900)}
function tutOn(){try{const n=typeof TUT!=='undefined'?TUT.length:8;return (S.tut|0)<n}catch(e){return false}}
function modalFree(){const m=document.getElementById('modal');return!m||m.classList.contains('hidden')}
function intro(id){if(introShown[id])return;introShown[id]=1;setTimeout(()=>{if(S.zone===id&&modalFree())open(card(id))},1800)}
// ---- UI ----
const css=`#q81{position:fixed;left:8px;top:10px;z-index:7;max-width:270px;background:linear-gradient(#45d10ce6,#2fa400e6);color:#fff;border:2px solid #1A5900;border-radius:14px;padding:6px 10px;font:700 12px "Trebuchet MS",sans-serif;text-shadow:0 2px 0 #1A5900;cursor:pointer;box-shadow:0 3px 0 #1A590088,0 6px 14px #0003;user-select:none;-webkit-tap-highlight-color:transparent}
#q81 h4{margin:0 0 3px;font-size:13px;display:flex;gap:6px;align-items:center}#q81 .qs{font-size:12px;opacity:.95}#q81 .qb{height:6px;border-radius:4px;background:#1A590066;margin-top:4px;overflow:hidden}#q81 .qb i{display:block;height:100%;background:linear-gradient(90deg,#ffe25a,#fff7b0);border-radius:4px;transition:width .4s}
#q81.done{opacity:.85}#q81.hidden81{display:none}
@media (pointer:coarse),(max-width:699px){#q81{top:196px;max-width:62vw;padding:4px 9px;font-size:11px}#q81 h4{font-size:12px;margin:0}#q81 .qs{font-size:11px}}
.q81p .qrow{display:flex;gap:8px;align-items:center;margin:6px 0;padding:6px 8px;border-radius:10px;background:#ffffff1f}.q81p .qrow.ok{opacity:.85;color:#e2ffd4;font-weight:inherit}.q81p .qst{font-size:15px;line-height:1.35;margin:6px 0 10px}
.q81p .qnpc{font-size:40px;line-height:1}.q81p .qhd{display:flex;gap:10px;align-items:center}.q81p .qw{display:flex;justify-content:space-between;gap:8px;margin:4px 0;padding:6px 8px;border-radius:10px;background:#ffffff1f}`;
const stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
let el=null;function box(){if(!el){el=document.createElement('div');el.id='q81';el.setAttribute('data-ui','1');document.body.appendChild(el);el.onclick=()=>{const id=S.zone;open(hasQ(id)?card(id):journal())}}return el}
function draw(id){const b=box();if(id==null){b.classList.add('hidden81');return}b.classList.remove('hidden81');let h;
 if(!hasQ(id)){const all=(typeof ZONES!=='undefined'?ZONES:[]).filter(z=>hasQ(z.id)),dn=all.filter(z=>S.q81&&S.q81[z.id]&&S.q81[z.id].d).length;h='<h4>📜 '+L('Quests','Misiones')+' '+dn+'/'+all.length+'</h4>';b.classList.remove('done')}
 else{const P=prog(id),s=P.st[P.i],n=P.st.length;b.classList.toggle('done',!s);
  h='<h4>📜 '+story(id).title+' '+Math.min(P.i+(s?1:0),n)+'/'+n+'</h4>'+(s?'<div class="qs">'+s.txt+' ('+P.p+'/'+s.n+')</div><div class="qb"><i style="width:'+Math.round(100*P.p/s.n)+'%"></i></div>':'<div class="qs">✅ '+L('Complete!','¡Completada!')+'</div>')}
 if(b._h!==h){b._h=h;b.innerHTML=h}}
function card(id,end){const s=story(id),P=prog(id);const rows=P.st.map((x,i)=>{const ok=i<P.i,curr=i===P.i;return'<div class="qrow'+(ok?' ok':'')+'">'+(ok?'✅':curr?'▶️':'▫️')+'<div style="flex:1">'+x.txt+(curr?' <b>('+P.p+'/'+x.n+')</b>':'')+'</div></div>'}).join('');
 return'<div class="q81p"><h2>📜 '+s.title+'</h2><div class="qhd"><div class="qnpc">'+s.ico+'</div><div><b>'+s.who+'</b><div class="qst">“'+(end||P.i>=P.st.length?s.outro:s.intro)+'”</div></div></div>'+rows+
 '<p style="opacity:.8;margin:8px 0 4px">🎁 '+L('Rewards','Recompensas')+': +'+stepLux(id)+' Lux '+L('per step','por paso')+' · +'+endLux(id)+' Lux + 🥚 '+L('at the end','al final')+'</p>'+
 '<button class="btn" data-ui="1" onclick="FS_Q81.journal()">📚 '+L('All quests','Todas las misiones')+'</button></div>'}
function journal(){const all=(typeof ZONES!=='undefined'?ZONES:[]).filter(z=>hasQ(z.id));const rows=all.map(z=>{const r=S.q81&&S.q81[z.id],n=steps(z.id).length,st=r?(r.d?'✅':(r.s+'/'+n)):(S.unlocked&&S.unlocked[z.id]?'▫️':'🔒');return'<div class="qw"><span>'+story(z.id).ico+' <b>'+story(z.id).title+'</b> — '+z.name+'</span><span>'+st+'</span></div>'}).join('');
 return'<div class="q81p"><h2>📚 '+L('Quest Journal','Diario de Misiones')+'</h2><p style="margin:4px 0 8px;opacity:.85">'+L('Each world has its own story. Restore it to finish the quest.','Cada mundo tiene su propia historia. Restáuralo para terminar la misión.')+'</p>'+rows+'</div>'}
G.FS_Q81={tick,journal:()=>open(journal()),card:id=>open(card(id||S.zone)),steps,prog,story};
setInterval(tick,700);
})();

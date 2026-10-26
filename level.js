// v6.11 Player Level (Leo): account-wide level 1-50 (separate from per-fauna levels), XP from activities, species unlocks at 10/20/30/40/50.
// Save fields (safe defaults, added only): S.plv={lv,xp,seen:{},est}. Nothing is removed; owned fauna of gated species are kept.
(function(){
const MAX=50,ES=()=>window.LANG==='es',tr=(en,es)=>ES()?es:en;
const need=l=>Math.round(75*Math.pow(l,1.5)); // XP to go from l to l+1. Lv10 ~8.3k XP (an evening), Lv50 ~500k (long-term)
const OLD=[[10,'flapper'],[20,'reacher'],[30,'wiggler'],[40,'chomper'],[50,'bobbler']]; // v7.5.4: these are unlocked for everyone
// v7.8: new species gated by Player Level (levels chosen not to clash with OLD keys in S.plv.seen)
const UNL=[[5,'bristlepuff'],[15,'ripplet'],[25,'puffpaca'],[35,'glimmer'],[45,'snugglet']].filter(x=>typeof SPECIES!=='undefined'&&SPECIES[x[1]]);
const lockLv=sp=>{const u=UNL.find(x=>x[1]===sp);return u?u[0]:0};
const P=()=>{if(typeof S==='undefined'||!S)return null;if(!S.plv||typeof S.plv!=='object')S.plv={lv:1,xp:0,seen:{}};if(!S.plv.seen)S.plv.seen={};return S.plv};
// v7.5.4 (Leo): every species is unlocked for all players; UNL kept only for history/migration
const ALLUNL=1;const isLocked=sp=>{const p=P(),l=lockLv(sp);return !!(l&&p&&p.lv<l)};
const spN=sp=>{const o=SPECIES[sp]||{};return (ES()&&o.name_es)||o.name||sp};
window.PLV={UNL,need,isLocked,lockLv};
// ---- migration: estimate a starting level for existing saves (never lowers) ----
function totalTo(l){let s=0;for(let i=1;i<l;i++)s+=need(i);return s}
function allUnl(){const p=P();if(!p||!ALLUNL)return;let ch=0;p.eggGiven=p.eggGiven||{};OLD.forEach(([l,sp])=>{if(!p.seen[l]){p.seen[l]=1;ch=1}if(!p.eggGiven[sp]){p.eggGiven[sp]=1;ch=1}});
 if(!S.spAll){S.spAll=1;S.unlockedSp=Object.keys(SPECIES);ch=1}if(ch){try{save()}catch(e){}}} // marks gated unlocks done silently (no egg spam); nothing removed
window.PLV.allUnl=allUnl;
function migrate(){const fresh=!S.plv;const p=P();if(!fresh||p.est)return;p.est=1;
 const st=S.stats||{},zaps=Object.values(st.zap||{}).reduce((a,b)=>a+(+b||0),0),done=Object.keys(S.done||{}).length,
  gen=Math.max(1,...(S.fauna||[]).map(f=>f.gen||1)),inv=Object.values((S.player&&S.player.inv)||{}).reduce((a,b)=>a+(+b||0),0);
 const xp=Math.max(0,zaps*14+done*80+Math.max(0,(S.fauna||[]).length-1)*150+(gen-1)*120+(st.skill||0)*8+(st.buys||0)*4+Math.min(inv,300)*3+(st.tox||0)*30);
 let lv=1,x=xp;while(lv<35&&x>=need(lv)){x-=need(lv);lv++}if(lv>=35)x=0;p.lv=Math.max(p.lv,lv);p.xp=x;
 p.eggGiven=p.eggGiven||{};UNL.forEach(([l,sp])=>{if(p.lv>=l){p.seen[l]=1;p.eggGiven[sp]=1}}); // already-earned unlocks are silent
 if(lv>1)setTimeout(()=>toast('⭐ '+tr('Player Level added! Your progress puts you at Level ','¡Nivel de Jugador añadido! Tu progreso te pone en el Nivel ')+p.lv),3000);
 try{save()}catch(e){}}
// ---- XP gain + level-up ----
function gain(n){const p=P();if(!p||!n||p.lv>=MAX)return;p.xp+=Math.round(n);let up=0;
 while(p.lv<MAX&&p.xp>=need(p.lv)){p.xp-=need(p.lv);p.lv++;up=1}
 if(p.lv>=MAX)p.xp=0;if(up)levelUp();draw()}
window.PLV.gain=gain;
function levelUp(){const p=P();lvBanner(tr('LEVEL ','NIVEL ')+p.lv+'!');toast('🌟 '+tr('You reached Player Level ','¡Alcanzaste el Nivel de Jugador ')+p.lv+'!');
 jingle([523,659,784,1047]);fx('#ffe25a');
 UNL.forEach(([l,sp])=>{if(p.lv>=l&&!p.seen[l]){p.seen[l]=1;setTimeout(()=>celebrate(l,sp),2300)}});try{save()}catch(e){}}
function lvBanner(txt){let b=document.getElementById('plvban');if(!b){b=document.createElement('div');b.id='plvban';document.body.appendChild(b)}b.innerHTML='<b>🌟 '+txt+'</b>';b.classList.remove('on');void b.offsetWidth;b.classList.add('on');clearTimeout(lvBanner.t);lvBanner.t=setTimeout(()=>b.classList.remove('on'),2300)}
function jingle(fr){try{const A=Sound;if(!A.ctx||A.muted)return;fr.forEach((f,i)=>A.tone(f,.18,'triangle',.18,i*.11))}catch(e){}}
function fx(c){const d=document.createElement('div');d.className='plvfx';d.style.setProperty('--c',c);for(let i=0;i<24;i++){const s=document.createElement('i');s.style.setProperty('--a',(i*15)+'deg');d.appendChild(s)}document.body.appendChild(d);setTimeout(()=>d.remove(),2200)}
function giftEgg(sp){const f=fa();if(!f||!S.player)return false;if(S.player.eggs.length>=6)return false;
 const g={...f.genes,species:sp,heatProof:false};const e={id:'egg'+now()+Math.random(),genes:g,parent:tr('Level reward','Premio de nivel'),gen:1,forceSp:sp};
 try{e.genome=genomeFrom(g);e.genome.species=[sp,sp]}catch(x){}S.player.eggs.push(e);return true}
function celebrate(l,sp){const p=P();const ok=p.eggGiven&&p.eggGiven[sp]?true:giftEgg(sp);if(ok){p.eggGiven=p.eggGiven||{};p.eggGiven[sp]=1}
 jingle([392,523,659,784,1047,1319]);fx('#c78bff');
 try{open('<div class="plvcel"><h2>🔓 '+tr('New species unlocked!','¡Nueva especie desbloqueada!')+'</h2><div id="plvpf"></div><p><b>'+spN(sp)+'</b> · '+tr('Level ','Nivel ')+l+'</p><p class="small">'+(ok?tr('A '+spN(sp)+' egg was added to your egg basket. Hatch it in your Nest!','Se añadió un huevo de '+spN(sp)+' a tu cesta. ¡Incúbalo en tu Nido!'):tr('Your egg basket is full. Free a spot and the egg will arrive.','Tu cesta de huevos está llena. Libera un espacio y llegará el huevo.'))+'</p></div>');
  const pf=document.getElementById('plvpf');if(pf&&window.faunaPortrait)pf.appendChild(faunaPortrait({...(fa()||{}).genes,species:sp}))}catch(e){toast('🔓 '+spN(sp))}save()}
// pending eggs when basket was full
setInterval(()=>{const p=P();if(!p)return;UNL.forEach(([l,sp])=>{if(p.lv>=l&&p.seen[l]&&!(p.eggGiven&&p.eggGiven[sp])){if(giftEgg(sp)){p.eggGiven=p.eggGiven||{};p.eggGiven[sp]=1;toast('🥚 '+tr('Your '+spN(sp)+' egg arrived!','¡Llegó tu huevo de '+spN(sp)+'!'));save()}}})},5000);
// ---- XP sources via the game's event bus ----
const E0=emit;emit=window.emit=function(ev,d){try{const z=(typeof Z==='function'&&S)?Z(S.zone):{tier:0},t=(z&&z.tier)||0;
 if(ev==='pop')gain(d&&d.o&&d.o.type==='tox'?40+t*8:10+t*3);else if(ev==='skill')gain(d&&d.l?8+t:4);else if(ev==='goal')gain(80+t*10);else if(ev==='coin')gain(4);else if(ev==='egg')gain(25)}catch(e){}return E0.apply(this,arguments)};
// ---- gating: no gated species from mutation or inheritance ----
if(typeof randAllele==='function'){const ra=randAllele;randAllele=window.randAllele=function(k,v){if(k==='species'){const ok=Object.keys(SPECIES).filter(s=>!isLocked(s));return pick(ok)}return ra(k,v)}}
const H0=R.hatch;R.hatch=function(p){const n=S.home.nest,egg=n&&n.egg,k=S.fauna.length;const r=H0(p);const f=S.fauna[k];
 if(f&&egg){let sp=f.genes.species;if(egg.forceSp)sp=egg.forceSp;else{const pool=Object.keys(SPECIES).filter(s=>!isLocked(s)),last=typeof S.lastHatchSp==='string'?S.lastHatchSp:null,pp=pool.length>1?pool.filter(s=>s!==last):pool;sp=pp.length?pp[Math.floor(Math.random()*pp.length)]:(isLocked(sp)?'hoofer':sp)} // v6.14: new breed every hatch
  if(sp!==f.genes.species){f.genes.species=sp;try{if(f.genome)f.genome.species=[sp,f.genome.species[1]];if(isLocked(f.genome.species[1]))f.genome.species[1]=sp;applyGenome(f)}catch(e){}}S.lastHatchSp=f.genes.species;gain(50)}
 return r};
// ---- HUD ----
function draw(){const p=P();if(!p)return;let b=document.getElementById('plv');const me=document.querySelector('#me .mecol');if(!me)return;
 if(!b){b=document.createElement('div');b.id='plv';b.innerHTML='<b></b><div><i></i></div>';b.onclick=panel;me.insertBefore(b,me.firstChild)}
 b.querySelector('b').textContent=(ES()?'Nv ':'Lv ')+p.lv;b.querySelector('i').style.width=(p.lv>=MAX?100:Math.min(100,p.xp/need(p.lv)*100))+'%';
 b.title=p.lv>=MAX?'MAX':p.xp+' / '+need(p.lv)+' XP'}
function panel(){const p=P();let h='<h2>🌟 '+tr('Player Level ','Nivel de Jugador ')+p.lv+'</h2><p class="small">'+(p.lv>=MAX?tr('Max level!','¡Nivel máximo!'):p.xp.toLocaleString()+' / '+need(p.lv).toLocaleString()+' XP')+'</p><p class="small">'+tr('Earn XP by zapping pollution, beating toxic monsters, gathering, finishing goals and hatching eggs.','Gana XP zapeando contaminación, venciendo monstruos tóxicos, recolectando, completando metas e incubando huevos.')+'</p><h3>'+tr('Species unlocks','Especies por desbloquear')+'</h3>'+unlockList();open(h)}
function unlockList(){const p=P();return '<div class="plvlist">'+UNL.map(([l,sp])=>{const lk=p.lv<l;return '<div class="plvrow'+(lk?' lk':'')+'"><span>'+(lk?'🔒':'✅')+'</span><b>'+spN(sp)+'</b><small>'+(lk?tr('Unlocks at Lv ','Se desbloquea en Nv ')+l:tr('Unlocked','Desbloqueada'))+'</small></div>'}).join('')+'</div>'}
window.PLV.panel=panel;
const U0=window.ui;window.ui=ui=function(v,p){const r=U0.apply(this,arguments);try{if(v==='nest'){const host=document.getElementById('mb');if(host&&!host.querySelector('.plvlist'))host.insertAdjacentHTML('beforeend','<h3>'+tr('Species unlocks','Especies por desbloquear')+'</h3>'+unlockList())}}catch(e){}return r};
// debug: ?plv=10 or localStorage fs_plv_debug=50 forces a level (for testing)
function boot(){if(typeof S==='undefined'||!S||!S.player||!document.getElementById('who')){return setTimeout(boot,500)}
 migrate();allUnl();try{const p=P(),got=[];UNL.forEach(([l,sp])=>{if(p.lv>=l&&!p.seen[l]){p.seen[l]=1;got.push(spN(sp))}});if(got.length){setTimeout(()=>toast('🔓 '+tr('New species unlocked: ','Nuevas especies desbloqueadas: ')+got.join(', ')),3500);save()}}catch(e){}
 const q=new URLSearchParams(location.search).get('plv')||localStorage.getItem('fs_plv_debug');if(q){const p=P(),L=Math.max(1,Math.min(MAX,+q|0));if(L>p.lv){p.lv=L-1;p.xp=0;gain(need(L-1))}}
 draw();setInterval(draw,1000)}
boot();
})();

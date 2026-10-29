// v6.7 monsters: new original monster types on top of the classic viles (they are still 'tox' objects, so zapping,
// rewards, faint.js and saves keep working). Extra fields on the obj: mon (type), el (1 elite, 2 boss), hid (lurker underground).
(function(){
const MON={
 stalker :{en:'Shadow Stalker',es:'Acechador Sombrío',beh:'lunge', hp:1,dmg:3,  every:3800,range:3.2},
 bramble :{en:'Bramble Beast', es:'Bestia de Zarzas',  beh:'chase', hp:2,dmg:2,  every:1500,range:1.6},
 wraith  :{en:'Ice Wraith',    es:'Espectro de Hielo', beh:'ranged',hp:1,dmg:1.6,every:3000,range:4.5},
 lurker  :{en:'Bog Lurker',    es:'Acechador del Pantano',beh:'ambush',hp:2,dmg:4,every:2600,range:2.4},
 scorpion:{en:'Sand Scorpion', es:'Escorpión de Arena',beh:'chase', hp:1,dmg:2.5,every:1800,range:1.6},
 spider  :{en:'Cave Spider',   es:'Araña de Cueva',    beh:'swarm', hp:0,dmg:1,  every:1200,range:1.5}};
window.FS_MON=MON;
const PRE={elite:['Elite ','Élite '],boss:['Boss ','Jefe ']};
try{const es=window.I18N_ES||(window.I18N_ES={});for(const k in MON){es[MON[k].en]=MON[k].es;es[PRE.elite[0]+MON[k].en]=MON[k].es+' '+'de élite';es[PRE.boss[0]+MON[k].en]='Jefe '+MON[k].es}
 Object.assign(es,{'appeared!':'¡apareció!','spat at you!':'¡te escupió!','lunged at you!':'¡se abalanzó sobre ti!','rose from the mud!':'¡surgió del lodo!','defeated!':'¡derrotado!'})}catch(e){}
const tr=s=>{try{return typeof t==='function'?t(s):window.T?window.T(s):s}catch(e){return s}};
const nameOf=o=>{const M=MON[o.mon]||{en:'Monster',es:'Monstruo'},es=(window.LANG||'').startsWith('es');if(es){const b=M.es||tr(M.en);return o.el===2?PRE.boss[1]+b:o.el===1?PRE.elite[1]+b:b}return tr((o.el===2?PRE.boss[0]:o.el===1?PRE.elite[0]:'')+M.en)};
window.FSmonName=nameOf;
// v6.14 zone assignment table. New worlds: FSmonAssign('zoneid',['spider','stalker'],{count:6}) or add to FS_MON_ZONES before entering.
const BIOME={forest:['bramble','stalker'],garden:['bramble','stalker'],arctic:['wraith','stalker'],swamp:['lurker','bramble'],scorch:['scorpion','stalker'],beach:['scorpion','lurker'],mesa:['scorpion','stalker'],
 dungeon:['spider','stalker'],rock:['spider','stalker'],night:['stalker','spider'],candy:['spider','bramble'],sea:['lurker','wraith']};
const ZT=window.FS_MON_ZONES=window.FS_MON_ZONES||{};const NODANGER={home:1,visit:1};window.FS_MON_BIOME=BIOME;
window.FSmonAssign=(id,kinds,opt)=>{ZT[id]=Object.assign({},ZT[id]||{},opt||{},kinds?{kinds:kinds.filter(k=>MON[k])}:{})};
const kindsFor=id=>{const e=ZT[id];if(e&&e.kinds&&e.kinds.length)return e.kinds;const z=Z(id)||{},b=z.biome,i=id;
 if(BIOME[b])return BIOME[b];if(/beach|isthmus|mesa|dune|desert|sand/.test(i))return BIOME.scorch;return['stalker','spider']};
const tierOf=id=>{try{return Math.max(0,(Z(id)||{}).tier|0)}catch(e){return 0}};
// target per zone by tier (old cap was 7 total): tier0 3, 1 4, 2 5, 3 6, 4 7, 5+ 8; elite/boss odds rise with tier
const TARGET=id=>{const e=ZT[id];if(e&&e.count!=null)return e.count;return Math.min(8,3+tierOf(id))};
const LOWQ=()=>{try{return window.GL&&GL.Q==='low'}catch(e){return false}};
const CAP=()=>LOWQ()?6:12;
const isMon=o=>o&&o.type==='tox'&&!!o.mon;
const monsIn=s=>s.objs.filter(isMon);
const danger=id=>!NODANGER[id]&&!(ZT[id]&&ZT[id].count===0);
function baseHp(mon,tier){return mon==='spider'?2:3+(tier>=3?1:0)}   // ~6-8 zaps after v6.10 half damage
function setStats(o,id,el){const t=tierOf(id);o.el=el;o.hp=baseHp(o.mon,t)*(el===2?3:el===1?2:1);o.hp0=o.hp}
function rollEl(id,s){const t=tierOf(id),r=Math.random();const boss=t>=2&&!monsIn(s).some(x=>x.el===2)&&r<.02+.005*t;if(boss)return 2;return Math.random()<.05+.045*t?1:0}
function tag(id,o){if(!o||o.type!=='tox'||o.mon!==undefined)return;if(Math.random()<.25){o.mon=null;return}const ks=kindsFor(id);o.mon=ks[Math.random()<.7?0:ks.length-1];setStats(o,id,rollEl(id,S.zones[id]))}
// tile pickers: spread out (max distance from other monsters and the fauna) or from the island edge
function tilesOf(s){const L=[];for(let i=0;i<s.tiles.length;i++)for(let j=0;j<s.tiles.length;j++)if(s.tiles[i][j]&&!s.objs.some(o=>o.i===i&&o.j===j))L.push([i,j]);return L}
function edgeTiles(s){const n=s.tiles.length,ok=(i,j)=>i>=0&&j>=0&&i<n&&j<n&&s.tiles[i][j];return tilesOf(s).filter(([i,j])=>!ok(i+1,j)||!ok(i-1,j)||!ok(i,j+1)||!ok(i,j-1)||!ok(i+2,j)||!ok(i-2,j)||!ok(i,j+2)||!ok(i,j-2))}
function pickSpread(id,s,cands){const here=id===S.zone,P=rt.pos,M=monsIn(s);let best=null,bv=-1;for(let k=0;k<24&&cands.length;k++){const c=cands[Math.floor(Math.random()*cands.length)];
 let v=M.reduce((m,o)=>Math.min(m,Math.hypot(o.i-c[0],o.j-c[1])),9);if(here){const d=Math.hypot(c[0]-P.i,c[1]-P.j);if(d<4)v-=10;v+=Math.min(d,8)*.2}if(v>bv){bv=v;best=c}}return best}
function spawnMon(id,kind,el,at){const s=S.zones[id];if(!s)return null;const n0=s.objs.length;sp0(id);if(s.objs.length===n0)return null;const o=s.objs[s.objs.length-1];o.mon=kind;setStats(o,id,el);if(at){o.i=at[0];o.j=at[1]}return o}
function near(s,c){for(const[a,b]of[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const i=c[0]+a,j=c[1]+b;if(s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(o=>o.i===i&&o.j===j))return[i,j]}return null}
// one "group": a single monster, a spider swarm, or (tier>=2, 25%) a mixed pack of 2-3 zone types
function spawnGroup(id,room,fromEdge){const s=S.zones[id],ks=kindsFor(id),t=tierOf(id);const c=pickSpread(id,s,fromEdge?edgeTiles(s):tilesOf(s));if(!c||room<1)return 0;
 const k0=ks[Math.random()<.7?0:ks.length-1];let n=0;const first=spawnMon(id,k0,rollEl(id,s),c);if(!first)return 0;n++;
 let extra=[];if(k0==='spider'&&!first.el)extra=['spider','spider'];else if(t>=2&&ks.length>1&&Math.random()<.25)extra=ks.filter(k=>k!==k0).concat(Math.random()<.5?[k0]:[]).slice(0,2);
 for(const k of extra){if(n>=room)break;const p=near(s,[first.i,first.j]);if(!p)break;if(spawnMon(id,k,0,p))n++}return n}
function fill(id){const s=S.zones[id];if(!s||!danger(id))return;const want=Math.min(TARGET(id),CAP());let guard=0;while(monsIn(s).length<want&&guard++<12)spawnGroup(id,want-monsIn(s).length,false)}
// classic tox spawns still get tagged (and never exceed the cap)
const sp0=window.spawnTox;window.spawnTox=function(id){const s=S.zones[id];if(s&&monsIn(s).length>=CAP())return;const n0=s?s.objs.length:0;sp0(id);if(s&&s.objs.length>n0)tag(id,s.objs[s.objs.length-1])};
function tagZone(id){const s=S.zones&&S.zones[id];if(!s)return;s.objs.forEach(o=>{if(o.type==='tox'&&o.mon===undefined)tag(id,o)});
 if(danger(id)&&!s.mon14){s.mon14=1;fill(id)}   // one-time fill per zone (saved with the zone)
 const M=monsIn(s);if(M.length>CAP()){M.sort((a,b)=>Math.hypot(b.i-rt.pos.i,b.j-rt.pos.j)-Math.hypot(a.i-rt.pos.i,a.j-rt.pos.j)).slice(0,M.length-CAP()).forEach(o=>s.objs.splice(s.objs.indexOf(o),1))}}
// Leo's respawn rule: when a zone is cleared of monsters, start a 5 min timer (saved in S.monClr); then 2 monsters arrive from the island edge. Repeats.
let RESP=5*60e3;try{const mm=/[?&]monresp=(\d+)/.exec(location.search),q=(mm&&mm[1])||localStorage.getItem('fs_monresp');if(q&&+q>0)RESP=Math.max(1,+q)*1000}catch(e){}
window.FS_MON_RESPAWN_MS=()=>RESP;
try{Object.assign(window.I18N_ES||(window.I18N_ES={}),{'⚠️ Monsters are back!':'⚠️ ¡Los monstruos volvieron!'})}catch(e){}
function respawnTick(){try{if(typeof S==='undefined'||!S.zones)return;const C=S.monClr&&typeof S.monClr==='object'?S.monClr:(S.monClr={}),T=now();
 for(const id in S.zones){if(!danger(id))continue;const s=S.zones[id];if(!s||!s.mon14)continue;const n=monsIn(s).length;
  if(n>0){if(C[id])delete C[id];continue}
  if(!C[id]){C[id]=T;continue}
  if(T-C[id]>=RESP){let got=0,g=0;while(got<2&&g++<6)got+=spawnGroup(id,2-got,true);delete C[id];
   if(got&&id===S.zone&&fa()){toast(tr('⚠️ Monsters are back!'));const o=monsIn(s)[0];if(o)play(o.mon,'g')}try{save()}catch(e){}}}}catch(e){console.warn('monresp',e)}}
setInterval(respawnTick,2000);
// ---- sounds (synthesized) ----
const SND={
 stalker:{g:()=>{Sound.noise(.6,.12,180,0,'lowpass',null,null,4);Sound.tone(70,.6,'sawtooth',.06,0,-30)},a:()=>{Sound.noise(.25,.2,900,0,'bandpass',null,null,2);Sound.tone(220,.2,'square',.07,0,-160)}},
 bramble:{g:()=>{Sound.tone(55,.7,'sawtooth',.08,0,15);Sound.noise(.5,.1,300,0,'lowpass')},a:()=>{Sound.noise(.15,.2,2500,0,'highpass');Sound.noise(.15,.15,1800,.08,'highpass')}},
 wraith:{g:()=>{Sound.tone(880,1,'sine',.04,0,-300);Sound.tone(1320,1,'sine',.025,.1,-500)},a:()=>{Sound.tone(1500,.3,'triangle',.06,0,-1200);Sound.noise(.3,.08,4000,0,'highpass')}},
 lurker:{g:()=>{Sound.noise(.8,.14,120,0,'lowpass',null,null,6);Sound.tone(45,.8,'sine',.1,0,-10)},a:()=>{Sound.noise(.4,.2,400,0,'bandpass',null,null,3);Sound.tone(90,.4,'sawtooth',.08,0,-50)}},
 scorpion:{g:()=>{for(let k=0;k<5;k++)Sound.noise(.04,.1,3000,k*.06,'bandpass',null,null,8)},a:()=>{Sound.noise(.1,.2,5000,0,'highpass');Sound.tone(600,.12,'square',.05,0,-400)}},
 spider:{g:()=>{for(let k=0;k<6;k++)Sound.noise(.03,.07,6000,k*.04,'highpass')},a:()=>{Sound.noise(.12,.15,3500,0,'bandpass',null,null,5)}}};
const play=(k,w)=>{try{if(window.Sound&&Sound.ctx&&!Sound.muted)SND[k][w]()}catch(e){}};
// ---- behaviour ----
const seen=new Set();let lastG=0;
let lastHurt=0;function hurt(o,base){const f=fa();if(!f||rt.sleep||rt.trans)return;const T0=now();if(T0-lastHurt<1800)return;lastHurt=T0;const m=o.el===2?1.6:o.el===1?1.3:1;f.happiness=clamp(f.happiness-enemyDmg(base*m));emit('hurt');if(f.happiness<=0){try{tooSad()}catch(e){}try{save()}catch(e){}}}
// v8.0 PREVIEW (?v80off disables): attacks are telegraphed first (ring on the ground), then land only if the fauna is still in the zone -> dodging works.
// Telegraph state lives in a WeakMap (never saved). Boss (el 2) adds a ground-slam every 3rd attack.
const V80=!/[?&]v80off/.test(location.search);const TEL=window.FS_TEL=new WeakMap(),CNT=new WeakMap();
const fire=(k,o,x)=>{try{window.dispatchEvent(new CustomEvent('fs80',{detail:Object.assign({k,o},x||{})}))}catch(e){}};
function tel(s,o,t,land,dmg){if(TEL.has(o))return;const zid=S.zone;t.t=now();TEL.set(o,t);fire('tel',o,{t});
 setTimeout(async()=>{TEL.delete(o);if(!s.objs.includes(o)||S.zone!==zid||!fa())return;let hit=false;try{hit=await land()}catch(e){}
  if(hit)hurt(o,dmg);else fire('dodge',o,{t})},t.dur)}
window.FSspawnMon=(id,kind,el,at)=>spawnMon(id,kind,el,at);window.FSmonDanger=id=>danger(id);window.FSmonKinds=id=>kindsFor(id);
function freeAt(s,i,j){return s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(x=>x.i===i&&x.j===j)&&!(Math.round(rt.pos.i)===i&&Math.round(rt.pos.j)===j)}
function stepTo(s,o,ti,tj){const di=Math.sign(ti-o.i),dj=Math.sign(tj-o.j);for(const[a,b]of[[di,dj],[di,0],[0,dj]])if((a||b)&&freeAt(s,o.i+a,o.j+b)){o.i+=a;o.j+=b;return true}return false}
function tick(){try{if(typeof S==='undefined'||!S.zones||!fa()||S.zone==='home'||S.zone==='visit'||document.hidden)return;const id=S.zone,s=zs(id);tagZone(id);const T=now(),P=rt.pos;
 const act=new Set(s.objs.filter(o=>o.type==='tox'&&o.mon).sort((a,b)=>Math.hypot(a.i-P.i,a.j-P.j)-Math.hypot(b.i-P.i,b.j-P.j)).slice(0,2));
 for(const o of s.objs){if(o.type!=='tox'||!o.mon)continue;const m=MON[o.mon],d=Math.hypot(o.i-P.i,o.j-P.j);
  if(d<6&&!seen.has(id+o.id)){seen.add(id+o.id);if(!o.hid){toast('⚠️ '+nameOf(o)+' '+tr('appeared!'));play(o.mon,'g')}}
  if(!act.has(o)||T-(o.nt||0)<m.every*(o.el===2?.8:1))continue;o.nt=T;
  if(V80&&o.el===2&&((CNT.set(o,(CNT.get(o)||0)+1),CNT.get(o))%3===0)&&d<4){tel(s,o,{k:'slam',i:o.i,j:o.j,r:2.3,dur:1000},()=>{o.atk=now();play(o.mon,'a');return Math.hypot(rt.pos.i-o.i,rt.pos.j-o.j)<2.3},m.dmg*1.2)}
  else if(m.beh==='lunge'){if(d<m.range&&d>1.2){const ti=Math.round(P.i),tj=Math.round(P.j);const land=()=>{for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]])if(freeAt(s,ti+a,tj+b)){o.i=ti+a;o.j=tj+b;break}o.atk=now();play('stalker','a')};
   if(V80)tel(s,o,{k:'lunge',i:ti,j:tj,r:1.5,dur:650},()=>{land();const hit=Math.hypot(rt.pos.i-ti,rt.pos.j-tj)<1.5;if(hit)toast('⚠️ '+nameOf(o)+' '+tr('lunged at you!'));return hit},m.dmg);else{land();hurt(o,m.dmg);toast('⚠️ '+nameOf(o)+' '+tr('lunged at you!'))}}else if(d<7)stepTo(s,o,P.i,P.j)}
  else if(m.beh==='chase'||m.beh==='swarm'){if(d<8)stepTo(s,o,Math.round(P.i),Math.round(P.j));if(Math.hypot(o.i-P.i,o.j-P.j)<m.range){if(V80)tel(s,o,{k:'bite',i:Math.round(P.i),j:Math.round(P.j),r:1,dur:m.beh==='swarm'?320:420},()=>{o.atk=now();play(o.mon,'a');return Math.hypot(o.i-rt.pos.i,o.j-rt.pos.j)<m.range+.35},m.dmg);else{o.atk=T;play(o.mon,'a');hurt(o,m.dmg)}}}
  else if(m.beh==='ranged'){if(d<m.range){if(V80){const ti=Math.round(P.i),tj=Math.round(P.j);tel(s,o,{k:'spit',i:ti,j:tj,r:1.3,dur:600},()=>{o.atk=now();o.spit=now();play('wraith','a');return new Promise(res=>setTimeout(()=>res(Math.hypot(rt.pos.i-ti,rt.pos.j-tj)<1.3),450))},m.dmg)}else{o.atk=T;o.spit=T;play('wraith','a');setTimeout(()=>{if(s.objs.includes(o)){hurt(o,m.dmg)}},450)}if(Math.random()<.3)toast('❄️ '+nameOf(o)+' '+tr('spat at you!'))}else if(d<8)stepTo(s,o,P.i,P.j);if(d<2.2){const ai=Math.sign(o.i-P.i),aj=Math.sign(o.j-P.j);if(freeAt(s,o.i+ai,o.j+aj)){o.i+=ai;o.j+=aj}}}
  else if(m.beh==='ambush'){if(o.hid===undefined)o.hid=1;if(o.hid&&d<m.range){o.hid=0;o.atk=T;o.rise=T;play('lurker','g');play('lurker','a');hurt(o,m.dmg);toast('⚠️ '+nameOf(o)+' '+tr('rose from the mud!'))}else if(!o.hid){if(d<m.range){o.atk=T;play('lurker','a');hurt(o,m.dmg*.5)}else if(d>5)o.hid=1}}}
 if(T-lastG>7000){lastG=T;const near=s.objs.filter(o=>o.type==='tox'&&o.mon&&!o.hid).sort((a,b)=>Math.hypot(a.i-P.i,a.j-P.j)-Math.hypot(b.i-P.i,b.j-P.j))[0];if(near&&Math.hypot(near.i-P.i,near.j-P.j)<6)play(near.mon,'g')}}catch(e){console.warn('mon',e)}}
setInterval(tick,300);
// hidden lurkers can't be zapped until they rise; elites pay more
const z0=R.zap;R.zap=function(p){const s=zs(S.zone),o=s.objs.find(x=>x.id===p.oid);if(o&&o.hid){o.hid=0;o.rise=now()}const r=z0.call(this,p);
 if(o&&o.mon&&!s.objs.includes(o)){toast('✨ '+nameOf(o)+' '+tr('defeated!'));if(o.el)try{gainLux(o.el===2?60:20)}catch(e){}}return r};
window.FSmonSpawn=(mon,el)=>spawnMon(S.zone,mon,el|0,null);window.FSmonFill=fill;window.FSmonKinds=kindsFor;window.FSmonTarget=TARGET;
})();

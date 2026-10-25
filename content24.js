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
const tr=s=>{try{return typeof t==='function'?t(s):s}catch(e){return s}};
const nameOf=o=>tr((o.el===2?PRE.boss[0]:o.el===1?PRE.elite[0]:'')+MON[o.mon].en);
window.FSmonName=nameOf;
const kindsFor=id=>{const z=Z(id),b=z.biome,i=id;
 if(b==='forest'||b==='garden')return['bramble','stalker'];if(b==='arctic')return['wraith','stalker'];if(b==='swamp')return['lurker','bramble'];
 if(b==='scorch'||/beach|isthmus|mesa|dune|desert|sand/.test(i))return['scorpion','stalker'];if(b==='dungeon'||b==='rock')return['spider','stalker'];
 if(b==='night')return['stalker','spider'];return['stalker']};
const CAP=()=>{try{return(window.GL&&GL.Q==='low')?4:7}catch(e){return 6}};
function tag(id,o){if(!o||o.type!=='tox'||o.mon!==undefined)return;const r=Math.random();if(r<.25){o.mon=null;return}const ks=kindsFor(id);o.mon=ks[Math.random()<.7?0:ks.length-1];
 const m=MON[o.mon];const er=Math.random();o.el=er<.05?2:er<.18?1:0;o.hp=Math.max(1,(o.hp||2)+m.hp)*(o.el===2?3:o.el===1?2:1);o.hp0=o.hp}
// spawn wrapper: tag, cap, spider swarms
const sp0=window.spawnTox;window.spawnTox=function(id){const s=S.zones[id];if(s&&s.objs.filter(o=>o.type==='tox').length>=CAP())return;const n0=s?s.objs.length:0;sp0(id);const o=s&&s.objs[s.objs.length-1];if(s&&s.objs.length>n0){tag(id,o);
 if(o.mon==='spider'&&!o.el){for(let k=0;k<2&&s.objs.filter(x=>x.type==='tox').length<CAP();k++){const n1=s.objs.length;sp0(id);const q=s.objs[s.objs.length-1];if(s.objs.length>n1&&q.type==='tox'){q.mon='spider';q.el=0;q.hp=1;q.hp0=1}}}}};
function tagZone(id){const s=S.zones&&S.zones[id];if(!s)return;let c=0;s.objs.forEach(o=>{if(o.type==='tox'){c++;if(o.mon===undefined)tag(id,o)}});
 // cap: drop extras beyond the cap (furthest first) to keep phones smooth
 if(c>CAP()){const tx=s.objs.filter(o=>o.type==='tox').sort((a,b)=>Math.hypot(b.i-rt.pos.i,b.j-rt.pos.j)-Math.hypot(a.i-rt.pos.i,a.j-rt.pos.j));tx.slice(0,c-CAP()).forEach(o=>s.objs.splice(s.objs.indexOf(o),1))}}
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
function hurt(o,base){const f=fa();if(!f||rt.sleep||rt.trans)return;const m=o.el===2?1.6:o.el===1?1.3:1;f.happiness=clamp(f.happiness-enemyDmg(base*m));emit('hurt');if(f.happiness<=0){try{tooSad()}catch(e){}try{save()}catch(e){}}}
function freeAt(s,i,j){return s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(x=>x.i===i&&x.j===j)&&!(Math.round(rt.pos.i)===i&&Math.round(rt.pos.j)===j)}
function stepTo(s,o,ti,tj){const di=Math.sign(ti-o.i),dj=Math.sign(tj-o.j);for(const[a,b]of[[di,dj],[di,0],[0,dj]])if((a||b)&&freeAt(s,o.i+a,o.j+b)){o.i+=a;o.j+=b;return true}return false}
function tick(){try{if(typeof S==='undefined'||!S.zones||!fa()||S.zone==='home'||S.zone==='visit'||document.hidden)return;const id=S.zone,s=zs(id);tagZone(id);const T=now(),P=rt.pos;
 for(const o of s.objs){if(o.type!=='tox'||!o.mon)continue;const m=MON[o.mon],d=Math.hypot(o.i-P.i,o.j-P.j);
  if(d<6&&!seen.has(id+o.id)){seen.add(id+o.id);if(!o.hid){toast('⚠️ '+nameOf(o)+' '+tr('appeared!'));play(o.mon,'g')}}
  if(T-(o.nt||0)<m.every*(o.el===2?.8:1))continue;o.nt=T;
  if(m.beh==='lunge'){if(d<m.range&&d>1.2){const ti=Math.round(P.i),tj=Math.round(P.j);for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]])if(freeAt(s,ti+a,tj+b)){o.i=ti+a;o.j=tj+b;break}o.atk=T;play('stalker','a');hurt(o,m.dmg);toast('⚠️ '+nameOf(o)+' '+tr('lunged at you!'))}else if(d<7)stepTo(s,o,P.i,P.j)}
  else if(m.beh==='chase'||m.beh==='swarm'){if(d<8)stepTo(s,o,Math.round(P.i),Math.round(P.j));if(Math.hypot(o.i-P.i,o.j-P.j)<m.range){o.atk=T;play(o.mon,'a');hurt(o,m.dmg)}}
  else if(m.beh==='ranged'){if(d<m.range){o.atk=T;o.spit=T;play('wraith','a');setTimeout(()=>{if(s.objs.includes(o)){hurt(o,m.dmg)}},450);if(Math.random()<.3)toast('❄️ '+nameOf(o)+' '+tr('spat at you!'))}else if(d<8)stepTo(s,o,P.i,P.j);if(d<2.2){const ai=Math.sign(o.i-P.i),aj=Math.sign(o.j-P.j);if(freeAt(s,o.i+ai,o.j+aj)){o.i+=ai;o.j+=aj}}}
  else if(m.beh==='ambush'){if(o.hid===undefined)o.hid=1;if(o.hid&&d<m.range){o.hid=0;o.atk=T;o.rise=T;play('lurker','g');play('lurker','a');hurt(o,m.dmg);toast('⚠️ '+nameOf(o)+' '+tr('rose from the mud!'))}else if(!o.hid){if(d<m.range){o.atk=T;play('lurker','a');hurt(o,m.dmg*.5)}else if(d>5)o.hid=1}}}
 if(T-lastG>7000){lastG=T;const near=s.objs.filter(o=>o.type==='tox'&&o.mon&&!o.hid).sort((a,b)=>Math.hypot(a.i-P.i,a.j-P.j)-Math.hypot(b.i-P.i,b.j-P.j))[0];if(near&&Math.hypot(near.i-P.i,near.j-P.j)<6)play(near.mon,'g')}}catch(e){console.warn('mon',e)}}
setInterval(tick,300);
// hidden lurkers can't be zapped until they rise; elites pay more
const z0=R.zap;R.zap=function(p){const s=zs(S.zone),o=s.objs.find(x=>x.id===p.oid);if(o&&o.hid){o.hid=0;o.rise=now()}const r=z0.call(this,p);
 if(o&&o.mon&&!s.objs.includes(o)){toast('✨ '+nameOf(o)+' '+tr('defeated!'));if(o.el)try{gainLux(o.el===2?60:20)}catch(e){}}return r};
window.FSmonSpawn=(mon,el)=>{const id=S.zone,s=zs(id);sp0(id);const o=s.objs[s.objs.length-1];if(o&&o.type==='tox'){o.mon=mon;o.el=el|0;o.hp=(o.hp+MON[mon].hp)*(el===2?3:el===1?2:1);o.hp0=o.hp}return o};
})();

const QS=new URLSearchParams(location.search);
'use strict';
// ===== Multiplayer-ready architecture =====
// All state lives in S (plain JSON). All mutations go through dispatch(action) -> reducers.
// Net is a stub: later, send actions to a server and apply remote "presence" (other caretakers in a zone).
const Net={send(a){/* future: websocket.send(JSON.stringify(a)) */},others:{}/* zoneId -> [{caretaker,genes,i,j}] */};
const KEY='faunasphere_save_v3',now=()=>Date.now();
let S,T=0;const rt={pos:{i:4,j:4},tgt:null,path:null,face:1,sleep:false,beam:0,hover:null,decor:null,lastTox:0};
function rng(seed){let s=0;for(const ch of seed)s=(s*31+ch.charCodeAt(0))|0;return()=>((s=(s*1103515245+12345)|0)>>>0)/4294967296}
const pick=(a,r=Math.random)=>a[Math.floor(r()*a.length)];
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
function newState(){return{v:2,player:{id:'ct-'+Math.random().toString(36).slice(2,9),name:'Caretaker',lux:30,bux:0,inv:{treat:3},eggMeter:0,eggs:[]},
 fauna:[],active:0,zone:'home',zones:{},done:{},unlocked:{home:1,rockgarden:1},
 stats:{buys:0,zap:{},tox:0,toxZ:{},skill:0,cleared:{}},home:{decor:[],nest:{egg:null,inc:null,at:0},treat:{count:1,last:now()},totem:{last:now()-3e5}},
 tf:{},tut:0,projects:{rockgarden:{prog:0,need:10},village:{prog:0,need:20}},friends:[],visited:{},lastTick:now()}}
const save=()=>{S.lastTick=now();localStorage.setItem(KEY,JSON.stringify(S))};
const fa=()=>S.fauna[S.active];const Z=id=>ZONES.find(z=>z.id===id);
function banner(t){const b=document.getElementById('banner');if(!b)return;b.textContent=t;b.classList.remove('hidden','show');void b.offsetWidth;b.classList.add('show');clearTimeout(banner.t);banner.t=setTimeout(()=>b.classList.add('hidden'),2500)}
function toast(m){const d=document.createElement('div');d.textContent=m;const t=document.getElementById('toast');t.prepend(d);setTimeout(()=>d.remove(),4000);while(t.children.length>4)t.lastChild.remove()}
// ===== Zone generation =====
function genZone(z){const r=rng(z.id),n=z.n,tiles=[],objs=[];let id=0;
 for(let i=0;i<n;i++){tiles[i]=[];for(let j=0;j<n;j++){const dx=i-(n-1)/2,dy=j-(n-1)/2;tiles[i][j]=Math.hypot(dx,dy)<n/2-.2+r()*.6?1:0}}
 const free=()=>{for(let k=0;k<200;k++){const i=1+Math.floor(r()*(n-2)),j=1+Math.floor(r()*(n-2));if(tiles[i][j]&&!objs.some(o=>o.i===i&&o.j===j)&&!(Math.abs(i-n/2)<1&&Math.abs(j-n-2)<1))return[i,j]}return[2,2]};
 const add=(type,x={})=>{const[i,j]=x.at||free();delete x.at;objs.push({id:z.id+'_'+id++,type,i,j,...x})};
 const spots={gate:[n-2,Math.floor(n/2)],goal:[Math.floor(n/2),2],vendor:[2,Math.floor(n/2)],den:[2,2],nest:[2,5],treetree:[5,2],totem:[6,6],project:[Math.floor(n/2)+2,Math.floor(n/2)-2]};
 z.stations.forEach(s=>add(s,{at:spots[s],...(s==='project'?{need:1}:{})}));
 for(const[k,c]of Object.entries(z.nodes))for(let q=0;q<c;q++)add(k,{ready:true,at2:0});
 (z.props||[]).forEach(p=>add(p));
 return{tiles,objs,nextId:id}}
function zs(id){if(!S.zones[id]){const z=Z(id);S.zones[id]=genZone(z);for(let k=0;k<z.poll;k++)spawnPoll(id);for(let k=0;k<z.tox;k++)spawnTox(id)}return S.zones[id]}
function freeTile(id){const s=S.zones[id];for(let k=0;k<300;k++){const i=1+Math.floor(Math.random()*(s.tiles.length-2)),j=1+Math.floor(Math.random()*(s.tiles.length-2));if(s.tiles[i][j]&&!s.objs.some(o=>o.i===i&&o.j===j)&&!(id===S.zone&&Math.round(rt.pos.i)===i&&Math.round(rt.pos.j)===j))return[i,j]}return null}
function spawnPoll(id){const s=S.zones[id],z=Z(id),p=freeTile(id);if(p)s.objs.push({id:id+'_'+s.nextId++,type:'poll',i:p[0],j:p[1],hp:1+Math.floor(Math.random()*Math.min(3,1+z.tier)),v:Math.floor(Math.random()*3)})}
function spawnTox(id){const s=S.zones[id],z=Z(id),p=freeTile(id);if(p)s.objs.push({id:id+'_'+s.nextId++,type:'tox',i:p[0],j:p[1],hp:2+z.tier,v:Math.floor(Math.random()*4)})}
// ===== Reducers (pure game rules; dispatch is the single entry point) =====
// Egg Meter = level meter (sources): Lux fills it, x1.0–1.4 by energy+happiness; full = level up + egg (eggs only laid at home)
function gainLux(n){S.player.lux+=n;const f=fa();if(!f)return;const mult=1+.4*((f.energy+f.happiness)/200);if(f.level<20)S.player.eggMeter+=n*mult*100/(30+f.level*25);checkEgg()}
function checkEgg(){const f0=fa();if(f0&&S.zone==='home'&&S.player.pendingEggs){const k=S.player.pendingEggs;S.player.pendingEggs=0;for(let i=0;i<k;i++)layEgg()}
 while(S.player.eggMeter>=100){S.player.eggMeter-=100;const f=fa();if(f.level<20){f.level++;toast('⭐ '+f.name+' reached level '+f.level+'!');emit('level');banner('Level up!');if(f.level===20){addItem('trophy');setTimeout(()=>open('<h2>🏆 Level 20!</h2><p>'+f.name+' made it to Level 20! What an accomplishment! Their zapper collar turned gold, and a Level 20 Fauna Trophy is in your Goods.</p>'),1500)}}
  if(f.level>=20)S.player.eggMeter=0;if(S.zone!=='home'){S.player.pendingEggs=(S.player.pendingEggs||0)+1;toast('An egg is on the way — it will be laid when you return home.');continue}layEgg()}}
function layEgg(){if(S.player.eggs.length<6){S.player.eggs.push({id:'egg'+now()+Math.random(),genes:{...fa().genes,heatProof:false},parent:fa().name});toast('🥚 '+fa().name+' laid an egg! Hatch it in your Nest.');emit('egg')}else toast('Egg basket full (6).')}
function gainXP(n){return;const f=fa();if(f.level>=20)return;f.xp+=n;while(f.level<20&&f.xp>=xpNeed(f.level)){f.xp-=xpNeed(f.level);f.level++;toast('⭐ '+f.name+' reached level '+f.level+'!');emit('level');banner('Level up!');}}
const xpNeed=l=>40+l*30;
const R={
 adopt({species,name,color}){S.fauna.push(mkFauna({species,color,pattern:'Plain',tail:'Normal',eyes:'Round'},name))},
 zap({oid}){const f=fa(),s=zs(S.zone),o=s.objs.find(o=>o.id===oid),z=Z(S.zone);if(!o)return;
  if(f.energy<3){if(!rt.sleep){rt.sleep=true;toast(f.name+' ran out of energy and is taking a quick nap… 💤');setTimeout(()=>{rt.sleep=false;f.energy=Math.max(f.energy,20);renderHUD()},10000)}return}f.energy=clamp(f.energy-3);rt.beam=now();o.hp-=f.level>=10?2:1;o.hp=Math.max(0,o.hp);emit('hit',o);
  if(o.type==='tox'){f.happiness=clamp(f.happiness-3);emit('hurt');if(f.happiness<=0)return tooSad()}
  if(o.hp>0)return;s.objs.splice(s.objs.indexOf(o),1);
  const tox=o.type==='tox',lux=(tox?12:4)+z.tier*3+Math.floor(Math.random()*4);gainLux(lux);emit('pop',{o,lux});gainXP((tox?30:10)+z.tier*5);
  S.stats.zap[S.zone]=(S.stats.zap[S.zone]||0)+1;if(tox){S.stats.tox++;S.stats.toxZ[S.zone]=(S.stats.toxZ[S.zone]||0)+1}
  let msg='Zapped '+(tox?TOX_NAMES[(o.v||0)%4]:POLL_NAMES[(o.v||0)%3])+'! +'+lux+' Lux';if(!tox&&Math.random()<.3){addItem('silt');msg+=' · +1 Silt'}
  if(S.zone==='rockgarden'||S.zone==='rockisland'){const need=['totem_base','totem_coffer','totem_lowman'].filter(k=>!S.player.inv[k]&&!(S.flags&&S.flags.totemGrid));if(need.length&&Math.random()<.45){const k=need[0];addItem(k);msg+=' · found a '+ITEMS[k].name+'!'}}
  if(Math.random()<.18){const it=pick(['treat','clover','stone','berry']);addItem(it);msg+=' · found '+ITEMS[it].name}toast(msg);
  if(!s.objs.some(o=>o.type==='poll'||o.type==='tox')){S.stats.cleared[S.zone]=1;gainLux(25);toast('🌈 '+z.name+' is clean! +25 Lux. Pollution creeps back over time…')}},
 skill({oid}){const f=fa(),o=zs(S.zone).objs.find(o=>o.id===oid);const need=Object.entries(SKILLS).find(([k,v])=>v.node===o.type)[0];
  if(SPECIES[f.genes.species].skill!==need)return toast('Only fauna who can '+SKILLS[need].verb.toLowerCase()+' can search this. '+SPECIES[f.genes.species].name+'s '+SKILLS[SPECIES[f.genes.species].skill].verb.toLowerCase()+'s.');
  if(!o.ready)return toast('Nothing here right now. Try again later.');if(f.energy<4)return toast(f.name+' is too tired.');
  o.ready=false;o.at2=now()+9e4;f.energy=clamp(f.energy-4);S.stats.skill++;const it={tree:S.zone==='village'?'berry':pick(['berry','berry','clover']),pool:'fish',rock:'stone',stump:'truffle'}[o.type];addItem(it);const l=6+Z(S.zone).tier*2;gainLux(l);gainXP(8);emit('skill',{o,l});
  toast(f.name+' used '+SKILLS[need].verb+'! Found '+ITEMS[it].name+' +'+l+' Lux')},
 feed({item}){const f=fa(),it=ITEMS[item];if(!S.player.inv[item])return;S.player.inv[item]--;
  if(it.type==='gene'){Object.assign(f.genes,it.gene);toast(f.name+' ate '+it.name+'. Something changed!');if(item==='gene_heat')S.flags={...S.flags,heat:1};return}
  const fav=SPECIES[f.genes.species].fav===item?2:1;S.tf.fed=1;emit('eat',{fav:fav>1});f.energy=clamp(f.energy+it.e*fav);f.happiness=clamp(f.happiness+it.h*fav);toast(f.name+(fav>1?' LOVES ':' eats ')+it.name+'!')},
 combine({r}){const rc=RECIPES[r];if(!Object.entries(rc.in).every(([k,v])=>(S.player.inv[k]||0)>=v))return toast('Missing ingredients.');for(const[k,v]of Object.entries(rc.in))S.player.inv[k]-=v;addItem(rc.out);toast('Made '+ITEMS[rc.out].name+'!')},
 buy({item,price,cur}){if(cur==='bux')return toast('Bux was the premium currency. This revival has no payments.');if(S.player.lux<price)return toast('Not enough Lux.');S.player.lux-=price;addItem(item);S.stats.buys++;if(item==='helianth')S.stats.helianth=(S.stats.helianth||0)+1;emit('coin');toast('Bought '+ITEMS[item].name+'.')},
 claim({gid}){const g=GOALS.find(g=>g.id===gid);if(S.done[gid]||!g.check(S))return;S.done[gid]=1;if(g.take){g.take.forEach(k=>S.player.inv[k]=Math.max(0,(S.player.inv[k]||1)-1));S.flags={...S.flags,totemGrid:1}}gainLux(g.lux);emit('goal');banner('GOAL COMPLETE');if(g.item)addItem(g.item);
  ZONES.filter(z=>z.unlock===gid).forEach(z=>{S.unlocked[z.id]=1;toast('🔓 New land unlocked: '+z.name+'!')});toast('Goal complete! +'+g.lux+' Lux'+(g.item?' + '+ITEMS[g.item].name:''))},
 travel({zone}){const z=Z(zone);if(!S.unlocked[zone])return toast('Locked — complete Goal Station goals to open the way.');if(z.heat&&!fa().genes.heatProof)return toast('Too scorching for '+fa().name+'! Feed Heat Proof Gene Food first.');
  S.zone=zone;zs(zone);Sound.biome=z.biome;cam.x=null;parts.length=0;const g=S.zones[zone].objs.find(o=>o.type==='gate');rt.pos={i:g.i-1,j:g.j};rt.cam=null;rt.tgt=null;rt.sleep=false;rt.decor=null;if(zone==='home')setTimeout(checkEgg,800)},
 rest(){rt.sleep=true;toast(fa().name+' curls up in the Den. 💤')},
 collectTreats(){const t=S.home.treat;if(!t.count)return toast('The Treat Tree is still growing treats.');addItem('treat',t.count);S.tf.treat=1;emit('skill',{o:zs('home').objs.find(o=>o.type==='treetree'),l:0});toast('Picked '+t.count+' Treats!');t.count=0;t.last=now()},
 totem(){const t=S.home.totem;if(now()-t.last<3e5)return toast('Totem is crafting… ready in '+Math.ceil((3e5-(now()-t.last))/6e4)+' min.');t.last=now();addItem('component');gainLux(5);toast('Your Totem produced a Biorock Disc 💿')},
 donate({proj}){const p=S.projects[proj];if(!S.player.inv.component)return toast('You need Biorock Discs (from the Totem in your Faunasphere).');S.player.inv.component--;p.prog++;gainXP(15);toast('Donated! Project '+p.prog+'/'+p.need);
  if(p.prog>=p.need){p.prog=0;p.done=(p.done||0)+1;addItem(proj==='village'?'gene_teal':'d_lantern');gainLux(100);toast('🎉 Community project complete! Reward added to your Bag.')}},
 incubate({egg,fid}){const n=S.home.nest;if(n.egg)return;const e=S.player.eggs.find(e=>e.id===egg);if(!e)return;S.player.eggs=S.player.eggs.filter(x=>x!==e);n.egg=e;n.inc=S.fauna[fid].genes;n.at=now()+3e4;toast('Egg placed in the Nest. It will hatch soon!')},
 hatch({name}){const n=S.home.nest;if(!n.egg||now()<n.at)return;if(S.fauna.length>=3)return toast('All 3 fauna slots are full. Release one in the Fauna panel first.');
  const a=n.egg.genes,b=n.inc,mix=k=>Math.random()<.5?a[k]:b[k],g={species:mix('species'),color:mix('color'),pattern:mix('pattern'),tail:mix('tail'),eyes:mix('eyes')};
  if(Math.random()<.25)g.species=pick(Object.keys(SPECIES));if(Math.random()<.15)g.color=pick(Object.keys(COLORS));if(Math.random()<.15)g.pattern=pick(PATTERNS);if(Math.random()<.1)g.tail=pick(TAILS);if(Math.random()<.1)g.eyes=pick(EYES);
  S.fauna.push(mkFauna(g,name||'Hatchling'));n.egg=null;emit('egg');Sound.sfx('hatch');banner('EGG HATCHED');toast('🐣 A '+SPECIES[g.species].name+' hatched!');setTimeout(()=>ui('cert',{fid:S.fauna.length-1}),900)},
 rename({fid,name}){const f=S.fauna[fid];if(f&&name)f.name=String(name).slice(0,16)},
 goodie({k}){const day=new Date().toDateString();if(S.goodie===day)return;S.goodie=day;const it=pick(['treat','berry','clover','tart','namechanger','d_flower','gene_pink','helianth']);addItem(it);emit('coin');toast('Daily Goodie Grab: you got '+ITEMS[it].name+'!')},
 setActive({fid}){if(S.zone!=='home')return toast('You can switch fauna on your home island.');S.active=fid;rt.sleep=false},
 release({fid}){if(S.fauna.length<=1||!confirm('Release '+S.fauna[fid].name+'? This cannot be undone.'))return;S.fauna.splice(fid,1);S.active=0},
 place({item,i,j}){if(!S.player.inv[item])return;if(S.player.lux<25)return toast('Placing a decoration costs 25 Lux.');S.player.lux-=25;S.player.inv[item]--;S.home.decor.push({item,i,j});syncHomeDecor()},
 pickup({idx}){const d=S.home.decor.splice(idx,1)[0];addItem(d.item);syncHomeDecor()},
 visit({who}){const k=who+new Date().toDateString();if(!S.visited[k]){S.visited[k]=1;gainLux(15);addItem('treat');toast('Visited '+who+'\'s Faunasphere — their Totem gave you 15 Lux and a Treat!')}else toast('You already visited '+who+' today.')}};
function mkFauna(genes,name){return{id:'f'+now()+Math.floor(Math.random()*999),name:String(name).slice(0,16),genes,level:1,xp:0,happiness:85,energy:85,born:now()}}
function tooSad(){toast('💔 '+fa().name+' is too unhappy and warps home to recover.');R.travel({zone:'home'})}
function addItem(k,n=1){S.player.inv[k]=(S.player.inv[k]||0)+n}
function syncHomeDecor(){const s=zs('home');s.objs=s.objs.filter(o=>o.type!=='decor');S.home.decor.forEach((d,idx)=>s.objs.push({id:'dec'+idx,type:'decor',item:d.item,i:d.i,j:d.j,idx}))}
function dispatch(type,p={}){if(!R[type])return;R[type](p);Net.send({type,p,who:S.player.id,t:now()});save();renderHUD()}
// ===== Simulation tick =====
function simulate(dt){const f=fa();if(!f)return;const m=dt/6e4;
 if(rt.sleep){f.energy=clamp(f.energy+dt/1000*3);f.happiness=clamp(f.happiness+dt/1000*.6);if(f.energy>=100){rt.sleep=false;toast(f.name+' wakes up refreshed!')}}
 else S.fauna.forEach(x=>{x.energy=clamp(x.energy-.5*m,8);x.happiness=clamp(x.happiness-.35*m,8)});
 const h=S.home.treat;while(h.count<3&&now()-h.last>12e4){h.count++;h.last+=12e4}if(h.count>=3)h.last=now();
 for(const[id,s]of Object.entries(S.zones)){for(const o of s.objs)if(o.at2&&now()>o.at2){o.ready=true;o.at2=0}
  const z=Z(id),pc=s.objs.filter(o=>o.type==='poll').length,tc=s.objs.filter(o=>o.type==='tox').length;
  if(id===S.zone&&Math.random()<dt/3e4){if(pc<z.poll)spawnPoll(id);else if(tc<z.tox)spawnTox(id)}}}
// ===== Rendering (v3) =====
const cv=document.getElementById('cv'),cx=cv.getContext('2d');let W,H,sc=1,ox=0,oy=0,DPR=1;
const lightCv=document.createElement('canvas'),lx=lightCv.getContext('2d');
function resize(){const r=cv.getBoundingClientRect();DPR=Math.min(2,devicePixelRatio||1);cv.width=Math.round(r.width*DPR);cv.height=Math.round(r.height*DPR);lightCv.width=cv.width;lightCv.height=cv.height;W=r.width;H=r.height}
addEventListener('resize',resize);
const iso=(i,j)=>[(i-j)*TW/2,(i+j)*TH/2];
const cam={zoom:1,x:null,y:null};
function camera(n){const fit=Math.min(W/((n+.6)*TW),H/((n+3.2)*TH+CD));const base=W<600?Math.max(fit,W/(6.4*TW)):fit;sc+=((base*cam.zoom)-sc)*(cam.x===null?1:.15);
 const[cxw,cyw]=iso((n-1)/2,(n-1)/2),[fx,fy]=iso(rt.pos.i,rt.pos.j),follow=clamp((n*TW*sc-W*.85)/(W*.4),0,1);
 const tx=W/2-(cxw+(fx-cxw)*follow)*sc,ty=H*.5-(cyw+(fy-cyw)*follow)*sc;if(cam.x===null){cam.x=tx;cam.y=ty}cam.x+=(tx-cam.x)*.08;cam.y+=(ty-cam.y)*.08;ox=cam.x;oy=cam.y}
// --- particles & feedback ---
const parts=[],weather=[];
function P(o){parts.push({life:1,vx:0,vy:0,g:0,size:3,decay:.02,...o})}
function burst(x,y,n,col,spd=2,opt={}){for(let k=0;k<n;k++){const a=Math.random()*6.28,s=spd*(.4+Math.random());P({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s*.6-1.5,g:.08,col,decay:.02+Math.random()*.02,...opt})}}
function floatText(x,y,text,col){P({x,y,vy:-.7,text,col,decay:.011})}
function updParts(){for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.life-=p.decay}for(let i=parts.length-1;i>=0;i--)if(parts[i].life<=0)parts.splice(i,1);if(parts.length>260)parts.splice(0,parts.length-260)}
function drawParts(){for(const p of parts){cx.globalAlpha=clamp(p.life*1.6,0,1);if(p.text){cx.font='bold 15px "Trebuchet MS",sans-serif';cx.textAlign='center';cx.lineWidth=4;cx.strokeStyle='#000a';cx.strokeText(p.text,p.x,p.y);cx.fillStyle=p.col;cx.fillText(p.text,p.x,p.y);cx.textAlign='left'}
 else if(p.heart){cx.fillStyle=p.col;cx.font='13px sans-serif';cx.fillText('♥',p.x,p.y)}else{cx.fillStyle=p.col;cx.beginPath();cx.arc(p.x,p.y,p.size*Math.max(.2,p.life)+.4,0,7);cx.fill()}}cx.globalAlpha=1}
const mePos=()=>iso(rt.pos.i,rt.pos.j);
function emit(ev,d={}){if(typeof parts==='undefined')return;const[mx,my]=mePos();const op=o=>iso(o.i,o.j);
 if(ev==='hit'){Sound.sfx('zap');rt.zapT=now();const[x,y]=op(d);burst(x,y-16,8,'#d9ff6a',2.5);rt.shake=3}
 if(ev==='pop'){Sound.sfx('pop');setTimeout(()=>Sound.sfx('coin'),120);const[x,y]=op(d.o);burst(x,y-12,22,d.o.type==='tox'?'#b26be0':'#9be15a',3.5);burst(x,y-12,10,'#fff6a0',2,{size:2});floatText(x,y-34,'+'+d.lux+' Lux','#ffe25a')}
 if(ev==='level'){Sound.sfx('level');for(let k=0;k<34;k++)P({x:mx,y:my-30,vx:(Math.random()-.5)*5,vy:-Math.random()*4-1,g:.1,col:pick(['#ffe25a','#7ad','#ff8fb1','#8f8']),decay:.014});floatText(mx,my-64,'LEVEL UP!','#fff');rt.happyT=now()}
 if(ev==='egg'){Sound.sfx('egg');floatText(mx,my-64,'🥚 Egg!','#fff')}
 if(ev==='skill'&&d.o){Sound.sfx('skill');const[x,y]=op(d.o);burst(x,y-24,16,'#fff9b0',2.5,{size:2.5});if(d.l)floatText(x,y-40,'+'+d.l+' Lux','#ffe25a');rt.happyT=now()}
 if(ev==='eat'){Sound.sfx('eat');for(let k=0;k<(d.fav?9:4);k++)P({x:mx+(Math.random()-.5)*24,y:my-40,vy:-.8-Math.random(),vx:(Math.random()-.5)*.6,heart:1,col:'#ff6f9f',decay:.014});rt.happyT=now()}
 if(ev==='hurt'){Sound.sfx('hurt');floatText(mx,my-56,'-3 ♥','#ff7a8a')}
 if(ev==='coin')Sound.sfx('coin');if(ev==='goal'){Sound.sfx('level');rt.happyT=now();burst(mx,my-40,24,'#ffe25a',3)}}
// --- atmosphere ---

function nightAmt(){if(QS.has('night'))return 1;if(QS.has('day'))return 0;const h=new Date().getHours()+new Date().getMinutes()/60;if(h>=20.5||h<5)return 1;if(h>=18.5)return(h-18.5)/2;if(h<7)return(7-h)/2;return 0}
function drawSky(pal,z,nt){const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,shade(pal[4],-nt*.6));g.addColorStop(1,shade(pal[5],-nt*.5));cx.fillStyle=g;cx.fillRect(0,0,W,H);
 if(nt>.3||z.biome==='dungeon'){cx.fillStyle='#fff';for(let k=0;k<60;k++){cx.globalAlpha=(.3+.7*Math.abs(Math.sin(T/900+k)))*(z.biome==='dungeon'?.3:nt);cx.fillRect(hash(k,1)*W,hash(k,2)*H*.6,1.5,1.5)}cx.globalAlpha=1}
 if(z.biome!=='dungeon'&&nt<.9){const sx=W*.82,sy=H*.14;const sg=cx.createRadialGradient(sx,sy,4,sx,sy,70);sg.addColorStop(0,'#fffbe0');sg.addColorStop(.25,'#fff3b080');sg.addColorStop(1,'#fff3b000');cx.fillStyle=sg;cx.fillRect(sx-70,sy-70,140,140)}
 const px=(ox-W/2)*.12,py=(oy-H/2)*.08;
 for(let k=0;k<(z.biome==='dungeon'?0:4);k++){const x=((k*W*.31+T/500+px)%(W+200)+W+200)%(W+200)-100,y=H*(.16+.2*(k%3))+py,s=.5+(k%2)*.3;cx.globalAlpha=.55;cx.fillStyle=shade(pal[0],.25-nt*.4);cx.beginPath();cx.ellipse(x,y,40*s,12*s,0,0,7);cx.fill();cx.fillStyle=shade(pal[1],.3-nt*.4);cx.beginPath();cx.moveTo(x-38*s,y);cx.lineTo(x,y+40*s);cx.lineTo(x+38*s,y);cx.fill();cx.globalAlpha=1}
 if(z.biome!=='dungeon')for(let L=0;L<2;L++)for(let k=0;k<4;k++){const x=((k*W/3.2+T/(L?55:120)+px*(L+1))%(W+260)+W+260)%(W+260)-130,y=26+k*34+L*60;cx.fillStyle=nt>.5?'#ffffff18':L?'#ffffffaa':'#ffffff66';for(const[a,b,r]of[[0,0,26],[22,4,20],[-22,5,18],[8,-10,18]]){cx.beginPath();cx.arc(x+a*(1+L*.3),y+b,r*(1+L*.3),0,7);cx.fill()}}}
function underside(s,n,pal,z){const pts=[],[cx0,cy0]=iso((n-1)/2,(n-1)/2),L=iso(0,n-1)[0]-TW/2,R=iso(n-1,0)[0]+TW/2,top=cy0+CD+14,tip=cy0+n*TH*1.25;
 pts.push(L,top);for(let k=1;k<10;k++){const u=k/10,x=L+(R-L)*u,yy=top+Math.sin(u*Math.PI)*(tip-top)*(.75+hash(k,n)*.35);pts.push(x,yy)}pts.push(R,top);
 cx.beginPath();cx.moveTo(pts[0],pts[1]);for(let k=2;k<pts.length;k+=2)cx.lineTo(pts[k],pts[k+1]);cx.closePath();cx.fillStyle=lg(cx,0,top,0,tip,shade(pal[2],-.15),shade(pal[2],-.65));cx.fill();
 cx.strokeStyle=shade(pal[2],-.4);cx.lineWidth=2;for(let k=0;k<7;k++){const x=L+(R-L)*(.15+k*.12),y=top+(tip-top)*(.15+hash(k,7)*.2);cx.beginPath();cx.moveTo(x,y);cx.lineTo(x+(hash(k,3)-.5)*14,y+18+hash(k,4)*14);cx.stroke()}
 if(z.biome!=='dungeon'&&z.biome!=='arctic'){cx.strokeStyle='#4a7a3a';cx.lineWidth=1.5;for(let k=0;k<6;k++){const x=L+(R-L)*(.1+k*.16);cx.beginPath();cx.moveTo(x,top);cx.quadraticCurveTo(x+Math.sin(T/900+k)*6,top+20,x+Math.sin(T/700+k)*4,top+30+hash(k,9)*20);cx.stroke()}}}
function weatherTick(z,nt){const want={arctic:'snow',swamp:'bubble',forest:'leaf',scorch:'ember',dungeon:'dust'}[z.biome]||(nt>.5?'firefly':null);if(!want){weather.length=0;return}
 const max=want==='snow'?70:want==='firefly'?18:25;if(weather.length&&weather[0].k!==want)weather.length=0;while(weather.length<max)weather.push({k:want,x:Math.random()*W,y:Math.random()*H,p:Math.random()*6});
 for(const w of weather){w.p+=.02;if(w.k==='snow'){w.y+=.7;w.x+=Math.sin(w.p)*.4}else if(w.k==='bubble'||w.k==='ember'){w.y-=.5;w.x+=Math.sin(w.p)*.3}else if(w.k==='leaf'){w.y+=.5;w.x+=Math.sin(w.p)*.8+.3}else{w.x+=Math.sin(w.p)*.4;w.y+=Math.cos(w.p*.7)*.3}
  if(w.y>H+10)w.y=-10;if(w.y<-10)w.y=H+10;if(w.x>W+10)w.x=-10;if(w.x<-10)w.x=W+10;
  const a={snow:['#ffffff',2.2],bubble:['#c8f08a99',3],leaf:['#e0a03a',2.6],ember:['#ffb04acc',1.8],dust:['#ffffff55',1.2],firefly:['#f6ff9a',2]}[w.k];cx.fillStyle=a[0];if(w.k==='firefly')cx.globalAlpha=.4+.6*Math.abs(Math.sin(w.p*2));
  cx.beginPath();if(w.k==='leaf')cx.ellipse(w.x,w.y,a[1]*1.6,a[1]*.8,w.p,0,7);else cx.arc(w.x,w.y,a[1],0,7);cx.fill();cx.globalAlpha=1}}
function lighting(lights,nt,z){const dark=Math.max(z.biome==='dungeon'?.6:0,nt*.5);if(dark<.04)return;const tf=(x,y)=>[ox+x*sc,oy+y*sc];
 lx.setTransform(DPR,0,0,DPR,0,0);lx.globalCompositeOperation='source-over';lx.clearRect(0,0,W,H);lx.fillStyle=`rgba(${z.biome==='dungeon'?'12,8,30':'14,22,60'},${dark})`;lx.fillRect(0,0,W,H);lx.globalCompositeOperation='destination-out';
 const[mx,my]=mePos();const all=[[mx,my-20,110,'#fff'],...lights];for(const[x,y,r]of all){const[sx,sy]=tf(x,y),R=r*sc;const g=lx.createRadialGradient(sx,sy,0,sx,sy,R);g.addColorStop(0,'rgba(0,0,0,.95)');g.addColorStop(1,'rgba(0,0,0,0)');lx.fillStyle=g;lx.fillRect(sx-R,sy-R,R*2,R*2)}
 cx.drawImage(lightCv,0,0,W,H);cx.globalCompositeOperation='lighter';for(const[x,y,r,c]of lights){const[sx,sy]=tf(x,y),R=r*sc*.7;const g=cx.createRadialGradient(sx,sy,0,sx,sy,R);g.addColorStop(0,c+'55');g.addColorStop(1,c+'00');cx.fillStyle=g;cx.fillRect(sx-R,sy-R,R*2,R*2)}cx.globalCompositeOperation='source-over'}
function draw(){T=now();const z=Z(S.zone),s=zs(S.zone),pal=BIOMES[z.biome],n=z.n,nt=z.biome==='dungeon'?0:nightAmt();camera(n);cx.setTransform(DPR,0,0,DPR,0,0);
 drawSky(pal,z,nt);const shk=rt.shake>.3?(rt.shake*=.85,(Math.random()-.5)*rt.shake):0;
 cx.save();cx.translate(ox+shk,oy);cx.scale(sc,sc);underside(s,n,pal,z);const lights=[],T2=s.tiles;
 for(let d=0;d<2*n;d++)for(let i=0;i<n;i++){const j=d-i;if(j<0||j>=n||!T2[i][j])continue;const[x,y]=iso(i,j),sl=!(T2[i][j+1]),sr=!(T2[i+1]&&T2[i+1][j]);
  tile(cx,x,y,pal,i,j,sl,sr,(sl||sr)?16:0,z.biome);if(!s.objs.some(o=>o.i===i&&o.j===j))tileDeco(cx,x,y,z.biome,i,j,T);
  if(rt.decor&&rt.hover&&rt.hover[0]===i&&rt.hover[1]===j)poly(cx,[x,y-TH/2,x+TW/2,y,x,y+TH/2,x-TW/2,y],'#ffff0066')}
 if(rt.tgt&&!rt.onArrive){const[x,y]=iso(...rt.tgt);cx.strokeStyle='#ffffffaa';cx.lineWidth=2;cx.beginPath();cx.ellipse(x,y,14+Math.sin(T/120)*2,7,0,0,7);cx.stroke()}
 const ents=s.objs.map(o=>({o,d:o.i+o.j,i:o.i,j:o.j}));ents.push({me:1,d:rt.pos.i+rt.pos.j+.01,i:rt.pos.i,j:rt.pos.j});
 (Net.others[S.zone]||[]).forEach(p=>ents.push({other:p,d:p.i+p.j,i:p.i,j:p.j}));ents.sort((a,b)=>a.d-b.d);
 const zapA=clamp(1-(T-(rt.zapT||0))/220,0,1);
 for(const e of ents){const[x,y]=iso(e.i,e.j);
  if(e.me){const f=fa();drawFauna(cx,f.genes,x,y,.74,T,rt.face,'',{walk:!!rt.tgt,zap:zapA,happy:T-(rt.happyT||0)<1400,sleep:rt.sleep});
   if(rt.sleep&&T%1200<30)P({x:x+10,y:y-40,vy:-.5,vx:.3,text:'z',col:'#fff',decay:.012});
   if(zapA>0&&rt.tgtObj){const[tx,ty]=iso(rt.tgtObj.i,rt.tgtObj.j),sx=x+10*rt.face,sy=y-26;cx.save();cx.globalCompositeOperation='lighter';for(const[w,c]of[[7,'#6dff3a55'],[3,'#e8ffb0']]){cx.strokeStyle=c;cx.lineWidth=w;cx.beginPath();cx.moveTo(sx,sy);for(let k=1;k<6;k++){const u=k/6;cx.lineTo(sx+(tx-sx)*u+(Math.random()-.5)*8,sy+(ty-14-sy)*u+(Math.random()-.5)*8)}cx.lineTo(tx,ty-14);cx.stroke()}cx.restore();lights.push([tx,ty-14,50,'#bfff5a'])}continue}
  if(e.other){drawFauna(cx,e.other.genes,x,y,.62,T,1);continue}
  const o=e.o,near=Math.hypot(o.i-rt.pos.i,o.j-rt.pos.j)<2.2,hov=rt.hover&&rt.hover[0]===o.i&&rt.hover[1]===o.j;
  if(isClickable(o)&&(near||hov))glow(cx,x,y,T);
  if(o.type==='treetree')o.count=S.home.treat.count;if(o.type==='totem')o.ready=now()-S.home.totem.last>=3e5;if(o.type==='nest')o.egg=!!S.home.nest.egg;
  if(o.type==='project'){const p=S.projects[S.zone];o.prog=p.prog;o.need=p.need}if(o.type==='goal')o.alert=GOALS.some(g=>g.zone===S.zone&&!S.done[g.id]&&g.check(S));
  drawObj(cx,o,x,y,T,{biome:z.biome,lights})}
 updParts();drawParts();cx.restore();
 lighting(lights,nt,z);weatherTick(z,nt);
 if(z.biome==='scorch'){cx.fillStyle='rgba(255,120,40,.07)';cx.fillRect(0,0,W,H)}
 const vg=cx.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#0000004a');cx.fillStyle=vg;cx.fillRect(0,0,W,H);
 if(rt.trans){const p=(T-rt.trans.t0)/900;if(p>=.5&&!rt.trans.fired){rt.trans.fired=1;rt.trans.fn()}const a=p<.5?p*2:Math.max(0,(1-p)*2);const g=cx.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.8);g.addColorStop(0,`rgba(230,252,255,${a})`);g.addColorStop(1,`rgba(80,190,255,${a})`);cx.fillStyle=g;cx.fillRect(0,0,W,H);
  cx.strokeStyle=`rgba(255,255,255,${a})`;cx.lineWidth=3;for(let k=0;k<5;k++){cx.beginPath();cx.arc(W/2,H/2,(k*60+T/3)%(Math.max(W,H)),0,7);cx.stroke()}if(p>=1)rt.trans=null}}
function isClickable(o){return!PROPS.includes(o.type)&&!(o.type==='decor'&&!rt.decor)}
function startTravel(zone){const z=Z(zone);if(!S.unlocked[zone]||(z.heat&&!fa().genes.heatProof)||zone===S.zone)return dispatch('travel',{zone});Sound.sfx('gate');rt.trans={t0:now(),fn:()=>{dispatch('travel',{zone});toast('✨ Arrived at '+z.name)}}}
// ===== Movement & interaction =====
let stepT=0;
function step(dt){const f=fa();if(!f)return;if(rt.tgt){const[ti,tj]=rt.tgt,di=ti-rt.pos.i,dj=tj-rt.pos.j,d=Math.hypot(di,dj),sp=3.2*dt/1000;
  if(Math.abs(di-dj)>.05)rt.face=(di-dj)>0?1:-1;if(now()-stepT>260){stepT=now();Sound.sfx('step')}
  if(d<=sp){rt.pos={i:ti,j:tj};rt.tgt=null;if(rt.onArrive){const a=rt.onArrive;rt.onArrive=null;a()}}else{rt.pos.i+=di/d*sp;rt.pos.j+=dj/d*sp}}
 const s=zs(S.zone);if(now()-rt.lastTox>2000){rt.lastTox=now();for(const o of s.objs)if(o.type==='tox'){const di=Math.sign(rt.pos.i-o.i),dj=Math.sign(rt.pos.j-o.j);const ni=o.i+(Math.random()<.5?di:pick([-1,1])),nj=o.j+(Math.random()<.5?dj:0);
  if(s.tiles[ni]&&s.tiles[ni][nj]&&!s.objs.some(x=>x.i===ni&&x.j===nj)&&!(Math.round(rt.pos.i)===ni&&Math.round(rt.pos.j)===nj))Object.assign(o,{i:ni,j:nj});if(Math.hypot(o.i-rt.pos.i,o.j-rt.pos.j)<1.6&&!rt.sleep&&!rt.trans){f.happiness=clamp(f.happiness-2);emit('hurt');if(f.happiness<=0){tooSad();save()}}}}}
function walkTo(o,cb){const s=zs(S.zone),opts=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].map(([a,b])=>[o.i+a,o.j+b]).filter(([i,j])=>s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(x=>x.i===i&&x.j===j));
 opts.sort((a,b)=>Math.hypot(a[0]-rt.pos.i,a[1]-rt.pos.j)-Math.hypot(b[0]-rt.pos.i,b[1]-rt.pos.j));const t=opts[0]||[o.i,o.j];rt.sleep=false;rt.tgt=t;rt.onArrive=()=>{rt.face=(o.i-o.j)-(t[0]-t[1])>=0?1:-1;cb()}}
function interact(o){rt.tgtObj=o;Sound.sfx('click');const go=cb=>walkTo(o,cb);
 switch(o.type){case'poll':case'tox':return go(()=>dispatch('zap',{oid:o.id}));
 case'tree':case'pool':case'rock':case'stump':return go(()=>dispatch('skill',{oid:o.id}));
 case'gate':return go(()=>ui('map'));case'goal':return go(()=>ui('goal'));case'vendor':return go(()=>ui('vendor'));
 case'den':return go(()=>dispatch('rest'));case'nest':return go(()=>ui('nest'));case'treetree':return go(()=>dispatch('collectTreats'));
 case'totem':return go(()=>dispatch('totem'));case'project':return go(()=>ui('project'));
 case'decor':if(rt.decor)dispatch('pickup',{idx:o.idx});return}}
function screenToTile(px,py){const lx=(px-ox)/sc,ly=(py-oy)/sc;const a=ly/(TH/2),b=lx/(TW/2);return[Math.round((a+b)/2),Math.round((a-b)/2)]}
function hitObj(px,py){const s=zs(S.zone);let best=null;for(const o of s.objs){if(!isClickable(o))continue;const[x,y]=iso(o.i,o.j),sx=ox+x*sc,sy=oy+y*sc;if(px>sx-26*sc&&px<sx+26*sc&&py>sy-58*sc&&py<sy+14*sc){if(!best||o.i+o.j>best.i+best.j)best=o}}return best}
function tap(px,py){if(!fa()||rt.trans)return;const s=zs(S.zone),[i,j]=screenToTile(px,py);
 if(rt.decor&&S.zone==='home'){const o=hitObj(px,py);if(o&&o.type==='decor')return interact(o);if(s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(o=>o.i===i&&o.j===j)){dispatch('place',{item:rt.decor,i,j});Sound.sfx('pop');burst(...iso(i,j),12,'#fff6a0',2);if(!S.player.inv[rt.decor]){rt.decor=null;toast('Done decorating.')}}return}
 const o=hitObj(px,py);if(o)return interact(o);if(s.tiles[i]&&s.tiles[i][j]){rt.sleep=false;rt.onArrive=null;rt.tgt=[i,j];S.tf.moved=1}}
const ptrs=new Map();let pinch0=null,downAt=null;const rel=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
cv.addEventListener('pointerdown',e=>{Sound.init();try{cv.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch0={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:cam.zoom};downAt=null}else if(ptrs.size===1)downAt=[e.clientX,e.clientY]});
cv.addEventListener('pointermove',e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(pinch0&&ptrs.size===2){const[a,b]=[...ptrs.values()];cam.zoom=clamp(pinch0.z*Math.hypot(a[0]-b[0],a[1]-b[1])/pinch0.d,.7,2.2);return}
 if(e.pointerType==='mouse'){const[px,py]=rel(e);rt.hover=screenToTile(px,py);const o=hitObj(px,py);if(o)rt.hover=[o.i,o.j];cv.style.cursor=o?'pointer':'default'}});
const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2&&pinch0){if(!ptrs.size)pinch0=null;downAt=null;return}if(downAt&&!ptrs.size&&Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])<14)tap(...rel(e));downAt=null};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);downAt=null;if(!ptrs.size)pinch0=null});
cv.addEventListener('wheel',e=>{e.preventDefault();cam.zoom=clamp(cam.zoom*(e.deltaY<0?1.1:.91),.7,2.2)},{passive:false});
// ===== Tutorial with Amelia =====
const TUT=[
 {t:"Hi, I'm Amelia! Welcome, Caretaker. This world is overrun by living pollution, and your fauna can help clean it. Tap the ground to walk.",ok:()=>S.tf.moved},
 {t:"Fauna love Treats! Tap the pink Treat Tree to pick some.",ok:()=>S.tf.treat},
 {t:"Open Goods 🎒 and Feed a Treat. Happiness is your fauna's health, and Energy powers zapping.",ok:()=>S.tf.fed},
 {t:"Step into the glowing World Gate and travel to The Rock Garden.",ok:()=>S.zone==='rockgarden'||S.done.g_buy},
 {t:"This is the Rock Garden. Go Shopping! Buy a Helianth at the Lux Store stall.",ok:()=>S.stats.buys>0},
 {t:"Now visit the Goal Station (green hologram ✓) and Claim your reward. Goals unlock new lands!",ok:()=>S.done.g_buy},
 {t:"Rock Island is open! Travel there and tap the pollution cubes to zap them for Lux.",ok:()=>(S.stats.zap.rockisland||0)>0},
 {t:"Wonderful! Zapping fills your egg meter 🥚, which lays eggs to hatch in your Nest. When your fauna gets tired, rest in the Den. Have fun, Caretaker!",last:1}];
function tutTick(){const el=document.getElementById('tut');if(!fa()||S.tut>=TUT.length){el.classList.add('hidden');return}const st=TUT[S.tut];if(st.ok&&st.ok()){S.tut++;Sound.sfx('skill');save();return tutTick()}
 if(el.dataset.step!=String(S.tut)){el.dataset.step=S.tut;el.querySelector('.tt').textContent=st.t;el.querySelector('#tutNext').textContent=st.last?'Got it!':'Skip tutorial';el.classList.remove('hidden');el.classList.remove('pop');void el.offsetWidth;el.classList.add('pop')}}
document.getElementById('tutNext').onclick=()=>{S.tut=TUT[S.tut]&&TUT[S.tut].last?S.tut+1:99;save();tutTick()};
{const ac=document.getElementById('amelia');ac.width=ac.height=112;const c=ac.getContext('2d');c.scale(2,2);drawAmelia(c,28,30,.9)}
document.getElementById('mute').onclick=()=>{Sound.init();Sound.setMuted(!Sound.muted);muteIcon()};function muteIcon(){document.getElementById('mute').textContent=Sound.muted?'🔇':'🔊'}muteIcon();
setInterval(tutTick,500);
// ===== HUD & UI =====
function bar(l,v,c){return`<span>${l}</span><div class="bar"><i style="width:${v}%;background:${c}"></i></div>`}
let pfKey='';function renderHUD(){const f=fa();if(!f)return;document.getElementById('who').textContent=`${f.name} · Lv ${f.level}`;
 const k=JSON.stringify(f.genes);if(k!==pfKey){pfKey=k;const pf=document.getElementById('pf');if(pf){pf.innerHTML='';pf.appendChild(faunaPortrait(f.genes))}}
 const sb=(c,v,t)=>{const e=document.querySelector('.mb.'+c);if(!e)return;e.querySelector('i').style.width=v+'%';e.title=t;e.classList.toggle('low',v<20&&c!=='xp')};
 sb('en',f.energy,`Energy ${Math.round(f.energy*11)}/1,100`);sb('hp',f.happiness,`Happiness ${Math.round(f.happiness*11)}/1,100`);sb('xp',f.level>=20?100:S.player.eggMeter,'Egg Meter (level progress)');
 const ed=document.getElementById('edit');if(ed){ed.classList.toggle('on',!!rt.decor);ed.querySelector('span').textContent=rt.decor?'DONE':'EDIT'}
 document.getElementById('cur').innerHTML=`<span title="Lux"><b style="color:#9dff3a">●</b> ${S.player.lux.toLocaleString()}</span><span title="Bux (placeholder, no payments)"><b style="color:#f2c230">■</b> ${S.player.bux}</span>`;
 document.getElementById('bars').innerHTML=bar('😊 Happiness',f.happiness,f.happiness<25?'#e55':'#ff8fb1')+bar('⚡ Energy',f.energy,f.energy<20?'#e55':'#ffc93c')+bar('⭐ XP',f.level>=20?100:f.xp/xpNeed(f.level)*100,'#7ad');
 const eg=document.getElementById('egg');eg.style.setProperty('--p',Math.floor(S.player.eggMeter)+'%');eg.innerHTML=`<div><b>${Math.floor(S.player.eggMeter)}%</b></div>`;document.getElementById('zoneName').textContent=Z(S.zone).name+(rt.decor?' — tap tiles to place':'')}
const M=document.getElementById('modal'),MB=document.getElementById('mb');
function open(h){if(M.classList.contains('hidden'))Sound.sfx('whoosh');MB.innerHTML=h;M.classList.remove('hidden')}function close(){if(!M.classList.contains('hidden'))Sound.sfx('whoosh');M.classList.add('hidden')}
document.getElementById('x').onclick=close;M.onclick=e=>{if(e.target===M)close()};
document.querySelectorAll('[data-ui]').forEach(b=>b.onclick=()=>{Sound.init();Sound.sfx('click');ui(b.dataset.ui)});
MB.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,p=JSON.parse(b.dataset.p||'{}');
 if(a==='ui')return ui(p.v,p);if(a==='decorate'){rt.decor=p.item;close();if(S.zone!=='home')dispatch('travel',{zone:'home'});toast('Tap a tile to place '+ITEMS[p.item].name+'. Tap placed decor to pick it up.');return}
 Sound.sfx('click');if(a==='cartAdd'){rt.cart=(rt.cart||[]).concat(p.k);return ui('vendor')}if(a==='cartDel'){rt.cart.splice(p.i,1);return ui('vendor')}if(a==='cartBuy'){const st=VENDORS[S.zone]||[];(rt.cart||[]).forEach(k=>{const e=st.find(x=>x[0]===k);if(e)dispatch('buy',{item:k,price:e[1],cur:e[2]})});rt.cart=[];return ui('vendor')}
 if(a==='goodie'){dispatch('goodie',p);return close()}if(a==='rename2'){const n=prompt('New name for '+fa().name+'?');if(n&&S.player.inv.namechanger){S.player.inv.namechanger--;dispatch('rename',{fid:S.active,name:n})}return ui('bag')}
 if(a==='hatch')p.name=(document.getElementById('hn')||{}).value;if(a==='travel'){close();return startTravel(p.zone)}dispatch(a,p);if(!['travel'].includes(a))ui(cur.v,cur)});
const btn=(label,a,p={},dis)=>`<button class="btn" data-a="${a}" data-p='${JSON.stringify(p)}' ${dis?'disabled':''}>${label}</button>`;
let cur={};
function ui(v,p={}){cur={...p,v};const f=fa(),inv=S.player.inv;
 if(v==='map'){open('<h2>🗺️ World Map</h2><p class="small">Travel between floating lands through the World Gate.</p>'+ZONES.map(z=>{const lock=!S.unlocked[z.id];return`<div class="row"><div class="grow"><b>${z.name}</b><br><span class="small">${lock?'🔒 '+(GOALS.find(g=>g.id===z.unlock)||{}).text:z.heat?'🔥 Scorching — needs Heat Proof':'Biome: '+z.biome}</span></div>${btn(S.zone===z.id?'Here':'Go','travel',{zone:z.id},lock||S.zone===z.id)}</div>`}).join(''));}
 if(v==='fauna'){Sound.sfx('moan');open('<h2>🐾 Your Fauna ('+S.fauna.length+'/3)</h2><p class="small">Switch fauna on your home island.</p><div class="grid" id="fg"></div>');const fg=document.getElementById('fg');
  S.fauna.forEach((x,k)=>{const d=document.createElement('div');d.className='card'+(k===S.active?' sel':'');d.appendChild(faunaPortrait(x.genes));const sp=SPECIES[x.genes.species];
   d.insertAdjacentHTML('beforeend',`<b>${x.name}</b><br>${sp.name} Lv${x.level}<br><span class="small">${x.genes.color} · ${x.genes.pattern} · ${x.genes.tail} tail · ${x.genes.eyes} eyes${x.genes.heatProof?' · 🔥':''}<br>Skill: ${SKILLS[sp.skill].verb} · Loves ${ITEMS[sp.fav].name}<br>😊${Math.round(x.happiness)} ⚡${Math.round(x.energy)}</span><br>`+btn('Active','setActive',{fid:k},k===S.active)+(S.fauna.length>1?btn('Release','release',{fid:k}):''));fg.appendChild(d)})}
 if(v==='bag'){const rows=Object.entries(inv).filter(([k,n])=>n>0).map(([k,n])=>{const it=ITEMS[k];return`<div class="row"><span style="font-size:22px">${it.icon}</span><div class="grow">${it.name} ×${n}<br><span class="small">${it.type==='food'?'+'+it.e+'⚡ +'+it.h+'😊':it.type}</span></div>${it.type==='food'||it.type==='gene'?btn('Feed','feed',{item:k}):''}${it.type==='decor'?btn('Place','decorate',{item:k}):''}${k==='namechanger'?btn('Use','rename2',{}):''}</div>`}).join('')||'<p>Empty</p>';
  open('<h2>🎒 Goods</h2>'+rows+'<h3>Combine foods</h3>'+RECIPES.map((r,k)=>`<div class="row"><div class="grow">${Object.keys(r.in).map(x=>ITEMS[x].name).join(' + ')} → ${ITEMS[r.out].name}</div>${btn('Combine','combine',{r:k})}</div>`).join('')+`<h3>Eggs (${S.player.eggs.length})</h3><p class="small">${S.player.eggs.map(e=>'🥚 from '+e.parent).join(', ')||'Fill the egg meter by earning Lux.'}</p>`)}
 if(v==='goals'||v==='goal'){const list=v==='goal'?GOALS.filter(g=>g.zone===S.zone):GOALS;open('<h2>⭐ '+(v==='goal'?'Goal Station':'All Goals')+'</h2>'+list.map(g=>{const ok=g.check(S),d=S.done[g.id];return`<div class="row"><div class="grow">${g.giver?`<b>${g.giver==='Esteban'?'🧑‍🔬':'⛏️'} ${g.giver}${g.giver==='Prospector'?' (E.P.)':''}:</b> `:''}${d?'✅':ok?'🎁':'▫️'} ${g.text}${g.say&&!d?`<br><i class="small">“${g.say}”</i>`:''}<br><span class="small">${Z(g.zone).name} · +${g.lux} Lux${g.item?' + '+ITEMS[g.item].name:''}</span></div>${d?'':btn('Claim','claim',{gid:g.id},!ok||(v==='goals'&&S.zone!==g.zone))}</div>`}).join('')+(v==='goals'?'<p class="small">Claim at the Goal Station in each land.</p>':''))}
 if(v==='goodie'){open('<h2>🎁 Daily Goodie Grab</h2><p>Pick one sack — a surprise awaits, once a day!</p><div style="text-align:center">'+[0,1,2].map(k=>`<span class="sack" data-a="goodie" data-p='{"k":${k}}'>💰</span>`).join('')+'</div>');return}
 if(v==='cert'){const x=S.fauna[p.fid];if(!x)return;const sp=SPECIES[x.genes.species];open(`<div class="cert"><h3>CERTIFICATE OF BIRTH</h3><div id="cpf"></div><p>Species: <b>${sp.name}</b> · Ability: <b>${SKILLS[sp.skill].verb}</b><br>Color: ${x.genes.color} · Pattern: ${x.genes.pattern} · Eyes: ${x.genes.eyes} · Tail: ${x.genes.tail}${x.genes.heatProof?' · Heat Proof':''}</p><input id="cn" placeholder="Name your fauna" maxlength="16" value="${x.name}"><br><br><button class="btn" id="csign">Sign certificate</button></div>`);document.getElementById('cpf').appendChild(faunaPortrait(x.genes));document.getElementById('csign').onclick=()=>{dispatch('rename',{fid:p.fid,name:document.getElementById('cn').value.trim()||x.name});close()};return}
 if(v==='vendor'){const st=VENDORS[S.zone]||[];rt.cart=rt.cart||[];const tot=rt.cart.reduce((a,k)=>a+(st.find(x=>x[0]===k)||[0,0])[1],0);
  open('<h2>🛒 Lux Store</h2><div class="grid">'+st.map(([k,p,c])=>`<div class="card"><div style="font-size:30px">${ITEMS[k].icon}</div><b>${ITEMS[k].name}</b><br><span class="small">${c==='bux'?p+' Bux (disabled)':p+' Lux'}</span><br>${btn('Add','cartAdd',{k},c==='bux')}</div>`).join('')+'</div><h3>🛒 Shopping Cart</h3>'+(rt.cart.map((k,i)=>`<div class="row"><div class="grow">${ITEMS[k].icon} ${ITEMS[k].name}</div>${btn('✕','cartDel',{i})}</div>`).join('')||'<p class="small">Your cart is empty.</p>')+`<p><b>Total: ${tot} Lux</b> (you have ${S.player.lux})</p>`+btn('Buy!','cartBuy',{},!rt.cart.length||tot>S.player.lux))}
 if(v==='project'){const p=S.projects[S.zone];open(`<h2>⚙️ Community Project</h2><p>Caretakers pool Totem Components to build machines that improve the world. Progress: <b>${p.prog}/${p.need}</b> (completed ${p.done||0}×)</p><p class="small">You have ${inv.component||0} components. Collect them from the Totem on your home island.</p>`+btn('Donate 1','donate',{proj:S.zone},!inv.component))}
 if(v==='nest'){const n=S.home.nest;let h='<h2>🪺 Nest</h2>';if(n.egg){const left=Math.max(0,Math.ceil((n.at-now())/1000));h+=left?`<p>Incubating egg from ${n.egg.parent}… ${left}s</p>`+btn('Refresh','ui',{v:'nest'}):'<p>The egg is ready to hatch!</p><input id="hn" placeholder="Name your new fauna" maxlength="16">'+btn('Hatch','hatch',{})+(S.fauna.length>=3?'<p class="small">All 3 slots full — release a fauna first.</p>':'')}
  else h+='<p class="small">Place an egg in the Nest and Incubate. The layer and the incubating fauna each contribute genes — babies may even be a different species!</p>'+(S.player.eggs.length?'<p class="small">Possible species: '+[...new Set([...S.player.eggs.map(e=>SPECIES[e.genes.species].name),...S.fauna.map(x=>SPECIES[x.genes.species].name),'Oinker','Scratcher','Sniffer'])].join(', ')+'</p>':'')+(S.player.eggs.length?S.player.eggs.map(e=>`<div class="row"><div class="grow">🥚 Egg laid by: ${e.parent} (${SPECIES[e.genes.species].name})</div>${S.fauna.map((x,k)=>btn('Incubate with '+x.name,'incubate',{egg:e.id,fid:k})).join('')}</div>`).join(''):'<p>No eggs yet. Earn Lux to fill the egg meter.</p>');open(h)}
 if(v==='decor'){const ds=Object.entries(inv).filter(([k,n])=>n>0&&ITEMS[k].type==='decor');open('<h2>🪴 Decorate your Faunasphere</h2>'+(ds.map(([k,n])=>`<div class="row"><span style="font-size:22px">${ITEMS[k].icon}</span><div class="grow">${ITEMS[k].name} ×${n}</div>${btn('Place','decorate',{item:k})}</div>`).join('')||'<p>No decorations yet. Buy some at a Vendor Station.</p>')+(rt.decor?btn('Stop decorating','ui',{v:'stopdecor'}):''))}
 if(v==='stopdecor'){rt.decor=null;close()}
 if(v==='friends'){open(`<h2>👥 Friends</h2><p>Your Caretaker ID: <b>${S.player.id}</b></p><p class="small">Online friends and co-op zapping come in a later version. For now, the state is ready to sync (every action goes through dispatch(), and there's a Net.send hook).</p><div class="row"><div class="grow">🏝️ Amelia's Faunasphere (guide NPC)</div>${btn('Visit','visit',{who:'Amelia'})}</div>`)}}
// ===== Adoption =====
function adoptScreen(){let sel='hoofer';const col=pick(['Tan','Cocoa','Cream','Slate','Sky']);
 open('<h2>Become a Caretaker!</h2><p class="small">Choose one of the 3 starter fauna. There are 12 known species — breed eggs to discover the rest.</p><div class="grid" id="sg"></div><p><input id="pn" placeholder="Name your fauna" maxlength="16"></p><button class="btn" id="go">Adopt</button>');
 document.getElementById('x').style.display='none';const sg=document.getElementById('sg');
 Object.entries(SPECIES).filter(([k,s])=>s.starter).forEach(([k,s])=>{const d=document.createElement('div');d.className='card'+(k===sel?' sel':'');d.dataset.sp=k;d.appendChild(faunaPortrait({species:k,color:col,pattern:'Plain',tail:'Normal',eyes:'Round'}));d.insertAdjacentHTML('beforeend',`<b>${s.name}</b><br><span class="small">${s.desc}</span>`);d.onclick=()=>{sel=k;sg.querySelectorAll('.card').forEach(c=>c.classList.toggle('sel',c===d))};sg.appendChild(d)});
 document.getElementById('go').onclick=()=>{dispatch('adopt',{species:sel,name:document.getElementById('pn').value.trim()||'Sprout',color:col});document.getElementById('x').style.display='';close();boot()}}
// ===== Boot =====
let last=now();function loop(){const t=now(),dt=Math.min(100,t-last);last=t;if(fa()){step(dt);simulate(dt);draw()}requestAnimationFrame(loop)}
function boot(){S.tf=S.tf||{};if(S.tut==null)S.tut=99;Sound.biome=Z(S.zone).biome;zs('home');syncHomeDecor();const g=S.zones[S.zone]?S.zones[S.zone].objs.find(o=>o.type==='gate'):null;if(g)rt.pos={i:g.i-1,j:g.j};
 const off=Math.min(now()-S.lastTick,8*36e5);simulate(Math.max(0,off));renderHUD();setInterval(()=>{save();renderHUD()},1000);
 if(!S.unlocked.amelia)S.unlocked.amelia=1;if(S.done.g_buy&&S.goodie!==new Date().toDateString()&&!QS.has('nogoodie'))setTimeout(()=>{if(M.classList.contains('hidden'))ui('goodie')},1800);
 toast(S.done.g_buy?'Welcome back, Caretaker!':'Tip: walk into the World Gate (glowing ring) to visit the Rock Garden.')}
S=JSON.parse(localStorage.getItem(KEY)||'null');if(!S){const o=JSON.parse(localStorage.getItem('faunasphere_save_v2')||'null');if(o&&o.fauna&&o.fauna.length){o.zones={};o.tut=99;S=o}}resize();
// migrate: species stored in genes
if(S&&S.fauna.length)boot();else{S=newState();adoptScreen()}
requestAnimationFrame(loop);setTimeout(()=>{const l=document.getElementById("loading");if(l)l.remove()},6000);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
// ===== v4 reliable saving =====
const safeSave=()=>{try{if(S&&S.fauna&&S.fauna.length)save()}catch(e){}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')safeSave()});
addEventListener('pagehide',safeSave);addEventListener('beforeunload',safeSave);document.addEventListener('freeze',safeSave);
setInterval(safeSave,5000);

document.getElementById('edit').onclick=()=>{Sound.init();Sound.sfx('click');if(rt.decor){rt.decor=null;toast('Done editing.');renderHUD();return}if(S.zone!=='home'){toast('You can edit your own sphere. Travel home first.');return}ui('decor')};

document.getElementById('help').onclick=e=>{e.preventDefault();open('<h2>? Help</h2><p>Click pollution to zap it with your collar. Use Goods 🎒 to feed, Goals to claim rewards, Map 🌐 to travel through World Gates. Earning Lux fills the Egg Meter — a full meter lays an egg for your Nest. EDIT decorates your sphere (25 Lux per item).</p>')};
setInterval(()=>{const f=fa(),h=document.getElementById('hi');if(f&&h)h.firstChild.nodeValue='Hi, '+(S.player.name||f.name+"'s Caretaker")+' | '},2000);

document.getElementById('chatf').onsubmit=e=>{e.preventDefault();const i=document.getElementById('chatin'),t=i.value.trim();if(!t)return;rt.say={text:t.slice(0,80),at:now()};i.value='';Sound.init();Sound.tone(1320,.25,'sine',.06);Sound.tone(1760,.3,'sine',.03,.05);i.blur()};

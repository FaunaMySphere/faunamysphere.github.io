// v4.4 core mechanics from VIDEO_NOTES 13-19 (cluster zaps, underwater drain, hot/cold, Sleepy Time, happy dance, GOAL COMPLETE banner)
(function(){
const t=k=>(window.FS&&FS.t)?FS.t(k):k;
const ADJ=[[1,0],[-1,0],[0,1],[0,-1]];
// --- 3+ connected same-type pollution clusters break together ---
function clusterOf(objs,o){const same=x=>x.type===o.type&&(x.v||0)===(o.v||0);const seen=new Set([o]),q=[o];while(q.length){const c=q.pop();for(const[a,b]of ADJ){const n=objs.find(x=>x.i===c.i+a&&x.j===c.j+b&&same(x));if(n&&!seen.has(n)){seen.add(n);q.push(n)}}}return[...seen]}
const zapP=R.zap;R.zap=p=>{const s=zs(S.zone),o=s.objs.find(x=>x.id===p.oid);const grp=o&&(o.type==='poll'||o.type==='tox')?clusterOf(s.objs,o):[];zapP(p);
 if(o&&!s.objs.includes(o)&&grp.length>=3){let lux=0;grp.forEach(x=>{if(x===o||!s.objs.includes(x))return;s.objs.splice(s.objs.indexOf(x),1);const l=3+Z(S.zone).tier*2;lux+=l;emit('pop',{o:x,lux:l});S.stats.zap[S.zone]=(S.stats.zap[S.zone]||0)+1});
  if(lux){gainLux(lux);toast('💥 '+t('Cluster zap!')+' '+grp.length+' '+t('blocks')+' +'+lux+' Lux')}}};
// spawn pollution in clusters sometimes, so the rule matters
const sp0=spawnPoll;spawnPoll=function(id){const s=S.zones[id];const before=s.objs.length;sp0(id);const o=s.objs[s.objs.length-1];if(s.objs.length>before&&o&&o.type==='poll'&&Math.random()<.5){const z=Z(id);
 const nb=s.objs.filter(x=>x!==o&&x.type==='poll');const anchor=nb.length?pick(nb):null;if(anchor){for(const[a,b]of ADJ.sort(()=>Math.random()-.5)){const i=anchor.i+a,j=anchor.j+b;if(s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(x=>x.i===i&&x.j===j)){o.i=i;o.j=j;o.v=anchor.v||0;break}}}}};
// --- underwater: no travel block; non-waterproof fauna drain Energy+Happiness, frown, auto-flee home ---
R.travel=(tr=>p=>{const z=Z(p.zone);if(!z)return tr(p);const h=z.heat,w=z.water;z.heat=0;z.water=0;try{tr(p)}finally{z.heat=h;z.water=w}})(R.travel);
try{startTravel=(st=>zone=>{const z=Z(zone);const h=z.heat;z.heat=0;const w=z.water;z.water=0;try{st(zone)}finally{z.heat=h;z.water=w}})(startTravel)}catch(e){}
const COLDZ=['avalanche','village','wintergift'],HOTZ=['isthmus','mesa'];
let hazT=0,frownT=0;
function hazard(){const f=fa();if(!f||S.zone==='home')return null;const z=Z(S.zone);
 if(z.water&&!f.genes.waterProof)return{icon:'💜☹️',msg:t('is not Water Proof and can\'t breathe down here!'),rate:3};
 if(COLDZ.includes(S.zone)&&!f.genes.coldProof)return{icon:'🥶☹️',msg:t('is freezing! It needs the Cold Proof gene.'),rate:2};
 if((HOTZ.includes(S.zone)||z.heat)&&!f.genes.heatProof)return{icon:'🥵☹️',msg:t('is overheating! It needs the Heat Proof gene.'),rate:2};return null}
setInterval(()=>{try{const h=hazard(),f=fa();if(!h){hazT=0;return}hazT++;f.energy=clamp(f.energy-h.rate,0);f.happiness=clamp(f.happiness-h.rate,0);
 if(Date.now()-frownT>4000){frownT=Date.now();toast(h.icon+' '+f.name+' '+h.msg);rt.sleep=false;try{window.FX3&&FX3.frown(h.icon)}catch(e){}}
 if(f.energy<=0||f.happiness<=0||hazT>=20){hazT=0;toast('💨 '+f.name+' '+t('was teleported home in a puff of smoke!'));Sound.sfx&&Sound.sfx('gate');R.travel({zone:'home'})}renderHUD()}catch(e){}},1000);
// --- happy dance: tap your fauna's portrait to dance and refill happiness ---
let danceT=0;document.addEventListener('click',e=>{if(!e.target.closest||!e.target.closest('#pf'))return;const f=fa();if(!f)return;if(Date.now()-danceT<15000)return toast(f.name+' '+t('is catching its breath. Dance again soon!'));danceT=Date.now();rt.happyT=now()+1500;f.happiness=clamp(f.happiness+20);emit('eat',{fav:1});toast('💃 '+f.name+' '+t('does a happy dance! +Happiness'));renderHUD();save()});
// --- GOAL COMPLETE banner drop ---
const cl0=R.claim;R.claim=p=>{const was=!!S.done[p.gid];cl0(p);if(!was&&S.done[p.gid]){const g=GOALS.find(x=>x.id===p.gid);goalBanner(g&&(g.name||g.text.split(':')[0]))}};
function goalBanner(name){let b=document.getElementById('gcban');if(!b){b=document.createElement('div');b.id='gcban';document.body.appendChild(b)}
 b.innerHTML='<i>'+t('GOAL COMPLETE')+'</i><span>'+(name||'')+'</span>';b.className='';void b.offsetWidth;b.className='drop';try{Sound.sfx('level')}catch(e){}setTimeout(()=>b.className='up',3200)}
window.goalBanner=goalBanner;
// --- ability-required tooltips ---
const sk0=R.skill;if(sk0)R.skill=p=>{const s=zs(S.zone),o=s.objs.find(x=>x.id===p.oid),f=fa();if(o&&f){const ne=Object.entries(SKILLS).find(([k,v])=>v.node===o.type);const need=ne&&ne[0];const my=SPECIES[f.genes.species].skill;
 if(need&&need!==my&&!(need==='dig'&&f.level>=12)){return toast('🚫 '+t('Ability required')+': '+SKILLS[need].verb+'. '+f.name+' '+t("doesn't have this ability."))}}sk0(p)};
// --- Sleepy Time in Puddinpie Falls (Moon Pillow) ---
ITEMS.moonpillow=ITEMS.moonpillow||{name:'Moon Pillow',type:'food',icon:'🌙',e:0,h:0,desc:'Use it to fall asleep and dream your way to Puddinpie Falls.'};
ITEMS.dreamdonut=ITEMS.dreamdonut||{name:'Dream Donut',type:'food',icon:'🍩',e:5,h:5};ITEMS.trancetaffy=ITEMS.trancetaffy||{name:'Trance Taffy',type:'food',icon:'🍬',e:5,h:5};
const fd0=R.feed;R.feed=p=>{if(p.item==='moonpillow'){const f=fa();f.energy=0;S.unlocked.puddinpie=1;toast('🌙 '+f.name+' '+t('drifts off to sleep…'));S.sleepy={left:480};R.travel({zone:'puddinpie'});return}
 if(S.zone==='puddinpie'&&S.sleepy&&(p.item==='dreamdonut'||p.item==='trancetaffy')&&S.player.inv[p.item]){S.player.inv[p.item]--;S.sleepy.left+=p.item==='trancetaffy'?60:10;toast('😴 '+t('Sleepy Time')+' +'+(p.item==='trancetaffy'?'1:00':'0:10'));return}fd0(p)};
function sleepyEl(){let e=document.getElementById('sleepy');if(!e){e=document.createElement('div');e.id='sleepy';document.body.appendChild(e)}return e}
setInterval(()=>{try{if(!S||!fa())return;if(!S.player.inv.moonpillow&&!S.done.mp_given&&fa().level>=3){S.player.inv.moonpillow=1;S.done.mp_given=1;toast('🌙 '+t('You got a Moon Pillow! Use it from Goods to dream your way to Puddinpie Falls.'))}
 const el=sleepyEl();if(S.zone!=='puddinpie'){el.style.display='none';return}if(!S.sleepy)S.sleepy={left:480};S.sleepy.left--;const m=Math.max(0,S.sleepy.left);el.style.display='block';el.textContent='😴 '+t('Sleepy Time')+' '+Math.floor(m/60)+':'+String(m%60).padStart(2,'0');
 if(Math.random()<.03){S.sleepy.left-=10;toast('☁️ '+t('A Sleepy viley zapped you! -10 s'))}
 if(S.sleepy.left<=0){S.sleepy=null;toast('🌅 '+fa().name+' '+t('woke up back home.'));R.travel({zone:'home'})}}catch(e){}},1000);
// dream treats drop when shaking / digging in Puddinpie
const zp2=R.zap;R.zap=p=>{zp2(p);if(S.zone==='puddinpie'&&Math.random()<.35){const k=Math.random()<.25?'trancetaffy':'dreamdonut';addItem(k);toast(t('Found')+' '+ITEMS[k].name+'!')}};
})();

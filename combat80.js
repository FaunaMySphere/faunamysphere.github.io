// v8.0 PREVIEW — combat feel. Original code, no assets. Disable with ?v80off.
// Hit flash + knockback + damage numbers, smooth health bars (replace the heart row), attack telegraph rings
// (content24.js now winds up before an attack, so stepping away dodges it), gentle screen shake (smaller on phones,
// none with reduced-motion), defeat shockwave, and one boss per world once it is half restored.
// Nothing here is written to the save except Lux from the boss bonus (via the game's own gainLux).
import * as THREE from 'three';
const G=window;
if(!/[?&]v80off/.test(location.search)){
const wait=()=>G.W80&&G.W6?start():setTimeout(wait,200);wait();
}
function start(){
const X=G.W80,{objMap,proj,objW,mePosW,burstW,floatW,fxAdd,ringM,vib}=X,PH=X.isPhone;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const es=()=>{try{return (G.FS&&FS.lang==='es')||String(G.LANG||'').startsWith('es')}catch(e){return false}};
const L=(en,s)=>es()?s:en;
const snd=n=>{try{if(G.Sound&&Sound.ctx)Sound.sfx(n)}catch(e){}};
const V3=(x,y,z)=>new THREE.Vector3(x,y,z);
const lastHp=new WeakMap(),lag=new WeakMap(),flashT=new WeakMap();
const nums=[];
// ---------- health bars (drawn in gl.js overlay instead of the heart row) ----------
G.FS_hpDraw=(c,x,y,o,e)=>{if(o.hid)return true;const h0=Math.max(o.hp0||0,o.hp||0,1),fr=Math.max(0,Math.min(1,(o.hp||0)/h0));
 let lg=lag.get(o);if(lg==null||lg<fr)lg=fr;lg+=(fr-lg)*.08;lag.set(o,lg);lastHp.set(o,o.hp);
 const boss=o.el===2,el=o.el===1,w=boss?64:el?44:34,h=boss?8:6,x0=Math.round(x-w/2),y0=Math.round(y-h/2);
 c.save();c.fillStyle='#0b1a10cc';rr(c,x0-2,y0-2,w+4,h+4,(h+4)/2);c.fill();
 c.fillStyle='#ffffffaa';if(lg>fr)rr(c,x0,y0,w*lg,h,h/2),c.fill();
 const g=c.createLinearGradient(x0,0,x0+w,0);if(fr>.5){g.addColorStop(0,'#ff4d6d');g.addColorStop(1,'#ff9a5a')}else{g.addColorStop(0,'#e0213f');g.addColorStop(1,'#ff5a5a')}
 c.fillStyle=g;if(fr>0)rr(c,x0,y0,Math.max(h,w*fr),h,h/2),c.fill();
 c.fillStyle='#ffffff55';if(fr>0)rr(c,x0+2,y0+1,Math.max(1,w*fr-4),h/3,h/6),c.fill();
 if(boss||el){c.font='900 '+(boss?13:11)+'px "Trebuchet MS",system-ui';c.textAlign='right';c.lineWidth=3;c.strokeStyle='#000a';const s=boss?'👑':'★';c.strokeText(s,x0-4,y0+h);c.fillStyle='#ffd84a';c.fillText(s,x0-4,y0+h);c.textAlign='center'}
 c.restore();return true};
function rr(c,x,y,w,h,r){c.beginPath();r=Math.min(r,w/2,h/2);c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
// ---------- damage numbers ----------
function num(p,txt,col,big){if(nums.length>14)nums.shift();nums.push({p:p.clone(),txt,col,big,t0:performance.now(),vx:(Math.random()-.5)*.5})}
G.FS_ovDraw=(c,pj)=>{const T=performance.now();for(let i=nums.length-1;i>=0;i--){const n=nums[i],k=(T-n.t0)/900;if(k>=1){nums.splice(i,1);continue}
  const p=n.p.clone();p.x+=n.vx*k;p.y+=.55*k-.25*k*k;const[x,y,z]=pj(p);if(z>1)continue;
  const pop=k<.15?.6+k/.15*.6:k<.25?1.2-(k-.15)*2:1,sz=(n.big?30:22)*pop*(PH?.9:1);
  c.save();c.globalAlpha=k>.7?1-(k-.7)/.3:1;c.font='900 '+sz.toFixed(0)+'px "Trebuchet MS",system-ui';c.textAlign='center';c.lineJoin='round';c.lineWidth=6;c.strokeStyle='#1a0820';c.strokeText(n.txt,x,y);c.fillStyle=n.col;c.fillText(n.txt,x,y);c.restore()}
 if(bossO)drawBossBar(c)};
// ---------- hit flash / tint ----------
const WHITE=new THREE.MeshBasicMaterial({color:0xffffff}),RED=new THREE.MeshBasicMaterial({color:0xff3a3a});
function meshesOf(e){const L=[];e.g.traverse(m=>{if(!m.isMesh||m.userData.outline||m===e.hit||m===e.g.userData.ring||!m.visible)return;const mt=m.material;if(!mt||mt.visible===false||(mt.transparent&&mt.opacity<.05))return;L.push(m)});return L}
function tint(o,mat,ms){const e=objMap.get(o.id);if(!e)return;if(flashT.get(e))return;const L=meshesOf(e),orig=L.map(m=>m.material);L.forEach(m=>m.material=mat);flashT.set(e,1);
 setTimeout(()=>{L.forEach((m,i)=>{if(m.material===mat)m.material=orig[i]});flashT.delete(e)},ms)}
function knock(o,amt){const e=objMap.get(o.id);if(!e)return;const me=mePosW(),d=e.g.position.clone().sub(me);d.y=0;if(d.lengthSq()<1e-4)return;d.normalize();e.g.position.addScaledVector(d,amt)}
// ---------- shake ----------
const shake=v=>{if(RM)return;try{rt.shake=Math.max(rt.shake||0,v)}catch(e){}};
// hurt vignette
const vg=document.createElement('div');vg.id='hurt80';document.body.appendChild(vg);
// ---------- events from the game ----------
const E0=G.emit;G.emit=function(ev,d){const r=E0.apply(this,arguments);try{
 if(ev==='hit'&&d&&d.type==='tox'){const prev=lastHp.has(d)?lastHp.get(d):(d.hp+1),dm=Math.max(0,+(prev-d.hp).toFixed(2))||1;lastHp.set(d,d.hp);
  const e=objMap.get(d.id),p=(e?e.g.position.clone():objW(d)).add(V3(0,(e&&e.g.userData.hpY||.95)*.85,0));
  num(p,'-'+(+dm.toFixed(1)),d.hp<=0?'#fff35a':'#ffd84a',d.hp<=0);tint(d,WHITE,70);knock(d,d.el===2?.1:.28);
  snd('hit80');rt.shake=Math.min(rt.shake||0,PH?2:3.5)}
 else if(ev==='hit'){rt.shake=Math.min(rt.shake||0,PH?1.5:3)}
 if(ev==='hurt'){shake(PH?4:8);vg.classList.remove('on');void vg.offsetWidth;vg.classList.add('on')}
 if(ev==='pop'&&d&&d.o&&d.o.type==='tox')defeat(d.o)}catch(e){console.warn('c80',e)}return r};
try{emit=G.emit}catch(e){}
function defeat(o){const p=objW(o).add(V3(0,.15,0)),big=o.el===2?2.2:o.el===1?1.5:1;snd(o.el===2?'bossdown80':'defeat80');
 const ring=new THREE.Mesh(new THREE.RingGeometry(.3,.42,40),ringM(o.el===2?0xffd84a:0xd9a0ff));ring.rotation.x=-Math.PI/2;ring.position.copy(p);ring.renderOrder=8;
 fxAdd(ring,.6,(m,k)=>{m.scale.setScalar(1+k*3.2*big);m.material.opacity=(1-k)*.9});
 burstW(p.clone().add(V3(0,.2,0)),PH?10:18,0x2a2038,.9,{size:.22,decay:.02});
 if(o.el){floatW(p.clone().add(V3(0,1,0)),(o.el===2?'👑 ':'★ ')+L('Defeated!','¡Derrotado!'),'#ffd84a')}
 shake(o.el===2?(PH?6:12):(PH?2:4));
 if(o.el===2){try{const t=(Z(S.zone)||{}).tier|0,b=30+t*10;gainLux(b);toast('👑 '+L('Boss defeated! +','¡Jefe derrotado! +')+b+' Lux')}catch(e){}if(o===bossO)bossO=null}}
// ---------- telegraphs + dodges (events from content24.js) ----------
const COL={lunge:0xff3b3b,bite:0xff7a3b,spit:0x6fdcff,slam:0xffb020};
addEventListener('fs80',ev=>{const d=ev.detail||{},o=d.o;try{
 if(d.k==='tel'){const t=d.t,c=COL[t.k]||0xff3b3b,base=objW({i:t.i,j:t.j}).add(V3(0,.06,0));
  const g=new THREE.Group();const outer=new THREE.Mesh(new THREE.RingGeometry(t.r*.86,t.r,40),ringM(c));const fill=new THREE.Mesh(new THREE.CircleGeometry(t.r,32),ringM(c));
  outer.rotation.x=fill.rotation.x=-Math.PI/2;fill.material.opacity=.06;outer.material.opacity=.6;fill.material.depthWrite=outer.material.depthWrite=false;fill.scale.setScalar(.01);outer.renderOrder=fill.renderOrder=7;g.add(outer,fill);g.position.copy(base);
  fxAdd(g,t.dur/1000,(m,k)=>{fill.scale.setScalar(Math.max(.01,k));fill.material.opacity=.06+.16*k;outer.material.opacity=.45+.4*Math.abs(Math.sin(k*Math.PI*4))});
  if(t.k!=='bite')snd(t.k==='slam'?'slam80':'tel80');
  const e=objMap.get(o.id);if(e){let n=0;const blink=()=>{if(n++>=Math.floor(t.dur/160))return;tint(o,RED,70);setTimeout(blink,160)};blink()}}
 if(d.k==='dodge'){floatW(mePosW().add(V3(0,1,0)),L('Dodged!','¡Esquivado!'),'#9fe8ff');snd('dodge80')}
}catch(e){console.warn('tel80',e)}});
// ---------- one boss per world (after it is half restored) ----------
let bossO=null,bossZ=null,tried={};
const rNow=()=>{try{return G.FSrestore?FSrestore().r:0}catch(e){return 0}};
setInterval(()=>{try{if(typeof S==='undefined'||!S.zones||!fa())return;const id=S.zone;if(id!==bossZ){bossZ=id;bossO=null;tried={}}
 const s=S.zones[id];if(!s||!G.FSmonDanger||!FSmonDanger(id))return;
 const ex=s.objs.find(o=>o.type==='tox'&&o.mon&&o.el===2);if(ex){bossO=ex;return}if(bossO&&!s.objs.includes(bossO))bossO=null;
 const force=/[?&]boss80/.test(location.search);
 if(!tried[id]&&(rNow()>=.5||force)){tried[id]=1;const k=(FSmonKinds(id)||['stalker'])[0];const o=FSspawnMon(id,k,2,null);
  if(o){bossO=o;snd('boss80');toast('👑 '+FSmonName(o)+' '+L('appeared! Defeat it for bonus Lux.','¡apareció! Derrótalo para ganar Lux extra.'));shake(PH?3:6)}}}catch(e){console.warn('boss80',e)}},2500);
function drawBossBar(c){const o=bossO;if(!o||S.zones[S.zone].objs.indexOf(o)<0){return}const W=c.canvas.width/Math.min(2,devicePixelRatio||1),w=Math.min(PH?280:420,W*.7),x0=(W-w)/2,y0=PH?178:86;
 const h0=Math.max(o.hp0||o.hp,1),fr=Math.max(0,o.hp/h0);c.save();c.font='900 '+(PH?13:15)+'px "Trebuchet MS",system-ui';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#000b';const nm='👑 '+FSmonName(o);c.strokeText(nm,W/2,y0-6);c.fillStyle='#ffe9a8';c.fillText(nm,W/2,y0-6);
 c.fillStyle='#0b1a10d0';rr(c,x0-3,y0-3,w+6,16,8);c.fill();const g=c.createLinearGradient(x0,0,x0+w,0);g.addColorStop(0,'#b31232');g.addColorStop(1,'#ff6a3a');c.fillStyle=g;if(fr>0){rr(c,x0,y0,Math.max(10,w*fr),10,5);c.fill()}
 c.strokeStyle='#ffd84a';c.lineWidth=1.5;rr(c,x0-3,y0-3,w+6,16,8);c.stroke();c.restore()}
G.FS80={nums,get boss(){return bossO}};
}

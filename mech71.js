// v7.1 realistic mechanics (Leo): smooth accel/turn momentum, slope-aware speed, dust puffs + footprints (sand/snow),
// mud/water ripples + splashes, idle behaviours (look around, sniff, sit). Visual style unchanged (toon fauna). Cheap: pooled meshes only.
import * as THREE from 'three';
const G=window,W=G.W6;
const RT=()=>{try{return rt}catch(e){return null}};const HIGH=!!(G.GL&&G.GL.Q==='high');
// ---------- 1+2: momentum + slope-aware speed (called from game.js step) ----------
const MV={v:0,dx:0,dz:0};
const hgt=(i,j)=>{try{const c=W?W.C0:0;return G.HGT?G.HGT(i-c,j-c):0}catch(e){return 0}};
G.FSMove=function(f,rt,dt,d,di,dj){const s=dt/1000,top=f.energy>=95?4.4:3.2;
 const ux=di/(d||1),uz=dj/(d||1);
 // sharp turns bleed speed (momentum), gentle bends keep it
 if(MV.v>0){const dot=ux*MV.dx+uz*MV.dz;if(dot<.7)MV.v*=Math.max(.35,.55+.45*dot)}MV.dx=ux;MV.dz=uz;
 // slope: compare ground height just ahead vs here
 const p=rt.pos,h0=hgt(p.i,p.j),h1=hgt(p.i+ux*.5,p.j+uz*.5),sl=(h1-h0)/.5;
 const slope=sl>0?Math.max(.55,1-sl*.45):Math.min(1.18,1-sl*.12);
 let want=top*slope;
 // ease in near the destination (arrive), but never crawl
 want=Math.min(want,Math.max(.9,Math.sqrt(2*7*d)));
 const acc=want>MV.v?6.5:11;MV.v+=Math.sign(want-MV.v)*Math.min(Math.abs(want-MV.v),acc*s);
 MV.v=Math.max(MV.v,.6);G.FSMoveV=MV.v/top;return MV.v*s};
// reset momentum when idle so the next walk starts with a small ramp
setInterval(()=>{try{if(!RT()||!RT().tgt)MV.v=Math.min(MV.v,.6)}catch(e){}},200);

if(W){const {scene}=W;const Z_=()=>{try{return Z(S.zone)}catch(e){return null}};
const surf=()=>{const z=Z_();if(!z)return'g';const id=S.zone||'',b=z.biome;
 if(b==='arctic'||/aurora|frost|snow|glacier/.test(id))return'snow';
 if(b==='scorch'||b==='mesa'||b==='beach'||b==='sea'||/mirage|oasis|desert|dune|cinder/.test(id))return'sand';
 if(b==='swamp'||/wisp|marsh|bog|fen/.test(id))return'mud';
 if(b==='dungeon')return'stone';return'g'};
// ---- footprints (instanced, pooled) ----
const NP=HIGH?40:16;const fpG=new THREE.CircleGeometry(.055,10);fpG.rotateX(-Math.PI/2);fpG.scale(1,1,1.45);
const fpM=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.22,depthWrite:false,vertexColors:false});
const fp=new THREE.InstancedMesh(fpG,fpM,NP);fp.instanceMatrix.setUsage(THREE.DynamicDrawUsage);fp.frustumCulled=false;fp.renderOrder=1;fp.raycast=()=>{};fp.userData.noToon=1;
const fpA=new Float32Array(NP),fpX=[];let fpi=0;const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),ps=new THREE.Vector3(),YA=new THREE.Vector3(0,1,0);
for(let k=0;k<NP;k++){fpX.push({x:0,y:-99,z:0,r:0});m4.makeScale(0,0,0);fp.setMatrixAt(k,m4)}scene.add(fp);
// ---- ripples (pooled rings) ----
const NR=HIGH?8:4,rpG=new THREE.RingGeometry(.12,.17,24);rpG.rotateX(-Math.PI/2);const rp=[];
for(let k=0;k<NR;k++){const m=new THREE.Mesh(rpG,new THREE.MeshBasicMaterial({color:0xe8f6ff,transparent:true,opacity:0,depthWrite:false}));m.visible=false;m.raycast=()=>{};m.userData.noToon=1;m.renderOrder=2;scene.add(m);rp.push({m,a:0})}let rpi=0;
// ---- dust puffs (pooled soft sprites) ----
const dT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,.9)');g.addColorStop(.5,'rgba(255,255,255,.35)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const ND=HIGH?18:8,du=[];for(let k=0;k<ND;k++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:dT,transparent:true,depthWrite:false,opacity:0}));s.visible=false;s.raycast=()=>{};s.userData.noToon=1;scene.add(s);du.push({s,a:0,v:new THREE.Vector3()})}let dui=0;
const DCOL={sand:0xe8d3a0,snow:0xffffff,mud:0x7b6a48,stone:0xb0a8a0,g:0xcfc4a0};
function puff(p,kind,n,up){for(let k=0;k<n;k++){const d=du[dui++%ND];d.s.position.set(p.x+(Math.random()-.5)*.15,p.y+.04,p.z+(Math.random()-.5)*.15);d.s.material.color.set(DCOL[kind]||DCOL.g);d.s.scale.setScalar(.12);d.a=1;d.s.visible=true;d.v.set((Math.random()-.5)*.5,.25+Math.random()*(up||.35),(Math.random()-.5)*.5)}}
function ripple(p,big){const r=rp[rpi++%NR];r.m.position.set(p.x,p.y+.02,p.z);r.a=1;r.big=big?1.8:1;r.m.visible=true}
function print(p,yaw,side){const k=fpi++%NP,f=fpX[k];const ox=Math.cos(yaw)*.07*side,oz=-Math.sin(yaw)*.07*side;f.x=p.x+ox;f.y=p.y+.012;f.z=p.z+oz;f.r=yaw;fpA[k]=1}
// ---- idle behaviours ----
const ID={still:0,act:null,t0:0,next:4+Math.random()*3};
function idle(fa,dt,t,rt){const r=fa.userData.rig;if(!r)return;const busy=rt.tgt||rt.sleep||rt.trick||(Date.now()-(rt.zapT||0))<1500||(Date.now()-(rt.happyT||0))<1500;
 if(busy){ID.still=0;ID.act=null;return}ID.still+=dt;
 if(!ID.act&&ID.still>ID.next){const a=['look','sniff','sit','look','sniff'];ID.act=a[(Math.random()*a.length)|0];ID.t0=t;ID.dur=ID.act==='sit'?6:ID.act==='look'?3.2:2.4}
 if(!ID.act)return;const e=t-ID.t0,k=Math.min(1,e/.4,(ID.dur-e)/.4);if(e>ID.dur){ID.act=null;ID.still=0;ID.next=5+Math.random()*6;return}
 if(k<=0)return;const b=r.body;
 if(ID.act==='look'&&r.head){r.head.rotation.y=Math.sin(e*1.6)*.75*k;r.head.rotation.x=-.08*k}
 else if(ID.act==='sniff'&&r.head){r.head.rotation.x=.45*k+Math.sin(e*22)*.03*k;r.head.rotation.y=Math.sin(e*.9)*.2*k;if(Math.random()<.06){const p=new THREE.Vector3();r.head.getWorldPosition(p);puff(p.setY(fa.position.y),surf(),1,.1)}}
 else if(ID.act==='sit'){const L=fa.userData.lift||b.position.y;b.position.y=L*(1-.22*k);b.rotation.x=-.28*k;r.legs.forEach((l,i)=>{if(i>=2)l.rotation.x=-.9*k});if(r.tail)r.tail.rotation.y*=1-k*.6}}
// ---- per-render hook (runs after animFauna, before draw) ----
let last=performance.now(),lp=null,acc=0,side=1,wet=0;const prevBR=scene.onBeforeRender;
scene.onBeforeRender=function(...a){if(prevBR)try{prevBR.apply(this,a)}catch(e){}
 const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(dt<=0)return;const t=now/1000;
 try{const fa=G.GLfauna&&G.GLfauna();const rt=RT();if(fa&&rt){idle(fa,dt,t,rt);
  const p=fa.position;if(lp){const dd=Math.hypot(p.x-lp.x,p.z-lp.z);if(dd>1.5){lp.copy(p)}else{acc+=dd;const kind=surf();
   const stride=kind==='mud'?.42:.34;if(acc>stride&&rt.tgt){acc=0;side=-side;const yaw=fa.rotation.y;
    if(kind==='sand'||kind==='snow')print(p,yaw,side);
    if(kind==='mud'){ripple(p,0);if(Math.random()<.35)puff(p,'mud',2,.6)}
    else if(Math.random()<(kind==='g'?.35:.8))puff(p,kind,kind==='g'?1:2)}
   // entering a wet patch / big landing => splash
   if(kind==='mud'&&rt.tgt&&!wet){wet=1;ripple(p,1);puff(p,'mud',4,1)}if(!rt.tgt)wet=0}}
  lp=lp||new THREE.Vector3();lp.copy(p)}}catch(e){}
 // decay pools
 let dirty=false;for(let k=0;k<NP;k++){if(fpA[k]>0){fpA[k]-=dt/(HIGH?9:5);const f=fpX[k],a=Math.max(0,fpA[k]);q.setFromAxisAngle(YA,f.r);sc.setScalar(a>0?.6+a*.4:0);ps.set(f.x,f.y,f.z);m4.compose(ps,q,sc);fp.setMatrixAt(k,m4);dirty=true}}if(dirty)fp.instanceMatrix.needsUpdate=true;
 fpM.color.set(surf()==='snow'?0x5a7090:0x5a3a1a);fpM.opacity=surf()==='snow'?.3:.25;
 for(const r of rp)if(r.a>0){r.a-=dt*.9;const s=(1-r.a)*2.4*r.big+.4;r.m.scale.set(s,1,s);r.m.material.opacity=Math.max(0,r.a)*.55;if(r.a<=0)r.m.visible=false}
 for(const d of du)if(d.a>0){d.a-=dt*1.4;d.s.position.addScaledVector(d.v,dt);d.v.multiplyScalar(1-dt*2);d.s.scale.setScalar(.12+(1-d.a)*.32);d.s.material.opacity=Math.max(0,d.a)*.5;if(d.a<=0)d.s.visible=false}};
G.FSMech={surf,puff,ripple,ID,stats:()=>({fp:[...fpA].filter(a=>a>0).length,rp:rp.filter(r=>r.a>0).length,du:du.filter(d=>d.a>0).length,v:G.FSMoveV})};
}

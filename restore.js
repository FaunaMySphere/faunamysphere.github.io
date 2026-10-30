// v7.6 PREVIEW: world restoration. Each non-home world starts dark & polluted and brightens as pollution ('poll') and monsters ('tox') are cleared.
// Save: S.restore = {zoneId: 0..1} (added on demand; default computed from the zone's current objects). Leaving a world resets ITS world state
// (pollution + monsters respawned, restoration 0). Player progress (Lux, XP, levels, fauna, goals, items) is never touched.
import * as THREE from 'three';
const G=window,es=()=>G.FS&&FS.lang==='es';
const W=()=>G.W6||{};
// v8.1.2 FIX: monsters are counted against the most seen in this world this visit (content24 fills up to ~6 while z.tox is 1-4,
// so killing most of them used to count for nothing), and pollution against max(z.poll, peak). A boss adds to the peak, so it must die for 100%.
const PK={id:null,P:0,T:0};
function target(id){try{const z=Z(id),s=S.zones[id];if(!s)return 0;const p=s.objs.filter(o=>o.type==='poll').length,t=s.objs.filter(o=>o.type==='tox').length;
 if(PK.id!==id){PK.id=id;PK.P=0;PK.T=0}PK.P=Math.max(PK.P,p);PK.T=Math.max(PK.T,t);
 const P=Math.max(1,z.poll|0,PK.P),T=Math.max(z.tox|0,PK.T);const fp=1-Math.min(1,p/P),ft=T?1-Math.min(1,t/T):fp;return T?(fp*.5+ft*.5):fp}catch(e){return 1}}
G.FSrestoreTarget=target;
// ---------- reset a world when the player leaves it ----------
function resetZone(id){try{if(id==='home'||!S.zones[id])return;const s=S.zones[id],z=Z(id);s.objs=s.objs.filter(o=>o.type!=='poll'&&o.type!=='tox');
 for(let k=0;k<(z.poll|0);k++)spawnPoll(id);for(let k=0;k<(z.tox|0);k++)spawnTox(id);(S.restore=S.restore||{})[id]=0}catch(e){console.warn('restore reset',e)}}
G.FSresetZone=resetZone;
function hookTravel(){const RR=typeof R!=='undefined'?R:G.R;if(!RR||!RR.travel)return setTimeout(hookTravel,300);const t0=RR.travel;RR.travel=function(a){const prev=S.zone,vis=G.FSVisit&&FSVisit.on;const r=t0.apply(this,arguments);
 try{if(!vis&&prev&&prev!==S.zone&&prev!=='home')resetZone(prev);if(prev!==S.zone){PK.id=null;if(S.zone!=='home'){rDisp=target(S.zone);seenFull=rDisp>=.999}}}catch(e){}return r}}hookTravel();
// v8.1.2 FIX: pollution/monsters no longer creep back by themselves (~every 30 s in simulate) while you are restoring the world you are in,
// so 100% can actually be reached; the world still resets when you leave, and Leo's 5-min monster return (content24) still runs.
let inSim=false;function hookRegrow(){if(typeof G.simulate!=='function'||typeof G.spawnPoll!=='function'||typeof G.spawnTox!=='function')return setTimeout(hookRegrow,300);
 const s0=G.simulate;G.simulate=function(){inSim=true;try{return s0.apply(this,arguments)}finally{inSim=false}};
 for(const k of['spawnPoll','spawnTox']){const f0=G[k];G[k]=function(id){if(inSim&&id===S.zone&&id!=='home')return;return f0.apply(this,arguments)}}}
if(!new URLSearchParams(location.search).has('regrow'))hookRegrow();
// ---------- visuals: snapshot env after applyEnv, then lerp toward "polluted" by k=1-r ----------
const base={ok:0,sunI:0,hemiI:0,sunC:new THREE.Color(),bg:new THREE.Color(),fogC:new THREE.Color(),near:0,far:0,top:new THREE.Color(),hor:new THREE.Color(),exp:1};
// rev2: moody polluted look = dark slate sky over a sickly amber horizon, low amber sun, desaturated cool terrain; restored = extra saturation/brightness
const SMOG=new THREE.Color('#6a6250'),SKYT=new THREE.Color('#2f3440'),SKYH=new THREE.Color('#a8864e'),BGM=new THREE.Color('#3a3c42'),SUNM=new THREE.Color('#e09a55'),GREY=new THREE.Color('#6d7380'),tmp=new THREE.Color(),HSL={h:0,s:0,l:0};
function snap(){const w=W(),sc=w.scene;if(!sc||!w.sun)return;if(G.FS_tint81)try{G.FS_tint81()}catch(e){}base.sunI=w.sun.intensity;base.hemiI=w.hemi.intensity;base.sunC.copy(w.sun.color);if(sc.background&&sc.background.isColor)base.bg.copy(sc.background);
 if(sc.fog){base.fogC.copy(sc.fog.color);base.near=sc.fog.near;base.far=sc.fog.far}if(w.su){base.top.copy(w.su.uTop.value);base.hor.copy(w.su.uHor.value)}base.exp=w.R?w.R.toneMappingExposure:1;const bd=G._bd&&G._bd();base.bdRef=bd||null;if(bd){base.bdT=bd[0].clone();base.bdH=bd[1].clone()}base.ok=1;lastK=-1}
let wrapped=null;setInterval(()=>{if(G.W6env&&G.W6env!==wrapped){const e0=G.W6env;wrapped=G.W6env=function(){const r=e0.apply(this,arguments);try{snap()}catch(_){}return r}}else if(!G.W6env&&!wrapped){wrapped=G.W6env=function(){try{snap()}catch(_){}}}},250);
// terrain tint: multiply island materials' colour (no new materials)
let isl=null,mats=[];G.FSrestoreRegrab=()=>{isl=null};function grabMats(){const w=W(),I=w.island;if(I===isl)return;isl=I;mats=[];if(!I)return;const seen=new Set();I.traverse(m=>{const M=m.material;(Array.isArray(M)?M:[M]).forEach(x=>{if(x&&x.color&&!seen.has(x)){seen.add(x);if(!x.userData.rc0)x.userData.rc0=x.color.clone();mats.push(x)}})});lastK=-1}
// particles: smog (big soft) + sparkles; fixed buffers
let smog=null,spark=null,pts=null;
function mkPts(){const w=W();if(!w.scene)return;const q=G.GL&&GL.Q,n=q==='low'?18:q==='med'?36:60;
 const mk=(n,size,col,add)=>{const p=new Float32Array(n*3);for(let k=0;k<n;k++){p[k*3]=(Math.random()-.5)*24;p[k*3+1]=Math.random()*5+.3;p[k*3+2]=(Math.random()-.5)*24}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));
  const c=document.createElement('canvas');c.width=c.height=32;const x=c.getContext('2d'),gr=x.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.fillRect(0,0,32,32);
  const m=new THREE.PointsMaterial({size,map:new THREE.CanvasTexture(c),color:col,transparent:true,opacity:0,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,sizeAttenuation:true});const o=new THREE.Points(g,m);o.frustumCulled=false;o.renderOrder=5;w.scene.add(o);return o};
 smog=mk(n,3.2,0x5a5548,false);spark=mk(Math.round(n*.6),.25,0xfff3a0,true)}
let rDisp=0,lastK=-1,seenFull=false,celeT=0;
function celebrate(){try{banner(es()?'¡MUNDO RESTAURADO!':'WORLD RESTORED!')}catch(e){}try{toast(es()?'🌈 ¡Mundo restaurado! El aire está limpio otra vez.':'🌈 World restored! The air is clean again.')}catch(e){}
 try{[523,659,784,1047,1319].forEach((n,k)=>Sound.tone(n,.25,'triangle',.09,k*.1))}catch(e){}celeT=performance.now()}
let lt=performance.now();
(function loop(){requestAnimationFrame(loop);const w=W();if(!base.ok||!w.scene||typeof S==='undefined'||!S.zone)return;const now=performance.now(),dt=Math.min(.1,(now-lt)/1000);lt=now;
 const home=S.zone==='home';const tg=home?1:target(S.zone);if(!home){S.restore=S.restore||{};S.restore[S.zone]=+tg.toFixed(3)}
 rDisp+=(tg-rDisp)*Math.min(1,dt*.8);if(Math.abs(tg-rDisp)<.002)rDisp=tg;
 if(!home&&tg>=.999&&!seenFull){seenFull=true;celebrate()}if(tg<.98)seenFull=false;
 grabMats();if(!smog)mkPts();
 const k=home?0:(1-rDisp);const cele=Math.max(0,1-(now-celeT)/2500);
 if(smog){smog.material.opacity=.42*k;smog.visible=k>.01;smog.rotation.y+=dt*.02;spark.material.opacity=home?0:Math.max(0,(rDisp-.5)*1.6)*(.6+.4*Math.sin(now/300))+cele*.6;spark.visible=spark.material.opacity>.01;spark.rotation.y-=dt*.05;spark.position.y=Math.sin(now/1500)*.3}
 if(Math.abs(k-lastK)<.0015)return;lastK=k;
 const v=home?0:Math.max(0,(rDisp-.6)/.4); // vivid boost toward 100%
 w.sun.intensity=base.sunI*(1-.4*k)*(1+.12*v);w.hemi.intensity=base.hemiI*(1-.45*k)*(1+.1*v);w.sun.color.copy(base.sunC).lerp(SUNM,.75*k);
 if(w.scene.background&&w.scene.background.isColor)w.scene.background.copy(base.bg).lerp(BGM,.8*k);
 if(w.scene.fog){w.scene.fog.color.copy(base.fogC).lerp(SMOG,.85*k);w.scene.fog.near=base.near*(1-.55*k);w.scene.fog.far=base.far*(1-.35*k)}
 if(w.su){w.su.uTop.value.copy(base.top).lerp(SKYT,.85*k);w.su.uHor.value.copy(base.hor).lerp(SKYH,.8*k);if(v){w.su.uTop.value.getHSL(HSL);w.su.uTop.value.setHSL(HSL.h,Math.min(1,HSL.s*(1+.25*v)),HSL.l)}}
 if(w.R)w.R.toneMappingExposure=base.exp*(1-.12*k)*(1+.05*v);
 {const bd=G._bd&&G._bd();if(bd&&bd===base.bdRef&&base.bdT){const kq=Math.round(k*20)/20;bd[0].copy(base.bdT).lerp(SKYT,.8*kq);bd[1].copy(base.bdH).lerp(SKYH,.75*kq);if(v){bd[0].getHSL(HSL);bd[0].setHSL(HSL.h,Math.min(1,HSL.s*(1+.2*v)),HSL.l)}}} // v8.1.2: the v7 sky backdrop follows restoration too (repaints only on 5% steps)
 for(const m of mats){m.color.copy(m.userData.rc0);m.color.getHSL(HSL);m.color.setHSL(HSL.h,Math.min(1,HSL.s*(1-.75*k)*(1+.3*v)),HSL.l*(1-.35*k)*(1+.04*v));m.color.lerp(tmp.copy(GREY).multiplyScalar(HSL.l*1.4),.25*k)}})();
G.FSrestore=()=>({r:rDisp,target:S.zone==='home'?1:target(S.zone),saved:S.restore});

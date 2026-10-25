// v6.7 monster models + animation (toon style, glowing eyes). Builds for 'tox' objs that carry o.mon.
import * as THREE from 'three';
const G=window,B=G.GLB;
if(B&&B.tox){
const t0=B.tox,live=new Set();
const MC=new Map();const L=(c,e=0,ei=0)=>{const k=c+'_'+e+'_'+ei;let m=MC.get(k);if(!m){m=new THREE.MeshToonMaterial({color:c,emissive:e,emissiveIntensity:ei});MC.set(k,m)}return m};
const M=(geo,mat,p=[0,0,0],s=[1,1,1],r=[0,0,0])=>{const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.scale.set(...s);m.rotation.set(...r);return m};
const SPH=new THREE.SphereGeometry(1,14,10),CONE=new THREE.ConeGeometry(1,1,8),CYL=new THREE.CylinderGeometry(1,1,1,8);
const glowT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.3,'rgba(255,255,255,.6)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const EMC=new Map(),EM=c=>{let m=EMC.get(c);if(!m){m=new THREE.MeshBasicMaterial({color:c});EMC.set(c,m)}return m};
function eyes(par,col,pairs,y,z,sp,s){z+=.07;const em=EM(col),out=[];for(let k=0;k<pairs.length;k++){const[x,yy]=pairs[k];const e=M(SPH,em,[x*sp,y+yy,z],[s,s*.8,s*.6]);par.add(e);const gl=new THREE.Sprite(new THREE.SpriteMaterial({map:glowT,color:col,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));gl.position.set(x*sp,y+yy,z+.05);gl.scale.setScalar(s*11);par.add(gl);out.push(gl)}return out}
const legs=(par,mat,n,len,r,y,spread)=>{const ls=[];for(let k=0;k<n;k++){const side=k%2?1:-1,i=Math.floor(k/2),z=(i-(n/2-1)/2)*spread;const l=new THREE.Group();l.position.set(side*r,y,z);const a=M(CYL,mat,[side*len*.4,len*.15,0],[.025,len*.8,.025],[0,0,side*-1.1]);const b=M(CYL,mat,[side*len*.75,-len*.2,0],[.02,len*.7,.02],[0,0,side*.5]);l.add(a,b);par.add(l);ls.push(l)}return ls};
let WM=null;
const BUILD={
 stalker(b){const m=L(0x120c1c,0x2a0a3a,.4);b.add(M(SPH,m,[0,.42,0],[.26,.36,.22]));b.add(M(SPH,m,[0,.78,.06],[.2,.18,.2]));for(let k=0;k<5;k++)b.add(M(CONE,m,[(k-2)*.09,.18,-.05],[.06,.4,.06],[Math.PI,0,(k-2)*.15]));
  [-1,1].forEach(s=>b.add(M(CONE,m,[s*.28,.5,.1],[.04,.35,.04],[1.2,0,s*.9])));b.add(M(CONE,m,[0,.98,-.02],[.08,.25,.05],[-.3,0,0]));[-1,1].forEach(s=>{b.add(M(CONE,m,[s*.12,1.02,0],[.035,.24,.035],[-.5,0,s*-.55]));b.add(M(CONE,m,[s*.2,1.08,-.06],[.025,.18,.025],[-.9,0,s*-1.2]))});for(let k=0;k<4;k++)b.add(M(CONE,m,[0,.85-k*.14,-.2],[.04,.16,.04],[-1.9,0,0]));[-1,1].forEach(s=>{for(let k=-1;k<=1;k++)b.add(M(CONE,L(0xe8dcff),[s*.4+k*.035,.3,.32],[.014,.1,.014],[2.2,0,0]))});return{eyes:eyes(b,0xff2244,[[-1,0],[1,0]],.8,.2,.08,.035),tw:1}},
 bramble(b){const m=L(0x3b4a1c),th=L(0x6b4426),fl=L(0xa01848,0x600020,.5);b.add(M(SPH,m,[0,.34,0],[.36,.3,.4]));for(let k=0;k<16;k++){const a=k*2.4,y=.2+((k*37)%10)/22;b.add(M(CONE,th,[Math.cos(a)*.32,y,Math.sin(a)*.34],[.035,.22,.035],[Math.sin(a)*1.3,0,-Math.cos(a)*1.3]))}
  b.add(M(SPH,fl,[.18,.62,.1],[.07,.07,.07]));b.add(M(SPH,L(0x1a1208),[0,.3,.36],[.18,.08,.06]));for(let k=-2;k<=2;k++)b.add(M(CONE,L(0xe8e0c0),[k*.06,.33,.38],[.02,.06,.02],[Math.PI,0,0]));[-1,1].forEach(s=>b.add(M(CONE,L(0xd8c8a0),[s*.2,.62,.22],[.045,.3,.045],[.6,0,s*-.7])));const lg=legs(b,th,4,.3,.25,.12,.3);return{eyes:eyes(b,0xffb000,[[-1,0],[1,0],[-1.8,.08],[1.8,.08]],.46,.34,.08,.03),legs:lg}},
 wraith(b){const m=WM||(WM=new THREE.MeshToonMaterial({color:0xcfefff,emissive:0x5fb8ff,emissiveIntensity:.35,transparent:true,opacity:.82}));b.add(M(SPH,m,[0,.75,0],[.2,.24,.2]));b.add(M(CONE,m,[0,.4,0],[.26,.7,.26],[Math.PI,0,0]));
  for(let k=0;k<3;k++)b.add(M(CONE,m,[(k-1)*.12,.05,0],[.06,.25,.06],[Math.PI,0,(k-1)*.3]));[-1,1].forEach(s=>b.add(M(CONE,m,[s*.25,.6,.05],[.05,.35,.05],[0,0,s*2.2])));
  for(let k=0;k<5;k++)b.add(M(CONE,L(0xeaffff,0x88ccff,.6),[(k-2)*.07,.98,0],[.025,.14,.025]));[-1,1].forEach(s=>{for(let k=-1;k<=1;k++)b.add(M(CONE,m,[s*(.48+k*.0),.38+k*.04,.08],[.018,.14,.018],[Math.PI,0,s*.3+k*.25]))});return{eyes:eyes(b,0x40e8ff,[[-1,0],[1,0]],.76,.18,.07,.035),float:1}},
 lurker(b){const m=L(0x2c3a1e,0x0b1a04,.3),mud=L(0x4a3a22);b.add(M(SPH,mud,[0,.02,0],[.45,.05,.45]));const body=new THREE.Group();b.add(body);body.add(M(SPH,m,[0,.3,0],[.34,.36,.3]));
  body.add(M(SPH,L(0x0d0a06),[0,.25,.27],[.22,.1,.06]));for(let k=-3;k<=3;k++)body.add(M(CONE,L(0xd8d0a8),[k*.055,.3,.3],[.018,.07,.018],[Math.PI,0,0]));
  [-1,1].forEach(s=>body.add(M(CONE,L(0xd8d0a8),[s*.12,.2,.3],[.03,.14,.03],[0,0,0])));for(let k=0;k<6;k++){const a=k/6*6.28;body.add(M(CYL,m,[Math.cos(a)*.3,.55,Math.sin(a)*.25],[.02,.25,.02],[Math.sin(a)*.6,0,-Math.cos(a)*.6]))}
  return{eyes:eyes(body,0xc6ff1a,[[-1,0],[1,0],[0,.1]],.48,.27,.1,.03),rise:body}},
 scorpion(b){const m=L(0xc28a4a,0x3a1a00,.2),d=L(0x7a4a22);b.add(M(SPH,m,[0,.18,0],[.24,.11,.32]));const tail=new THREE.Group();tail.position.set(0,.2,-.28);b.add(tail);
  for(let k=0;k<5;k++)tail.add(M(SPH,m,[0,.08+k*.1,-.04-k*.03+(k>2?(k-2)*.07:0)],[.07,.07,.07]));tail.add(M(CONE,L(0x2a1408,0x400000,.4),[0,.58,.12],[.04,.14,.04],[2.4,0,0]));
  [-1,1].forEach(s=>{b.add(M(CYL,d,[s*.22,.18,.3],[.03,.25,.03],[1.4,0,s*.5]));b.add(M(SPH,m,[s*.3,.18,.45],[.09,.05,.12]));b.add(M(CONE,d,[s*.34,.2,.57],[.035,.12,.03],[1.6,0,s*.4]));b.add(M(CONE,d,[s*.25,.2,.56],[.03,.1,.03],[1.6,0,-s*.4]))});for(let k=0;k<3;k++)b.add(M(CONE,d,[0,.29,.12-k*.12],[.03,.09,.03]));const lg=legs(b,d,6,.25,.18,.12,.14);return{eyes:eyes(b,0xff3a10,[[-1,0],[1,0]],.27,.27,.06,.025),legs:lg,tail}},
 spider(b){const m=L(0x1a1420,0x1a0010,.3),h=L(0x2a1a30);b.add(M(SPH,m,[0,.2,-.12],[.17,.15,.2]));b.add(M(SPH,h,[0,.17,.1],[.11,.09,.1]));b.add(M(SPH,L(0x8a1020,0x600010,.6),[0,.3,-.16],[.06,.02,.08]));
  [-1,1].forEach(s=>b.add(M(CONE,L(0xe8e0d0,0x400010,.3),[s*.04,.1,.19],[.018,.08,.018],[Math.PI-.3,0,0])));for(let k=0;k<6;k++)b.add(M(CONE,m,[(k%2?1:-1)*.06,.33,-.05-Math.floor(k/2)*.07],[.015,.07,.015]));const lg=legs(b,h,8,.32,.08,.18,.07);return{eyes:eyes(b,0xff2060,[[-1,0],[1,0],[-.5,.04],[.5,.04],[-1.4,.05],[1.4,.05]],.2,.19,.04,.016),legs:lg}}};
// v6.14: build each type once, merge same-material parts into one mesh, then clone (shared geometry+materials)
function mergeIn(par){const by=new Map();for(const c of [...par.children])if(c.isMesh&&!c.children.length){c.updateMatrix();if(!by.has(c.material))by.set(c.material,[]);by.get(c.material).push(c)}
 for(const[mat,list]of by){if(list.length<2)continue;const P=[],N=[],I=[];let off=0;for(const m of list){const g=m.geometry.clone();g.applyMatrix4(m.matrix);const p=g.attributes.position.array,n=g.attributes.normal.array;for(const v of p)P.push(v);for(const v of n)N.push(v);const ix=g.index?g.index.array:[...Array(p.length/3).keys()];for(const v of ix)I.push(v+off);off+=p.length/3;g.dispose();par.remove(m)}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));geo.setIndex(I);geo.computeBoundingSphere();par.add(new THREE.Mesh(geo,mat))}}
const TPL={};
function tpl(mon){if(TPL[mon])return TPL[mon];const b=new THREE.Group();const u=BUILD[mon](b)||{};
 (u.legs||[]).forEach(l=>{l.name='leg';mergeIn(l)});(u.eyes||[]).forEach(e=>e.name='eye');if(u.tail){u.tail.name='tail';mergeIn(u.tail)}if(u.rise){u.rise.name='rise';mergeIn(u.rise)}mergeIn(b);
 return TPL[mon]={b,float:u.float,tw:u.tw}}
let CROWN=null;const crown=()=>{if(!CROWN){CROWN=new THREE.Group();const cr=L(0xffd040,0x804000,.6);for(let k=0;k<5;k++)CROWN.add(M(CONE,cr,[(k-2)*.06,1.05,0],[.025,.1,.025]));mergeIn(CROWN)}return CROWN.clone()};
const SPM=new Map(),spm=(c,op,add)=>{const k=c+'_'+add;let m=SPM.get(k);if(!m){m=new THREE.SpriteMaterial({map:glowT,color:c,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending});m.userData.op=op;SPM.set(k,m)}return m};
B.tox=o=>{if(!o||!o.mon||!BUILD[o.mon])return t0(o);let T;try{T=tpl(o.mon)}catch(e){console.warn('mon model',e);return t0(o)}
 const g=new THREE.Group(),b=T.b.clone();g.add(b);const u={float:T.float,tw:T.tw,eyes:[],legs:[]};b.traverse(c=>{if(c.name==='eye')u.eyes.push(c);else if(c.name==='leg')u.legs.push(c);else if(c.name==='tail')u.tail=c;else if(c.name==='rise')u.rise=c});
 if(!u.legs.length)delete u.legs;
 const sc=(o.mon==='spider'?.85:1)*(o.el===2?3:o.el===1?2.4:1.8);g.userData.hpY=1.15*sc*(o.mon==='scorpion'||o.mon==='spider'?.55:1)+.1;
 const smk=new THREE.Sprite(spm(o.mon==='wraith'?0x1a3a5a:0x14061c,.55,0));smk.position.y=.15*sc;smk.scale.set(1.25*sc,.55*sc,1);g.add(smk);
 b.scale.setScalar(sc);if(o.el){const aura=new THREE.Sprite(spm(o.el===2?0xff2040:0xb040ff,.35,1));aura.position.y=.4*sc;aura.scale.setScalar(1.3*sc);g.add(aura)}
 if(o.el===2)b.add(crown());
 g.userData.mon={o,b,...u,sc,ph:Math.random()*6};live.add(g);return g};
const proj=[];const pm=new THREE.SpriteMaterial({map:glowT,color:0x80f0ff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false});
let fr=0;(function loop(){requestAnimationFrame(loop);fr++;const t=performance.now()/1000,T=Date.now(),fp=G.GLfpos&&G.GLfpos();
 for(const m of SPM.values())m.opacity=m.userData.op*(m.blending===THREE.AdditiveBlending?(.7+.43*Math.sin(t*3)):(.82+.27*Math.sin(t*1.7)));
 for(const g of live){if(!g.parent){live.delete(g);continue}const u=g.userData.mon,o=u.o,b=u.b,since=(T-(o.atk||0))/1000;
  if(fp&&since>1){const dd2=Math.hypot(fp.x-g.position.x,fp.z-g.position.z);if(dd2>11||(dd2>6&&(fr+(u.ph*10|0))%3))continue}
  if(fp){const dx=fp.x-g.position.x,dz=fp.z-g.position.z;let dd=Math.atan2(dx,dz)-b.rotation.y;dd=Math.atan2(Math.sin(dd),Math.cos(dd));b.rotation.y+=dd*.1}
  // menacing idle: breathing, sway, flickering eyes
  const br=1+Math.sin(t*2.2+u.ph)*.05;if(since>=.6)b.scale.x=b.scale.z=u.sc;b.scale.y=u.sc*br;if(u.eyes)u.eyes.forEach((e,k)=>e.material.opacity=.6+.4*Math.abs(Math.sin(t*3+k+u.ph))*(Math.random()<.02?0:1));
  if(u.float)b.position.y=.15+Math.sin(t*1.6+u.ph)*.08;if(u.legs)u.legs.forEach((l,k)=>l.rotation.x=Math.sin(t*(since<.6?18:4)+k)*.25);if(u.tail)u.tail.rotation.x=Math.sin(t*1.5)*.15+(since<.5?-.9*Math.sin(since*Math.PI*2):0);
    const lc=(t*.9+u.ph)%5,loom=lc<.9?Math.sin(lc/.9*Math.PI):0;b.position.y=(u.float?b.position.y:0)+loom*.12;b.rotation.x=-loom*.18;
  if(Math.random()<.008)u.tj=t;const tj=t-(u.tj||-9);if(tj<.15)b.rotation.z=Math.sin(tj*80)*.12;else if(u.tw)b.rotation.z=Math.sin(t*1.3+u.ph)*.06;
  if(u.rise){const hid=o.hid===1;const ty=hid?-.65:0;u.rise.position.y+=(ty-u.rise.position.y)*.12;u.rise.visible=u.rise.position.y>-.5}
  // attack: lunge forward + squash
  if(since<.6){const k=Math.sin(since/.6*Math.PI);b.position.z=k*.55;b.rotation.x=k*.25;b.scale.x=b.scale.z=u.sc*(1+k*.08)}else b.position.z*=.8;
  if(o.spit&&T-o.spit<450&&fp){if(!u.pr){u.pr=new THREE.Sprite(pm);u.pr.scale.setScalar(.25);g.parent.add(u.pr)}const k=(T-o.spit)/450;u.pr.visible=true;u.pr.position.lerpVectors(g.position.clone().setY(g.position.y+.7),fp.clone().setY(fp.y+.3),k)}else if(u.pr)u.pr.visible=false}})();
}

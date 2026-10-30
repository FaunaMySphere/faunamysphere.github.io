// v8.2 PREVIEW "more realistic views and details" (not shipped). Visual only: never reads beyond S.zone/S.zones, never writes the save.
// Phones (any tier): light grass tufts, ground detail, sculpted rocks, contact shading, a touch more haze. No new passes, no shadows.
// PC High / Ultra: denser tufts, finer trees, real sun shadows, subtle bloom, daytime light shafts. Low: nothing. ?v82off disables all.
import * as THREE from 'three';
import {ShaderPass} from './vendor/three/addons/postprocessing/ShaderPass.js';
const G=window,QS=new URLSearchParams(location.search);
if(!QS.has('v82off'))(function boot(){if(!G.W6||!G.GL||!G.W80)return setTimeout(boot,120);try{start()}catch(e){console.warn('v82',e)}})();
function start(){
const W6=G.W6,Q=G.GL.Q,ULTRA=!!W6.ULTRA,isPhone=matchMedia('(pointer:coarse)').matches||innerWidth<700;
if(Q==='low')return;
const HI=Q==='high',PCHI=HI&&!isPhone;
const DENS=ULTRA?1.5:PCHI?1:HI?.32:.2;            // grass tuft density per tier (phone High = .32)
const R=W6.R,scene=W6.scene;
G.FS_V82={Q,isPhone,PCHI,DENS,dbg:{}};
// ---------- shared helpers ----------
const fr=x=>x-Math.floor(x),h2=(x,y)=>fr(Math.sin(x*127.1+y*311.7)*43758.5453);
const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,a=h2(i,j),b=h2(i+1,j),c=h2(i,j+1),d=h2(i+1,j+1),su=u*u*(3-2*u),sv=v*v*(3-2*v);return a+(b-a)*su+(c-a)*sv+(a-b-c+d)*su*sv};
const pathF=(x,z,sd)=>Math.abs(vn(x*.16+sd,z*.16-sd)-.5)<.08;  // same soil-path mask as v7.7, so tufts stay off the paths
const V77B={garden:1,forest:1,arctic:1,swamp:1,night:1,beach:1,scorch:1};
const GRASSY={home:1,garden:1,forest:1.25,swamp:.9,night:.85,rock:.55,beach:.3,arctic:.22,scorch:.25,mesa:.25,candy:.5};
const ROCKY={home:.35,garden:1,forest:1,swamp:.8,night:.8,rock:1.6,beach:.7,arctic:1,scorch:1.3,mesa:1.3,candy:.4};
function vcol(geo,fn){const p=geo.attributes.position,n=geo.attributes.normal,a=new Float32Array(p.count*3),c=new THREE.Color();for(let i=0;i<p.count;i++){fn(c,p.getX(i),p.getY(i),p.getZ(i),n?n.getY(i):1,i);a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b}geo.setAttribute('color',new THREE.BufferAttribute(a,3));return geo}
function merge(list){let n=0;list.forEach(g=>{n+=g.attributes.position.count});const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
 list.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;g.dispose()});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeBoundingSphere();return g}
const xf=(g,tx,ty,tz,rx,ry,rz,sx,sy,sz)=>{g=g.index?g.toNonIndexed():g;g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(tx,ty,tz),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(sx,sy,sz)));return g};
// average colour of the ground's top texture, so tufts match every world's own palette (original procedural textures)
function groundColor(){const im=G._groundIM;let c=new THREE.Color(0x6aa83a);try{const m=(Array.isArray(im.material)?im.material:[im.material])[2];c=m.color.clone();const img=m.map&&m.map.image;
 if(img&&img.getContext){const x=img.getContext('2d'),w=img.width,h=img.height,d=x.getImageData(0,0,w,h).data;let r=0,g=0,b=0,k=0;for(let i=0;i<d.length;i+=4*37){r+=d[i];g+=d[i+1];b+=d[i+2];k++}
  const t=new THREE.Color(r/k/255,g/k/255,b/k/255);t.convertSRGBToLinear&&t.convertSRGBToLinear();c.multiply(t)}}catch(e){}return c}
// ---------- wind (with travelling gusts) for tufts and the finer tree leaves ----------
const UT=W6.U&&W6.U.time||{value:0};
function sway(m,amt,hgt,gust){m.onBeforeCompile=s=>{s.uniforms.uT82=UT;s.vertexShader='uniform float uT82;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float w82=clamp(position.y/${hgt.toFixed(3)},0.,1.);w82*=w82;vec4 p82=vec4(transformed,1.);
 #ifdef USE_INSTANCING
 p82=instanceMatrix*p82;
 #endif
 p82=modelMatrix*p82;
 float g82=${gust?`.55+.45*sin(p82.x*.23+p82.z*.17-uT82*1.1)`:`1.`};
 float ph82=p82.x*1.9+p82.z*1.4+uT82*2.1;
 transformed.x+=(sin(ph82)*.6+.55*g82)*${amt.toFixed(3)}*w82;transformed.z+=cos(ph82*.83)*${(amt*.5).toFixed(3)}*w82;`)};m.customProgramCacheKey=()=>'v82s'+amt+hgt+gust;return m}
// ---------- geometry kits (original, procedural) ----------
function tuftGeo(){const blades=[],B=isPhone?5:7;for(let k=0;k<B;k++){const a=k/B*6.283+h2(k,3)*.6,h=.17+h2(k,9)*.16,w=.018+h2(k,5)*.008,lean=.25+h2(k,7)*.35,r=.025+h2(k,1)*.03;
  // a blade: 2 segments, bends outward
  const g=new THREE.BufferGeometry(),ox=Math.cos(a)*r,oz=Math.sin(a)*r,dx=Math.cos(a),dz=Math.sin(a),px=-dz*w,pz=dx*w,b1=lean*.35*h,b2=lean*h;
  const v=[ox-px,0,oz-pz, ox+px,0,oz+pz, ox+dx*b1-px*.7,h*.55,oz+dz*b1-pz*.7, ox+dx*b1+px*.7,h*.55,oz+dz*b1+pz*.7, ox+dx*b2,h,oz+dz*b2];
  const P=[0,1,2, 1,3,2, 2,3,4].flatMap(i=>[v[i*3],v[i*3+1],v[i*3+2]]);g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  const N=new Float32Array(P.length);for(let i=0;i<N.length;i+=3){N[i+1]=1}g.setAttribute('normal',new THREE.BufferAttribute(N,3)); // up-facing normals: lit like the ground, no dark backsides
  vcol(g,(c,x,y)=>{const t=y/h;c.setRGB(.42+.7*t,.5+.66*t,.38+.5*t)});blades.push(g)}return merge(blades)}
function pebbleGeo(){const L=[];for(let k=0;k<3;k++){const g=xf(new THREE.IcosahedronGeometry(.045+k*.012,0),(k-1)*.07,.012,(k%2)*.05,k,k*2,0,1.2,.5,1);g.computeVertexNormals();vcol(g,c=>c.setRGB(.55+k*.06,.53+k*.05,.48+k*.04));L.push(g)}
 const t=xf(new THREE.CylinderGeometry(.006,.008,.22,4),.03,.01,-.06,Math.PI/2,0,.7,1,1,1);t.computeVertexNormals();vcol(t,c=>c.setRGB(.36,.25,.15));L.push(t);return merge(L)}
function flowerGeo(){const L=[];const cols=[[1,.96,.86],[1,.85,.3],[.78,.62,1],[1,.6,.7]];for(let k=0;k<4;k++){const a=k*1.7,r=.04+k*.025,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.1+k*.02;
  const s=xf(new THREE.CylinderGeometry(.004,.005,h,3),x,h/2,z,0,0,0,1,1,1);s.computeVertexNormals();vcol(s,c=>c.setRGB(.3,.55,.2));L.push(s);
  const f=xf(new THREE.IcosahedronGeometry(.018,0),x,h,z,0,0,0,1,.6,1);f.computeVertexNormals();const C=cols[(k+Math.floor(a))%4];vcol(f,c=>c.setRGB(C[0],C[1],C[2]));L.push(f)}return merge(L)}
// sculpted rock: noise-displaced, slightly squashed, mossy/snowy/sandy cap by normal
function rockGeo(seed,cap){let g=new THREE.IcosahedronGeometry(1,isPhone?1:ULTRA?3:2);g=g.toNonIndexed();const p=g.attributes.position,v=new THREE.Vector3(),KK=new Float32Array(p.count);
 for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=vn(v.x*1.6+seed,v.z*1.6-seed+v.y)*.5+vn(v.x*3.7-seed,v.y*3.7+seed)*.22+(PCHI?vn(v.x*8.3+seed,v.z*8.3+v.y*2.)*.07:0);let k=.78+n*.5;KK[i]=n;v.multiplyScalar(k);v.y=v.y*.62;if(v.y<-.2)v.y=-.2;p.setXYZ(i,v.x,v.y,v.z)}
 g.computeVertexNormals();const base=new THREE.Color().setHSL(.08+h2(seed,1)*.05,.08+h2(seed,2)*.06,.42+h2(seed,3)*.1);
 vcol(g,(c,x,y,z,ny,i)=>{c.copy(base).multiplyScalar(.82+vn(x*5+seed,z*5)*.3+(y+.2)*.25);if(PCHI){c.multiplyScalar((.72+.28*Math.min(1,Math.max(0,(KK[i]-.12)*2.2)))*(.93+.07*Math.sin(y*26+vn(x*2+seed,z*2)*4)));if(h2(i*.37+seed,y*9)>.93)c.lerp(cap,.35)}if(cap&&ny>.6)c.lerp(cap,Math.min(1,(ny-.6)*3.2))});return g}
function rockCluster(seed,cap){const a=xf(rockGeo(seed,cap),0,.12,0,0,seed,0,.34,.34,.3),b=xf(rockGeo(seed+3.1,cap),.3,.06,.1,0,seed*2,.2,.17,.17,.16),c=xf(rockGeo(seed+7.7,cap),-.12,.04,.26,.3,seed*3,0,.11,.11,.1);return merge([a,b,c])}
// soft contact shadow texture (radial)
let blobTex=null;function blobT(){if(blobTex)return blobTex;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(0,0,0,0.75)');g.addColorStop(.55,'rgba(0,0,0,0.32)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);blobTex=new THREE.CanvasTexture(c);return blobTex}
const blobM=new THREE.MeshBasicMaterial({map:blobT(),transparent:true,depthWrite:false,opacity:.5,color:0x1a1408,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,fog:true});
const blobG=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);
// ---------- per-island dressing ----------
const KITS={};function kit(k,f){return KITS[k]||(KITS[k]=f())}
const tuftM=sway(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),.05,.3,true);
const detM=new THREE.MeshLambertMaterial({vertexColors:true,flatShading:true});
const flowM=sway(new THREE.MeshLambertMaterial({vertexColors:true}),.025,.14,false);
const rockM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.94,flatShading:true});
function dress(isl,zid){const z=typeof Z==='function'?Z(zid):null;if(!z||z.biome==='dungeon')return;const s=G.S&&S.zones&&S.zones[zid];const im=G._groundIM;if(!im||!isl.children.includes(im))return;
 const tiles=im.userData.tiles||[];if(!tiles.length)return;const n=W6.N0,C0=W6.C0,HG=G.HGT||(()=>0);
 let sd=0;for(const ch of zid)sd=(sd*31+ch.charCodeAt(0))%997;sd=sd/97;const usePath=zid!=='home'&&V77B[z.biome]&&!QS.has('v77off');
 const occ=new Set();((s&&s.objs)||[]).forEach(o=>{for(let a=-1;a<2;a++)for(let b=-1;b<2;b++)occ.add((o.i+a)+','+(o.j+b))});
 const free=tiles.filter(([i,j])=>!occ.has(i+','+j));if(!free.length)return;
 let rs=Math.floor(sd*1e4)+11;const rnd=()=>(rs=(rs*16807)%2147483647)/2147483647;
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3(),col=new THREE.Color();
 const gc=groundColor(),bio=z.biome,grassy=GRASSY[bio]||.4,rocky=ROCKY[bio]||.8;
 const cap=bio==='arctic'?new THREE.Color(.95,.97,1):bio==='beach'||bio==='scorch'||bio==='mesa'?new THREE.Color(.82,.68,.46):bio==='candy'?new THREE.Color(1,.8,.9):new THREE.Color(.33,.5,.18);
 const blobs=[];const group=new THREE.Group();group.userData.v82=1;
 const spot=(edgeMin,avoidPath)=>{for(let t=0;t<8;t++){const[i,j]=free[Math.floor(rnd()*free.length)];const x=i-C0+(rnd()-.5)*.92,zz=j-C0+(rnd()-.5)*.92;const e=Math.hypot(x,zz)/(n/2);if(e<edgeMin)continue;if(avoidPath&&usePath&&pathF(x,zz,sd))continue;return[x,zz,e]}return null};
 // 1. grass tufts
 const nT=Math.round(free.length*9*DENS*grassy);
 if(nT>0){const g=kit('tuft',tuftGeo),T=new THREE.InstancedMesh(g,tuftM,nT);let u=0;const tint=gc.clone().multiplyScalar(1.05);
  for(let k=0;k<nT*2&&u<nT;k++){const sp=spot(0,true);if(!sp)continue;const[x,zz]=sp;const s2=.75+rnd()*.7;q.setFromEuler(new THREE.Euler((rnd()-.5)*.15,rnd()*6.28,(rnd()-.5)*.15));sc.set(s2,s2*(.8+rnd()*.5),s2);p.set(x,HG(x,zz)-.005,zz);m4.compose(p,q,sc);T.setMatrixAt(u,m4);
   col.copy(tint).multiplyScalar(.85+rnd()*.3);col.offsetHSL((rnd()-.5)*.03,0,0);T.setColorAt(u,col);u++}
  T.count=u;T.receiveShadow=PCHI;T.frustumCulled=false;T.userData.v82='tuft';group.add(T)}
 // 2. ground detail: pebbles + twigs, little flower clumps on grassy worlds
 const nP=Math.round(free.length*(isPhone?.35:.7)*Math.min(1.4,rocky));
 if(nP>0){const P=new THREE.InstancedMesh(kit('peb',pebbleGeo),detM,nP);let u=0;for(let k=0;k<nP*2&&u<nP;k++){const sp=spot(0,false);if(!sp)continue;const[x,zz]=sp;const s2=.7+rnd()*.8;q.setFromEuler(new THREE.Euler(0,rnd()*6.28,0));sc.set(s2,s2,s2);p.set(x,HG(x,zz),zz);m4.compose(p,q,sc);P.setMatrixAt(u,m4);col.copy(gc).lerp(new THREE.Color(.7,.68,.62),.65).multiplyScalar(.8+rnd()*.35);P.setColorAt(u,col);u++}
  P.count=u;P.receiveShadow=PCHI;P.userData.v82='peb';group.add(P)}
 const nF=grassy>=.8&&bio!=='night'?Math.round(free.length*(isPhone?.12:.3)):0;
 if(nF>0){const F=new THREE.InstancedMesh(kit('flw',flowerGeo),flowM,nF);let u=0;for(let k=0;k<nF*2&&u<nF;k++){const sp=spot(0,true);if(!sp)continue;const[x,zz]=sp;const s2=.8+rnd()*.6;q.setFromEuler(new THREE.Euler(0,rnd()*6.28,0));sc.set(s2,s2,s2);p.set(x,HG(x,zz),zz);m4.compose(p,q,sc);F.setMatrixAt(u,m4);u++}F.count=u;F.userData.v82='flw';group.add(F)}
 // 3. sculpted rock clusters, mostly toward the rim, each with a soft contact shadow
 const nR=Math.round(free.length/(isPhone?55:34)*rocky*(ULTRA?1.3:1));
 if(nR>0){const vars=[0,1,2].map(v=>kit('rock'+bio+v,()=>rockCluster(sd*3+v*5.3,cap)));const per=Math.ceil(nR/3);
  vars.forEach((g,v)=>{const Rm=new THREE.InstancedMesh(g,rockM,per);let u=0;for(let k=0;k<per*6&&u<per;k++){const sp=spot(.42,true);if(!sp)continue;const[x,zz]=sp;const s2=.8+rnd()*1.1;q.setFromEuler(new THREE.Euler(0,rnd()*6.28,0));sc.set(s2,s2*(.85+rnd()*.3),s2);p.set(x,HG(x,zz)-.02,zz);m4.compose(p,q,sc);Rm.setMatrixAt(u,m4);u++;blobs.push([x,HG(x,zz),zz,.95*s2])}
   Rm.count=u;Rm.castShadow=PCHI;Rm.receiveShadow=PCHI;Rm.userData.v82='rock';group.add(Rm)})}
 // 4. contact shading under v7.7 props (hay, stones, fences...) already on the island
 isl.children.forEach(o=>{if(!o.isInstancedMesh||!o.userData.v77||o.userData.v77==='wheat'||o.userData.v77==='sun'||o.userData.v77==='leaf'||o.userData.v77==='snow')return;const mm=new THREE.Matrix4(),pp=new THREE.Vector3(),qq=new THREE.Quaternion(),ss=new THREE.Vector3();
  for(let k=0;k<o.count;k++){o.getMatrixAt(k,mm);mm.decompose(pp,qq,ss);blobs.push([pp.x,pp.y,pp.z,(o.userData.v77==='fence'?.9:.6)*ss.x])}});
 if(blobs.length){const Bm=new THREE.InstancedMesh(blobG,blobM,blobs.length);blobs.forEach(([x,y,zz,s2],k)=>{q.identity();sc.set(s2,1,s2);p.set(x,y+.012,zz);m4.compose(p,q,sc);Bm.setMatrixAt(k,m4)});Bm.renderOrder=1;Bm.userData.v82='blob';group.add(Bm)}
 isl.add(group);try{G.FSrestoreRegrab&&G.FSrestoreRegrab()}catch(_){}G.FS_V82.last={zone:zid,tufts:nT,pebbles:nP,flowers:nF,rocks:nR,blobs:blobs.length};
}
// ---------- finer trees (PC High/Ultra): extra leaf clusters, two branches, tapered trunk with root flare, contact shadow ----------
let leafKit=null,brKit=null,trunkGeo=null;
function treeKits(){if(leafKit)return;const L=[];const pts=[[.26,.86,.12,.15],[-.24,.84,.16,.14],[.1,.62,.27,.15],[-.12,.6,-.27,.14],[.28,.62,-.14,.13],[-.3,.66,.02,.13],[.04,1.08,-.1,.13],[-.1,1.02,.16,.12],[.16,.98,.16,.11],[0,.74,0,.3]];
 pts.forEach(([x,y,z,r],k)=>{const g=xf(new THREE.IcosahedronGeometry(1,1),x,y,z,k,k*1.3,0,r,r*.86,r);g.computeVertexNormals();vcol(g,(c,X,Y,Z,ny)=>{const s=k===9?.72:.86+((k*7)%5)*.05,ao=.66+.34*(ny*.5+.5);c.setRGB((s+ny*.08)*ao,(s+ny*.12)*ao,(s+ny*.06)*ao)});L.push(g)});leafKit=merge(L);
 const B=[];[[.6,.52,0,.9],[-.75,.48,1.9,.8]].forEach(([rz,y,ry,len])=>{const g=xf(new THREE.CylinderGeometry(.012,.022,.3*len,5),0,0,0,0,0,0,1,1,1);g.translate(0,.15*len,0);g.applyMatrix4(new THREE.Matrix4().makeRotationZ(rz));g.applyMatrix4(new THREE.Matrix4().makeRotationY(ry));g.translate(0,y,0);g.computeVertexNormals();vcol(g,c=>c.setRGB(1,1,1));B.push(g)});brKit=merge(B);
 trunkGeo=new THREE.CylinderGeometry(.62,1,1,9,3);const p=trunkGeo.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);if(y<-.3){const f=1+(-.3-y)*2.2;p.setX(i,p.getX(i)*f);p.setZ(i,p.getZ(i)*f)}p.setX(i,p.getX(i)+Math.sin(y*3)*.08)}trunkGeo.computeVertexNormals()}
function isTree(g){const c=g.children;if(!g.isGroup||c.length<5||c.length>8||!c[0].isMesh||!c[0].geometry||c[0].geometry.type!=='CylinderGeometry')return false;if(Math.abs(c[0].scale.x-.07)>.001||Math.abs(c[0].scale.y-.55)>.001)return false;return c.slice(1).every(m=>m.isMesh&&m.geometry&&m.geometry.type==='SphereGeometry')}
const leafMats=new Map();
function finer(g){treeKits();const trunk=g.children[0],lm=g.children[1].material;trunk.geometry=trunkGeo;
 const wp=g.getWorldPosition(new THREE.Vector3()),bk=Math.floor(h2(Math.round(wp.x*3),Math.round(wp.z*3))*4),key=lm.uuid+bk;
 let m=leafMats.get(key);if(!m){const lc=lm.color.clone();lc.offsetHSL([0,.018,-.015,.008][bk],[0,.04,-.03,0][bk],[0,.03,-.035,.015][bk]);m=sway(new THREE.MeshStandardMaterial({color:lc,roughness:.85,vertexColors:true}),.035,1.2,true);leafMats.set(key,m)}
 const leaves=new THREE.Mesh(leafKit,m);leaves.castShadow=true;leaves.receiveShadow=true;g.add(leaves);
 const br=new THREE.Mesh(brKit,trunk.material);br.castShadow=true;g.add(br);
 const b=new THREE.Mesh(blobG,blobM);b.scale.set(.95,1,.95);b.position.y=.012;b.renderOrder=1;g.add(b);g.userData.v82=1}
function treeScan(){if(!PCHI)return;try{G.W80.objMap.forEach(e=>{const g=e&&e.g;if(!g||g.userData.v82)return;if(isTree(g))finer(g);else if(g.children){const t=g.children.find(c=>c.isGroup&&!c.userData.v82&&isTree(c));if(t)finer(t)}})}catch(e){console.warn('v82 trees',e)}}
// ---------- haze, shadows, bloom, light shafts ----------
let fogRef=null;function haze(){if(QS.has('v82nohaze'))return;const f=scene.fog;if(!f||f===fogRef||!f.isFog)return;fogRef=f;const zb=typeof Z==='function'&&G.S?Z(S.zone).biome:'';if(zb==='dungeon')return;
 f.near*=PCHI?.72:.85;f.far*=PCHI?.8:.9;}
if(PCHI&&!QS.has('v82noshadow')&&!R.shadowMap.enabled){R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;if(W6.sun&&W6.sun.shadow){W6.sun.castShadow=true;if('intensity' in W6.sun.shadow)W6.sun.shadow.intensity=.62}
 scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{m.needsUpdate=true})})}
const SHAFT={uniforms:{tDiffuse:{value:null},uSun:{value:new THREE.Vector2(.5,1.2)},uAmt:{value:0},uCol:{value:new THREE.Color(1,.95,.82)}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 uSun;uniform float uAmt;uniform vec3 uCol;varying vec2 vUv;
 void main(){vec4 c=texture2D(tDiffuse,vUv);if(uAmt<.001){gl_FragColor=c;return;}
  vec2 d=(vUv-uSun)*(.9/20.);vec2 p=vUv;float acc=0.,w=1.;
  for(int i=0;i<20;i++){p-=d;vec3 s=texture2D(tDiffuse,clamp(p,.001,.999)).rgb;float l=dot(s,vec3(.3,.55,.15));acc+=smoothstep(.8,.98,l)*w;w*=.93;}
  float fall=1.-smoothstep(.0,1.25,distance(vUv,uSun));c.rgb+=uCol*acc*(1./20.)*uAmt*fall;gl_FragColor=c;}`};
let shaft=null;G.FS_V82.dbg.shaftRef=()=>shaft;G.FS_V82.dbg.fog=()=>fogRef;
function post(){const C=W6.composer;if(!C||!PCHI||post.done)return;post.done=1;try{
 const bl=C.passes.find(p=>p.constructor&&/Bloom/.test(p.constructor.name)||('threshold' in p&&'strength' in p&&'radius' in p));if(bl&&!QS.has('v82nobloom')){bl.threshold=.97;bl.radius=.4}
 const oi=C.passes.findIndex(p=>p.constructor&&/OutputPass/.test(p.constructor.name));shaft=new ShaderPass(SHAFT);C.insertPass(shaft,oi>=0?oi+1:C.passes.length-1)}catch(e){console.warn('v82 post',e)}}
const sv=new THREE.Vector3();
function shafts(){if(!shaft)return;const cam=W6.camera,su=W6.sun;if(!cam||!su)return;const zb=typeof Z==='function'&&G.S?Z(S.zone).biome:'';
 const night=G.W81&&G.W81.su&&G.W81.su.uNight?G.W81.su.uNight.value:0;const dir=su.position.clone().sub(su.target?su.target.position:new THREE.Vector3()).normalize();
 sv.copy(cam.position).addScaledVector(dir,120).project(cam);let rr=1;try{if(G.FSrestore){const q=G.FSrestore();rr=Math.max(0,Math.min(1,(q.r-.5)*2))}}catch(e){}const amt=(zb==='dungeon'||zb==='arctic'||zb==='night')?0:(sv.z<1?.55:0)*(1-night)*rr;
 shaft.uniforms.uSun.value.set(sv.x*.5+.5,sv.y*.5+.5);shaft.uniforms.uAmt.value+=(amt-shaft.uniforms.uAmt.value)*.05}
// ---------- water reflections of the island + richer sky (PC High / Ultra only) ----------
let cubeRT=null,cubeCam=null,envA={value:0},capT=0,capZone=null;const waterSet=new Set();
function waterScan(){if(!PCHI||QS.has('v82nowater'))return;const isl=W6.island;if(!isl)return;let fresh=0;
 isl.traverse(o=>{const m=o.material;if(!m||!m.isShaderMaterial||!m.uniforms||!m.uniforms.uDeep||!m.uniforms.uSunD||m.userData.v82w)return;
  const A='vec3 sky=mix(uHor,uTop,clamp(Rf.y*1.4,0.,1.));';if(!m.fragmentShader.includes(A))return;m.userData.v82w=1;
  if(!cubeRT){cubeRT=new THREE.WebGLCubeRenderTarget(ULTRA?256:128,{type:THREE.HalfFloatType});cubeCam=new THREE.CubeCamera(.05,80,cubeRT)}
  m.uniforms.uEnv82={value:cubeRT.texture};m.uniforms.uEnvA82=envA;
  m.fragmentShader='uniform samplerCube uEnv82;uniform float uEnvA82;\n'+m.fragmentShader.replace(A,A+'vec3 e82=textureCube(uEnv82,vec3(-Rf.x,max(Rf.y,.02),Rf.z)).rgb;sky=mix(sky,e82*1.08,.7*uEnvA82);col=col;');
  m.needsUpdate=true;waterSet.add(o);fresh=1});
 if(fresh||capZone!==W6.zone){capZone=W6.zone;capT=performance.now()+1500}
 if(capT&&performance.now()>capT&&cubeCam){capT=0;try{const ws=[];waterSet.forEach(o=>{if(!o.parent||!isl.getObjectById(o.id)){waterSet.delete(o);return}ws.push(o)});if(!ws.length)return;
  const c=new THREE.Vector3();ws[0].getWorldPosition(c);cubeCam.position.set(c.x,c.y+.12,c.z);ws.forEach(o=>o.visible=false);
  const ac=R.autoClear;R.autoClear=true;cubeCam.update(R,scene);R.autoClear=ac;ws.forEach(o=>o.visible=true);envA.value=1}catch(e){console.warn('v82 water',e)}}}
let skyDone=0;function skyUp(){if(!PCHI||skyDone||QS.has('v82nosky'))return;const m=W6.sky&&W6.sky.material;if(!m||!m.fragmentShader||!m.fragmentShader.includes('uCloud'))return;skyDone=1;
 const T='gl_FragColor=vec4(c,1.);}';const i=m.fragmentShader.lastIndexOf(T);if(i<0)return;
 m.fragmentShader=m.fragmentShader.slice(0,i)+`{float hh=max(h,0.),dy=1.-uNight;
  c=mix(c,c*vec3(.9,.95,1.07),smoothstep(.2,.95,hh)*.45*dy);
  c+=mix(uHor,vec3(1.),.45)*exp(-hh*10.)*.07*dy;
  c+=uSunC*pow(s,4.)*.09*dy;
  vec2 cq=vD.xz/(hh+.2)*vec2(.55,2.6)+vec2(uTime*.005,0.);float ci=n2(cq)*n2(cq*2.07+3.1);
  c+=vec3(1.,.99,.97)*smoothstep(.3,.6,ci)*smoothstep(.08,.35,hh)*smoothstep(.95,.5,hh)*.1*max(uCloud,.4)*dy;}
 `+m.fragmentShader.slice(i);m.needsUpdate=true}
// ---------- watcher ----------
let lastIsl=null;(function tick(){try{const isl=W6.island;if(isl&&isl!==lastIsl&&W6.zone&&isl.children.length>2&&G._groundIM&&isl.children.includes(G._groundIM)){lastIsl=isl;setTimeout(()=>{try{if(W6.island===isl)dress(isl,W6.zone)}catch(e){console.warn('v82 dress',e)}},60)}
 haze();post();shafts();skyUp();if(((performance.now()/500)|0)!==tick.k){tick.k=(performance.now()/500)|0;treeScan();waterScan()}}catch(e){console.warn('v82',e);lastIsl=W6.island}requestAnimationFrame(tick)})();
}

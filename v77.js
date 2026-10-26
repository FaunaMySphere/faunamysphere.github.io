// v7.7 "closer to the original" (preview): close 3/4 zone camera, varied ground (soil paths, flagstones, grass patches),
// dense original low-poly props, PC-only Ultra offer. Visual only: never reads or writes the save. Disabled with ?v77off.
import * as THREE from 'three';
const G=window,QS=new URLSearchParams(location.search);
if(!QS.has('v77off'))(function boot(){if(!G.W6)return setTimeout(boot,100);start()})();
function start(){
const W6=G.W6,isPhone=matchMedia('(pointer:coarse)').matches||innerWidth<700;
const Q=(G.GL&&G.GL.Q)||W6.QP&&(W6.QP.grass>=6000?'high':W6.QP.grass>=2600?'med':'low');
const CAP=W6.ULTRA?1.4:Q==='high'?1:Q==='med'?.5:.25;   // prop density cap per tier
// ---------- 1. camera: closer, higher 3/4 in zones (home untouched; zoom still scales dist) ----------
let lastZ=null;
G.FS_camHook=(dist,zone,camS,fpos,tgt)=>{if(zone==='home'){if(lastZ!=='home'){lastZ='home'}return dist}
 if(lastZ!==zone){lastZ=zone;camS.pitch=1.0}
 tgt.set(fpos.x,.15+fpos.y,fpos.z);const pt=innerWidth<innerHeight;return dist*(pt?.93:.68)};
// ---------- shared noise (same in JS and GLSL) ----------
const fr=x=>x-Math.floor(x),h2=(x,y)=>fr(Math.sin(x*127.1+y*311.7)*43758.5453);
const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),u=x-i,v=y-j,a=h2(i,j),b=h2(i+1,j),c=h2(i,j+1),d=h2(i+1,j+1),su=u*u*(3-2*u),sv=v*v*(3-2*v);return a+(b-a)*su+(c-a)*sv+(a-b-c+d)*su*sv};
const GLN=`float h2(vec2 p){return fract(sin(p.x*127.1+p.y*311.7)*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=p-i;float a=h2(i),b=h2(i+vec2(1,0)),c=h2(i+vec2(0,1)),d=h2(i+vec2(1,1));vec2 s=f*f*(3.-2.*f);return a+(b-a)*s.x+(c-a)*s.y+(a-b-c+d)*s.x*s.y;}`;
// ground mask: 0 grass, path (soil) and stone (flagstones) - zone seed shifts the pattern
const pathF=(x,z,sd)=>Math.abs(vn(x*.16+sd,z*.16-sd)-.5)<.08;
const stoneF=(x,z,sd)=>vn(x*.22-sd*1.7,z*.22+sd)>.70;
const TH={ // per theme: soil, stone, patch colours + prop mix
 garden:{soil:0x5a3d26,stone:0x8a8474,grout:0x4a4236,patch:0x8a9a3a,props:{fence:6,stone:10,hay:4,wheat:10,sun:10,leaf:10}},
 forest:{soil:0x4e3522,stone:0x7c7a68,grout:0x3e3a2e,patch:0x6f7f2e,props:{fence:5,stone:14,hay:2,wheat:4,sun:5,leaf:16}},
 arctic:{soil:0x9fb2bd,stone:0xb9c6cc,grout:0x6f8290,patch:0xeef3f2,props:{fence:5,stone:12,snow:12}},
 swamp:{soil:0x3b2c1c,stone:0x5f6650,grout:0x2c2a1e,patch:0x4c5a28,props:{fence:4,stone:12,leaf:8,wheat:6}},
 night:{soil:0x4e3a2a,stone:0x7a7870,grout:0x3a3630,patch:0x6a7a3a,props:{stone:8,sun:4,leaf:6}},
 beach:{soil:0xb08a58,stone:0x9a9080,grout:0x6a5e4e,patch:0xcfb27a,props:{fence:4,stone:8,wheat:6}},
 scorch:{soil:0x8a4e2a,stone:0x9a6a48,grout:0x5a3420,patch:0xb87a44,props:{stone:12,fence:3}}};
const theme=z=>TH[z&&z.biome]||null;
// ---------- 2. ground shader patch ----------
function patchGround(im,zid,T,sd){const mats=Array.isArray(im.material)?im.material:[im.material];const m=mats[2];if(!m||m.userData.v77)return;m.userData.v77=1;
 const c=k=>new THREE.Color(T[k]);
 m.onBeforeCompile=s=>{Object.assign(s.uniforms,{uSoil:{value:c('soil')},uStone:{value:c('stone')},uGrout:{value:c('grout')},uPatch:{value:c('patch')},uSd:{value:sd}});
  s.vertexShader='varying vec3 vW77;\n'+s.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n{vec4 w=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;\n#endif\nvW77=(modelMatrix*w).xyz;}');
  s.fragmentShader='varying vec3 vW77;uniform vec3 uSoil,uStone,uGrout,uPatch;uniform float uSd;\n'+GLN+'\n'+s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
  {vec2 p=vW77.xz;float tex=dot(diffuseColor.rgb,vec3(.33));
   float gp=smoothstep(.45,.75,vn(p*.5+uSd*3.));diffuseColor.rgb=mix(diffuseColor.rgb,uPatch*(.8+tex*.5),gp*.45);
   float pn=abs(vn(vec2(p.x*.16+uSd,p.y*.16-uSd))-.5);float pm=1.-smoothstep(.07,.095,pn);
   vec3 soil=uSoil*(.75+.5*vn(p*6.))*(.85+.3*tex);diffuseColor.rgb=mix(diffuseColor.rgb,soil,pm);
   float sn=vn(vec2(p.x*.22-uSd*1.7,p.y*.22+uSd));float sm=smoothstep(.68,.72,sn);
   vec2 q=p*2.2;q.x+=floor(q.y)*.5;vec2 f=fract(q);float edge=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
   vec3 st=uStone*(.82+.36*h2(floor(q)))*(.9+.2*vn(p*9.));st=mix(uGrout,st,smoothstep(.03,.08,edge));diffuseColor.rgb=mix(diffuseColor.rgb,st,sm);}`)};
 m.needsUpdate=true}
// thin grass off paths/stones so the ground reads
function clearGrass(isl,sd){isl.children.forEach(o=>{if(!o.isInstancedMesh||!o.geometry||o.geometry.type!=='PlaneGeometry')return;const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3();
 for(let k=0;k<o.count;k++){o.getMatrixAt(k,m);m.decompose(p,q,s);if(pathF(p.x,p.z,sd)||stoneF(p.x,p.z,sd)){s.set(0,0,0);m.compose(p,q,s);o.setMatrixAt(k,m)}}o.instanceMatrix.needsUpdate=true})}
// ---------- 3. props: original low-poly, vertex-coloured, merged per type, instanced ----------
function part(geo,col,tx,ty,tz,rx,ry,rz,sx,sy,sz){geo=geo.index?geo.toNonIndexed():geo;const m=new THREE.Matrix4().compose(new THREE.Vector3(tx||0,ty||0,tz||0),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx||0,ry||0,rz||0)),new THREE.Vector3(sx||1,sy||1,sz||1));geo.applyMatrix4(m);
 const c=new THREE.Color(col),n=geo.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++){const j=1+(Math.sin(i*12.9)*.06);a[i*3]=c.r*j;a[i*3+1]=c.g*j;a[i*3+2]=c.b*j}geo.setAttribute('color',new THREE.BufferAttribute(a,3));return geo}
function merge(parts){let n=0;parts.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),C=new Float32Array(n*3);let o=0;
 parts.forEach(g=>{g.computeVertexNormals&&!g.attributes.normal&&g.computeVertexNormals();P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);C.set(g.attributes.color.array,o*3);o+=g.attributes.position.count;g.dispose()});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('normal',new THREE.BufferAttribute(N,3));g.setAttribute('color',new THREE.BufferAttribute(C,3));g.computeBoundingSphere();return g}
const Bx=(w,h,d)=>new THREE.BoxGeometry(w,h,d),Cy=(a,b,h,s)=>new THREE.CylinderGeometry(a,b,h,s||6),Sp=(r,a,b)=>new THREE.SphereGeometry(r,a||7,b||5),Dd=r=>new THREE.DodecahedronGeometry(r,0),Ic=r=>new THREE.IcosahedronGeometry(r,0);
const MK={
 fence:()=>{const W=0xd9d2bf,V=0x4f7a2c,P=[];[-.42,.42].forEach(x=>P.push(part(Cy(.045,.05,.46,5),W,x,.23,0)));[.16,.33].forEach(y=>P.push(part(Bx(.92,.05,.035),W,0,y,0,0,0,(y-.25)*.15)));
  for(let k=0;k<9;k++){const x=-.4+k*.1;P.push(part(Ic(.035),k%3?V:0x6f9a3a,x,.2+Math.sin(k*1.7)*.12,.03,k,k,0,1.2,.8,.8))}P.push(part(Ic(.06),V,.42,.47,0));return merge(P)},
 stone:()=>{const P=[part(Dd(.2),0x8a8a7e,0,.16,0,.3,.5,0,1,1.35,.85),part(Sp(.15,6,3),0x5f8a32,0,.36,0,0,0,0,1.15,.35,1),part(Ic(.06),0x6f9a3a,.12,.08,.09)];return merge(P)},
 icestone:()=>merge([part(Dd(.2),0xb7cbd6,0,.16,0,.3,.5,0,1,1.35,.85),part(Sp(.15,6,3),0xf4f8fa,0,.36,0,0,0,0,1.15,.35,1)]),
 hay:()=>{const P=[part(Cy(.26,.3,.34,9),0xc9a24a,0,.17,0),part(Sp(.27,9,5),0xd8b45a,0,.34,0,0,0,0,1,.55,1)];for(let k=0;k<6;k++)P.push(part(Bx(.02,.12,.02),0xe6c870,Math.cos(k)*.27,.1,Math.sin(k)*.27,0,0,.5));return merge(P)},
 wheat:()=>{const P=[];for(let k=0;k<7;k++){const a=k*2.4,r=.04+k*.012,x=Math.cos(a)*r,z=Math.sin(a)*r,h=.3+((k*37)%10)*.012;P.push(part(Cy(.006,.008,h,3),0xb89a3a,x,h/2,z),part(Sp(.022,5,3),0xe0bc52,x,h+.03,z,0,0,0,.8,2.2,.8))}return merge(P)},
 sun:()=>{const P=[part(Cy(.012,.016,.55,4),0x4f7a2c,0,.275,0),part(Bx(.12,.01,.05),0x5f8a32,.05,.25,0,0,0,.4)];const fh=new THREE.Group();
  P.push(part(Cy(.06,.06,.025,10),0x5a3a1e,0,.58,.02,Math.PI/2.3,0,0));for(let k=0;k<10;k++){const a=k/10*Math.PI*2;P.push(part(Sp(.035,5,3),0xf2c230,Math.cos(a)*.08,.58+Math.sin(a)*.08*.9,0,0,0,a,1.6,.7,.4))}return merge(P)},
 leaf:()=>{const P=[part(Sp(.24,8,4),0xb8521e,0,0,0,0,0,0,1,.38,1)];const cs=[0xd8732a,0xe0a03a,0x9a3a1a,0xc8601e];for(let k=0;k<10;k++){const a=k*2.1,r=.1+(k%4)*.05;P.push(part(Bx(.07,.01,.05),cs[k%4],Math.cos(a)*r,.05+(k%3)*.02,Math.sin(a)*r,(k%3)*.3,a,(k%2)*.3))}return merge(P)},
 snow:()=>merge([part(Sp(.24,8,4),0xf2f6f8,0,0,0,0,0,0,1,.4,1),part(Sp(.12,6,3),0xe6eef2,.12,.04,.06,0,0,0,1,.5,1)])};
const WIND={wheat:1,sun:1};
function decorate(isl,zid){const z=typeof Z==='function'&&Z(zid),T=theme(z);if(!T)return;const s=typeof zs==='function'&&zs(zid);if(!s)return;let sd=0;for(const ch of zid)sd=(sd*31+ch.charCodeAt(0))%997;sd=sd/97;
 if(G._groundIM&&isl.children.includes(G._groundIM))patchGround(G._groundIM,zid,T,sd);clearGrass(isl,sd);
 const n=W6.N0,C0=W6.C0,occ=new Set();(s.objs||[]).forEach(o=>{for(let a=-1;a<2;a++)for(let b=-1;b<2;b++)occ.add((o.i+a)+','+(o.j+b))});
 const tiles=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(s.tiles[i]&&s.tiles[i][j]&&!occ.has(i+','+j))tiles.push([i,j]);if(!tiles.length)return;
 let rs=Math.floor(sd*1e4)+7;const rnd=()=>(rs=(rs*16807)%2147483647)/2147483647;const area=tiles.length/80;
 const HG=G.HGT||(()=>0),m4=new THREE.Matrix4(),q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3();
 const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.88,flatShading:true}),wmat=W6.windify?W6.windify(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,flatShading:true}),.05,.5):mat;
 for(const[k,base]of Object.entries(T.props)){const kind=k==='stone'&&z.biome==='arctic'?'icestone':k;const cnt=Math.max(0,Math.round(base*3*area*CAP*(k==='wheat'||k==='sun'?1.6:1)));if(!cnt)continue;
  const g=MK[kind](),im=new THREE.InstancedMesh(g,WIND[k]?wmat:mat,cnt);let used=0;
  for(let t=0;t<cnt*6&&used<cnt;t++){const[i,j]=tiles[Math.floor(rnd()*tiles.length)];const x=i-C0+(rnd()-.5)*.8,zz=j-C0+(rnd()-.5)*.8;
   const edge=Math.hypot(x,zz)/(n/2);if((k==='hay'||k==='fence')&&edge<.55)continue;if(pathF(x,zz,sd)&&k!=='leaf')continue;
   const cl=k==='wheat'||k==='sun';const reps=cl?3:1;for(let r=0;r<reps&&used<cnt;r++){const xx=x+(r?(rnd()-.5)*.5:0),z2=zz+(r?(rnd()-.5)*.5:0);
    const yaw=k==='fence'?Math.atan2(xx,z2)+Math.PI/2:k==='sun'?W6.camS.yaw+(rnd()-.5)*.6:rnd()*6.28;q.setFromEuler(new THREE.Euler(0,yaw,0));const s2=(k==='stone'?.7+rnd()*.9:.8+rnd()*.45)*1.45;sc.set(s2,s2,s2);p.set(xx,HG(xx,z2),z2);m4.compose(p,q,sc);im.setMatrixAt(used++,m4)}}
  im.count=used;im.castShadow=!!W6.ULTRA;im.receiveShadow=!!W6.ULTRA;im.userData.v77=kind;isl.add(im)}}
let lastIsl=null;(function tick(){try{const isl=W6.island;if(isl&&isl!==lastIsl&&W6.zone&&W6.zone!=='home'&&isl.children.length>2){lastIsl=isl;decorate(isl,W6.zone)}else if(isl&&W6.zone==='home')lastIsl=isl}catch(e){console.warn('v77',e);lastIsl=W6.island}requestAnimationFrame(tick)})();
// ---------- 5. Ultra offer (desktop only, real GPU, FPS check on High) ----------
if(isPhone)return;
const es=()=>((G.FS&&FS.lang)||document.documentElement.lang||'').startsWith('es')||/lang=es/.test(location.search);
let gpu='';try{const gl=W6.R.getContext(),e=gl.getExtension('WEBGL_debug_renderer_info');gpu=(e?gl.getParameter(e.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER))||''}catch(_){}
const soft=/swiftshader|llvmpipe|software|basic render|mesa offscreen/i.test(gpu);G.FS_gpu=gpu;
if(W6.ULTRA){let low=0;const iv=setInterval(()=>{const f=G.GLfps||60;low=f<30?low+1:0;if(low>=4){localStorage.removeItem('fs_ultra');clearInterval(iv);console.warn('Ultra too slow; back to High next load')}},3000);return}
if(localStorage.getItem('fs_gfx6')==='low'||(soft&&!QS.has('ultraoffer')))return;
let ok=0,n=0;const iv=setInterval(()=>{n++;if((G.GLfps||0)>=55)ok++;if(ok>=3||QS.has('ultraoffer')){clearInterval(iv);offer()}else if(n>10)clearInterval(iv)},2500);
function offer(){const qb=document.getElementById('gfx');if(!qb||document.getElementById('ultra77'))return;const b=document.createElement('button');b.id='ultra77';b.className=qb.className;
 b.innerHTML='<i>✨</i><span>Ultra</span>';b.title=es()?'Gráficos Ultra (solo PC): sombras suaves, oclusión ambiental, más hierba':'Ultra graphics (PC only): soft shadows, ambient occlusion, denser grass';
 b.onclick=()=>{try{G.save&&save()}catch(e){}localStorage.setItem('fs_ultra','1');location.reload()};qb.insertAdjacentElement('afterend',b)}
}

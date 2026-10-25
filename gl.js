// FaunaSphere v4 — WebGL renderer (three.js, vendored). Original procedural art only.
import * as THREE from 'three';
import {EffectComposer} from './vendor/three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from './vendor/three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from './vendor/three/addons/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from './vendor/three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from './vendor/three/addons/postprocessing/OutputPass.js';

const G=window, QS=new URLSearchParams(location.search);
// ---------- quality ----------
const isPhone=matchMedia('(pointer:coarse)').matches||innerWidth<700;
let Q=QS.get('q')||localStorage.getItem('fs_q')||(isPhone?'med':'high');if(!['low','med','high'].includes(Q))Q='med';
const QP={low:{pr:1,shadow:0,grass:900,bloom:0,post:0,tex:128,weather:120},med:{pr:1.5,shadow:1024,grass:2600,bloom:1,post:0,tex:256,weather:220},high:{pr:2,shadow:2048,grass:6000,bloom:1,post:1,tex:512,weather:380}}[Q];

// ---------- renderer ----------
const stage=document.getElementById('stage'),cv=document.getElementById('cv');
const glc=document.createElement('canvas');glc.id='gl';stage.insertBefore(glc,cv);
let R;
try{R=new THREE.WebGLRenderer({canvas:glc,antialias:Q!=='low',powerPreference:'high-performance'});}catch(e){console.warn('WebGL unavailable, staying on 2D',e);glc.remove();throw new Error('no-webgl-fallback-2d')}
document.body.classList.add('webgl');
let PR=Math.min(devicePixelRatio||1,QP.pr);R.setPixelRatio(PR);
R.toneMapping=THREE.NoToneMapping;R.toneMappingExposure=1.0;R.outputColorSpace=THREE.SRGBColorSpace;
if(false){R.shadowMap.enabled=true;R.shadowMap.type=Q==='high'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap}
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,400);
const hemi=new THREE.HemisphereLight(0xcfe9ff,0x5a4630,1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d8,2.6);sun.castShadow=!!QP.shadow;
if(QP.shadow){sun.shadow.mapSize.set(QP.shadow,QP.shadow);sun.shadow.bias=-.0006;sun.shadow.normalBias=.02;sun.shadow.radius=4;const c=sun.shadow.camera;c.left=c.bottom=-12;c.right=c.top=12;c.near=1;c.far=60}
scene.add(sun,sun.target);
const su={sunPosition:{value:new THREE.Vector3(0,1,0)},uTop:{value:new THREE.Color()},uHor:{value:new THREE.Color()},uSunC:{value:new THREE.Color(1,.9,.7)}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(250,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:su,
 vertexShader:`varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform vec3 sunPosition,uTop,uHor,uSunC;varying vec3 vD;void main(){float h=clamp(vD.y,-.3,1.);vec3 c=mix(uHor,uTop,pow(max(h,0.),.6));c=mix(c,uHor*.8,smoothstep(0.,-.3,h));
 float s=max(dot(vD,normalize(sunPosition)),0.);c+=uSunC*(pow(s,600.)*1.2+pow(s,12.)*.25);gl_FragColor=vec4(c,1.);}`}));scene.add(sky);
const pmrem=new THREE.PMREMGenerator(R);
// stars
const starG=new THREE.BufferGeometry(),sp=[];for(let k=0;k<700;k++){const u=Math.random()*6.283,v=Math.random()*.9+.08,r=180;sp.push(Math.cos(u)*Math.cos(v)*r,Math.sin(v)*r,Math.sin(u)*Math.cos(v)*r)}
starG.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));const stars=new THREE.Points(starG,new THREE.PointsMaterial({color:0xffffff,size:1.1,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));scene.add(stars);

// ---------- composer ----------
let composer=null,bloom=null,finalPass=null;
const FinalShader={uniforms:{tDiffuse:{value:null},uV:{value:.32},uDof:{value:QP.post?1:0},uRes:{value:new THREE.Vector2(1,1)},uTime:{value:0},uFade:{value:0},uFadeCol:{value:new THREE.Color(.85,.97,1)}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uV,uDof,uTime,uFade;uniform vec2 uRes;uniform vec3 uFadeCol;varying vec2 vUv;
 float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 void main(){vec4 c=texture2D(tDiffuse,vUv);
  if(uDof>.5){float b=smoothstep(.28,.5,abs(vUv.y-.52))*2.2;if(b>.01){vec2 px=b/uRes;vec4 s=c;
   s+=texture2D(tDiffuse,vUv+vec2(px.x,0.));s+=texture2D(tDiffuse,vUv-vec2(px.x,0.));s+=texture2D(tDiffuse,vUv+vec2(0.,px.y));s+=texture2D(tDiffuse,vUv-vec2(0.,px.y));
   s+=texture2D(tDiffuse,vUv+px*1.5);s+=texture2D(tDiffuse,vUv-px*1.5);s+=texture2D(tDiffuse,vUv+vec2(px.x,-px.y)*1.5);s+=texture2D(tDiffuse,vUv+vec2(-px.x,px.y)*1.5);c=s/9.;}}
  float d=distance(vUv,vec2(.5));c.rgb*=1.-uV*smoothstep(.35,.85,d);
  c.rgb+=(h(vUv*uRes+uTime)-.5)*.018;
  c.rgb=mix(c.rgb,uFadeCol,uFade);gl_FragColor=c;}`};
if(QP.bloom){composer=new EffectComposer(R);composer.addPass(new RenderPass(scene,camera));
 bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.55,.45,1.0);composer.addPass(bloom);
 composer.addPass(new OutputPass());finalPass=new ShaderPass(FinalShader);composer.addPass(finalPass)}

// ---------- procedural textures ----------
const TS=QP.tex;
function hsh(x,y,s){let h=(x*374761393+y*668265263+s*1442695041)|0;h=(h^(h>>>13))*1274126177|0;return((h^(h>>>16))>>>0)/4294967296}
function vnoise(x,y,s,per){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const w=(a,b)=>hsh(((a%per)+per)%per,((b%per)+per)%per,s);
 return(w(xi,yi)*(1-u)+w(xi+1,yi)*u)*(1-v)+(w(xi,yi+1)*(1-u)+w(xi+1,yi+1)*u)*v}
function fbm(x,y,s,o=5,f=4){let a=0,amp=.5,fr=f;for(let k=0;k<o;k++){a+=vnoise(x*fr,y*fr,s+k,fr)*amp;amp*=.5;fr*=2}return a}
const hex=c=>{const v=new THREE.Color(c);return[v.r*255,v.g*255,v.b*255]};
const texCache={};
function genTex(kind,base){const key=kind+base;if(texCache[key])return texCache[key];const N=TS,H=new Float32Array(N*N),cvs=document.createElement('canvas');cvs.width=cvs.height=N;const ctx=cvs.getContext('2d'),img=ctx.createImageData(N,N),b=hex(base);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N,v=y/N;let h=fbm(u,v,7),t=0;
  if(kind==='grass'){t=fbm(u,v,3,4,16);h=.4*h+.6*t;const bl=vnoise(u*64,v*16,9,64);h+=bl*.25}
  else if(kind==='rock'){const r=fbm(u,v,11,6,3);h=Math.abs(r-.5)*2;h=1-Math.pow(h,.6)*.8+fbm(u,v,4,3,24)*.25}
  else if(kind==='snow'){h=.75+fbm(u,v,5,4,6)*.25+(hsh(x,y,3)>.995?.4:0)}
  else if(kind==='mud'){h=fbm(u,v,8,5,5);h=h>.55?.9:h*.7}
  else if(kind==='sand'){h=.6+.3*Math.sin((u*10+fbm(u,v,2,3,3)*4)*6.283)*.5+fbm(u,v,6,3,30)*.2}
  else if(kind==='stone'){const gx=(u*4)%1,gy=((v*4)+(Math.floor(u*4)%2)*.5)%1;const e=Math.min(gx,1-gx,gy,1-gy);h=(e<.04?.15:.75)+fbm(u,v,12,4,12)*.3}
  else if(kind==='wood'){h=.55+.35*Math.sin(v*70+fbm(u,v,3,3,4)*9)*.5+fbm(u,v,7,3,24)*.2}
  else if(kind==='dirt'){h=fbm(u,v,13,5,6);const st=Math.sin(v*40+fbm(u,v,2,2,4)*6)*.5+.5;h=h*.7+st*.2+(hsh(x,y,1)>.985?.5:0)}
  H[y*N+x]=h;const k=.62+h*.45,i=(y*N+x)*4;img.data[i]=Math.min(255,b[0]*k);img.data[i+1]=Math.min(255,b[1]*k);img.data[i+2]=Math.min(255,b[2]*k);img.data[i+3]=255}
 ctx.putImageData(img,0,0);
 if(kind==='grass'){for(let q=0;q<N*3;q++){const x=hsh(q,1,5)*N,y=hsh(q,2,5)*N;ctx.strokeStyle=`rgba(${b[0]*1.3|0},${b[1]*1.35|0},${b[2]*1.1|0},.35)`;ctx.lineWidth=N/256;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(hsh(q,3,5)-.5)*N/40,y-N/40);ctx.stroke()}}
 const map=new THREE.CanvasTexture(cvs);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;
 const nc=document.createElement('canvas');nc.width=nc.height=N;const nx=nc.getContext('2d'),ni=nx.createImageData(N,N),st=kind==='stone'||kind==='rock'?4:2.2;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const g=(a,b)=>H[((b+N)%N)*N+((a+N)%N)];const dx=(g(x+1,y)-g(x-1,y))*st,dy=(g(x,y+1)-g(x,y-1))*st,l=Math.hypot(dx,dy,1),i=(y*N+x)*4;
  ni.data[i]=(-dx/l*.5+.5)*255;ni.data[i+1]=(-dy/l*.5+.5)*255;ni.data[i+2]=(1/l*.5+.5)*255;ni.data[i+3]=255}
 nx.putImageData(ni,0,0);const normalMap=new THREE.CanvasTexture(nc);normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;
 return texCache[key]={map,normalMap}}
const BTOP={beach:'sand',mesa:'sand',candy:'snow',sea:'sand',night:'grass',home:'grass',garden:'grass',forest:'grass',rock:'rock',arctic:'snow',scorch:'sand',swamp:'mud',dungeon:'stone'};

// ---------- materials ----------
const TFLAT=(c,o)=>{const m=new THREE.MeshStandardMaterial(o);m.userData.flat=c;return m};const M={};const mat=(k,o)=>M[k]||(M[k]=new THREE.MeshStandardMaterial(o));
const std=(color,o={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...o});
const glowM=(color,i=2.5)=>new THREE.MeshStandardMaterial({color:0x111111,emissive:color,emissiveIntensity:i,roughness:.4});
const shadowify=o=>{o.traverse(m=>{if(m.isMesh){m.castShadow=!!QP.shadow;m.receiveShadow=!!QP.shadow}});return o};

// ---------- wind shader injection ----------
const U={time:{value:0},wind:{value:1}};
function windify(m,amt=.12,hgt=.35){m.onBeforeCompile=s=>{s.uniforms.uTime=U.time;s.vertexShader='uniform float uTime;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 float wh=clamp(position.y/${hgt.toFixed(2)},0.,1.);vec4 wp=vec4(transformed,1.);
 #ifdef USE_INSTANCING
 wp=instanceMatrix*wp;
 #endif
 float ph=wp.x*1.7+wp.z*1.3+uTime*1.8;transformed.x+=sin(ph)*${amt.toFixed(3)}*wh*wh;transformed.z+=cos(ph*.8)*${(amt*.6).toFixed(3)}*wh*wh;`)};return m}

// ---------- island ----------
let island=new THREE.Group();scene.add(island);let builtZone=null,N0=0,C0=0;
const W2=(i,j)=>new THREE.Vector3(i-C0,0,j-C0);
function buildIsland(zid){scene.remove(island);island.traverse(o=>{if(o.geometry)o.geometry.dispose()});island=new THREE.Group();scene.add(island);
 const z=Z(zid),s=zs(zid),pal=(window.ZPAL&&ZPAL[zid])||BIOMES[z.biome],n=z.n;N0=n;C0=(n-1)/2;const tiles=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(s.tiles[i][j])tiles.push([i,j]);
 const top=genTex(BTOP[z.biome],pal[0]),side=genTex(z.biome==='arctic'?'rock':'dirt',pal[1]);
 const topM=TFLAT(pal[0],{color:BTOP[z.biome]==='grass'?0xeef8dc:0xffffff,map:top.map,normalMap:top.normalMap,roughness:z.biome==='arctic'?.55:.92,normalScale:new THREE.Vector2(.8,.8)});
 const sideM=TFLAT(pal[1],{map:side.map,normalMap:side.normalMap,roughness:.95});
 const g=new THREE.BoxGeometry(1,.5,1);g.translate(0,-.25,0);
 const im=new THREE.InstancedMesh(g,[sideM,sideM,topM,sideM,sideM,sideM],tiles.length),m4=new THREE.Matrix4(),col=new THREE.Color();
 const TSET=new Set(tiles.map(t=>t[0]+','+t[1]));tiles.forEach(([i,j],k)=>{const h=(hsh(i,j,4)-.5)*.04;m4.makeTranslation(i-C0,h,j-C0);im.setMatrixAt(k,m4);let nb=0;for(let a=-1;a<2;a++)for(let b=-1;b<2;b++)if((a||b)&&TSET.has((i+a)+','+(j+b)))nb++;col.setHSL(0,0,(.86+hsh(i,j,9)*.12)*(.86+.14*nb/8));im.setColorAt(k,col)});
 im.receiveShadow=!!QP.shadow;im.castShadow=!!QP.shadow;im.userData.ground=1;island.add(im);
 // grass lip on top edges for grassy biomes
 // underside: rocky stalactites
 const rockT=genTex('rock',pal[2]);const rM=TFLAT(pal[2],{map:rockT.map,normalMap:rockT.normalMap,roughness:1,flatShading:true});
 const cg=new THREE.ConeGeometry(.72,1,7,3);cg.rotateX(Math.PI);cg.translate(0,-.5,0);
 const pa=cg.attributes.position;for(let k=0;k<pa.count;k++){const y=pa.getY(k);if(y<-.02&&y>-.98){pa.setX(k,pa.getX(k)*(1+(hsh(k,1,2)-.5)*.35));pa.setZ(k,pa.getZ(k)*(1+(hsh(k,2,2)-.5)*.35))}}cg.computeVertexNormals();
 const cm=new THREE.InstancedMesh(cg,rM,tiles.length);const q=new THREE.Quaternion(),sc=new THREE.Vector3(),p=new THREE.Vector3();
 tiles.forEach(([i,j],k)=>{const d=Math.hypot(i-C0,j-C0)/(n/2);const L=.6+Math.pow(Math.max(0,1-d),1.4)*n*.75+hsh(i,j,5)*1.2;q.setFromEuler(new THREE.Euler(0,hsh(i,j,6)*6,0));p.set(i-C0,-.45,j-C0);sc.set(1,L,1);m4.compose(p,q,sc);cm.setMatrixAt(k,m4)});
 cm.castShadow=false;cm.receiveShadow=false;island.add(cm);
 // instanced grass/foliage
 const grassy={beach:.25,night:.8,home:1,garden:1,forest:1.3,swamp:.8,rock:.35}[z.biome]||0;
 if(grassy){const cnt=Math.floor(QP.grass*grassy*tiles.length/90);const bg=new THREE.PlaneGeometry(.035,.2,1,3);bg.translate(0,.1,0);
  const bpa=bg.attributes.position;for(let k=0;k<bpa.count;k++){const y=bpa.getY(k);bpa.setX(k,bpa.getX(k)*(1-y/.2))}
  const gm=windify(new THREE.MeshStandardMaterial({color:z.biome==='swamp'?0x7d8f45:z.biome==='rock'?0x9aa36a:0x6fc04f,roughness:.9,side:THREE.DoubleSide}),.06,.2);
  const occ=new Set(s.objs.map(o=>o.i+','+o.j));const ok=tiles.filter(([i,j])=>!occ.has(i+','+j)||true);
  const gi=new THREE.InstancedMesh(bg,gm,cnt);for(let k=0;k<cnt;k++){const[i,j]=ok[k%ok.length];const x=i-C0+(Math.random()-.5),zz=j-C0+(Math.random()-.5);q.setFromEuler(new THREE.Euler(0,Math.random()*6.28,(Math.random()-.5)*.3));const hs=.6+Math.random()*.9;sc.set(1,hs,1);p.set(x,0,zz);m4.compose(p,q,sc);gi.setMatrixAt(k,m4);col.setHSL(.23+Math.random()*.07,.62,.5+Math.random()*.18);gi.setColorAt(k,col)}
  gi.receiveShadow=!!QP.shadow;island.add(gi);
  // flowers
  if(z.biome==='home'||z.biome==='garden'||z.biome==='forest'){const fg=new THREE.SphereGeometry(.03,6,4);const fm=new THREE.MeshStandardMaterial({roughness:.6,emissive:0x221111});const fc=Math.floor(cnt/45);const fi=new THREE.InstancedMesh(fg,fm,fc);
   for(let k=0;k<fc;k++){const[i,j]=ok[(k*7)%ok.length];p.set(i-C0+(Math.random()-.5)*.9,.12+Math.random()*.06,j-C0+(Math.random()-.5)*.9);m4.makeTranslation(p.x,p.y,p.z);fi.setMatrixAt(k,m4);fi.setColorAt(k,col.set([0xffe066,0xff7fb0,0xffffff,0xb48cff,0xff9a5a][k%5]))}island.add(fi)}}
 // snow sparkle / pebbles for others
 if(z.biome==='arctic'||z.biome==='scorch'||z.biome==='dungeon'){const pg=new THREE.DodecahedronGeometry(.05,0);const pm=new THREE.MeshStandardMaterial({color:z.biome==='arctic'?0xe8f4ff:z.biome==='scorch'?0xb98a55:0x6b6578,roughness:.9,flatShading:true});const c=tiles.length*3;const pi=new THREE.InstancedMesh(pg,pm,c);
  for(let k=0;k<c;k++){const[i,j]=tiles[k%tiles.length];q.setFromEuler(new THREE.Euler(Math.random()*3,Math.random()*3,0));const s2=.5+Math.random()*1.4;sc.set(s2,s2*.6,s2);p.set(i-C0+(Math.random()-.5)*.9,.01,j-C0+(Math.random()-.5)*.9);m4.compose(p,q,sc);pi.setMatrixAt(k,m4)}pi.receiveShadow=true;island.add(pi)}
 builtZone=zid}

// ---------- water shader ----------
const waterMat=()=>new THREE.ShaderMaterial({transparent:true,uniforms:{uTime:U.time,uCol:{value:new THREE.Color(0x3aa7e0)},uDeep:{value:new THREE.Color(0x0d4f86)}},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uTime;uniform vec3 uCol,uDeep;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p)*2.;
 float w=sin(r*18.-uTime*3.)*.5+.5;float c=sin((p.x+p.y)*30.+uTime*2.)*sin((p.x-p.y)*26.-uTime*1.7);
 vec3 col=mix(uCol,uDeep,smoothstep(0.,.9,1.-r));col+=vec3(.9,1.,1.)*smoothstep(.75,1.,c)*.6+w*.06;
 col+=vec3(1.)*pow(max(sin(vUv.x*90.+uTime*4.)*sin(vUv.y*80.-uTime*3.3),0.),14.)*1.2;col+=vec3(.75,.95,1.)*pow(r,3.)*.25;col+=vec3(1.)*smoothstep(.85,1.,r)*.35;gl_FragColor=vec4(col,smoothstep(1.,.95,r)*.92);}`});
const portalMat=()=>new THREE.ShaderMaterial({transparent:true,side:THREE.DoubleSide,uniforms:{uTime:U.time},
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`uniform float uTime;varying vec2 vUv;void main(){vec2 p=vUv-.5;float r=length(p)*2.,a=atan(p.y,p.x);
 float s=sin(a*5.+r*12.-uTime*4.)*.5+.5;vec3 c=mix(vec3(.2,.7,1.),vec3(.9,1.,1.),s*(1.-r));c*=2.2-r;gl_FragColor=vec4(c,smoothstep(1.,.85,r));}`});

// ---------- object builders ----------
const SPH=new THREE.SphereGeometry(1,Q==='high'?48:Q==='med'?32:24,Q==='high'?32:Q==='med'?24:16),SPHL=new THREE.SphereGeometry(1,Q==='low'?12:18,Q==='low'?8:12),BOX=new THREE.BoxGeometry(1,1,1),CYL=new THREE.CylinderGeometry(1,1,1,16),CYL6=new THREE.CylinderGeometry(1,1,1,7);
function mesh(geo,m,s=[1,1,1],p=[0,0,0],r=[0,0,0]){const o=new THREE.Mesh(geo,m);o.scale.set(...s);o.position.set(...p);o.rotation.set(...r);return o}
function tree(color,arctic){const g=new THREE.Group();const trunk=std(0x7a5232,{roughness:.95});g.add(mesh(CYL,trunk,[.07,.55,.07],[0,.27,0]));
 if(arctic){const m=windify(std(0x2f6b4a),.03,1.2);for(let k=0;k<3;k++)g.add(mesh(new THREE.ConeGeometry(.32-k*.08,.4,8),m,[1,1,1],[0,.5+k*.25,0]));g.add(mesh(new THREE.ConeGeometry(.2,.2,8),std(0xffffff,{roughness:.5}),[1,1,1],[0,1.08,0]))}
 else{const m=windify(std(color,{roughness:.85}),.04,1.2);[[0,.8,0,.32],[.18,.68,.1,.22],[-.17,.7,-.06,.24],[.02,.66,-.2,.2],[-.05,.98,.05,.2]].forEach(([x,y,z,r])=>g.add(mesh(SPHL,m,[r,r*.9,r],[x,y,z])))}return g}
const B={};
B.poll=o=>{const g=new THREE.Group(),v=(o.v||0)%3,seed=hsh(o.i,o.j,1);let body;
 if(v===0){body=new THREE.Group();body.position.y=.18;const m=new THREE.MeshPhysicalMaterial({color:0x9aa0a8,roughness:.1,transparent:true,opacity:.85,clearcoat:1});[[0,0,0,.18],[.17,-.05,.05,.12],[-.15,-.04,-.06,.13],[.03,.15,0,.11],[-.05,-.06,.17,.1]].forEach(([x,y,z,r])=>body.add(mesh(SPHL,m,[r,r,r],[x,y,z])))}
 else if(v===1){body=mesh(new THREE.IcosahedronGeometry(.28,0),std(0x6e6e72,{roughness:.7,flatShading:true}),[1,.85,1],[0,.22,0],[seed*3,seed*5,0]);
  for(let k=0;k<5;k++){const a=k*1.25;g.add(mesh(new THREE.ConeGeometry(.06,.22,5),body.material,[1,1,1],[Math.cos(a)*.2,.3+(k%2)*.1,Math.sin(a)*.2],[Math.sin(a)*.7,0,-Math.cos(a)*.7]))}}
 else{body=new THREE.Group();body.position.y=.28;const m=std(0x8fc24a,{roughness:.5});body.add(mesh(SPHL,m,[.22,.2,.22]));for(let k=0;k<9;k++){const a=k*.7,e=Math.sin(k*1.7)*.8;body.add(mesh(new THREE.ConeGeometry(.05,.18,5),m,[1,1,1],[Math.cos(a)*.2*Math.cos(e),Math.sin(e)*.2,Math.sin(a)*.2*Math.cos(e)],[Math.sin(a)*1.4,0,-Math.cos(a)*1.4]))}}
 g.add(body);g.userData.blob=body;
 g.add(mesh(new THREE.CircleGeometry(.4,20),new THREE.MeshStandardMaterial({color:0x2c2c30,transparent:true,opacity:.45,roughness:.2}),[1,1,1],[0,.012,0],[-Math.PI/2,0,0]));return g};
B.tox=o=>{const g=new THREE.Group(),m=new THREE.MeshPhysicalMaterial({color:0x17151c,roughness:.3,clearcoat:1,clearcoatRoughness:.2});
 const b=mesh(SPH,m,[.3,.3,.3],[0,.3,0]);g.add(b);for(let k=0;k<7;k++){const a=k*.9;b.add(mesh(new THREE.ConeGeometry(.12,.3,5),m,[1,1,1],[Math.cos(a)*.85,.35+Math.sin(k)*.3,Math.sin(a)*.85],[Math.sin(a)*1.2,0,-Math.cos(a)*1.2]))}
 g.add(mesh(SPHL,std(0xffffff),[.12,.12,.06],[0,.38,.27]));g.add(mesh(SPHL,glowM(0x6dff3a,2.5),[.07,.07,.03],[0,.38,.32]));g.add(mesh(SPHL,std(0x000000),[.03,.03,.02],[0,.38,.345]));g.userData.blob=b;return g};
function holoPad(col){const g=new THREE.Group();g.add(mesh(CYL,std(0x8a9096,{metalness:.8,roughness:.35}),[.46,.08,.46],[0,.04,0]));g.add(mesh(new THREE.TorusGeometry(.42,.025,8,40),glowM(col,2.4),[1,1,1],[0,.085,0],[Math.PI/2,0,0]));
 const beam=mesh(new THREE.CylinderGeometry(.36,.42,.9,24,1,true),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.18,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending}),[1,1,1],[0,.52,0]);g.add(beam);return g}
B.gate=o=>{let g;
 if(S.zone==='rockgarden'){g=new THREE.Group();const st=std(0x8e8f94,{roughness:.6,metalness:.5,flatShading:true});g.add(mesh(BOX,st,[.9,.85,.8],[0,.45,0]));g.add(mesh(BOX,st,[.12,.3,.5],[-.5,.5,0]));g.add(mesh(BOX,st,[.12,.3,.5],[.5,.5,0]));g.add(mesh(CYL,st,[.03,.3,.03],[0,1,0]));g.add(mesh(SPHL,glowM(0xff5a3a,2.5),[.05,.05,.05],[0,1.17,0]));
  for(const s of[-1,1])g.add(mesh(SPHL,glowM(0x8fe8ff,2.6),[.1,.1,.04],[s*.22,.6,.4]));const d=mesh(new THREE.PlaneGeometry(.5,.32),portalMat(),[1,1,1],[0,.25,.405]);g.add(d)}
 else{g=holoPad(0x5ad8ff);const dia=new THREE.Mesh(new THREE.OctahedronGeometry(.2,0),glowM(0x8fe8ff,2.4));dia.scale.set(1,1.4,1);dia.position.y=.75;g.add(dia);g.userData.spin=dia;for(let k=0;k<4;k++){const a=k/4*6.283;g.add(mesh(SPHL,glowM(0xffffff,3),[.025,.025,.025],[Math.cos(a)*.3,.95+(k%2)*.1,Math.sin(a)*.3]))}}
 g.rotation.y=Math.PI/4;g.userData.light=0x7fd8ff;return g};
B.goal=o=>{const g=holoPad(0x6dff3a),ck=new THREE.Group(),m=glowM(0x6dff3a,2.6);ck.add(mesh(BOX,m,[.08,.22,.06],[-.08,-.03,0],[0,0,.7]));ck.add(mesh(BOX,m,[.08,.42,.06],[.08,.05,0],[0,0,-.6]));ck.position.y=.8;g.add(ck);g.userData.spin=ck;g.userData.light=0x6dff3a;return g};
B.stonehead=o=>{const g=new THREE.Group(),st=std(0x9a968c,{roughness:.95,flatShading:true});g.add(mesh(BOX,st,[.42,.7,.36],[0,.35,0]));g.add(mesh(BOX,st,[.1,.22,.12],[0,.4,.22]));g.add(mesh(BOX,std(0x5f5c55),[.3,.05,.05],[0,.22,.19]));for(const s of[-1,1])g.add(mesh(BOX,std(0x4a4842),[.1,.05,.04],[s*.1,.52,.19]));g.add(mesh(BOX,st,[.46,.08,.4],[0,.72,0]));return g};
B.log=o=>{const g=new THREE.Group(),b=std(0x7a5232,{roughness:.95});g.add(mesh(new THREE.CylinderGeometry(.18,.2,.9,12,1,true),new THREE.MeshStandardMaterial({color:0xffffff,map:genTex('wood','#7a5232').map,normalMap:genTex('wood','#7a5232').normalMap,roughness:.95,side:THREE.DoubleSide}),[1,1,1],[0,.2,0],[0,0,Math.PI/2]));g.add(mesh(new THREE.TorusGeometry(.17,.03,6,16),std(0xc49a6c),[1,1,1],[.45,.2,0],[0,Math.PI/2,0]));g.add(mesh(new THREE.TorusGeometry(.17,.03,6,16),std(0xc49a6c),[1,1,1],[-.45,.2,0],[0,Math.PI/2,0]));g.add(mesh(SPHL,std(0x4f8a2a),[.12,.05,.1],[.1,.38,.05]));return g};
B.lilypond=o=>{const g=new THREE.Group();g.add(mesh(new THREE.CircleGeometry(.45,24),waterMat(),[1,1,1],[0,.03,0],[-Math.PI/2,0,0]));g.add(mesh(new THREE.TorusGeometry(.46,.06,6,20),std(0x8a8780,{flatShading:true}),[1,1,1],[0,.04,0],[Math.PI/2,0,0]));for(let k=0;k<3;k++){const a=k*2.1;g.add(mesh(new THREE.CircleGeometry(.1,10,.3,5.8),std(0x4f9a35,{side:THREE.DoubleSide}),[1,1,1],[Math.cos(a)*.22,.045,Math.sin(a)*.22],[-Math.PI/2,0,a]));if(k===0)g.add(mesh(SPHL,std(0xffb0d0),[.04,.03,.04],[Math.cos(a)*.22,.07,Math.sin(a)*.22]))}return g};
B.sunflower=o=>{const g=new THREE.Group(),st=windify(std(0x4f8a2a),.03,1.5);g.add(mesh(CYL,st,[.02,.6,.02],[0,.3,0]));const h=new THREE.Group();h.position.set(0,.62,.03);h.rotation.x=-.3;for(let k=0;k<12;k++){const a=k/12*6.283;h.add(mesh(SPHL,std(0xffcf2a),[.05,.025,.012],[Math.cos(a)*.1,Math.sin(a)*.1,0],[0,0,a]))}h.add(mesh(CYL,std(0x5a3818),[.07,.02,.07],[0,0,.01],[Math.PI/2,0,0]));g.add(h);g.add(mesh(SPHL,st,[.08,.02,.04],[.06,.25,0],[0,0,.5]));return g};
B.helianth=B.sunflower;
B.waterfall=o=>{const g=new THREE.Group(),st=std(0x8a8780,{flatShading:true,roughness:.9});g.add(mesh(BOX,st,[.8,.9,.4],[0,.45,-.15]));const w=new THREE.Mesh(new THREE.PlaneGeometry(.4,.85,1,6),waterMat());w.position.set(0,.45,.06);g.add(w);g.add(mesh(new THREE.CircleGeometry(.35,20),waterMat(),[1,1,1],[0,.03,.3],[-Math.PI/2,0,0]));g.userData.foam=1;return g};
B.moneyman=o=>{const g=new THREE.Group(),st=std(0xb59a62,{roughness:.6,metalness:.4,flatShading:true});g.add(mesh(CYL6,st,[.3,.15,.3],[0,.07,0]));g.add(mesh(BOX,st,[.36,.6,.3],[0,.45,0]));g.add(mesh(SPHL,st,[.2,.2,.2],[0,.88,0]));g.add(mesh(CYL,std(0xffd84a,{metalness:.9,roughness:.2}),[.1,.02,.1],[0,.5,.16],[Math.PI/2,0,0]));return g};
B.vendor=o=>{const g=new THREE.Group(),wood=std(0x8a5a35);g.add(mesh(BOX,wood,[.8,.38,.42],[0,.19,0]));[[-.36,-.18],[.36,-.18],[-.36,.18],[.36,.18]].forEach(([x,z])=>g.add(mesh(CYL,wood,[.03,.9,.03],[x,.45,z])));
 const c=document.createElement('canvas');c.width=64;c.height=8;const x=c.getContext('2d');for(let k=0;k<8;k++){x.fillStyle=k%2?'#fff4e0':'#e8505b';x.fillRect(k*8,0,8,8)}const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 g.add(mesh(BOX,std(0xffffff,{map:t}),[.9,.04,.55],[0,.92,0],[.18,0,0]));for(let k=0;k<4;k++)g.add(mesh(SPHL,std([0xff6f8f,0xffd25a,0x7ad0ff,0x8fe07a][k]),[.06,.06,.06],[-.27+k*.18,.44,0]));return g};
B.den=o=>{const g=new THREE.Group();const m=std(0x7d5a3a,{roughness:1,flatShading:true});const d=mesh(new THREE.SphereGeometry(.5,14,8,0,6.283,0,1.57),m,[1,.8,1],[0,0,0]);g.add(d);
 g.add(mesh(new THREE.CircleGeometry(.2,16),new THREE.MeshBasicMaterial({color:0x140c06}),[1,1.2,1],[0,.17,.46]));const mo=std(0x5c9a3a);for(let k=0;k<6;k++)g.add(mesh(SPHL,mo,[.09,.05,.09],[Math.cos(k)*.3,.33+Math.sin(k*3)*.03,Math.sin(k)*.3]));return g};
B.nest=o=>{const g=new THREE.Group();g.add(mesh(new THREE.TorusGeometry(.26,.09,8,20),std(0xa77a48,{roughness:1}),[1,1,.8],[0,.08,0],[Math.PI/2,0,0]));g.add(mesh(new THREE.CircleGeometry(.26,16),std(0xd9b77a),[1,1,1],[0,.05,0],[-Math.PI/2,0,0]));
 const egg=mesh(SPH,new THREE.MeshPhysicalMaterial({color:0xfff2d6,roughness:.4,clearcoat:.6,emissive:0x332200,emissiveIntensity:.3}),[.12,.16,.12],[0,.18,0]);g.add(egg);g.userData.egg=egg;return g};
B.treetree=o=>{const g=tree(0xff9cc8);const tm=glowM(0xff4f7a,.8);g.userData.treats=[];for(let k=0;k<6;k++){const t=mesh(SPHL,tm,[.05,.05,.05],[Math.cos(k*1.1)*.28,.62+Math.sin(k*2.3)*.12,Math.sin(k*1.1)*.28]);g.add(t);g.userData.treats.push(t)}return g};
B.totem=o=>{const g=new THREE.Group(),cs=[0xb5653a,0x2f8f7a,0xd9a43a];for(let k=0;k<3;k++){g.add(mesh(CYL6,std(cs[k],{flatShading:true,roughness:.8}),[.17-k*.015,.24,.17-k*.015],[0,.12+k*.24,0]))}
 const e=glowM(0x7affd4,2);for(const s of[-1,1])g.add(mesh(SPHL,e,[.03,.03,.03],[s*.07,.62,.15]));g.add(mesh(BOX,std(0xd9a43a),[.6,.06,.1],[0,.5,0]));g.userData.eyes=e;return g};
B.project=o=>{const g=new THREE.Group(),w=std(0xa07a4a);for(const[x,z]of[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]])g.add(mesh(CYL,w,[.025,.8,.025],[x,.4,z]));for(const y of[.3,.7])g.add(mesh(BOX,w,[.66,.03,.66],[0,y,0]));g.add(mesh(BOX,std(0xc8bda5,{flatShading:true}),[.4,.4,.4],[0,.2,0]));return g};
B.tree=o=>{const z=Z(S.zone).biome;return tree(z==='forest'?0x3f9a3a:z==='swamp'?0x5f7a3a:z==='scorch'?0x8aa04a:0x5cb84a,z==='arctic')};
B.pool=o=>{const g=new THREE.Group();g.add(mesh(new THREE.TorusGeometry(.36,.06,8,24),std(0x9b9484,{flatShading:true}),[1,1,.6],[0,.03,0],[Math.PI/2,0,0]));g.add(mesh(new THREE.CircleGeometry(.36,32),waterMat(),[1,1,1],[0,.035,0],[-Math.PI/2,0,0]));return g};
B.rock=o=>{const g=new THREE.Group();const m=std(0x8b8a86,{flatShading:true,roughness:.95});g.add(mesh(new THREE.DodecahedronGeometry(.26,1),m,[1.1,.75,1],[0,.16,0],[.3,1,0]));g.add(mesh(new THREE.DodecahedronGeometry(.12,0),m,[1,.8,1],[.22,.07,.12]));return g};
B.stump=o=>{const g=new THREE.Group();g.add(mesh(CYL,std(0x6e4a2c,{roughness:1}),[.2,.24,.2],[0,.12,0]));g.add(mesh(new THREE.CircleGeometry(.2,16),std(0xcaa070),[1,1,1],[0,.241,0],[-Math.PI/2,0,0]));g.add(mesh(SPHL,std(0xe0d0a0),[.05,.03,.05],[.12,.25,.05]));return g};
const bone=std(0xeee3c8,{roughness:.6});
B.skeleton=B.whalebone=o=>{const g=new THREE.Group();for(let k=0;k<5;k++)g.add(mesh(new THREE.TorusGeometry(.32,.025,6,16,Math.PI),bone,[1,1.2,1],[0,0,-.4+k*.2],[0,0,0]));g.add(mesh(CYL,bone,[.03,.9,.03],[0,.02,0],[Math.PI/2,0,0]));g.add(mesh(SPHL,bone,[.14,.1,.18],[0,.05,.55]));return g};
B.mammoth=o=>{const g=B.skeleton(o);g.add(mesh(new THREE.TorusGeometry(.25,.03,6,16,Math.PI*1.2),bone,[1,1,1],[.12,.25,.6],[0,Math.PI/2,0]));g.add(mesh(new THREE.TorusGeometry(.25,.03,6,16,Math.PI*1.2),bone,[1,1,1],[-.12,.25,.6],[0,Math.PI/2,0]));g.scale.setScalar(1.2);return g};
const stoneM=()=>std(0xa49a86,{flatShading:true,roughness:.95});
B.ruin=o=>{const g=new THREE.Group(),m=stoneM();g.add(mesh(CYL6,m,[.12,.7,.12],[-.2,.35,0]));g.add(mesh(CYL6,m,[.12,.35,.12],[.22,.17,.1]));g.add(mesh(BOX,m,[.3,.12,.18],[.1,.06,-.25],[0,.5,.2]));return g};
B.arch=o=>{const g=new THREE.Group(),m=stoneM();g.add(mesh(BOX,m,[.16,.9,.16],[-.32,.45,0]));g.add(mesh(BOX,m,[.16,.9,.16],[.32,.45,0]));g.add(mesh(BOX,m,[.86,.16,.2],[0,.95,0]));const iv=windify(std(0x4f8f3a),.03,1);g.add(mesh(SPHL,iv,[.1,.2,.1],[-.38,.7,.06]));return g};
const flame=()=>{const f=mesh(new THREE.ConeGeometry(.06,.18,8),glowM(0xffa030,4),[1,1,1],[0,.78,0]);return f};
B.torch=o=>{const g=new THREE.Group();g.add(mesh(CYL,std(0x5a3a22),[.03,.7,.03],[0,.35,0]));g.add(mesh(CYL,std(0x333333,{metalness:.7}),[.06,.06,.06],[0,.7,0]));const f=flame();g.add(f);g.userData.flame=f;g.userData.light=0xff9a3a;return g};
B.lamp=o=>{const g=new THREE.Group();g.add(mesh(CYL,std(0x2d3340,{metalness:.6,roughness:.4}),[.025,.85,.025],[0,.42,0]));const b=mesh(SPHL,glowM(0xffe7a0,3.5),[.08,.08,.08],[0,.88,0]);g.add(b);g.userData.light=0xffd890;return g};
B.igloo=o=>{const g=new THREE.Group();g.add(mesh(new THREE.SphereGeometry(.45,16,8,0,6.283,0,1.57),std(0xf2f8ff,{roughness:.5,flatShading:true}),[1,.85,1]));g.add(mesh(new THREE.CylinderGeometry(.14,.14,.3,12,1,false,0,Math.PI),std(0xe8f2ff),[1,1,1],[0,.12,.45],[Math.PI/2,0,0]));return g};
B.zenrock=o=>{const g=new THREE.Group(),m=std(0x7e7b76,{roughness:.6});[.16,.13,.1,.07].reduce((y,r)=>{g.add(mesh(SPH,m,[r,r*.55,r],[0,y+r*.5,0]));return y+r*1.05},0);return g};
B.chain=o=>{const g=new THREE.Group(),m=std(0x6a6a70,{metalness:.9,roughness:.35});for(let k=0;k<5;k++)g.add(mesh(new THREE.TorusGeometry(.06,.015,6,12),m,[1,1.4,1],[0,.05+k*.13,0],[0,k%2*1.57,0]));g.add(mesh(CYL6,stoneM(),[.15,.08,.15],[0,.04,0]));return g};
B.reeds=o=>{const g=new THREE.Group(),m=windify(std(0x7b8a3a),.08,.8);for(let k=0;k<7;k++){const r=mesh(CYL,m,[.012,.6+hsh(k,o.i,1)*.3,.012],[Math.cos(k*2)*.15,.35,Math.sin(k*2)*.15]);g.add(r);g.add(mesh(CYL,std(0x6b4a2a),[.025,.1,.025],[r.position.x,.65+hsh(k,o.i,1)*.15,r.position.z]))}return g};
B.mushring=o=>{const g=new THREE.Group();for(let k=0;k<7;k++){const a=k/7*6.283,x=Math.cos(a)*.3,z=Math.sin(a)*.3;g.add(mesh(CYL,std(0xf3e6d0),[.025,.1,.025],[x,.05,z]));g.add(mesh(new THREE.SphereGeometry(1,10,6,0,6.283,0,1.6),glowM(0xff5f8f,.4),[.06,.045,.06],[x,.1,z]))}return g};
B.decor=o=>{const it=o.item||'',g=new THREE.Group();
 if(it.includes('crystal')){g.add(mesh(new THREE.OctahedronGeometry(.2,0),new THREE.MeshPhysicalMaterial({color:0x7fd3ff,emissive:0x2a8fff,emissiveIntensity:1.6,roughness:.1,transmission:.3}),[.8,2,.8],[0,.4,0]));g.userData.light=0x6fbfff}
 else if(it.includes('lantern')){const l=B.lamp(o);l.scale.setScalar(.7);return l}
 else if(it.includes('mushroom')){g.add(mesh(CYL,std(0xf3e6d0),[.07,.4,.07],[0,.2,0]));g.add(mesh(new THREE.SphereGeometry(1,16,8,0,6.283,0,1.6),std(0xe84a4a,{roughness:.5}),[.3,.2,.3],[0,.4,0]));for(let k=0;k<5;k++)g.add(mesh(SPHL,std(0xffffff),[.04,.02,.04],[Math.cos(k*1.3)*.18,.55,Math.sin(k*1.3)*.18]))}
 else if(it.includes('paving')){g.add(mesh(CYL6,stoneM(),[.4,.03,.4],[0,.015,0]))}
 else if(it.includes('fence')){const w=std(0xf4ead8);for(let k=-2;k<=2;k++)g.add(mesh(BOX,w,[.06,.4,.04],[k*.18,.2,0]));g.add(mesh(BOX,w,[.8,.05,.03],[0,.28,0]))}
 else{g.add(mesh(CYL,std(0xb5653a),[.12,.16,.12],[0,.08,0]));const f=windify(std(0x5cb84a),.04,.6);g.add(mesh(SPHL,f,[.14,.12,.14],[0,.24,0]));for(let k=0;k<4;k++)g.add(mesh(SPHL,glowM(0xffe066,.3),[.04,.04,.04],[Math.cos(k*1.6)*.1,.32,Math.sin(k*1.6)*.1]))}return g};

// ---------- fauna ----------
const SP={ // proportions (original designs)
 horse:{b:[.17,.16,.26],leg:.26,lr:.04,head:.12,neck:[.16,.9],snout:[.11,.06],ears:'point',tail:'long',mane:1},
 dog:{b:[.16,.14,.22],leg:.16,lr:.045,head:.13,neck:[.06,.5],snout:[.08,.06],ears:'flop',tail:'wag'},
 turtle:{b:[.2,.12,.22],leg:.08,lr:.06,head:.1,neck:[.06,.2],snout:[.03,.05],ears:'',tail:'stub',shell:1},
 crocodile:{b:[.15,.1,.3],leg:.08,lr:.05,head:.1,neck:[.02,.1],snout:[.2,.07],ears:'',tail:'croc',spikes:1},
 octopus:{b:[.2,.22,.2],leg:0,lr:0,head:0,neck:[0,0],snout:[0,0],ears:'',tail:'',tent:1},
 buffalo:{b:[.2,.18,.27],leg:.17,lr:.055,head:.13,neck:[.05,.3],snout:[.08,.08],ears:'side',tail:'thin',horns:1,hump:1},
 bear:{b:[.2,.2,.24],leg:.15,lr:.065,head:.15,neck:[.05,.5],snout:[.06,.06],ears:'round',tail:'stub'},
 pig:{b:[.19,.16,.24],leg:.12,lr:.05,head:.13,neck:[.03,.3],snout:[.05,.06],ears:'point',tail:'curl',disc:1},
 rabbit:{b:[.14,.14,.16],leg:.1,lr:.045,head:.12,neck:[.04,.8],snout:[.03,.05],ears:'long',tail:'puff'},
 fox:{b:[.13,.12,.22],leg:.17,lr:.035,head:.12,neck:[.08,.6],snout:[.1,.045],ears:'point',tail:'bushy'},
 giraffe:{b:[.16,.15,.22],leg:.32,lr:.035,head:.1,neck:[.4,1.25],snout:[.09,.05],ears:'side',tail:'thin',horns:2},
 bird:{b:[.14,.15,.17],leg:.12,lr:.025,head:.12,neck:[.06,.9],snout:[.07,.03],ears:'',tail:'bushy',beak:1},
 mouse:{b:[.13,.12,.18],leg:.08,lr:.035,head:.12,neck:[.03,.5],snout:[.06,.04],ears:'round',tail:'thin'},
 frog:{b:[.17,.12,.17],leg:.09,lr:.06,head:.13,neck:[.01,.2],snout:[.02,.08],ears:'',tail:''},
 cat:{b:[.13,.12,.2],leg:.15,lr:.035,head:.12,neck:[.06,.6],snout:[.03,.045],ears:'point',tail:'cat'}};
function patTex(base,pat,animal,sec){const c=document.createElement('canvas');c.width=256;c.height=128;const x=c.getContext('2d'),b=new THREE.Color(base),d=sec&&pat!=='Solid'?'#'+new THREE.Color(sec).getHexString():'#'+b.clone().multiplyScalar(.6).getHexString(),l='#'+b.clone().lerp(new THREE.Color(1,1,1),.35).getHexString();
 x.fillStyle='#'+b.getHexString();x.fillRect(0,0,256,128);const gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'rgba(0,0,0,.12)');gr.addColorStop(.6,'rgba(0,0,0,0)');gr.addColorStop(1,l);x.fillStyle=gr;x.fillRect(0,0,256,128);
 // fur strokes
 for(let k=0;k<1400;k++){const px=Math.random()*256,py=Math.random()*128;x.strokeStyle=Math.random()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';x.lineWidth=1;x.beginPath();x.moveTo(px,py);x.lineTo(px+1,py+4);x.stroke()}
 x.fillStyle=d;const PM={Solid:'Plain',Spotted:'Spots',Dotted:'Dots',Speckled:'Speck',Splatter:'Spots',Lumpy:'Spots',Sawtooth:'Stripes',Bolt:'Stripes',Rip:'Stripes',Stego:'Stripes',Tiled:'Tiles',Double:'Stripes',Flutter:'Palm',Leafed:'Palm',Palm:'Palm','B Sharp':'B-sharp'};const GL={Moon:'☾',Star:'★',Sun:'☀',Shine:'✦',Diamond:'◆',Spade:'♠',Clover:'♣',Flower:'✿',Tulip:'❀',Budding:'❁',Bone:'⚚',Boomerang:'❯',Curl:'@',Roundel:'◉',Finny:'▲'};let P=PM[pat]||pat;if(animal==='giraffe'&&P==='Plain')P='Spots';
 if(GL[P]){x.font='bold 34px serif';x.textAlign='center';for(let k=0;k<7;k++)x.fillText(GL[P],18+k*36,62+(k%2)*26)}
 if(P==='Dots'||P==='Speck')for(let k=0;k<(P==='Dots'?40:120);k++){x.beginPath();x.arc(Math.random()*256,10+Math.random()*100,P==='Dots'?4:1.6,0,7);x.fill()}
 if(P==='Tiles')for(let i=0;i<16;i++)for(let j=0;j<8;j++)if((i+j)%2){x.fillRect(i*16,j*16,16,16)}
 if(P==='Spots')for(let k=0;k<26;k++){x.beginPath();x.ellipse(Math.random()*256,20+Math.random()*80,6+Math.random()*8,5+Math.random()*6,Math.random()*3,0,7);x.fill()}
 if(P==='Stripes')for(let k=0;k<12;k++){x.beginPath();x.moveTo(k*22,0);x.quadraticCurveTo(k*22+8,50,k*22-4,100);x.lineWidth=6;x.strokeStyle=d;x.stroke()}
 if(P==='Palm')for(let k=0;k<6;k++){const cx=20+k*42,cy=55;for(let f=0;f<5;f++){x.beginPath();x.ellipse(cx+Math.cos(f*1.3-2)*12,cy+Math.sin(f*1.3-2)*12,10,3,f*1.3-2,0,7);x.fill()}}
 if(P==='B-sharp'){x.font='bold 30px serif';for(let k=0;k<7;k++)x.fillText('♯',10+k*36,60+(k%2)*24)}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t}
function furMat(color,pat,animal,sec){const m=furMat0(color,pat,animal,sec);if(Q!=='low')m.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <dithering_fragment>','#include <dithering_fragment>\n{float rim=1.-max(dot(normalize(-vViewPosition),normal),0.);gl_FragColor.rgb+=vec3(1.,.96,.84)*pow(rim,3.)*.32;}')};return m}
function furMat0(color,pat,animal,sec){return new THREE.MeshPhysicalMaterial({color:0xffffff,map:patTex(color,pat,animal,sec),roughness:.78,sheen:1,sheenRoughness:.45,sheenColor:new THREE.Color(color).lerp(new THREE.Color(1,1,1),.6)})}
function buildFauna(genes){const sp=SPECIES[genes.species]||SPECIES.hoofer,a=SP[sp.animal]||SP.dog,col=COLORS[genes.color]||'#e2b273';
 const fur=furMat(col,genes.pattern||'Plain',sp.animal,COLORS[genes.color2]),dark=std(new THREE.Color(col).multiplyScalar(.45),{roughness:.7}),belly=std(new THREE.Color(col).lerp(new THREE.Color(1,1,1),.45),{roughness:.8});
 const root=new THREE.Group(),body=new THREE.Group();root.add(body);const rig={root,body,legs:[],eyes:[],lids:[],tail:null,head:null};
 const lift=a.leg+a.b[1]*.7;body.position.y=lift;
 body.add(mesh(SPH,fur,a.b));body.add(mesh(SPH,belly,[a.b[0]*.8,a.b[1]*.6,a.b[2]*.8],[0,-a.b[1]*.35,0]));
 if(a.hump)body.add(mesh(SPH,dark,[a.b[0]*.8,a.b[1]*.6,a.b[2]*.5],[0,a.b[1]*.6,a.b[2]*.35]));
 if(a.shell){const sm=new THREE.MeshPhysicalMaterial({color:0x5f7a3a,roughness:.4,clearcoat:.8,flatShading:true});body.add(mesh(new THREE.SphereGeometry(1,10,6,0,6.283,0,1.6),sm,[a.b[0]*1.25,a.b[1]*2,a.b[2]*1.2],[0,-.01,0]));body.add(mesh(CYL,std(0xc9b56a),[a.b[0]*1.28,.025,a.b[2]*1.22],[0,0,0]))}
 if(a.spikes)for(let k=0;k<5;k++)body.add(mesh(new THREE.ConeGeometry(.025,.06,4),dark,[1,1,1],[0,a.b[1]*.95,-a.b[2]*.6+k*a.b[2]*.3]));
 // legs
 if(a.leg){for(const[x,z]of[[-1,1],[1,1],[-1,-1],[1,-1]]){const lg=new THREE.Group();lg.position.set(x*a.b[0]*.62,0,z*a.b[2]*.58);const L=a.leg+a.b[1]*.6;lg.add(mesh(new THREE.CapsuleGeometry(a.lr,L-a.lr*2,4,10),fur,[1,1,1],[0,-L/2,0]));lg.add(mesh(SPHL,dark,[a.lr*1.15,a.lr*.8,a.lr*1.3],[0,-L+a.lr*.3,a.lr*.2]));body.add(lg);rig.legs.push(lg)}}
 if(a.tent){const tm=fur;for(let k=0;k<6;k++){const ang=k/6*6.283,t=new THREE.Group();t.position.set(Math.cos(ang)*.12,-.1,Math.sin(ang)*.12);t.rotation.y=-ang;const seg=mesh(new THREE.CapsuleGeometry(.04,.22,4,8),tm,[1,1,1],[.1,-.06,0],[0,0,1.2]);t.add(seg);body.add(t);rig.legs.push(t)}body.position.y=.3}
 // head
 const head=new THREE.Group();rig.head=head;
 if(a.head){const nl=a.neck[0];head.position.set(0,a.b[1]*.4+Math.sin(a.neck[1])*nl,a.b[2]*.85+Math.cos(a.neck[1])*nl*.6);
  if(nl>.05){const nk=mesh(new THREE.CapsuleGeometry(a.head*.45,nl,4,10),fur);nk.position.set(0,a.b[1]*.4+Math.sin(a.neck[1])*nl*.5,a.b[2]*.8+Math.cos(a.neck[1])*nl*.3);nk.rotation.x=Math.PI/2-a.neck[1];body.add(nk);if(a.mane){for(let k=0;k<5;k++)body.add(mesh(SPHL,dark,[.035,.05,.035],[0,nk.position.y+(k-2)*nl*.18+.04,nk.position.z-(k-2)*nl*.08-a.head*.35]))}}
  head.add(mesh(SPH,fur,[a.head,a.head*.95,a.head]));
  if(a.snout[0])head.add(mesh(SPH,belly,[a.snout[1],a.snout[1]*.85,a.snout[0]],[0,-a.head*.25,a.head*.75]));
  if(a.beak)head.add(mesh(new THREE.ConeGeometry(a.head*.3,a.head*.7,8),std(0xf2a62a),[1,1,1],[0,-a.head*.15,a.head*1.1],[Math.PI/2,0,0]));
  if(a.disc)head.add(mesh(CYL,std(0xff9fb5),[.05,.02,.05],[0,-a.head*.2,a.head*.75+a.snout[0]*.9],[Math.PI/2,0,0]));
  head.add(mesh(SPHL,std(0x221a18,{roughness:.3}),[.022,.016,.016],[0,-a.head*.12,a.head*.72+a.snout[0]*.95]));
  const ew=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.1,clearcoat:1}),ir=std({Vamp:0xc0102a,Greenvamp:0x2aa83a,Bluevamp:0x2a5ad0,Pinkvamp:0xe0509a,Orangevamp:0xf07a1a,Purplevamp:0x8a3ad0,Evil:0xc0102a,Cat:0xd8b81a,Smitten:0xff5a9a,Glam:0x7a3ab0}[genes.eyes]||0x2a1a12,{roughness:.2}),hl=new THREE.MeshBasicMaterial({color:0xffffff});
  for(const s of[-1,1]){const e=new THREE.Group();e.position.set(s*a.head*.48,a.head*.22,a.head*.72);e.rotation.y=s*.35;e.add(mesh(SPH,ew,[a.head*.3,a.head*.34,a.head*.22]));e.add(mesh(SPH,ir,[a.head*.2,a.head*.24,a.head*.12],[0,-a.head*.02,a.head*.14]));e.add(mesh(SPHL,hl,[a.head*.06,a.head*.06,a.head*.03],[a.head*.06,a.head*.08,a.head*.25]));
   const lid=mesh(new THREE.SphereGeometry(1,16,8,0,6.283,0,1.6),fur,[a.head*.33,a.head*.36,a.head*.25]);lid.rotation.x=genes.eyes==='Sleepy'?.9:-.4;e.add(lid);rig.lids.push(lid);if(genes.eyes==='Vamp')e.add(mesh(BOX,dark,[a.head*.4,a.head*.06,a.head*.05],[0,a.head*.34,a.head*.15],[0,0,-s*.35]));head.add(e);rig.eyes.push(e)}
  const ear=({Short:'round',Long:'long',Pointy:'point',Prongy:'point',Ibex:'side',Blackbuck:'point',Pinched:'point',Squared:'round',Kohia:'flop',Wahini:'flop',Konini:'side',Tube:'long',Robot:'round',Angler:'long'})[genes.ears]||a.ears;for(const s of[-1,1]){let e=null;
   if(ear==='point')e=mesh(new THREE.ConeGeometry(a.head*.32,a.head*.7,8),fur,[1,1,.5],[s*a.head*.55,a.head*.85,-a.head*.1],[0,0,-s*.3]);
   if(ear==='long')e=mesh(new THREE.CapsuleGeometry(a.head*.18,a.head*1.4,4,8),fur,[1,1,.5],[s*a.head*.35,a.head*1.4,-a.head*.15],[-.15,0,-s*.12]);
   if(ear==='flop')e=mesh(SPH,dark,[a.head*.2,a.head*.48,a.head*.1],[s*a.head*.88,a.head*.05,-a.head*.05],[0,0,s*.3]);
   if(ear==='round')e=mesh(SPH,fur,[a.head*.3,a.head*.3,a.head*.14],[s*a.head*.7,a.head*.78,-a.head*.1]);
   if(ear==='side')e=mesh(SPH,fur,[a.head*.35,a.head*.12,a.head*.16],[s*a.head*1.05,a.head*.35,-a.head*.2]);
   if(e)head.add(e);
   if(a.horns===1)head.add(mesh(new THREE.TorusGeometry(a.head*.45,a.head*.09,6,12,Math.PI*.7),std(0xe8dcc0,{roughness:.4}),[1,1,1],[s*a.head*.75,a.head*.75,0],[0,Math.PI/2,s>0?-.4:Math.PI+.4]));
   if(a.horns===2)head.add(mesh(CYL,dark,[.012,a.head*.6,.012],[s*a.head*.3,a.head*1.1,-a.head*.2]))}}
 else{head.position.set(0,.05,.0);const ew=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:.1,clearcoat:1}),hl=new THREE.MeshBasicMaterial({color:0xffffff});for(const s of[-1,1]){const e=new THREE.Group();e.position.set(s*.08,.06,.17);e.add(mesh(SPH,ew,[.055,.065,.04]));e.add(mesh(SPH,std(genes.eyes==='Vamp'?0xc0102a:0x22140f),[.035,.045,.02],[0,0,.03]));e.add(mesh(SPHL,hl,[.012,.012,.008],[.012,.018,.05]));const lid=mesh(new THREE.SphereGeometry(1,16,8,0,6.283,0,1.6),fur,[.06,.07,.045]);lid.rotation.x=genes.eyes==='Sleepy'?.9:-.4;e.add(lid);rig.lids.push(lid);head.add(e);rig.eyes.push(e)}}
 body.add(head);if(a.head)head.scale.setScalar(1.4);

 // zapper necklace (user-recalled from the original): collar + glowing emitter gem
 const lvl=genes._lv||1,gc=lvl>=15?0xffc93a:lvl>=10?0xc06bff:lvl>=5?0x3fe0ff:0x8bff4a;
 const cy=a.head?a.b[1]*.35:-.02,cz=a.head?a.b[2]*.78:.0,cr=a.head?Math.max(a.b[0]*.62,a.head*.6):.2;
 const collar=mesh(new THREE.TorusGeometry(cr,lvl>=20?.06:.03,10,28),new THREE.MeshStandardMaterial({color:lvl>=20?0xffc93a:((window.COLLARC&&COLLARC[genes.collar])||0xc9ced6),roughness:.25,metalness:.9}),[1,1,1],[0,cy,cz],[Math.PI/2-.5,0,0]);body.add(collar);
 for(let k=0;k<6;k++){const an=k/6*Math.PI-Math.PI/2+Math.PI/2;}
 const gem=new THREE.Mesh(new THREE.SphereGeometry(.055,16,12),glowM(0xa8ecff,3.2));gem.position.set(0,cy-cr*.45,cz+cr*.9);body.add(gem);const rim=mesh(new THREE.TorusGeometry(.06,.014,8,20),glowM(gc,2.2),[1,1,1],[0,cy-cr*.45,cz+cr*.9-.005]);body.add(rim);
 const cap=mesh(CYL,new THREE.MeshStandardMaterial({color:0xd8a84a,metalness:.9,roughness:.25}),[.03,.02,.03],[0,cy-cr*.45+.06,cz+cr*.88]);body.add(cap);
 rig.gem=gem;rig.gemCol=0x5dff2a;
 // bold toon outlines (inverted hull) — chibi cartoon look from reference footage
 const olM=new THREE.MeshBasicMaterial({color:0x1a120c,side:THREE.BackSide});const ms=[];body.traverse(m=>{if(m.isMesh&&m.material!==olM&&!(m.material.emissiveIntensity>1.5))ms.push(m)});ms.forEach(m=>{const o=new THREE.Mesh(m.geometry,olM);o.scale.setScalar(1.07);o.castShadow=false;m.add(o)});
 // tail
 const tg=new THREE.Group();tg.position.set(0,a.b[1]*.3,-a.b[2]*.95);const T=a.tail,tt=genes.tail||'Normal';
 if(tt==='Mild'||T==='stub')tg.add(mesh(SPH,fur,[.04,.04,.04]));
 else if(T==='long')for(let k=0;k<4;k++)tg.add(mesh(SPHL,dark,[.04,.04,.07],[0,-k*.05,-k*.04]));
 else if(T==='bushy'){tg.add(mesh(SPH,fur,[.07,.07,.16],[0,.04,-.12],[-.5,0,0]));tg.add(mesh(SPH,std(0xfff8ee),[.05,.05,.06],[0,.1,-.25]))}
 else if(T==='puff')tg.add(mesh(SPH,std(0xfff8ee),[.05,.05,.05]));
 else if(T==='croc')tg.add(mesh(new THREE.ConeGeometry(.08,.32,8),fur,[1,1,.7],[0,-.02,-.15],[-Math.PI/2,0,0]));
 else if(T==='curl')tg.add(mesh(new THREE.TorusGeometry(.03,.01,6,12,5),std(0xff9fb5),[1,1,1],[0,0,-.02]));
 else if(T)tg.add(mesh(new THREE.CapsuleGeometry(.015,.18,4,6),fur,[1,1,1],[0,.05,-.08],[-.7,0,0]));
 if(tt==='Flower'){tg.add(mesh(SPHL,std(0xffe066,{emissive:0x332200}),[.03,.03,.03],[0,.12,-.14]));for(let k=0;k<5;k++)tg.add(mesh(SPHL,std(0xff7fb0),[.03,.02,.03],[Math.cos(k*1.26)*.04,.12,-.14+Math.sin(k*1.26)*.04]))}
 if(T)body.add(tg);rig.tail=tg;
 // contact shadow blob for low quality
 const blob=mesh(new THREE.CircleGeometry(.28,20),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.28,depthWrite:false}),[1,1,1],[0,.012,0],[-Math.PI/2,0,0]);root.add(blob);
 shadowify(body);root.scale.setScalar(1.25);root.userData.rig=rig;root.userData.lift=body.position.y;return root}
function animFauna(f,t,st){const TK=st.trick!==undefined?st.trick:(f===fauna&&window.rt?rt.trick:null);const r=f.userData.rig,b=r.body,L=f.userData.lift;const br=Math.sin(t*2.2)*.025;
 b.scale.set(1-br*.4,1+br,1-br*.4);let y=L;
 if(st.walk){const ph=t*11;r.legs.forEach((l,k)=>{l.rotation.x=Math.sin(ph+(k===0||k===3?0:Math.PI))*.6});y+=Math.abs(Math.sin(ph))*.025;b.rotation.z=Math.sin(ph)*.04}
 else{r.legs.forEach((l,k)=>{l.rotation.x*=.8});b.rotation.z*=.8}
 if(r.legs.length===6)r.legs.forEach((l,k)=>{l.rotation.z=Math.sin(t*3+k)*.25});
 if(st.happy){y+=Math.abs(Math.sin(t*9))*.18;b.scale.y*=1+Math.sin(t*18)*.05}
 if(st.sleep){y=L*.65;b.rotation.x=.08}else b.rotation.x=st.zap>0?-.12*st.zap:0;
 if(r.head){r.head.rotation.x=st.sleep?.35:st.zap>0?.25*st.zap:Math.sin(t*.9)*.05;r.head.rotation.y=st.walk||st.sleep?0:Math.sin(t*.6)*.25}
 if(r.tail)r.tail.rotation.y=Math.sin(t*(st.happy?16:4))*(st.happy?.6:.25);
 const blink=st.sleep?1:((t%3.7)<.12?1:0);r.lids.forEach(l=>{const base=l.userData.base??(l.userData.base=l.rotation.x);l.rotation.x=blink?1.5:base});
 if(r.gem){r.gem.rotation.y=t*2;r.gem.material.emissiveIntensity=(st.zap>0?6:2.2)+Math.sin(t*5)*.8}
 const te=TK?(now()-TK.t0)/1000:9;if(te<1.6){const k=TK.k;if(k==='boing')y+=Math.abs(Math.sin(te*Math.PI*2.5))*.45;if(k==='roll')b.rotation.z=te*Math.PI*2.5;if(k==='play'){y+=Math.abs(Math.sin(te*12))*.12;b.rotation.y=Math.sin(te*8)*.4}if(k==='greet'&&r.head)r.head.rotation.z=Math.sin(te*10)*.35;if(k==='sniff'&&r.head)r.head.rotation.x=.45+Math.sin(te*30)*.06;if(k==='itch')b.rotation.z=Math.sin(te*30)*.12;if(k==='bored'){y=L*.8;if(r.head)r.head.rotation.x=.3}}else if(b.rotation.y)b.rotation.y*=.8;
 if(f===fauna&&window.rt&&now()-(rt.frownT||0)<1500&&r.head)r.head.rotation.y=Math.sin(now()/60)*.3;
 b.position.y+= (y-b.position.y)*.35}

// ---------- v5 station / prop builders ----------
const stumpStation=(top,glow)=>o=>{const g=new THREE.Group();g.add(mesh(CYL,std(0x6e4a2c,{roughness:1}),[.32,.32,.32],[0,.16,0]));g.add(mesh(CYL,std(top,{roughness:.7}),[.28,.04,.28],[0,.33,0]));const gm=mesh(SPHL,glowM(glow,2.2),[.08,.08,.08],[0,.45,0]);g.add(gm);g.userData.light=glow;for(let k=0;k<4;k++)g.add(mesh(new THREE.ConeGeometry(.06,.18,5),std(0x5a3a22),[1,1,1],[Math.cos(k*1.57)*.3,.06,Math.sin(k*1.57)*.3],[0,0,Math.cos(k*1.57)*.6]));return g};
B.basin=o=>{const g=new THREE.Group();g.add(mesh(CYL,stoneM(),[.34,.22,.34],[0,.11,0]));g.add(mesh(new THREE.CircleGeometry(.28,24),std(0x4fd0a0,{emissive:0x0a5a40,emissiveIntensity:.8,roughness:.2}),[1,1,1],[0,.225,0],[-Math.PI/2,0,0]));g.add(mesh(SPHL,glowM(0x8bff4a,2),[.05,.05,.05],[0,.42,0]));return g};
B.claystump=stumpStation(0xb5653a,0xff9a5a);B.beautystump=stumpStation(0xf7a8c4,0xff6fb0);B.paleostump=stumpStation(0xe8dcc0,0xfff2c0);B.diffstump=stumpStation(0x5a8aa8,0x7fd3ff);
B.kiln=o=>{const g=new THREE.Group();g.add(mesh(new THREE.SphereGeometry(.34,16,10,0,6.283,0,1.7),std(0xa0522d,{roughness:.9}),[1,1.1,1],[0,0,0]));g.add(mesh(CYL,std(0x6a3a1a),[.06,.25,.06],[0,.45,0]));g.add(mesh(SPHL,glowM(0xff7a20,3),[.1,.08,.04],[0,.12,.3]));g.userData.light=0xff7a20;return g};
B.dig=o=>{const g=new THREE.Group(),m=std(0x6b4a2a,{roughness:1,flatShading:true});g.add(mesh(new THREE.SphereGeometry(.28,10,6,0,6.283,0,1.4),m,[1,.45,1]));for(let k=0;k<5;k++)g.add(mesh(new THREE.DodecahedronGeometry(.04,0),m,[1,1,1],[Math.cos(k*1.3)*.3,.02,Math.sin(k*1.3)*.3]));g.add(mesh(CYL,std(0xd8c8a0),[.012,.12,.012],[.05,.14,0],[0,0,.5]));return g};
B.pullytree=o=>{const g=tree(0x8fd04a,false);g.add(mesh(SPHL,std(0xc8f070),[.08,.08,.08],[.18,.75,.1]));return g};
B.palm=o=>{const g=new THREE.Group(),tr=std(0x9a7a50);for(let k=0;k<6;k++)g.add(mesh(CYL,tr,[.05-.004*k,.15,.05-.004*k],[k*.02,.075+k*.14,0],[0,0,-.08]));const lf=windify(std(0x3fa83a,{side:THREE.DoubleSide}),.1,.9);for(let k=0;k<6;k++){const a=k/6*6.283;g.add(mesh(SPHL,lf,[.32,.025,.08],[.12+Math.cos(a)*.25,.92,Math.sin(a)*.25],[0,-a,-.35]))}g.add(mesh(SPHL,std(0x6a4a2a),[.05,.05,.05],[.12,.86,.05]));return g};
B.tiki=o=>{const g=new THREE.Group(),m=std(0x8a5a32,{roughness:.9});g.add(mesh(CYL,m,[.14,.7,.14],[0,.35,0]));g.add(mesh(BOX,std(0x2a1a10),[.16,.04,.02],[0,.5,.14]));g.add(mesh(BOX,std(0xf2e2a0),[.05,.05,.02],[-.05,.58,.14]));g.add(mesh(BOX,std(0xf2e2a0),[.05,.05,.02],[.05,.58,.14]));return g};
B.cactus=o=>{const g=new THREE.Group(),m=std(0x3f8a3a,{roughness:.7});g.add(mesh(new THREE.CapsuleGeometry(.08,.5,4,10),m,[1,1,1],[0,.33,0]));g.add(mesh(new THREE.CapsuleGeometry(.05,.18,4,8),m,[1,1,1],[.13,.38,0],[0,0,-.9]));g.add(mesh(new THREE.CapsuleGeometry(.05,.14,4,8),m,[1,1,1],[-.12,.3,0],[0,0,.9]));g.add(mesh(SPHL,std(0xff6fa0),[.04,.04,.04],[0,.66,0]));return g};
B.lollipop=o=>{const g=new THREE.Group();g.add(mesh(CYL,std(0xffffff),[.02,.6,.02],[0,.3,0]));const cs=[0xff5fb0,0x7fd3ff,0xffe066,0x8bff4a][(o.i+o.j)%4];g.add(mesh(CYL,std(cs,{roughness:.2}),[.2,.05,.2],[0,.72,0],[Math.PI/2,0,0]));g.add(mesh(new THREE.TorusGeometry(.12,.02,6,20),std(0xffffff),[1,1,1],[0,.72,.03]));return g};
B.candycane=o=>{const g=new THREE.Group();for(let k=0;k<8;k++)g.add(mesh(CYL,std(k%2?0xffffff:0xe02a3a,{roughness:.3}),[.04,.08,.04],[0,.04+k*.08,0]));g.add(mesh(new THREE.TorusGeometry(.1,.04,8,16,Math.PI),std(0xe02a3a,{roughness:.3}),[1,1,1],[.1,.66,0]));return g};
B.gumdrop=o=>{const g=new THREE.Group();[[0,0,0xff5f7a],[.16,.08,0x8bff4a],[-.12,.12,0xffd23a]].forEach(([x,z,c])=>g.add(mesh(new THREE.SphereGeometry(.12,14,8,0,6.283,0,1.6),new THREE.MeshPhysicalMaterial({color:c,roughness:.25,transmission:.2,clearcoat:1}),[1,1.1,1],[x,0,z])));return g};
B.coral=o=>{const g=new THREE.Group(),c=[0xff5a6a,0xb06bff,0xffd23a][(o.i*3+o.j)%3],m=std(c,{roughness:.6,emissive:c,emissiveIntensity:.15});for(let k=0;k<6;k++)g.add(mesh(new THREE.CapsuleGeometry(.03,.2+(k%3)*.08,4,6),m,[1,1,1],[Math.cos(k)*.1,.15,Math.sin(k)*.1],[Math.sin(k)*.5,0,Math.cos(k)*.5]));return g};
B.seaweed=o=>{const g=new THREE.Group(),m=windify(std(0x2f8a4a,{side:THREE.DoubleSide}),.15,.9);for(let k=0;k<5;k++)g.add(mesh(new THREE.PlaneGeometry(.06,.8),m,[1,1,1],[Math.cos(k*1.7)*.12,.4,Math.sin(k*1.7)*.12],[0,k,0]));return g};
B.snowman=o=>{const g=new THREE.Group(),m=std(0xf6fbff,{roughness:.6});g.add(mesh(SPH,m,[.22,.2,.22],[0,.2,0]));g.add(mesh(SPH,m,[.16,.15,.16],[0,.5,0]));g.add(mesh(SPH,m,[.11,.11,.11],[0,.72,0]));g.add(mesh(new THREE.ConeGeometry(.025,.12,6),std(0xff8a2a),[1,1,1],[0,.72,.14],[Math.PI/2,0,0]));g.add(mesh(CYL,std(0x222222),[.1,.12,.1],[0,.86,0]));return g};
B.pumpkin=o=>{const g=new THREE.Group();g.add(mesh(SPH,std(0xf08a1a,{roughness:.6}),[.2,.15,.2],[0,.15,0]));g.add(mesh(CYL,std(0x3a6a2a),[.02,.08,.02],[0,.32,0]));return g};
B.hay=o=>{const g=new THREE.Group();g.add(mesh(CYL,std(0xe6c35a,{roughness:1}),[.25,.4,.25],[0,.25,0],[0,0,Math.PI/2]));return g};
B.gift=o=>{const g=new THREE.Group(),c=[0xe02a3a,0x3a9a2a,0x2f55c8][(o.i+o.j)%3];g.add(mesh(BOX,std(c),[.3,.25,.3],[0,.125,0]));g.add(mesh(BOX,std(0xffe066),[.32,.26,.05],[0,.13,0]));g.add(mesh(BOX,std(0xffe066),[.05,.26,.32],[0,.13,0]));return g};
// ---------- v5 multiplayer: remote fauna ----------
const remote=new Map();
function remoteFrame(t){const NM=window.NetMP;const want=NM?NM.visiblePeers():[];const ids=new Set(want.map(p=>p.id));
 for(const[id,e]of remote)if(!ids.has(id)){scene.remove(e.f);remote.delete(id)}
 for(const p of want){let e=remote.get(p.id);const k=JSON.stringify(p.genes)+(p.level>=20?'g':'');if(!e||e.k!==k){if(e)scene.remove(e.f);const f=buildFauna({...p.genes,_lv:p.level||1});scene.add(f);e={f,k,pos:W2(p.i,p.j)};remote.set(p.id,e)}
  const tgt=W2(p.i,p.j),mv=tgt.clone().sub(e.pos);e.pos.lerp(tgt,.12);e.f.position.copy(e.pos);if(mv.lengthSq()>1e-4){const yaw=Math.atan2(mv.x,mv.z);let d=yaw-e.f.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));e.f.rotation.y+=d*.2}
  animFauna(e.f,t,{walk:mv.lengthSq()>4e-4,zap:0,happy:false,sleep:!!p.sleep,trick:p.trick||null})}}
function remoteOverlay(proj){for(const[id,e]of remote){const p=window.NetMP&&NetMP.peers.get(id);if(!p)continue;const[x,y]=proj(e.f.position.clone().add(new THREE.Vector3(0,1.15,0)));
  ctx2.font='bold 13px "Trebuchet MS",sans-serif';const nm=p.name+' & '+p.fname;const w=ctx2.measureText(nm).width+12;ctx2.fillStyle='rgba(23,60,15,.85)';ctx2.beginPath();ctx2.roundRect(x-w/2,y-9,w,18,9);ctx2.fill();ctx2.fillStyle='#bfff8a';ctx2.fillText(nm,x,y+4);
  if(p.say&&now()-p.say.at<6000){ctx2.font='14px "Trebuchet MS",sans-serif';const tx=p.say.text,tw=Math.min(220,ctx2.measureText(tx).width)+20,by=y-46;ctx2.fillStyle='#fff';ctx2.strokeStyle='#3ea318';ctx2.lineWidth=2;ctx2.beginPath();ctx2.roundRect(x-tw/2,by,tw,30,12);ctx2.fill();ctx2.stroke();ctx2.beginPath();ctx2.moveTo(x-6,by+30);ctx2.lineTo(x,by+38);ctx2.lineTo(x+6,by+30);ctx2.fill();ctx2.fillStyle='#4cb82b';ctx2.font='bold 10px sans-serif';ctx2.fillText(p.name,x,by+10);ctx2.fillStyle='#222';ctx2.font='13px "Trebuchet MS",sans-serif';ctx2.fillText(tx.length>34?tx.slice(0,33)+'…':tx,x,by+24)}}}

// ---------- particles ----------
const PMAX=900,pPos=new Float32Array(PMAX*3),pCol=new Float32Array(PMAX*3),pSz=new Float32Array(PMAX),pA=new Float32Array(PMAX),pv=[];
const pGeo=new THREE.BufferGeometry();pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('color',new THREE.BufferAttribute(pCol,3));pGeo.setAttribute('size',new THREE.BufferAttribute(pSz,1));pGeo.setAttribute('alpha',new THREE.BufferAttribute(pA,1));
const pMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{uPR:{value:1}},
 vertexShader:`attribute float size,alpha;attribute vec3 color;varying vec3 vC;varying float vA;uniform float uPR;void main(){vC=color;vA=alpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=size*uPR*(300./-mv.z);gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,0.,d);gl_FragColor=vec4(vC*(1.5+a),a*vA);}`});
const pts=new THREE.Points(pGeo,pMat);pts.frustumCulled=false;scene.add(pts);
function spawn(p){if(pv.length<PMAX)pv.push({life:1,decay:.02,g:-2,v:new THREE.Vector3(),size:.12,col:new THREE.Color(1,1,1),...p})}
function burstW(pos,n,col,spd=1.5,o={}){const c=new THREE.Color(col);for(let k=0;k<n;k++){const v=new THREE.Vector3(Math.random()-.5,Math.random()*.8+.4,Math.random()-.5).normalize().multiplyScalar(spd*(.4+Math.random()));spawn({p:pos.clone(),v,col:c,decay:.012+Math.random()*.02,size:.1+Math.random()*.12,...o})}}
// weather: separate loop pool
const WN=QP.weather,wPos=new Float32Array(WN*3),wCol=new Float32Array(WN*3),wSz=new Float32Array(WN),wA=new Float32Array(WN),wGeo=new THREE.BufferGeometry();
wGeo.setAttribute('position',new THREE.BufferAttribute(wPos,3));wGeo.setAttribute('color',new THREE.BufferAttribute(wCol,3));wGeo.setAttribute('size',new THREE.BufferAttribute(wSz,1));wGeo.setAttribute('alpha',new THREE.BufferAttribute(wA,1));
const wMatAdd=pMat.clone(),wMatN=pMat.clone();wMatN.blending=THREE.NormalBlending;wMatN.fragmentShader=`varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);gl_FragColor=vec4(vC,smoothstep(.5,.35,d)*vA);}`;
const wPts=new THREE.Points(wGeo,wMatAdd);wPts.frustumCulled=false;scene.add(wPts);let wKind=null;const wv=[];
function setWeather(k){wKind=k;wPts.visible=!!k;wPts.material=(k==='snow'||k==='leaf'||k==='bubble'||k==='dust')?wMatN:wMatAdd;wv.length=0;for(let i=0;i<WN;i++)wv.push(newW(true))}
function newW(init){const R2=N0*.75;const o={x:(Math.random()-.5)*R2*2,y:init?Math.random()*5:5,z:(Math.random()-.5)*R2*2,ph:Math.random()*6};
 if(wKind==='bubble'||wKind==='ember'||wKind==='firefly'){o.y=init?Math.random()*3:0}return o}

// ---------- lightning (pool of glowing segments) ----------
const segG=new THREE.BoxGeometry(1,1,1);segG.translate(0,0,.5);const SEGS=[];const segM=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}),segO=new THREE.MeshBasicMaterial({color:0x8bff4a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false});
const boltG=new THREE.Group();scene.add(boltG);for(let k=0;k<30;k++){const c=new THREE.Mesh(segG,segM),o=new THREE.Mesh(segG,segO);boltG.add(c,o);SEGS.push([c,o])}
let boltFlick=0;function bolt(a,b,amt,col){if(!a){boltG.visible=false;return}boltG.visible=true;segO.color.set(col);segO.opacity=.45*amt;segM.opacity=Math.min(1,amt*1.4);
 let si=0;const put=(p,q,w)=>{if(si>=SEGS.length)return;const[c,o]=SEGS[si++];for(const m of[c,o]){m.visible=true;m.position.copy(p);m.lookAt(q);const L=p.distanceTo(q);m.scale.set(w*(m===o?4:1),w*(m===o?4:1),L)}};
 const path=(p,q,n,jit,w,branch)=>{let prev=p.clone();for(let k=1;k<=n;k++){const u=k/n;const pt=p.clone().lerp(q,u);if(k<n)pt.add(new THREE.Vector3((Math.random()-.5)*jit,(Math.random()-.5)*jit,(Math.random()-.5)*jit));put(prev,pt,w);
  if(branch&&k<n-1&&Math.random()<.35){const e=pt.clone().add(new THREE.Vector3((Math.random()-.5)*.5,(Math.random()-.2)*.4,(Math.random()-.5)*.5));path(pt,e,3,jit*.6,w*.6,false)}prev=pt}};
 if(++boltFlick%2===0||!boltG.userData.ok){path(a,b,9,.16,.018,true);for(;si<SEGS.length;si++)SEGS[si].forEach(m=>m.visible=false);boltG.userData.ok=1}}
// ---------- scene state ----------
const AOG=new THREE.CircleGeometry(.5,24),AOM=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,4,32,32,32);gr.addColorStop(0,'rgba(20,30,10,.45)');gr.addColorStop(1,'rgba(20,30,10,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);return new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false})})();
const objMap=new Map();let fauna=null,faunaKey='',beam=null,ring=null,target=null,lightsPool=[];
const clickRingG=new THREE.RingGeometry(.36,.44,32),clickRingM=new THREE.MeshStandardMaterial({color:0x000000,emissive:0x8bff4a,emissiveIntensity:2.5,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false});
for(let k=0;k<(Q==='low'?2:5);k++){const l=new THREE.PointLight(0xffaa55,0,3.5,1.6);scene.add(l);lightsPool.push(l)}
const faunaLight=new THREE.PointLight(0xfff0c0,0,3,1.5);scene.add(faunaLight);
{const bm=new THREE.MeshBasicMaterial({color:0xc8ff7a,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});beam=new THREE.Group();const core=mesh(new THREE.CylinderGeometry(.02,.02,1,6,1,true),bm);core.geometry.translate(0,.5,0);core.geometry.rotateX(Math.PI/2);beam.add(core);
 const outer=mesh(new THREE.CylinderGeometry(.06,.06,1,8,1,true),new THREE.MeshBasicMaterial({color:0x4cff2a,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));outer.geometry.translate(0,.5,0);outer.geometry.rotateX(Math.PI/2);beam.add(outer);beam.visible=false;scene.add(beam)}
target=mesh(new THREE.RingGeometry(.22,.28,32),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false}),[1,1,1],[0,.02,0],[-Math.PI/2,0,0]);scene.add(target);
const hoverTile=mesh(new THREE.PlaneGeometry(.96,.96),new THREE.MeshBasicMaterial({color:0xffff66,transparent:true,opacity:.35,depthWrite:false}),[1,1,1],[0,.015,0],[-Math.PI/2,0,0]);scene.add(hoverTile);

function objVisualState(o){if(o.type==='treetree')o.count=S.home.treat.count;if(o.type==='totem')o.ready=now()-S.home.totem.last>=3e5;if(o.type==='nest')o.egg=!!S.home.nest.egg;
 if(o.type==='project'){const p=S.projects[S.zone];if(p){o.prog=p.prog;o.need=p.need}}if(o.type==='goal')o.alert=GOALS.some(g=>g.zone===S.zone&&!S.done[g.id]&&g.check(S))}
function syncObjs(){const s=zs(S.zone),seen=new Set();
 for(const o of s.objs){seen.add(o.id);let e=objMap.get(o.id);const key=o.type+(o.item||'');
  if(!e||e.key!==key){if(e)scene.remove(e.g);const g=shadowify((B[o.type]||B.rock)(o));g.rotation.y+=(o.type==='gate'?0:(hsh(o.i,o.j,2)-.5)*.6);
   const hit=mesh(BOX,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false}),[.8,1.1,.8],[0,.55,0]);hit.userData.obj=o;g.add(hit);if(Q!=='low'&&o.type!=='gate'){const ao=new THREE.Mesh(AOG,AOM);ao.rotation.x=-Math.PI/2;ao.position.y=.012;ao.renderOrder=-1;g.add(ao)}
   if(isClickable(o)){const r=new THREE.Mesh(clickRingG,clickRingM);r.rotation.x=-Math.PI/2;r.position.y=.02;r.visible=false;g.add(r);g.userData.ring=r;const sk=Object.entries(SKILLS).find(([k,v])=>v.node===o.type);if(sk){r.material=clickRingM.clone();g.userData.nodeSkill=sk[0]}}
   g.position.copy(W2(o.i,o.j));scene.add(g);e={g,key,o,hit};objMap.set(o.id,e)}
  e.o=o;e.hit.userData.obj=o;const tp=W2(o.i,o.j);e.g.position.lerp(tp,.12)}
 for(const[id,e]of objMap)if(!seen.has(id)){scene.remove(e.g);objMap.delete(id)}}
function clearObjs(){for(const[,e]of objMap)scene.remove(e.g);objMap.clear()}

// ---------- camera ----------
const camS={yaw:Math.PI/4,pitch:.92,dist:null,t:new THREE.Vector3(),drag:null,intro:1};
let W=1,H=1;function size(){const r=stage.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);R.setSize(W,H,false);glc.style.width=W+'px';glc.style.height=H+'px';camera.aspect=W/H;camera.updateProjectionMatrix();if(composer){composer.setPixelRatio(PR);composer.setSize(W,H)}if(finalPass)finalPass.uniforms.uRes.value.set(W*PR,H*PR);pMat.uniforms.uPR.value=PR*H/800;wMatAdd.uniforms.uPR.value=wMatN.uniforms.uPR.value=PR*H/800}
addEventListener('resize',size);size();
const fpos=new THREE.Vector3();
function updCamera(dt,t){const n=N0||9,asp=W/H,fov=camera.fov*Math.PI/180;
 const fit=(n*.55)/Math.tan(fov/2)/Math.min(1.25,Math.max(.55,asp));let dist=fit/(cam.zoom||1);const portrait=asp<.8;if(portrait)dist=Math.min(dist,n*2.1/(cam.zoom||1));
 const follow=portrait?1:clamp((cam.zoom-1)/.8,0,1);const tgt=new THREE.Vector3().lerpVectors(new THREE.Vector3(0,0,0),fpos,follow);tgt.y=.15;
 if(camS.dist===null){camS.dist=dist;camS.t.copy(tgt)}camS.dist+=(dist-camS.dist)*.08;camS.t.lerp(tgt,.06);
 let yaw=camS.yaw,pitch=camS.pitch,d=camS.dist;if(titleOn||!fa()){yaw+=t*.12;d*=1.15;pitch=.55}
 const k=Math.cos(pitch)*d;camera.position.set(camS.t.x+Math.sin(yaw)*k,camS.t.y+Math.sin(pitch)*d,camS.t.z+Math.cos(yaw)*k);
 if(rt.shake>.3){camera.position.x+=(Math.random()-.5)*rt.shake*.01;camera.position.y+=(Math.random()-.5)*rt.shake*.01}camera.lookAt(camS.t)}
// drag-rotate (single pointer)
let dragS=null;cv.addEventListener('pointerdown',e=>{dragS={x:e.clientX,y:e.clientY,yaw:camS.yaw,pitch:camS.pitch,id:e.pointerId,on:false}});
cv.addEventListener('pointermove',e=>{if(!dragS||dragS.id!==e.pointerId)return;if(document.querySelectorAll?false:false);const dx=e.clientX-dragS.x,dy=e.clientY-dragS.y;if(!dragS.on&&Math.hypot(dx,dy)>16)dragS.on=true;if(dragS.on){camS.yaw=dragS.yaw-dx*.008;camS.pitch=clamp(dragS.pitch+dy*.004,.45,1.15)}});
addEventListener('pointerup',()=>dragS=null);cv.addEventListener('pointercancel',()=>dragS=null);
// ---------- picking (overrides 2D) ----------
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function setRay(px,py){ndc.set(px/W*2-1,-(py/H)*2+1);ray.setFromCamera(ndc,camera)}
G.screenToTile=(px,py)=>{setRay(px,py);const p=new THREE.Vector3();if(!ray.ray.intersectPlane(plane,p))return[-1,-1];return[Math.round(p.x+C0),Math.round(p.z+C0)]};
G.hitObj=(px,py)=>{setRay(px,py);const hits=[];for(const[,e]of objMap)if(isClickable(e.o))hits.push(e.hit);const r=ray.intersectObjects(hits,false);return r.length?r[0].object.userData.obj:null};
const proj=v=>{const p=v.clone().project(camera);return[(p.x*.5+.5)*W,(-p.y*.5+.5)*H,p.z]};
// test helper: screen position of an object
G.GLscreen=o=>{const r=cv.getBoundingClientRect(),[x,y]=proj(W2(o.i,o.j).add(new THREE.Vector3(0,.3,0)));return[r.left+x,r.top+y]};

// ---------- overlay (2D canvas on top for crisp text) ----------
const ctx2=cv.getContext('2d');const floats=[];
function floatW(pos,text,col){floats.push({p:pos.clone(),text,col,life:1})}
const mePosW=()=>fpos.clone();const objW=o=>W2(o.i,o.j);
function vib(p){try{navigator.vibrate&&navigator.vibrate(p)}catch(_){}}
const origEmit=G.emit;G.emit=function(ev,d={}){try{origEmit(ev,d)}catch(_){}
 const me=mePosW().add(new THREE.Vector3(0,.5,0));
 if(ev==='hit'){rt.zapT=now();try{Sound.noise(.25,.12,2400);setTimeout(()=>Sound.noise(.12,.08,3200),90)}catch(_){}burstW(objW(d).add(new THREE.Vector3(0,.35,0)),14,0xb8ff5a,1.6);rt.shake=4;vib(12)}
 if(ev==='pop'){const p=objW(d.o).add(new THREE.Vector3(0,.3,0));burstW(p,40,d.o.type==='tox'?0xc070ff:0x9be15a,2.4);burstW(p,18,0xfff6a0,1.4,{size:.07});floatW(p.clone().add(new THREE.Vector3(0,.5,0)),'+'+d.lux+' Lux','#ffe25a');vib([10,30,20])}
 if(ev==='level'){for(const c of[0xffe25a,0x77aadd,0xff8fb1,0x88ff88])burstW(me,20,c,2.2,{decay:.01});floatW(me.clone().add(new THREE.Vector3(0,.6,0)),'LEVEL UP!','#fff');vib([30,40,60])}
 if(ev==='egg'){floatW(me.clone().add(new THREE.Vector3(0,.6,0)),'🥚 Egg!','#fff');burstW(me,16,0xfff2c0,1.2)}
 if(ev==='skill'&&d.o){const p=objW(d.o).add(new THREE.Vector3(0,.5,0));burstW(p,24,0xfff9b0,1.6);if(d.l)floatW(p.clone().add(new THREE.Vector3(0,.4,0)),'+'+d.l+' Lux','#ffe25a');vib(15)}
 if(ev==='eat'){burstW(me,d.fav?16:7,0xff6f9f,.8,{g:.6,decay:.012,size:.16})}
 if(ev==='hurt'){floatW(me.clone().add(new THREE.Vector3(0,.5,0)),'-2 ♥','#ff7a8a');vib(40)}
 if(ev==='goal'){burstW(me,30,0xffe25a,2)}};

// ---------- frame ----------
let lastT=performance.now(),fpsAcc=0,fpsN=0,fpsT=0,curZone=null;const clock0=performance.now();let titleOn=false;
const nightA=()=>{if(QS.has('night'))return 1;if(QS.has('day'))return 0;const h=new Date().getHours()+new Date().getMinutes()/60;if(h>=20.5||h<5)return 1;if(h>=18.5)return(h-18.5)/2;if(h<7)return(7-h)/2;return 0};
const moon=new THREE.Group();{const mc=new THREE.Mesh(new THREE.SphereGeometry(3,24,16),new THREE.MeshBasicMaterial({color:0xfff6d0,fog:false}));const cut=new THREE.Mesh(new THREE.SphereGeometry(2.8,24,16),new THREE.MeshBasicMaterial({color:0x0a1030,fog:false}));cut.position.set(1.4,.6,.6);moon.add(mc,cut);moon.position.set(-40,38,-60);moon.visible=false;scene.add(moon)}
function applyEnv(z,nt){const pal=(window.ZPAL&&ZPAL[z.id])||BIOMES[z.biome],dun=z.biome==='dungeon';const el=(dun?-4:(1-nt)*38-4)*Math.PI/180,az=.9;
 const sd=new THREE.Vector3(Math.cos(el)*Math.cos(az),Math.sin(el),Math.cos(el)*Math.sin(az));su.sunPosition.value.copy(sd);sky.visible=!dun;su.uTop.value.set(pal[4]).lerp(new THREE.Color(0x050a1e),nt);su.uHor.value.set(pal[5]).lerp(new THREE.Color(0x1a2448),nt);su.uSunC.value.set(nt>.5?0x8899cc:0xfff0c8);if(!dun&&!['candy','scorch','mesa','swamp'].includes(z.biome)){su.uTop.value.lerp(new THREE.Color(0x2c8ce8),(1-nt)*.5);su.uHor.value.lerp(new THREE.Color(0xc4ecff),(1-nt)*.45)}
 const dir=nt>.5||dun?new THREE.Vector3(-.4,.8,.3):sd.clone().setY(Math.max(.25,sd.y));sun.position.copy(dir.multiplyScalar(25));
 sun.color.set(nt>.5||dun?0x9fb4ff:0xfff1d8);sun.intensity=dun?.35:THREE.MathUtils.lerp(1.25,.4,nt);
 hemi.color.set(pal[4]).lerp(new THREE.Color(0x203060),nt);hemi.groundColor.set(pal[1]);hemi.intensity=dun?.35:THREE.MathUtils.lerp(2.3,.7,nt);hemi.color.set(0xffffff).lerp(new THREE.Color(0x203060),nt);hemi.groundColor.set(0xd8d0c0);
 const fogC=dun?new THREE.Color(0x14111c):new THREE.Color(pal[5]).lerp(new THREE.Color(pal[4]),.15).lerp(new THREE.Color(0x0a1028),nt*.9);
 scene.background=dun?fogC:new THREE.Color(pal[5]).lerp(new THREE.Color(pal[4]),.15).lerp(new THREE.Color(0x0a1028),nt*.9);scene.fog=new THREE.Fog(fogC,(camS.dist||20)*1.6,(camS.dist||20)*4);
 if(!dun&&!(window.ZPAL&&ZPAL[z.id])&&!['candy','scorch','mesa','swamp'].includes(z.biome)){const bt=new THREE.Color(0xa9dcff).lerp(new THREE.Color(pal[5]),.35).lerp(new THREE.Color(0x0a1028),nt*.9);scene.background=bt;scene.fog.color.copy(bt)}
 stars.material.opacity=dun?0:clamp((nt-.3)*1.4,0,1);moon.visible=nt>.6&&!dun;R.toneMappingExposure=dun?1.1:THREE.MathUtils.lerp(.95,1.15,nt);
 if(bloom)bloom.strength=dun||nt>.5?.6:.3;
 setWeather({sea:'bubble',mesa:'dust',candy:'firefly',arctic:'snow',swamp:'bubble',forest:'leaf',scorch:'ember',dungeon:'dust'}[z.biome]||(nt>.5?'firefly':null))}
function frame(){const tn=performance.now(),dt=Math.min(.1,(tn-lastT)/1000);lastT=tn;const t=(tn-clock0)/1000;U.time.value=t;
 const f=fa();if(!f)return;const z=Z(S.zone),nt=z.biome==='dungeon'?0:z.biome==='night'?1:nightA();
 if(S.zone!==curZone){curZone=S.zone;clearObjs();buildIsland(S.zone);camS.dist=null;applyEnv(z,nt);pv.length=0}
 if(((t*10)|0)%50===0)applyEnvLite(z,nt);
 syncObjs();
 // fauna
 const lvB=f.level>=20?4:f.level>=15?3:f.level>=10?2:f.level>=5?1:0,key=JSON.stringify(f.genes)+lvB;if(key!==faunaKey){if(fauna)scene.remove(fauna);fauna=buildFauna({...f.genes,_lv:f.level});scene.add(fauna);faunaKey=key}
 const want=W2(rt.pos.i,rt.pos.j);const mv=want.clone().sub(fpos);fpos.lerp(want,.5);fauna.position.copy(fpos);
 if(mv.lengthSq()>1e-6&&rt.tgt){const yaw=Math.atan2(mv.x,mv.z);let d=yaw-fauna.rotation.y;d=Math.atan2(Math.sin(d),Math.cos(d));fauna.rotation.y+=d*.18}
 const zapA=clamp(1-(now()-(rt.zapT||0))/260,0,1);
 if(zapA>0&&rt.tgtObj&&!rt.tgt){const tp=W2(rt.tgtObj.i,rt.tgtObj.j);const d=tp.clone().sub(fpos);const yaw=Math.atan2(d.x,d.z);let dd=yaw-fauna.rotation.y;dd=Math.atan2(Math.sin(dd),Math.cos(dd));fauna.rotation.y+=dd*.3}
 remoteFrame(t);animFauna(fauna,t,{walk:!!rt.tgt,zap:zapA,happy:now()-(rt.happyT||0)<1400,sleep:rt.sleep});
 if(rt.sleep&&Math.random()<.02)spawn({p:fpos.clone().add(new THREE.Vector3(.1,.7,0)),v:new THREE.Vector3(.1,.4,0),g:0,col:new THREE.Color(0xaad4ff),size:.14,decay:.008});
 // lightning beam from necklace gem
 const gr=fauna.userData.rig;
 if(zapA>0&&rt.tgtObj){Sound.zapHold(true);const a=new THREE.Vector3();gr.gem.getWorldPosition(a);const b=W2(rt.tgtObj.i,rt.tgtObj.j).add(new THREE.Vector3(0,.3,0));bolt(a,b,zapA,gr.gemCol);
  if(Math.random()<.7)spawn({p:b.clone(),v:new THREE.Vector3((Math.random()-.5)*2,Math.random()*1.5,(Math.random()-.5)*2),col:new THREE.Color(0xeaffb0),size:.08,decay:.06,g:-4})}else bolt(null);
 // target ring
 target.visible=!!(rt.tgt&&!rt.onArrive);if(target.visible){target.position.copy(W2(...rt.tgt)).setY(.03);target.scale.setScalar(1+Math.sin(t*8)*.1)}
 hoverTile.visible=!!(rt.decor&&rt.hover);if(hoverTile.visible)hoverTile.position.copy(W2(...rt.hover)).setY(.02);
 // objects animation & lights
 let li=0;const lp=[];
 for(const[,e]of objMap){const o=e.o,g=e.g,u=g.userData;objVisualState(o);
  if(u.ring){const near=Math.hypot(o.i-rt.pos.i,o.j-rt.pos.j)<2.2,hov=rt.hover&&rt.hover[0]===o.i&&rt.hover[1]===o.j;u.ring.visible=near||hov;if(u.ring.visible){u.ring.scale.setScalar(1+Math.sin(t*4)*.05);if(u.nodeSkill)u.ring.material.emissive.set(o.ready&&SPECIES[f.genes.species].skill===u.nodeSkill?0x8bff4a:0xff3a2a)}}
  if(u.pulse)u.pulse.emissiveIntensity=1.6+Math.sin(t*3+o.i)*.8;
  if(u.blob){const b0=u.b0||(u.b0=u.blob.scale.clone());const hp=o.type==='poll'?.6+.4*Math.min(1,(o.hp||1)/3):1;u.blob.scale.set(b0.x*hp*(1+Math.sin(t*4+o.j)*.06),b0.y*hp*(1-Math.sin(t*4+o.j)*.08),b0.z*hp);if(o.type==='tox'){g.position.y=Math.abs(Math.sin(t*3+o.i))*.05;const d=fpos.clone().sub(g.position);g.rotation.y=Math.atan2(d.x,d.z)}}
  if(u.spin){u.spin.rotation.y=t*1.5;u.spin.position.y=.9+Math.sin(t*2)*.05;(u.spin.material||u.spin.children[0].material).emissiveIntensity=o.alert?3.5+Math.sin(t*8):2}
  if(u.flame)u.flame.scale.set(1+Math.sin(t*20)*.1,1+Math.sin(t*13)*.2,1);
  if(u.egg)u.egg.visible=!!o.egg;if(u.treats)u.treats.forEach((m,k)=>m.visible=k<(o.count||0));if(u.eyes)u.eyes.emissiveIntensity=o.ready?3:.2;
  if(u.light)lp.push([g.position,u.light,o.type])}
 lp.sort((a,b)=>a[0].distanceToSquared(fpos)-b[0].distanceToSquared(fpos));
 const dark=z.biome==='dungeon'?1:nt;lightsPool.forEach((l,k)=>{const q=lp[k];if(q&&dark>.15){l.position.copy(q[0]).setY(.9);l.color.set(q[1]);l.intensity=(q[2]==='torch'?3:2)*dark*(1+Math.sin(t*15+k)*.08)}else l.intensity=0});
 faunaLight.position.copy(fpos).setY(1);faunaLight.intensity=dark>.3?1.8*dark:0;
 // particles
 let n=0;for(let i=pv.length-1;i>=0;i--){const p=pv[i];p.v.y+=p.g*dt;p.p.addScaledVector(p.v,dt);p.life-=p.decay*60*dt;if(p.life<=0){pv.splice(i,1);continue}}
 for(const p of pv){pPos.set([p.p.x,p.p.y,p.p.z],n*3);pCol.set([p.col.r,p.col.g,p.col.b],n*3);pSz[n]=p.size;pA[n]=Math.min(1,p.life*1.5);n++}
 pGeo.setDrawRange(0,n);for(const k of['position','color','size','alpha'])pGeo.attributes[k].needsUpdate=true;
 // weather
 if(wKind){const wc=new THREE.Color({snow:0xffffff,bubble:0xbfe8c0,leaf:0xd6a23a,ember:0xff7a2a,dust:0xb8aacc,firefly:0xd8ff6a}[wKind]);for(let i=0;i<WN;i++){const w=wv[i];w.ph+=dt;
  if(wKind==='snow'){w.y-=dt*.5;w.x+=Math.sin(w.ph)*dt*.2}else if(wKind==='leaf'){w.y-=dt*.4;w.x+=Math.sin(w.ph*1.5)*dt*.5;w.z+=dt*.15}else if(wKind==='bubble'){w.y+=dt*.25}else if(wKind==='ember'){w.y+=dt*.5;w.x+=Math.sin(w.ph*3)*dt*.2}else if(wKind==='dust'){w.y+=Math.sin(w.ph)*dt*.05;w.x+=dt*.05}else{w.x+=Math.sin(w.ph*.7)*dt*.3;w.y+=Math.sin(w.ph*1.1)*dt*.15;w.z+=Math.cos(w.ph*.6)*dt*.3}
  if(w.y<-.5||w.y>5||Math.abs(w.x)>N0||Math.abs(w.z)>N0)Object.assign(w,newW(false));wPos.set([w.x,w.y,w.z],i*3);wCol.set([wc.r,wc.g,wc.b],i*3);
  wSz[i]=wKind==='snow'?.09:wKind==='firefly'?.12+Math.sin(w.ph*4)*.04:wKind==='bubble'?.08:.07;wA[i]=wKind==='firefly'?.5+Math.sin(w.ph*3)*.5:wKind==='bubble'?.5:.85}
  for(const k of['position','color','size','alpha'])wGeo.attributes[k].needsUpdate=true}
 if(QS.has('sheet')){sheet(t);for(const[,e]of objMap)e.g.visible=false;cam.zoom=1.9}
 updCamera(dt,t);
 // transition
 let fade=0;if(rt.trans){const p=(now()-rt.trans.t0)/900;if(p>=.5&&!rt.trans.fired){rt.trans.fired=1;rt.trans.fn()}fade=p<.5?p*2:Math.max(0,(1-p)*2);if(p>=1)rt.trans=null}
 if(finalPass){finalPass.uniforms.uTime.value=t%10;finalPass.uniforms.uFade.value=fade;composer.render(dt)}else R.render(scene,camera);
 overlay(t,fade);
 // adaptive resolution
 fpsAcc+=dt;fpsN++;if(fpsAcc>2.5){const fps=fpsN/fpsAcc;G.GLfps=fps;fpsAcc=0;fpsN=0;const tgt=isPhone?30:50;if(fps<tgt&&PR>.75){PR=Math.max(.75,PR-.2);R.setPixelRatio(PR);size()}else if(fps>tgt+15&&PR<Math.min(devicePixelRatio||1,QP.pr)){PR=Math.min(QP.pr,PR+.1);R.setPixelRatio(PR);size()}}}
let sheetG=null;function sheet(t){if(!sheetG){sheetG=new THREE.Group();const ks=Object.keys(SPECIES),cols=Object.keys(COLORS);ks.forEach((k,i)=>{const f=buildFauna({species:k,color:cols[i%cols.length],pattern:PATTERNS[i%PATTERNS.length],tail:TAILS[i%3],eyes:EYES[i%3]});f.position.set((i%6)-2.5,0,Math.floor(i/6)*1.3-.6);f.rotation.y=.6;f.scale.setScalar(1.05);sheetG.add(f)});scene.add(sheetG);fauna.visible=false;clearObjs();island.visible=false;camS.yaw=Math.PI/4*0+0.0001;camS.pitch=.5}
 sheetG.children.forEach((f,i)=>animFauna(f,t+i,{walk:i%4===1,happy:i%4===2,sleep:i%4===3,zap:0}))}
function applyEnvLite(z,nt){/* periodic day/night refresh */const k=z.id+'|'+nt.toFixed(2);if(applyEnvLite.k!==k){applyEnvLite.k=k;applyEnv(z,nt)}}
function overlay(t,fade){const D=Math.min(2,devicePixelRatio||1);if(cv.width!==Math.round(W*D)){cv.width=Math.round(W*D);cv.height=Math.round(H*D)}ctx2.setTransform(D,0,0,D,0,0);ctx2.clearRect(0,0,W,H);
 ctx2.textAlign='center';ctx2.lineJoin='round';remoteOverlay(proj);
 for(const[,e]of objMap){const o=e.o;if(o.type==='tox'){const[x,y,zz]=proj(e.g.position.clone().add(new THREE.Vector3(0,.95,0)));if(zz>1)continue;ctx2.font='bold 11px sans-serif';ctx2.fillStyle='#ff6b8b';ctx2.strokeStyle='#0008';ctx2.lineWidth=3;const s='♥'.repeat(o.hp);ctx2.strokeText(s,x,y);ctx2.fillText(s,x,y)}
  if(o.type==='goal'&&o.alert){const[x,y]=proj(e.g.position.clone().add(new THREE.Vector3(0,1.35,0)));ctx2.font='900 22px sans-serif';ctx2.fillStyle='#ffd84a';ctx2.strokeStyle='#5a3a00';ctx2.lineWidth=4;const b=Math.sin(t*6)*3;ctx2.strokeText('!',x,y+b);ctx2.fillText('!',x,y+b)}
  if(o.type==='project'&&o.need){const[x,y]=proj(e.g.position.clone().add(new THREE.Vector3(0,1.1,0)));ctx2.fillStyle='#0007';ctx2.fillRect(x-24,y-5,48,8);ctx2.fillStyle='#8f6';ctx2.fillRect(x-23,y-4,46*Math.min(1,(o.prog||0)/o.need),6)}}
 if(rt.say&&fauna&&now()-rt.say.at<5000){const[x,y]=proj(fpos.clone().add(new THREE.Vector3(0,1.45,0)));ctx2.font='bold 13px sans-serif';const w=Math.min(240,ctx2.measureText(rt.say.text).width+20);ctx2.fillStyle='#fff';ctx2.strokeStyle='#5c8a29';ctx2.lineWidth=2;ctx2.beginPath();ctx2.roundRect(x-w/2,y-30,w,26,12);ctx2.moveTo(x-6,y-4);ctx2.lineTo(x,y+4);ctx2.lineTo(x+6,y-4);ctx2.fill();ctx2.stroke();ctx2.fillStyle='#173c0f';ctx2.textAlign='center';ctx2.fillText((window.T?window.T(rt.say.text):rt.say.text),x,y-12,w-12);ctx2.textAlign='left'}
 if(rt.sleep&&fauna){const[x,y]=proj(fpos.clone().add(new THREE.Vector3(0,1.3,0)));ctx2.font='900 16px sans-serif';ctx2.fillStyle='#fff';ctx2.strokeStyle='#2a4a8a';ctx2.lineWidth=4;for(let k=0;k<3;k++){const ph=(t*.6+k/3)%1;ctx2.globalAlpha=1-ph;ctx2.strokeText('Z',x+ph*22,y-ph*30);ctx2.fillText('Z',x+ph*22,y-ph*30)}ctx2.globalAlpha=1}
 for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.life-=.012;f.p.y+=.006;if(f.life<=0){floats.splice(i,1);continue}const[x,y]=proj(f.p);ctx2.globalAlpha=Math.min(1,f.life*2);ctx2.font='900 18px "Trebuchet MS",sans-serif';ctx2.lineWidth=5;ctx2.strokeStyle='#000a';ctx2.strokeText(f.text,x,y);ctx2.fillStyle=f.col;ctx2.fillText(f.text,x,y);ctx2.globalAlpha=1}
 if(fade>0&&!finalPass){ctx2.fillStyle=`rgba(220,248,255,${fade})`;ctx2.fillRect(0,0,W,H)}
 if(fade>0){ctx2.strokeStyle=`rgba(255,255,255,${fade})`;ctx2.lineWidth=3;for(let k=0;k<5;k++){ctx2.beginPath();ctx2.arc(W/2,H/2,(k*70+t*300)%Math.max(W,H),0,7);ctx2.stroke()}}
 if(!finalPass){/* cheap vignette on low/med */const vg=ctx2.createRadialGradient(W/2,H/2,Math.min(W,H)*.35,W/2,H/2,Math.max(W,H)*.75);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#00000040');ctx2.fillStyle=vg;ctx2.fillRect(0,0,W,H)}}
// title-screen backdrop: render home island even before adoption
G.draw=frame;
G.GL={Q,sky,su,scene,setQuality(q){localStorage.setItem('fs_q',q);location.reload()},get fps(){return G.GLfps},renderer:R};
// keep rendering behind the adopt/title screens when no fauna yet
(function idle(){if(!fa()){try{const z=Z(S.zone);if(curZone!==S.zone){curZone=S.zone;zs(S.zone);buildIsland(S.zone);applyEnv(z,0);camS.dist=null}syncObjs();U.time.value=performance.now()/1000;updCamera(.016,U.time.value);composer?composer.render():R.render(scene,camera)}catch(e){console.error(e)}}requestAnimationFrame(idle)})();
// ---------- title screen & settings ----------
const title=document.getElementById('title');
if(title&&!QS.has('notitle')){titleOn=true;title.classList.remove('hidden');document.getElementById('play').onclick=()=>{Sound.init();Sound.sfx&&Sound.sfx('gate');vib(20);title.classList.add('out');titleOn=false;camS.dist=null;setTimeout(()=>title.remove(),900)}}else if(title)title.remove();
const qb=document.getElementById('gfx');if(qb){qb.textContent='⚙ '+Q[0].toUpperCase()+Q.slice(1);qb.onclick=()=>{const n={low:'med',med:'high',high:'low'}[Q];G.GL.setQuality(n)}}
const ld=document.getElementById('loading');if(ld){ld.classList.add('out');setTimeout(()=>ld.remove(),700)}
console.log('[FaunaMySphere] WebGL renderer active, quality='+Q);

// ---- v4.3 art direction: flat toon shading + thick black outlines (original Flash look) ----
const TOONG=(()=>{const d=new Uint8Array([150,150,150,255, 215,215,215,255, 255,255,255,255]);const t=new THREE.DataTexture(d,3,1,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.NearestFilter;t.needsUpdate=true;return t})();
const OUTM=new THREE.MeshBasicMaterial({color:0x111111,side:THREE.BackSide});
OUTM.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=position+normal*(0.028/max(length(modelMatrix[0].xyz),0.05));')};
const TERR=new Set();
function toonOf(m){if(!m||m.userData.toon||m.isShaderMaterial||m.isMeshBasicMaterial||m.isPointsMaterial||m.isLineBasicMaterial||m.isSpriteMaterial||m.isMeshToonMaterial)return m;
 const keepMap=m.map&&!m.normalMap;const t=new THREE.MeshToonMaterial({color:m.color?m.color.clone():0xffffff,map:keepMap?m.map:null,gradientMap:TOONG,emissive:m.emissive?m.emissive.clone():0,emissiveIntensity:m.emissiveIntensity||1,transparent:m.transparent,opacity:m.opacity,side:m.side,alphaTest:m.alphaTest,depthWrite:m.depthWrite,vertexColors:m.vertexColors});
 if(m.userData.flat)t.color.set(m.userData.flat);
 if(m.onBeforeCompile&&String(m.onBeforeCompile).includes('uTime'))t.onBeforeCompile=m.onBeforeCompile;
 t.userData.toon=1;return t}
function toonify(root){root.traverse(o=>{if(!o.isMesh||o.userData.outline)return;
 if(Array.isArray(o.material))o.material=o.material.map(toonOf);else o.material=toonOf(o.material);
 o.castShadow=false;
 if(!o.userData.ol&&!o.isInstancedMesh&&o.geometry&&o.geometry.attributes.normal&&!(o.material&&o.material.transparent)&&o.geometry.type!=='PlaneGeometry'&&o.geometry.type!=='CircleGeometry'&&o.geometry.type!=='RingGeometry'){
  o.userData.ol=1;if(Q==='low'&&!o.parent?.userData?.fauna&&o.geometry.attributes.position.count>2000)return;const ol=new THREE.Mesh(o.geometry,OUTM);ol.userData.outline=1;ol.raycast=()=>{};o.add(ol)}})}
hemi.groundColor&&0;
setInterval(()=>{try{toonify(scene)}catch(e){console.warn('toon',e)}},400);
const _ae=applyEnv;
// ---- v4.4 juice: zap progress ring, level-up ring, green path trail, bouncing drops ----
const FX=[];const fxAdd=(m,life,upd)=>{scene.add(m);FX.push({m,life,t:0,upd})};
const ringM=c=>new THREE.MeshBasicMaterial({color:c,transparent:true,side:THREE.DoubleSide,depthTest:false});
const _em2=G.emit;G.emit=function(ev,d={}){try{_em2(ev,d)}catch(_){}try{
 if(ev==='hit'&&d&&d.i!=null){if(!d.hp0)d.hp0=d.hp+(fa()&&fa().level>=10?2:1);const fr=Math.max(.02,1-d.hp/d.hp0);const p=objW(d).add(new THREE.Vector3(0,.9,0));
  const bg=new THREE.Mesh(new THREE.RingGeometry(.2,.29,32),ringM(0x1d5e10));const fg=new THREE.Mesh(new THREE.RingGeometry(.2,.29,32,1,Math.PI/2,-fr*Math.PI*2),ringM(0x7dff3a));bg.renderOrder=fg.renderOrder=9;
  const g=new THREE.Group();g.add(bg,fg);g.position.copy(p);fxAdd(g,.9,(o,k)=>{o.quaternion.copy(camera.quaternion);bg.material.opacity=fg.material.opacity=1-k*k})}
 if(ev==='level'){const r=new THREE.Mesh(new THREE.TorusGeometry(.5,.06,8,40),ringM(0xffe25a));r.rotation.x=-Math.PI/2;fxAdd(r,1.4,(o,k)=>{o.position.copy(mePosW()).add(new THREE.Vector3(0,.1+k*.8,0));o.scale.setScalar(1+k*1.8);o.material.opacity=1-k})}
 if(ev==='pop'&&d.o){const p0=objW(d.o).add(new THREE.Vector3(0,.3,0));for(let n=0;n<3;n++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,0),new THREE.MeshToonMaterial({color:[0xffe25a,0x9be15a,0xffffff][n],gradientMap:TOONG}));const vx=(Math.random()-.5)*1.4,vz=(Math.random()-.5)*1.4;
  fxAdd(m,1.6,(o,k,t)=>{const tt=Math.min(t,1.0);const h=Math.abs(Math.sin(tt*Math.PI*2.2))*.7*(1-tt);if(t<1)o.position.set(p0.x+vx*tt,p0.y+h,p0.z+vz*tt);else o.position.lerp(mePosW().add(new THREE.Vector3(0,.4,0)),.15);o.scale.setScalar(1-Math.max(0,k-.7)*3)})}}
}catch(e){console.warn(e)}};
let trailT=0;const trailG=new THREE.CircleGeometry(.07,10);
(function fxLoop(){requestAnimationFrame(fxLoop);const dt=.016;
 if(rt.tgt&&fa()&&performance.now()-trailT>110){trailT=performance.now();const m=new THREE.Mesh(trailG,ringM(0x6dff3a));m.rotation.x=-Math.PI/2;m.position.copy(mePosW()).add(new THREE.Vector3(0,.03,0));fxAdd(m,1.3,(o,k)=>{o.material.opacity=.85*(1-k)})}
 for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t+=dt;const k=f.t/f.life;if(k>=1){scene.remove(f.m);f.m.traverse(x=>{x.geometry&&x.geometry!==trailG&&x.geometry.dispose()});FX.splice(i,1);continue}f.upd(f.m,k,f.t)}})();

// ---- v4.7 Faunawear hats ----
const _bf=buildFauna;buildFauna=function(genes){const f=_bf(genes);try{const rig=f.userData.rig;const hd=rig&&(rig.head||rig.body);if(genes.hat&&hd&&window.HATS&&HATS[genes.hat]){const h=HATS[genes.hat];const g=new THREE.Group();
 const tm=c=>new THREE.MeshToonMaterial({color:c,gradientMap:TOONG});
 if(h.kind==='flower'){for(let k=0;k<5;k++){const p=new THREE.Mesh(new THREE.SphereGeometry(.07,10,8),tm(h.c));p.scale.set(1,.45,1.6);p.position.set(Math.cos(k*1.256)*.07,0,Math.sin(k*1.256)*.07);p.rotation.y=-k*1.256;g.add(p)}const st=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.12,6),tm(0x3c8a2a));st.position.y=.06;g.add(st)}
 else if(h.kind==='cap'){const c=new THREE.Mesh(new THREE.SphereGeometry(.13,14,10,0,6.283,0,1.4),tm(h.c));g.add(c);const b=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.015,16),tm(h.c2||h.c));b.position.set(0,0,.09);b.scale.set(1,1,.6);g.add(b)}
 else{const c=new THREE.Mesh(new THREE.ConeGeometry(.1,.24,14),tm(h.c));c.position.y=.1;g.add(c);const p=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),tm(0xffffff));p.position.y=.23;g.add(p)}
 const bb=new THREE.Box3().setFromObject(hd);const top=new THREE.Vector3();bb.getCenter(top);top.y=bb.max.y;hd.worldToLocal?0:0;hd.updateWorldMatrix(true,false);const inv=hd.matrixWorld.clone().invert();top.applyMatrix4(inv);g.position.copy(top);hd.add(g)}}catch(e){console.warn('hat',e)}return f};
// v4.10: green dashed move arc + NO NAV cursor (notes 20)
{const ARCN=24,ag=new THREE.BufferGeometry();ag.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ARCN*3),3));
const arc=new THREE.Line(ag,new THREE.LineDashedMaterial({color:0x3CC300,dashSize:.18,gapSize:.12,depthTest:false,transparent:true}));arc.renderOrder=999;arc.visible=false;arc.frustumCulled=false;scene.add(arc);G._arc=arc;const DM=new THREE.MeshBasicMaterial({color:0x3CC300,depthTest:false}),dots=[];for(let k=0;k<12;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.16,.05,.05),DM);m.renderOrder=999;m.visible=false;m.userData.ol=1;dots.push(m);scene.add(m)}
const nn=document.createElement('div');nn.id='nonav';nn.textContent='NO NAV';document.body.appendChild(nn);
let hov=null;cv.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||e.buttons){hov=null;return}const r=cv.getBoundingClientRect();hov={x:e.clientX,y:e.clientY,px:e.clientX-r.left,py:e.clientY-r.top}});
cv.addEventListener('pointerleave',()=>{hov=null});
let arcWas=true;function arcLoop(){requestAnimationFrame(arcLoop);if(!hov&&!arcWas)return;try{let ok=false,bad=false;if(hov&&fauna&&typeof S!=='undefined'&&![...document.querySelectorAll('.sheet')].some(x=>x.offsetParent)){const[i,j]=G.screenToTile(hov.px,hov.py),s=zs(S.zone),n=s.tiles.length;
 if(i>=0&&j>=0&&i<n&&j<n&&s.tiles[i]&&s.tiles[i][j]){const a=fauna.position,b=W2(i,j),p=ag.attributes.position.array,d=a.distanceTo(b);for(let k=0;k<ARCN;k++){const u=k/(ARCN-1);p[k*3]=a.x+(b.x-a.x)*u;p[k*3+2]=a.z+(b.z-a.z)*u;p[k*3+1]=a.y+(b.y-a.y)*u+.08+Math.sin(u*Math.PI)*Math.min(1.6,.25+d*.18)}ag.attributes.position.needsUpdate=true;arc.computeLineDistances();ok=d>.4}else bad=true}
 arc.visible=ok;{const p=ag.attributes.position.array;dots.forEach((m,k)=>{m.visible=ok;if(ok){const q=Math.min(ARCN-2,Math.round((k+.5)/12*(ARCN-1)));m.position.set(p[q*3],p[q*3+1],p[q*3+2]);m.lookAt(p[q*3+3],p[q*3+4],p[q*3+5]);m.rotateY(Math.PI/2)}})}nn.style.display=bad?'block':'none';if(bad){nn.style.left=hov.x+14+'px';nn.style.top=hov.y+10+'px'}cv.style.cursor=bad?'not-allowed':'';arcWas=ok||bad}catch(e){}}arcLoop();}
// v4.10: vile looks: black blob with green eyes (2, 4-eyed Gassy every 3rd, 9-eyed boss)
{const t0=B.tox,EW=new THREE.MeshBasicMaterial({color:0xffffff}),EG=new THREE.MeshBasicMaterial({color:0x6dff3a}),EK=new THREE.MeshBasicMaterial({color:0});
B.tox=o=>{const g=t0(o);try{g.children.slice().forEach(c=>{if(c!==g.userData.blob&&c.position.z>.25&&c.position.y>.3)g.remove(c)});
 const n=o.boss?9:((o.v||hsh(o.i,o.j,3)*3|0)%3===2?4:2),b=g.userData.blob;for(let k=0;k<n;k++){const row=n===9?Math.floor(k/3):n===4?Math.floor(k/2):0,cols=n===9?3:2,col=k%cols,x=(col-(cols-1)/2)*.32,y=.1+row*.28-(n===9?.28:n===4?.14:0),s=n===9?.16:.24;
  const e=new THREE.Group();e.position.set(x,y,Math.sqrt(Math.max(.05,1-x*x-y*y))*.97);e.add(mesh(SPHL,EW,[s,s,s*.5]));e.add(mesh(SPHL,EG,[s*.62,s*.62,s*.3],[0,0,s*.3]));e.add(mesh(SPHL,EK,[s*.28,s*.28,s*.15],[0,0,s*.45]));b.add(e)}
 if(n>=4){const gm=new THREE.MeshBasicMaterial({color:0x8dff5a,transparent:true,opacity:.18,depthWrite:false});for(let k=0;k<3;k++)g.add(mesh(SPHL,gm,[.14,.14,.14],[Math.sin(k*2.1)*.3,.75+k*.12,Math.cos(k*2.1)*.3]))}}catch(e){}return g}}
// v4.13 (notes 26/27): distinct looks for Tusker (elephant), Dasher (deer), Bobbler (T-rex), Waddler (penguin), Flapper (crane), Thumper (kangaroo)
Object.assign(SP,{
 elephant:{b:[.22,.21,.27],leg:.17,lr:.07,head:.16,neck:[.03,.4],snout:[.04,.06],ears:'side',tail:'thin'},
 deer:{b:[.14,.13,.23],leg:.26,lr:.03,head:.11,neck:[.18,.95],snout:[.09,.045],ears:'point',tail:'puff'},
 trex:{b:[.16,.2,.2],leg:.16,lr:.06,head:.19,neck:[.1,1.1],snout:[.1,.08],ears:'',tail:'croc',spikes:1},
 penguin:{b:[.16,.22,.15],leg:.05,lr:.04,head:.12,neck:[.02,1.3],snout:[.06,.025],ears:'',tail:'stub',beak:1},
 crane:{b:[.12,.12,.17],leg:.34,lr:.018,head:.09,neck:[.3,1.2],snout:[.12,.022],ears:'',tail:'bushy',beak:1},
 kangaroo:{b:[.15,.18,.18],leg:.14,lr:.05,head:.11,neck:[.1,1.1],snout:[.07,.05],ears:'long',tail:'croc'}});
{const LOOK={tusker:'elephant',dasher:'deer',bobbler:'trex',waddler:'penguin',flapper:'crane',thumper:'kangaroo'};
const _bf2=buildFauna;buildFauna=function(genes){const sp=SPECIES[genes.species],lk=LOOK[genes.species];let a0;if(sp&&lk){a0=sp.animal;sp.animal=lk}let f;try{f=_bf2(genes)}finally{if(sp&&lk)sp.animal=a0}
 try{const rig=f.userData.rig,h=rig&&rig.head,a=SP[lk];if(!h||!lk)return f;const body=rig.body,col=new THREE.Color(COLORS[genes.color]||'#e2b273'),M=c=>new THREE.MeshToonMaterial({color:c,gradientMap:typeof TOONG!=='undefined'?TOONG:null}),S0=new THREE.SphereGeometry(1,14,10),C0=new THREE.CylinderGeometry(1,1,1,10);
 const add=(p,geo,m,s,pos,rot=[0,0,0])=>{const o=new THREE.Mesh(geo,m);o.scale.set(...s);o.position.set(...pos);o.rotation.set(...rot);p.add(o);return o};const R=a.head;
 if(lk==='elephant'){const tm=M(col);for(let k=0;k<5;k++)add(h,S0,tm,[R*.28-k*.012,R*.28-k*.012,R*.3],[0,-k*R*.32,R*.95+Math.sin(k*.5)*R*.2]);const iv=M(0xfffff0);[-1,1].forEach(s=>{add(h,new THREE.ConeGeometry(1,1,8),iv,[R*.09,R*.6,R*.09],[s*R*.38,-R*.55,R*.6],[.9,0,0]);add(h,S0,M(col.clone().multiplyScalar(.85)),[R*.08,R*.75,R*.62],[s*R*1.05,0,-R*.1],[0,s*.3,0])})}
 if(lk==='deer'){const am=M(0xd9c9a3);[-1,1].forEach(s=>{const b=add(h,C0,am,[R*.06,R*.9,R*.06],[s*R*.45,R*1.2,-R*.1],[0,0,-s*.35]);for(let k=0;k<2;k++)add(h,C0,am,[R*.05,R*.45,R*.05],[s*R*(.6+k*.15),R*(1.25+k*.35),R*.05],[.5,0,-s*.9])})}
 if(lk==='trex'){h.scale.multiplyScalar(1.15);if(body)body.rotation.x=-.45;const am=M(col);[-1,1].forEach(s=>add(body||rig.root,C0,am,[.025,.09,.025],[s*.11,.02,a.b[2]*.85],[1.1,0,0]));add(h,S0,M(0xffffff),[R*.7,R*.08,R*.5],[0,-R*.38,R*.45])}
 if(lk==='penguin'){add(body||rig.root,S0,M(0xffffff),[a.b[0]*.8,a.b[1]*.85,a.b[2]*.5],[0,0,a.b[2]*.62]);if(body)body.rotation.x=-.9;const fm=M(col.clone().multiplyScalar(.7));[-1,1].forEach(s=>add(body||rig.root,S0,fm,[.025,.13,.07],[s*a.b[0]*1.02,0,0],[0,0,s*.35]));add(h,new THREE.ConeGeometry(1,1,8),M(0xffa500),[R*.25,R*.6,R*.25],[0,-R*.1,R*1.05],[Math.PI/2,0,0])}
 if(lk==='crane'){add(h,new THREE.ConeGeometry(1,1,8),M(0x333333),[R*.18,R*1.6,R*.18],[0,0,R*1.3],[Math.PI/2,0,0]);add(h,S0,M(0xd2202a),[R*.4,R*.25,R*.4],[0,R*.85,0])}
 if(lk==='kangaroo'){if(body)body.rotation.x=-.6;[-1,1].forEach(s=>add(rig.root,S0,M(col.clone().multiplyScalar(.8)),[.04,.025,.11],[s*.09,.02,.08]));add(body||rig.root,S0,M(col.clone().lerp(new THREE.Color(0xffffff),.5)),[.08,.06,.03],[0,-.06,a.b[2]*.85])}
 }catch(e){}return f}}
// v4.15 (notes 23): Reverie Stump (green hollow stump, glowing blue center) + Idea shadow (black silhouette with glowing lightbulb)
B.reverie=stumpStation(0x5fae3a,0x4fb8ff);
B.ideashadow=o=>{const g=new THREE.Group(),k=new THREE.MeshBasicMaterial({color:0x111111});g.add(mesh(CYL,k,[.07,.5,.07],[0,.25,0]));[[0,.72,0,.3],[.18,.6,.1,.2],[-.17,.62,-.06,.22]].forEach(([x,y,z,r])=>g.add(mesh(SPHL,k,[r,r*.9,r],[x,y,z])));
 const bulb=mesh(SPHL,glowM(0xffffff,3),[.09,.11,.09],[0,1.18,0]);g.add(bulb);g.add(mesh(CYL,std(0xbbbbbb),[.04,.05,.04],[0,1.06,0]));g.userData.blob=bulb;return g};

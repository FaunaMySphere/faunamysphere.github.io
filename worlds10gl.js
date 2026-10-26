// v7 preview: visuals for the 10 new worlds. Shared materials/geometries, instancing, procedural only. High = extra dressing/env; Low = props + palette only.
import * as THREE from 'three';
const G=window,B=G.GLB;
if(B){
const C=h=>new THREE.Color(h);
const MC={};const mat=(c,o={})=>{const k=c+JSON.stringify(o);return MC[k]||(MC[k]=new THREE.MeshStandardMaterial({color:c,roughness:.8,...o}))};
const glow=(c,i=1.2)=>mat(c,{emissive:c,emissiveIntensity:i,roughness:.4});
const SPH=new THREE.SphereGeometry(1,12,8),CYL=new THREE.CylinderGeometry(1,1,1,10),CONE=new THREE.ConeGeometry(1,1,8),BOX=new THREE.BoxGeometry(1,1,1),ICO=new THREE.IcosahedronGeometry(1,0),OCT=new THREE.OctahedronGeometry(1,0),TOR=new THREE.TorusGeometry(1,.28,6,14);
const m=(g,mt,s=[1,1,1],p=[0,0,0],r=[0,0,0])=>{const x=new THREE.Mesh(g,mt);x.scale.set(...s);x.position.set(...p);x.rotation.set(...r);x.castShadow=true;return x};
const grp=(...a)=>{const g=new THREE.Group();a.forEach(x=>g.add(x));return g};
const rnd=(o,k)=>{const x=Math.sin((o.i*12.9898+o.j*78.233+k*37.7))*43758.5;return x-Math.floor(x)};
const zid=()=>G.S&&S.zone;
// ---------- props ----------
B.maple=o=>{const g=grp(m(CYL,mat(0x5a3a24),[.07,.9,.07],[0,.45,0]));const cs=[0xd8562a,0xe8892e,0xc2352a,0xf0b03a];for(let k=0;k<6;k++){const a=k*1.05;g.add(m(ICO,mat(cs[(k+o.i)%4],{flatShading:true}),[.32,.26,.32],[Math.cos(a)*.22,.95+(k%2)*.14,Math.sin(a)*.22]))}g.add(m(ICO,mat(cs[o.j%4],{flatShading:true}),[.36,.3,.36],[0,1.15,0]));return g};
B.leafpile=o=>grp(m(SPH,mat(0xd9702e,{flatShading:true}),[.32,.12,.28],[0,.05,0]),m(SPH,mat(0xb8402a,{flatShading:true}),[.2,.1,.2],[.15,.1,.05]));
B.lantern=o=>{const l=zid()==='wispfen'?0x9fffd0:0xffc46a;return grp(m(CYL,mat(0x2e2a26),[.025,.7,.025],[0,.35,0]),m(BOX,mat(0x2e2a26),[.14,.03,.14],[0,.72,0]),m(BOX,glow(l,1.6),[.1,.14,.1],[0,.64,0]))};
B.bench=o=>grp(m(BOX,mat(0x7a4e2c),[.5,.04,.16],[0,.2,0]),m(BOX,mat(0x7a4e2c),[.5,.12,.03],[0,.3,-.07]),m(BOX,mat(0x333),[.03,.2,.14],[-.2,.1,0]),m(BOX,mat(0x333),[.03,.2,.14],[.2,.1,0]));
B.windmill=o=>{const g=grp(m(CYL,mat(0xe8dcc2),[.18,1.1,.22],[0,.55,0]),m(CONE,mat(0xa8442e),[.26,.3,.26],[0,1.25,0]));const bl=new THREE.Group();bl.position.set(0,.95,.24);for(let k=0;k<4;k++){const p=new THREE.Group();p.rotation.z=k*Math.PI/2;p.add(m(BOX,mat(0xf4efe2),[.08,.6,.02],[0,.3,0]));bl.add(p)}g.add(bl);bl.children[0].children[0].onBeforeRender=()=>{bl.rotation.z=performance.now()*.0012};return g};
B.bridgepost=o=>grp(m(CYL,mat(0x8a6a44),[.04,.45,.04],[-.18,.22,0]),m(CYL,mat(0x8a6a44),[.04,.45,.04],[.18,.22,0]),m(CYL,mat(0xc9b48a),[.012,.36,.012],[0,.4,0],[0,0,Math.PI/2]));
B.kite=o=>{const g=grp(m(CYL,mat(0xeeeeee),[.006,1.2,.006],[0,.6,0]),m(OCT,mat(0xff6a8a,{side:THREE.DoubleSide}),[.18,.24,.02],[0,1.25,0]));g.children[1].onBeforeRender=function(){this.rotation.z=Math.sin(performance.now()*.002+o.i)*.3};return g};
B.flagpole=o=>grp(m(CYL,mat(0xdddddd),[.02,1,.02],[0,.5,0]),m(BOX,mat(0x4fa6d8),[.3,.16,.01],[.15,.88,0]));
B.bigshroom=o=>{const h=.6+rnd(o,1)*.7,c=[0x7fe8ff,0xc98bff,0x8dffb0][(o.i+o.j)%3];return grp(m(CYL,mat(0xe9e2d0),[.07,h,.08],[0,h/2,0]),m(SPH,glow(c,.9),[.42,.2,.42],[0,h,0]),m(SPH,glow(0xffffff,1.4),[.05,.03,.05],[.18,h+.12,.05]),m(SPH,glow(0xffffff,1.4),[.04,.03,.04],[-.12,h+.13,-.14]))};
B.glowstone=o=>grp(m(ICO,mat(0x3a3448,{flatShading:true}),[.25,.18,.22],[0,.1,0]),m(OCT,glow(0x7fe8ff,1.5),[.06,.14,.06],[.06,.25,0]),m(OCT,glow(0xc98bff,1.5),[.05,.11,.05],[-.08,.22,.05]));
B.bamboo=o=>{const g=new THREE.Group(),gm=mat(0x8cbf5a),km=mat(0x5f8f3a);for(let k=0;k<5;k++){const h=1.1+rnd(o,k)*.9,x=(rnd(o,k+9)-.5)*.35,z=(rnd(o,k+19)-.5)*.35;g.add(m(CYL,gm,[.035,h,.035],[x,h/2,z]));for(let s=1;s<4;s++)g.add(m(CYL,km,[.042,.025,.042],[x,h*s/4,z]));g.add(m(CONE,mat(0x6fae48,{side:THREE.DoubleSide}),[.16,.3,.04],[x+.08,h,z],[0,0,-1]))}return g};
B.stonelamp=o=>grp(m(CYL,mat(0x9a9a92),[.14,.08,.14],[0,.04,0]),m(CYL,mat(0x9a9a92),[.05,.3,.05],[0,.22,0]),m(BOX,glow(0xffe0a0,.9),[.16,.13,.16],[0,.43,0]),m(CONE,mat(0x8a8a82),[.2,.12,.2],[0,.56,0]));
B.lotus=o=>{const g=grp(m(CYL,mat(0x3f8f4a),[.22,.01,.22],[0,.02,0]));for(let k=0;k<6;k++){const a=k*1.05;g.add(m(SPH,mat(0xffc0d8),[.05,.03,.1],[Math.cos(a)*.06,.06,Math.sin(a)*.06],[.5,a,0]))}return g};
B.oasisruin=o=>grp(m(BOX,mat(0xd9b77a),[.7,.3,.18],[0,.15,0]),m(BOX,mat(0xc9a66a),[.18,.6,.18],[-.26,.3,0]),m(BOX,mat(0xc9a66a),[.18,.42,.18],[.26,.21,0]),m(BOX,mat(0xd9b77a),[.3,.12,.3],[.1,.06,.3],[0,.4,0]));
B.pillar=o=>grp(m(CYL,mat(0xe4cc96),[.13,.9-rnd(o,2)*.4,.13],[0,.4,0]),m(BOX,mat(0xd8bd84),[.32,.08,.32],[0,.04,0]));
B.bigcrystal=o=>{const g=new THREE.Group(),cs=[0x8fe8ff,0xd2a8ff,0xffb0e8,0xa8ffd8];for(let k=0;k<4;k++){const h=.5+rnd(o,k)*.8,a=k*1.6;g.add(m(OCT,mat(cs[(k+o.i)%4],{emissive:cs[(k+o.i)%4],emissiveIntensity:.35,roughness:.1,metalness:.2,flatShading:true,transparent:true,opacity:.9}),[.12,h,.12],[k?Math.cos(a)*.16:0,h*.6,k?Math.sin(a)*.16:0],[k?Math.cos(a)*.35:0,0,k?Math.sin(a)*.35:0]))}return g};
B.geode=o=>{const g=grp(m(SPH,mat(0x5a4a6a,{flatShading:true}),[.3,.22,.3],[0,.12,0]));g.add(m(SPH,glow(0xd2a8ff,.8),[.2,.1,.2],[0,.26,0]));return g};
B.icespire=o=>{const g=new THREE.Group();for(let k=0;k<3;k++){const h=.7+rnd(o,k)*.9;g.add(m(CONE,mat(0xcfefff,{roughness:.1,transparent:true,opacity:.85,emissive:0x2a6a8a,emissiveIntensity:.3,flatShading:true}),[.14,h,.14],[(k-1)*.17,h/2,(k%2)*.1]))}return g};
B.icehole=o=>grp(m(CYL,mat(0x1a3a5a,{roughness:.05}),[.28,.01,.28],[0,.015,0]),m(TOR,mat(0xeaf6ff),[.3,.3,.12],[0,.02,0],[Math.PI/2,0,0]));
B.fishhut=o=>grp(m(BOX,mat(0x8a5a3a),[.5,.4,.45],[0,.2,0]),m(CONE,mat(0xe8f4ff),[.42,.28,.42],[0,.54,0],[0,Math.PI/4,0]),m(BOX,glow(0xffd080,.8),[.1,.1,.01],[0,.22,.23]));
B.vent=o=>{const g=grp(m(CONE,mat(0x2a201e,{flatShading:true}),[.32,.34,.32],[0,.17,0]),m(CYL,glow(0xff6a1f,2),[.08,.02,.08],[0,.34,0]));return g};
B.obsidian=o=>grp(m(ICO,mat(0x15121a,{roughness:.15,metalness:.3,flatShading:true}),[.2,.32+rnd(o,3)*.3,.2],[0,.2,0],[.2,rnd(o,4)*3,.1]));
B.lavapool=o=>grp(m(CYL,glow(0xff5a1f,1.6),[.38,.02,.32],[0,.02,0]),m(TOR,mat(0x2a201e,{flatShading:true}),[.38,.32,.25],[0,.03,0],[Math.PI/2,0,0]));
B.deadtree=o=>{const g=grp(m(CYL,mat(0x3a3630),[.06,.9,.07],[0,.45,0]));for(let k=0;k<4;k++){const a=k*1.6+rnd(o,k);g.add(m(CYL,mat(0x3a3630),[.025,.45,.025],[Math.cos(a)*.14,.7+k*.06,Math.sin(a)*.14],[Math.sin(a)*.9,0,-Math.cos(a)*.9]))}return g};
B.tombstone=o=>grp(m(BOX,mat(0x8a8e8a),[.26,.34,.07],[0,.17,0],[0,0,(rnd(o,1)-.5)*.3]),m(CYL,mat(0x8a8e8a),[.13,.07,.13],[0,.34,0],[Math.PI/2,0,0]),m(BOX,mat(0x3a4a30),[.32,.03,.32],[0,.015,.12]));
B.gear=o=>{const g=new THREE.Group(),gm=mat(0xb08a4a,{metalness:.6,roughness:.4});const w=new THREE.Group();w.add(m(CYL,gm,[.32,.06,.32]));for(let k=0;k<10;k++){const a=k*.628;w.add(m(BOX,gm,[.09,.06,.1],[Math.cos(a)*.35,0,Math.sin(a)*.35],[0,-a,0]))}w.rotation.x=Math.PI/2;w.position.y=.42;g.add(w,m(BOX,mat(0x4a4038),[.1,.4,.1],[0,.2,-.06]));w.children[0].onBeforeRender=()=>{w.rotation.z=performance.now()*.0008*(o.i%2?1:-1)};return g};
B.pipe=o=>grp(m(CYL,mat(0x6a7a7a,{metalness:.5,roughness:.5}),[.09,.8,.09],[0,.15,0],[0,0,Math.PI/2]),m(CYL,mat(0x6a7a7a,{metalness:.5,roughness:.5}),[.09,.5,.09],[.4,.4,0]),m(TOR,mat(0xb08a4a,{metalness:.6}),[.11,.11,.11],[.4,.65,0],[Math.PI/2,0,0]));
B.scrapheap=o=>{const g=new THREE.Group(),cs=[0x7a6a5a,0x8a4a3a,0x5a6a6a,0xa08a5a];for(let k=0;k<7;k++)g.add(m(BOX,mat(cs[k%4],{metalness:.4,roughness:.6}),[.12+rnd(o,k)*.15,.05+rnd(o,k+3)*.1,.1+rnd(o,k+5)*.12],[(rnd(o,k+7)-.5)*.4,.05+k*.04,(rnd(o,k+9)-.5)*.4],[rnd(o,k)*2,rnd(o,k+1)*3,rnd(o,k+2)]));return g};
B.chimney=o=>grp(m(CYL,mat(0x7a4a3a),[.12,1.2,.12],[0,.6,0]),m(CYL,mat(0x3a3a3a),[.15,.08,.15],[0,1.22,0]));
// ---------- per-zone pollution style (tint, shared per zone) ----------
const PT={maplevale:0x7a4a1a,skyreach:0x5a5e6a,glowcap:0x4a1a5a,mistreed:0x4a3a22,mirage:0x2a2018,prism:0x6a6a70,auroramere:0x6a7a8a,cinder:0x302624,wispfen:0x2a3a2a,cogwork:0x3a3020};
const p0=B.poll;B.poll=o=>{const g=p0(o),id=zid(),c=PT[id];if(c==null)return g;g.traverse(x=>{if(x.isMesh&&x.material&&x.material.color&&!x.material.transparent){x.material=x.material.clone();x.material.color.lerp(C(c),.7);if(id==='glowcap'||id==='cinder'||id==='wispfen'){x.material.emissive=C(id==='cinder'?0xff4a10:id==='glowcap'?0x8a2aff:0x4aff9a);x.material.emissiveIntensity=.35}}});return g};
// ---------- High: world7 profiles ----------
G.W7XP={
 w10maple:{gr:.5,gh:.7,fl:[0xf0b03a,0xd8562a],tree:'leaf',leaf:0xd8622a,nt:.4,bu:3,mu:1,bo:3,pe:.8},
 w10sky:{gr:1.1,gh:.9,fl:[0xffffff,0xfff1a8,0x9fd8ff],tree:'leaf',leaf:0x6fbf4a,nt:.25,bu:4,mu:0,bo:3,pe:.4},
 w10glow:{gr:.5,gh:.8,fl:[0x7fe8ff,0xc98bff],tree:'crystal',nt:.3,bu:0,mu:4,glow:1,bo:5,pe:.8},
 w10bamboo:{gr:1,gh:1.3,fl:[0xffc0d8,0xffffff],tree:'pine',nt:.2,bu:6,mu:.5,bo:6,pe:1.2,fern:1},
 w10oasis:{gr:.1,gh:1.1,dry:1,fl:[0xffd84a],tree:'cactus',nt:.15,bu:0,mu:0,bo:4,pe:2.5,sand:1,roots:0,shells:1},
 w10crystal:{gr:0,fl:null,tree:'crystal',nt:.7,bu:0,mu:0,glow:1,bo:12,pe:3,rock:1,roots:0},
 w10aurora:{gr:0,fl:null,tree:'pine',nt:.35,bu:0,mu:0,bo:5,pe:1.2,snow:1,roots:0},
 w10lava:{gr:0,fl:null,tree:null,nt:0,bu:0,mu:0,bo:12,pe:3.5,stone:1,roots:0,dry:1},
 w10haunt:{gr:.8,gh:1.2,fl:[0x9fffd0],tree:'leaf',leaf:0x3a4a2a,nt:.3,bu:2,mu:3,glow:1,bo:4,pe:.6},
 w10junk:{gr:.15,gh:.7,dry:1,fl:null,tree:null,nt:0,bu:0,mu:0,bo:8,pe:3,stone:1,roots:0}};
// env per zone: fog near/far (x camDist), fog/bg colour, sun colour+intensity, hemi colour+intensity
const ENV={maplevale:[2,6.5,0xf4d2a0,0xffc888,2.6,0xffd8a8,1.1],skyreach:[3,9,0xd8eeff,0xfff8e8,3,0xcfe8ff,1.3],glowcap:[1.4,4.2,0x1c1a38,0x6a7aff,.5,0x5a4aa8,.9],
 mistreed:[1.6,5.2,0xdfe9e4,0xfff4e0,1.8,0xd8e8e0,1.1],mirage:[2.6,7.5,0xfde8c0,0xfff0c8,3.2,0xffe8c0,1],prism:[2,6,0xe8dcff,0xfff0ff,2.4,0xd8c8ff,1.2],
 auroramere:[1.8,5.5,0x10263a,0x9fd8ff,.7,0x5affc8,.8],cinder:[1.6,5.2,0x6a3a28,0xffa070,2.1,0xff9a6a,1.05],wispfen:[1.3,4.4,0x3e504a,0xc8e8d8,1.1,0x8ab8a8,1.05],cogwork:[1.8,5.5,0xd2c0a0,0xffe0b0,2.4,0xe0c8a0,1]};
const FX={};// per-zone animated extras (only one zone live at a time)
let fxG=null;
const inst=(geo,mt,N,f)=>{const im=new THREE.InstancedMesh(geo,mt,N),o=new THREE.Object3D(),c=new THREE.Color();for(let k=0;k<N;k++){f(o,k,c);o.updateMatrix();im.setMatrixAt(k,o.matrix);if(c.__set){im.setColorAt(k,c);c.__set=0}}im.raycast=()=>{};return im};
const glowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
function extras(id,W){const isl=W.island,n=W.N0,C0=W.C0,s=G.zs(id),T=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(s.tiles[i]&&s.tiles[i][j])T.push([i-C0,j-C0]);let rs=7;const r=()=>(rs=(rs*16807)%2147483647)/2147483647;const pick=()=>T[Math.floor(r()*T.length)];
 const g=new THREE.Group();g.userData.noToon=1;const upd=[];
 const sprites=(N,col,sz,yl,yh,anim)=>{const mt=new THREE.SpriteMaterial({map:glowTex,color:col,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false});for(let k=0;k<N;k++){const sp=new THREE.Sprite(mt);const[x,z]=pick();sp.position.set(x,yl+r()*(yh-yl),z);sp.scale.setScalar(sz*(.6+r()*.8));sp.userData.p=r()*6;g.add(sp);upd.push(t=>{if(!sp.userData.b)sp.userData.b=sp.position.clone();anim(sp,t)})}};
 const flat=(N,cols,sx,sz,y)=>g.add(inst(new THREE.PlaneGeometry(sx,sz).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({roughness:.9,side:THREE.DoubleSide}),N,(o,k,c)=>{const[x,z]=pick();o.position.set(x+r()-.5,y,z+r()-.5);o.rotation.set(0,r()*6,0);o.scale.setScalar(.6+r()*.8);c.set(cols[k%cols.length]);c.__set=1}));
 if(id==='maplevale'){flat(150,[0xd8562a,0xe8892e,0xc2352a,0xf0b03a,0x9a3a20],.09,.07,.03)}
 if(id==='skyreach'){// rope-bridge planks on narrow strips
  const S2=new Set(T.map(([x,z])=>x+','+z));const br=T.filter(([x,z])=>{let c=0;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]])if(S2.has((x+a)+','+(z+b)))c++;return c<=2});
  g.add(inst(new THREE.BoxGeometry(.9,.04,.16),mat(0x9a7448),br.length*4,(o,k)=>{const[x,z]=br[k>>2];o.position.set(x,.05,z+((k&3)-1.5)*.22);o.rotation.set(0,(k%2?.05:-.05),0)}));
  sprites(6,0xffffff,1.6,2.5,4,(sp,t)=>{sp.position.x=sp.userData.b.x+Math.sin(t*.1+sp.userData.p)*2;sp.material.opacity=.25})}
 if(id==='glowcap'){g.add(inst(new THREE.SphereGeometry(.035,6,4),glow(0x7fe8ff,2),160,(o,k,c)=>{const[x,z]=pick();o.position.set(x+r()-.5,.04,z+r()-.5);o.scale.set(1,.6,1)}));
  sprites(14,0x9fd8ff,.35,.3,1.6,(sp,t)=>{const u=sp.userData;sp.position.y=u.b.y+Math.sin(t*.8+u.p)*.25;sp.position.x=u.b.x+Math.sin(t*.4+u.p)*.3})}
 if(id==='mistreed'){const mt=new THREE.SpriteMaterial({map:glowTex,color:0xffffff,transparent:true,opacity:.2,depthWrite:false,fog:false});for(let k=0;k<7;k++){const sp=new THREE.Sprite(mt);const[x,z]=pick();sp.position.set(x,.35,z);sp.scale.set(4+r()*3,1.2,1);sp.userData.p=r()*6;g.add(sp);upd.push(t=>{if(!sp.userData.b)sp.userData.b=sp.position.clone();sp.position.x=sp.userData.b.x+Math.sin(t*.15+sp.userData.p)*1.2})}}
 if(id==='mirage'){g.add(inst(new THREE.ConeGeometry(.03,.22,4),mat(0xb8a050),140,(o,k)=>{const[x,z]=pick();o.position.set(x+r()-.5,.1,z+r()-.5);o.rotation.set((r()-.5)*.6,0,(r()-.5)*.6)}));flat(80,[0xf0d8a0,0xe0c088],.5,.06,.012)}
 if(id==='prism'){g.add(inst(new THREE.OctahedronGeometry(.06,0),mat(0xffffff,{emissive:0xb8a8ff,emissiveIntensity:.6,roughness:.1,flatShading:true}),120,(o,k)=>{const[x,z]=pick();o.position.set(x+r()-.5,.05,z+r()-.5);o.scale.set(1,1.5+r()*2,1);o.rotation.set(r()-.5,r()*3,r()-.5)}))}
 if(id==='auroramere'){// aurora ribbons: 3 additive gradient planes, animated by shader time
  const am=new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false,uniforms:{t:{value:0}},
   vertexShader:'varying vec2 vU;uniform float t;void main(){vU=uv;vec3 p=position;p.z+=sin(p.x*.25+t*.4)*2.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
   fragmentShader:'varying vec2 vU;uniform float t;void main(){float a=smoothstep(0.,.35,vU.y)*(1.-vU.y)*(.6+.4*sin(vU.x*18.+t*1.3));vec3 c=mix(vec3(.2,1.,.6),vec3(.6,.3,1.),vU.y);gl_FragColor=vec4(c*a*.8,a);}'});
  for(let k=0;k<3;k++){const pl=new THREE.Mesh(new THREE.PlaneGeometry(40,7,24,1),am);pl.position.set(-6+k*5,9+k*1.5,-14-k*4);pl.rotation.y=.6+k*.2;g.add(pl)}upd.push(t=>am.uniforms.t.value=t);
  flat(40,[0xa8d8f0,0xc8ecff],.7,.02,.012)}
 if(id==='cinder'){g.add(inst(new THREE.BoxGeometry(.6,.01,.05),glow(0xff5a1f,2.2),70,(o,k)=>{const[x,z]=pick();o.position.set(x+r()-.5,.012,z+r()-.5);o.rotation.set(0,r()*6,0);o.scale.set(.5+r(),1,1)}));
  const N=140,pos=new Float32Array(N*3);for(let k=0;k<N;k++){pos[k*3]=(r()-.5)*n;pos[k*3+1]=r()*6;pos[k*3+2]=(r()-.5)*n}const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0x8a8a8a,size:.07,transparent:true,opacity:.8,depthWrite:false}));g.add(pts);upd.push(t=>{const a=pg.attributes.position.array;for(let k=0;k<N;k++){a[k*3+1]-=.006;if(a[k*3+1]<0)a[k*3+1]=6}pg.attributes.position.needsUpdate=true})}
 if(id==='wispfen'){sprites(12,0x9fffd0,.5,.4,1.4,(sp,t)=>{const u=sp.userData;sp.position.set(u.b.x+Math.sin(t*.5+u.p)*.8,u.b.y+Math.sin(t*1.1+u.p)*.2,u.b.z+Math.cos(t*.4+u.p)*.8);sp.material.opacity=.6+.4*Math.sin(t*2+u.p)});
  const mt=new THREE.SpriteMaterial({map:glowTex,color:0x9fb0a8,transparent:true,opacity:.3,depthWrite:false,fog:false});for(let k=0;k<7;k++){const sp=new THREE.Sprite(mt);const[x,z]=pick();sp.position.set(x,.25,z);sp.scale.set(5,1,1);g.add(sp)}}
 if(id==='cogwork'){g.add(inst(new THREE.CylinderGeometry(.05,.05,.03,6),mat(0xb08a4a,{metalness:.7,roughness:.35}),110,(o,k)=>{const[x,z]=pick();o.position.set(x+r()-.5,.015,z+r()-.5)}));
  sprites(8,0xffb060,.18,.2,1.2,(sp,t)=>{const u=sp.userData;const q=(t*1.5+u.p)%1;sp.position.y=u.b.y*q*2;sp.material.opacity=1-q})}
 const kids=[...g.children];kids.forEach(c=>{c.userData.noToon=1;isl.add(c)});fxG={g:kids[0]||g,upd}}
const hook=()=>{if(!G.W6build||!G.W6env||G.W6build.__w10)return false;const b0=G.W6build,e0=G.W6env;
 G.W6build=z=>{b0(z);fxG=null;try{const q=Z(z);if(q&&q.w10&&G.W6&&G.W6.island)extras(z,G.W6)}catch(e){console.warn('w10',e)}};G.W6build.__w10=1;
 G.W6env=(z,nt)=>{e0(z,nt);const id=z.id||zid(),E=ENV[id];if(!E||!G.W7ON)return;const W=G.W6,sc=W.scene,d=W.camDist||20;const fc=C(E[2]);sc.background=fc;sc.fog=new THREE.Fog(fc,d*E[0],d*E[1]);if(W.sun){W.sun.color.set(E[3]);W.sun.intensity=E[4]}if(W.hemi){W.hemi.color.set(E[5]);W.hemi.intensity=E[6]}};
 return true};
if(!hook()){const iv=setInterval(()=>{if(hook())clearInterval(iv)},300);setTimeout(()=>clearInterval(iv),20000)}
(function loop(){requestAnimationFrame(loop);if(fxG&&fxG.g.parent){const t=performance.now()/1000;for(const f of fxG.upd)f(t)}})();
console.log('[FaunaMySphere] worlds10 visuals ready');
}

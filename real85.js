// v8.5 REALISM PREVIEW (branch v85-real-preview, not shipped). Visual only: never touches the save.
// - Neutral (Khronos PBR) tone mapping: highlight roll-off without washing colours.   ?r85tm to try (off by default: it flattened colours in tests)
// - Image-based light: a soft sky/ground environment (rebuilt once per world) gives props, buildings, rocks and trees real ambient reflections. ?r85noibl
// - Ground: large-scale colour/brightness variation so tiles stop looking repeated.  ?r85nognd
// - Water: physically-based Fresnel (clear looking down, mirror-like at grazing angles) and depth tint. ?r85nowater
// - Fauna & monsters keep the toon look; they get a soft sky-coloured rim light.       ?r85norim
// Preview 2 adds: realistic sky + cloud sea, atmospheric fog, soft shadows on phone High, colour grade, ground detail bumps.
// Phones: no new passes on Med, one PMREM build per world change. Low graphics: nothing. ?r85off disables all.
import * as THREE from 'three';
import {ShaderPass} from './vendor/three/addons/postprocessing/ShaderPass.js';
const G=window,QS=new URLSearchParams(location.search);
if(!QS.has('r85off'))(function boot(){if(!G.W6||!G.GL)return setTimeout(boot,150);try{start()}catch(e){console.warn('r85',e)}})();
function start(){
const W6=G.W6,Q=G.GL.Q,R=W6.R,scene=W6.scene,isPhone=matchMedia('(pointer:coarse)').matches||innerWidth<700;
if(Q==='low')return;
const ON=k=>!QS.has('r85no'+k);
const D=G.FS_R85={Q,isPhone,n:{rim:0,gnd:0,water:0,std:0},env:0};
if(QS.has('r85tm')){R.toneMapping=THREE.NeutralToneMapping;try{const c=W6.composer;c&&c.passes.forEach(p=>{if(p.isOutputPass||p.constructor.name==='OutputPass')p._toneMapping=null})}catch(e){}}
// ---------- IBL ----------
let pm=null,envRT=null;const envScene=new THREE.Scene();
const envMat=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:{uTop:{value:new THREE.Color()},uHor:{value:new THREE.Color()},uGnd:{value:new THREE.Color()},uSun:{value:new THREE.Vector3(0,1,0)},uSunC:{value:new THREE.Color()}},
 vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 uTop,uHor,uGnd,uSun,uSunC;varying vec3 vD;void main(){float y=vD.y;vec3 c=y>0.?mix(uHor,uTop,pow(y,.6)):mix(uHor*.6+uGnd*.4,uGnd,pow(-y,.5));c+=uSunC*pow(max(dot(vD,normalize(uSun)),0.),24.)*1.2;gl_FragColor=vec4(c,1.);}'});
envScene.add(new THREE.Mesh(new THREE.SphereGeometry(10,32,16),envMat));
function groundCol(){try{const im=G._groundIM,m=(Array.isArray(im.material)?im.material:[im.material])[2];return m.color.clone().multiplyScalar(.45)}catch(e){return new THREE.Color(0x4a5a30)}}
function buildEnv(){if(!ON('ibl'))return;try{const su=W6.su;const top=su&&su.uTop?su.uTop.value:(scene.background&&scene.background.isColor?scene.background:new THREE.Color(0x9cc8ff));
 const hor=su&&su.uHor?su.uHor.value:top;envMat.uniforms.uTop.value.copy(top);envMat.uniforms.uHor.value.copy(hor);envMat.uniforms.uGnd.value.copy(groundCol());
 if(W6.sun){envMat.uniforms.uSun.value.copy(W6.sun.position).normalize();envMat.uniforms.uSunC.value.copy(W6.sun.color).multiplyScalar(Math.min(1,W6.sun.intensity/2.5))}
 if(!pm)pm=new THREE.PMREMGenerator(R);const old=envRT;const tm=R.toneMapping;R.toneMapping=THREE.NoToneMapping;envRT=pm.fromScene(envScene,.04,.1,50);R.toneMapping=tm;scene.environment=envRT.texture;if(old)old.dispose();
 scene.environmentIntensity=isPhone?.55:.7;D.env++}catch(e){console.warn('r85 env',e)}}
// ---------- per-material patches ----------
const DET=ON('detail')&&Q==='high';const RIM=new THREE.Color(),uRim={value:RIM};
function rim(m){if(!ON('rim')||m.userData.r85)return;m.userData.r85=1;const prev=m.onBeforeCompile;m.onBeforeCompile=function(s,r){if(prev)prev.call(this,s,r);s.uniforms.uR85=uRim;
 s.fragmentShader='uniform vec3 uR85;\n'+s.fragmentShader.replace('#include <opaque_fragment>','{float f85=1.-clamp(dot(normalize(-vViewPosition),normal),0.,1.);outgoingLight+=uR85*smoothstep(.5,1.,f85)*.45;}\n#include <opaque_fragment>')};
 const pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';m.customProgramCacheKey=()=>pk()+'r85rim';m.needsUpdate=true;D.n.rim++}
function gnd(m){if(!ON('gnd')||m.userData.r85g)return;m.userData.r85g=1;const prev=m.onBeforeCompile;m.onBeforeCompile=function(s,r){if(prev)prev.call(this,s,r);
 s.vertexShader='varying vec3 vW85;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 w=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;\n#endif\nvW85=(modelMatrix*w).xyz;}');
 s.fragmentShader='varying vec3 vW85;\nfloat h85(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat n85(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h85(i),h85(i+vec2(1,0)),f.x),mix(h85(i+vec2(0,1)),h85(i+1.),f.x),f.y);}\n'+
  s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec2 q=vW85.xz;float a=n85(q*.13)*.65+n85(q*.41)*.35;float b=n85(q*.07+7.3);diffuseColor.rgb*=mix(.76,1.12,a);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.06,1.,.88),smoothstep(.55,.85,b)*.75);}').replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+(DET?'{vec2 q=vW85.xz*2.3;float e=.08,c0=n85(q),cx=n85(q+vec2(e,0.)),cz=n85(q+vec2(0.,e));vec3 bn=vec3(c0-cx,0.,c0-cz)*3.2;normal=normalize(normal+(viewMatrix*vec4(bn,0.)).xyz);}':''))};
 const pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';m.customProgramCacheKey=()=>pk()+'r85gnd';m.needsUpdate=true;D.n.gnd++}
function water(m){if(!ON('water')||m.userData.r85w||!m.fragmentShader||m.fragmentShader.indexOf('uDeep')<0)return;let f=m.fragmentShader;m.userData.r85w=1;
 const a='float fr=.18+.7*pow(1.-max(dot(N,V),0.),3.);',b='col=mix(col,sky*1.05,fr*.55);';if(f.indexOf(a)<0||f.indexOf(b)<0)return;
 f=f.replace(a,'float fr=.03+.97*pow(1.-max(dot(N,V),0.),5.);').replace(b,'col*=mix(1.,.82,smoothstep(.2,.9,1.-r));col=mix(col,sky*1.08,clamp(fr*.95+.08,0.,.9));');
 m.fragmentShader=f;m.needsUpdate=true;D.n.water++}
function scan(){const isl=W6.island;scene.traverse(o=>{const M=o.material;if(!M)return;(Array.isArray(M)?M:[M]).forEach(m=>{if(!m)return;
 if(m.isMeshToonMaterial)rim(m);else if(m.isShaderMaterial)water(m);else if(m.isMeshStandardMaterial&&!m.userData.r85s){m.userData.r85s=1;D.n.std++}})});
 const g=G._groundIM;if(g)(Array.isArray(g.material)?g.material:[g.material]).forEach(m=>m&&m.isMeshStandardMaterial&&gnd(m))}
function rimCol(){if(W6.hemi)RIM.copy(W6.hemi.color).lerp(new THREE.Color(0xffffff),.35).multiplyScalar(Math.min(1.2,.45+W6.hemi.intensity*.3))}
let zone=null,isl=null,t=0;
setInterval(()=>{if(document.hidden)return;let z=null;try{z=S.zone}catch(e){}if(z!==zone||W6.island!==isl){zone=z;isl=W6.island;t=2}if(t>0&&--t===0){scan();rimCol();buildEnv()}},700);
setInterval(()=>{if(!document.hidden){scan();rimCol()}},4000); // late-loaded fauna / monsters / pools
setTimeout(()=>{scan();rimCol();buildEnv()},800);

// ================= v8.5 preview 2: BOLD pass =================
// Tiers: PC High = everything (5-octave sky, 2048 soft shadows, grade). Phone High = sky (4 oct), 1024 soft shadows, grade. Med = sky (3 oct) + ground + IBL. Low = nothing.
// Switches: ?r85nosky ?r85noshadow ?r85nograde ?r85nodetail
const HI=Q==='high',PCHI=HI&&!isPhone,OCT=PCHI?5:HI?4:3;
// ---------- 1. realistic sky: deep blue zenith, sun + glow, high cirrus, and a sunlit sea of clouds below the floating island ----------
if(ON('sky')){const U2={uTop:W6.su.uTop,uHor:W6.su.uHor,uSunC:W6.su.uSunC,uSunS:{value:new THREE.Vector2(.7,.9)},uHz:{value:.6},uAz:{value:0},uT:{value:0},uNight:{value:0},uAsp:{value:1}};
 const sm=new THREE.ShaderMaterial({uniforms:U2,depthWrite:false,depthTest:true,fog:false,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy*2.,.99995,1.);}',
  fragmentShader:`uniform vec3 uTop,uHor,uSunC;uniform vec2 uSunS;uniform float uHz,uAz,uT,uNight,uAsp;varying vec2 vUv;
  float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
  float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<${OCT};i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
  void main(){vec2 uv=vUv;float y=uv.y-uHz;vec3 top=uTop,hor=mix(uHor,vec3(1.),.18);
   vec3 zen=mix(top*vec3(.55,.75,1.15),top,.35);
   vec3 c=mix(hor,zen,pow(clamp(y/(1.-uHz+.001),0.,1.),.55));
   vec2 sp=vec2((uv.x-uSunS.x)*uAsp,uv.y-uSunS.y);float sd=length(sp);
   vec3 sc=uSunC*(1.-uNight*.8);
   c+=sc*(exp(-sd*7.)*.45+exp(-sd*30.)*.6)+sc*smoothstep(.028,.018,sd)*2.;
   if(y>0.){vec2 q=vec2((uv.x*uAsp+uAz)*1.4,y*5.)+vec2(uT*.004,0.);float ci=fbm(q*vec2(1.,3.)+vec2(0.,uT*.002));ci=smoothstep(.55,.85,ci)*smoothstep(0.,.25,y);c=mix(c,mix(hor,vec3(1.),.7),ci*.55);}
   else{float d=-y;vec2 q=vec2((uv.x-.5)*uAsp/(d+.06)+uAz*6.,1./(d+.06))*2.4+vec2(uT*.01,uT*.006);
    float cl=fbm(q);float cl2=fbm(q+vec2(.21,.13));float sh=clamp((cl-cl2)*5.+.55,0.,1.4);
    float cov=smoothstep(.40,.60,cl);float lt=dot(top,vec3(.3,.59,.11)),lh=dot(hor,vec3(.3,.59,.11));vec3 deep=mix(top,vec3(.20,.40,.74)*clamp(lt*1.6,.25,1.1),.65)*mix(.8,1.05,n(q*.3));
    vec3 lit=mix(vec3(.50,.56,.68),vec3(1.02,1.,.97)+sc*.18,clamp(sh,0.,1.));lit*=mix(.8,1.05,smoothstep(.45,.8,cl));lit*=clamp(lh*1.3,.35,1.08);
    vec3 cs=mix(deep,lit,cov);float far=exp(-d*9.);c=mix(cs,hor,far*.7);}
   c=mix(c,c*vec3(.18,.22,.4),uNight*.85);gl_FragColor=vec4(c,1.);}`});
 const q=new THREE.Mesh(new THREE.PlaneGeometry(1,1),sm);q.frustumCulled=false;q.renderOrder=9999;scene.add(q);D.sky=1;
 const v=new THREE.Vector3(),f=new THREE.Vector3(),t0=performance.now();
 q.onBeforeRender=(r,sc,cam)=>{const zb=(()=>{try{return Z(S.zone).biome}catch(e){return ''}})();q.visible=zb!=='dungeon';
  cam.getWorldDirection(f);f.y=0;if(f.lengthSq()<1e-6)f.set(0,0,-1);f.normalize();v.copy(cam.position).addScaledVector(f,5000);v.project(cam);U2.uHz.value=Math.min(.98,Math.max(.05,v.y*.5+.5));
  U2.uAz.value=Math.atan2(f.x,f.z)/6.283;U2.uAsp.value=cam.aspect||1;U2.uT.value=(performance.now()-t0)/1000;
  try{const n=G.W81&&G.W81.su&&G.W81.su.uNight?G.W81.su.uNight.value:0;U2.uNight.value=n}catch(e){}
  if(W6.sun){v.copy(cam.position).add(W6.sun.position.clone().sub(W6.sun.target?W6.sun.target.position:new THREE.Vector3()).normalize().multiplyScalar(500));v.project(cam);U2.uSunS.value.set(v.x*.5+.5,Math.max(U2.uHz.value+.12,Math.min(.95,v.z<1?v.y*.5+.5:.9)))}};
 // the old cartoon cloud sprites fight the new sky: hide them (the distant floating islets stay)
 const hideBig=()=>{scene.traverse(o=>{if(o.isMesh&&o!==q&&!o.userData.r85h&&o.material&&o.material.isMeshBasicMaterial&&o.geometry){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere&&g.boundingSphere.radius*o.scale.x>=200){o.userData.r85h=1;o.visible=false;o.layers.disable(0)}}});scene.traverse(o=>{if(o.isSprite&&o.material&&o.material.fog===false&&o.material.depthWrite===false&&!o.userData.r85h&&o.scale.x>20){o.userData.r85h=1;o.visible=false;o.layers.disable(0)}})};hideBig();setInterval(hideBig,3000);
 // atmospheric fog follows the sky horizon so the island edges melt into the haze
 setInterval(()=>{const fg=scene.fog;if(fg&&fg.isFog&&W6.su){const zb=(()=>{try{return Z(S.zone).biome}catch(e){return ''}})();if(zb!=='dungeon')fg.color.lerp(W6.su.uHor.value.clone().lerp(new THREE.Color(1,1,1),.1),.15)}},500)}
// ---------- 2. soft sun shadows on phone High too (PC High already has them from v8.4) ----------
if(HI&&ON('shadow')&&!R.shadowMap.enabled&&W6.sun){R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;W6.sun.castShadow=true;if(isPhone){W6.sun.shadow.mapSize.set(1024,1024);if(W6.sun.shadow.map){W6.sun.shadow.map.dispose();W6.sun.shadow.map=null}}
 if('intensity' in W6.sun.shadow)W6.sun.shadow.intensity=.6;W6.sun.shadow.radius=3;scene.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>{m.needsUpdate=true})});D.shadow=isPhone?1024:2048}
// ---------- 3. colour grading (filmic contrast, warm light / cool shade, gentle vignette) ----------
const GRADE={uniforms:{tDiffuse:{value:null},uAmt:{value:1}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform sampler2D tDiffuse;uniform float uAmt;varying vec2 vUv;void main(){vec4 t=texture2D(tDiffuse,vUv);vec3 c=t.rgb;float l=dot(c,vec3(.2126,.7152,.0722));
  vec3 g=mix(vec3(l),c,1.12);g=mix(g*vec3(.94,.98,1.07),g*vec3(1.06,1.01,.92),smoothstep(.15,.75,l));
  g=g*g*(3.-2.*g)*.35+g*.65;float vg=1.-.22*smoothstep(.45,.95,distance(vUv,vec2(.5)));g*=vg;gl_FragColor=vec4(mix(c,clamp(g,0.,1.),uAmt),t.a);}`};
let gp=null;function grade(){if(gp||!ON('grade')||!HI)return;const C=W6.composer;if(!C)return;try{const oi=C.passes.findIndex(p=>p.constructor&&/OutputPass/.test(p.constructor.name));gp=new ShaderPass(GRADE);C.insertPass(gp,oi>=0?oi+1:C.passes.length-1);D.grade=1}catch(e){console.warn('r85 grade',e)}}
setTimeout(grade,1200);
}

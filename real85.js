// v8.5 REALISM PREVIEW (branch v85-real-preview, not shipped). Visual only: never touches the save.
// - Neutral (Khronos PBR) tone mapping: highlight roll-off without washing colours.   ?r85tm to try (off by default: it flattened colours in tests)
// - Image-based light: a soft sky/ground environment (rebuilt once per world) gives props, buildings, rocks and trees real ambient reflections. ?r85noibl
// - Ground: large-scale colour/brightness variation so tiles stop looking repeated.  ?r85nognd
// - Water: physically-based Fresnel (clear looking down, mirror-like at grazing angles) and depth tint. ?r85nowater
// - Fauna & monsters keep the toon look; they get a soft sky-coloured rim light.       ?r85norim
// Phones: no new passes, one PMREM build per world change. Low graphics: nothing. ?r85off disables all.
import * as THREE from 'three';
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
const RIM=new THREE.Color(),uRim={value:RIM};
function rim(m){if(!ON('rim')||m.userData.r85)return;m.userData.r85=1;const prev=m.onBeforeCompile;m.onBeforeCompile=function(s,r){if(prev)prev.call(this,s,r);s.uniforms.uR85=uRim;
 s.fragmentShader='uniform vec3 uR85;\n'+s.fragmentShader.replace('#include <opaque_fragment>','{float f85=1.-clamp(dot(normalize(-vViewPosition),normal),0.,1.);outgoingLight+=uR85*smoothstep(.5,1.,f85)*.45;}\n#include <opaque_fragment>')};
 const pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';m.customProgramCacheKey=()=>pk()+'r85rim';m.needsUpdate=true;D.n.rim++}
function gnd(m){if(!ON('gnd')||m.userData.r85g)return;m.userData.r85g=1;const prev=m.onBeforeCompile;m.onBeforeCompile=function(s,r){if(prev)prev.call(this,s,r);
 s.vertexShader='varying vec3 vW85;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 w=vec4(transformed,1.);\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;\n#endif\nvW85=(modelMatrix*w).xyz;}');
 s.fragmentShader='varying vec3 vW85;\nfloat h85(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\nfloat n85(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h85(i),h85(i+vec2(1,0)),f.x),mix(h85(i+vec2(0,1)),h85(i+1.),f.x),f.y);}\n'+
  s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n{vec2 q=vW85.xz;float a=n85(q*.13)*.65+n85(q*.41)*.35;float b=n85(q*.07+7.3);diffuseColor.rgb*=mix(.76,1.12,a);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.06,1.,.88),smoothstep(.55,.85,b)*.75);}')};
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
}

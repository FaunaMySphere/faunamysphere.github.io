// v7.2 realism look (Leo approved). Default on High graphics only. Terrain blending by height/slope + macro variation,
// cliff ambient occlusion, soft contact shadows under fauna/objects, dawn/dusk light shafts + warm haze. Fauna untouched.
import * as THREE from 'three';
const G=window,W=G.W6;
if(W&&G.GL&&G.GL.Q==='high'){
const {scene}=W;
const NOISE=`float r8h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float r8n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(r8h(i),r8h(i+vec2(1,0)),f.x),mix(r8h(i+vec2(0,1)),r8h(i+vec2(1,1)),f.x),f.y);}
float r8f(vec2 p){return r8n(p)*.55+r8n(p*2.3)*.3+r8n(p*5.1)*.15;}`;
const SURF=()=>{try{return G.FSMech?G.FSMech.surf():'g'}catch(e){return'g'}};
const TOP={g:`vec3 lush=c*vec3(.80,1.06,.74),dry=c*vec3(1.18,1.06,.72);c=mix(lush,dry,smoothstep(.38,.68,n));
    vec3 dirt=vec3(.50,.40,.28)*(.8+.4*n2);c=mix(c,dirt,smoothstep(.74,.9,n2)*(1.-h)*.45);`,
 snow:`float lum=dot(c,vec3(.3,.5,.2));c=mix(c,vec3(lum),.7);c=mix(c,vec3(.97,.975,.98),.45);c*=.95+.08*smoothstep(.3,.7,n);c=mix(c,vec3(1.),smoothstep(.55,.85,n2)*.3);`,
 sand:`float dn=sin(r8w.x*3.1+r8w.z*1.7+n*5.)*.5+.5;c*=.9+.16*dn;c=mix(c,c*vec3(1.08,1.,.86),smoothstep(.4,.7,n));`,
 mud:`c=mix(c*vec3(.78,.84,.7),c*vec3(1.05,1.,.85),smoothstep(.35,.65,n));c=mix(c,vec3(.25,.22,.16),smoothstep(.75,.92,n2)*.5);`,
 stone:`c*=.85+.25*n;`};
function patch(m,kind){if(!m||m.userData.r8)return;const sf=SURF();m.userData.r8=1;const prev=m.onBeforeCompile,pk=m.customProgramCacheKey?m.customProgramCacheKey.bind(m):()=>'';
 m.customProgramCacheKey=()=>pk()+'|r8'+kind+sf;
 m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 r8w;varying float r8y;').replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 q=vec4(transformed,1.),o=vec4(0.,0.,0.,1.);\n#ifdef USE_INSTANCING\nq=instanceMatrix*q;o=instanceMatrix*o;\n#endif\nr8w=(modelMatrix*q).xyz;r8y=r8w.y-(modelMatrix*o).y;}');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 r8w;varying float r8y;\n'+NOISE).replace('#include <color_fragment>','#include <color_fragment>\n'+(kind==='side'?
   `{float ao=1.-smoothstep(.02,.85,-r8y);float st=r8n(vec2(r8w.y*7.,(r8w.x+r8w.z)*.9));diffuseColor.rgb*=mix(.42,1.05,ao)*(.82+.26*st);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(dot(diffuseColor.rgb,vec3(.33)))*vec3(1.,.96,.9),.3);}`:
   `{float n=r8f(r8w.xz*.35),n2=r8f(r8w.xz*1.7+7.);vec3 c=diffuseColor.rgb;float h=clamp(r8w.y/2.2,0.,1.);`+(TOP[sf]||TOP.g)+
   `vec3 rock=vec3(dot(c,vec3(.3,.45,.25)))*vec3(1.02,.98,.92);c=mix(c,rock,smoothstep(.4,1.,h)*smoothstep(.45,.75,n2)*`+(sf==='snow'?'.15':'.6')+`);diffuseColor.rgb=c*(`+(sf==='snow'?'.97+.05':'.92+.16')+`*r8n(r8w.xz*6.));}`));
 };m.needsUpdate=true;G.R8N=(G.R8N||0)+1}
// ---- soft contact shadows ----
const sT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(10,14,6,.75)');g.addColorStop(.5,'rgba(10,14,6,.38)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const sG=new THREE.PlaneGeometry(1,1);sG.rotateX(-Math.PI/2);const sM=new THREE.MeshBasicMaterial({map:sT,transparent:true,depthWrite:false,opacity:.75,polygonOffset:true,polygonOffsetFactor:-2});
const fsh=new THREE.Mesh(sG,sM);fsh.raycast=()=>{};fsh.userData.noToon=1;fsh.renderOrder=1;scene.add(fsh);
// ---- light shafts (additive tall cards facing camera, from sun direction) ----
const shT=(()=>{const c=document.createElement('canvas');c.width=64;c.height=256;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(.25,'rgba(255,236,190,.55)');g.addColorStop(1,'rgba(255,230,180,0)');x.fillStyle=g;x.fillRect(0,0,64,256);
 x.globalCompositeOperation='destination-in';const h=x.createLinearGradient(0,0,64,0);h.addColorStop(0,'rgba(0,0,0,0)');h.addColorStop(.5,'rgba(0,0,0,1)');h.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=h;x.fillRect(0,0,64,256);return new THREE.CanvasTexture(c)})();
const shafts=new THREE.Group();scene.add(shafts);for(let k=0;k<6;k++){const m=new THREE.Mesh(new THREE.PlaneGeometry(1,9),new THREE.MeshBasicMaterial({map:shT,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.0,side:THREE.DoubleSide,fog:false}));m.raycast=()=>{};m.userData.noToon=1;m.userData.k=k;shafts.add(m)}
let isl=null,shadows=[];
function decorate(){G.R8N=0;isl=W.island;shadows.forEach(s=>s.parent&&s.parent.remove(s));shadows=[];
 isl.children.forEach((c,i)=>{if(!c.isInstancedMesh)return;const mats=Array.isArray(c.material)?c.material:[c.material];
  if(Array.isArray(c.material)&&mats.length===6){mats.forEach((m,k)=>patch(m,k===2?'top':'side'))}
  });
 // AO blobs under every object group on the island (trees, rocks, props)
 isl.children.forEach(c=>{if(c.isGroup&&c.children.length){const bb=new THREE.Box3().setFromObject(c);const w=Math.min(1.6,Math.max(.6,(bb.max.x-bb.min.x+bb.max.z-bb.min.z)*.55));const s=new THREE.Mesh(sG,sM);s.scale.set(w,1,w);s.position.set((bb.min.x+bb.max.x)/2,bb.min.y+.015,(bb.min.z+bb.max.z)/2);s.raycast=()=>{};s.userData.noToon=1;s.renderOrder=1;isl.add(s);shadows.push(s)}})}
const prevBR=scene.onBeforeRender;const v=new THREE.Vector3();
scene.onBeforeRender=function(r,sc,cam,...a){if(prevBR)try{prevBR.call(this,r,sc,cam,...a)}catch(e){}
 try{if(W.island!==isl)decorate();
  const fa=G.GLfauna&&G.GLfauna();if(fa){fsh.visible=true;const gy=(fa.userData.gy!=null?fa.userData.gy:fa.position.y);fsh.position.set(fa.position.x,gy+.02,fa.position.z);const hop=Math.max(0,fa.position.y-gy);fsh.scale.setScalar(1.0*(1-Math.min(.5,hop)));sM.opacity=.75*(1-Math.min(.6,hop))}else fsh.visible=false;
  // shafts: sun elevation -> strong at dawn/dusk, faint midday, off at night
  const sun=W.sun;v.copy(sun.position).normalize();const el=v.y,day=sun.intensity>.6?1:0;const gold=day*(el<.75?1:Math.max(0,1-(el-.75)*4))*.5+day*.12;
  const t=performance.now()/1000;shafts.children.forEach(m=>{const k=m.userData.k;m.position.set(v.x*-3+(k-2.5)*1.6,3.2,v.z*-3+Math.sin(k*1.7)*1.2);m.lookAt(cam.position.x,m.position.y,cam.position.z);m.rotateZ(Math.atan2(v.x,v.y)*.35);m.scale.set(.9+.5*Math.sin(k*2.3),1,1);m.material.opacity=gold*(.16+.08*Math.sin(t*.4+k*1.3));m.material.color.setRGB(1,.86+.1*el,.68+.2*el)});
 }catch(e){console.warn('r8',e)}};
console.log('[real8] realism preview on');
}

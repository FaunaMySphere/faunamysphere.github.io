// ===== fauna2.js: realistic/detailed fauna look (batch 1: Hoofer, Sniffer, Pouncer) =====
// Upgrades the mesh built by gl.js buildFauna in place, keeping rig names (body/head/legs/tail/eyes/lids).
(function(){
const BATCH=null; // v4.27: all animal species
let NM=null,GEO={};
function furNormal(T){if(NM)return NM;const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');
 // height field of short soft strands
 x.fillStyle='#808080';x.fillRect(0,0,N,N);for(let i=0;i<2600;i++){const px=Math.random()*N,py=Math.random()*N,l=4+Math.random()*7,a=Math.PI/2+(Math.random()-.5)*.7,v=110+Math.random()*120|0;x.strokeStyle=`rgba(${v},${v},${v},.55)`;x.lineWidth=1+Math.random();x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
 const h=x.getImageData(0,0,N,N).data,o=x.createImageData(N,N),H=(i,j)=>h[(((j+N)%N)*N+((i+N)%N))*4]/255;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=(H(i+1,j)-H(i-1,j))*2.2,dy=(H(i,j+1)-H(i,j-1))*2.2,l=Math.hypot(dx,dy,1),k=(j*N+i)*4;o.data[k]=(-dx/l*.5+.5)*255;o.data[k+1]=(dy/l*.5+.5)*255;o.data[k+2]=(1/l*.5+.5)*255;o.data[k+3]=255}
 x.putImageData(o,0,0);NM=new T.CanvasTexture(c);NM.wrapS=NM.wrapT=T.RepeatWrapping;NM.repeat.set(3,3);return NM}
function hiSphere(T){return GEO.s||(GEO.s=new T.SphereGeometry(1,40,28))}

// rim light (fresnel) injected into PBR shader
function rim(m,T,c){m.userData.rim=c;const rc=new T.Color(c).lerp(new T.Color(0xfff6e0),.6);m.onBeforeCompile=sh=>{sh.uniforms.rimC={value:rc};sh.fragmentShader='uniform vec3 rimC;\n'+sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);totalEmissiveRadiance+=rimC*pow(fr,3.0)*0.55;}')};m.customProgramCacheKey=()=>'rim';m.needsUpdate=true;return m}
let IRIS={},ENV=null,STR=null,SHAD=null;
function irisTex(T,c){const k=c.getHexString();if(IRIS[k])return IRIS[k];const N=128,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');const base=c.clone().multiplyScalar(.9),hex=x=>'#'+x.getHexString();
 const g=x.createRadialGradient(N/2,N/2,4,N/2,N/2,N/2);g.addColorStop(0,'#000');g.addColorStop(.32,'#050505');g.addColorStop(.36,hex(base.clone().multiplyScalar(1.4)));g.addColorStop(.8,hex(base.clone().multiplyScalar(.6)));g.addColorStop(.93,'#120a06');g.addColorStop(1,'#000');x.fillStyle=g;x.fillRect(0,0,N,N);
 x.strokeStyle='rgba(255,255,255,.12)';for(let i=0;i<60;i++){const an=Math.random()*6.28;x.beginPath();x.moveTo(N/2+Math.cos(an)*22,N/2+Math.sin(an)*22);x.lineTo(N/2+Math.cos(an)*55,N/2+Math.sin(an)*55);x.stroke()}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;return IRIS[k]=t}
function envTex(T){if(ENV)return ENV;const cv=document.createElement('canvas');cv.width=256;cv.height=128;const x=cv.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'#8ec8ff');g.addColorStop(.5,'#f4fbff');g.addColorStop(.52,'#7cbf4a');g.addColorStop(1,'#3e6a22');x.fillStyle=g;x.fillRect(0,0,256,128);x.fillStyle='#fff';x.fillRect(70,20,40,26);x.fillRect(160,30,22,14);
 ENV=new T.CanvasTexture(cv);ENV.mapping=T.EquirectangularReflectionMapping;ENV.colorSpace=T.SRGBColorSpace;return ENV}
function strandTex(T){if(STR)return STR;const N=256,cv=document.createElement('canvas');cv.width=cv.height=N;const x=cv.getContext('2d');x.clearRect(0,0,N,N);for(let i=0;i<5200;i++){const v=200+Math.random()*55|0;x.fillStyle=`rgba(${v},${v},${v},1)`;const r=.6+Math.random()*1.1;x.beginPath();x.arc(Math.random()*N,Math.random()*N,r,0,6.3);x.fill()}
 STR=new T.CanvasTexture(cv);STR.wrapS=STR.wrapT=T.RepeatWrapping;STR.repeat.set(6,6);return STR}
function shadTex(T){if(SHAD)return SHAD;const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');const g=x.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return SHAD=new T.CanvasTexture(cv)}
function extras(root,rig,a,T,hd,col,animal){const b=rig.body,core=b.children[0];
 // soft contact shadow (all fauna, 1 quad)
 const cs=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:shadTex(T),transparent:true,depthWrite:false}));cs.rotation.x=-Math.PI/2;cs.position.y=.012;cs.scale.set(a.b[0]*3.2,a.b[2]*3.6,1);cs.renderOrder=-1;cs.userData.shell=1;root.add(cs);
 // shell fur: own fauna only, on body + head core + tail
 if(hd){const st=strandTex(T),L=5,tgt=[];if(core&&core.isMesh)tgt.push(core);if(rig.head)rig.head.children.forEach(m=>{if(m.isMesh&&m.geometry.type==='SphereGeometry'&&m.scale.x>a.head*.6)tgt.push(m)});
  if(rig.tail)rig.tail.traverse(m=>{if(m.isMesh&&m.material===core.material)tgt.push(m)});
  tgt.forEach(m=>{const base=m.material.color||col;for(let i=1;i<=L;i++){const f=i/L,mat=new T.MeshStandardMaterial({color:base.clone().lerp(new T.Color(0xffffff),f*.18),alphaMap:st,transparent:true,alphaTest:.15+f*.55,depthWrite:false,roughness:.9});mat.alphaMap.repeat.set(6,6);const sh=new T.Mesh(m.geometry,mat);const g=1+f*.075;sh.scale.set(g,g,g);sh.userData.shell=1;sh.userData.noToon=1;sh.renderOrder=1;m.add(sh)}})}
 // idle breathing on a pivot inside body (rig.body untouched)
 if(core){let t0=Math.random()*6;const bs=core.scale.clone();core.onBeforeRender=()=>{const k=1+Math.sin(performance.now()/620+t0)*.025;core.scale.set(bs.x*k,bs.y*(1+(k-1)*1.3),bs.z*k)}}
}
window.FSFaunaHD=function(root,rig,genes,animal,a,T,hd){try{
 // all fauna: drop the thick toon outlines (fauna only) — also fewer draw calls
 const kill=[];root.traverse(m=>{if(m.isMesh&&m.material&&m.material.side===T.BackSide&&m.material.isMeshBasicMaterial)kill.push(m)});kill.forEach(m=>m.parent&&m.parent.remove(m));
 if(!rig.head||!a||!a.b)return;const LOW=(localStorage.getItem('fs_q')||'')==='low'||new URLSearchParams(location.search).get('q')==='low';if(LOW)hd=false;
 const col=new T.Color((window.COLORS&&COLORS[genes.color])||'#e2b273'),hsl={};col.getHSL(hsl);col.setHSL(hsl.h,Math.min(1,hsl.s*1.35+.08),hsl.l>.62?.5:hsl.l*.95);const cream=new T.Color(0xfff4e2),creamC=col.clone().lerp(cream,.9);
 if(rig.body.children[0]&&rig.body.children[0].material&&rig.body.children[0].material.color)rig.body.children[0].material.color.copy(col);
 const b=rig.body,fur=b.children[0]&&b.children[0].material,nm=furNormal(T);
 const furHi=m=>{if(!m||m._hd)return;m._hd=1;m.normalMap=nm;m.normalScale=new T.Vector2(hd?.55:.35,hd?.55:.35);m.roughness=.85;if('sheen'in m){m.sheen=1;m.sheenRoughness=.35}m.needsUpdate=true};
 furHi(fur);if(fur)rim(fur,T,col);
 const creamM=rim(new T.MeshPhysicalMaterial({color:creamC,roughness:.9,sheen:1,sheenRoughness:.3,sheenColor:new T.Color(0xffffff),normalMap:nm,normalScale:new T.Vector2(.45,.45)}),T,cream);
 const dark=new T.MeshStandardMaterial({color:col.clone().multiplyScalar(.35),roughness:.6});
 // smoother silhouette for own fauna
 if(hd)root.traverse(m=>{if(m.isMesh&&m.geometry&&m.geometry.type==='SphereGeometry'&&m.geometry.parameters.radius===1&&m.geometry.parameters.widthSegments<40&&m.geometry.parameters.thetaLength>3)m.geometry=hiSphere(T)});
 // cream belly + chest bib
 const bel=b.children[1];if(bel&&bel.isMesh){bel.material=creamM;bel.scale.multiplyScalar(1.04)}
 const sp=hd?hiSphere(T):b.children[0].geometry;
 const bib=new T.Mesh(sp,creamM);bib.scale.set(a.b[0]*.7,a.b[1]*.75,a.b[2]*.45);bib.position.set(0,-a.b[1]*.05,a.b[2]*.62);b.add(bib);
 // legs: cream socks / paws
 rig.legs.forEach(lg=>{const paw=lg.children[1];if(paw&&paw.isMesh){paw.material=creamM;paw.scale.multiplyScalar(1.15)}});
 // head: muzzle cream, eyes glossy & large, inner ears
 const H=rig.head,hs=a.head;rig.ears=[];
 if(H){H.children.forEach(m=>{if(!m.isMesh)return;const p=m.position;
   if(m.material&&m.material.color&&p.z>hs*.5&&p.y<0&&m.geometry.type==='SphereGeometry'&&m.scale.x>.03)m.material=creamM; // snout
   if(p.y>hs*.6||Math.abs(p.x)>hs*.8)rig.ears.push(m)});
  // cheek fluff
  for(const s of[-1,1]){const ch=new T.Mesh(sp,creamM);ch.scale.set(hs*.42,hs*.32,hs*.35);ch.position.set(s*hs*.45,-hs*.3,hs*.45);H.add(ch)}
  rig.ears.forEach(e=>{if(e.geometry.type==='ConeGeometry'){const inn=new T.Mesh(e.geometry,new T.MeshStandardMaterial({color:new T.Color(0xf6b8a8),emissive:new T.Color(0xc0503c),emissiveIntensity:.35,roughness:.7}));inn.scale.set(.62,.78,.5);inn.position.set(0,-hs*.05,hs*.17);e.add(inn);e.material=e.material===fur?fur:e.material}
   else{const inn=new T.Mesh(sp,new T.MeshStandardMaterial({color:new T.Color(0xf0aa98),emissive:new T.Color(0xc0503c),emissiveIntensity:.35,roughness:.7}));inn.scale.set(.6,.7,.5);inn.position.set(0,0,.4);e.add(inn)}});
  rig.eyes.forEach(e=>{const ir=e.children[1];if(ir&&ir.isMesh){ir.material=new T.MeshPhysicalMaterial({color:0xffffff,map:irisTex(T,ir.material.color),roughness:.08,clearcoat:1,clearcoatRoughness:.02,envMap:envTex(T),envMapIntensity:1.4});ir.scale.multiplyScalar(1.4)}
   const h2=new T.Mesh(sp,new T.MeshBasicMaterial({color:0xffffff}));h2.scale.set(hs*.03,hs*.03,hs*.015);h2.position.set(-hs*.05,-hs*.06,hs*.24);e.add(h2)})}
 // fluffy tail with cream tip
 const tl=rig.tail;if(tl){tl.children.forEach(m=>{if(m.isMesh&&m.material===fur)m.scale.multiplyScalar(animal==='fox'?1.35:1.15)});if(animal==='fox'||animal==='dog'){const tip=new T.Mesh(sp,creamM);tip.scale.set(.06,.06,.08);tip.position.set(0,animal==='fox'?.12:.13,animal==='fox'?-.27:-.1);tl.add(tip)}}
 extras(root,rig,a,T,hd,col,animal);
 root.traverse(m=>{if(!m.isMesh)return;m.userData.noToon=1;if(!m.material.transparent)m.castShadow=!!hd;
  if(!hd&&m.material.isMeshPhysicalMaterial&&!m.userData.shell){const o=m.material,n=new T.MeshStandardMaterial({color:o.color,map:o.map,roughness:o.roughness,normalMap:o.normalMap,normalScale:o.normalScale,envMap:o.envMap,emissive:o.emissive});if(o.userData.rim)rim(n,T,o.userData.rim);m.material=n}});
if(0){window.__hdBig=[];root.updateMatrixWorld(true);const v=new T.Vector3();root.traverse(m=>{if(m.isMesh){m.getWorldScale(v);if(v.x>.4)__hdBig.push(m.geometry.type+':'+v.x.toFixed(2)+':'+(m.material.type)+':'+(m.parent===root?'root':m.parent===b?'body':'other'))}})}
 root.userData.hd=hd?2:1}catch(e){console.warn('faunaHD',e)}};
})();

// v8.7 PREVIEW: terrain & ground realism. Visual only: never touches the save.
// - Ground blends grass / bare soil / rock / sand by slope, height, island edge and water: steep hillsides and hilltops turn to rock,
//   gentle slopes and eroded island rims to soil, pools/ponds/basins get a dry sand ring with dark glossy wet sand at the waterline.
// - Worn dirt paths link the landmarks of each world (gate, vendor, goal, den, nest, pools...), with grass cleared off them.
// - Island sides and terrace walls become layered rock strata with a grassy overhang and a dark soil band.
// Tiers: Low = nothing. Med = terrain + paths + cliffs (no fine detail). High = + fine detail, rock bumps, wet-sand gloss.
// Switches: ?r87off (all) ?r87noground ?r87nopath ?r87nocliff ?r87nodetail
// Auto-lowering (struggling phones): step 1 drops fine detail, step 3 turns the terrain shading off (paths stay; cheap).
import * as THREE from 'three';
const G=window,QS=new URLSearchParams(location.search);
if(!QS.has('r87off'))(function boot(){if(!G.W6||!G.GL)return setTimeout(boot,150);try{start()}catch(e){console.warn('r87',e)}})();
function start(){
const W6=G.W6,Q=G.GL.Q;if(Q==='low')return;
const ON=k=>!QS.has('r87no'+k),HI=Q==='high';
const D=G.FS_R87={Q,on:1,det:HI&&ON('detail')?1:0,builds:0,mats:0,paths:0,cleared:0};
// shared uniforms (one island at a time)
const U={uT87:{value:null},uP87:{value:null},uN87:{value:16},uC87:{value:7.5},uOn87:{value:1},uDet87:{value:D.det},
 uSoil87:{value:new THREE.Color(0x7a5a3a)},uRock87:{value:new THREE.Color(0x8a8478)},uSand87:{value:new THREE.Color(0xd2bb8a)},uGrass87:{value:new THREE.Color(0x5f8f2e)}};
const NOISE=`float h87(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n87(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h87(i),h87(i+vec2(1,0)),f.x),mix(h87(i+vec2(0,1)),h87(i+1.),f.x),f.y);}
uniform sampler2D uT87,uP87;uniform float uN87,uC87,uOn87,uDet87;uniform vec3 uSoil87,uRock87,uSand87,uGrass87;varying vec3 vW87;varying vec3 vN87;
vec2 uv87(vec2 xz){return (xz+uC87+.5)/uN87;}`;
const VERT=s=>{s.vertexShader='varying vec3 vW87;varying vec3 vN87;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n{vec4 w=vec4(transformed,1.);vec3 nn=objectNormal;\n#ifdef USE_INSTANCING\nw=instanceMatrix*w;nn=mat3(instanceMatrix)*nn;\n#endif\nvW87=(modelMatrix*w).xyz;vN87=normalize(mat3(modelMatrix)*nn);}')};
// ---- top surface ----
const TOP=`if(uOn87>.5){vec2 xz=vW87.xz;vec2 uv=uv87(xz);float e=1./uN87;vec4 T=texture2D(uT87,uv);
 float hC=T.r*6.375;float gx=(texture2D(uT87,uv+vec2(e,0.)).r-texture2D(uT87,uv-vec2(e,0.)).r)*3.19,gz=(texture2D(uT87,uv+vec2(0.,e)).r-texture2D(uT87,uv-vec2(0.,e)).r)*3.19;float g=length(vec2(gx,gz));
 float n1=n87(xz*.9)*.6+n87(xz*2.7)*.4,n2=n87(xz*.33+5.1);float edge=T.g,wat=T.b,pth=texture2D(uP87,uv).r;
 float rockM=clamp(smoothstep(.30,.48,g+(n1-.5)*.3)+smoothstep(1.9,2.5,hC+(n1-.5)*.8)*.85+smoothstep(.25,.55,T.a+(n1-.5)*.35),0.,1.);
 float soilM=clamp(smoothstep(.10,.24,g+(n1-.5)*.22)+(1.-smoothstep(.10,.30,edge+(n1-.5)*.2))*.85,0.,1.)*(1.-rockM);
 float sandM=smoothstep(.06,.30,wat+(n1-.5)*.25);wet87=smoothstep(.36,.56,wat+(n1-.5)*.18);
 float pathM=smoothstep(.28,.62,pth+(n87(xz*3.1)-.5)*.35);rock87=rockM*(1.-pathM);
 float fd=1.,fd2=1.;if(uDet87>.5){fd=.78+.44*n87(xz*7.3);fd2=.8+.4*n87(xz*13.7+3.);}
 vec3 base=diffuseColor.rgb;float tex=dot(base,vec3(.333));
 vec3 soilC=uSoil87*fd*(.85+.3*n1);soilC=mix(soilC,uSoil87*1.45,step(.86,h87(floor(xz*9.)))*uDet87*.6);
 vec3 rockC=uRock87*(.72+.45*n1)*fd2;float ck=abs(n87(xz*4.2+n1)-.5);rockC*=mix(.55,1.,smoothstep(.0,.05,ck));rockC=mix(rockC,uGrass87*.7,smoothstep(.62,.8,n87(xz*1.9+9.))*.5);
 vec3 sandC=uSand87*(.9+.2*fd2);vec3 wetC=sandC*vec3(.48,.47,.5);
 vec3 pathC=uSoil87*1.18*fd*(.9+.2*n2);pathC=mix(pathC,pathC*.72,smoothstep(.75,1.,pth)*.6);pathC=mix(pathC,vec3(.62,.58,.52),step(.9,h87(floor(xz*11.)))*.5*uDet87);
 vec3 c=base;c=mix(c,soilC,soilM);c=mix(c,sandC,sandM);c=mix(c,wetC,wet87);c=mix(c,rockC,rockM);
 c*=1.-.35*clamp(pathM*(1.-pathM)*4.,0.,1.)*(1.-rockM);c=mix(c,pathC,pathM*.95);
 c*=1.-.18*clamp(soilM*(1.-soilM)*4.,0.,1.);diffuseColor.rgb=c;}`;
// ---- cliffs: layered strata + grass overhang ----
const SIDE=`if(uOn87>.5&&abs(vN87.y)<.5){vec2 xz=vW87.xz;vec2 inr=xz-vN87.xz*.3;vec2 tu=(floor(inr+uC87+.5)+.5)/uN87;float topH=texture2D(uT87,tu).r*6.375;float d=topH-vW87.y;
 float w=n87(vec2(xz.x+xz.y,vW87.y)*1.3)*.9+n87(vec2(xz.x-xz.y,0.)*3.)*.25;float t=vW87.y*13.+w*1.6;float id=floor(t),fr=fract(t);float hb=h87(vec2(id,3.7));
 vec3 base=diffuseColor.rgb;float tex=dot(base,vec3(.333));
 vec3 c1=uRock87*vec3(1.12,1.04,.92),c2=uSoil87*vec3(1.25,1.05,.85),c3=uRock87*vec3(.72,.7,.7),c4=mix(uSoil87,uSand87,.55);
 vec3 band=hb<.3?c1:hb<.55?c2:hb<.8?c3:c4;band*=.72+.5*tex;band*=mix(.62,1.,smoothstep(.0,.12,fr))*mix(1.,.82,smoothstep(.8,1.,fr));
 if(uDet87>.5)band*=.85+.3*n87(vec2(xz.x+xz.y,vW87.y)*vec2(9.,22.));
 float lip=.05+.05*n87(vec2(xz.x+xz.y,0.)*9.);vec3 c=band;c=mix(c,uSoil87*.5,smoothstep(lip+.07,lip,d)*.85);c=mix(c,uGrass87*(.75+.3*tex),smoothstep(lip+.005,lip-.01,d));
 c*=mix(.62,1.,smoothstep(-.5,-.05,vW87.y-topH+.45));diffuseColor.rgb=c;}`;
const ROUGH=`if(uOn87>.5){roughnessFactor=mix(roughnessFactor,.95,rock87*.6);roughnessFactor=mix(roughnessFactor,.22,wet87*uDet87);}`;
const BUMP=`if(uOn87>.5&&uDet87>.5&&rock87>.05){vec2 q=vW87.xz*3.1;float c0=n87(q),cx=n87(q+vec2(.08,0.)),cz=n87(q+vec2(0.,.08));normal=normalize(normal+(viewMatrix*vec4((c0-cx)*5.*rock87,0.,(c0-cz)*5.*rock87,0.)).xyz);}`;
function inject(s,kind){if(s.fragmentShader.indexOf('uT87')>=0)return;Object.assign(s.uniforms,U);VERT(s);
 let f=NOISE+'\n'+s.fragmentShader;f=f.replace('void main() {','void main() {\nfloat wet87=0.,rock87=0.;');
 f=f.replace('#include <color_fragment>',(kind==='top'?TOP:SIDE)+'\n#include <color_fragment>');
 if(kind==='top'){f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n'+ROUGH);f=f.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n'+BUMP)}
 s.fragmentShader=f}
// compose onto whatever onBeforeCompile the game (v77) or real85 set, now or later
function hook(m,kind){if(!m||m.userData.r87)return;m.userData.r87=kind;const inn=m.onBeforeCompile?[m.onBeforeCompile]:[];let lvl=-1;
 // later wrappers (real85) call "prev" = us: re-entry runs the next older function in the chain, so nothing is lost
 const mine=function(s,r){const top=lvl===-1,i=top?inn.length-1:lvl-1;if(i>=0){const sv=lvl;lvl=i;try{inn[i].call(this,s,r)}finally{lvl=sv}}if(top)try{inject(s,kind)}catch(e){console.warn('r87 inj',e)}};
 Object.defineProperty(m,'onBeforeCompile',{configurable:true,get(){return mine},set(v){if(v!==mine)inn.push(v)}});
 const pk=m.customProgramCacheKey.bind(m);m.customProgramCacheKey=()=>pk()+'r87'+kind;m.needsUpdate=true;D.mats++}
// ---- per-island data: height / edge distance / water (n x n), path mask canvas ----
const WATER=/pool|pond|basin|water|spring|fount|lake|marsh/;
const LAND=/gate|vendor|goal|project|den|nest|storepad|friendgate|totem|basin|pool|pond|arch|stonehead|mushring|dig|treetree|waterfall|torch|well|shrine|board|house|hut/;
function build(){const im=G._groundIM;if(!im)return;let z,s;try{z=Z(S.zone);s=zs(S.zone)}catch(e){return}if(!z||z.biome==='dungeon')return;
 const n=z.n,C0=(n-1)/2,tiles=im.userData.tiles||[];const T=new Set(tiles.map(t=>t[0]+','+t[1]));
 // edge distance by BFS from outside
 const dist=[];for(let i=0;i<n;i++){dist[i]=[];for(let j=0;j<n;j++)dist[i][j]=T.has(i+','+j)?99:0}
 for(let k=1;k<5;k++)for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(dist[i][j]===99){for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const v=(dist[i+a]||[])[j+b];if(v==null||v===k-1){dist[i][j]=k;break}}}
 const wsrc=(s.objs||[]).filter(o=>WATER.test(o.type)&&o.i!=null);
 // rocky outcrops: a few deterministic spots near the rim, away from landmarks
 let sd=0;for(const ch of String(S.zone))sd=(sd*31+ch.charCodeAt(0))|0;const rr=k=>{const x=Math.sin(sd*.017+k*12.9898)*43758.5;return x-Math.floor(x)};
 const busy=(s.objs||[]).filter(o=>o.i!=null&&!/poll|tox/.test(o.type));const OUT=[];const want=z.biome==='home'||sd%1===0?Math.max(2,Math.round(n/5)):0;
 for(let k=0;k<60&&OUT.length<want;k++){const t=tiles[Math.floor(rr(k)*tiles.length)];if(!t)continue;const[i,j]=t;const d=dist[i][j];if(d<1||d>3)continue;if(busy.some(o=>Math.hypot(o.i-i,o.j-j)<2.2))continue;if(OUT.some(q=>Math.hypot(q[0]-i,q[1]-j)<4))continue;OUT.push([i,j,1.3+rr(k+7)*1.1])}
 D.outcrops=OUT.length;
 const data=new Uint8Array(n*n*4);for(let j=0;j<n;j++)for(let i=0;i<n;i++){const p=(j*n+i)*4;const h=G.HT?G.HT(i,j):0;data[p]=Math.min(255,Math.round(h*40));data[p+1]=Math.round(Math.min(4,dist[i][j])/4*255);
  let w=0;for(const o of wsrc){const r=o.type==='lilypond'?2.6:o.type==='waterfall'?2.4:2.1;const d=Math.hypot(i-o.i,j-o.j);w=Math.max(w,1-d/r)}data[p+2]=Math.round(Math.max(0,w)*255);data[p+3]=0}
 for(const[oi,oj,r]of OUT)for(let j=Math.max(0,Math.floor(oj-r));j<=Math.min(n-1,Math.ceil(oj+r));j++)for(let i=Math.max(0,Math.floor(oi-r));i<=Math.min(n-1,Math.ceil(oi+r));i++){if(!T.has(i+','+j))continue;const p=(j*n+i)*4;const v=Math.max(0,1-Math.hypot(i-oi,j-oj)/r);data[p+3]=Math.max(data[p+3],Math.round(v*255))}
 const dt=new THREE.DataTexture(data,n,n,THREE.RGBAFormat);dt.magFilter=dt.minFilter=THREE.LinearFilter;dt.flipY=false;dt.needsUpdate=true;
 // paths: minimum spanning tree over landmarks, wobbly curves
 const PX=16,cv=document.createElement('canvas');cv.width=cv.height=n*PX;const cx=cv.getContext('2d');cx.fillStyle='#000';cx.fillRect(0,0,cv.width,cv.height);
 let L=(s.objs||[]).filter(o=>o.i!=null&&LAND.test(o.type)).map(o=>[o.i,o.j]);
 if(ON('path')&&L.length>1){const gi=(s.objs||[]).findIndex(o=>o.type==='gate');const used=[L[0]],rest=L.slice(1),E=[];
  while(rest.length){let bi=0,bj=0,bd=1e9;for(let a=0;a<used.length;a++)for(let b=0;b<rest.length;b++){const d=Math.hypot(used[a][0]-rest[b][0],used[a][1]-rest[b][1]);if(d<bd){bd=d;bi=a;bj=b}}const r=rest.splice(bj,1)[0];if(bd<n*.8)E.push([used[bi],r]);used.push(r)}
  cx.strokeStyle='#fff';cx.lineCap='round';cx.lineJoin='round';const hs=(a,b)=>{const x=Math.sin(a*12.9898+b*78.233)*43758.5;return x-Math.floor(x)};
  for(const[a,b]of E){const x0=(a[0]+.5)*PX,y0=(a[1]+.5)*PX,x1=(b[0]+.5)*PX,y1=(b[1]+.5)*PX,dx=x1-x0,dy=y1-y0,l=Math.hypot(dx,dy)||1,o=(hs(a[0]+b[0],a[1]-b[1])-.5)*l*.45;
   const mx=(x0+x1)/2-dy/l*o,my=(y0+y1)/2+dx/l*o;cx.filter='blur(3px)';cx.lineWidth=PX*.62;cx.globalAlpha=.75;cx.beginPath();cx.moveTo(x0,y0);cx.quadraticCurveTo(mx,my,x1,y1);cx.stroke();
   cx.filter='blur(1.5px)';cx.lineWidth=PX*.34;cx.globalAlpha=1;cx.stroke();D.paths++}
  cx.filter='none'}
 const pt=new THREE.CanvasTexture(cv);pt.flipY=false;pt.colorSpace=THREE.NoColorSpace;pt.magFilter=pt.minFilter=THREE.LinearFilter;pt.generateMipmaps=false;
 const o1=U.uT87.value,o2=U.uP87.value;U.uT87.value=dt;U.uP87.value=pt;U.uN87.value=n;U.uC87.value=C0;if(o1)o1.dispose();if(o2)o2.dispose();
 // palette from the island's own materials
 const mats=Array.isArray(im.material)?im.material:[im.material];const top=mats[2],side=mats[0];
 const col=v=>new THREE.Color(v!=null?v:0x777777);
 if(side&&side.userData.flat!=null)U.uSoil87.value.copy(col(side.userData.flat)).multiplyScalar(z.biome==='arctic'?.8:.95);
 let rk=null;W6.island.children.forEach(o=>{if(!rk&&o.geometry&&o.geometry.type==='ConeGeometry'&&o.material&&o.material.userData&&o.material.userData.flat!=null)rk=o.material.userData.flat});U.uRock87.value.copy(col(rk!=null?rk:0x8a8478));
 if(top&&top.userData.flat!=null)U.uGrass87.value.copy(col(top.userData.flat)).multiplyScalar(.9);
 U.uSand87.value.set(z.biome==='arctic'?0xb8c0c4:z.biome==='scorch'?0xc8925a:0xd6be8c);
 if(ON('ground'))hook(top,'top');if(ON('cliff'))hook(side,'side');
 if(ON('cliff'))W6.island.children.forEach(o=>{if(o.geometry&&o.geometry.type==='ConeGeometry'&&o.material&&o.material.isMeshStandardMaterial)hook(o.material,'side')});
 // clear grass off paths, rock and wet sand
 const dctx=cx.getImageData(0,0,cv.width,cv.height).data;const at=(x,y)=>{const u=Math.max(0,Math.min(cv.width-1,Math.floor((x+C0+.5)*PX))),v=Math.max(0,Math.min(cv.height-1,Math.floor((y+C0+.5)*PX)));return dctx[(v*cv.width+u)*4]/255};
 W6.island.children.forEach(o=>{if(!o.isInstancedMesh||o===im||!o.geometry||o.count<100)return;const gt=o.geometry.type;if(!(gt==='PlaneGeometry'||(gt==='BufferGeometry'&&o.material&&o.material.isMeshLambertMaterial)))return;const m=new THREE.Matrix4(),p=new THREE.Vector3(),q=new THREE.Quaternion(),sc=new THREE.Vector3();let k2=0;
  for(let k=0;k<o.count;k++){o.getMatrixAt(k,m);m.decompose(p,q,sc);if(sc.x===0)continue;const i=Math.round(p.x+C0),j=Math.round(p.z+C0);const pv=at(p.x,p.z);
   const ti=(j*n+i)*4;const w=(data[ti+2]||0)/255;const hh=(data[ti]||0)/40;const gr=G.HT?Math.abs((G.HT(i+1,j)||0)-(G.HT(i-1,j)||0))+Math.abs((G.HT(i,j+1)||0)-(G.HT(i,j-1)||0)):0;
   const r=Math.sin(k*91.7)*.5+.5;const oc=(data[ti+3]||0)/255,ed=(data[ti+1]||0)/255;if(pv>.42||w>.3||oc>.45||(oc>.2&&r<.6)||(ed<.3&&r<.55)||(gr>.9&&r<.7)||(hh>2.1&&r<.5)){sc.multiplyScalar(pv>.45&&pv<.6?.45:0);m.compose(p,q,sc);o.setMatrixAt(k,m);k2++}}
  o.instanceMatrix.needsUpdate=true;D.cleared+=k2});
 D.builds++}
let isl=null,pend=null;setInterval(()=>{if(document.hidden)return;if(W6.island&&W6.island!==isl&&W6.island!==pend&&G._groundIM&&W6.island.children.includes(G._groundIM)){const me=pend=W6.island;setTimeout(()=>{if(W6.island===me){isl=me;try{build()}catch(e){console.warn('r87 build',e)}}},900)}},700);
// auto-lowering hook (perf621 -> FSperfStep 1..3; then reload to Low where none of this runs)
{const ps0=G.FSperfStep;G.FSperfStep=n=>{try{if(ps0)ps0(n)}catch(e){}try{if(n>=1){U.uDet87.value=0;D.det=0}if(n>=3){U.uOn87.value=0;D.on=0}}catch(e){console.warn('r87 perf',e)}}}
}

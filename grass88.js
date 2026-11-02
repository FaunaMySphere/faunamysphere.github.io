// v8.8: dense meadow grass that waves in the wind + 8 new plant types. Visual only: never touches the save.
// - Long grass clumps (3 blade shapes) fill the open ground; travelling wind waves bend them and roll a bright sheen across the field.
// - New plants: ferns, cattail reeds (by water), clover, leafy shrubs, blue lupines, daisies, foxtail grass, dandelion puffs. Mixed per biome.
// - Respects v8.7 terrain: nothing grows on paths, rock or wet sand, or under landmarks.
// Tiers: Low = nothing. Med = quarter density. Phone High = half density. PC High = full.
// Switches: ?r88off (all) ?r88nograss ?r88noplants ?r88nowind
// Auto-lowering: step 1 halves the grass, step 2 halves it again and drops plants to half, step 3 hides it all.
import * as THREE from 'three';
const G=window,QS=new URLSearchParams(location.search);
if(!QS.has('r88off'))(function boot(){if(!G.W6||!G.GL)return setTimeout(boot,150);try{start()}catch(e){console.warn('r88',e)}})();
function start(){
const W6=G.W6,Q=G.GL.Q;if(Q==='low')return;
const isPhone=matchMedia('(pointer:coarse)').matches||innerWidth<700,ON=k=>!QS.has('r88no'+k);
const DEN=Q==='high'?(isPhone?.5:1):.25;
const D=G.FS_R88={Q,isPhone,den:DEN,builds:0,clumps:0,plants:0,perf:0};
const UW={uT88:{value:0},uDir88:{value:new THREE.Vector2(.8,.6).normalize()},uAmp88:{value:ON('wind')?1:0}};
const t0=performance.now();
// ---------- wind: world-space travelling waves + gusts, bright sheen on the crests ----------
function windMat(m,amp,sheen){m.onBeforeCompile=s=>{Object.assign(s.uniforms,UW);
 s.vertexShader='uniform float uT88,uAmp88;uniform vec2 uDir88;attribute float aH88;varying float vS88;varying float vH88;\n'+s.vertexShader.replace('#include <project_vertex>',`
 vec4 mvPosition=vec4(transformed,1.);
 #ifdef USE_INSTANCING
 mvPosition=instanceMatrix*mvPosition;vec2 wp=(instanceMatrix*vec4(0.,0.,0.,1.)).xz;
 #else
 vec2 wp=mvPosition.xz;
 #endif
 float ph=dot(wp,uDir88);float wv=sin(ph*.55-uT88*1.7)*.5+.5;float gs=sin(ph*.17-uT88*.6+sin(wp.x*.3+wp.y*.2))*.5+.5;
 float k=wv*wv*.75+gs*.55+.15*sin(uT88*3.1+wp.x*2.3+wp.y*1.7);float h2=aH88*aH88;
 mvPosition.xz+=uDir88*k*h2*${amp.toFixed(3)}*uAmp88;mvPosition.y-=k*h2*${(amp*.35).toFixed(3)}*uAmp88;vS88=smoothstep(.55,1.,wv)*uAmp88;vH88=aH88;
 mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;`);
 s.fragmentShader='varying float vS88;varying float vH88;\n'+s.fragmentShader.replace('#include <opaque_fragment>',`outgoingLight*=1.+vS88*${sheen.toFixed(2)}*vH88;outgoingLight*=mix(.62,1.,vH88);\n#include <opaque_fragment>`)};
 m.customProgramCacheKey=()=>'r88w'+amp+sheen;return m}
// ---------- geometry helpers (original, procedural, vertex-coloured) ----------
const P=[];function add(pos,col,h){P.push([pos,col,h])}
function build(parts){let n=0;parts.forEach(p=>n+=p[0].length/3);const pos=new Float32Array(n*3),col=new Float32Array(n*3),hh=new Float32Array(n);let o=0;
 parts.forEach(([p,c,h])=>{pos.set(p,o*3);col.set(c,o*3);hh.set(h,o);o+=p.length/3});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setAttribute('aH88',new THREE.BufferAttribute(hh,1));g.computeVertexNormals();
 // grass reads better lit from above: point normals up-ish
 const nr=g.attributes.normal;for(let i=0;i<nr.count;i++){nr.setXYZ(i,nr.getX(i)*.35,Math.abs(nr.getY(i))*.35+.75,nr.getZ(i)*.35)}g.computeBoundingSphere();return g}
const R=(()=>{let s=1234567;return()=>{s=(s*16807)%2147483647;return s/2147483647}})();
const C=(h)=>new THREE.Color(h);
// a bent tapered blade: 2 segments + tip (3 quads->tris), rooted at (x,z), facing angle a, lean l
function blade(parts,x,z,a,H,W,lean,c0,c1){const p=[],c=[],h=[];const dx=Math.cos(a),dz=Math.sin(a),lx=Math.cos(a+1.57)*lean,lz=Math.sin(a+1.57)*lean;
 const pt=(t,s)=>{const w=W*(1-t*.85)*s,b=t*t;return[x+dx*w+lx*b*H,t*H,z+dz*w+lz*b*H]};const col=t=>{const k=c0.clone().lerp(c1,t);return[k.r,k.g,k.b]};
 const T=[0,.45,.8,1];for(let i=0;i<3;i++){const a0=T[i],a1=T[i+1];const A=pt(a0,-1),B=pt(a0,1),Cc=pt(a1,-1),Dd=pt(a1,1);
  if(i<2){p.push(...A,...B,...Dd,...A,...Dd,...Cc);c.push(...col(a0),...col(a0),...col(a1),...col(a0),...col(a1),...col(a1));h.push(a0,a0,a1,a0,a1,a1)}
  else{const tip=pt(1,0);p.push(...A,...B,...tip);c.push(...col(a0),...col(a0),...col(1));h.push(a0,a0,1)}}
 parts.push([p,c,h])}
function blob(parts,cx,cy,cz,r,col,sq,hb){const g=new THREE.IcosahedronGeometry(r,0).toNonIndexed();const a=g.attributes.position;const p=[],c=[],h=[];for(let i=0;i<a.count;i++){const y=a.getY(i)*(sq||1);p.push(cx+a.getX(i),cy+y,cz+a.getZ(i));const k=col.clone().multiplyScalar(.82+.3*(a.getY(i)/r*.5+.5));c.push(k.r,k.g,k.b);h.push(hb!=null?hb:Math.min(1,(cy+y)/.5))}parts.push([p,c,h]);g.dispose()}
function stem(parts,x,z,H,col,lean){blade(parts,x,z,R()*6.28,H,.012,lean||.05,col.clone().multiplyScalar(.7),col)}
// ---------- the kinds ----------
function grassClump(v,pal){const parts=[];const nB=6;for(let i=0;i<nB;i++){const a=R()*6.28,r=R()*.09;const sh=v%3;const H=(sh===0?.34:sh===1?.48:.26)*(.75+R()*.5),W=sh===2?.05:sh===1?.022:.032;
  const c1=pal.tip.clone().offsetHSL((R()-.5)*.03,0,(R()-.5)*.08);blade(parts,Math.cos(a)*r,Math.sin(a)*r,R()*6.28,H,W,.08+R()*.14,pal.base,c1)}return build(parts)}
const KINDS={
 fern:()=>{const p=[];for(let i=0;i<7;i++){const a=i/7*6.28+R()*.3;const L=.32+R()*.12;for(let k=0;k<5;k++){const t=k/5;const x=Math.cos(a)*L*t,z=Math.sin(a)*L*t,y=Math.sin(t*2.4)*.18;blade(p,x,z,a+1.57,.07*(1-t)+.03,.03,.0,C(0x2f6a22),C(0x6aa84a));p[p.length-1][0]=p[p.length-1][0].map((v,j)=>j%3===1?v+y:v)}
   blade(p,0,0,a,.0001,.0001,0,C(0x2f6a22),C(0x2f6a22))}return build(p)},
 reeds:()=>{const p=[];for(let i=0;i<7;i++){const a=R()*6.28,r=R()*.12,x=Math.cos(a)*r,z=Math.sin(a)*r,H=.6+R()*.35;blade(p,x,z,R()*6.28,H,.02,.06,C(0x3e6a2a),C(0x9ab060));if(i<3)blob(p,x+.02,H*.82,z,.035,C(0x6a4226),2.2,.85)}return build(p)},
 clover:()=>{const p=[];for(let i=0;i<9;i++){const a=R()*6.28,r=R()*.16;const x=Math.cos(a)*r,z=Math.sin(a)*r;stem(p,x,z,.07,C(0x4a8a34));for(let k=0;k<3;k++){const b=k*2.09+R();blob(p,x+Math.cos(b)*.025,.075,z+Math.sin(b)*.025,.028,C(0x4f9a3a),.35,.4)}if(i===0)blob(p,x,.11,z,.03,C(0xf0e6f0),1,.5)}return build(p)},
 shrub:()=>{const p=[];const c=C(0x3f7a2c);for(let i=0;i<6;i++){const a=R()*6.28,r=R()*.13;blob(p,Math.cos(a)*r,.12+R()*.12,Math.sin(a)*r,.11+R()*.06,c.clone().offsetHSL((R()-.5)*.04,0,(R()-.5)*.08),.85)}return build(p)},
 lupine:()=>{const p=[];const cs=[0x5a62d8,0x8a5ad0,0xd86aa8];for(let i=0;i<4;i++){const a=R()*6.28,r=R()*.1,x=Math.cos(a)*r,z=Math.sin(a)*r,H=.34+R()*.18;stem(p,x,z,H,C(0x4a7a30),.03);const cc=C(cs[Math.floor(R()*3)]);for(let k=0;k<6;k++)blob(p,x+(R()-.5)*.012,H*.6+k*H*.07,z,.026*(1-k/9),cc,1,.75)}return build(p)},
 daisy:()=>{const p=[];for(let i=0;i<6;i++){const a=R()*6.28,r=R()*.13,x=Math.cos(a)*r,z=Math.sin(a)*r,H=.14+R()*.1;stem(p,x,z,H,C(0x4f8a34));blob(p,x,H,z,.04,C(0xfafaf2),.3,.9);blob(p,x,H+.012,z,.017,C(0xf2c230),.6,.9)}return build(p)},
 foxtail:()=>{const p=[];for(let i=0;i<6;i++){const a=R()*6.28,r=R()*.1,x=Math.cos(a)*r,z=Math.sin(a)*r,H=.45+R()*.2;blade(p,x,z,R()*6.28,H,.014,.18,C(0x7a8a40),C(0xc8b870));blob(p,x+.18*.9*H*.0,H*.95,z,.03,C(0xd8c890),2.4,1)}return build(p)},
 puff:()=>{const p=[];for(let i=0;i<4;i++){const a=R()*6.28,r=R()*.1,x=Math.cos(a)*r,z=Math.sin(a)*r,H=.2+R()*.12;stem(p,x,z,H,C(0x5a8a3a));blob(p,x,H,z,.045,C(0xf4f4ee),1,1)}for(let k=0;k<4;k++)blade(p,0,0,k*1.57,.08,.04,.15,C(0x3f7a2c),C(0x5f9a3c));return build(p)}};
const BIO={arctic:{w:{shrub:2,fern:1,puff:1,foxtail:2},g:.35},scorch:{w:{foxtail:4,shrub:1},g:.5},mesa:{w:{foxtail:3,shrub:2},g:.5},swamp:{w:{reeds:3,fern:3,clover:1,shrub:1},g:.9},candy:{w:{daisy:2,lupine:3,puff:2,clover:1},g:.8},dungeon:{w:{},g:0}};
const DEF={w:{fern:2,clover:2,shrub:2,lupine:1.5,daisy:2,foxtail:1.5,puff:1,reeds:0},g:1};
let cur=[];const mats={};
function grassPal(biome){const top=G._groundIM&&[].concat(G._groundIM.material)[2];let c=C(0x6aa83a);try{if(top&&top.userData.flat!=null)c=C(top.userData.flat)}catch(e){}
 if(biome==='arctic')c=C(0x9aa88a);if(biome==='scorch'||biome==='mesa')c=C(0xa8a060);return{base:c.clone().multiplyScalar(.45),tip:c.clone().lerp(C(0xe8f0a0),.35)}}
function clear(){cur.forEach(m=>{W6.scene.remove(m);m.parent&&m.parent.remove(m);m.geometry.dispose()});cur=[]}
function make(isl){clear();let z,s;try{z=Z(S.zone);s=zs(S.zone)}catch(e){return}if(!z||z.biome==='dungeon')return;const im=G._groundIM;if(!im)return;
 const T=G.FS_T87&&G.FS_T87.isl===isl?G.FS_T87:null;const n=z.n,C0=(n-1)/2;const tiles=im.userData.tiles||[];const B=BIO[z.biome]||DEF;
 const busy=(s.objs||[]).filter(o=>o.i!=null&&!/poll|tox/.test(o.type)).map(o=>[o.i-C0,o.j-C0]);
 const mask=(x,y)=>{if(busy.some(b=>Math.abs(b[0]-x)<.6&&Math.abs(b[1]-y)<.6))return 1;if(!T)return 0;const i=Math.round(x+C0),j=Math.round(y+C0),p=(j*n+i)*4;const d=T.data;
  if(T.pathAt(x,y)>.3)return 1;if(d[p+2]/255>.3)return 1;if(d[p+3]/255>.35)return 1;const gr=G.HT?Math.abs((G.HT(i+1,j)||0)-(G.HT(i-1,j)||0))+Math.abs((G.HT(i,j+1)||0)-(G.HT(i,j-1)||0)):0;if(gr>.9)return .6;return 0};
 const hgt=(x,y)=>G.HGT?G.HGT(x,y):0;const sd=(()=>{let h=0;for(const c of String(S.zone))h=(h*31+c.charCodeAt(0))|0;return h})();let rs=Math.abs(sd)+1;const rnd=()=>{rs=(rs*16807)%2147483647;return rs/2147483647};
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),sc=new THREE.Vector3();const col=new THREE.Color();
 // grass: 3 clump variants, shuffled so lowering density stays even
 if(ON('grass')&&B.g>0){const pal=grassPal(z.biome);const per=Math.round(26*DEN*B.g);const mat=mats.g||(mats.g=windMat(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),.32,.45));
  for(let vv=0;vv<3;vv++){const geo=grassClump(vv,pal);const pts=[];for(const[i,j]of tiles){const x0=i-C0,y0=j-C0;for(let k=0;k<per/3;k++){const x=x0+rnd()-.5,y=y0+rnd()-.5;const mk=mask(x,y);if(mk>=1||rnd()<mk)continue;pts.push([x,y])}}
   for(let k=pts.length-1;k>0;k--){const r=Math.floor(rnd()*(k+1));[pts[k],pts[r]]=[pts[r],pts[k]]}
   const mesh=new THREE.InstancedMesh(geo,mat,Math.max(1,pts.length));pts.forEach(([x,y],k)=>{e.set(0,rnd()*6.28,0);q.setFromEuler(e);const s2=.8+rnd()*.55;sc.set(s2,s2*(.85+rnd()*.4),s2);v.set(x,hgt(x,y),y);m4.compose(v,q,sc);mesh.setMatrixAt(k,m4);col.setHSL(0,0,.86+rnd()*.24);mesh.setColorAt(k,col)});
   mesh.count=pts.length;mesh.userData.full=pts.length;mesh.userData.r88='g';mesh.receiveShadow=true;mesh.frustumCulled=false;isl.add(mesh);cur.push(mesh);D.clumps+=pts.length}}
 // plants
 if(ON('plants')){const kinds=Object.entries(B.w).filter(([k,w])=>w>0);const tot=kinds.reduce((a,b)=>a+b[1],0);const perT=1.5*(DEN<1?Math.max(.35,DEN):1);
  const PTS={};kinds.forEach(([k])=>PTS[k]=[]);for(const[i,j]of tiles){const x0=i-C0,y0=j-C0;let cnt=Math.floor(perT)+(rnd()<perT%1?1:0);
   for(let k=0;k<cnt;k++){const x=x0+rnd()-.5,y=y0+rnd()-.5;if(mask(x,y)>=.6)continue;let r=rnd()*tot,kind=kinds[0]&&kinds[0][0];for(const[kk,w]of kinds){if((r-=w)<=0){kind=kk;break}}if(kind)PTS[kind].push([x,y])}
   // reeds hug the water
   if(T&&B.w.reeds!==undefined||true){const p=(j*n+i)*4;const w=T?T.data[p+2]/255:0;if(w>.05&&w<.45&&!(z.biome==='arctic')){for(let k=0;k<3;k++){const x=x0+rnd()-.5,y=y0+rnd()-.5;if(!busy.some(b=>Math.abs(b[0]-x)<.6&&Math.abs(b[1]-y)<.6))(PTS.reeds||(PTS.reeds=[])).push([x,y])}}}}
  for(const[k,pts]of Object.entries(PTS)){if(!pts.length)continue;const geo=KINDS[k]();const mat=mats[k]||(mats[k]=windMat(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),k==='reeds'||k==='foxtail'?.22:k==='shrub'?.04:.1,.15));
   const mesh=new THREE.InstancedMesh(geo,mat,pts.length);pts.forEach(([x,y],i)=>{e.set(0,rnd()*6.28,0);q.setFromEuler(e);const s2=.85+rnd()*.5;sc.set(s2,s2,s2);v.set(x,hgt(x,y),y);m4.compose(v,q,sc);mesh.setMatrixAt(i,m4)});
   mesh.userData.full=pts.length;mesh.userData.r88='p';mesh.castShadow=k==='shrub';mesh.receiveShadow=true;mesh.frustumCulled=false;isl.add(mesh);cur.push(mesh);D.plants+=pts.length}}
 if(cur[0])cur[0].onBeforeRender=()=>{UW.uT88.value=(performance.now()-t0)/1000};applyPerf();D.builds++;D.zone=S.zone;D.masks=!!T}
function applyPerf(){const n=D.perf;cur.forEach(m=>{const f=m.userData.full;if(m.userData.r88==='g')m.count=n>=3?0:Math.floor(f*(n>=2?.25:n>=1?.5:1));else m.count=n>=3?0:Math.floor(f*(n>=2?.5:1));m.visible=m.count>0})}
// rebuild per island, after v8.7 terrain is ready (or 3 s without it)
let isl=null,pend=null;setInterval(()=>{if(document.hidden)return;const I=W6.island;if(I&&I!==isl&&I!==pend&&G._groundIM&&I.children.includes(G._groundIM)){pend=I;const t1=performance.now();
 const go=()=>{if(W6.island!==I)return;if(!(G.FS_T87&&G.FS_T87.isl===I)&&performance.now()-t1<3000)return setTimeout(go,300);isl=I;try{make(I)}catch(e){console.warn('r88 build',e)}};setTimeout(go,1200)}},700);
{const ps0=G.FSperfStep;G.FSperfStep=n=>{try{if(ps0)ps0(n)}catch(e){}try{D.perf=Math.max(D.perf,n);applyPerf()}catch(e){console.warn('r88 perf',e)}}}
}

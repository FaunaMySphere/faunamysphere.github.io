// v7.6 PREVIEW (rev 2): distant themed backdrop islands around the home base (decorative only).
// Organic noise-displaced landmass (grassy cap + layered strata cliffs + dripping rocky underside), themed props,
// waterfalls / lava falls / glow, baked atmospheric perspective. One merged mesh per island (+1 additive glow mesh on Med/High).
// LOD: High = dense mesh + full props; Med = half; Low = coarse + few props. No per-frame allocation.
import * as THREE from 'three';
const G=window;
// palette: top, top2, cliff, cliff2, under, accent, glow
const TH=[
 {id:'glowcap',p:['#2E6B55','#3f8a6a','#4a3a5e','#5b4a70','#2a2238','#c86bff','#7dfcff'],k:'shroom'},
 {id:'skyreach',p:['#7fc45a','#a4d86e','#a88760','#8a6a48','#5e4630','#ffffff','#bfe8ff'],k:'sky'},
 {id:'cinder',p:['#3d302c','#55403a','#2e2422','#45302a','#1a1414','#ff5a1f','#ff8a2a'],k:'lava'},
 {id:'prism',p:['#b8a8dc','#d6c8f0','#7B6A9C','#9384b8','#4a3e66','#9ff0ff','#e0b0ff'],k:'crystal'},
 {id:'auroramere',p:['#e4f2f8','#c8e2ee','#5B7A99','#7290ad','#344c66','#7FD0E8','#3affc8'],k:'aurora'},
 {id:'rockisland',p:['#7f9a5e','#98ad70','#8a8174','#a29a8a','#5a544c','#b9b2a4','#bfe8ff'],k:'rock'},
 {id:'avalanche',p:['#f2f6fa','#dde7f0','#8e9aa8','#a9b4c0','#55606e','#ffffff','#bfe8ff'],k:'snow'},
 {id:'ruins',p:['#4f8a3a','#6aa548','#7a5a3c','#94704a','#4a3826','#2f6b2a','#bfe8ff'],k:'forest'},
 {id:'maplevale',p:['#b9873a','#d49a40','#7A4E2C','#94603a','#4c3020','#d9622a','#bfe8ff'],k:'maple'}];
let sd=1;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
// cheap value noise (seeded per island)
const hs=(x,y)=>{const s=Math.sin(x*127.1+y*311.7+sd*.001)*43758.5453;return s-Math.floor(s)};
const vn=(x,y)=>{const i=Math.floor(x),j=Math.floor(y),f=x-i,g=y-j,u=f*f*(3-2*f),v=g*g*(3-2*g);return(hs(i,j)*(1-u)+hs(i+1,j)*u)*(1-v)+(hs(i,j+1)*(1-u)+hs(i+1,j+1)*u)*v};
const fb=(x,y,o=4)=>{let a=0,m=.5,f=1;for(let k=0;k<o;k++){a+=vn(x*f,y*f)*m;f*=2.03;m*=.5}return a};
const parts=[],glows=[];const C=new THREE.Color(),C2=new THREE.Color();
const M=new THREE.Matrix4(),Q=new THREE.Quaternion(),V=new THREE.Vector3(),SC=new THREE.Vector3(),E=new THREE.Euler();
const mt=(x,y,z,sx,sy,sz,rx=0,ry=0,rz=0)=>M.compose(V.set(x,y,z),Q.setFromEuler(E.set(rx,ry,rz)),SC.set(sx,sy??sx,sz??sx)).clone();
// add a geometry; col = colour or fn(x,y,z)->Color; jitter for vertex variation
function add(geo,col,arr,m,jit=.1,smooth=false){if(m)geo.applyMatrix4(m);if(smooth)geo.computeVertexNormals();geo=geo.index?geo.toNonIndexed():geo;if(!smooth)geo.computeVertexNormals();
 const P=geo.attributes.position,n=P.count,ca=new Float32Array(n*3);
 for(let k=0;k<n;k++){if(typeof col==='function')col(P.getX(k),P.getY(k),P.getZ(k),C);else C.set(col);const j=1+(rnd()-.5)*jit;ca[k*3]=C.r*j;ca[k*3+1]=C.g*j;ca[k*3+2]=C.b*j}
 const g=new THREE.BufferGeometry();g.setAttribute('position',P);g.setAttribute('normal',geo.attributes.normal);g.setAttribute('color',new THREE.BufferAttribute(ca,3));(arr||parts).push(g)}
function merge(list){let n=0;list.forEach(g=>n+=g.attributes.position.count);const P=new Float32Array(n*3),N=new Float32Array(n*3),Cc=new Float32Array(n*3);let o=0;
 list.forEach(g=>{P.set(g.attributes.position.array,o*3);N.set(g.attributes.normal.array,o*3);Cc.set(g.attributes.color.array,o*3);o+=g.attributes.position.count});
 const r=new THREE.BufferGeometry();r.setAttribute('position',new THREE.BufferAttribute(P,3));r.setAttribute('normal',new THREE.BufferAttribute(N,3));r.setAttribute('color',new THREE.BufferAttribute(Cc,3));r.computeBoundingSphere();return r}
// landmass: polar grid. rings over top cap (r 0..1), then cliff band, then tapering noisy underside to a point.
function land(T,seg,rings,cx=0,cz=0,s=1){const p=T.p;const rad=a=>.82+.28*fb(Math.cos(a)*1.6+5,Math.sin(a)*1.6+5,3);
 // profile: list of [radiusFactor, y]
 const prof=[];for(let i=0;i<=rings;i++){const t=i/rings;prof.push([t,.08*(1-t*t)])} // cap
 prof.push([1.02,-.04],[1.0,-.18],[1.05,-.3],[.97,-.46],[1.0,-.58]); // layered cliffs (ledges)
 const ud=Math.max(4,rings);for(let i=1;i<=ud;i++){const t=i/ud;prof.push([.95*Math.pow(1-t,1.25)+.02,-.58-1.7*Math.pow(t,.9)])}
 const L=prof.length,pos=[],idx=[];
 for(let i=0;i<L;i++)for(let j=0;j<=seg;j++){const a=j/seg*6.283,[rf,y]=prof[i];let r=rf*rad(a);let yy=y;
  if(i<=rings){yy+=(fb(Math.cos(a)*r*3+1,Math.sin(a)*r*3+1,4)-.5)*.16*rf;} // rolling cap
  else{const d=fb(a*3+i*.7,y*5,4);r*=.85+.35*d;if(y<-.6)yy+=(d-.5)*.25}
  pos.push(cx+Math.cos(a)*r*s,yy*s,cz+Math.sin(a)*r*s)}
 for(let i=0;i<L-1;i++)for(let j=0;j<seg;j++){const A=i*(seg+1)+j,B=A+seg+1;idx.push(A,A+1,B,A+1,B+1,B)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
 const cT=new THREE.Color(p[0]),cT2=new THREE.Color(p[1]),cC=new THREE.Color(p[2]),cC2=new THREE.Color(p[3]),cU=new THREE.Color(p[4]);
 add(g,(x,y,z,o)=>{const ly=y/s;if(ly>-.03){const n=fb(x*4/s+9,z*4/s+9,3);o.copy(cT).lerp(cT2,n);const rr=Math.hypot(x-cx,z-cz)/s;if(rr>.8)o.lerp(cC2,(rr-.8)*1.8)}
  else if(ly>-.62){const band=Math.sin(ly*40+fb(x*3/s,z*3/s,2)*6)*.5+.5;o.copy(cC).lerp(cC2,band)}
  else{o.copy(cC).lerp(cU,Math.min(1,(-ly-.6)/1.2));o.multiplyScalar(.85+.3*fb(x*5/s,y*5/s,2))}},0,null,.08,true);
 return prof}
const capY=(x,z)=>.08*(1-Math.min(1,x*x+z*z))+.02;
const spot=(R=.72)=>{const a=rnd()*6.283,r=Math.sqrt(rnd())*R;return[Math.cos(a)*r,Math.sin(a)*r]};
function tree(x,z,s,leaf,leaf2,lvl,kind){const y=capY(x,z);add(new THREE.CylinderGeometry(.025*s,.04*s,.3*s,5),'#5a3d26',0,mt(x,y+.15*s,z,1));
 if(kind==='pine'){for(let t=0;t<(lvl==='high'?3:2);t++)add(new THREE.ConeGeometry((.18-t*.045)*s,.28*s,lvl==='high'?7:5),C2.set(leaf).lerp(new THREE.Color(leaf2),t/3).getStyle(),0,mt(x,y+(.3+t*.13)*s,z,1),.15)}
 else{const n=lvl==='high'?3:1;for(let t=0;t<n;t++){const g=new THREE.IcosahedronGeometry(.16*s,lvl==='high'?1:0);add(g,t%2?leaf:leaf2,0,mt(x+(rnd()-.5)*.12*s,y+(.38+rnd()*.1)*s,z+(rnd()-.5)*.12*s,1,.85,1),.2)}}}
function fall(x,z,col,glow,len){// waterfall / lava fall over the rim: tapering ribbon + mist puff
 const g=new THREE.PlaneGeometry(.14,len,1,6);const ps=g.attributes.position;for(let k=0;k<ps.count;k++){const t=(ps.getY(k)+len/2)/len;ps.setX(k,ps.getX(k)*(.6+.8*(1-t)));ps.setZ(k,(1-t)*(1-t)*.25)}
 const a=Math.atan2(z,x);add(g,col,glow?glows:glows,mt(x,-len/2+.02,z,1,1,1,0,-a+Math.PI/2,0),.25)}
function props(T,lvl){const p=T.p,n=lvl==='low'?4:lvl==='med'?9:18;
 for(let k=0;k<n;k++){const[x,z]=spot(),s=.6+rnd()*.7,y=capY(x,z);
  if(T.k==='shroom'){add(new THREE.CylinderGeometry(.035*s,.06*s,.4*s,6),'#e8e0d0',0,mt(x,y+.2*s,z,1));add(new THREE.SphereGeometry(.2*s,lvl==='high'?10:6,4,0,6.283,0,1.5),k%2?p[5]:p[6],k%3?0:glows,mt(x,y+.4*s,z,1,.7,1),.2);
   if(lvl!=='low'&&k%2)add(new THREE.SphereGeometry(.03,4,3),p[6],glows,mt(x+.1,y+.05,z+.05,1))}
  else if(T.k==='crystal'){const c=lvl==='low'?1:3;for(let t=0;t<c;t++){const h=(.4+rnd()*.5)*s;add(new THREE.CylinderGeometry(0,.07*s,h,6),[p[5],p[6],'#ffffff'][t%3],t?0:glows,mt(x+(rnd()-.5)*.1,y+h/2,z+(rnd()-.5)*.1,1,1,1,(rnd()-.5)*.7,0,(rnd()-.5)*.7),.15)}}
  else if(T.k==='lava'){if(k%3===0)add(new THREE.CircleGeometry(.14*s,8),p[5],glows,mt(x,y+.012,z,1,1,1,-Math.PI/2),.3);else{add(new THREE.ConeGeometry(.12*s,.5*s,6,2),'#2a1d1b',0,mt(x,y+.22*s,z,1),.2)}}
  else if(T.k==='aurora'){tree(x,z,s*.9,'#d8ecf4','#9fc3d6',lvl,'pine')}
  else if(T.k==='rock'){add(new THREE.DodecahedronGeometry(.13*s,lvl==='high'?1:0),p[5],0,mt(x,y+.08*s,z,1,.7,1,rnd(),rnd(),0),.25);if(k%3===0)tree(x+.1,z,s*.8,'#4f7d3a','#6a9a48',lvl,'round')}
  else if(T.k==='snow'){tree(x,z,s,'#3f6a52','#e8f0f6',lvl,'pine')}
  else if(T.k==='maple'){tree(x,z,s,k%2?'#d9622a':'#e8a83a','#c0392b',lvl,'round')}
  else if(T.k==='forest'||T.k==='sky'){tree(x,z,s,k%2?'#3f7f34':'#58a03e','#2f6b2a',lvl,k%3?'round':'pine')}}
 // signature features
 if(T.k==='snow')add(new THREE.ConeGeometry(.4,.9,lvl==='low'?6:10,3),(x,y,z,o)=>o.set(y>.55?'#ffffff':'#9aa6b4'),0,mt(-.2,.45,-.15,1),.1);
 if(T.k==='lava'){add(new THREE.ConeGeometry(.42,.7,lvl==='low'?7:12,2,true),'#2a1d1b',0,mt(.05,.38,0,1),.15);add(new THREE.CircleGeometry(.13,10),'#ffb040',glows,mt(.05,.72,0,1,1,1,-Math.PI/2));if(lvl!=='low')fall(.95,.2,'#ff6a1a',1,.9)}
 if(T.k==='aurora'&&lvl!=='low'){add(new THREE.CircleGeometry(.4,16),'#7FD0E8',0,mt(.1,.07,.1,1,1,1,-Math.PI/2));const g=new THREE.PlaneGeometry(2.2,.7,12,1);const ps=g.attributes.position;for(let k=0;k<ps.count;k++)ps.setZ(k,Math.sin(ps.getX(k)*2.5)*.25);add(g,(x,y)=>C.set(y>0?'#9b6bff':'#3affc8'),glows,mt(0,1.7,0,1),.1)}
 if((T.k==='forest'||T.k==='sky'||T.k==='rock'||T.k==='maple')&&lvl!=='low')fall(-.9,.35,'#d8f0ff',1,1.1+rnd()*.5);
 if(T.k==='forest'){const c='#b8b0a0';[[.3,.2],[.55,.2]].forEach(([x,z])=>add(new THREE.BoxGeometry(.1,.5,.1),c,0,mt(x,.3,z,1),.2));add(new THREE.BoxGeometry(.4,.08,.13),c,0,mt(.42,.58,.2,1))}
 if(T.k==='crystal'&&lvl!=='low'){const h=1.1;add(new THREE.CylinderGeometry(0,.18,h,6),p[6],glows,mt(0,h/2,0,1,1,1,.1,0,.05),.1)}}
let grp=null,isl=[],mat=null,gmat=null;
function build(){const sc=G.GL&&G.GL.scene;if(!sc||typeof S==='undefined'||!S.zones||!S.zones.home)return false;
 const lvl=G.GL.Q==='low'?'low':G.GL.Q==='med'?'med':'high';const cnt=lvl==='low'?4:lvl==='med'?6:9;const n=(S.zones.home.tiles||[]).length||9;
 const seg=lvl==='high'?40:lvl==='med'?22:12,rings=lvl==='high'?7:lvl==='med'?4:2;
 mat=lvl==='high'?new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0}):new THREE.MeshLambertMaterial({vertexColors:true});
 gmat=new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,opacity:.9,side:THREE.DoubleSide,depthWrite:false,blending:THREE.AdditiveBlending,fog:true});
 grp=new THREE.Group();grp.name='w76islands';const fogC=new THREE.Color(sc.fog?sc.fog.color:'#bcd');
 for(let k=0;k<cnt;k++){const T=TH[k];sd=1234+k*977;parts.length=0;glows.length=0;
  if(T.k==='sky'){land(T,Math.round(seg*.6),Math.max(2,rings-2),-.45,-.2,.55);land(T,Math.round(seg*.6),Math.max(2,rings-2),.55,0,.45);land(T,Math.round(seg*.5),2,0,.6,.38)}else land(T,seg,rings);props(T,lvl);
  const far=k%3;const geo=merge(parts);
  // baked atmospheric perspective: farther ring = more haze + less contrast
  const ca=geo.attributes.color.array,h=.05+far*.1;for(let i=0;i<ca.length;i+=3){ca[i]+= (fogC.r-ca[i])*h;ca[i+1]+=(fogC.g-ca[i+1])*h;ca[i+2]+=(fogC.b-ca[i+2])*h}
  const g=new THREE.Group();g.add(new THREE.Mesh(geo,mat));if(glows.length&&lvl!=='low')g.add(new THREE.Mesh(merge(glows),gmat));
  // v7.6.1: islands ~3x bigger (props scale with the group); pushed further out + lower so they clear the home base, camera and each other
  const SC=3,a=k/cnt*6.283+(rnd()-.5)*.3,R=n*(1.65+far*.65+rnd()*.12),sz=n*(.125+rnd()*.06)*(1-far*.2)*SC;
  g.position.set(Math.cos(a)*R,-n*(.45+far*.3+rnd()*.12),Math.sin(a)*R);g.scale.setScalar(sz);g.rotation.y=rnd()*6.28;g.userData={y0:g.position.y,ph:k*1.7,id:T.id};
  isl.push(g);grp.add(g)}
 sc.add(grp);return true}
function nm(id){const z=(G.ZONES||[]).find(z=>z.id===id);return z?z.name:id}
let built=false;const t0=performance.now();
setInterval(()=>{try{if(!built){built=build();return}grp.visible=S.zone==='home'}catch(e){}},500);
(function bob(){requestAnimationFrame(bob);if(!grp||!grp.visible)return;const t=(performance.now()-t0)/1000;for(const g of isl){g.position.y=g.userData.y0+Math.sin(t*.35+g.userData.ph)*.35;g.rotation.y+=.0004}})();
G.FSislands=()=>({grp,n:isl.length,names:isl.map(g=>nm(g.userData.id)),tris:isl.reduce((a,g)=>a+g.children.reduce((b,m)=>b+m.geometry.attributes.position.count/3,0),0)});

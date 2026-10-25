// v6 realistic worlds (High graphics only). Home + Rock Garden first. Code-drawn textures only.
import * as THREE from 'three';
const G=window,W=G.W6,ON={home:1,rockgarden:1};
if(W&&G.REAL){
const {scene,QP,U}=W,hi=(G.GL&&G.GL.Q)==='high';
const cvs=(w,h,f)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t};
let rs=1;const rnd=()=>{rs=(rs*16807)%2147483647;return(rs-1)/2147483646};
// --- textures ---
const strata=cvs(256,128,(x,w,h)=>{for(let y=0;y<h;y++){const b=Math.sin(y*.21)*.5+Math.sin(y*.07+1)*.5;const l=38+b*9+(y<10?-6:0);x.fillStyle=`hsl(${26+b*6},${30-y*.08}%,${l-y*.06}%)`;x.fillRect(0,y,w,1)}
 for(let k=0;k<900;k++){const px=Math.random()*w,py=Math.random()*h,r=.5+Math.random()*2.6;x.fillStyle=`hsla(30,12%,${30+Math.random()*40}%,.55)`;x.beginPath();x.ellipse(px,py,r*1.6,r,0,0,7);x.fill()}
 x.fillStyle='rgba(70,120,40,.9)';for(let px=0;px<w;px+=2){x.fillRect(px,0,2,4+Math.random()*7)}
 x.strokeStyle='rgba(60,40,25,.5)';for(let k=0;k<14;k++){x.beginPath();let px=Math.random()*w;x.moveTo(px,8);for(let py=8;py<40;py+=6){px+=Math.random()*6-3;x.lineTo(px,py)}x.stroke()}});
strata.wrapS=strata.wrapT=THREE.RepeatWrapping;
const rockTex=cvs(128,128,(x,w,h)=>{x.fillStyle='#8a8478';x.fillRect(0,0,w,h);for(let k=0;k<1500;k++){x.fillStyle=`hsla(${30+Math.random()*20},8%,${35+Math.random()*40}%,.35)`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*4,1+Math.random()*3)}
 x.fillStyle='rgba(90,130,60,.35)';for(let k=0;k<60;k++){x.beginPath();x.arc(Math.random()*w,Math.random()*h*.4,2+Math.random()*5,0,7);x.fill()}});
const bark=cvs(64,128,(x,w,h)=>{x.fillStyle='#5a4130';x.fillRect(0,0,w,h);for(let k=0;k<40;k++){x.strokeStyle=`hsla(25,25%,${15+Math.random()*25}%,.8)`;x.lineWidth=1+Math.random()*2;x.beginPath();let px=Math.random()*w;x.moveTo(px,0);for(let py=0;py<=h;py+=8){px+=Math.random()*4-2;x.lineTo(px,py)}x.stroke()}});
const leaf=(hu)=>cvs(128,128,(x,w,h)=>{for(let k=0;k<700;k++){const px=Math.random()*w,py=Math.random()*h;x.fillStyle=`hsl(${hu+Math.random()*22},${45+Math.random()*25}%,${18+Math.random()*30+(1-py/h)*12}%)`;x.save();x.translate(px,py);x.rotate(Math.random()*6);x.beginPath();x.ellipse(0,0,5,2.4,0,0,7);x.fill();x.restore()}});
const flowerTex=(pc,cc,np)=>cvs(64,128,(x,w,h)=>{x.strokeStyle='#3f7a2c';x.lineWidth=3;x.beginPath();x.moveTo(32,128);x.quadraticCurveTo(28,80,32,40);x.stroke();x.fillStyle='#4f8f34';x.beginPath();x.ellipse(24,92,9,4,-.6,0,7);x.fill();x.beginPath();x.ellipse(40,76,9,4,.6,0,7);x.fill();
 for(let k=0;k<np;k++){const a=k/np*6.283;x.save();x.translate(32,34);x.rotate(a);const g=x.createLinearGradient(0,0,0,-20);g.addColorStop(0,cc);g.addColorStop(.25,pc);g.addColorStop(1,pc);x.fillStyle=g;x.beginPath();x.ellipse(0,-11,6,12,0,0,7);x.fill();x.restore()}
 x.fillStyle=cc;x.beginPath();x.arc(32,34,5,0,7);x.fill();x.fillStyle='rgba(0,0,0,.2)';for(let k=0;k<6;k++)x.fillRect(29+Math.random()*6,31+Math.random()*6,1,1)});
const turf=r=>cvs(128,128,(x,w,h)=>{x.fillStyle=r?'#7f8a52':'#5f8f3a';x.fillRect(0,0,w,h);for(let k=0;k<2500;k++){x.fillStyle=`hsl(${(r?60:85)+Math.random()*30},${35+Math.random()*25}%,${28+Math.random()*28}%)`;x.fillRect(Math.random()*w,Math.random()*h,1,2+Math.random()*3)}if(r){for(let k=0;k<50;k++){x.fillStyle=`hsl(35,10%,${50+Math.random()*25}%)`;x.beginPath();x.arc(Math.random()*w,Math.random()*h,1+Math.random()*2.5,0,7);x.fill()}}});
const FT=[flowerTex('#ffd94a','#c9761a',12),flowerTex('#ff86b8','#ffe08a',6),flowerTex('#fbfbff','#f2c230',14),flowerTex('#a98bff','#fff1a0',5)];
const cloudTex=cvs(256,128,(x,w,h)=>{for(let k=0;k<26;k++){const px=40+Math.random()*176,py=60+Math.random()*30-(Math.abs(px-128)<60?15:0),r=18+Math.random()*26;const g=x.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)}});
const mtnTex=cvs(1024,128,(x,w,h)=>{const L=[[ '#9fb4cc',30,.45],['#7f97b3',55,.62],['#6d8a86',80,.8]];L.forEach(([c,base,amp],li)=>{x.fillStyle=c;x.beginPath();x.moveTo(0,h);for(let px=0;px<=w;px+=4){const y=base+Math.sin(px*.012+li*2)*18*amp+Math.sin(px*.041+li)*9*amp+Math.abs(Math.sin(px*.006+li*3))*-26*amp;x.lineTo(px,y)}x.lineTo(w,h);x.fill()});
 const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(220,234,245,0)');g.addColorStop(1,'rgba(220,234,245,.55)');x.fillStyle=g;x.fillRect(0,0,w,h)});
mtnTex.wrapS=THREE.RepeatWrapping;mtnTex.repeat.x=3;
// --- sky dressing (persistent) ---
const skyG=new THREE.Group();scene.add(skyG);
const mtn=new THREE.Mesh(new THREE.CylinderGeometry(170,170,60,48,1,true),new THREE.MeshBasicMaterial({map:mtnTex,transparent:true,side:THREE.BackSide,fog:false,depthWrite:false}));mtn.position.y=-14;skyG.add(mtn);
const clouds=[];for(let k=0;k<(hi?14:9);k++){const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,transparent:true,fog:false,depthWrite:false,opacity:.85}));const a=k/14*6.283+rnd(),r=110+rnd()*40;sp.position.set(Math.cos(a)*r,18+rnd()*28,Math.sin(a)*r);const s=34+rnd()*30;sp.scale.set(s,s*.5,1);sp.userData.a=a;sp.userData.r=r;skyG.add(sp);clouds.push(sp)}
skyG.visible=false;
(function tick(){requestAnimationFrame(tick);if(!skyG.visible)return;const cp=W.camera.position,d=cp.length();skyG.position.set(cp.x,0,cp.z);if(W.sky)W.sky.position.copy(cp);if(W.camera.far<d+300){W.camera.far=d+300;W.camera.updateProjectionMatrix()}if(scene.fog&&scene.fog.isFog){scene.fog.near=d*1.05;scene.fog.far=d*2.6+40}const t=U.time.value*.004;clouds.forEach(c=>{const a=c.userData.a+t;c.position.x=Math.cos(a)*c.userData.r;c.position.z=Math.sin(a)*c.userData.r})})();
const nr=v=>{v.raycast=()=>{};return v};
G.W6env=(z,nt)=>{const on=!!ON[z.id||G.S?.zone];skyG.visible=on;if(!on)return;const day=1-Math.min(1,nt||0);
 const top=new THREE.Color(0x4f8fd8).lerp(new THREE.Color(0x0d1630),1-day),hor=new THREE.Color(z.id==='rockgarden'?0xc4d6e2:0xa9cbe9).lerp(new THREE.Color(0x2a3350),1-day);
 if(W.su){W.su.uTop&&W.su.uTop.value.copy(top);W.su.uHor&&W.su.uHor.value.copy(hor)}
 scene.background=hor.clone();if(scene.fog)scene.fog.color.copy(hor);
 if(W.sun){W.sun.color.set(0xfff1d6).lerp(new THREE.Color(0x8090c0),1-day);W.sun.intensity=Math.max(W.sun.intensity,2.2*day+.4)}
 if(W.hemi){W.hemi.color.set(0xbfdcff);W.hemi.groundColor.set(0x6b5a3a);W.hemi.intensity=.5+.8*day}
 mtn.material.color.setScalar(.35+.65*day);clouds.forEach(c=>c.material.color.setScalar(.3+.7*day))};
// --- island dressing ---
G.W6build=zid=>{const isl=W.island,on=!!ON[zid];skyG.visible=on;if(!on)return;const s=G.zs(zid),n=W.N0,C0=W.C0,tiles=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(s.tiles[i][j])tiles.push([i,j]);
 rs=7+zid.length*13;const rock=zid==='rockgarden';
 // hide old blade grass + sphere flowers, re-skin ground sides and stalactites
 isl.children.forEach(o=>{const t=o.geometry&&o.geometry.type;if(o.isInstancedMesh&&(t==='PlaneGeometry'||t==='SphereGeometry'))o.visible=false;
  if(o.userData.ground&&Array.isArray(o.material)){const sm=new THREE.MeshStandardMaterial({map:strata,roughness:.97,color:rock?0xd8d0c4:0xffffff});o.material=[sm,sm,o.material[2],sm,sm,sm];o.material[2]=new THREE.MeshStandardMaterial({map:turf(rock),roughness:.95})}
  if(t==='ConeGeometry'){o.material=new THREE.MeshStandardMaterial({map:rockTex,roughness:1,color:rock?0xbab2a6:0x9a8a78})}});
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),sc=new THREE.Vector3(),col=new THREE.Color();
 // grass: tapered, bent blades with base->tip gradient, crossed clumps, wind
 const bg=new THREE.PlaneGeometry(.05,.26,1,4);bg.translate(0,.13,0);const pa=bg.attributes.position,cc=[];for(let k=0;k<pa.count;k++){const y=pa.getY(k)/.26;pa.setX(k,pa.getX(k)*(1-y*.92));pa.setZ(k,y*y*.06);const l=.6+.4*y;cc.push(l*.8,l,l*.72)}bg.setAttribute('color',new THREE.Float32BufferAttribute(cc,3));{const na=bg.attributes.normal;for(let k=0;k<na.count;k++)na.setXYZ(k,0,1,0)}
 const gm=W.windify(new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,side:THREE.DoubleSide}),.07,.26);
 const per=(hi?60:34)*(rock?.45:1),cnt=Math.min(hi?16000:8000,Math.floor(tiles.length*per));const gi=nr(new THREE.InstancedMesh(bg,gm,cnt));
 for(let k=0;k<cnt;k++){const[i,j]=tiles[k%tiles.length];p.set(i-C0+rnd()-.5,0,j-C0+rnd()-.5);e.set((rnd()-.5)*.35,rnd()*6.28,(rnd()-.5)*.35);q.setFromEuler(e);const h=.55+rnd()*.9;sc.set(.8+rnd()*.6,h,1);m4.compose(p,q,sc);gi.setMatrixAt(k,m4);
  const v=rnd();col.setHSL(rock?.17+v*.06:.22+v*.08,rock?.4:.55+rnd()*.15,.5+rnd()*.16+(v>.93?.12:0));gi.setColorAt(k,col)}
 gi.receiveShadow=!!QP.shadow;isl.add(gi);
 // flowers: crossed billboards, 4 species
 const fq=new THREE.PlaneGeometry(.16,.32);fq.translate(0,.16,0);const fq2=fq.clone().rotateY(Math.PI/2);const fx=new THREE.BufferGeometry();
 {const a=fq.toNonIndexed(),b=fq2.toNonIndexed();['position','normal','uv'].forEach(nm=>{const A=a.attributes[nm],B=b.attributes[nm],arr=new Float32Array(A.array.length+B.array.length);arr.set(A.array);arr.set(B.array,A.array.length);fx.setAttribute(nm,new THREE.BufferAttribute(arr,A.itemSize))})}
 const fper=rock?.8:2.4;FT.forEach((tx,f)=>{const c=Math.min(hi?500:260,Math.floor(tiles.length*fper/4));const fm=W.windify(new THREE.MeshStandardMaterial({map:tx,alphaTest:.5,side:THREE.DoubleSide,roughness:.7}),.05,.32);const fi=nr(new THREE.InstancedMesh(fx,fm,c));
  for(let k=0;k<c;k++){const[i,j]=tiles[Math.floor(rnd()*tiles.length)];p.set(i-C0+rnd()*.9-.45,0,j-C0+rnd()*.9-.45);e.set(0,rnd()*3,0);q.setFromEuler(e);const sz=.7+rnd()*.6;sc.set(sz,sz,sz);m4.compose(p,q,sc);fi.setMatrixAt(k,m4)}isl.add(fi)});
 // trees on free rim tiles; boulders in the Rock Garden
 const occ=new Set();(s.objs||[]).forEach(o=>occ.add(o.i+','+o.j));(s.decor||[]).forEach(o=>occ.add(o.i+','+o.j));
 const TS=new Set(tiles.map(t=>t[0]+','+t[1]));const rim=tiles.filter(([i,j])=>!occ.has(i+','+j)&&[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>!TS.has((i+a)+','+(j+b))));
 const nT=Math.min(rim.length,rock?3:Math.max(4,Math.round(n*.6)));const barkM=new THREE.MeshStandardMaterial({map:bark,roughness:.95}),leafM=new THREE.MeshStandardMaterial({map:leaf(rock?95:88),roughness:.9}),stoneM=new THREE.MeshStandardMaterial({map:rockTex,roughness:.95});
 const blob=(r,d)=>{const g=new THREE.IcosahedronGeometry(r,d),a=g.attributes.position;for(let k=0;k<a.count;k++){const v=new THREE.Vector3().fromBufferAttribute(a,k);const f=1+(Math.sin(v.x*9+v.y*7)*.08+Math.sin(v.z*11-v.y*5)*.07);a.setXYZ(k,v.x*f,v.y*f*.85,v.z*f)}g.computeVertexNormals();return g};
 const step=Math.max(1,Math.floor(rim.length/Math.max(1,nT)));for(let t=0;t<nT;t++){const[i,j]=rim[(t*step+3)%rim.length];const tr=new THREE.Group();tr.position.set(i-C0,0,j-C0);const H=1.1+rnd()*.6;
  const tk=new THREE.Mesh(new THREE.CylinderGeometry(.06,.11,H,7),barkM);tk.position.y=H/2;tr.add(tk);
  for(let b=0;b<6;b++){const r=.32+rnd()*.22,lf=new THREE.Mesh(blob(r,1),leafM);const a=b/6*6.28;lf.position.set(Math.cos(a)*.25*(b?1:0),H+(b?rnd()*.3-.1:.25),Math.sin(a)*.25*(b?1:0));lf.castShadow=!!QP.shadow;tr.add(lf)}
  tk.castShadow=!!QP.shadow;tr.scale.setScalar(.8+rnd()*.3);tr.traverse(nr);isl.add(tr)}
 if(rock){const nb=Math.min(rim.length,8);for(let b=0;b<nb;b++){const[i,j]=rim[(b*5+1)%rim.length];const m=nr(new THREE.Mesh(blob(.18+rnd()*.14,1),stoneM));m.position.set(i-C0+rnd()*.5-.25,.06,j-C0+rnd()*.5-.25);m.rotation.y=rnd()*6;m.castShadow=!!QP.shadow;m.receiveShadow=true;isl.add(m)}}
};
if(W.zone)try{G.W6build(W.zone)}catch(e){console.warn(e)}
}

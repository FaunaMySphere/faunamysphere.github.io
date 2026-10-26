// world7 PREVIEW (not shipped): refined realistic home + Rock Garden. High graphics only, opt-in via ?w7 or localStorage fs_w7=1.
import * as THREE from 'three';
const G=window,W=G.W6;
// per-biome look profiles (v6.3). gr=grass density, gh=grass height, fl=flower colours, tree=leaf|pine|null, nt=tree factor, bo=boulders, pe=pebbles, snow/sand turf, fr=fringe tint
const PROF={home:{gr:1,gh:1,fl:[0xffffff,0xffd84a,0xff8fc0,0xb48cff,0xfff1a8],tree:'leaf',nt:.4,bu:6,mu:1,bo:4,pe:.8},
 garden:{gr:.6,gh:.75,fl:[0xfff6e0,0xffd84a,0xb9a2ff],tree:'leaf',nt:.3,bu:3,mu:1,bo:10,pe:2.5,rock:1},
 rock:{gr:.4,gh:.6,fl:[0xfff6e0,0xb9a2ff],tree:'leaf',nt:.2,bu:2,mu:0,bo:16,pe:3.5,rock:1},
 forest:{gr:1.1,gh:1.15,fl:[0xffffff,0xb48cff,0xffd84a],tree:'leaf',nt:.9,bu:8,mu:3,bo:5,pe:.8,fern:1},
 arctic:{gr:0,fl:null,tree:'pine',nt:.6,bu:0,mu:0,bo:8,pe:1.5,snow:1,roots:0},
 swamp:{gr:1,gh:1.45,fl:[0xf3ecb0,0xd9c8ff],tree:'leaf',leaf:0x4f6b2a,nt:.45,bu:4,mu:2.5,bo:4,pe:.5},
 night:{gr:1,gh:1,fl:[0xffffff,0xb48cff,0x9fd8ff],tree:'leaf',nt:.4,bu:5,mu:1.5,bo:4,pe:.8},
 candy:{gr:.8,gh:.9,fl:[0xffb6d9,0xfff1a8,0xc8a8ff,0xffffff],tree:'leaf',leaf:0xf2a6c6,nt:.45,bu:6,mu:2,bo:2,pe:.6},
 scorch:{gr:.15,gh:1.2,dry:1,fl:null,tree:null,nt:0,bu:0,mu:0,bo:7,pe:2.5,sand:1,roots:0},
 mesa:{gr:.12,gh:1,dry:1,fl:[0xffd84a,0xff8f6a],tree:'cactus',nt:.5,bu:0,mu:0,bo:8,pe:2.5,sand:1,roots:0},
 sea:{gr:0,fl:null,tree:'kelp',nt:1.8,bu:16,coral:1,mu:0,bo:10,pe:3.2,sand:1,roots:0,shells:1,sea:1},
 dungeon:{gr:0,fl:null,tree:'crystal',nt:.9,bu:0,mu:2,glow:1,bo:10,pe:3,stone:1,cave:1},
 beach:{gr:.25,gh:1.3,dry:1,fl:null,tree:null,nt:0,bu:0,mu:0,bo:3,pe:3,sand:1,roots:0,shells:1}};
const PK=z=>PROF[z]||(G.W7XP&&G.W7XP[z])||null;const zb=id=>{try{const q=Z(id);return q.w7||q.biome}catch(e){return null}};const ON=new Proxy({},{get:(t,id)=>!!PK(zb(id))});
if(W&&G.W7){
const {scene,QP,U}=W;
let rs=1;const rnd=()=>{rs=(rs*16807)%2147483647;return(rs-1)/2147483646};
const cvs=(w,h,f,rep)=>{const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
const nr=o=>{o.traverse(m=>{m.raycast=()=>{};m.userData.noToon=1});return o};
const C=(h)=>new THREE.Color(h);
// ---------- textures ----------
const cliff=new THREE.TextureLoader().load('tex/cliff.jpg');cliff.colorSpace=THREE.SRGBColorSpace;cliff.wrapS=cliff.wrapT=THREE.RepeatWrapping;cliff.anisotropy=8;
const cliffSide=new THREE.TextureLoader().load('tex/cliff.jpg');cliffSide.colorSpace=THREE.SRGBColorSpace;cliffSide.wrapS=cliffSide.wrapT=THREE.RepeatWrapping;cliffSide.repeat.set(1,.5);
const turfTex=(base,kind)=>cvs(512,512,(x,w,h)=>{const b=C(base);x.fillStyle='#'+b.getHexString();x.fillRect(0,0,w,h);
 // soft painterly blotches (wrap-around so it tiles)
 for(let k=0;k<260;k++){const px=Math.random()*w,py=Math.random()*h,r=20+Math.random()*60,c=b.clone().offsetHSL((Math.random()-.5)*.04,(Math.random()-.5)*.1,(Math.random()-.5)*.09);
  for(const[dx,dy]of[[0,0],[w,0],[-w,0],[0,h],[0,-h]]){const g=x.createRadialGradient(px+dx,py+dy,0,px+dx,py+dy,r);g.addColorStop(0,`rgba(${c.r*255|0},${c.g*255|0},${c.b*255|0},.35)`);g.addColorStop(1,`rgba(${c.r*255|0},${c.g*255|0},${c.b*255|0},0)`);x.fillStyle=g;x.fillRect(px+dx-r,py+dy-r,2*r,2*r)}}
 if(kind==='snow'){for(let k=0;k<2500;k++){x.fillStyle=`rgba(255,255,255,${.3+Math.random()*.6})`;x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.5,1+Math.random()*1.5)}for(let k=0;k<40;k++){x.strokeStyle='rgba(150,180,210,.18)';x.lineWidth=2+Math.random()*4;x.beginPath();const y0=Math.random()*h;x.moveTo(0,y0);x.bezierCurveTo(w*.3,y0+20,w*.6,y0-20,w,y0);x.stroke()}return}
 if(kind==='stone'){for(let k=0;k<9000;k++){const c=b.clone().offsetHSL(0,0,(Math.random()-.5)*.18);x.fillStyle='#'+c.getHexString();x.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1+Math.random()*2)}x.strokeStyle='rgba(0,0,0,.28)';x.lineWidth=1.5;for(let k=0;k<45;k++){let px=Math.random()*w,py=Math.random()*h;x.beginPath();x.moveTo(px,py);for(let s=0;s<6;s++){px+=Math.random()*30-15;py+=Math.random()*30-15;x.lineTo(px,py)}x.stroke()}return}
 if(kind==='sand'){for(let k=0;k<12000;k++){const c=b.clone().offsetHSL(0,(Math.random()-.5)*.1,(Math.random()-.5)*.2);x.fillStyle='#'+c.getHexString();x.fillRect(Math.random()*w,Math.random()*h,1,1)}for(let y0=0;y0<h;y0+=14+Math.random()*10){x.strokeStyle='rgba(120,90,50,.15)';x.lineWidth=2;x.beginPath();x.moveTo(0,y0);for(let px=0;px<=w;px+=16)x.lineTo(px,y0+Math.sin(px*.03+y0)*4);x.stroke()}return}
 // fine blade strokes
 for(let k=0;k<9000;k++){const c=b.clone().offsetHSL((Math.random()-.5)*.05,(Math.random()-.3)*.15,(Math.random()-.55)*.22);x.strokeStyle='#'+c.getHexString();x.globalAlpha=.55;x.lineWidth=1+Math.random();const px=Math.random()*w,py=Math.random()*h,l=3+Math.random()*7,a=-1.57+(Math.random()-.5)*.9;x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}x.globalAlpha=1},true);
const bark=cvs(128,256,(x,w,h)=>{x.fillStyle='#6b4b33';x.fillRect(0,0,w,h);for(let k=0;k<70;k++){x.strokeStyle=`hsla(${22+Math.random()*10},${25+Math.random()*15}%,${14+Math.random()*30}%,.85)`;x.lineWidth=1+Math.random()*3;x.beginPath();let px=Math.random()*w;x.moveTo(px,0);for(let py=0;py<=h;py+=10){px+=Math.random()*5-2.5;x.lineTo(px,py)}x.stroke()}
 for(let k=0;k<25;k++){x.fillStyle='rgba(110,150,70,.35)';x.beginPath();x.ellipse(Math.random()*w,h*.7+Math.random()*h*.3,3+Math.random()*8,2+Math.random()*4,0,0,7);x.fill()}},true);
const leafCard=cvs(128,128,(x,w,h)=>{for(let k=0;k<22;k++){const px=20+Math.random()*88,py=20+Math.random()*88,a=Math.random()*6.28;x.save();x.translate(px,py);x.rotate(a);const g=x.createLinearGradient(-14,0,14,0);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#b9c9a8');x.fillStyle=g;x.beginPath();x.moveTo(-15,0);x.quadraticCurveTo(0,-8,15,0);x.quadraticCurveTo(0,8,-15,0);x.fill();x.strokeStyle='rgba(60,80,40,.35)';x.lineWidth=1;x.beginPath();x.moveTo(-13,0);x.lineTo(13,0);x.stroke();x.restore()}});
const fringe=cvs(256,64,(x,w,h)=>{// hanging moss/grass lip: dense top, ragged strands down
 const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#c8d8b0');x.fillStyle=g;x.fillRect(0,0,w,10);
 for(let k=0;k<320;k++){const px=Math.random()*w,l=8+Math.pow(Math.random(),2)*52;x.strokeStyle=`hsl(${80+Math.random()*30},${30+Math.random()*30}%,${70+Math.random()*30}%)`;x.lineWidth=1.5+Math.random()*2.5;x.beginPath();x.moveTo(px,0);x.quadraticCurveTo(px+Math.random()*6-3,l*.6,px+Math.random()*8-4,l);x.stroke()}},true);
const cloudTex=(shade)=>cvs(256,192,(x,w,h)=>{const P=[];for(let k=0;k<34;k++){const px=46+Math.random()*164,dx=Math.abs(px-128)/82,py=118-(1-dx*dx)*48+Math.random()*16,r=(1-dx*.5)*(18+Math.random()*24);P.push([px,py,r])}
 // shadowed base then lit tops -> volumetric look
 P.forEach(([px,py,r])=>{const g=x.createRadialGradient(px,py+r*.25,0,px,py+r*.25,r*1.05);g.addColorStop(0,shade+'ee');g.addColorStop(.7,shade+'aa');g.addColorStop(1,shade+'00');x.fillStyle=g;x.fillRect(0,0,w,h)});
 P.forEach(([px,py,r])=>{const g=x.createRadialGradient(px-r*.15,py-r*.35,0,px-r*.15,py-r*.35,r*.85);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.6,'rgba(255,252,246,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
 x.globalCompositeOperation='destination-in';const fg=x.createLinearGradient(0,0,0,h);fg.addColorStop(0,'#fff');fg.addColorStop(.82,'#fff');fg.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=fg;x.fillRect(0,0,w,h)});
const glowTex=cvs(128,128,(x,w,h)=>{const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,250,225,1)');g.addColorStop(.2,'rgba(255,236,190,.55)');g.addColorStop(1,'rgba(255,220,170,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
// height->normal map from any image/canvas (richer surface relief)
const normalFrom=(img,str=2.5)=>{const w=img.width,h=img.height,c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0);const d=x.getImageData(0,0,w,h),s=d.data,o=x.createImageData(w,h),t=o.data;const L=(i,j)=>{i=(i+w)%w;j=(j+h)%h;const k=(j*w+i)*4;return(s[k]+s[k+1]+s[k+2])/765};
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const dx=(L(i-1,j)-L(i+1,j))*str,dy=(L(i,j-1)-L(i,j+1))*str,l=Math.hypot(dx,dy,1),k=(j*w+i)*4;t[k]=(dx/l*.5+.5)*255;t[k+1]=(dy/l*.5+.5)*255;t[k+2]=(1/l*.5+.5)*255;t[k+3]=255}
 x.putImageData(o,0,0);const tx=new THREE.CanvasTexture(c);tx.wrapS=tx.wrapT=THREE.RepeatWrapping;return tx};
const cliffN=new THREE.Texture();const cliffSideN=new THREE.Texture();
{const im=new Image();im.onload=()=>{const n=normalFrom(im,3);[cliffN,cliffSideN].forEach(t=>{t.image=n.image;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.needsUpdate=true});cliffSideN.repeat.set(1,.5)};im.src='tex/cliff.jpg'}
const shadowTex=cvs(64,64,(x,w,h)=>{const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(20,30,10,.55)');g.addColorStop(.6,'rgba(20,30,10,.22)');g.addColorStop(1,'rgba(20,30,10,0)');x.fillStyle=g;x.fillRect(0,0,w,h)});
// ---------- geometry helpers ----------
const merge=(parts)=>{// parts: [geometry(non-indexed ok), color]
 const pos=[],nor=[],col=[],uv=[];parts.forEach(([g,c])=>{if(g.index)g=g.toNonIndexed();const p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,vc=g.attributes.color;for(let k=0;k<p.count;k++){pos.push(p.getX(k),p.getY(k),p.getZ(k));nor.push(n.getX(k),n.getY(k),n.getZ(k));uv.push(u?u.getX(k):0,u?u.getY(k):0);if(vc)col.push(vc.getX(k)*c.r,vc.getY(k)*c.g,vc.getZ(k)*c.b);else col.push(c.r,c.g,c.b)}});
 const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));o.setAttribute('color',new THREE.Float32BufferAttribute(col,3));o.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return o};
const blob=(r,d,amp=.12,seed=0)=>{const g=new THREE.IcosahedronGeometry(r,d),a=g.attributes.position,v=new THREE.Vector3();for(let k=0;k<a.count;k++){v.fromBufferAttribute(a,k);const f=1+(Math.sin(v.x*7/r*.3+seed+v.y*5/r*.3)*amp+Math.sin(v.z*9/r*.3-v.y*4/r*.3+seed*2)*amp*.8);a.setXYZ(k,v.x*f,v.y*f,v.z*f)}g.computeVertexNormals();return g.index?g.toNonIndexed():g};
// vertex-colour AO/sun gradient by height + normal
const shadeV=(g,lo,hi,ymin,ymax)=>{const p=g.attributes.position,n=g.attributes.normal,c=[];for(let k=0;k<p.count;k++){const t=THREE.MathUtils.clamp((p.getY(k)-ymin)/(ymax-ymin),0,1),up=n.getY(k)*.5+.5;const l=lo+(hi-lo)*(t*.6+up*.4);c.push(l,l,l)}g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g};
// grass clump: 7 curved tapered blades, base dark -> tip light, normals up (soft, matches turf)
const clumpGeo=(()=>{const P=[],Cc=[];const S=4;for(let b=0;b<7;b++){const a=b/7*6.283+Math.random(),r=b?.035+Math.random()*.03:0,bx=Math.cos(a)*r,bz=Math.sin(a)*r,h=.16+Math.random()*.14,w=.022+Math.random()*.01,lean=.25+Math.random()*.35,ra=a+(Math.random()-.5);
 const pt=(s,side)=>{const t=s/S,wd=w*(1-t*.9)*side;const y=h*t,out=lean*t*t*h;return[bx+Math.cos(ra)*out+Math.cos(ra+1.57)*wd,y,bz+Math.sin(ra)*out+Math.sin(ra+1.57)*wd,t]};
 for(let s=0;s<S;s++){const A=pt(s,-1),B=pt(s,1),C2=pt(s+1,-1),D=pt(s+1,1);[[A,B,D],[A,D,C2]].forEach(tri=>tri.forEach(q=>{P.push(q[0],q[1],q[2]);const l=.68+.42*Math.pow(q[3],.8);Cc.push(l*.95,l,l*.8)}))}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(Cc,3));const N=new Float32Array(P.length);for(let k=1;k<N.length;k+=3)N[k]=1;g.setAttribute('normal',new THREE.BufferAttribute(N,3));return g})();
const flowerGeo=(np,pl,pw,cup)=>{const parts=[];for(let k=0;k<np;k++){const g=new THREE.SphereGeometry(1,6,3);g.scale(pl,.012,pw);g.translate(pl*.9,0,0);g.rotateZ(cup);g.rotateY(k/np*6.283);parts.push([g,C(0xffffff)])}
 const c=new THREE.SphereGeometry(pw*.8,6,4);c.scale(1,.6,1);c.translate(0,.01,0);parts.push([c,C(0xffd25a)]);const st=new THREE.CylinderGeometry(.004,.006,.2,4);st.translate(0,-.1,0);parts.push([st,C(0x3f7a2c)]);
 const lf=new THREE.SphereGeometry(1,5,3);lf.scale(.035,.004,.012);lf.translate(.03,-.13,0);lf.rotateZ(.4);parts.push([lf,C(0x4f8f34)]);const g=merge(parts);g.translate(0,.2,0);return g};
// ---------- sky dressing ----------
const skyG=new THREE.Group();scene.add(skyG);skyG.visible=false;
const sunGlow=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex,transparent:true,fog:false,depthWrite:false,blending:THREE.AdditiveBlending,opacity:.9}));sunGlow.scale.set(70,70,1);skyG.add(sunGlow);
const CT={};const cloudMats=[];const clouds=[];
const mkCloud=(shade,x,y,z,s,a)=>{const k=shade;CT[k]=CT[k]||cloudTex(shade);const m=new THREE.SpriteMaterial({map:CT[k],transparent:true,fog:false,depthWrite:false,opacity:a});cloudMats.push(m);const sp=new THREE.Sprite(m);sp.position.set(x,y,z);sp.scale.set(s,s*.75,1);sp.userData={a:Math.atan2(z,x),r:Math.hypot(x,z),y};skyG.add(sp);clouds.push(sp);return sp};
let cloudShade='#c9b7c8';
// v7 sky: layered puffy clouds (lit tops, shaded bellies) + wisps; few billboards, procedural canvas textures
const puffTex=(shade,v)=>cvs(256,160,(x,w,h)=>{let s2=v*977+7;const r=()=>(s2=(s2*16807)%2147483647)/2147483647;
 const n=10+v*3,P=[];for(let k=0;k<n;k++){const t=k/(n-1),px=40+t*176+(r()-.5)*24,dome=1-Math.pow(Math.abs(t-.5)*2,1.6),rr=(16+r()*16)*(.6+dome*.7);P.push([px,112-dome*34-r()*12,rr])}
 for(let k=0;k<5;k++)P.push([70+r()*116,80+r()*24,20+r()*14]);
 P.forEach(([px,py,rr])=>{const g=x.createRadialGradient(px,py,rr*.2,px,py,rr);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.7,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,rr,0,7);x.fill()});
 // flatten the base softly
 x.globalCompositeOperation='destination-out';const fb=x.createLinearGradient(0,112,0,150);fb.addColorStop(0,'rgba(0,0,0,0)');fb.addColorStop(1,'rgba(0,0,0,1)');x.fillStyle=fb;x.fillRect(0,112,w,h-112);
 // colourise: warm lit top -> zone-tinted shaded belly
 x.globalCompositeOperation='source-atop';const vg=x.createLinearGradient(0,40,0,124);vg.addColorStop(0,'#fffdf6');vg.addColorStop(.45,'#f4f4f6');vg.addColorStop(1,shade);x.fillStyle=vg;x.fillRect(0,0,w,h);
 P.slice(0,n).forEach(([px,py,rr])=>{const g=x.createRadialGradient(px-rr*.2,py-rr*.45,1,px,py-rr*.3,rr*.8);g.addColorStop(0,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(px-rr,py-rr,rr*2,rr*2)})});
const wispTex=cvs(256,64,(x,w,h)=>{let s2=5;const r=()=>(s2=(s2*16807)%2147483647)/2147483647;for(let k=0;k<40;k++){const px=20+r()*216,py=32+(r()-.5)*18,rx=18+r()*30,ry=3+r()*5;const g=x.createRadialGradient(px,py,0,px,py,rx);g.addColorStop(0,'rgba(255,255,255,.28)');g.addColorStop(1,'rgba(255,255,255,0)');x.save();x.translate(px,py);x.scale(1,ry/rx);x.translate(-px,-py);x.fillStyle=g;x.beginPath();x.arc(px,py,rx,0,7);x.fill();x.restore()}});
const mkPuff=(shade,v,x,y,z,s,a,sp)=>{const k=shade+v;CT[k]=CT[k]||puffTex(shade,v);const m=new THREE.SpriteMaterial({map:CT[k],transparent:true,fog:false,depthWrite:false,opacity:a});cloudMats.push(m);const c=new THREE.Sprite(m);c.position.set(x,y,z);c.scale.set(s,s*.62,1);c.userData={a:Math.atan2(z,x),r:Math.hypot(x,z),y,sp};skyG.add(c);clouds.push(c);return c};
const buildClouds=()=>{clouds.forEach(c=>skyG.remove(c));clouds.length=0;rs=99;
 // low cloud sea behind/below the island: big, slow
 for(let k=0;k<7;k++){const a=k/7*6.283+rnd()*.6,r=60+rnd()*45;mkPuff(cloudShade,k%3,Math.cos(a)*r,-30-rnd()*14,Math.sin(a)*r,22+rnd()*18,.85,.5)}
 // mid puffy layer, varied sizes
 for(let k=0;k<8;k++){const a=k/8*6.283+rnd()*.5,r=65+rnd()*40;mkPuff(cloudShade,(k+1)%3,Math.cos(a)*r,-12+rnd()*12,Math.sin(a)*r,10+rnd()*14,.95,.9)}
 // a few nearer small puffs drifting below the rim (parallax)
 for(let k=0;k<5;k++){const a=k/5*6.283+rnd(),r=34+rnd()*18;mkPuff(cloudShade,k%3,Math.cos(a)*r,-14-rnd()*8,Math.sin(a)*r,8+rnd()*8,.9,1.2)}
 // a few wispy high clouds, faster
 for(let k=0;k<5;k++){const a=rnd()*6.283,r=90+rnd()*30;const m=new THREE.SpriteMaterial({map:wispTex,transparent:true,fog:false,depthWrite:false,opacity:.8});cloudMats.push(m);const c=new THREE.Sprite(m);c.position.set(Math.cos(a)*r,6+rnd()*10,Math.sin(a)*r);const s=60+rnd()*40;c.scale.set(s,s*.25,1);c.userData={a,r,y:c.position.y,sp:1.6};skyG.add(c);clouds.push(c)}};
// v7 sky: screen-space backdrop gradient as scene.background canvas (camera looks down, so the dome horizon never shows)
const bdC=document.createElement('canvas');bdC.width=64;bdC.height=256;const bdT=new THREE.CanvasTexture(bdC);bdT.colorSpace=THREE.SRGBColorSpace;let bdKey='';
const paintBD=(top,hor,sunC,day,sx)=>{const k=top.getHexString()+hor.getHexString()+day.toFixed(2)+sx.toFixed(1);if(k===bdKey)return;bdKey=k;const x=bdC.getContext('2d');
 const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#'+top.getHexString());g.addColorStop(.35,'#'+top.clone().lerp(hor,.45).getHexString());g.addColorStop(.75,'#'+hor.getHexString());g.addColorStop(1,'#'+hor.clone().lerp(C(0xffffff),.08).getHexString());x.fillStyle=g;x.fillRect(0,0,64,256);
 if(day>.05){const cx=32+sx*28,r=x.createRadialGradient(cx,10,0,cx,10,120);const sc=sunC;r.addColorStop(0,`rgba(${sc.r*255|0},${sc.g*255|0},${sc.b*255|0},${.32*day})`);r.addColorStop(.4,`rgba(${sc.r*255|0},${sc.g*255|0},${sc.b*255|0},${.08*day})`);r.addColorStop(1,'rgba(255,255,255,0)');x.save();x.scale(1,1);x.fillStyle=r;x.fillRect(0,0,64,256);x.restore()}
 bdT.needsUpdate=true};
let bdArgs=null;G._bd=()=>bdArgs;
// distant floating islets for depth (fogged)
const islets=[];{const im=new THREE.MeshLambertMaterial({color:0x8f7a62}),gm=new THREE.MeshLambertMaterial({color:0x7aa548});rs=31;for(let k=0;k<5;k++){const g=new THREE.Group();const s=4+rnd()*7;const c=new THREE.Mesh(new THREE.ConeGeometry(1,1.8,8,2),im);c.rotation.x=Math.PI;c.position.y=-.9;const t=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1,.25,10),gm);g.add(c,t);
 for(let b=0;b<3;b++){const tr=new THREE.Mesh(new THREE.IcosahedronGeometry(.25,0),gm);tr.position.set(rnd()-.5,.35,rnd()-.5);g.add(tr)}
 const a=k/5*6.283+.6,r=70+rnd()*50;g.position.set(Math.cos(a)*r,-6+rnd()*14,Math.sin(a)*r);g.scale.setScalar(s);skyG.add(g);islets.push(g)}}
nr(skyG);
let tAcc=0;(function tick(){requestAnimationFrame(tick);if(!skyG.visible)return;const cp=W.camera.position,d=cp.length();skyG.position.set(cp.x*.9,0,cp.z*.9);if(W.camera.far<d+320){W.camera.far=d+320;W.camera.updateProjectionMatrix()}
 const t=U.time.value*.006;clouds.forEach(c=>{const a=c.userData.a+t*(c.userData.sp||1);c.position.x=Math.cos(a)*c.userData.r;c.position.z=Math.sin(a)*c.userData.r});
 if(W.sun){const sp=W.sun.position.clone().normalize();sunGlow.position.copy(sp.multiplyScalar(180));const q2=W.camera.position.clone().add(W.sun.position.clone().normalize().multiplyScalar(100)).project(W.camera);if(bdArgs){bdArgs[4]=Math.round(THREE.MathUtils.clamp(q2.x,-1,1)*4)/4;paintBD(...bdArgs)}}})();
G.W6env=(z,nt)=>{const id=z.id||G.S?.zone,on=!!ON[id];skyG.visible=on;G.W7ON=on;if(!on)return;const PP=PK(zb(id));if(PP.cave){skyG.visible=false;return}if(PP.sea){skyG.visible=false;const pl=(G.ZPAL&&G.ZPAL[id])||BIOMES[zb(id)];const fc=C(pl[4]).lerp(C(pl[3]),.4);scene.background=fc;scene.fog=new THREE.Fog(fc,(W.camDist||20)*1.1,(W.camDist||20)*3.2);if(W.hemi){W.hemi.color.set(0x9fd8ff);W.hemi.groundColor.copy(C(pl[0]).multiplyScalar(.5));W.hemi.intensity=1.2}if(W.sun){W.sun.color.set(0xd8f4ff);W.sun.intensity=2}return}const pal=(G.ZPAL&&G.ZPAL[id])||BIOMES[zb(id)],day=1-Math.min(1,nt||0),night=C(0x0a1028);
 const hor=C(pal[5]).lerp(night,1-day),top=C(pal[4]).lerp(night,1-day);
 // v6.7: cool the peach home horizon so the haze behind the island reads as soft sky, not pink
 const hh={};C(pal[5]).getHSL(hh);const pinkHz=zb(id)!=='candy'&&(hh.h>.86||hh.h<.07)&&hh.s>.2;if(pinkHz){hor.lerp(C(0xcfe3f2).lerp(night,1-day),.7);top.lerp(C(0x9cc8ec).lerp(night,1-day),pal[4]&&zb(id)==='home'?.5:0)}
 if(W.su){W.su.uTop.value.copy(top);W.su.uHor.value.copy(hor)}
 // soft depth fog, gently tinted by the zone horizon colour
 const fc=hor.clone().lerp(C(0xffffff),.12*day);scene.background=fc;
 {const cand=zb(id)==='candy';const bt=cand?top.clone().lerp(C(0xff8fc8),.45).lerp(night,1-day):C(0x2f72cc).lerp(top,.1).lerp(night,1-day),bh=cand?fc.clone():C(0xe4edf3).lerp(fc,.45).lerp(night,(1-day)*.8);bdArgs=[bt,bh,cand?C(0xfff0f6):C(0xfff1cc),day,bdArgs?bdArgs[4]:0];bdKey='';paintBD(...bdArgs);scene.background=bdT;if(W.sky)W.sky.visible=false}
 // shaded cloud underside tinted from the zone sky (pink at home, blue-grey in Rock Garden)
 const sh='#'+(pinkHz&&zb(id)==='home'?C(0xb8c6dc):C(pal[4])).lerp(C(0x8a8fb0),.45).lerp(C(0xffffff),.25).getHexString();if(sh!==cloudShade||!clouds.length){cloudShade=sh;buildClouds()}
 cloudMats.forEach(m=>m.color.setScalar(.35+.65*day));islets.forEach(g=>g.visible=true);sunGlow.material.opacity=.85*day;
 if(W.sun){W.sun.color.set(0xfff0d2).lerp(C(0x8090c0),1-day);W.sun.intensity=2.7*day+.35}
 if(W.hemi){W.hemi.color.copy(C(pal[4]).lerp(C(0xdcecff),.6));W.hemi.groundColor.copy(C(pal[0]).multiplyScalar(.55));W.hemi.intensity=.7+.75*day}};
// ---------- island dressing ----------
G.W6build=zid=>{const isl=W.island,on=!!ON[zid];skyG.visible=on;G.W7ON=on;if(!on)return;const s=G.zs(zid),n=W.N0,C0=W.C0,pal=(G.ZPAL&&G.ZPAL[zid])||BIOMES[zb(zid)],P=PK(zb(zid)),rock=!!P.rock,hi=true;
 const tiles=[];for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(s.tiles[i][j])tiles.push([i,j]);const TS=new Set(tiles.map(t=>t[0]+','+t[1]));
 rs=7+zid.length*13;
 const occ=new Map();(s.objs||[]).forEach(o=>{if(o.i!=null)occ.set(o.i+','+o.j,o.type||1)});(s.decor||[]).forEach(o=>occ.set(o.i+','+o.j,1));
 const near=(i,j,r)=>{for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(occ.has((i+a)+','+(j+b)))return true;return false};
 // 1) re-skin ground: painterly turf top in exact zone colour, generated cliff strata on sides, darker cliff cones under
 const topC=P.snow?C(pal[0]):P.sand?C(pal[0]).offsetHSL(0,.05,.07):C(pal[0]).offsetHSL(0,.04,rock?.1:.06);const tt=turfTex('#'+topC.getHexString(),P.snow?'snow':P.stone?'stone':P.sand?'sand':'grass');tt.repeat.set(1,1);
 const topM=new THREE.MeshStandardMaterial({map:tt,normalMap:normalFrom(tt.image,P.snow?1.2:2),normalScale:new THREE.Vector2(.7,.7),roughness:P.snow?.55:1,color:0xffffff});
 const sideM=new THREE.MeshStandardMaterial({map:cliffSide,normalMap:cliffSideN,normalScale:new THREE.Vector2(1.2,1.2),roughness:.95,color:C(pal[1]).lerp(C(0xffffff),.55)});
 const coneM=new THREE.MeshStandardMaterial({map:cliff,normalMap:cliffN,roughness:1,color:C(pal[1]).lerp(C(0xffffff),.35).multiplyScalar(.85)});
 isl.children.forEach(o=>{const t=o.geometry&&o.geometry.type;o.userData.noToon=1;
  if(o.isInstancedMesh&&(t==='PlaneGeometry'||t==='SphereGeometry'))o.visible=false;
  if(o.userData.ground&&o.isInstancedMesh){o.material=[sideM,sideM,topM,sideM,sideM,sideM];if(o.instanceColor){const c=new THREE.Color();for(let k=0;k<o.count;k++){c.setScalar(.95+((k*37)%11)/220);o.setColorAt(k,c)}o.instanceColor.needsUpdate=true}o.receiveShadow=!!QP.shadow}
  if(t==='ConeGeometry'){o.material=coneM}});
 const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),p=new THREE.Vector3(),sc=new THREE.Vector3(),col=new THREE.Color();
 // 2) grass clumps: dense, blended into turf (base = turf colour, tips lighter/yellower), wind
 const gm=W.windify(new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),.05,.3);
 const per=Math.round(10*P.gr),cnt=tiles.length*per;const gi=new THREE.InstancedMesh(clumpGeo,gm,cnt);
 for(let k=0;k<cnt;k++){const[i,j]=tiles[k%tiles.length];const ob=occ.has(i+','+j);p.set(i-C0+rnd()-.5,0,j-C0+rnd()-.5);e.set(0,rnd()*6.28,0);q.setFromEuler(e);
  const patch=Math.sin(p.x*.9+1)*Math.cos(p.z*.7)*.5+.5,h=((ob?.45:.7)+rnd()*.45+patch*.3)*(P.gh||1);sc.set(.9+rnd()*.5,h,.9+rnd()*.5);m4.compose(p,q,sc);gi.setMatrixAt(k,m4);
  col.copy(topC).offsetHSL((rnd()-.5)*.04+patch*.02,.04+rnd()*.06,.02+rnd()*.07+patch*.04);if(rock&&rnd()<.25)col.offsetHSL(.03,-.15,.05);if(P.dry)col.set(0xb5b46a).offsetHSL((rnd()-.5)*.04,0,rnd()*.1);gi.setColorAt(k,col)}
 gi.receiveShadow=!!QP.shadow;if(cnt)isl.add(nr(gi));
 // 3) edges: overhanging grass lip + hanging moss fringe + roots
 const edges=[];tiles.forEach(([i,j])=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,b])=>{if(!TS.has((i+a)+','+(j+b)))edges.push([i,j,a,b])}));
 const fr=new THREE.PlaneGeometry(1.04,.32);fr.translate(0,-.16,0);
 const frM=new THREE.MeshLambertMaterial({map:fringe,alphaTest:.45,side:THREE.DoubleSide,color:P.cave||P.sea?C(pal[0]).multiplyScalar(.8):P.snow?C(0xf4fbff):P.sand?C(pal[1]).lerp(C(pal[0]),.5):C(pal[0]).multiplyScalar(.95)});
 const fi=new THREE.InstancedMesh(fr,frM,edges.length);
 edges.forEach(([i,j,a,b],k)=>{p.set(i-C0+a*.505,.005,j-C0+b*.505);e.set(0,Math.atan2(a,b),0);q.setFromEuler(e);sc.set(1,.6+rnd()*.7,1);m4.compose(p,q,sc);fi.setMatrixAt(k,m4)});isl.add(nr(fi));
 const lip=new THREE.InstancedMesh(clumpGeo,gm,P.gr>.3?edges.length*3:0);let li=0;if(P.gr>.3)edges.forEach(([i,j,a,b])=>{for(let u=0;u<3;u++){const o=(u+.5)/3-.5+(rnd()-.5)*.1;p.set(i-C0+a*.47+(b?o:0),0,j-C0+b*.47+(a?o:0));e.set(b*.6,rnd()*6,-a*.6);q.setFromEuler(e);const h=.9+rnd()*.6;sc.set(1.2,h,1.2);m4.compose(p,q,sc);lip.setMatrixAt(li,m4);col.copy(topC).offsetHSL(0,.06,.04+rnd()*.06);lip.setColorAt(li++,col)}});isl.add(nr(lip));
 // hanging roots: thin curved tubes under the rim (icicles in snow)
 if(P.roots!==0){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0),new THREE.Vector3(.03,-.25,.02),new THREE.Vector3(-.02,-.55,.05),new THREE.Vector3(.04,-.9,.03)]);const rg=new THREE.TubeGeometry(curve,8,.012,4);
  const rm=new THREE.MeshLambertMaterial({color:0x5b4330});const nR=Math.floor(edges.length*1.1);const ri=new THREE.InstancedMesh(rg,rm,nR);
  for(let k=0;k<nR;k++){const[i,j,a,b]=edges[Math.floor(rnd()*edges.length)];const o=rnd()-.5;p.set(i-C0+a*.5+(b?o:0),-.12-rnd()*.15,j-C0+b*.5+(a?o:0));e.set(0,rnd()*6,0);q.setFromEuler(e);const L=.3+rnd()*.9;sc.set(1,L,1);m4.compose(p,q,sc);ri.setMatrixAt(k,m4)}isl.add(nr(ri))}
 // 4) flowers: real 3D heads in natural clusters + tiny meadow flecks
 const FG=[flowerGeo(5,.03,.017,.25),flowerGeo(8,.026,.01,.15),flowerGeo(6,.022,.013,.5)];const FC=P.fl||[];
 const fm=W.windify(new THREE.MeshLambertMaterial({vertexColors:true}),.04,.3);
 const free=tiles.filter(([i,j])=>!occ.has(i+','+j));
 if(FC.length)FG.forEach((geo,f)=>{const nc=Math.round(free.length*(rock?.1:.13)),per2=5,tot=nc*per2;const fi2=new THREE.InstancedMesh(geo,fm,tot);let k=0;
  for(let c=0;c<nc;c++){const[i,j]=free[Math.floor(rnd()*free.length)];const cx=i-C0+rnd()-.5,cz=j-C0+rnd()-.5,hue=FC[Math.floor(rnd()*FC.length)];for(let u=0;u<per2;u++){p.set(cx+(rnd()-.5)*.35,0,cz+(rnd()-.5)*.35);e.set((rnd()-.5)*.3,rnd()*6,(rnd()-.5)*.3);q.setFromEuler(e);const sz=.8+rnd()*.6;sc.set(sz,sz*(.8+rnd()*.5),sz);m4.compose(p,q,sc);fi2.setMatrixAt(k,m4);col.set(hue).offsetHSL(0,0,(rnd()-.5)*.08);fi2.setColorAt(k++,col)}}
  isl.add(nr(fi2))});
 // 5) trees (proper 3D: flared trunk, branches, clustered leafy canopy with AO, leaf cards, thin outline)
 const rim=free.filter(([i,j])=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>!TS.has((i+a)+','+(j+b)))&&!near(i,j,1));
 const barkM=new THREE.MeshStandardMaterial({map:bark,roughness:.95,color:0xd8c8b8});
 const leafBase=C(P.leaf||(rock?0x5f8a34:0x5c9a32));const leafM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,color:leafBase});
 const cardM=W.windify(new THREE.MeshLambertMaterial({map:leafCard,alphaTest:.5,side:THREE.DoubleSide,color:leafBase.clone().offsetHSL(.01,.05,.06)}),.03,2);
 const olM=new THREE.MeshBasicMaterial({color:0x1d2a14,side:THREE.BackSide});olM.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <begin_vertex>','vec3 transformed=position+normal*0.018;')};
 const mkTree=(H)=>{const tr=new THREE.Group();const tg=new THREE.CylinderGeometry(.055,.1,H,9,6);const ta=tg.attributes.position;for(let k=0;k<ta.count;k++){const y=ta.getY(k)/H+.5;const fl=1+Math.pow(1-y,4)*.9;ta.setX(k,ta.getX(k)*fl+Math.sin(y*3)*.03);ta.setZ(k,ta.getZ(k)*fl)}tg.computeVertexNormals();tg.translate(0,H/2,0);
  const tk=new THREE.Mesh(tg,barkM);tk.castShadow=!!QP.shadow;tr.add(tk);
  for(let b=0;b<3;b++){const bg=new THREE.CylinderGeometry(.018,.035,.45,6);bg.translate(0,.22,0);const br=new THREE.Mesh(bg,barkM);br.position.y=H*(.6+b*.12);br.rotation.set(.9,b*2.1+rnd(),0,'YXZ');tr.add(br)}
  const parts=[];const N=7;for(let b=0;b<N;b++){const a=b/N*6.283+rnd()*.5,r=.26+rnd()*.16,d=b?(.22+rnd()*.12):0,y=H+(b?(rnd()*.35-.05):.28);const g=blob(r,2,.1,b*3);g.translate(Math.cos(a)*d,y,Math.sin(a)*d);parts.push([g,C(0xffffff)])}
  const cg=merge(parts);shadeV(cg,.45,1.15,H-.35,H+.7);const lm=leafM.clone();lm.color.offsetHSL((rnd()-.5)*.04,(rnd()-.5)*.1,(rnd()-.5)*.06);const cn=new THREE.Mesh(cg,lm);cn.castShadow=!!QP.shadow;tr.add(cn);const ol=new THREE.Mesh(cg,olM);tr.add(ol);
  // leaf cards scattered on canopy surface for a leafy silhouette
  const cp=cg.attributes.position,cnr=cg.attributes.normal,nc=60;const cards=new THREE.InstancedMesh(new THREE.PlaneGeometry(.22,.22),cardM,nc);
  for(let k=0;k<nc;k++){const vi=Math.floor(rnd()*cp.count);p.fromBufferAttribute(cp,vi);const nn=new THREE.Vector3().fromBufferAttribute(cnr,vi);if(nn.y<-.3){nn.y=-nn.y}p.addScaledVector(nn,.03);q.setFromUnitVectors(new THREE.Vector3(0,0,1),nn);sc.setScalar(.7+rnd()*.6);m4.compose(p,q,sc);cards.setMatrixAt(k,m4)}tr.add(cards);return tr};
 const snowM=new THREE.MeshStandardMaterial({color:0xf6fbff,roughness:.6});const pineM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,color:0x2f6b4a});
 const mkPine=(H)=>{const tr=new THREE.Group();const tg=new THREE.CylinderGeometry(.04,.08,H*.5,7);tg.translate(0,H*.25,0);const tk=new THREE.Mesh(tg,barkM);tr.add(tk);
  for(let k=0;k<4;k++){const r=.42-k*.09,h=.42-k*.04,y=H*.3+k*.26;const g=new THREE.ConeGeometry(r,h,10,2);const pa=g.attributes.position;for(let v=0;v<pa.count;v++){if(pa.getY(v)<-h*.4){pa.setY(v,pa.getY(v)+Math.sin(v*1.7)*.03);pa.setX(v,pa.getX(v)*(1+Math.sin(v*2.3)*.08))}}g.computeVertexNormals();g.translate(0,y+h/2,0);shadeV(g,.5,1.1,y,y+h);
   const cm=new THREE.Mesh(g,pineM);cm.castShadow=!!QP.shadow;tr.add(cm,new THREE.Mesh(g,olM));
   if(P.snow){const sg=new THREE.ConeGeometry(r*.72,h*.5,10,1);sg.translate(0,y+h*.78,0);tr.add(new THREE.Mesh(sg,snowM))}}return tr};
 const cactM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.7,color:0x5f9a4a});
 const mkCactus=(H)=>{const tr=new THREE.Group();const arm=(r,h)=>{const g=new THREE.CapsuleGeometry(r,h,4,10);const pa=g.attributes.position,c=[];for(let v=0;v<pa.count;v++){const an=Math.atan2(pa.getZ(v),pa.getX(v));const rib=.85+.15*Math.abs(Math.cos(an*4));pa.setX(v,pa.getX(v)*rib);pa.setZ(v,pa.getZ(v)*rib);c.push(rib,rib,rib)}g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.computeVertexNormals();return g};
  const body=arm(.1,H*.8);body.translate(0,H*.5,0);const m=new THREE.Mesh(body,cactM);m.castShadow=!!QP.shadow;tr.add(m,new THREE.Mesh(body,olM));
  [[-1,.45],[1,.6]].forEach(([s,y])=>{const g=arm(.06,.22);const a1=new THREE.Mesh(g,cactM);a1.position.set(s*.17,H*y+.12,0);tr.add(a1,new THREE.Mesh(g,olM).translateX(s*.17).translateY(H*y+.12));const h=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.14,8),cactM);h.rotation.z=1.57;h.position.set(s*.1,H*y,0);tr.add(h)});
  const fl=new THREE.Mesh(new THREE.IcosahedronGeometry(.04,0),new THREE.MeshLambertMaterial({color:0xff7fa8,emissive:0xff7fa8,emissiveIntensity:.15}));fl.position.y=H*.92;tr.add(fl);return tr};
 const kelpM=W.windify(new THREE.MeshStandardMaterial({color:0x4f8a3a,roughness:.6,side:THREE.DoubleSide,vertexColors:true}),.22,1.6);
 const mkKelp=(H)=>{const tr=new THREE.Group();for(let k=0;k<6;k++){const g=new THREE.PlaneGeometry(.07,H*1.1,1,8);const pa=g.attributes.position,c=[];for(let v=0;v<pa.count;v++){const y=pa.getY(v)/(H*1.1)+.5;pa.setX(v,pa.getX(v)*(1+Math.sin(y*14)*.35)+Math.sin(y*5+k)*.05);c.push(.55+.45*y,.6+.4*y,.5+.3*y)}g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.translate(0,H*.55,0);const m=new THREE.Mesh(g,kelpM);const a=k*1.05;m.position.set(Math.cos(a)*.08,0,Math.sin(a)*.08);m.rotation.y=a;tr.add(m)}return tr};
 const crysC=[0x7fe8ff,0xc49bff,0x9fffd2][Math.floor(rnd()*3)];const crysM=new THREE.MeshStandardMaterial({color:crysC,emissive:crysC,emissiveIntensity:.55,roughness:.15,metalness:.1,transparent:true,opacity:.92,flatShading:true});
 const mkCrystal=(H)=>{const tr=new THREE.Group();for(let k=0;k<5;k++){const g=new THREE.OctahedronGeometry(.09,0);g.scale(1,3.2+rnd()*1.5,1);const m=new THREE.Mesh(g,crysM);const a=k*1.3;m.position.set(k?Math.cos(a)*.1:0,.25,k?Math.sin(a)*.1:0);m.rotation.set(k?Math.cos(a)*.4:0,rnd(),k?Math.sin(a)*.4:0);m.scale.setScalar(k?.6+rnd()*.3:1);tr.add(m)}tr.scale.setScalar(H*.8);return tr};
 const nT=P.tree?Math.min(rim.length,Math.max(2,Math.round(n*P.nt))):0;const stp=Math.max(1,Math.floor(rim.length/Math.max(1,nT)));const treeSpots=[];
 for(let t=0;t<nT;t++){const[i,j]=rim[(t*stp+2)%rim.length];const tr=({pine:mkPine,cactus:mkCactus,kelp:mkKelp,crystal:mkCrystal}[P.tree]||mkTree)(1.05+rnd()*.5);tr.position.set(i-C0+(rnd()-.5)*.2,0,j-C0+(rnd()-.5)*.2);tr.rotation.y=rnd()*6;tr.scale.setScalar(.85+rnd()*.3);isl.add(nr(tr));treeSpots.push(tr.position.clone())}
 // 6) bushes with blossoms, mushrooms near trees, mossy boulders, pebbles
 const bushM=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,color:leafBase.clone().offsetHSL(.02,0,.03)});
 const nB=P.bu;if(P.coral)for(let b=0;b<nB&&free.length;b++){const[i,j]=free[Math.floor(rnd()*free.length)];const cc=[0xff7f9a,0xffa45a,0xc48bff,0xff5f7a][b%4];const cm2=new THREE.MeshStandardMaterial({color:cc,roughness:.7});const g=new THREE.Group();const br=(d,len,par)=>{const c=new THREE.Mesh(new THREE.CylinderGeometry(.018*(3-d)/3+.008,.03*(3-d)/3+.01,len,6),cm2);c.position.y=len/2;const piv=new THREE.Group();piv.add(c);par.add(piv);if(d<2)for(let k=0;k<3;k++){const ch=new THREE.Group();ch.position.y=len;ch.rotation.set(.6*(rnd()+.3),k*2.1+rnd(),0,'YXZ');piv.add(ch);br(d+1,len*.7,ch)}};br(0,.16,g);g.scale.setScalar(1.5+rnd()*.8);g.position.set(i-C0+(rnd()-.5)*.6,0,j-C0+(rnd()-.5)*.6);isl.add(nr(g))}
 if(!P.coral)for(let b=0;b<nB&&rim.length;b++){const[i,j]=rim[(b*stp*2+Math.floor(stp/2)+5)%rim.length];const parts=[];for(let k=0;k<4;k++){const g=blob(.13+rnd()*.07,1,.12,k);g.translate((rnd()-.5)*.22,.1+rnd()*.06,(rnd()-.5)*.22);parts.push([g,C(0xffffff)])}const bgeo=merge(parts);shadeV(bgeo,.5,1.1,0,.3);
  const bu=new THREE.Group();const bm=new THREE.Mesh(bgeo,bushM);bm.castShadow=!!QP.shadow;bu.add(bm,new THREE.Mesh(bgeo,olM));
  const bc=[0xff8fc0,0xffffff,0xffd84a][b%3];for(let k=0;k<7;k++){const f=new THREE.Mesh(new THREE.IcosahedronGeometry(.022,0),new THREE.MeshLambertMaterial({color:bc,emissive:bc,emissiveIntensity:.12}));const a=rnd()*6.28;f.position.set(Math.cos(a)*.16,.16+rnd()*.1,Math.sin(a)*.16);bu.add(f)}
  bu.position.set(i-C0+(rnd()-.5)*.3,0,j-C0+(rnd()-.5)*.3);isl.add(nr(bu))}
 {const stem=new THREE.CylinderGeometry(.012,.016,.07,6);stem.translate(0,.035,0);const cap=new THREE.SphereGeometry(.035,10,6,0,6.283,0,1.6);cap.scale(1,.7,1);cap.translate(0,.07,0);
  const sm=new THREE.MeshLambertMaterial({color:0xf3ead8}),cm=new THREE.MeshStandardMaterial({color:P.glow?0x7fe8ff:rock?0xc98b4a:0xd9463a,emissive:P.glow?0x3fb8d8:0,emissiveIntensity:P.glow?.8:0,roughness:.5});
  if(P.mu)treeSpots.forEach(tp=>{const nm=Math.floor((1+rnd()*2)*P.mu);for(let k=0;k<nm;k++){const g=new THREE.Group();g.add(new THREE.Mesh(stem,sm),new THREE.Mesh(cap,cm));for(let d=0;d<4;d++){const dt=new THREE.Mesh(new THREE.SphereGeometry(.006,4,3),sm);const a=d*1.6+rnd();dt.position.set(Math.cos(a)*.022,.088,Math.sin(a)*.022);g.add(dt)}
   const a=rnd()*6.28,r=.18+rnd()*.15;g.position.set(tp.x+Math.cos(a)*r,0,tp.z+Math.sin(a)*r);g.scale.setScalar(.8+rnd()*.7);isl.add(nr(g))}})}
 const stoneM=new THREE.MeshStandardMaterial({vertexColors:true,map:cliff,roughness:.95,color:C(pal[2]).lerp(C(0xffffff),.3)});
 const mossy=(g)=>{const nn=g.attributes.normal,c=[];const moss=P.snow?C(0.62,.64,.66):P.sand?C(.62,.62,.62):C(pal[0]).multiplyScalar(1.15);for(let k=0;k<nn.count;k++){const m=THREE.MathUtils.smoothstep(nn.getY(k),.45,.8);c.push(1+(moss.r*1.6-1)*m,1+(moss.g*1.6-1)*m,1+(moss.b*1.6-1)*m)}g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));return g};
 const shadeAt=[...treeSpots.map(p=>[p.x,p.z,.9])];const nBo=P.bo;for(let b=0;b<nBo&&rim.length;b++){const[i,j]=rim[(b*3+1)%rim.length];const g=mossy(blob(.13+rnd()*(rock?.18:.08),1,.18,b));const m=new THREE.Mesh(g,stoneM);m.scale.y=.75;m.position.set(i-C0+(rnd()-.5)*.5,.04,j-C0+(rnd()-.5)*.5);m.rotation.y=rnd()*6;shadeAt.push([m.position.x,m.position.z,.5]);m.castShadow=!!QP.shadow;m.receiveShadow=true;const o=new THREE.Mesh(g,olM);m.add(o);isl.add(nr(m))}
 {const pg=new THREE.DodecahedronGeometry(.03,0);const pm=new THREE.MeshStandardMaterial({color:C(pal[2]).lerp(C(0xffffff),.25),roughness:.9,flatShading:true});const nP=Math.round(tiles.length*P.pe);const pi=new THREE.InstancedMesh(pg,pm,nP);
  for(let k=0;k<nP;k++){const[i,j]=tiles[Math.floor(rnd()*tiles.length)];e.set(rnd()*3,rnd()*3,0);q.setFromEuler(e);const s2=.5+rnd()*1.3;sc.set(s2,s2*.55,s2);p.set(i-C0+rnd()-.5,.005,j-C0+rnd()-.5);m4.compose(p,q,sc);pi.setMatrixAt(k,m4);if(P.shells)col.set([0xfff0e6,0xffc9b8,0xf6e2c0,0xffffff][k%4]);else if(P.snow)col.set(0xd8ecff);else col.setScalar(.8+rnd()*.3);pi.setColorAt(k,col)}pi.receiveShadow=true;isl.add(nr(pi))}
 // v6.7: cheap fish school for sea zones (1 instanced mesh, animated by group spin)
 if(P.sea){const fg=new THREE.ConeGeometry(.05,.18,5);fg.rotateZ(-Math.PI/2);fg.scale(1,1,.45);const nF=Math.min(36,6+Math.round(n*1.2));const fi=new THREE.InstancedMesh(fg,new THREE.MeshLambertMaterial({color:0xffffff}),nF);const fsh=new THREE.Group();
  for(let k=0;k<nF;k++){const a=rnd()*6.28,r=n*.18+rnd()*n*.3;p.set(Math.cos(a)*r,.6+rnd()*1.4,Math.sin(a)*r);e.set(0,-a,0);q.setFromEuler(e);sc.setScalar(1.8+rnd()*1.4);m4.compose(p,q,sc);fi.setMatrixAt(k,m4);col.set([0xffc24a,0x7fd8ff,0xff8a5a,0xf4f4ff][k%4]);fi.setColorAt(k,col)}
  fi.frustumCulled=false;fsh.add(fi);fi.onBeforeRender=()=>{fsh.rotation.y=performance.now()*-.00012;fsh.position.y=Math.sin(performance.now()*.0008)*.08};isl.add(nr(fsh))}
 if(shadeAt.length){const sg=new THREE.PlaneGeometry(1,1);sg.rotateX(-Math.PI/2);const si=new THREE.InstancedMesh(sg,new THREE.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,opacity:P.snow?.6:1}),shadeAt.length);shadeAt.forEach(([x,z,s2],k)=>{p.set(x,.02,z);q.identity();sc.set(s2,1,s2);m4.compose(p,q,sc);si.setMatrixAt(k,m4)});si.renderOrder=1;isl.add(nr(si))}
};
if(W.zone)try{G.W6build(W.zone);G.W6env({id:W.zone},0)}catch(e){console.warn('w7',e)}
}

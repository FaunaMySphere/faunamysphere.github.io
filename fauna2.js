// ===== fauna2.js: realistic/detailed fauna look (batch 1: Hoofer, Sniffer, Pouncer) =====
// Upgrades the mesh built by gl.js buildFauna in place, keeping rig names (body/head/legs/tail/eyes/lids).
(function(){
const BATCH={horse:1,dog:1,fox:1};
let NM=null,GEO={};
function furNormal(T){if(NM)return NM;const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');
 // height field of short soft strands
 x.fillStyle='#808080';x.fillRect(0,0,N,N);for(let i=0;i<2600;i++){const px=Math.random()*N,py=Math.random()*N,l=4+Math.random()*7,a=Math.PI/2+(Math.random()-.5)*.7,v=110+Math.random()*120|0;x.strokeStyle=`rgba(${v},${v},${v},.55)`;x.lineWidth=1+Math.random();x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);x.stroke()}
 const h=x.getImageData(0,0,N,N).data,o=x.createImageData(N,N),H=(i,j)=>h[(((j+N)%N)*N+((i+N)%N))*4]/255;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const dx=(H(i+1,j)-H(i-1,j))*2.2,dy=(H(i,j+1)-H(i,j-1))*2.2,l=Math.hypot(dx,dy,1),k=(j*N+i)*4;o.data[k]=(-dx/l*.5+.5)*255;o.data[k+1]=(dy/l*.5+.5)*255;o.data[k+2]=(1/l*.5+.5)*255;o.data[k+3]=255}
 x.putImageData(o,0,0);NM=new T.CanvasTexture(c);NM.wrapS=NM.wrapT=T.RepeatWrapping;NM.repeat.set(3,3);return NM}
function hiSphere(T){return GEO.s||(GEO.s=new T.SphereGeometry(1,40,28))}
window.FSFaunaHD=function(root,rig,genes,animal,a,T,hd){try{
 // all fauna: drop the thick toon outlines (fauna only) — also fewer draw calls
 const kill=[];root.traverse(m=>{if(m.isMesh&&m.material&&m.material.side===T.BackSide&&m.material.isMeshBasicMaterial)kill.push(m)});kill.forEach(m=>m.parent&&m.parent.remove(m));
 if(!BATCH[animal])return;
 const col=new T.Color((window.COLORS&&COLORS[genes.color])||'#e2b273'),cream=new T.Color(0xfff1dc),creamC=col.clone().lerp(cream,.78);
 const b=rig.body,fur=b.children[0]&&b.children[0].material,nm=furNormal(T);
 const furHi=m=>{if(!m||m._hd)return;m._hd=1;m.normalMap=nm;m.normalScale=new T.Vector2(hd?.55:.35,hd?.55:.35);m.roughness=.85;if('sheen'in m){m.sheen=1;m.sheenRoughness=.35}m.needsUpdate=true};
 furHi(fur);
 const creamM=new T.MeshPhysicalMaterial({color:creamC,roughness:.9,sheen:1,sheenRoughness:.3,sheenColor:new T.Color(0xffffff),normalMap:nm,normalScale:new T.Vector2(.45,.45)});
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
  rig.ears.forEach(e=>{if(e.geometry.type==='ConeGeometry'){const inn=new T.Mesh(e.geometry,new T.MeshStandardMaterial({color:new T.Color(0xf4c6b8),roughness:.8}));inn.scale.set(.62,.78,.5);inn.position.set(0,-hs*.05,hs*.17);e.add(inn);e.material=e.material===fur?fur:e.material}
   else{const inn=new T.Mesh(sp,new T.MeshStandardMaterial({color:new T.Color(0xe8b4a4),roughness:.8}));inn.scale.set(.6,.7,.5);inn.position.set(0,0,.4);e.add(inn)}});
  rig.eyes.forEach(e=>{const ir=e.children[1];if(ir&&ir.isMesh){ir.material=new T.MeshPhysicalMaterial({color:ir.material.color.clone().multiplyScalar(.5),roughness:.05,clearcoat:1,clearcoatRoughness:.05});ir.scale.multiplyScalar(1.25)}
   const h2=new T.Mesh(sp,new T.MeshBasicMaterial({color:0xffffff}));h2.scale.set(hs*.03,hs*.03,hs*.015);h2.position.set(-hs*.05,-hs*.06,hs*.24);e.add(h2)})}
 // fluffy tail with cream tip
 const tl=rig.tail;if(tl){tl.children.forEach(m=>{if(m.isMesh&&m.material===fur)m.scale.multiplyScalar(animal==='fox'?1.35:1.15)});if(animal==='fox'||animal==='dog'){const tip=new T.Mesh(sp,creamM);tip.scale.set(.06,.06,.08);tip.position.set(0,animal==='fox'?.12:.13,animal==='fox'?-.27:-.1);tl.add(tip)}}
 root.traverse(m=>{if(!m.isMesh)return;m.userData.noToon=1;if(!m.material.transparent)m.castShadow=!!hd;
  if(!hd&&m.material.isMeshPhysicalMaterial){const o=m.material;m.material=new T.MeshStandardMaterial({color:o.color,map:o.map,roughness:o.roughness,normalMap:o.normalMap,normalScale:o.normalScale})}});
if(0){window.__hdBig=[];root.updateMatrixWorld(true);const v=new T.Vector3();root.traverse(m=>{if(m.isMesh){m.getWorldScale(v);if(v.x>.4)__hdBig.push(m.geometry.type+':'+v.x.toFixed(2)+':'+(m.material.type)+':'+(m.parent===root?'root':m.parent===b?'body':'other'))}})}
 root.userData.hd=hd?2:1}catch(e){console.warn('faunaHD',e)}};
})();

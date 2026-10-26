// v6.17: buildable houses at home. Cottage, Treehouse, Barn, Tower, 4 colour styles each.
// Stored as home fixtures {type:'house',kind,i,j,rot,style} in S.zones.home.objs; stored (un-placed) houses in S.player.houses (default {}).
import * as THREE from 'three';
const G=window,t=k=>(G.FS&&FS.t)?FS.t(k):k;
const KINDS={
 cottage:{name:'Cottage',es:'Casita',lux:400,bux:6,fp:2,icon:'🏡',styles:[['#efe3c8','#b5523b','#6b4a2f'],['#dfe9ef','#3d5a80','#4a3a2a'],['#f4d9b0','#5d7f3a','#5b3b22'],['#e9d6e8','#7a4e8a','#3f2f45']]},
 treehouse:{name:'Treehouse',es:'Casa del árbol',lux:650,bux:9,fp:2,icon:'🌳',styles:[['#a8763e','#4f8a3a','#6b4a2f'],['#c49a6c','#c8732f','#5b3b22'],['#8d6a4a','#3d7f6e','#4a3424'],['#b98a5e','#c2547a','#5a3d2a']]},
 barn:{name:'Barn',es:'Granero',lux:900,bux:12,fp:2,icon:'🛖',styles:[['#a8322b','#5c5f66','#f4efe6'],['#3f6e8c','#4b4e55','#f4efe6'],['#5f7f3d','#6a4d33','#f1e8d0'],['#d9a441','#7a3b22','#fbf5e8']]},
 tower:{name:'Tower',es:'Torre',lux:700,bux:10,fp:1,icon:'🗼',styles:[['#b9b2a5','#3d5a80','#e04b3a'],['#d8cdb8','#7a2e2e','#ffd84a'],['#8f949b','#2f4f3f','#6fd3ff'],['#e8e1d3','#5b3b7a','#ff8fc0']]}};
G.FSHOUSES=KINDS;
const FPS={1:[[0,0]],2:[[0,0],[1,0],[0,1],[1,1]]};
G.FSfoot=o=>o&&o.type==='house'?FPS[(KINDS[o.kind]||KINDS.cottage).fp]:null;
// ---------- cheap procedural textures (64px canvases, cached) ----------
const TX={};function tex(kind,col){const k=kind+col;if(TX[k])return TX[k];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');const base=new THREE.Color(col);
 const sh=(f)=>'#'+base.clone().multiplyScalar(f).getHexString();x.fillStyle=col;x.fillRect(0,0,64,64);
 if(kind==='plank'){for(let r=0;r<8;r++){x.fillStyle=sh(.9+((r*37)%7)/40);x.fillRect(0,r*8,64,7);x.fillStyle=sh(.62);x.fillRect(0,r*8+7,64,1);x.fillRect(((r*23)%48)+8,r*8,1,7)}}
 else if(kind==='brick'||kind==='stone'){const h=kind==='brick'?8:16,w=kind==='brick'?16:21;for(let r=0;r<64/h;r++)for(let q=-1;q<4;q++){const o=(r%2)*w/2;x.fillStyle=sh(.85+((r*7+q*13)%9)/30);x.fillRect(q*w+o+1,r*h+1,w-2,h-2)}}
 else if(kind==='shingle'){for(let r=0;r<8;r++)for(let q=0;q<5;q++){const o=(r%2)*6;x.fillStyle=sh(.8+((r*5+q*3)%7)/25);x.fillRect(q*13+o,r*8,12,7);x.fillStyle=sh(.55);x.fillRect(q*13+o,r*8+7,13,1)}}
 else if(kind==='plaster'){for(let n=0;n<160;n++){x.fillStyle=sh(.9+Math.random()*.15);x.fillRect(Math.random()*64,Math.random()*64,2,2)}}
 const T=new THREE.CanvasTexture(c);T.wrapS=T.wrapT=THREE.RepeatWrapping;T.colorSpace=THREE.SRGBColorSpace;T.magFilter=THREE.NearestFilter;return TX[k]=T}
const MC={};function mat(col,kind,rep){const k=col+(kind||'')+(rep||1);if(MC[k])return MC[k];const m=new THREE.MeshStandardMaterial({color:kind?0xffffff:col,roughness:.9,flatShading:true});if(kind){m.map=tex(kind,col).clone();m.map.needsUpdate=true;m.map.repeat.set(rep||1,rep||1)}return MC[k]=m}
const GEO={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),cone4:new THREE.ConeGeometry(1,1,4),cone:new THREE.ConeGeometry(1,1,10),ico:new THREE.IcosahedronGeometry(1,0)};
const gable=(()=>{const s=new THREE.Shape();s.moveTo(-.5,0);s.lineTo(.5,0);s.lineTo(0,.5);s.lineTo(-.5,0);const g=new THREE.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);return g})();
function M(g,m,s,p,r){const o=new THREE.Mesh(g,m);o.scale.set(...s);o.position.set(...p);if(r)o.rotation.set(...r);o.castShadow=o.receiveShadow=true;return o}
const DOOR=0x5b3b22,GLASS=new THREE.MeshStandardMaterial({color:0xffe9a8,emissive:0xffc860,emissiveIntensity:.55,roughness:.3});
function win(g,x,y,z,ry,w=.2,h=.22){const f=mat('#f6f1e6');g.add(M(GEO.box,f,[w+.06,h+.06,.04],[x,y,z],[0,ry,0]));const gl=M(GEO.box,GLASS,[w,h,.05],[x,y,z],[0,ry,0]);g.add(gl);g.add(M(GEO.box,f,[.025,h,.06],[x,y,z],[0,ry,0]))}
const BUILD={
 cottage(g,[wall,roof,trim]){g.add(M(GEO.box,mat('#8a8f96','stone',2),[1.62,.14,1.42],[0,.07,0]));g.add(M(GEO.box,mat(wall,'plaster'),[1.5,.85,1.3],[0,.56,0]));
  [[-.75,.75],[.75,.75],[-.75,-.65],[.75,-.65]].forEach(([x,z])=>g.add(M(GEO.box,mat(trim,'plank'),[.08,.86,.08],[x,.56,z*1])));
  g.add(M(gable,mat(roof,'shingle',2),[1.75,1.05,1.55],[0,.98,0],[0,Math.PI/2,0]));g.add(M(GEO.box,mat(trim,'plank'),[.06,.06,1.6],[0,1.5,0],[0,0,0]));
  g.add(M(GEO.box,mat('#9a8f86','brick'),[.24,.6,.24],[.45,1.45,-.3]));g.add(M(GEO.box,mat(DOOR?'#5b3b22':'#5b3b22','plank'),[.32,.52,.05],[0,.4,.66]));g.add(M(GEO.box,mat('#ffd84a'),[.04,.04,.03],[.1,.4,.69]));
  win(g,-.45,.62,.66,0);win(g,.45,.62,.66,0);win(g,.76,.62,0,Math.PI/2);win(g,-.76,.62,0,Math.PI/2);
  g.add(M(GEO.box,mat('#7e8790','stone'),[.5,.06,.3],[0,.03,.86]));for(const x of[-.62,.62]){g.add(M(GEO.ico,mat('#4f8a3a'),[.16,.13,.16],[x,.14,.78]));g.add(M(GEO.ico,mat('#ff8fc0'),[.05,.05,.05],[x+.05,.26,.84]))}},
 treehouse(g,[wood,leaf,trim]){const bark=mat('#6b4a2f','plank');g.add(M(GEO.cyl,bark,[.24,1.5,.24],[0,.75,0]));for(const[a,l]of[[0,.5],[2.1,.45],[4.2,.5]])g.add(M(GEO.cyl,bark,[.07,l,.07],[Math.cos(a)*.2,.15,Math.sin(a)*.2],[Math.sin(a)*.9,0,-Math.cos(a)*.9]));
  g.add(M(GEO.box,mat(wood,'plank',2),[1.5,.1,1.5],[0,1.25,0]));for(const[x,z]of[[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]])g.add(M(GEO.cyl,mat(trim,'plank'),[.05,1.25,.05],[x,.62,z]));
  g.add(M(GEO.box,mat(wood,'plank'),[.9,.6,.8],[-.1,1.6,-.15]));g.add(M(gable,mat(leaf,'shingle'),[1.05,.6,.95],[-.1,1.9,-.15]));win(g,.36,1.62,-.15,Math.PI/2);g.add(M(GEO.box,mat('#5b3b22','plank'),[.24,.4,.04],[-.1,1.5,.26]));
  for(const x of[-.7,.7])g.add(M(GEO.box,mat(trim,'plank'),[.04,.22,1.5],[x,1.4,0]));g.add(M(GEO.box,mat(trim,'plank'),[1.5,.22,.04],[0,1.4,-.75]));
  for(let k=0;k<6;k++)g.add(M(GEO.box,mat(trim,'plank'),[.32,.04,.04],[.45,.18+k*.2,.78]));g.add(M(GEO.box,mat(trim),[.03,1.25,.03],[.3,.62,.78]));g.add(M(GEO.box,mat(trim),[.03,1.25,.03],[.6,.62,.78]));
  const L=mat('#4f8a3a');for(const[x,y,z,s]of[[.2,2.35,.2,.55],[-.5,2.2,.35,.45],[.45,2.15,-.45,.5],[-.3,2.45,-.4,.45],[0,2.6,0,.4]])g.add(M(GEO.ico,L,[s,s*.85,s],[x,y,z]))},
 barn(g,[wall,roof,trim]){g.add(M(GEO.box,mat('#8a8f96','stone',2),[1.66,.1,1.66],[0,.05,0]));g.add(M(GEO.box,mat(wall,'plank',2),[1.5,.9,1.5],[0,.55,0]));
  const R=mat(roof,'shingle',2),h=1;for(const s of[-1,1]){g.add(M(GEO.box,R,[.5,.06,1.62],[s*.56,1.15,0],[0,0,s*-0.95]));g.add(M(GEO.box,R,[.5,.06,1.62],[s*.2,1.42,0],[0,0,s*-0.35]))}
  const end=new THREE.Shape();end.moveTo(-.75,0);end.lineTo(.75,0);end.lineTo(.42,.4);end.lineTo(0,.57);end.lineTo(-.42,.4);end.lineTo(-.75,0);const eg=new THREE.ShapeGeometry(end);for(const z of[.75,-.75]){const e=new THREE.Mesh(eg,mat(wall,'plank',2));e.position.set(0,1,z);if(z<0)e.rotation.y=Math.PI;g.add(e)}
  const T=mat(trim);g.add(M(GEO.box,mat('#5a2a22','plank'),[.62,.62,.04],[0,.41,.76]));for(const r of[.78,-.78])g.add(M(GEO.box,T,[.05,.86,.03],[0,.41,.785],[0,0,r]));
  for(const[a,b,c,d]of[[.66,.04,0,.72],[.04,.66,-.31,.41],[.04,.66,.31,.41]])g.add(M(GEO.box,T,[a,b,.03],[c,d,.785]));g.add(M(GEO.box,T,[.3,.3,.03],[0,1.25,.78]));g.add(M(GEO.box,mat('#3a2a1a'),[.22,.22,.035],[0,1.25,.785]));
  g.add(M(GEO.cyl,mat('#d9c27a'),[.18,.22,.18],[.95,.11,.5],[Math.PI/2,0,0]));g.add(M(GEO.cyl,mat('#d9c27a'),[.18,.22,.18],[.95,.11,.1],[Math.PI/2,0,0]))},
 tower(g,[wall,roof,flag]){g.add(M(GEO.cyl,mat(wall,'stone',2),[.36,1.7,.36],[0,.85,0]));g.add(M(GEO.cyl,mat(wall,'stone'),[.42,.18,.42],[0,1.75,0]));
  for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.add(M(GEO.box,mat(wall,'stone'),[.1,.12,.1],[Math.cos(a)*.38,1.9,Math.sin(a)*.38]))}
  g.add(M(GEO.cone,mat(roof,'shingle',2),[.46,.7,.46],[0,2.2,0]));g.add(M(GEO.cyl,mat('#555'),[.012,.35,.012],[0,2.7,0]));g.add(M(GEO.box,mat(flag),[.22,.12,.01],[.11,2.78,0]));
  g.add(M(GEO.box,mat('#5b3b22','plank'),[.22,.38,.05],[0,.2,.35]));win(g,0,.9,.36,0,.1,.18);win(g,0,1.35,-.36,0,.1,.18);win(g,.36,1.2,0,Math.PI/2,.1,.18)}};
function build(o){const K=KINDS[o.kind]||KINDS.cottage,st=K.styles[(o.style|0)%K.styles.length];const inner=new THREE.Group();(BUILD[o.kind]||BUILD.cottage)(inner,st);
 const g=new THREE.Group();const off=K.fp===2?.5:0;inner.rotation.y=((o.rot|0)%4)*Math.PI/2;inner.position.set(off,0,off);g.add(inner);
 // soft contact shadow
 const sh=new THREE.Mesh(new THREE.CircleGeometry(K.fp*.75,16),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.set(off,.015,off);g.add(sh);return g}
function hook(){const B=G.GLB;if(!B)return setTimeout(hook,200);B.house=build}hook();
// house objs are rebuilt by syncObjs only when type+item changes: encode kind/style/rot in item so restyles/rotations refresh the mesh
setInterval(()=>{try{const h=S.zones&&S.zones.home;if(!h)return;h.objs.forEach(o=>{if(o.type==='house'){const k=(o.kind||'cottage')+':'+(o.style|0)+':'+(o.rot|0);if(o.item!==k)o.item=k}})}catch(e){}},150);
// ---------- buy / place / store ----------
const nm=K=>(G.I18N&&I18N.lang==='es'||document.documentElement.lang==='es')?K.es:K.name;
function spotFor(kind){const s=zs('home'),n=s.tiles.length,K=KINDS[kind],c=(n-1)/2,fp=FPS[K.fp];const cand=[];for(let i=1;i<n-1;i++)for(let j=1;j<n-1;j++)cand.push([i,j,Math.hypot(i-c+1,j-c-2)]);cand.sort((a,b)=>a[2]-b[2]);
 for(const[i,j]of cand){if(fp.every(([a,b])=>{const I=i+a,J=j+b;return s.tiles[I]&&s.tiles[I][J]&&!s.objs.some(o=>(G.FSfoot&&FSfoot(o)||[[0,0]]).some(([x,y])=>o.i+x===I&&o.j+y===J))&&!(Math.round(rt.pos.i)===I&&Math.round(rt.pos.j)===J)}))return[i,j]}return null}
function place(kind,style){const p=spotFor(kind);if(!p){toast(t('No room! Move some things first.'));return null}const s=zs('home');const o={id:'house_'+Date.now().toString(36),type:'house',kind,style:style|0,rot:0,i:p[0],j:p[1]};o.item=kind+':'+(style|0)+':0';s.objs.push(o);try{save()}catch(e){}
 try{if(G.FSarr){if(!FSarr.on)FSarr.setOn(true);FSarr.sel=[o.id];FSarr.render()}}catch(e){}try{Sound.sfx('pop')}catch(e){}return o}
G.FShouse={place,store(o){const s=zs('home');const k=s.objs.indexOf(o);if(k<0)return;s.objs.splice(k,1);S.player.houses=S.player.houses||{};const key=o.kind+':'+(o.style|0);S.player.houses[key]=(S.player.houses[key]|0)+1}};
function buy(kind,style,cur){const K=KINDS[kind],P=S.player,c=cur==='bux'?K.bux:K.lux;if((P[cur]|0)<c){toast(t(cur==='bux'?'Not enough Bux.':'Not enough Lux.'));return}P[cur]-=c;closeM();place(kind,style)}
let ov=null;function closeM(){if(ov){ov.remove();ov=null}}
function openBuild(){closeM();ov=document.createElement('div');ov.id='buildm';ov.style.cssText='position:fixed;inset:0;z-index:90;background:#0007;display:flex;align-items:flex-end;justify-content:center';
 const P=S.player;const inv=P.houses||{};let h='<div style="background:linear-gradient(#3fa22a,#2b8b1a);color:#fff;border-radius:18px 18px 0 0;padding:12px 10px 18px;width:100%;max-width:440px;max-height:78vh;overflow:auto;font-family:inherit"><div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">🏠 '+t('Build a House')+'</b><span style="font-weight:700">● '+(P.lux|0)+' Lux · ■ '+(P.bux|0)+' Bux <button data-x style="margin-left:6px;border:2px solid #fff;border-radius:10px;background:#c0392b;color:#fff;font:700 14px inherit;padding:3px 9px">✕</button></span></div>';
 for(const k in KINDS){const K=KINDS[k];h+='<div style="background:#0003;border-radius:12px;margin-top:8px;padding:8px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:30px">'+K.icon+'</span><div style="flex:1"><b style="font-size:15px">'+nm(K)+'</b><div style="font-size:11px;opacity:.9">'+(K.fp===2?'2×2':'1×1')+' · '+t('Fauna walk around it')+'</div></div></div><div style="display:flex;gap:6px;margin:6px 0">';
  K.styles.forEach((s,i)=>{h+='<button data-sw="'+k+'" data-st="'+i+'" style="width:34px;height:34px;border-radius:9px;border:3px solid '+(i?'#fff6':'#ffd84a')+';background:linear-gradient(135deg,'+s[0]+' 50%,'+s[1]+' 50%)"></button>'});
  h+='</div><div style="display:flex;gap:6px;flex-wrap:wrap"><button data-buy="'+k+'" data-c="lux" style="flex:1;min-height:38px;border:2px solid #fff;border-radius:10px;background:#e2a23b;color:#fff;font:700 13px inherit">'+t('Buy')+' ● '+K.lux+' Lux</button><button data-buy="'+k+'" data-c="bux" style="flex:1;min-height:38px;border:2px solid #fff;border-radius:10px;background:#3d5a80;color:#fff;font:700 13px inherit">'+t('Buy')+' ■ '+K.bux+' Bux</button>';
  for(const key in inv)if(inv[key]>0&&key.split(':')[0]===k)h+='<button data-own="'+key+'" style="flex:1;min-height:38px;border:2px solid #fff;border-radius:10px;background:#3d8b5a;color:#fff;font:700 13px inherit">'+t('Place yours')+' ×'+inv[key]+'</button>';
  h+='</div></div>'}
 ov.innerHTML=h+'</div>';document.body.appendChild(ov);const sel={};
 ov.onclick=e=>{const b=e.target.closest('button');if(e.target===ov)return closeM();if(!b)return;e.stopPropagation();
  if(b.dataset.x!=null)return closeM();if(b.dataset.sw){sel[b.dataset.sw]=+b.dataset.st;ov.querySelectorAll('[data-sw="'+b.dataset.sw+'"]').forEach(x=>x.style.borderColor=x===b?'#ffd84a':'#fff6');return}
  if(b.dataset.buy)return buy(b.dataset.buy,sel[b.dataset.buy]|0,b.dataset.c);
  if(b.dataset.own){const[k,s]=b.dataset.own.split(':');inv[b.dataset.own]--;if(!inv[b.dataset.own])delete inv[b.dataset.own];closeM();place(k,+s)}}}
G.FSbuild=openBuild;
// edit-mode integration: 🏠 Build button, 🎨 cycles house colour style
function integ(){const A=G.FSarr;if(!A||!A.addBarBtn)return setTimeout(integ,250);A.styleFns.push(o=>{if(o.type==='house'){const K=KINDS[o.kind];o.style=((o.style|0)+1)%K.styles.length}})}integ();
// v7.5.3: 🏠 BUILD button beside EDIT at home (not in edit toolbar, hidden away from home / on visits)
function homeBtn(){const ed=document.getElementById('edit');if(!ed)return setTimeout(homeBtn,400);const b=document.createElement('button');b.id='buildbtn';b.className='rbtn';b.title='Build';b.innerHTML='<i>🏠</i><span></span>';ed.parentNode.insertBefore(b,ed);
 b.onclick=e=>{e.stopPropagation();(G.FSbuild||openBuild)()};setInterval(()=>{try{const sp=b.querySelector('span'),l=t('BUILD');if(sp.textContent!==l)sp.textContent=l;const show=typeof S!=='undefined'&&S.zone==='home'&&!(G.FSVisit&&FSVisit.on);b.style.display=show?'':'none';const mc=document.getElementById('mpcount'),tp=document.getElementById('top');if(mc&&tp&&innerWidth<560){const y=show?(tp.getBoundingClientRect().bottom+4)+'px':'';if(mc.style.top!==y){mc.style.top=y||'calc(env(safe-area-inset-top) + 4px)';mc.style.left=show?'44%':'50%'}}}catch(e){}},300)}homeBtn();
// fauna walk around houses (never through): block footprint, slide along walls, retarget taps inside a house
function inHouse(i,j,pad){const s=S.zones&&S.zones.home;if(!s||S.zone!=='home')return null;for(const o of s.objs){if(o.type!=='house')continue;const n=(KINDS[o.kind]||KINDS.cottage).fp;if(i>o.i-.5-pad&&i<o.i+n-.5+pad&&j>o.j-.5-pad&&j<o.j+n-.5+pad)return o}return null}
G.FSinHouse=inHouse;
function hookStep(){if(typeof G.step!=='function')return setTimeout(hookStep,300);const s0=G.step;G.step=function(dt){if(S.zone!=='home'||!rt.tgt){rt._wp=null;return s0(dt)}
 const fin=rt._wp?rt._fin:rt.tgt;const o=inHouse(fin[0],fin[1],.05);if(o){const n=(KINDS[o.kind]||KINDS.cottage).fp;let best=null,bd=1e9;for(let a=-1;a<=n;a++)for(let b=-1;b<=n;b++){if(a>=0&&a<n&&b>=0&&b<n)continue;const I=o.i+a,J=o.j+b,z=zs('home');if(!(z.tiles[I]&&z.tiles[I][J]))continue;const d=Math.hypot(I-rt.pos.i,J-rt.pos.j);if(d<bd){bd=d;best=[I,J]}}if(best){if(rt._wp)rt._fin=best;else rt.tgt=best}}
 const p0={i:rt.pos.i,j:rt.pos.j},oa=rt.onArrive;if(rt._wp)rt.onArrive=null;s0(dt);
 if(rt._wp){if(!rt.tgt){rt.tgt=rt._fin;rt._wp=null;rt._fin=null}rt.onArrive=oa}
 const h=rt.pos&&!inHouse(p0.i,p0.j,.2)&&inHouse(rt.pos.i,rt.pos.j,.2);if(!h)return;rt.pos=p0;
 const n=(KINDS[h.kind]||KINDS.cottage).fp,P=.75,x0=h.i-.5-P,x1=h.i+n-.5+P,z0=h.j-.5-P,z1=h.j+n-.5+P,F=rt._wp?rt._fin:rt.tgt;let best=null,bd=1e9;
 for(const c of[[x0,z0],[x1,z0],[x0,z1],[x1,z1]]){if(inHouse(c[0],c[1],.2))continue;let ok=true;for(let u=.1;u<1;u+=.1)if(inHouse(p0.i+(c[0]-p0.i)*u,p0.j+(c[1]-p0.j)*u,.2)){ok=false;break}if(!ok)continue;const d=Math.hypot(c[0]-p0.i,c[1]-p0.j)+Math.hypot(F[0]-c[0],F[1]-c[1]);if(d<bd&&Math.hypot(c[0]-p0.i,c[1]-p0.j)>.15){bd=d;best=c}}
 if(best){if(!rt._wp){rt._fin=rt.tgt;rt._wp=1}rt.tgt=best}};
 try{step=G.step}catch(e){}}hookStep();
try{Object.assign(G.I18N_ES=G.I18N_ES||{},{"Build":"Construir","BUILD":"CONSTRUIR","Build a House":"Construye una casa","Buy":"Comprar","Place yours":"Coloca la tuya","Fauna walk around it":"La fauna camina alrededor","No room! Move some things first.":"¡No hay espacio! Mueve algunas cosas primero.","Not enough Bux.":"No tienes suficientes Bux.","Not enough Lux.":"No tienes suficiente Lux."})}catch(e){}

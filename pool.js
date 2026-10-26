// v7.5: Pool for home bases. Fixture {type:'pool',id,i,j,rot,item:'pool'} in S.zones.home.objs; un-placed pools in S.player.pools (default 0).
// Tap the pool (or 🛁 Bathe button when near) → active fauna hops in, bathes, shakes off. Per-fauna cooldown f.bathT (default 0).
import * as THREE from 'three';
const G=window,t=k=>(G.FS&&FS.t)?FS.t(k):k,es=()=>G.FS&&FS.lang==='es';
const PRICE={lux:350,bux:5},CD=45000,DUR=6.5;
// ---------- 3D builder (toon basin, shimmering water, shower spout) ----------
let WT=null;function waterTex(){if(WT)return WT;const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#4fc3f7';x.fillRect(0,0,64,64);
 x.strokeStyle='#d8f6ff';x.lineWidth=2;for(let k=0;k<7;k++){x.beginPath();const y0=k*9+3;x.moveTo(0,y0);for(let u=0;u<=64;u+=8)x.lineTo(u,y0+Math.sin(u*.3+k)*3);x.stroke()}
 WT=new THREE.CanvasTexture(c);WT.wrapS=WT.wrapT=THREE.RepeatWrapping;WT.colorSpace=THREE.SRGBColorSpace;return WT}
const WM=[];
function build(o){const g=new THREE.Group();const st=(c)=>new THREE.MeshStandardMaterial({color:c,roughness:.8,flatShading:true});
 const M=(geo,m,p,s,r)=>{const e=new THREE.Mesh(geo,m);if(p)e.position.set(...p);if(s)e.scale.set(...s);if(r)e.rotation.set(...r);e.castShadow=e.receiveShadow=true;return e};
 const rim=M(new THREE.TorusGeometry(.4,.07,6,16),st(0xf4efe6),[0,.16,0],[1,1,1.4],[Math.PI/2,0,0]);g.add(rim);
 g.add(M(new THREE.CylinderGeometry(.43,.4,.16,16),st(0x5aa9d6),[0,.08,0]));
 const wm=new THREE.MeshStandardMaterial({color:0x8fe3ff,map:waterTex(),emissive:0x2aa6d8,emissiveIntensity:.35,roughness:.15,transparent:true,opacity:.9});WM.push(wm);
 const w=M(new THREE.CircleGeometry(.4,16),wm,[0,.15,0],null,[-Math.PI/2,0,0]);w.castShadow=false;g.add(w);
 // tiles around rim
 for(let k=0;k<8;k++){const a=k/8*Math.PI*2;g.add(M(new THREE.BoxGeometry(.1,.05,.1),st(k%2?0x7fd0ef:0xffffff),[Math.cos(a)*.46,.22,Math.sin(a)*.46*1.0]))}
 // shower post + head
 const pm=st(0xb9c3cc);g.add(M(new THREE.CylinderGeometry(.03,.035,.75,6),pm,[-.42,.5,0]));g.add(M(new THREE.CylinderGeometry(.025,.025,.22,6),pm,[-.32,.86,0],null,[0,0,Math.PI/2]));
 const head=M(new THREE.ConeGeometry(.08,.08,8),st(0xffd84a),[-.2,.82,0]);g.add(head);
 g.add(M(new THREE.SphereGeometry(.05,6,5),st(0xff6f91),[-.42,.9,0]));
 g.scale.setScalar(1.3);g.rotation.y=(o.rot|0)*Math.PI/2;g.userData.spout=head;return g}
function hookGL(){if(!G.GLB)return setTimeout(hookGL,300);G.GLB.pool=build}hookGL();
// ---------- 2D renderer ----------
function hook2D(){if(typeof G.drawObj!=='function')return setTimeout(hook2D,300);const d0=G.drawObj;G.drawObj=function(c,o,x,y,tm,env){if(o.type!=='pool')return d0.apply(this,arguments);
 c.save();c.lineWidth=2;c.strokeStyle='#0005';c.fillStyle='#f4efe6';c.beginPath();c.ellipse(x,y,26,13,0,0,7);c.fill();c.stroke();c.fillStyle='#4fc3f7';c.beginPath();c.ellipse(x,y,21,10,0,0,7);c.fill();
 c.strokeStyle='#e6fbff';for(let k=0;k<2;k++){const p=((tm/900+k*.5)%1);c.globalAlpha=1-p;c.beginPath();c.ellipse(x,y,6+p*14,3+p*6,0,0,7);c.stroke()}c.globalAlpha=1;
 c.fillStyle='#b9c3cc';c.fillRect(x-24,y-30,3,28);c.fillStyle='#ffd84a';c.beginPath();c.arc(x-18,y-30,4,0,7);c.fill();
 if(B&&B.o===o){c.fillStyle='#bfefff';for(let k=0;k<5;k++){c.fillRect(x-18+k*2,y-26+((tm/8+k*7)%22),1.5,4)}}c.restore()};try{drawObj=G.drawObj}catch(e){}}hook2D();
// ---------- buy / place / store ----------
function spot(){const s=zs('home'),c=[Math.round(rt.pos.i),Math.round(rt.pos.j)];const occ=(I,J)=>s.objs.some(o=>(G.FSfoot&&FSfoot(o)||[[0,0]]).some(([a,b])=>o.i+a===I&&o.j+b===J));
 for(let r=1;r<9;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){if(Math.max(Math.abs(a),Math.abs(b))!==r)continue;const I=c[0]+a,J=c[1]+b;if(s.tiles[I]&&s.tiles[I][J]&&!occ(I,J))return[I,J]}return null}
function place(){const p=spot();if(!p){toast(t('No room! Move some things first.'));return null}const o={id:'pool_'+Date.now().toString(36),type:'pool',item:'pool',rot:0,i:p[0],j:p[1]};zs('home').objs.push(o);try{save()}catch(e){}
 try{if(G.FSarr){if(!FSarr.on)FSarr.setOn(true);FSarr.sel=[o.id];FSarr.render()}}catch(e){}try{Sound.sfx('pop')}catch(e){}return o}
G.FSpool={place,store(o){const s=zs('home'),k=s.objs.indexOf(o);if(k<0)return;s.objs.splice(k,1);S.player.pools=(S.player.pools|0)+1}};
function card(){const P=S.player,n=P.pools|0;const B2='flex:1;min-height:38px;border:2px solid #fff;border-radius:10px;color:#fff;font:700 13px inherit;';
 return '<div id="poolcard" style="background:#0003;border-radius:12px;margin-top:8px;padding:8px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:30px">🛁</span><div style="flex:1"><b style="font-size:15px">'+t('Pool')+'</b><div style="font-size:11px;opacity:.9">1×1 · '+t('Tap it to bathe your fauna')+'</div></div></div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+
 '<button data-pool="lux" style="'+B2+'background:#e2a23b">'+t('Buy')+' ● '+PRICE.lux+' Lux</button><button data-pool="bux" style="'+B2+'background:#3d5a80">'+t('Buy')+' ■ '+PRICE.bux+' Bux</button>'+(n>0?'<button data-pool="own" style="'+B2+'background:#3d8b5a">'+t('Place yours')+' ×'+n+'</button>':'')+'</div></div>'}
function hookBuild(){if(typeof G.FSbuild!=='function')return setTimeout(hookBuild,300);const b0=G.FSbuild;G.FSbuild=function(){b0.apply(this,arguments);const ov=document.getElementById('buildm');if(!ov)return;const inner=ov.firstElementChild;if(!inner)return;
 const h=inner.firstElementChild;h.insertAdjacentHTML('afterend',card());
 inner.querySelectorAll('[data-pool]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const c=b.dataset.pool,P=S.player;
  if(c==='own'){P.pools=Math.max(0,(P.pools|0)-1)}else{if((P[c]|0)<PRICE[c]){toast(t(c==='bux'?'Not enough Bux.':'Not enough Lux.'));return}P[c]-=PRICE[c]}ov.remove();place()}))}}
hookBuild();
function openPool(){try{G.FSbuild();const c=document.getElementById('poolcard');if(c){c.scrollIntoView({block:'center'});c.style.boxShadow='0 0 0 3px #ffd84a'}}catch(e){}}G.FSopenPool=openPool;
// ---------- bathing ----------
let B=null;G.FSbath=()=>B;
function bathe(o){const f=fa();if(!f)return;const now=Date.now();const left=(f.bathT|0)+CD-now;if(left>0){toast((es()?'🛁 '+f.name+' está limpio. Otra vez en ':'🛁 '+f.name+' is still squeaky clean. Again in ')+Math.ceil(left/1000)+'s');return}
 rt.tgt=null;rt.sleep=false;B={o,t0:-1,f,ring:0,shook:0};chirp()}
function finish(){const f=B.f;f.bathT=Date.now();f.happiness=Math.min(100,(f.happiness||0)+20);if('clean' in f)f.clean=100;rt.happyT=performance.now?Date.now():0;try{rt.happyT=now()}catch(e){}
 try{toast(es()?'✨ ¡'+f.name+' está limpio y feliz! +20 felicidad':'✨ '+f.name+' is squeaky clean! +20 happiness')}catch(e){}try{save()}catch(e){}try{if(G.ui&&cur)ui(cur.v,cur)}catch(e){}B=null}
function chirp(){try{Sound.noise(.5,.12,1800,.01,'bandpass');Sound.tone(520,.12,'sine',.08,.01,780);setTimeout(()=>Sound.tone(660,.12,'sine',.07,.01,990),140)}catch(e){}}
function hookInteract(){if(typeof G.interact!=='function')return setTimeout(hookInteract,300);const i0=G.interact;G.interact=function(o){if(!o||o.type!=='pool')return i0.apply(this,arguments);
 if(S.zone!=='home'){toast(es()?'👀 Solo mirar: esta piscina es de tu amigo.':'👀 View only: this is your friend\'s pool.');return}
 if(G.FSarr&&FSarr.on)return i0.apply(this,arguments);if(B)return;rt.tgtObj=o;try{Sound.sfx('click')}catch(e){}walkTo(o,()=>bathe(o))};try{interact=G.interact}catch(e){}}hookInteract();
// Bathe button when near a pool
let bb=null;function near(){if(S.zone!=='home'||!rt||!rt.pos)return null;const s=zs('home');let best=null;for(const o of s.objs)if(o.type==='pool'&&Math.hypot(o.i-rt.pos.i,o.j-rt.pos.j)<1.8)best=o;return best}
setInterval(()=>{try{const o=(!B&&!(G.FSarr&&FSarr.on)&&typeof S!=='undefined')?near():null;if(!bb){bb=document.createElement('button');bb.id='bathebtn';bb.style.cssText='position:fixed;left:50%;bottom:205px;transform:translateX(-50%);z-index:40;border:3px solid #fff;border-radius:16px;background:#2aa6d8;color:#fff;font:800 16px inherit;padding:8px 16px;box-shadow:0 3px 0 #0004;display:none';
 bb.onclick=e=>{e.stopPropagation();if(bb.dataset.k==='new'){openPool();return}const p=near();if(p)bathe(p)};document.body.appendChild(bb)}const hp=!o&&!B&&S.zone==='home'&&!(G.FSarr&&FSarr.on)&&!document.getElementById('buildm')&&!zs('home').objs.some(x=>x.type==='pool')&&!(typeof MB!=='undefined'&&MB&&MB.offsetParent);bb.dataset.k=o?'bathe':hp?'new':'';bb.textContent=o?'🛁 '+t('Bathe'):'🛁 '+t('New: Pool!');bb.style.display=(o||hp)?'block':'none'}catch(e){}},400);
// per-frame: water shimmer + bathing animation (called from gl.js after animFauna)
const rings=[];let RG=null,RM=null;
function ringAt(scene,p){if(!RG){RG=new THREE.RingGeometry(.12,.16,16);RM=null}let r=rings.find(x=>!x.visible);if(!r){if(rings.length>=4)return;r=new THREE.Mesh(RG,new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false}));r.rotation.x=-Math.PI/2;rings.push(r);scene.add(r)}
 r.visible=true;r.position.copy(p);r.userData.l=0;r.scale.setScalar(1)}
let lastPh='';
G.FSpoolFrame=function(fm,tm,dt,spawn){for(const m of WM)if(m.map)m.map.offset.set(tm*.03,Math.sin(tm*.7)*.04),m.emissiveIntensity=.3+Math.sin(tm*2.3)*.1;
 for(const r of rings)if(r.visible){r.userData.l+=dt;const l=r.userData.l;r.scale.setScalar(1+l*4);r.material.opacity=Math.max(0,.8-l*1.1);if(l>.75)r.visible=false}
 if(!B)return;if(S.zone!=='home'||!fa()||fa()!==B.f){B=null;return}
 const W=G.W6||{},GL=G.GL||{},low=GL.Q==='low',ph=typeof isPhone!=='undefined'&&isPhone;const sk=low?3:ph?2:1;
 const fp=G.GLfpos?G.GLfpos():fm.position;if(B.t0<0){B.t0=tm;B.from=fm.position.clone()}const e=tm-B.t0;
 const pc=G.GLW2(B.o.i,B.o.j).clone();pc.y=B.from.y;
 const r=fm.userData.rig||{},sp=GL.scene||fm.parent;const surf=pc.y+.17;
 const P=(x,y,z)=>new THREE.Vector3(x,y,z);
 if(e<.55){const u=e/.55;fm.position.lerpVectors(B.from,pc,u);fm.position.y=B.from.y+Math.sin(u*Math.PI)*.45-(u>.7?(u-.7)*.5:0);fm.rotation.x=-.5*Math.sin(u*Math.PI);if(u>.92&&!B.splash){B.splash=1;splash(spawn,fm.position,sp,1);try{Sound.noise(.35,.18,900,.005,'lowpass')}catch(_){}}return}
 if(e<DUR-1.1){const k=e-.55;fm.position.copy(pc);const dunk=(k>2&&k<2.7)?Math.sin((k-2)/.7*Math.PI):0;
  fm.position.y=pc.y-.13+Math.sin(k*4.2)*.035-dunk*.16;fm.rotation.z=Math.sin(k*6)*.12;fm.rotation.x=dunk*.55;fm.rotation.y+=Math.sin(k*1.3)*.01;
  if(r.legs)r.legs.forEach((L,n)=>{if(L)L.rotation.x=Math.sin(k*14+n*Math.PI)*.8});if(r.tail)r.tail.rotation.y=Math.sin(k*10)*.7;if(r.head)r.head.rotation.z=Math.sin(k*3)*.15;
  B.ring+=dt;if(B.ring>.5){B.ring=0;ringAt(sp,P(pc.x,surf+.01,pc.z))}
  if(dunk>.9&&!B.dk){B.dk=1;splash(spawn,P(pc.x,surf,pc.z),sp,.7);try{Sound.noise(.25,.14,1200,.005,'bandpass')}catch(_){}}
  const fr=Math.floor(tm*60);if(fr%sk===0){const hx=pc.x-.23,hy=pc.y+.95;spawn({p:P(hx+(Math.random()-.5)*.1,hy,pc.z+(Math.random()-.5)*.1),v:P((Math.random()-.5)*.3+.25,-1.2,(Math.random()-.5)*.3),g:-6,col:new THREE.Color(.75,.93,1),size:.06,decay:.045});
   if(fr%(sk*4)===0)spawn({p:P(pc.x+(Math.random()-.5)*.5,surf,pc.z+(Math.random()-.5)*.5),v:P(0,.5,0),g:.4,col:new THREE.Color(1,1,1),size:.08,decay:.02})}
  if(Math.floor(k*1.6)!==B.sd){B.sd=Math.floor(k*1.6);try{Sound.tone(700+Math.random()*500,.06,'sine',.035,.005,1300)}catch(_){}}return}
 // hop out + shake-off
 if(!B.out){B.out=1;B.ob=fp.clone?fp.clone():B.from.clone();splash(spawn,fm.position,sp,.8)}
 const u=Math.min(1,(e-(DUR-1.1))/.45);if(u<1){fm.position.lerpVectors(pc,B.from,u);fm.position.y=B.from.y+Math.sin(u*Math.PI)*.4;return}
 const s=e-(DUR-.65);fm.rotation.y+=Math.sin(s*60)*.35;fm.rotation.z=Math.sin(s*55)*.15;
 if(!B.shook){B.shook=1;const n=low?10:ph?16:26;for(let q=0;q<n;q++){const a=q/n*Math.PI*2;spawn({p:P(fm.position.x,fm.position.y+.35,fm.position.z),v:P(Math.cos(a)*2.2,1+Math.random(),Math.sin(a)*2.2),g:-7,col:new THREE.Color(.7,.92,1),size:.07,decay:.035})}
  try{Sound.noise(.4,.12,2500,.01,'highpass')}catch(_){}}
 if(e>DUR-.35&&!B.sp){B.sp=1;const n=low?6:12;for(let q=0;q<n;q++)spawn({p:P(fm.position.x+(Math.random()-.5)*.6,fm.position.y+.2+Math.random()*.6,fm.position.z+(Math.random()-.5)*.6),v:P(0,.6,0),g:.3,col:new THREE.Color(1,.97,.55),size:.11,decay:.03});try{Sound.sfx('happy')}catch(_){}}
 if(e>=DUR)finish()};
function splash(spawn,p,sp,k){const low=(G.GL&&G.GL.Q)==='low',n=Math.round((low?8:16)*k);for(let q=0;q<n;q++){const a=Math.random()*Math.PI*2,s=.8+Math.random()*1.4;spawn({p:new THREE.Vector3(p.x,p.y+.15,p.z),v:new THREE.Vector3(Math.cos(a)*s,1.6+Math.random()*1.5,Math.sin(a)*s),g:-8,col:new THREE.Color(.72,.92,1),size:.07,decay:.04})}ringAt(sp,new THREE.Vector3(p.x,p.y+.18,p.z))}
try{Object.assign(G.I18N_ES=G.I18N_ES||{},{"Pool":"Piscina","Bathe":"Bañar","New: Pool!":"¡Nuevo: Piscina!","Tap it to bathe your fauna":"Tócala para bañar a tu fauna"})}catch(e){}

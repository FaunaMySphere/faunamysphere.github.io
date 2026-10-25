// v5 Edit Mode, reworked v6.12: touch-first home editing. Tap/drag any placed item or home fixture (den, nest, treat tree, totem...),
// screen-space picking with a finger-sized radius, drag moves immediately (no long-press needed), pan on empty ground, pinch/＋/− zoom,
// floating toolbar (Move, Rotate, Color, Layer, Store, Delete), undo x10, box multi-select, Done saves. Save format unchanged (fixtures keep i/j in S.zones.home).
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;const A={on:false,sel:[],undo:[],box:false,move:false,ptr:new Map(),g:null};window.FSarr=A;
try{Object.assign(window.I18N_ES=window.I18N_ES||{},{"Undo":"Deshacer","Box":"Grupo","Place":"Colocar","Clear":"Vaciar","Done":"Listo","Move":"Mover","Rotate":"Girar","Color":"Color","Store":"Guardar","Delete":"Borrar","Copy":"Copiar","Up":"Subir","Down":"Bajar",
 "Nothing to undo.":"Nada que deshacer.","Undone.":"Deshecho.","Can't place there.":"No se puede colocar ahí.","Box select: drag over items to select a group.":"Selección en grupo: arrastra sobre los objetos para elegir varios.","Box select off.":"Selección en grupo desactivada.",
 "Put ALL placed items back into your inventory?":"¿Devolver TODOS los objetos colocados a tu inventario?","Everything is back in your inventory.":"Todo volvió a tu inventario.","Tap a tile to move it there, or drag it.":"Toca una casilla para moverlo ahí, o arrástralo.",
 "No free tile next to it.":"No hay casilla libre al lado.","selected":"seleccionados","Delete this item for good? (📦 Store keeps it in your inventory.)":"¿Borrar este objeto para siempre? (📦 Guardar lo deja en tu inventario.)","Deleted.":"Borrado.","Home saved ✔":"Casa guardada ✔",
 "Tap an item to select it · drag an item to move it · drag the ground to look around · pinch or ＋/− to zoom":"Toca un objeto para elegirlo · arrástralo para moverlo · arrastra el suelo para mirar · pellizca o ＋/− para acercar",
 "This one can only be moved.":"Este solo se puede mover.","Stored in your inventory.":"Guardado en tu inventario."})}catch(e){}
const cv=document.getElementById('cv'),stage=document.getElementById('stage');
const FIX=['den','nest','treetree','totem','basin','dig','mushring','storepad','friendgate','gate','house'];window.FSarrFIX=FIX;
const D=()=>S.home.decor,Z0=()=>zs('home');
const isF=r=>typeof r==='string';
const get=r=>isF(r)?Z0().objs.find(o=>o.id===r&&FIX.includes(o.type)):D()[r];
const rel=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
const fp=o=>(window.FSfoot&&FSfoot(o))||[[0,0]];// footprint offsets (houses may be bigger than 1 tile)
const fixAt=(i,j,mv)=>Z0().objs.some(o=>o.type!=='decor'&&!(mv&&mv.has(o.id))&&fp(o).some(([a,b])=>o.i+a===i&&o.j+b===j));
const tileIn=(i,j)=>{const s=Z0();return !!(s.tiles[i]&&s.tiles[i][j])};
const tileOk=(i,j)=>tileIn(i,j)&&!fixAt(i,j);
const at=(i,j)=>D().map((d,k)=>[d,k]).filter(([d])=>d.i===i&&d.j===j).sort((a,b)=>(b[0].h|0)-(a[0].h|0)).map(x=>x[1]);
const tilePx=()=>{try{const c=Math.floor(Z0().tiles.length/2),a=projTile(c,c,0),b=projTile(c+1,c,0),d=projTile(c,c+1,0);return Math.max(6,(Math.hypot(a[0]-b[0],a[1]-b[1])+Math.hypot(a[0]-d[0],a[1]-d[1]))/2)}catch(e){return 24}};
// finger-friendly pick: nearest item in screen space (body centre and base), tall stacks win ties
const pick=(px,py)=>{const R=Math.max(26,tilePx()*.85);let best=null,bd=1e9;
 const tst=(ref,i,j,y0,y1,bias)=>{for(const y of[y0,(y0+y1)/2,y1]){const p=projTile(i,j,y);if(p[2]>1)continue;const d=Math.hypot(p[0]-px,p[1]-py)-bias;if(d<bd){bd=d;best=ref}}};
 D().forEach((d,k)=>tst(k,d.i,d.j,(d.h|0)*.3,(d.h|0)*.3+.5,(d.h|0)*.5));
 Z0().objs.forEach(o=>{if(!FIX.includes(o.type))return;const f=fp(o),cx=f.reduce((s,q)=>s+q[0],0)/f.length,cz=f.reduce((s,q)=>s+q[1],0)/f.length;tst(o.id,o.i+cx,o.j+cz,0,o.type==='house'?1.4:.8,-2)});
 return bd<R?best:null};
const fxs=()=>Z0().objs.filter(o=>FIX.includes(o.type)).map(o=>[o.id,o.i,o.j,o.rot|0]);
const snap=()=>JSON.stringify({d:D(),inv:S.player.inv,fx:fxs()});
const pushU=()=>{A.undo.push(snap());if(A.undo.length>10)A.undo.shift()};
const commit=()=>{try{syncHomeDecor();save()}catch(e){console.warn(e)}};
const undo=()=>{const u=A.undo.pop();if(!u){toast(t('Nothing to undo.'));return}try{const o=JSON.parse(u);S.home.decor.length=0;o.d.forEach(x=>S.home.decor.push(x));S.player.inv=o.inv;(o.fx||[]).forEach(([id,i,j,r])=>{const f=Z0().objs.find(x=>x.id===id);if(f){f.i=i;f.j=j;f.rot=r}});A.sel=[];commit();toast(t('Undone.'))}catch(e){console.warn(e)}};
// compute target placement for moving selection by (di,dj)
const plan=(di,dj)=>{const mvD=new Set(A.sel.filter(r=>!isF(r))),mvF=new Set(A.sel.filter(isF)),out=[];const per={};
 const occD=(i,j)=>at(i,j).filter(x=>!mvD.has(x));
 for(const r of A.sel.filter(isF)){const o=get(r);if(!o)continue;const i=o.i+di,j=o.j+dj;let bad=false;for(const[a,b]of fp(o)){const I=i+a,J=j+b;if(!tileIn(I,J)||fixAt(I,J,mvF)||occD(I,J).length)bad=true}
  if(!bad)for(const q of out)if(q.f&&fp(q.o).some(([a,b])=>fp(o).some(([c,d])=>q.i+a===i+c&&q.j+b===j+d)))bad=true;out.push({k:r,f:1,o,type:o.type,i,j,rot:o.rot|0,h:0,style:o.style,col:o.col,bad})}
 for(const k of A.sel.filter(r=>!isF(r)).sort((a,b)=>(D()[a].h|0)-(D()[b].h|0))){const d=D()[k];if(!d)continue;const i=d.i+di,j=d.j+dj,key=i+','+j;
  let bad=!tileIn(i,j)||fixAt(i,j,mvF)||out.some(q=>q.f&&fp(q.o).some(([a,b])=>q.i+a===i&&q.j+b===j));const others=occD(i,j).map(x=>D()[x]);if(others.some(o=>o.item!=='d_block'))bad=true;
  const base=others.length;per[key]=per[key]||0;const h=base+per[key];if(h>6)bad=true;per[key]++;
  out.push({k,item:d.item,i,j,rot:d.rot|0,h,col:d.col,v:d.v,bad})}return out};
const ghosts=p=>{rt.ghosts=p.map(({type,item,i,j,rot,h,col,v,style,bad})=>type?{type,i,j,rot,h,col,style,bad}:{item,i,j,rot,h,col,v,bad})};
const applyPlan=p=>{if(!p.length)return false;if(p.some(x=>x.bad)){toast(t("Can't place there."));try{navigator.vibrate&&navigator.vibrate([20,40,20])}catch(_){}return false}pushU();p.forEach(x=>{const d=get(x.k);if(!d)return;d.i=x.i;d.j=x.j;if(!x.f)d.h=x.h});commit();try{Sound.sfx('pop')}catch(e){}return true};
// ---------- UI ----------
const css=document.createElement('style');css.textContent='#arrbar{position:fixed;left:0;right:0;margin:0 auto;width:max-content;top:calc(env(safe-area-inset-top,0px) + 92px);z-index:70;display:none;gap:4px;background:#1d4a5ee6;padding:5px;border-radius:14px;box-shadow:0 2px 8px #0007;max-width:98vw;flex-wrap:wrap;justify-content:center}#arrbar button,#seltb button{font:700 13px inherit;font-family:inherit;border:2px solid #fff;border-radius:11px;background:#3d8b5a;color:#fff;padding:6px 8px;min-width:40px;min-height:38px;cursor:pointer;touch-action:manipulation}#arrbar button.on{background:#e2a23b}#arrbar #arrdone{background:#e2a23b}#seltb{position:fixed;z-index:71;display:none;gap:4px;background:#000b;padding:5px;border-radius:14px;flex-wrap:wrap;justify-content:center;max-width:360px}#seltb button{font-size:14px}#seltb #tbdel{background:#c0392b}#arrhint{position:fixed;left:0;right:0;margin:0 auto;width:max-content;z-index:69;display:none;background:#000a;color:#fff;font:700 12px inherit;font-family:inherit;padding:5px 10px;border-radius:10px;max-width:92vw;text-align:center;pointer-events:none}body.editing #microbox,body.editing #rarepop{display:none!important}body.editing canvas{-webkit-touch-callout:none}#arrbox{position:fixed;z-index:69;border:2px dashed #ffe14d;background:#ffe14d22;pointer-events:none;display:none}';document.head.appendChild(css);
const bar=document.createElement('div');bar.id='arrbar';document.body.appendChild(bar);const tb=document.createElement('div');tb.id='seltb';document.body.appendChild(tb);const bx=document.createElement('div');bx.id='arrbox';document.body.appendChild(bx);const hint=document.createElement('div');hint.id='arrhint';document.body.appendChild(hint);
const btn=(p,lab,fn,id)=>{const b=document.createElement('button');b.textContent=lab;if(id)b.id=id;b.onclick=e=>{e.stopPropagation();try{fn()}catch(er){console.warn(er)}renderTB()};p.appendChild(b);return b};
const zoomBy=f=>{const c=window.editCam;if(c){c.zoom=Math.max(.6,Math.min(3.2,c.zoom*f))}};
const extra=[];A.addBarBtn=(fn)=>extra.push(fn);
const drawBar=()=>{bar.innerHTML='';btn(bar,'↶ '+t('Undo'),undo,'arrundo');const bb=btn(bar,'⬚ '+t('Box'),()=>{A.box=!A.box;toast(A.box?t('Box select: drag over items to select a group.'):t('Box select off.'));drawBar()},'arrbox_b');if(A.box)bb.className='on';
 btn(bar,'➕ '+t('Place'),()=>ui('decor'),'arrplace');extra.forEach(f=>{try{f(bar,btn)}catch(e){}});btn(bar,'＋',()=>zoomBy(1.25),'arrzin');btn(bar,'−',()=>zoomBy(.8),'arrzout');btn(bar,'☰',()=>ui('edithome'),'arrmenu');btn(bar,'🗑 '+t('Clear'),()=>{if(!D().length)return;if(!confirm(t('Put ALL placed items back into your inventory?')))return;pushU();while(D().length){const d=D().pop();addItem(d.item)}A.sel=A.sel.filter(isF);commit();toast(t('Everything is back in your inventory.'))},'arrclear');btn(bar,'✔ '+t('Done'),()=>setOn(false),'arrdone');
 setTimeout(()=>{hint.style.top=(bar.getBoundingClientRect().bottom+6)+'px'},0)};
const selAct=(fn,fixOk)=>{if(!A.sel.length)return;pushU();A.sel.forEach(k=>{const d=get(k);if(d&&(fixOk||!isF(k)))fn(d,isF(k))});commit()};
const BC=()=>window.BCOL||['#c8a26a','#9aa3ad','#e07a5f','#81b29a','#f2cc8f','#6d6875','#f4f1de','#3d405b'];
A.styleFns=[];// (obj)=>bool handlers for 🎨 on fixtures (houses)
function renderTB(){tb.innerHTML='';if(!A.on||!A.sel.length||A.g&&A.g.drag){tb.style.display='none';return}const one=A.sel.length===1?get(A.sel[0]):null;const anyD=A.sel.some(k=>!isF(k)),onlyF=!anyD;const house=A.sel.some(k=>isF(k)&&get(k)&&get(k).type==='house');
 btn(tb,'✥ '+t('Move'),()=>{A.move=true;toast(t('Tap a tile to move it there, or drag it.'))},'tbmove');
 if(anyD||house)btn(tb,'↻ '+t('Rotate'),()=>selAct((d,f)=>{if(!f||d.type==='house')d.rot=((d.rot|0)+1)%4},true),'tbrot');
 if(A.sel.some(k=>!isF(k)&&D()[k]&&D()[k].item.includes('fence')))btn(tb,(one&&(one.rot|0)%2)?'↕':'↔',()=>selAct(d=>{if(d.item.includes('fence'))d.rot=((d.rot|0)%2)?0:1}),'tborient');
 if(anyD){btn(tb,'▲',()=>selAct(d=>d.h=Math.min(6,(d.h|0)+1)),'tbup');btn(tb,'▼',()=>selAct(d=>d.h=Math.max(0,(d.h|0)-1)),'tbdown')}
 if(anyD||house)btn(tb,'🎨',()=>selAct((d,f)=>{if(f){A.styleFns.forEach(fn=>{try{fn(d)}catch(e){}})}else if(d.item==='d_block'){const c=BC();d.col=c[(c.indexOf(d.col)+1)%c.length]}else d.v=((d.v|0)+1)%8},true),'tbcol');
 if(one&&!isF(A.sel[0])&&S.player.inv[one.item]>0)btn(tb,'⧉ '+t('Copy'),()=>{const s=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];for(const[a,b]of s){const i=one.i+a,j=one.j+b;if(tileOk(i,j)&&!at(i,j).length){pushU();S.player.inv[one.item]--;if(!S.player.inv[one.item])delete S.player.inv[one.item];D().push({...one,i,j,h:0});A.sel=[D().length-1];commit();return}}toast(t('No free tile next to it.'))},'tbdup');
 if(anyD||house)btn(tb,'📦 '+t('Store'),()=>{pushU();A.sel.filter(isF).forEach(r=>{const o=get(r);if(o&&o.type==='house'&&window.FShouse)FShouse.store(o)});[...A.sel.filter(k=>!isF(k))].sort((a,b)=>b-a).forEach(k=>{const d=D().splice(k,1)[0];if(d)addItem(d.item)});A.sel=[];commit();toast(t('Stored in your inventory.'))},'tbstore');
 if(anyD)btn(tb,'🗑',()=>{if(!confirm(t('Delete this item for good? (📦 Store keeps it in your inventory.)')))return;pushU();[...A.sel.filter(k=>!isF(k))].sort((a,b)=>b-a).forEach(k=>D().splice(k,1));A.sel=A.sel.filter(isF);commit();toast(t('Deleted.'))},'tbdel');
 btn(tb,'✔',()=>{A.sel=[];A.move=false},'tbok');
 tb.style.display='flex';posTB()}
function posTB(){try{if(tb.style.display==='none'||!A.sel.length)return;const d=get(A.sel[0]);if(!d)return;const r=cv.getBoundingClientRect();const p=projTile(d.i,d.j,(d.h|0)*.3+.9);const w=tb.offsetWidth,h=tb.offsetHeight;let x=r.left+p[0]-w/2,y=r.top+p[1]-h-34;x=Math.max(4,Math.min(innerWidth-w-4,x));const ab=hint.getBoundingClientRect().bottom+6;if(y<ab)y=r.top+p[1]+44;y=Math.max(ab,Math.min(innerHeight-h-250,y));tb.style.left=x+'px';tb.style.top=y+'px'}catch(e){}}
function setOn(v){const was=A.on;A.on=v;A.sel=[];A.move=false;A.box=false;A.g=null;A.ptr.clear();rt.ghosts=null;rt.sel=null;bar.style.display=v?'flex':'none';hint.style.display=v?'block':'none';document.body.classList.toggle('editing',v);window.editCam=v?{x:0,z:0,zoom:1}:null;
 if(v){drawBar();hint.textContent=t('Tap an item to select it · drag an item to move it · drag the ground to look around · pinch or ＋/− to zoom');
  // start zoomed so a tile is about finger-sized
  setTimeout(()=>{try{if(!A.on)return;const px=tilePx();window.editCam.zoom=Math.max(1,Math.min(2.6,34/px));const f=rt.pos,c=(Z0().tiles.length-1)/2;if(f){window.editCam.x=Math.max(-8,Math.min(8,(f.i-c)*.5));window.editCam.z=Math.max(-8,Math.min(8,(f.j-c)*.5))}}catch(e){}},350);
  setTimeout(()=>{if(A.on)hint.style.display='none'},9000)}
 else if(was){commit();toast(t('Home saved ✔'))}renderTB()}
A.setOn=setOn;A.pick=pick;A.plan=plan;A.get=get;A.commit=commit;A.pushU=pushU;A.render=renderTB;
setInterval(()=>{try{if(A.on&&S.zone!=='home')setOn(false);A.sel=A.sel.filter(k=>get(k));rt.sel=A.on?A.sel.map(get).filter(Boolean).map(d=>({i:d.i,j:d.j,h:d.h|0,fp:d.type?fp(d):null})):null;if(A.on)posTB()}catch(e){}},120);
// EDIT button at home toggles edit mode (menu still reachable from ☰)
const ed=document.getElementById('edit');if(ed)ed.addEventListener('click',e=>{try{if(S.zone==='home'&&!rt.decor&&rt.paint==null){e.stopImmediatePropagation();e.preventDefault();M.classList.add('hidden');setOn(!A.on)}}catch(er){}},true);
// ---------- gestures ----------
const mine=e=>A.on&&!rt.decor&&rt.paint==null&&(e.target===cv||(stage&&stage.contains(e.target)&&e.target.tagName==='CANVAS'));
const W=(px,py)=>screenToWorld(px,py);
const startDrag=g=>{if(!A.sel.includes(g.hit))A.sel=[g.hit];g.drag=true;const o=get(g.hit);g.ti=o.i;g.tj=o.j;const[ti,tj]=screenToTile(g.x,g.y);g.oi=ti-o.i;g.oj=tj-o.j;try{navigator.vibrate&&navigator.vibrate(15)}catch(_){}ghosts(plan(0,0));renderTB()};
const dragTo=(g,px,py)=>{const[i,j]=screenToTile(px,py);const o=get(g.hit);if(!o)return null;const di=i-g.oi-o.i,dj=j-g.oj-o.j;let p=plan(di,dj);if(p.some(x=>x.bad)&&A.sel.length===1)for(const[a,b]of[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const q=plan(di+a,dj+b);if(!q.some(x=>x.bad)){p=q;break}}return p};
addEventListener('pointerdown',e=>{if(!mine(e))return;e.stopImmediatePropagation();e.preventDefault();try{cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)}catch(_){}
 const[px,py]=rel(e);A.ptr.set(e.pointerId,{x:px,y:py});clearTimeout(A.lp);
 if(A.ptr.size===2){const[a,b]=[...A.ptr.values()];A.g={pinch:1,d0:Math.hypot(a.x-b.x,a.y-b.y)||1,z0:window.editCam.zoom,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};rt.ghosts=null;renderTB();return}
 if(A.ptr.size>2)return;const hit=pick(px,py);A.g={x:px,y:py,lx:px,ly:py,t:Date.now(),hit,moved:false,drag:false,pan:false,boxs:A.box};
 if(hit!=null&&!A.box)A.lp=setTimeout(()=>{if(A.g&&!A.g.moved&&!A.g.pinch&&!A.g.drag)startDrag(A.g)},380)},true);
addEventListener('pointermove',e=>{if(!A.on||!A.ptr.has(e.pointerId))return;e.stopImmediatePropagation();e.preventDefault();const[px,py]=rel(e);A.ptr.set(e.pointerId,{x:px,y:py});const g=A.g;if(!g)return;
 try{if(g.pinch){if(A.ptr.size<2)return;const[a,b]=[...A.ptr.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);window.editCam.zoom=Math.max(.6,Math.min(3.2,g.z0*d/g.d0));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const w0=W(g.mx,g.my),w1=W(mx,my);if(w0&&w1){window.editCam.x+=w0[0]-w1[0];window.editCam.z+=w0[1]-w1[1]}g.mx=mx;g.my=my;clampCam();return}
 if(!g.moved&&Math.hypot(px-g.x,py-g.y)>8){g.moved=true;clearTimeout(A.lp);if(g.boxs){g.box=true}else if(g.hit!=null){if(!g.drag)startDrag(g)}else g.pan=true}
 if(g.drag){g.p=dragTo(g,px,py);if(g.p)ghosts(g.p);// edge auto-pan while dragging
  const r=cv.getBoundingClientRect(),m=44;let ex=0,ey=0;if(px<m)ex=-1;if(px>r.width-m)ex=1;if(py<m+120)ey=-1;if(py>r.height-m)ey=1;if(ex||ey){const w0=W(r.width/2,r.height/2),w1=W(r.width/2+ex*12,r.height/2+ey*12);if(w0&&w1){window.editCam.x+=w1[0]-w0[0];window.editCam.z+=w1[1]-w0[1];clampCam()}}}
 else if(g.box){bx.style.display='block';const r=cv.getBoundingClientRect();bx.style.left=r.left+Math.min(px,g.x)+'px';bx.style.top=r.top+Math.min(py,g.y)+'px';bx.style.width=Math.abs(px-g.x)+'px';bx.style.height=Math.abs(py-g.y)+'px'}
 else if(g.pan){const w0=W(g.lx,g.ly),w1=W(px,py);if(w0&&w1){window.editCam.x+=w0[0]-w1[0];window.editCam.z+=w0[1]-w1[1];clampCam()}}g.lx=px;g.ly=py}catch(er){console.warn(er)}},true);
function clampCam(){const c=window.editCam,m=8;c.x=Math.max(-m,Math.min(m,c.x));c.z=Math.max(-m,Math.min(m,c.z))}
const up=e=>{if(!A.ptr.has(e.pointerId))return;e.stopImmediatePropagation();A.ptr.delete(e.pointerId);clearTimeout(A.lp);const g=A.g;if(!g)return;if(g.pinch){if(!A.ptr.size)A.g=null;renderTB();return}
 const cancel=e.type==='pointercancel';
 try{const px=g.lx,py=g.ly;
 if(g.drag){const p=cancel?(g.p||null):dragTo(g,px,py);if(p&&(g.moved||cancel))applyPlan(p)}
 else if(cancel){}
 else if(g.box){bx.style.display='none';const r=cv.getBoundingClientRect(),x0=Math.min(g.x,px),x1=Math.max(g.x,px),y0=Math.min(g.y,py),y1=Math.max(g.y,py);
  A.sel=D().map((d,k)=>[d,k]).filter(([d])=>{const p=projTile(d.i,d.j,(d.h|0)*.3);return p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1}).map(x=>x[1]);toast(A.sel.length+' '+t('selected'))}
 else if(!g.moved&&!g.pan){// tap
  if(A.move&&A.sel.length){const[i,j]=screenToTile(px,py);const d=get(A.sel[0]);if(applyPlan(plan(i-d.i,j-d.j)))A.move=false}
  else if(g.hit!=null){if(A.box){const x=A.sel.indexOf(g.hit);if(x<0)A.sel.push(g.hit);else A.sel.splice(x,1)}else A.sel=A.sel.length===1&&A.sel[0]===g.hit?[]:[g.hit];try{Sound.sfx('click')}catch(_){}}
  else A.sel=[]}
 }catch(er){console.warn(er)}rt.ghosts=null;A.g=null;renderTB()};
addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
// iOS: block the native long-press callout / magnifier / scroll on the canvas so the browser never steals (pointercancels) the gesture
['click','touchstart','touchmove','touchend','wheel','contextmenu','gesturestart'].forEach(ev=>addEventListener(ev,e=>{if(mine(e)||(A.on&&ev==='gesturestart')){e.stopImmediatePropagation();try{e.cancelable!==false&&e.preventDefault()}catch(_){}if(ev==='wheel'){zoomBy(e.deltaY<0?1.1:.9)}}},{capture:true,passive:false}));
})();

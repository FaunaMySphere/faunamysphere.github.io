// v5: direct-manipulation Edit Mode at home (select, drag with snapping ghost, long-press pick-up, pinch/pan camera lock, toolbar, undo x10, clear all, box multi-select)
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;const A={on:false,sel:[],undo:[],box:false,move:false,ptr:new Map(),g:null};window.FSarr=A;
const cv=document.getElementById('cv'),stage=document.getElementById('stage');
const D=()=>S.home.decor,Z0=()=>zs('home');
const rel=e=>{const r=cv.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]};
const tileOk=(i,j)=>{const s=Z0();return !!(s.tiles[i]&&s.tiles[i][j])&&!s.objs.some(o=>o.type!=='decor'&&o.i===i&&o.j===j)};
const at=(i,j)=>D().map((d,k)=>[d,k]).filter(([d])=>d.i===i&&d.j===j).sort((a,b)=>(b[0].h|0)-(a[0].h|0)).map(x=>x[1]);
const pick=(px,py)=>{const[i,j]=screenToTile(px,py);let l=at(i,j);if(l.length)return l[0];// small tolerance for tall items
 for(const[a,b]of[[0,-1],[-1,0],[-1,-1]]){l=at(i+a,j+b);if(l.length)return l[0]}return null};
const snap=()=>JSON.stringify({d:D(),inv:S.player.inv});
const pushU=()=>{A.undo.push(snap());if(A.undo.length>10)A.undo.shift()};
const commit=()=>{try{syncHomeDecor();save()}catch(e){console.warn(e)}};
const undo=()=>{const u=A.undo.pop();if(!u){toast(t('Nothing to undo.'));return}try{const o=JSON.parse(u);S.home.decor.length=0;o.d.forEach(x=>S.home.decor.push(x));S.player.inv=o.inv;A.sel=[];commit();toast(t('Undone.'))}catch(e){console.warn(e)}};
// compute target placement for moving selection by (di,dj)
const plan=(di,dj)=>{const mv=new Set(A.sel),out=[];const per={};
 for(const k of [...A.sel].sort((a,b)=>(D()[a].h|0)-(D()[b].h|0))){const d=D()[k];if(!d)continue;const i=d.i+di,j=d.j+dj,key=i+','+j;
  let bad=!tileOk(i,j);const others=at(i,j).filter(x=>!mv.has(x)).map(x=>D()[x]);if(others.some(o=>o.item!=='d_block'))bad=true;
  const base=others.length;per[key]=per[key]||0;const h=base+per[key];if(h>6)bad=true;per[key]++;
  out.push({k,item:d.item,i,j,rot:d.rot|0,h,col:d.col,v:d.v,bad})}return out};
const ghosts=p=>{rt.ghosts=p.map(({item,i,j,rot,h,col,v,bad})=>({item,i,j,rot,h,col,v,bad}))};
const applyPlan=p=>{if(!p.length)return false;if(p.some(x=>x.bad)){toast(t("Can't place there."));return false}pushU();p.forEach(x=>{const d=D()[x.k];d.i=x.i;d.j=x.j;d.h=x.h});commit();try{Sound.sfx('pop')}catch(e){}return true};
// ---------- UI ----------
const css=document.createElement('style');css.textContent='#arrbar{position:fixed;left:50%;transform:translateX(-50%);top:96px;z-index:70;display:none;gap:4px;background:#1d4a5ecc;padding:5px;border-radius:14px;box-shadow:0 2px 8px #0007;max-width:98vw;flex-wrap:nowrap;white-space:nowrap;justify-content:center}#arrbar button,#seltb button{font:700 11px inherit;font-family:inherit;border:2px solid #fff;border-radius:10px;background:#3d8b5a;color:#fff;padding:4px 5px;min-width:30px;cursor:pointer}#arrbar button.on{background:#e2a23b}#seltb{position:fixed;z-index:71;display:none;gap:3px;background:#000a;padding:4px;border-radius:12px;flex-wrap:wrap;justify-content:center;max-width:300px}#seltb button{font-size:13px;padding:4px 6px}body.editing #microbox,body.editing #rarepop{display:none!important}#arrbox{position:fixed;z-index:69;border:2px dashed #ffe14d;background:#ffe14d22;pointer-events:none;display:none}';document.head.appendChild(css);
const bar=document.createElement('div');bar.id='arrbar';document.body.appendChild(bar);const tb=document.createElement('div');tb.id='seltb';document.body.appendChild(tb);const bx=document.createElement('div');bx.id='arrbox';document.body.appendChild(bx);
const btn=(p,lab,fn,id)=>{const b=document.createElement('button');b.textContent=lab;if(id)b.id=id;b.onclick=e=>{e.stopPropagation();try{fn()}catch(er){console.warn(er)}renderTB()};p.appendChild(b);return b};
const drawBar=()=>{bar.innerHTML='';btn(bar,'↶ '+t('Undo'),undo,'arrundo');const bb=btn(bar,'⬚ '+t('Box'),()=>{A.box=!A.box;toast(A.box?t('Box select: drag over items to select a group.'):t('Box select off.'));drawBar()},'arrbox_b');if(A.box)bb.className='on';
 btn(bar,'➕ '+t('Place'),()=>ui('decor'),'arrplace');btn(bar,'☰',()=>ui('edithome'),'arrmenu');btn(bar,'🗑 '+t('Clear'),()=>{if(!D().length)return;if(!confirm(t('Put ALL placed items back into your inventory?')))return;pushU();while(D().length){const d=D().pop();addItem(d.item)}A.sel=[];commit();toast(t('Everything is back in your inventory.'))},'arrclear');btn(bar,'✔ '+t('Done'),()=>setOn(false),'arrdone')};
const selAct=fn=>{if(!A.sel.length)return;pushU();A.sel.forEach(k=>{const d=D()[k];if(d)fn(d)});commit()};
const BC=()=>window.BCOL||['#c8a26a','#9aa3ad','#e07a5f','#81b29a','#f2cc8f','#6d6875','#f4f1de','#3d405b'];
function renderTB(){tb.innerHTML='';if(!A.on||!A.sel.length||A.g&&A.g.drag){tb.style.display='none';return}const one=A.sel.length===1?D()[A.sel[0]]:null;
 btn(tb,'✥ '+t('Move'),()=>{A.move=true;toast(t('Tap a tile to move it there, or drag it.'))},'tbmove');btn(tb,'↻',()=>selAct(d=>d.rot=((d.rot|0)+1)%4),'tbrot');
 if(A.sel.some(k=>D()[k]&&D()[k].item.includes('fence')))btn(tb,(one&&(one.rot|0)%2)?'↕':'↔',()=>selAct(d=>{if(d.item.includes('fence'))d.rot=((d.rot|0)%2)?0:1}),'tborient');
 btn(tb,'▲',()=>selAct(d=>d.h=Math.min(6,(d.h|0)+1)),'tbup');btn(tb,'▼',()=>selAct(d=>d.h=Math.max(0,(d.h|0)-1)),'tbdown');
 btn(tb,'🎨',()=>selAct(d=>{if(d.item==='d_block'){const c=BC();d.col=c[(c.indexOf(d.col)+1)%c.length]}else d.v=((d.v|0)+1)%8}),'tbcol');
 if(one&&S.player.inv[one.item]>0)btn(tb,'⧉ '+t('Copy'),()=>{const s=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];for(const[a,b]of s){const i=one.i+a,j=one.j+b;if(tileOk(i,j)&&!at(i,j).length){pushU();S.player.inv[one.item]--;if(!S.player.inv[one.item])delete S.player.inv[one.item];D().push({...one,i,j,h:0});A.sel=[D().length-1];commit();return}}toast(t('No free tile next to it.'))},'tbdup');
 btn(tb,'📦 '+t('Store'),()=>{pushU();[...A.sel].sort((a,b)=>b-a).forEach(k=>{const d=D().splice(k,1)[0];if(d)addItem(d.item)});A.sel=[];commit()},'tbstore');btn(tb,'✔',()=>{A.sel=[];A.move=false},'tbok');
 tb.style.display='flex';posTB()}
function posTB(){try{if(tb.style.display==='none'||!A.sel.length)return;const d=D()[A.sel[0]];if(!d)return;const r=cv.getBoundingClientRect();const p=projTile(d.i,d.j,(d.h|0)*.3+.9);const w=tb.offsetWidth,h=tb.offsetHeight;let x=r.left+p[0]-w/2,y=r.top+p[1]-h-8;x=Math.max(4,Math.min(innerWidth-w-4,x));const ab=bar.getBoundingClientRect().bottom+6;if(y<ab)y=r.top+p[1]+40;y=Math.max(ab,Math.min(innerHeight-h-230,y));tb.style.left=x+'px';tb.style.top=y+'px'}catch(e){}}
function setOn(v){A.on=v;A.sel=[];A.move=false;A.box=false;A.g=null;rt.ghosts=null;rt.sel=null;bar.style.display=v?'flex':'none';document.body.classList.toggle('editing',v);window.editCam=v?{x:0,z:0,zoom:1}:null;if(v){drawBar();toast(t('Edit mode: tap an item to select, drag to move, long-press to pick up. Pinch to zoom.'))}renderTB()}
A.setOn=setOn;
setInterval(()=>{try{if(A.on&&S.zone!=='home')setOn(false);rt.sel=A.on?A.sel.map(k=>D()[k]).filter(Boolean).map(d=>({i:d.i,j:d.j,h:d.h|0})):null;if(A.on){A.sel=A.sel.filter(k=>D()[k]);posTB()}}catch(e){}},120);
// EDIT button at home toggles edit mode (menu still reachable from ☰)
const ed=document.getElementById('edit');if(ed)ed.addEventListener('click',e=>{try{if(S.zone==='home'&&!rt.decor&&rt.paint==null){e.stopImmediatePropagation();e.preventDefault();M.classList.add('hidden');setOn(!A.on)}}catch(er){}},true);
// ---------- gestures ----------
const mine=e=>A.on&&!rt.decor&&rt.paint==null&&(e.target===cv||(stage&&stage.contains(e.target)&&e.target.tagName==='CANVAS'));
const W=(px,py)=>screenToWorld(px,py);
addEventListener('pointerdown',e=>{if(!mine(e))return;e.stopImmediatePropagation();e.preventDefault();try{cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)}catch(_){}
 const[px,py]=rel(e);A.ptr.set(e.pointerId,{x:px,y:py});clearTimeout(A.lp);
 if(A.ptr.size===2){const[a,b]=[...A.ptr.values()];A.g={pinch:1,d0:Math.hypot(a.x-b.x,a.y-b.y)||1,z0:window.editCam.zoom,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};rt.ghosts=null;return}
 if(A.ptr.size>2)return;const hit=pick(px,py);const[ti,tj]=screenToTile(px,py);A.g={x:px,y:py,lx:px,ly:py,t:Date.now(),hit,ti,tj,moved:false,drag:false,pan:false,boxs:A.box&&hit==null||A.box};
 if(hit!=null&&!A.box)A.lp=setTimeout(()=>{if(A.g&&!A.g.moved&&!A.g.pinch){if(!A.sel.includes(hit))A.sel=[hit];A.g.drag=true;try{navigator.vibrate&&navigator.vibrate(25)}catch(_){}ghosts(plan(0,0));renderTB()}},450)},true);
addEventListener('pointermove',e=>{if(!A.on||!A.ptr.has(e.pointerId))return;e.stopImmediatePropagation();e.preventDefault();const[px,py]=rel(e);A.ptr.set(e.pointerId,{x:px,y:py});const g=A.g;if(!g)return;
 try{if(g.pinch){if(A.ptr.size<2)return;const[a,b]=[...A.ptr.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);window.editCam.zoom=Math.max(.6,Math.min(3,g.z0*d/g.d0));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;const w0=W(g.mx,g.my),w1=W(mx,my);if(w0&&w1){window.editCam.x+=w0[0]-w1[0];window.editCam.z+=w0[1]-w1[1]}g.mx=mx;g.my=my;clampCam();return}
 if(!g.moved&&Math.hypot(px-g.x,py-g.y)>9){g.moved=true;clearTimeout(A.lp);if(g.boxs){g.box=true}else if(g.hit!=null&&A.sel.includes(g.hit)){g.drag=true;renderTB()}else g.pan=true}
 if(g.drag){const[i,j]=screenToTile(px,py);ghosts(plan(i-g.ti,j-g.tj))}
 else if(g.box){bx.style.display='block';const r=cv.getBoundingClientRect();bx.style.left=r.left+Math.min(px,g.x)+'px';bx.style.top=r.top+Math.min(py,g.y)+'px';bx.style.width=Math.abs(px-g.x)+'px';bx.style.height=Math.abs(py-g.y)+'px'}
 else if(g.pan){const w0=W(g.lx,g.ly),w1=W(px,py);if(w0&&w1){window.editCam.x+=w0[0]-w1[0];window.editCam.z+=w0[1]-w1[1];clampCam()}}g.lx=px;g.ly=py}catch(er){console.warn(er)}},true);
function clampCam(){const c=window.editCam,m=8;c.x=Math.max(-m,Math.min(m,c.x));c.z=Math.max(-m,Math.min(m,c.z))}
const up=e=>{if(!A.ptr.has(e.pointerId))return;e.stopImmediatePropagation();A.ptr.delete(e.pointerId);clearTimeout(A.lp);const g=A.g;if(!g)return;if(g.pinch){if(!A.ptr.size)A.g=null;return}
 try{const px=g.lx,py=g.ly;
 if(g.drag){const[i,j]=screenToTile(px,py);applyPlan(plan(i-g.ti,j-g.tj))}
 else if(g.box){bx.style.display='none';const[a,b]=[screenToTile(g.x,g.y),screenToTile(px,py)];const i0=Math.min(a[0],b[0]),i1=Math.max(a[0],b[0]),j0=Math.min(a[1],b[1]),j1=Math.max(a[1],b[1]);
  const r=cv.getBoundingClientRect(),x0=Math.min(g.x,px),x1=Math.max(g.x,px),y0=Math.min(g.y,py),y1=Math.max(g.y,py);A.sel=D().map((d,k)=>[d,k]).filter(([d])=>{const p=projTile(d.i,d.j,(d.h|0)*.3);return p[0]>=x0&&p[0]<=x1&&p[1]>=y0&&p[1]<=y1}).map(x=>x[1]);toast(A.sel.length+' '+t('selected'))}
 else if(!g.moved&&!g.pan){// tap
  if(A.move&&A.sel.length){const[i,j]=screenToTile(px,py);const d=D()[A.sel[0]];if(applyPlan(plan(i-d.i,j-d.j)))A.move=false}
  else if(g.hit!=null){if(A.box){const x=A.sel.indexOf(g.hit);if(x<0)A.sel.push(g.hit);else A.sel.splice(x,1)}else A.sel=A.sel.length===1&&A.sel[0]===g.hit?[]:[g.hit];try{Sound.sfx('click')}catch(_){}}
  else A.sel=[]}
 }catch(er){console.warn(er)}rt.ghosts=null;A.g=null;renderTB()};
addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true);
['click','touchstart','touchmove','wheel'].forEach(ev=>addEventListener(ev,e=>{if(mine(e)){e.stopImmediatePropagation();if(ev!=='touchstart'&&ev!=='click'||ev==='click')try{e.preventDefault()}catch(_){}if(ev==='wheel'){window.editCam.zoom=Math.max(.6,Math.min(3,window.editCam.zoom*(e.deltaY<0?1.1:.9)))}}},{capture:true,passive:false}));
})();

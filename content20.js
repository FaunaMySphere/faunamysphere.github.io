// v4.24: fence orientation (↔ horizontal / ↕ vertical), ghost preview before placing, saved per fence (rot 0/1; old saves = horizontal)
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;rt.fenceRot=rt.fenceRot|0;
const isF=k=>!!k&&String(k).includes('fence');
const b=document.createElement('button');b.id='fencerot';b.className='btn';b.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:190px;z-index:60;font-size:20px;padding:8px 18px;display:none';document.body.appendChild(b);
const lab=()=>{b.textContent=(rt.fenceRot%2?'↕ '+t('Vertical'):'↔ '+t('Horizontal'))};
b.onclick=e=>{e.stopPropagation();rt.fenceRot=(rt.fenceRot+1)%2;if(rt.ghost)rt.ghost={...rt.ghost,rot:rt.fenceRot};lab()};
setInterval(()=>{const on=typeof S!=='undefined'&&S.zone==='home'&&isF(rt.decor);b.style.display=on?'block':'none';if(on)lab();else if(rt.ghost&&!isF(rt.decor))rt.ghost=null},300);
const ok=document.createElement('button');ok.id='fenceok';ok.className='btn';ok.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:245px;z-index:60;font-size:18px;padding:8px 18px;display:none;background:#4caf50;color:#fff';document.body.appendChild(ok);
setInterval(()=>{ok.style.display=rt.ghost&&S.zone==='home'?'block':'none';ok.textContent='✔ '+t('Place here')},300);
const placeG=()=>{const g=rt.ghost;if(!g)return;const item=g.item,i=g.i,j=g.j;rt.ghost=null;dispatch('place',{item,i,j});const d=S.home.decor[S.home.decor.length-1];if(d&&d.item===item&&d.i===i&&d.j===j){d.rot=g.rot%2;syncHomeDecor();save()}try{Sound.sfx('pop')}catch(e){}if(!S.player.inv[item]){rt.decor=null;toast(t('Placed! Done decorating.'))}else toast(t('Placed!'))};window.FSplaceGhost=placeG;
ok.onclick=e=>{e.stopPropagation();placeG()};
const tap1=tap;tap=window.tap=function(px,py){try{if(isF(rt.decor)&&S.zone==='home'&&rt.paint==null){const o=hitObj(px,py);if(!(o&&o.type==='decor')){let[i,j]=screenToTile(px,py);if(rt.ghost&&Math.abs(rt.ghost.i-i)<=1&&Math.abs(rt.ghost.j-j)<=1){i=rt.ghost.i;j=rt.ghost.j}const s=zs('home');const ok=s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(x=>x.i===i&&x.j===j);
 if(!ok){toast(t('Tap an empty tile on your island.'));return}
 if(rt.ghost&&rt.ghost.i===i&&rt.ghost.j===j){placeG();return}
 rt.ghost={item:rt.decor,i,j,rot:rt.fenceRot%2};toast(t('Preview: tap ✔ Place here (or the same tile) to place. Use ↔/↕ to turn it.'));return}}}catch(e){console.warn(e)}return tap1(px,py)};
window.FSfence=k=>{try{const d=S.home.decor[k];if(d){d.rot=((d.rot|0)+1)%2;syncHomeDecor();save();ui('edithome')}}catch(e){}};
const u0=window.ui;window.ui=ui=function(v,p={}){const r=u0(v,p);try{if(v==='edithome'&&MB)MB.querySelectorAll('button[onclick^="FSdec(\'decStore\'"]').forEach(btn=>{const k=+btn.getAttribute('onclick').match(/,(\d+)\)/)[1];const d=S.home.decor[k];if(d&&isF(d.item))btn.insertAdjacentHTML('beforebegin','<button class="btn" onclick="FSfence('+k+')">'+((d.rot|0)%2?'↕':'↔')+'</button>')})}catch(e){}return r};
})();

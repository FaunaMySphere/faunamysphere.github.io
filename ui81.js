// v8.1 UI pass (phones first): full screen + safe areas, panels that always close (44px X inside the safe area, backdrop tap,
// Escape, Android/browser Back), and a tidy top HUD with no overlapping pills. ?ui81off disables the panel/HUD part, ?fs81off the tap-to-fullscreen.
(function(){
const Q=location.search,OFF=/[?&]ui81off\b/.test(Q);
const css=document.createElement('style');css.textContent=`
#top{padding-right:max(10px,env(safe-area-inset-right))}
#hudbar{padding-left:max(10px,env(safe-area-inset-left));padding-right:max(10px,env(safe-area-inset-right))}
#ver81{left:max(8px,env(safe-area-inset-left))}
#hi{padding-left:env(safe-area-inset-left)}
html,body{overscroll-behavior:none}`+(OFF?'':`
#modal{z-index:950!important}
#toast{z-index:960}
#modal .sheet{display:flex!important;flex-direction:column;overflow:hidden!important;max-height:calc(100% - max(64px,env(safe-area-inset-top) + 52px))!important;padding-top:12px!important}
#modal #mb{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;min-height:0;flex:1 1 auto;overscroll-behavior:contain;padding-right:2px}
#modal #x{position:absolute!important;top:6px!important;right:6px!important;width:44px!important;height:44px!important;font-size:18px!important;z-index:5;display:flex;align-items:center;justify-content:center;padding:0;touch-action:manipulation}
#modal #mb>h2:first-child,#modal #mb>h3:first-child{padding-right:50px;min-height:30px;margin-top:4px}
#buildm{z-index:950!important}
#buildm [data-x]{min-width:44px;min-height:44px;font-size:17px!important;margin-left:8px!important;touch-action:manipulation}
#buildm>div{max-height:calc(100% - max(64px,env(safe-area-inset-top) + 52px))!important;padding-bottom:calc(18px + env(safe-area-inset-bottom))!important}
@media(max-width:699px){
 #top{gap:6px!important}
 #top #gfx,#top #mute{width:40px!important;height:40px!important;min-width:40px;flex-shrink:0}
 #top #hi{max-width:96px;font-size:11.5px;line-height:1.3;flex-shrink:1;overflow:hidden}
 #savepill{min-width:0!important;flex-shrink:0}
 #microbox{right:max(8px,env(safe-area-inset-right))!important}
 #microbox{top:var(--hud81row,86px)!important}
 #bathebtn{bottom:var(--hud81bot,205px)!important}
 #mpcount{top:var(--hud81row,50px)!important;left:max(10px,env(safe-area-inset-left))!important;transform:none!important;max-width:44vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:18px}
}`);
document.head.appendChild(css);

// ---------- full screen on first tap (phone browser tabs only; the Home Screen app is already full screen) ----------
(function(){
 if(/[?&]fs81off\b/.test(Q))return;
 const standalone=matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 const phone=matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<900;
 const el=document.documentElement,req=el.requestFullscreen||el.webkitRequestFullscreen;
 if(standalone||!phone||!req)return;
 let tried=false;
 function go(){if(tried)return;tried=true;removeEventListener('pointerup',go,true);removeEventListener('touchend',go,true);
  if(document.fullscreenElement||document.webkitFullscreenElement)return;
  try{const p=req.call(el,{navigationUI:'hide'});if(p&&p.catch)p.catch(()=>{})}catch(e){}}
 addEventListener('pointerup',go,true);addEventListener('touchend',go,true);
})();
if(OFF)return;

// ---------- panels: Escape / Back / backdrop ----------
const M=()=>document.getElementById('modal');
const X=()=>document.getElementById('x');
const xShown=()=>{const x=X();return !!x&&x.style.display!=='none'};
const modalOpen=()=>{const m=M();return !!m&&!m.classList.contains('hidden')};
const build=()=>document.getElementById('buildm');
function anyOpen(){return modalOpen()||!!build()}
// close the top-most panel; returns true if something was closed. Never closes the adoption screen (it hides its X).
function closeTop(){
 const b=build();if(b){const bx=b.querySelector('[data-x]');if(bx)bx.click();else b.remove();return true}
 if(modalOpen()){if(!xShown())return false;try{close()}catch(e){M().classList.add('hidden')}return true}
 return false}
window.FS_closePanel=closeTop;
addEventListener('keydown',e=>{if(e.key!=='Escape'&&e.key!=='Esc')return;const t=e.target;if(t&&/INPUT|TEXTAREA/.test(t.tagName)&&t.value&&!anyOpen())return;if(closeTop()){e.preventDefault();e.stopPropagation()}},true);
// backdrop: the modal now sits above the HUD so the strip above a panel is real backdrop; keep the adoption screen modal
addEventListener('click',e=>{const m=M();if(m&&e.target===m&&!xShown()){e.stopPropagation();e.preventDefault()}},true);
// Back button: one history entry while any panel is open; Back closes the panel instead of leaving the game
let pushed=false;
function sync(){
 const o=anyOpen()&&(build()||xShown());
 if(o&&!pushed){const st=history.state;if(!(st&&st.fs81panel)){try{history.pushState(Object.assign({},st||{},{fs81panel:1}),'')}catch(e){}}pushed=true}
 if(!o&&pushed){pushed=false}
}
addEventListener('popstate',()=>{ // our entry was popped
 if(anyOpen()){closeTop();pushed=false;setTimeout(sync,50)}
});
const mo=new MutationObserver(()=>{clearTimeout(sync.t);sync.t=setTimeout(sync,30)});
function hook(){const m=M();if(m)mo.observe(m,{attributes:true,attributeFilter:['class']});mo.observe(document.body,{childList:true})}
if(document.body)hook();else addEventListener('DOMContentLoaded',hook);

// ---------- HUD layout on phones: one tidy row of pills under the top bar, nothing under the notch ----------
function lay(){
 if(innerWidth>=700)return;
 const top=document.getElementById('top');if(!top)return;
 const tb=top.getBoundingClientRect().bottom;
 const mb=document.getElementById('microbox'),mp=document.getElementById('mpcount'),zn=document.getElementById('zoneName'),q=document.getElementById('q81');
 const row=Math.round(tb+6);
 if(lay.r!==row){lay.r=row;document.documentElement.style.setProperty('--hud81row',row+'px')}
 let below=row;
 if(mb&&getComputedStyle(mb).display!=='none')below=Math.max(below,mb.getBoundingClientRect().bottom);
 if(mp){
  const lim=mb&&getComputedStyle(mb).display!=='none'?mb.getBoundingClientRect().left-10-10:innerWidth-20;mp.style.maxWidth=Math.max(80,lim)+'px';
  below=Math.max(below,mp.getBoundingClientRect().bottom)}
 {const hb=document.getElementById('hudbar'),pl=document.getElementById('plv');let ht=hb?hb.getBoundingClientRect().top:innerHeight;if(pl){const r=pl.getBoundingClientRect();if(r.height)ht=Math.min(ht,r.top)}
  const bot=Math.round(innerHeight-ht+10);if(lay.b!==bot){lay.b=bot;document.documentElement.style.setProperty('--hud81bot',bot+'px')}}
 if(zn){const st=document.getElementById('stage');const off=st?st.getBoundingClientRect().top:0;const want=Math.round(Math.max(10,below+6-off));if(zn.style.top!==want+'px')zn.style.top=want+'px'}
 if(q&&getComputedStyle(q).display!=='none'){const r=q.getBoundingClientRect();const z=zn&&getComputedStyle(zn).display!=='none'&&zn.textContent.trim()?zn.getBoundingClientRect().bottom:below;const want=Math.round(Math.max(z,below)+8);if(r.top<want)q.style.top=want+'px'}
}
setInterval(lay,500);addEventListener('resize',()=>setTimeout(lay,60));
})();

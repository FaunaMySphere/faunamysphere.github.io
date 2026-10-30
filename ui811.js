// v8.1.1 — slimmer bottom controls on phones + a minimize toggle (localStorage fs_ui_min, NOT the save). EN/ES. ?ui811off disables.
// v8.1.1 — everyone starts on High graphics. One-time move (localStorage fs_q811, NOT the save): players still on Low/Med go to High once;
// after that their own ⚙ choice is kept. The per-session auto fallback (perf621: fs_autolow in sessionStorage) still drops a weak phone to Low.
(function(){try{if(localStorage.getItem('fs_q811'))return;const g=localStorage.getItem('fs_gfx6'),q=localStorage.getItem('fs_q');
 if(g==='low')localStorage.setItem('fs_gfx6','high');if(q==='low'||q==='med')localStorage.removeItem('fs_q');localStorage.removeItem('fs_gfx6_auto');
 localStorage.setItem('fs_q811',(g==='low'||q==='low'||q==='med')?'moved':'1')}catch(e){}})();
(function(){
if(/[?&]ui811off\b/.test(location.search))return;
const K='fs_ui_min',es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')}catch(e){return false}},L=(en,s)=>es()?s:en;
const css=document.createElement('style');css.textContent=`
#min811{display:none}
@media(max-width:699px){
 #hudbar{padding-top:3px!important;padding-bottom:max(3px,env(safe-area-inset-bottom))!important;row-gap:1px!important;column-gap:6px!important}
 #hudbar #me{gap:6px;align-items:center}
 #hudbar #pf{width:42px!important;height:42px!important;border-width:2px!important}
 #hudbar .mecol{gap:1px!important}
 #hudbar #plv{margin-bottom:0!important}
 #hudbar #who{font-size:12px!important;line-height:14px!important}
 #hudbar .mb>div{height:7px!important}
 #hudbar .mb b{font-size:10px!important;line-height:10px}
 #hudbar #eggw{font-size:8px!important}
 #hudbar #egg{width:36px!important;height:36px!important;font-size:10px!important;margin-bottom:1px!important}
 #hudbar #chat{align-self:center}
 #hudbar #chatf{min-height:44px;height:44px!important;padding-top:0!important;padding-bottom:0!important}
 #hudbar #chatf button{min-height:40px;padding-top:0!important;padding-bottom:0!important}
 #hudbar #cur{margin:0!important;min-height:0}
 #hudbar #cur span{padding:0 8px!important;line-height:18px;font-size:11px!important;border-width:1.5px!important}
 #bar{padding-bottom:0!important;padding-top:1px!important}
 #bar button{min-height:46px;justify-content:center}
 #bar button i{width:34px!important;height:34px!important;font-size:17px!important}
 #bar button span{font-size:10px!important;line-height:11px}
 #top{background:linear-gradient(to bottom,rgba(10,40,5,.42) 0,rgba(10,40,5,.18) calc(env(safe-area-inset-top) + 8px),rgba(10,40,5,0) calc(env(safe-area-inset-top) + 40px))!important;border-bottom:0!important;box-shadow:none!important}
 #top{pointer-events:none}#top>*{pointer-events:auto}
 #top #hi{text-shadow:0 1px 2px #000c,0 0 6px #0008}
 #min811{display:flex;flex:0 0 44px!important;min-width:44px}
 #min811 i{background:radial-gradient(circle at 35% 28%,#ffffff 0 14%,#e4f7c8 50%,#a9d86a 100%)!important;color:#1d5200!important;text-shadow:none!important;font-size:16px!important;font-weight:900}
 html.min811 #hudbar #me,html.min811 #hudbar #chat,html.min811 #hudbar #cur,html.min811 #hudbar #trkb{display:none!important}
 html.min811 #hudbar{padding-top:2px!important}
}`;document.head.appendChild(css);
const get=()=>{try{return localStorage.getItem(K)==='1'}catch(e){return false}};
function paint(){const b=document.getElementById('min811');const m=get();document.documentElement.classList.toggle('min811',m);if(!b)return;
 b.querySelector('i').textContent=m?'▴':'▾';b.querySelector('span').textContent=m?L('More','Más'):L('Less','Menos');
 const t=m?L('Show all controls','Mostrar todos los controles'):L('Minimize controls','Minimizar controles');b.title=t;b.setAttribute('aria-label',t);b.setAttribute('aria-expanded',String(!m))}
function add(){const bar=document.getElementById('bar');if(!bar)return;let b=document.getElementById('min811');
 if(!b){b=document.createElement('button');b.id='min811';b.type='button';b.innerHTML='<i></i><span></span>';
  b.addEventListener('click',e=>{e.stopPropagation();try{localStorage.setItem(K,get()?'0':'1')}catch(_){};paint()})}
 if(bar.lastElementChild!==b)bar.appendChild(b);paint()}
paint();
// full-screen sizing: the 3D view follows every real size change (iOS toolbar/visualViewport, rotation, full screen, the HUD minimize)
let rt=0;const kick=()=>{cancelAnimationFrame(rt);rt=requestAnimationFrame(()=>{try{window.dispatchEvent(new Event('resize'))}catch(e){}})};
try{if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(!kick.busy){kick.busy=1;kick();setTimeout(()=>kick.busy=0,50)}})}catch(e){}
addEventListener('orientationchange',()=>{kick();setTimeout(kick,350)});document.addEventListener('fullscreenchange',()=>{kick();setTimeout(kick,350)});document.addEventListener('webkitfullscreenchange',kick);
(function ro(){const st=document.getElementById('stage');if(!st||!window.ResizeObserver)return setTimeout(ro,500);let last='';new ResizeObserver(es=>{const r=es[0].contentRect,k=Math.round(r.width)+'x'+Math.round(r.height);if(k!==last){last=k;kick()}}).observe(st)})();
// watchdog: if the 3D view ever lags behind the real screen size (missed event), resize again — prevents a stretched/squashed view
setInterval(()=>{try{const st=document.getElementById('stage'),R=window.GL&&GL.renderer,cv=document.getElementById('cv');if(!st||!R||document.hidden)return;const r=st.getBoundingClientRect(),gc=R.domElement;
 const gh=parseFloat(gc.style.height)||0,gw=parseFloat(gc.style.width)||0,ch=cv?cv.getBoundingClientRect().height:r.height;if(Math.abs(gh-r.height)>1||Math.abs(gw-r.width)>1||Math.abs(ch-r.height)>1)kick()}catch(e){}},700);
const iv=setInterval(add,700);add();window.FS_UI811={toggle:()=>document.getElementById('min811')&&document.getElementById('min811').click(),min:get};
})();

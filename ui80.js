// v8.0 PREVIEW — UI polish: panel open/close transitions, press feedback, and a Sound panel (music / effects volume).
// Disable with ?v80off. Settings live in localStorage (fs_vol_mus / fs_vol_fx); the save is never touched.
(function(){
if(/[?&]v80off/.test(location.search))return;
document.body.classList.add('v80');
const es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')}catch(e){return false}};
const L=(en,s)=>es()?s:en;
const M=document.getElementById('modal');
// close animation: keep the panel visible ~170 ms while it slides out, then really close
if(typeof open==='function'&&typeof close==='function'&&M){
 const o0=open,c0=close;let tm=0;
 const open80=function(h){if(tm){clearTimeout(tm);tm=0;M.classList.remove('m80out')}return o0.apply(this,arguments)};
 const close80=function(){if(M.classList.contains('hidden')||matchMedia('(prefers-reduced-motion: reduce)').matches)return c0.apply(this,arguments);if(tm)return;
  M.classList.add('m80out');tm=setTimeout(()=>{tm=0;M.classList.remove('m80out');c0()},170)};
 open=window.open80=open80;close=close80;
 const x=document.getElementById('x');if(x)x.onclick=()=>close();M.onclick=e=>{if(e.target===M)close()};
}
// press feedback that also works on touch (adds .p80 while held)
const sel='.btn,#bar button,.rbtn';
document.addEventListener('pointerdown',e=>{const b=e.target.closest&&e.target.closest(sel);if(b){b.classList.add('p80');const up=()=>{b.classList.remove('p80');removeEventListener('pointerup',up,true);removeEventListener('pointercancel',up,true)};addEventListener('pointerup',up,true);addEventListener('pointercancel',up,true)}},true);
// Sound panel: the speaker button now opens Sound settings (music / effects volume + a big mute toggle) instead of muting at once
const mute=document.getElementById('mute');
if(mute){mute.title=L('Sound settings','Ajustes de sonido');mute.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();try{Sound.init();Sound.sfx('click')}catch(_){}showVol()},true)}
function row(k,ic,lab){const v=Math.round((typeof Sound!=='undefined'&&Sound.getVol?Sound.getVol(k):1)*100);return `<label>${ic}<span><span style="display:block;margin-bottom:6px">${lab}</span><input type="range" min="0" max="100" step="1" value="${v}" data-k="${k}" style="--p:${v}%" aria-label="${lab}"></span><b>${v}%</b></label>`}
function showVol(){const muted=typeof Sound!=='undefined'&&Sound.muted;// v8.3.7: Sound is a top-level const (not on window), so the panel always showed 100% and 'Sound is on'
 open(`<h2>🎚 ${L('Sound','Sonido')}</h2><div class="v80vol">${row('mus','🎵',L('Music','Música'))}${row('fx','🔔',L('Effects','Efectos'))}</div>
  <p style="margin:14px 2px 6px;opacity:.9">${L('Music changes with each world and grows brighter as you clear pollution.','La música cambia en cada mundo y se vuelve más alegre al limpiar la contaminación.')}</p>
  <button class="btn" id="v80mute">${muted?L('🔇 Sound is off — turn on','🔇 Sonido apagado — activar'):L('🔊 Sound is on — mute','🔊 Sonido activado — silenciar')}</button> <button class="btn" id="v80test">${L('▶ Test','▶ Probar')}</button>`);
 document.querySelectorAll('.v80vol input').forEach(i=>i.oninput=()=>{const v=+i.value;i.style.setProperty('--p',v+'%');i.closest('label').querySelector('b').textContent=v+'%';try{Sound.setVol(i.dataset.k,v/100)}catch(e){}});
 document.querySelectorAll('.v80vol input').forEach(i=>i.onchange=()=>{try{Sound.sfx(i.dataset.k==='fx'?'hit80':'click')}catch(e){}});
 const mb=document.getElementById('v80mute');mb.onclick=()=>{try{Sound.init();Sound.setMuted(!Sound.muted);if(typeof muteIcon==='function')muteIcon()}catch(e){}showVol()};
 document.getElementById('v80test').onclick=()=>{try{Sound.init();['tap80','hit80','defeat80'].forEach((n,k)=>setTimeout(()=>Sound.sfx(n),k*380))}catch(e){}}}
window.FS_UI80={showVol};
})();

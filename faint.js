// faint.js (v6.0.3): when the active fauna's happiness (what monsters drain) hits 0 outside home, it faints and is sent home.
(function(){
const MSG='Your fauna fainted and was sent home';
try{Object.assign(window.I18N_ES||{},{[MSG]:'Tu fauna se desmayó y fue enviada a casa'})}catch(e){}
const tr=s=>{try{return typeof t==='function'?t(s):s}catch(e){return s}};
let busy=false;
function faint(){if(busy)return;const f=fa();if(!f||S.zone==='home'||S.zone==='visit')return;busy=true;window.__faint=1;
 try{Sound.sfx('moan')}catch(e){}
 try{rt.trick={k:'sleep',t0:now()};rt.say={text:'💫',at:now()}}catch(e){}
 try{if(window.NetMP&&NetMP.peer&&typeof send==='function')send({t:'trick',k:'sleep'})}catch(e){}
 toast('💫 '+tr(MSG));
 setTimeout(()=>{try{rt.trick=null}catch(e){}f.happiness=Math.max(f.happiness,25);
  try{if(window.FSgo)FSgo('home');else R.travel({zone:'home'})}catch(e){try{R.travel({zone:'home'})}catch(_){}}
  try{save()}catch(e){}
  setTimeout(()=>{busy=false;window.__faint=0},2500)},1400)}
// monsters can't hurt while fainting/travelling
const ed=window.enemyDmg;window.enemyDmg=function(n){if(window.__faint)return 0;const d=ed?ed(n):n;queueMicrotask(()=>{try{const f=fa();if(f&&f.happiness<=0)faint()}catch(e){}});return d};
try{tooSad=function(){const f=fa();if(f&&f.happiness<=0)f.happiness=0;faint()}}catch(e){}
setInterval(()=>{try{const f=fa();if(f&&f.happiness<=0&&S.zone!=='home'&&S.zone!=='visit')faint()}catch(e){}},100);
window.FSFaint=faint;
})();

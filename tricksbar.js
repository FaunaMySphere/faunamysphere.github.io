// v6.12 (Leo): Tricks button in the main activity bar + quick picker. Uses the existing trick engine (tricks2.js); the radial menu still works.
(function(){
const ES=()=>window.LANG==='es';
const LBL={greet:['Greet','Saludar'],play:['Play','Jugar'],bored:['Bored','Aburrido'],boing:['Boing','Boing'],sniff:['Sniff','Olfatear'],roll:['Roll','Rodar'],itch:['Itch','Rascarse'],jump:['Jump','Saltar'],sleep:['Sleep','Dormir'],wiggle:['Wiggle','Menearse'],twirl:['Twirl','Girar'],hophop:['Hop Hop','Brinca'],moonwalk:['Moonwalk','Moonwalk'],bop:['Bop','Bop']};
const IC={greet:'👋',play:'⚽',bored:'😑',boing:'🦘',sniff:'👃',roll:'🌀',itch:'🐾',jump:'⤴️',sleep:'😴',wiggle:'💃',twirl:'🌪️',hophop:'🐇',moonwalk:'🕺',bop:'🤘'};
const BASIC=['greet','play','bored','boing','sniff','roll','itch','jump','sleep'],DANCE=['wiggle','twirl','hophop','moonwalk','bop'];
const lb=k=>(LBL[k]||[k,k])[ES()?1:0];
const playing=k=>{try{const t=rt.trick;return !!(t&&t.k===k&&t.loop)}catch(e){return false}};
function render(m){const known=k=>(S.tricks||[]).includes(k);
 const cell=k=>'<button data-k="'+k+'" class="'+(known(k)?'':'lock')+(playing(k)?' on':'')+'"><i>'+(known(k)?IC[k]:'🔒')+'</i><span>'+(playing(k)?(ES()?'Parar':'Stop'):lb(k))+'</span></button>';
 m.innerHTML='<div class="tqh"><b>🎪 '+(ES()?'Trucos':'Tricks')+'</b><button data-k="x">✕</button></div><div class="tqg">'+BASIC.map(cell).join('')+'</div><div class="tqs">🎶 '+(ES()?'Bailes (toca otra vez para parar)':'Dances (tap again to stop)')+'</div><div class="tqg">'+DANCE.map(cell).join('')+'</div>'}
function toggle(){let m=document.getElementById('tquick');if(m){m.remove();return}try{Sound.init()}catch(e){}
 m=document.createElement('div');m.id='tquick';render(m);
 m.onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;if(k==='x')return m.remove();
  if(!(S.tricks||[]).includes(k))return toast(ES()?'Encuentra un Chip de '+lb(k)+' para enseñar este truco.':'Find a '+lb(k)+' Chip to teach this trick.');
  if(playing(k))dispatch('trick',{k:'stop'});else dispatch('trick',{k});setTimeout(()=>render(m),60)};
 document.getElementById('stage').appendChild(m)}
window.FSTricksQuick=toggle;
function add(){const bar=document.getElementById('bar');if(!bar||document.getElementById('btricks'))return;
 const b=document.createElement('button');b.id='btricks';b.innerHTML='<i>🎪</i><span>'+(ES()?'Trucos':'Tricks')+'</span>';
 b.onclick=()=>{try{Sound.sfx('click')}catch(e){}toggle()};bar.insertBefore(b,bar.children[2]||null)}
add();document.addEventListener('DOMContentLoaded',add);
setInterval(()=>{const s=document.querySelector('#btricks span');if(s){const t=ES()?'Trucos':'Tricks';if(s.textContent!==t)s.textContent=t}const m=document.getElementById('tquick');if(m&&!m.dataset.r){}},1500);
})();

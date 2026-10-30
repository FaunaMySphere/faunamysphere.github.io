// v4.13 (notes 28): green "Destination" window for the World Gate + circular iris-wipe travel transition
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
window.FS_TOUCH=()=>{try{return matchMedia('(hover: none) and (pointer: coarse)').matches}catch(e){return false}};// v8.3.9: EN says Tap on touch, Click with a mouse
const u0=window.ui;window.ui=ui=function(v,p={}){if(v!=='map')return u0(v,p);
 const me=(S.player&&S.player.name)||t('Caretaker');const row=z=>{const lock=!S.unlocked[z.id],here=S.zone===z.id,gl=GOALS.find(g=>g.id===z.unlock)||{};
  return '<div class="drow'+(lock?' lock':'')+(here?' here':'')+'"'+(lock||here?'':' onclick="FSgo(\''+z.id+'\')"')+'><span class="dn">'+(lock?'🔒 ':'')+t(z.name)+'</span><span class="ds">'+(here?t('You are here'):lock?(gl.name||t('Locked')):z.heat?'🔥 '+t('Needs Heat Proof'):'')+'</span></div>'};
 const tiers={};ZONES.filter(z=>z.id!=='home').forEach(z=>{(tiers[z.tier||1]=tiers[z.tier||1]||[]).push(z)});
 let h='<div class="dest"><h2>'+t('Destination')+'</h2><div class="dsc">'+t(window.FS_TOUCH&&FS_TOUCH()?'Tap this gate to travel to a different world.':'Click on this gate to travel to a different world.')+'</div><div class="dlist"><div class="dgrp">'+me+"'s "+t('Home')+'</div>'+row(Z('home'));
 Object.keys(tiers).sort().forEach(k=>{h+='<div class="dgrp">'+t('Worlds')+' · '+t('Tier')+' '+k+'</div>'+tiers[k].map(row).join('')});
 open(h+'</div></div>')};
window.FSgo=id=>{try{M.classList.add('hidden')}catch(e){}startTravel(id)};let busy=false;const st0=startTravel;startTravel=window.startTravel=function(zone){const z=Z(zone);if(busy||!S.unlocked[zone]||zone===S.zone||(z.heat&&!fa().genes.heatProof))return st0(zone);
 busy=true;let done=false,o=null;const fin=()=>{try{o&&o.remove()}catch(e){}document.querySelectorAll('#iris').forEach(e=>e.remove());busy=false};
 const go=()=>{if(done)return;done=true;try{dispatch('travel',{zone})}catch(e){console.warn('[FaunaMySphere] travel',e);try{st0(zone)}catch(_){}}try{toast('✨ '+t('Arrived at')+' '+t(z.name))}catch(e){}try{Sound.sfx('gate')}catch(e){}};
 try{o=document.createElement('div');o.id='iris';document.body.appendChild(o);void o.offsetWidth;o.classList.add('shut')}catch(e){}
 setTimeout(()=>{go();try{o&&o.classList.remove('shut')}catch(e){}setTimeout(fin,450)},380);
 setTimeout(()=>{go();fin()},2500)};
})();

// v4.18.1 hotfix: gate always opens the Destination window even if the walk-to never "arrives"
(function(){const i0=interact;interact=window.interact=function(o){const r=i0(o);if(o&&o.type==='gate'){const z=S.zone;setTimeout(()=>{try{if(S.zone===z&&rt.tgtObj===o&&M.classList.contains('hidden'))ui('map')}catch(e){}},1800)}return r}})();

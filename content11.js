// v4.13 (notes 28): green "Destination" window for the World Gate + circular iris-wipe travel transition
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
const u0=window.ui;window.ui=ui=function(v,p={}){if(v!=='map')return u0(v,p);
 const me=(S.player&&S.player.name)||t('Caretaker');const row=z=>{const lock=!S.unlocked[z.id],here=S.zone===z.id,gl=GOALS.find(g=>g.id===z.unlock)||{};
  return '<div class="drow'+(lock?' lock':'')+(here?' here':'')+'"'+(lock||here?'':' onclick="FSgo(\''+z.id+'\')"')+'><span class="dn">'+(lock?'🔒 ':'')+t(z.name)+'</span><span class="ds">'+(here?t('You are here'):lock?(gl.name||t('Locked')):z.heat?'🔥 '+t('Needs Heat Proof'):'')+'</span></div>'};
 const tiers={};ZONES.filter(z=>z.id!=='home').forEach(z=>{(tiers[z.tier||1]=tiers[z.tier||1]||[]).push(z)});
 let h='<div class="dest"><h2>'+t('Destination')+'</h2><div class="dsc">'+t('Click on this gate to travel to a different world.')+'</div><div class="dlist"><div class="dgrp">'+me+"'s "+t('Home')+'</div>'+row(Z('home'));
 Object.keys(tiers).sort().forEach(k=>{h+='<div class="dgrp">'+t('Worlds')+' · '+t('Tier')+' '+k+'</div>'+tiers[k].map(row).join('')});
 open(h+'</div></div>')};
window.FSgo=id=>{try{M.classList.add('hidden')}catch(e){}startTravel(id)};let busy=false;const st0=startTravel;startTravel=window.startTravel=function(zone){const z=Z(zone);if(busy||!S.unlocked[zone]||zone===S.zone||(z.heat&&!fa().genes.heatProof))return st0(zone);
 busy=true;const o=document.createElement('div');o.id='iris';document.body.appendChild(o);requestAnimationFrame(()=>o.classList.add('shut'));
 setTimeout(()=>{try{dispatch('travel',{zone});toast('✨ '+t('Arrived at')+' '+z.name)}catch(e){}try{Sound.sfx('gate')}catch(e){}setTimeout(()=>{o.classList.remove('shut');setTimeout(()=>{o.remove();busy=false},650)},350)},650)};
})();

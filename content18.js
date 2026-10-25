// v4.21: tap a roaming idle fauna at home -> name card with "Switch to" (roamers are local-only, never saved)
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
const tap0=tap;tap=window.tap=function(px,py){try{if(!rt.decor&&S.zone==='home'&&window.roamHit){const i=roamHit(px,py);if(i!=null&&S.fauna[i]){const f=S.fauna[i],sp=(SPECIES[f.genes.species]||{}).name||f.genes.species;try{Sound.sfx('click')}catch(e){}
 return open('<h2>'+(f.name||sp)+'</h2><p class="small">'+t(sp)+' · '+t('Level')+' '+(f.level||1)+'</p><p>'+t('is hanging out at home.')+'</p><button class="btn" onclick="M.classList.add(\'hidden\');dispatch(\'setActive\',{fid:'+i+'})">'+t('Switch to this fauna')+'</button>')}}}catch(e){}return tap0(px,py)};
})();

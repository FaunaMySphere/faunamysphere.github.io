// v4.18 (notes 28): Friend Gate in your home sphere; "<Color> <Shape>" pattern names in info windows
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
window.patName=g=>(!g.pattern||/^(Solid|Plain)$/.test(g.pattern))?(g.pattern||'Solid'):((g.color2||'')+' '+g.pattern).trim();
setInterval(()=>{try{const hs=typeof S!=='undefined'&&S&&S.zones&&S.zones.home;if(hs&&!hs.objs.some(o=>o.type==='friendgate')){const p=freeTile('home');if(p){hs.objs.push({id:'home_friendgate',type:'friendgate',i:p[0],j:p[1]});save()}}}catch(e){}},1500);
const i0=interact;interact=window.interact=o=>{if(o&&o.type==='friendgate'){rt.tgtObj=o;try{Sound.sfx('click')}catch(e){}return walkTo(o,()=>ui('friends'))}return i0(o)};
const u0=window.ui;window.ui=ui=function(v,p={}){const r=u0(v,p);try{if((v==='cert'||v==='finfo')&&MB){const f=S.fauna[p.fid|0];if(f)MB.querySelectorAll('.ctab tr').forEach(tr=>{if(tr.cells[0]&&tr.cells[0].textContent===t('Pattern'))tr.cells[1].innerHTML='<b>'+patName(f.genes)+'</b>'})}}catch(e){}return r};
})();

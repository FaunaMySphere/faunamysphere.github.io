// v4.8 (Leo): unlock the earliest half of the locked worlds, for new and existing saves (no progress wiped)
(function(){const HALF=['rockisland','fishatish','ruins','amph','mesa','puddinpie','gobblefield','avalanche','village'];
const run=()=>{try{if(typeof S==='undefined'||!S||!S.unlocked)return;let n=0;HALF.forEach(z=>{if(!S.unlocked[z]){S.unlocked[z]=1;n++}});if(n&&typeof save==='function')save()}catch(e){}};
setInterval(run,1500);document.addEventListener('DOMContentLoaded',run);})();

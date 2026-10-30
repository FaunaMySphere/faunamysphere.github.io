// v4.16 (notes 25/28): green rounded hover tooltips over world objects (mouse only, throttled; no work on touch)
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
const NAMES={gate:'Click on this gate to travel to a different world.',friendgate:"Click on this gate to travel to another player's Faunasphere.",goal:'Goal Station',vendor:'Lux Store',nest:'Nest',den:'Common Den',tree:'Tree',pool:'Pool',rock:'Rock',dig:'Dig Spot',poll:'Inert Pollution',tox:'Vile',reverie:'Reverie Stump',ideashadow:'Idea: click to add ingredients',basin:'Combining Basin'};
const tip=document.createElement('div');tip.id='wtip';document.body.appendChild(tip);let last=0,mx=0,my=0,pend=false;
function upd(){pend=false;try{const cv=document.getElementById('cv')||document.querySelector('canvas');if(!window.hitObj||!cv)return;const r=cv.getBoundingClientRect();const o=hitObj(mx-r.left,my-r.top);
 if(!o){tip.style.display='none';return}let n=NAMES[o.type]||(window.STUMPS&&STUMPS[o.type]&&STUMPS[o.type].name)||(o.type==='decor'&&ITEMS[o.item]&&ITEMS[o.item].name)||'';if(o.type==='poll'&&o.hp)n+=' ('+o.hp+')';
 if(!n){tip.style.display='none';return}tip.textContent=t(window.FS_TOUCH&&FS_TOUCH()&&/^Click on this gate/.test(n)?n.replace('Click on this gate','Tap this gate'):n);tip.style.display='block';tip.style.left=mx+16+'px';tip.style.top=my+14+'px'}catch(e){tip.style.display='none'}}
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'){tip.style.display='none';return}mx=e.clientX;my=e.clientY;if(e.target.tagName!=='CANVAS'){tip.style.display='none';return}const n=performance.now();if(!pend&&n-last>120){last=n;pend=true;requestAnimationFrame(upd)}},{passive:true});
})();

// v4.12 (notes 27): "+N Lux" floaters, random "Wow! 5x" zap bonus, purple "Level up!" speech bubble with squiggles
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
function at(){try{if(window.GLscreen&&typeof rt!=='undefined')return GLscreen({i:rt.pos.i,j:rt.pos.j})}catch(e){}return[innerWidth/2,innerHeight/2]}
function pop(html,cls,dy=0){const[x,y]=at();const d=document.createElement('div');d.className='fpop '+cls;d.innerHTML=html;d.style.left=x+'px';d.style.top=(y-70+dy)+'px';document.body.appendChild(d);setTimeout(()=>d.remove(),1800);return d}
let acc=0,tm=0;const g0=gainLux;gainLux=window.gainLux=function(n){if(n>0&&Math.random()<.04&&n<500){const b=n*4;g0(n+b);pop(t('Wow!')+' 5x','fwow',-30);n+=b}else g0(n);if(n>0){acc+=n;clearTimeout(tm);tm=setTimeout(()=>{pop('+'+acc+' Lux','flux');acc=0},250)}};
let lv=null;setInterval(()=>{try{const f=fa();if(!f)return;if(lv!==null&&f.level>lv){const d=pop(t('Level up!'),'flvl',-40);for(let k=0;k<6;k++){const s=document.createElement('i');s.style.setProperty('--a',(k*60)+'deg');d.appendChild(s)}}lv=f.level}catch(e){}},400);
})();

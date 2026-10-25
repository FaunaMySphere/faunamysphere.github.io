// v5: discoverable Tricks wheel — badge under the portrait + pulse until first opened (S.tricksSeen)
(function(){try{const me=document.getElementById('me'),pf=document.getElementById('pf');if(!me||!pf)return;
const st=document.createElement('style');st.textContent='#me{position:relative}#trkb{position:absolute;z-index:5;width:58px;margin-left:0;padding:1px 0;font-size:9px;font-weight:700;line-height:1.3;font-family:inherit;letter-spacing:-.3px;overflow:hidden;color:#fff;background:#e2477e;border:2px solid #fff;border-radius:9px;box-shadow:0 1px 3px #0007;cursor:pointer;text-align:center;white-space:nowrap}@keyframes pfp{0%,100%{box-shadow:0 2px 4px #0006,0 0 0 0 #ffd84d}50%{box-shadow:0 2px 4px #0006,0 0 0 6px #ffd84d99}}#pf.pulse{animation:pfp 1.4s ease-in-out infinite}';document.head.appendChild(st);
const b=document.createElement('button');b.id='trkb';me.appendChild(b);
const lab=()=>{const es=(window.I18N&&I18N.lang==='es')||window.LANG==='es';const s=es?'🎪 Trucos':'🎪 Tricks';if(b.textContent!==s)b.textContent=s};
const pos=()=>{b.style.left=(pf.offsetLeft-2)+'px';b.style.width=(pf.offsetWidth+4)+'px';b.style.top=(pf.offsetTop+pf.offsetHeight-9)+'px'};
b.onclick=e=>{e.stopPropagation();try{Sound.init()}catch(_){}V5.tricksMenu()};
const seen=()=>{try{if(typeof S!=='undefined'&&!S.tricksSeen){S.tricksSeen=1;save()}}catch(_){}};pf.addEventListener('click',seen);b.addEventListener('click',seen);
setInterval(()=>{try{lab();pos();pf.classList.toggle('pulse',typeof S!=='undefined'&&!S.tricksSeen)}catch(_){}},400);lab();pos();
}catch(e){console.warn(e)}})();
// v5: always-visible Home button (top bar). Hidden when already home. Uses safe travel path (content11 startTravel wrapper with 2.5 s fallback).
(function(){try{const ed=document.getElementById('edit');if(!ed)return;const h=document.createElement('button');h.id='homebtn';h.className='rbtn';h.innerHTML='<i>🏠</i><span></span>';ed.parentNode.insertBefore(h,ed);
h.onclick=e=>{e.stopPropagation();try{Sound.init()}catch(_){}try{if(S.zone!=='home'){if(window.FSgo)FSgo('home');else startTravel('home')}}catch(err){console.warn(err)}};
const upd=()=>{try{const es=(window.I18N&&I18N.lang==='es')||window.LANG==='es';const s=es?'Casa':'Home';const sp=h.querySelector('span');if(sp.textContent!==s)sp.textContent=s;h.title=(es?'🏠 Casa':'🏠 Home');const home=typeof S!=='undefined'&&S.zone==='home';h.style.display=home?'none':'';}catch(_){}};setInterval(upd,400);upd();
}catch(e){console.warn(e)}})();

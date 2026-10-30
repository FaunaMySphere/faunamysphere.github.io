// v8.4: cleaner phone top-left corner. "👋 Name" pill above small reload / help / 🌐 language chips.
// Pure restyle of the existing #hi links (same handlers, same ids); 44x44 tap boxes with smaller visual chips; PC untouched.
(function(){
const css=`@media (max-width:699px){
#top #hi.tl84{position:relative;display:block;max-width:none;min-width:0;flex:0 1 auto;overflow:visible;font-size:0;line-height:0;margin-right:8px;align-self:flex-start;text-shadow:none;padding-left:env(safe-area-inset-left)}
#top #hi.tl84::before{content:attr(data-name);display:inline-block;box-sizing:border-box;max-width:var(--tl84w,112px);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:top;font-weight:800;font-size:12.5px;line-height:1;color:#fff;padding:5px 10px;border-radius:12px;background:#0d3f06cc;border:1.5px solid #9fdc4a88;text-shadow:0 1px 0 #0006}
#top #hi.tl84>a{position:absolute!important;top:calc(100% + 2px);width:44px;height:44px;display:flex;align-items:center;justify-content:center;font-size:0!important;line-height:0;text-decoration:none!important;-webkit-tap-highlight-color:transparent;z-index:50}
#top #hi.tl84>a::after{content:attr(data-chip);display:block;font-weight:800;font-size:13px;line-height:1;color:#173f00;padding:5px 9px;min-width:16px;text-align:center;border-radius:12px;background:linear-gradient(#e9ffc4,#b8ec6a);box-shadow:inset 0 -2px 0 #6aa52a,0 1px 2px #0005;white-space:nowrap}
#top #hi.tl84>a:active::after{transform:translateY(1px);filter:brightness(.92)}
#top #hi.tl84>a.c1{left:env(safe-area-inset-left)}#top #hi.tl84>a.c2{left:calc(env(safe-area-inset-left) + 44px)}#top #hi.tl84>a.c3{left:calc(env(safe-area-inset-left) + 88px);width:58px}
#top #hi.tl84~#savepill{align-self:flex-start}
}
@media (max-width:699px){#top #hi.tl84.tl84s::before{font-size:11px;padding:5px 7px}}`;
const st=document.createElement('style');st.id='tl84css';st.textContent=css;document.head.appendChild(st);
const es=()=>window.LANG==='es';
function up(){try{const h=document.getElementById('hi');if(!h)return;h.classList.add('tl84');
 const as=[...h.querySelectorAll(':scope>a')],rl=as.find(a=>/reload/.test(a.getAttribute('onclick')||'')),hp=document.getElementById('help'),lg=h.querySelector(':scope>a.langbtn');
 let nm='';try{const f=typeof fa==='function'?fa():null;nm=(S&&S.player&&S.player.name)||(f?(es()?'Cuidador de '+f.name:f.name+"'s Caretaker"):(es()?'Cuidador':'Caretaker'))}catch(e){nm=es()?'Cuidador':'Caretaker'}
 if(innerWidth<700){const top=h.parentNode,cs=getComputedStyle(top),gap=parseFloat(cs.columnGap||cs.gap)||6;let used=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight)+(parseFloat(getComputedStyle(h).marginRight)||0)+(parseFloat(getComputedStyle(h).paddingLeft)||0),n=0;
  for(const e of top.children){if(e===h)continue;const r=e.getBoundingClientRect();if(!r.width)continue;const ps=getComputedStyle(e).position;if(ps==='absolute'||ps==='fixed')continue;used+=r.width;n++}used+=gap*n;
  const w=Math.max(34,Math.min(112,Math.floor(innerWidth-used-1)));if(h.style.getPropertyValue('--tl84w')!==w+'px')h.style.setProperty('--tl84w',w+'px');h.classList.toggle('tl84s',w<100)}
 if(es()&&nm==='Caretaker')nm='Cuidador';
 const tight=parseFloat(h.style.getPropertyValue('--tl84w'))<58;const nv=tight?'👋':'👋 '+nm;if(tight)h.title=nm;if(h.dataset.name!==nv)h.dataset.name=nv;
 const set=(a,c,chip,lab)=>{if(!a)return;a.classList.add(c);if(a.dataset.chip!==chip)a.dataset.chip=chip;if(a.getAttribute('aria-label')!==lab){a.setAttribute('aria-label',lab);a.title=lab}};
 set(rl,'c1','↻',es()?'Recargar juego':'Reload game');set(hp,'c2','?',es()?'Ayuda':'Help');set(lg,'c3',es()?'🌐 EN':'🌐 ES',es()?'Cambiar idioma: English':'Change language: Español');
}catch(e){}}
up();setInterval(up,1000);addEventListener('load',up);addEventListener('resize',()=>setTimeout(up,50));
})();

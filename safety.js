// v4.18 anti-freeze safety net: errors are logged and the game keeps running.
(function(){
 const LOG=window.FSERR=[];let lastToast=0;
 function rec(where,e){try{LOG.push({at:Date.now(),where,msg:String(e&&e.message||e).slice(0,200),stack:String(e&&e.stack||'').slice(0,400)});if(LOG.length>40)LOG.shift();console.error('[FS safety]',where,e)}catch(_){}}
 window.FSsafeRec=rec;
 addEventListener('error',ev=>rec('onerror',ev.error||ev.message));
 addEventListener('unhandledrejection',ev=>{rec('promise',ev.reason);ev.preventDefault&&ev.preventDefault()});
 function recover(where,e){rec(where,e);const n=Date.now();if(n-lastToast>8000){lastToast=n;try{toast('⚠️ Oops, something hiccuped. The game kept going.')}catch(_){}}}
 function wrap(name){try{const f=eval(name);if(typeof f!=='function'||f._safe)return;const w=function(){try{return f.apply(this,arguments)}catch(e){recover(name,e);if(name!=='close')try{close()}catch(_){}}};w._safe=1;eval(name+'=w')}catch(e){rec('wrap '+name,e)}}
 ['ui','dispatch','interact','open','close','walkTo','startTravel'].forEach(wrap);
 // wrap every action handler in R (button / station / NPC clicks)
 try{for(const k of Object.keys(R)){const f=R[k];if(typeof f!=='function'||f._safe)continue;R[k]=function(){try{return f.apply(this,arguments)}catch(e){recover('R.'+k,e)}};R[k]._safe=1}}catch(e){rec('wrapR',e)}
 // later reassignments of R.x by other scripts keep working; re-wrap periodically
 setInterval(()=>{try{for(const k of Object.keys(R)){const f=R[k];if(typeof f!=='function'||f._safe)continue;R[k]=function(){try{return f.apply(this,arguments)}catch(e){recover('R.'+k,e)}};R[k]._safe=1}['ui','dispatch','interact','open'].forEach(wrap)}catch(_){}},3000);
 // watchdog: if the main game loop stops getting frames for 2 s while visible, restart it
 setInterval(()=>{try{if(document.hidden||typeof last!=='number'||typeof loop!=='function')return;const l0=last;if(Date.now()-l0<2000)return;
  // a frame ran (this rAF) yet the game loop did not: its chain is dead -> restart exactly one
  requestAnimationFrame(()=>requestAnimationFrame(()=>{if(last===l0&&Date.now()-(window.__fsWd||0)>2000){window.__fsWd=Date.now();rec('watchdog','main loop stopped; restarting');try{loop()}catch(e){rec('loop',e)}}}))}catch(_){}},1000);
})();

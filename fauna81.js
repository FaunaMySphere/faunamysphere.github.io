// v8.1 PREVIEW (B): fauna life — natural blinking, idle variety, mood faces (happy / sad / sleepy), squash & stretch,
// and reactions to petting (tap your fauna), feeding and zaps. Same toon rig, no new meshes or materials (only transforms).
// Hooked from gl.js animFauna via G.FS_anim81 (runs after the v8.0 pose, before the body height is eased). ?v81off disables.
const G=window;
(function boot(){if(new URLSearchParams(location.search).has('v81off'))return;if(!G.W81||!G.W80||typeof emit!=='function')return setTimeout(boot,200);
const W=G.W81,T=W.THREE,es=()=>{try{return (window.FS&&FS.lang==='es')||String(window.LANG||'').startsWith('es')||(typeof LANG!=='undefined'&&String(LANG).startsWith('es'))}catch(e){return false}},now=()=>performance.now()/1000,gnow=()=>{try{return G.now?G.now():Date.now()}catch(e){return Date.now()}};
const ST=new WeakMap();
function st0(f){let s=ST.get(f);if(!s){s={nb:now()+1+Math.random()*3,bl:-9,dbl:0,idle:null,it:0,stillT:now(),py:null,vy:0,sq:0,re:null,rt:0,lid:0,face:'n'};ST.set(f,s)}return s}
let REACT=null; // {k,t0} for the active fauna
function react(k){REACT={k,t0:now()}}
function mood(){try{const f=fa();if(!f)return'n';const h=f.happiness,e=f.energy;if(typeof rt!=='undefined'&&rt.sleep)return'z';if(e<22)return'z';if(h<30)return'sad';if(h>=75&&e>=40)return'joy';return'n'}catch(e){return'n'}}
const IDLES={n:['look','sniff','wag','hop','stretch','sit'],joy:['hop','wag','twirl','look','hop'],sad:['sigh','sit','look'],z:['yawn','nod','sit']};
const ease=(a,b,k)=>a+(b-a)*k,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),bell=u=>Math.sin(Math.PI*cl(u,0,1));
G.FS_anim81=function(f,t,st,r,b,L,y,main){const s=st0(f),n=now();const dt=Math.min(.1,G._dt||.016);
 const m=main?mood():'n';s.face=m;const tk=st.trick!==undefined?st.trick:(main&&typeof rt!=='undefined'?rt.trick:null);const busy=st.walk||st.sleep||st.zap>0||(tk&&gnow()-(tk.t0||0)<2600);
 // ---- idle variety ----
 if(busy){s.stillT=n;s.idle=null}else if(!s.idle&&n-s.stillT>2.2&&n>s.it){const L2=IDLES[m]||IDLES.n;s.idle={k:L2[(Math.random()*L2.length)|0],t0:n,d:1.2+Math.random()*.9};s.it=n+s.idle.d+2.5+Math.random()*4}
 let headX=0,headY=0,headZ=0,rotZ=0,sx=1,sy=1,yOff=0,tailBoost=0;
 if(s.idle){const u=(n-s.idle.t0)/s.idle.d,k=s.idle.k,e=bell(u);if(u>=1){if(k==='twirl')b.rotation.y=0;s.idle=null}else{
  if(k==='look')headY=Math.sin(u*Math.PI*2)*.65*e;
  else if(k==='sniff'){headX=.42*e+Math.sin(n*28)*.04*e}
  else if(k==='wag')tailBoost=e;
  else if(k==='hop'){const h=Math.max(0,Math.sin(u*Math.PI*2));yOff=h*.22;}
  else if(k==='twirl'){b.rotation.y=u*Math.PI*2;yOff=e*.12}
  else if(k==='stretch'){sx=1+.12*e;sy=1-.1*e;headX=-.3*e}
  else if(k==='sit'){yOff=-L*.12*e;headX=.1*e}
  else if(k==='sigh'){sy=1-.08*e;headX=.3*e;yOff=-L*.05*e}
  else if(k==='yawn'){headX=-.45*e;s.lid=Math.max(s.lid,e*.9)}
  else if(k==='nod'){headX=.25+Math.sin(u*Math.PI*3)*.2}}}
 // ---- mood pose ----
 if(main&&!st.sleep){if(m==='sad'){headX+=.22;sy*=.97;tailBoost-=.6}else if(m==='z'){headX+=.15+Math.max(0,Math.sin(n*.8))*.12}else if(m==='joy'){tailBoost+=.4;yOff+=Math.abs(Math.sin(n*2.4))*.01}}
 // ---- reactions (active fauna) ----
 let rk=null,ru=9;if(main&&REACT){ru=n-REACT.t0;rk=REACT.k;const D={pet:1.3,eat:1.1,zap:.45,hurt:.8}[rk]||1;if(ru>D)REACT=null;else{const u=ru/D,e=bell(u);
  if(rk==='pet'){rotZ=Math.sin(ru*22)*.12*e;sy*=1-.1*e;sx*=1+.08*e;headZ=Math.sin(ru*8)*.25*e;tailBoost+=1.4*e}
  else if(rk==='eat'){headX+=(.35+Math.sin(ru*26)*.18)*e;sy*=1+Math.sin(ru*26)*.06*e}
  else if(rk==='zap'){sx*=1+.14*e;sy*=1-.12*e}
  else if(rk==='hurt'){sy*=1-.25*Math.max(0,1-u*2.5);sx*=1+.2*Math.max(0,1-u*2.5);headY+=Math.sin(ru*30)*.25*e;rotZ+=Math.sin(ru*34)*.08*e}}}
 // ---- squash & stretch from vertical motion ----
 const py=b.position.y;if(s.py!=null){const v=(py-s.py)/dt;if(s.vy<-.6&&v>-.15)s.sq=Math.min(.3,s.sq+Math.min(.25,-s.vy*.09));s.vy=v}s.py=py;s.sq*=Math.pow(.0009,dt);
 const str=cl(s.vy*.05,-.1,.14);sy*=1+str-s.sq;sx*=1-str*.5+s.sq*.7;
 b.scale.x*=sx;b.scale.z*=sx;b.scale.y*=sy;if(rotZ)b.rotation.z+=rotZ;
 if(r.head){r.head.rotation.x+=headX;r.head.rotation.y+=headY;if(headZ)r.head.rotation.z=headZ}
 if(r.tail&&tailBoost)r.tail.rotation.y+=Math.sin(t*16)*.35*cl(tailBoost,-1,1.6)-(tailBoost<0?.25:0);
 // ---- eyes: own blink rhythm (random gaps, double blinks), half-lids for sleepy/sad, happy squint on pets ----
 if(n>s.nb){s.bl=n;s.nb=n+(s.dbl?.22:2.2+Math.random()*3.6);s.dbl=!s.dbl&&Math.random()<.22}
 const bu=(n-s.bl)/.14,blink=bu>=0&&bu<1?Math.sin(bu*Math.PI):0;
 let lidK=m==='z'?.55:m==='sad'?.35:0;if(rk==='pet'&&ru<1.2)lidK=.85;if(rk==='hurt'&&ru<.5)lidK=1;lidK=Math.max(lidK,s.lid);s.lid*=.9;
 if(st.sleep)lidK=1;const lk=Math.max(lidK,blink);
 (r.lids||[]).forEach(l=>{const base=l.userData.base??l.rotation.x;l.rotation.x=ease(base,1.5,lk)});
 if(r.eyes&&main){const ey=rk==='pet'&&ru<1.2?.7:m==='joy'?1.04:1;r.eyes.forEach(e=>{if(e.userData.s81==null)e.userData.s81=e.scale.y;e.scale.y=e.userData.s81*ey})}
 return y+yOff};
// ---- events ----
const em0=G.emit;if(typeof em0==='function'){G.emit=function(ev,d){const r=em0.apply(this,arguments);try{if(ev==='eat')react('eat');else if(ev==='hit')react('zap');else if(ev==='hurt')react('hurt')}catch(e){}return r};try{emit=G.emit}catch(e){}}
// ---- petting: tap / click your own fauna ----
let pd=null,petT=0,petGain=0,told=0;
W.cv.addEventListener('pointerdown',e=>{pd={x:e.clientX,y:e.clientY,t:performance.now()}},{passive:true});
W.cv.addEventListener('pointerup',e=>{if(!pd)return;const d=Math.hypot(e.clientX-pd.x,e.clientY-pd.y),dt=performance.now()-pd.t;pd=null;if(d>12||dt>450)return;
 const F=W.fauna;if(!F||!F.visible)return;const rc=W.cv.getBoundingClientRect(),p=F.position.clone();p.y+=.45;const[x,y]=W.proj(p);
 if(Math.hypot(rc.left+x-e.clientX,rc.top+y-e.clientY)>(W.isPhone?62:52))return;pet()},{passive:true});
function pet(){const n=performance.now();if(n-petT<900)return;petT=n;react('pet');const f=fa();if(!f)return;
 try{const V=G.W80,P=W.fauna.position.clone();P.y+=.8;V.burstW(P,8,0xff7fb0,1.2);V.floatW(P,'♥','#ff6f9f')}catch(e){}
 try{Sound.tone(392,.16,'triangle',.07,0,523);Sound.tone(523,.2,'sine',.05,.1,659)}catch(e){}
 if(n-petGain>20000&&f.happiness<100){petGain=n;f.happiness=Math.min(100,f.happiness+2)}
 S.stats.pet81=(S.stats.pet81||0)+1;
 if(!told){told=1;try{toast(es()?'💕 ¡A '+f.name+' le encantan las caricias!':'💕 '+f.name+' loves the pets!')}catch(e){}}}
G.FS_FAUNA81={react,pet,mood};
})();

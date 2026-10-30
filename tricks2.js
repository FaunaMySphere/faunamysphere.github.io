// ===== tricks2.js: readable trick animations, Jump, Sleep, 5 dances with original synthesized songs =====
(function(){
const NEW=['jump','sleep','wiggle','twirl','hophop','moonwalk','bop'],DANCES=['wiggle','twirl','hophop','moonwalk','bop'];
const IC={greet:'👋',play:'⚽',bored:'😑',boing:'🦘',sniff:'👃',roll:'🌀',itch:'🐾',jump:'⤴️',sleep:'😴',wiggle:'💃',twirl:'🌪️',hophop:'🐇',moonwalk:'🕺',bop:'🤘',dance:'🎶'};
const LB={greet:'Greet',play:'Play',bored:'Bored',boing:'Boing',sniff:'Sniff',roll:'Roll',itch:'Itch',jump:'Jump',sleep:'Sleep',wiggle:'Wiggle',twirl:'Twirl',hophop:'Hop-Hop',moonwalk:'Moonwalk',bop:'Bop',dance:'Dance ▸'};
const DUR={greet:1.8,play:2.2,bored:2.4,boing:1.9,sniff:2,roll:1.6,itch:2.2,jump:1.7};
// original songs: bpm, root midi, scale, melody (scale degrees, -1 rest) per 8th, bass degrees per beat, drum pattern per 8th (k=kick s=snare h=hat)
const SONG={
 wiggle:{bpm:120,root:60,sc:[0,2,4,7,9],w:'square',mel:[0,2,4,2,3,-1,4,3, 2,1,0,1,2,-1,-1,-1, 4,3,2,3,4,-1,5,4, 3,2,1,2,0,-1,-1,-1],bass:[0,0,3,3,4,4,0,0],dr:'k-h-s-h-k-k-s-h-'},
 twirl:{bpm:132,root:65,sc:[0,2,4,5,7,9,11],w:'triangle',mel:[0,4,7,4,5,4,2,-1, 1,3,5,3,4,2,0,-1, 0,4,7,9,7,5,4,-1, 3,1,2,0,0,-1,-1,-1],bass:[0,4,3,4,5,4,0,4],dr:'k-hhs-hhk-hhs-hh'},
 hophop:{bpm:110,root:62,sc:[0,3,5,7,10],w:'square',mel:[0,-1,0,2,-1,2,3,-1, 4,-1,3,2,0,-1,-1,-1, 2,-1,2,3,-1,3,4,-1, 5,4,3,2,0,-1,-1,-1],bass:[0,0,2,2,3,3,0,4],dr:'k---s-k-k-k-s---'},
 moonwalk:{bpm:100,root:57,sc:[0,3,5,6,7,10],w:'sawtooth',mel:[0,-1,2,3,4,-1,3,2, 0,-1,-1,5,4,-1,-1,-1, 0,-1,2,3,4,-1,6,5, 4,3,2,0,-1,-1,-1,-1],bass:[0,0,0,5,3,3,4,4],dr:'k-h-s-hkh-k-s-hh'},
 bop:{bpm:140,root:64,sc:[0,2,3,5,7,8,10],w:'square',mel:[0,0,4,4,3,3,2,-1, 0,0,4,4,5,4,3,-1, 2,2,6,6,5,5,4,-1, 3,2,1,0,0,-1,0,-1],bass:[0,0,5,5,3,3,4,4],dr:'kshskshskshskkss'}};
const BUF={};let cur=null;
const hz=m=>440*Math.pow(2,(m-69)/12);
async function render(k){const s=SONG[k],sr=22050,e=60/s.bpm/2,steps=64,len=e*steps,oc=new OfflineAudioContext(1,Math.ceil(sr*len),sr);
 const out=oc.createGain();out.gain.value=.5;out.connect(oc.destination);
 const nb=oc.createBuffer(1,sr*.2,sr),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
 const note=(f,t,dur,w,v)=>{const o=oc.createOscillator(),g=oc.createGain();o.type=w;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(out);o.start(t);o.stop(t+dur+.02)};
 const deg=(i,oct)=>{const n=s.sc.length;return s.root+12*(oct+Math.floor(i/n))+s.sc[((i%n)+n)%n]};
 for(let st=0;st<steps;st++){const t=st*e,m=s.mel[st%32];
  if(m>=0){note(hz(deg(m+(st>=32&&st%4===2?1:0),0)),t,e*.9,s.w,.09);note(hz(deg(m,1)),t,e*.5,'sine',.025)}
  if(st%2===0){const b=s.bass[(st>>1)%8];note(hz(deg(b,-2)),t,e*1.6,'triangle',.22)}
  const c=s.dr[st%16];
  if(c==='k'){const o=oc.createOscillator(),g=oc.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.12);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(out);o.start(t);o.stop(t+.2)}
  if(c==='s'||c==='h'){const n=oc.createBufferSource(),f=oc.createBiquadFilter(),g=oc.createGain();n.buffer=nb;f.type=c==='s'?'bandpass':'highpass';f.frequency.value=c==='s'?1800:7000;g.gain.setValueAtTime(c==='s'?.28:.07,t);g.gain.exponentialRampToValueAtTime(.001,t+(c==='s'?.14:.04));n.connect(f);f.connect(g);g.connect(out);n.start(t);n.stop(t+.16)}}
 BUF[k]=await oc.startRendering()}
let pre=false;function prerender(){if(pre||!window.OfflineAudioContext)return;pre=true;let i=0;const nx=()=>{if(i<DANCES.length)render(DANCES[i++]).then(()=>setTimeout(nx,150)).catch(()=>{})};setTimeout(nx,500)}
function stopSong(){if(!cur)return;const c=Sound.ctx,x=cur;cur=null;try{x.g.gain.setTargetAtTime(0,c.currentTime,.25);setTimeout(()=>{try{x.src.stop()}catch(e){}},1200)}catch(e){}duck(false)}
function playSong(k,vol,who){if(cur&&cur.k===k&&cur.who===who)return;stopSong();const c=Sound.ctx;if(!c||Sound.muted||!BUF[k])return;
 const src=c.createBufferSource(),g=c.createGain();src.buffer=BUF[k];src.loop=true;g.gain.setValueAtTime(0,c.currentTime);vol*=(Sound.getVol?Sound.getVol('mus'):1);g.gain.linearRampToValueAtTime(vol,c.currentTime+.3);src.connect(g);g.connect(Sound.master);src.start();cur={k,src,g,who,t0:c.currentTime};duck(true)}// v8.3.7: dance songs follow the Music volume
function duck(on){try{if(Sound.mus&&Sound.mus.gain){const base=.5*(Sound.getVol?Sound.getVol('mus'):1);Sound.mus.gain.setTargetAtTime(on?base*.24:base,Sound.ctx.currentTime,.3)}}catch(e){}}// v8.3.7: after a dance song music came back at 1 (2× the normal level, ignoring the Music volume slider)
// sound effects per trick
function sfx(k){const c=Sound.ctx;if(!c||Sound.muted)return;const T=(f,d,w,v,at,sl)=>Sound.tone(f,d,w,v,at,sl);
 ({greet:()=>{T(660,.12,'sine',.12,0,1.3);T(880,.14,'sine',.1,.13,1.2)},play:()=>{T(500,.08,'square',.06,0,1.6);T(800,.08,'square',.06,.1,1.6);T(1000,.12,'triangle',.08,.2,1.4)},
  bored:()=>{T(320,.9,'sine',.1,0,.55)},boing:()=>{T(180,.5,'sine',.22,0,3.5);setTimeout(()=>T(120,.15,'triangle',.15,0,.5),1150)},sniff:()=>{for(let i=0;i<5;i++)Sound.noise&&Sound.noise(.05,.08,2500,i*.18,'bandpass')},
  roll:()=>{T(300,.7,'sawtooth',.05,0,3)},itch:()=>{for(let i=0;i<8;i++)Sound.noise&&Sound.noise(.03,.07,4000,i*.12,'highpass')},
  jump:()=>{T(220,.35,'square',.08,0,4);T(440,.25,'sine',.1,.05,2.5);setTimeout(()=>T(90,.12,'sine',.25,0,.5),1250)},
  snore:()=>{T(90,.9,'sawtooth',.035,0,1.3);Sound.noise&&Sound.noise(.8,.03,500,0,'lowpass');T(140,.6,'sine',.04,1.1,.6)}}[k]||(()=>{}))()}
// ---------- animation (called from gl.js animFauna) ----------
const sn=Math.sin,PI=Math.PI,ab=Math.abs;
// whole-body motion on the root (position is re-copied every frame; rotations applied as deltas)
function rootMove(f,te,k){const o={py:0,px:0,ry:0,rz:0,s:1};if(!k)return o;const TAU=PI*2;
 if(DANCES.includes(k)){const bt=te*SONG[k].bpm/60,ph=bt*TAU;
  if(k==='wiggle'){o.py=ab(sn(ph/2))*.22;o.rz=sn(ph/2)*.35;o.px=sn(ph/4)*.12}
  else if(k==='twirl'){const c=bt%2;o.ry=c<1?c*TAU:0;o.py=c<1?sn(PI*c)*.45:ab(sn(ph))*.08}
  else if(k==='hophop'){o.py=ab(sn(ph/2))*.5;o.px=((Math.floor(bt)%4)<2?1:-1)*.22;o.rz=-o.px*.8}
  else if(k==='moonwalk'){const c=(bt/4)%2;o.px=(c<1?c:2-c)*.8-.4;o.py=ab(sn(ph))*.06;o.ry=PI/2}
  else{o.py=ab(sn(ph))*.18;o.rz=sn(ph/2)*.2;o.s=1+ab(sn(ph))*.08}
  return o}
 const D=DUR[k];if(k==='sleep'){o.rz=1.25;o.py=-.05;return o}if(!D||te>D)return o;const p=te/D;
 if(k==='jump'){const u=(p-.25)/.55;if(u>0&&u<1)o.py=sn(PI*u)*1.1;o.s=p<.25?1-.15*p/.25:1}
 else if(k==='boing'){const u=(p-.2)/.6;if(u>0&&u<1)o.py=sn(PI*u)*.8}
 else if(k==='play'){o.py=ab(sn(p*PI*2))*.45;o.ry=Math.min(1,p*2)*TAU}
 else if(k==='roll'){const e=p<.1?0:p>.9?1:(p-.1)/.8;o.rz=e*TAU;o.py=sn(PI*e)*.35}
 else if(k==='greet'){o.py=ab(sn(te*7))*.12*sn(PI*p)}
 else if(k==='itch'){o.rz=.35*sn(PI*p)}
 return o}
function applyRoot(f,o){if(!f)return;o.py*=1.5;o.px*=1.3;const u=f.userData;f.position.y+=o.py;f.position.x+=o.px*Math.cos(f.rotation.y);f.position.z-=o.px*Math.sin(f.rotation.y);
 f.rotation.y+=o.ry-(u._ry||0);u._ry=o.ry;f.rotation.z+=o.rz-(u._rz||0);u._rz=o.rz;const bs=u._bs||(u._bs=f.scale.x);if(o.s!==1||u._sc){f.scale.setScalar(bs*o.s);u._sc=o.s!==1}}
window.FSTrickAnim=function(k,te,r,b,L,y,t,f){if(r.ears&&r.ears.length){const ph=(t+(r._eo||(r._eo=Math.random()*9)))%4.3,tw=ph<.25?Math.sin(ph/.25*Math.PI)*.35:0;r.ears.forEach((e,i)=>{const u=e.userData;if(u.bz===undefined)u.bz=e.rotation.z;e.rotation.z=u.bz+(i?tw:-tw*.6)})}const _o=rootMove(f,te,k);applyRoot(f,_o);if(k&&f&&typeof rt!=="undefined"&&rt.trick&&rt.trick.k===k)window.__tko=_o;if(!k)return;const H=r.head,lg=r.legs,tl=r.tail;
 if(DANCES.includes(k)){const bt=te*SONG[k].bpm/60,ph=bt*PI*2,bar=Math.floor(bt/4)%2;
  if(k==='wiggle'){b.rotation.z=sn(ph)*.25;b.rotation.y=sn(ph/2)*.3;y=L+ab(sn(ph))*.06;if(H)H.rotation.z=-sn(ph)*.3;if(tl)tl.rotation.y=sn(ph*2)*.8;lg.forEach((l,i)=>l.rotation.x=sn(ph+i)*.4)}
  else if(k==='twirl'){const sp=(bt%4)<2?(bt%2)/2*PI*2:0;b.rotation.y=sp+(bar?PI:0)*0;b.rotation.z=sn(ph)*.08;y=L+ab(sn(ph/2))*.12;if(H)H.rotation.x=-.2;lg.forEach((l,i)=>l.rotation.x=(i%2?1:-1)*.5*ab(sn(ph)))}
  else if(k==='hophop'){const side=Math.floor(bt)%4<2?1:-1;b.rotation.y=side*.5;y=L+ab(sn(ph/2))*.22;b.scale.y*=1+sn(ph)*.08;b.rotation.z=side*.15;lg.forEach(l=>l.rotation.x=-ab(sn(ph/2))*.6);if(H)H.rotation.z=side*.2}
  else if(k==='moonwalk'){b.rotation.y=PI*.5+sn(ph/8)*.2;b.rotation.x=-.08;y=L+ab(sn(ph))*.02;lg.forEach((l,i)=>l.rotation.x=sn(ph*.5+(i%2?PI:0))*.7);if(H){H.rotation.x=sn(ph)*.15;H.rotation.y=-.5}if(tl)tl.rotation.y=sn(ph)*.4}
  else{if(H){H.rotation.x=.15+(sn(ph*2)>0?.45:-.1)}b.rotation.x=sn(ph*2)*.1;y=L+ab(sn(ph*2))*.05;b.rotation.z=bar?sn(ph)*.12:0;if(tl)tl.rotation.y=sn(ph*4)*.9;lg.forEach((l,i)=>l.rotation.x=sn(ph+i)*.25)}
  return y}
 if(k==='sleep'){const br=sn(te*1.8);b.rotation.x=.12;b.rotation.z=.25;y=L*.55;b.scale.set(1+br*.03,1-br*.04,1+br*.03);if(H){H.rotation.x=.5;H.rotation.z=.2}lg.forEach(l=>l.rotation.x=.9);r.lids.forEach(l=>l.rotation.x=1.5);if(tl)tl.rotation.y=.4;return y}
 const D=DUR[k];if(!D||te>D)return;const p=te/D,env=sn(PI*p);
 if(k==='greet'){if(H){H.rotation.x=sn(te*9)*.3*env;H.rotation.z=sn(te*5)*.2*env}if(lg[0])lg[0].rotation.x=-1.4*env+sn(te*14)*.4*env;b.rotation.z=-.12*env;y+=env*.05}
 else if(k==='play'){const hp=p<.5?p*2:1;y+=ab(sn(p*PI*2))*.28;b.rotation.y=hp*PI*2;b.scale.y*=1+sn(te*20)*.05*env;if(tl)tl.rotation.y=sn(te*18)*.7}
 else if(k==='bored'){y=L*(1-.25*env);b.scale.x*=1+.08*env;b.scale.y*=1-.12*env;if(H){H.rotation.x=.45*env;H.rotation.y=sn(te*1.5)*.2}if(tl)tl.rotation.y=0;lg.forEach(l=>l.rotation.x=.3*env)}
 else if(k==='boing'||k==='jump'){const hi=k==='jump'?1.1:.7,c=.25,u=(p-c)/(.8-c);if(p<c){const s=p/c;b.scale.set(1+.3*s,1-.35*s,1+.3*s)}else if(u<1){y+=sn(PI*u)*hi;const st=1.25-.25*u;b.scale.set(1/Math.sqrt(st),st,1/Math.sqrt(st));lg.forEach(l=>l.rotation.x=k==='jump'?-.8:.6);if(k==='boing')b.rotation.x=sn(PI*u)*.3}else{const s=1-(p-.8)/.2;b.scale.set(1+.3*s,1-.3*s,1+.3*s)}}
 else if(k==='sniff'){if(H){H.rotation.x=.6*env+sn(te*28)*.07;H.rotation.y=sn(te*2.5)*.4}b.rotation.x=.18*env;y-=.04*env}
 else if(k==='roll'){const e2=p<.15?0:p>.85?1:(p-.15)/.7;b.rotation.z=e2*PI*2;y+=sn(PI*e2)*.25;lg.forEach(l=>l.rotation.x=-.7*sn(PI*e2))}
 else if(k==='itch'){b.rotation.z=.3*env;b.rotation.x=-.1*env;const L3=lg[lg.length-1];if(L3)L3.rotation.x=-1+sn(te*34)*.5;if(H){H.rotation.z=-.3*env;H.rotation.x=sn(te*17)*.06}r.lids.forEach(l=>l.rotation.x=env>.5?1.2:l.rotation.x)}
 return y};
// ---------- game hooks ----------
function boot(){if(typeof S==='undefined'||!S||!S.tricks||typeof R==='undefined'||!R.trick||typeof rt==='undefined'){setTimeout(boot,500);return}
 NEW.forEach(k=>{if(!S.tricks.includes(k))S.tricks.push(k)});
 const SAY={jump:'Hup! ⤴️',sleep:'💤 Zzz…',wiggle:'🎶 Wiggle!',twirl:'🎶 Spin spin!',hophop:'🎶 Hop-hop!',moonwalk:'🎶 Smooth…',bop:'🤘 Bop!'};
 const r0=R.trick;R.trick=p=>{const k=p&&p.k;if(!k)return;if(k==='stop'){stop(true);return}
  if(!NEW.includes(k)){stop(false);r0(p);sfx(k);return}
  if(cur||rt.trick&&rt.trick.loop)stop(false);
  rt.trick={k,t0:now(),loop:k!=='jump'};rt.say={text:SAY[k],at:now()};const f=fa&&fa();if(f)f.happiness=clamp(f.happiness+.5);
  if(k==='jump')sfx('jump');else if(k==='sleep'){sfx('snore')}else{prerender();playSong(k,.55,'me')}
  if(window.NetMP&&NetMP.peer)NetMP.send({t:'trick',k})};
 function stop(bc){if(rt.trick&&rt.trick.loop){rt.trick=null;stopSong();if(bc!==false||true)if(window.NetMP&&NetMP.peer)NetMP.send({t:'trick',k:'stop'})}}
 let lastSn=0;
 setInterval(()=>{try{const tk=rt.trick;
  if(tk&&tk.loop&&(rt.tgt||rt.path&&rt.path.length)){stop(true);return}
  if(tk&&tk.k==='sleep'&&now()-lastSn>3000){lastSn=now();sfx('snore');rt.say={text:'💤 Zzz…',at:now()}}
  if(tk&&tk.loop&&DANCES.includes(tk.k)&&!cur&&BUF[tk.k])playSong(tk.k,.55,'me');
  // friends' dances: hear nearby at lower volume, see their Zzz
  if(!(tk&&tk.loop)&&window.NetMP){let fk=null,fw=null;for(const q of NetMP.visiblePeers()){if(q.trick&&q.trick.k==='sleep'&&(!q.say||Date.now()-q.say.at>3000))q.say={text:'💤 Zzz…',at:Date.now()};if(q.trick&&DANCES.includes(q.trick.k)){const d=Math.hypot((q.i||0)-rt.pos.i,(q.j||0)-rt.pos.j);if(isNaN(d)||d<7){fk=q.trick.k;fw=q.id}}}
   if(fk){prerender();playSong(fk,.22,fw)}else if(cur&&cur.who!=='me')stopSong()}}catch(e){}},400);
 // cancel loop when tapping the world
 const stg=document.getElementById('stage');stg&&stg.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('#radial,#pf'))return;if(rt.trick&&rt.trick.k==='sleep')setTimeout(()=>{if(rt.trick&&rt.trick.k==='sleep')stop(true)},50)},true);
 document.addEventListener('pointerdown',()=>{if(Sound.ctx)prerender()},{once:true});
 // radial with Dance sub-wheel
 const L_=k=>window.T?window.T(LB[k]):LB[k];
 function wheel(items,title,back){let m=document.getElementById('radial');if(m)m.remove();m=document.createElement('div');m.id='radial';
  m.innerHTML='<div class="rc">'+title+'</div>'+items.map((k,i)=>{const a=i/items.length*6.283-1.57,R_=items.length>8?104:92;const lk=k!=='home'&&k!=='dance'&&k!=='back'&&!S.tricks.includes(k);return`<button style="left:calc(50% + ${Math.cos(a)*R_}px);top:calc(50% + ${Math.sin(a)*R_}px)" class="${lk?'lock':''}" data-k="${k}"><i>${k==='home'?'🏠':k==='back'?'◀':IC[k]}</i><span>${k==='home'?L_('Go Home')||'Go Home':k==='back'?'Back':L_(k)}</span></button>`}).join('');
  m.onclick=e=>{const b=e.target.closest('button');m.remove();if(!b)return;const k=b.dataset.k;
   if(k==='dance')return wheel([...DANCES,'back'],L_('dance').replace(' ▸',''));if(k==='back')return V5.tricksMenu();
   if(k==='home'){if(S.zone!=='home')startTravel('home');return}if(!S.tricks.includes(k))return toast('Find a '+LB[k]+' Chip to teach this trick.');dispatch('trick',{k})};
  document.getElementById('stage').appendChild(m);Sound.sfx('whoosh');window.FSi18nApply&&FSi18nApply()}
 LB['Go Home']='Go Home';
 V5.tricksMenu=function(){if(document.getElementById('radial')){document.getElementById('radial').remove();return}Sound.init&&Sound.init();prerender();wheel(['greet','play','bored','boing','sniff','roll','itch','jump','sleep','dance','home'],window.T?window.T('Tricks'):'Tricks')};
}
// camera: ease in on your fauna while it performs, then back to the previous zoom
let z0=null;(function camLoop(){requestAnimationFrame(camLoop);try{if(typeof cam==='undefined'||!cam||typeof rt==='undefined')return;const tk=rt.trick,on=tk&&(tk.loop||(now()-tk.t0)/1000<(DUR[tk.k]||2)+.3);
 if(on){if(z0===null)z0=cam.zoom||1;cam.zoom+=(Math.max(z0,1.9)-cam.zoom)*.06}else if(z0!==null){cam.zoom+=(z0-cam.zoom)*.08;if(Math.abs(cam.zoom-z0)<.01){cam.zoom=z0;z0=null}}}catch(e){}})();
window.FSTricks2={BUF,get cur(){return cur},SONG};boot();
})();
// v8.3.1: opening any panel (or pressing Esc) closes the tricks wheel so it no longer lingers behind other windows
(function(){const o=window.open;if(typeof o==='function'&&!o.__rad){const w=function(){try{const r=document.getElementById('radial');if(r)r.remove()}catch(e){}return o.apply(this,arguments)};w.__rad=1;window.open=w}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){const r=document.getElementById('radial');if(r)r.remove()}})})();

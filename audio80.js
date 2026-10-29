// v8.0 PREVIEW — richer original music + SFX, 100% synthesized in WebAudio (no samples, nothing from the original game).
// * Music & effects volume (localStorage fs_vol_mus / fs_vol_fx, 0..1; mute still wins). Not part of the save.
// * Mood layer that follows the current world's restoration: polluted = muffled music + low smog drone,
//   restored = open filter + warm pad + per-world bell sparkles. Combat layer (taiko pulse) fades in near monsters.
// * New SFX: UI taps, hits, monster defeat, boss, telegraph warning, dodge, hatch, level-up.
// Disable with ?v80off.
(function(){
if(/[?&]v80off/.test(location.search)||typeof Sound==='undefined')return;
const VK={mus:'fs_vol_mus',fx:'fs_vol_fx'};
const vol=k=>{const v=parseFloat(localStorage.getItem(VK[k]));return isNaN(v)?1:Math.max(0,Math.min(1,v))};
Sound.getVol=vol;
Sound.setVol=(k,v)=>{try{localStorage.setItem(VK[k],String(Math.max(0,Math.min(1,+v))))}catch(e){}apply()};
function apply(){const c=Sound.ctx;if(!c||!Sound.mus)return;const t=c.currentTime;Sound.mus.gain.setTargetAtTime(.5*vol('mus'),t,.05);Sound.fx.gain.setTargetAtTime(.9*vol('fx'),t,.05)}
const R0=261.63,st=s=>R0*Math.pow(2,s/12);
// per-world flavour for the sparkle layer: FM ratio, octave offset, density, decay
const FLAV={arctic:[2.76,36,.9,1.8],swamp:[1.5,12,.5,.6],scorch:[5.1,24,.7,.7],beach:[3.5,24,.7,.9],mesa:[5.1,24,.6,.7],night:[3.01,24,.5,2.2],
 dungeon:[1.41,12,.45,1.2],rock:[2.4,24,.55,1],candy:[4,36,.9,.6],sea:[1.5,24,.6,1.5],forest:[3.5,24,.65,1.2],garden:[3.5,24,.7,1.2]};
let M=null;
function setup(){const S0=Sound,c=S0.ctx;if(M||!c)return;
 // route music through a "smog" lowpass so pollution muffles it
 const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=18000;lp.Q.value=.5;
 try{S0.mus.disconnect()}catch(e){}S0.mus.connect(lp);lp.connect(S0.master);lp.connect(S0.rev);
 const L=c.createGain();L.gain.value=1;L.connect(S0.mus);
 // smog drone: two detuned saws + filtered noise, slow wobble
 const dG=c.createGain();dG.gain.value=0;const dF=c.createBiquadFilter();dF.type='lowpass';dF.frequency.value=320;dF.Q.value=4;dF.connect(dG);dG.connect(L);
 const o1=c.createOscillator(),o2=c.createOscillator();o1.type=o2.type='sawtooth';o1.frequency.value=st(-24);o2.frequency.value=st(-24)*1.006;o1.connect(dF);o2.connect(dF);
 const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=.13;lg.gain.value=140;lfo.connect(lg);lg.connect(dF.frequency);
 const ns=c.createBufferSource();ns.buffer=S0.nbuf;ns.loop=true;const nf=c.createBiquadFilter();nf.type='bandpass';nf.frequency.value=500;nf.Q.value=.7;const ng=c.createGain();ng.gain.value=.25;ns.connect(nf);nf.connect(ng);ng.connect(dG);
 [o1,o2,lfo,ns].forEach(o=>o.start());
 // warm pad for restored worlds
 const pG=c.createGain();pG.gain.value=0;const pF=c.createBiquadFilter();pF.type='lowpass';pF.frequency.value=1400;pF.connect(pG);pG.connect(L);
 const pad=[0,1,2].map(()=>{const o=c.createOscillator();o.type='triangle';o.connect(pF);o.start();return o});
 // combat bus
 const cG=c.createGain();cG.gain.value=0;cG.connect(L);
 M={lp,L,dG,o1,o2,pG,pad,cG,r:-1,cb:0};apply()}
function moodR(){try{if(window.__moodR!=null)return window.__moodR;if(typeof S==='undefined'||!S.zone||S.zone==='home'||!S.fauna||!S.fauna.length)return 1;
 if(window.FSrestore){const x=FSrestore();if(x&&x.r!=null)return x.r}const v=S.restore&&S.restore[S.zone];return v==null?1:v}catch(e){return 1}}
function combatNear(){try{if(window.__combat80!=null)return window.__combat80;if(typeof S==='undefined'||typeof rt==='undefined'||!S.zones||S.zone==='home')return 0;const s=S.zones[S.zone];if(!s||!rt.pos)return 0;
 return s.objs.some(o=>o.type==='tox'&&o.mon&&!o.hid&&Math.hypot(o.i-rt.pos.i,o.j-rt.pos.j)<6)?1:0}catch(e){return 0}}
function bell(f,t,v,ratio,dec,dest){const c=Sound.ctx,o=c.createOscillator(),m=c.createOscillator(),mg=c.createGain(),g=c.createGain();o.frequency.value=f;m.frequency.value=f*ratio;
 mg.gain.setValueAtTime(f*2.2,t);mg.gain.exponentialRampToValueAtTime(f*.05,t+dec);m.connect(mg);mg.connect(o.frequency);Sound.env(g,t,.004,dec,v);o.connect(g);g.connect(dest||M.L);o.start(t);m.start(t);o.stop(t+dec+.1);m.stop(t+dec+.1)}
function taiko(t,v,f=70){const c=Sound.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(f*1.8,t);o.frequency.exponentialRampToValueAtTime(f,t+.08);Sound.env(g,t,.004,.35,v);o.connect(g);g.connect(M.cG);o.start(t);o.stop(t+.5);Sound.noise(.08,v*.5,900,0,'lowpass',M.cG,t,1)}
// called by audio.js for every 8th-note step of the base music
Sound.onStep=function(style,step,t,e,ch,b){if(!M)return;const c=this.ctx,r=moodR();M.r=M.r<0?r:M.r+(r-M.r)*.06;const k=M.r;
 const tc=.4;M.lp.frequency.setTargetAtTime(900+Math.pow(k,1.6)*17000,t,tc);
 M.dG.gain.setTargetAtTime(style==='title'?0:.06*Math.pow(1-k,1.2),t,tc);M.pG.gain.setTargetAtTime(style==='title'?0:.018*k,t,tc);
 if(b===0){const root=st(ch[0]-24);M.o1.frequency.setTargetAtTime(root,t,.3);M.o2.frequency.setTargetAtTime(root*1.006,t,.3);
  ch.forEach((x,i)=>M.pad[i].frequency.setTargetAtTime(st(x-12)*(i===1?1.003:1),t,.25))}
 // sparkle bells: only once the world is getting healthy; density & timbre per world
 const bi=this.biome||'',fl=FLAV[bi]||[3.5,24,.6,1.1];
 if(style!=='title'&&k>.35&&Math.random()<fl[2]*(k-.3)*.55&&b%2===0){const n=ch[(step/2|0)%3]+fl[1];bell(st(n),t,.022*k,fl[0],fl[3])}
 // polluted: occasional sour swell
 if(k<.4&&b===0&&step%32===0)Sound.tone(st(ch[0]-11),e*6,'sawtooth',.012*(1-k),0,1,M.L,t);
 // combat layer
 const cb=combatNear();M.cb+=(cb-M.cb)*.25;M.cG.gain.setTargetAtTime(M.cb*.9,t,.3);
 if(M.cb>.05){if(b%4===0)taiko(t,.22,b===0?62:74);if(b%2===1)Sound.noise(.03,.05,6000,0,'highpass',M.cG,t,2);if(b===6)taiko(t+e/2,.12,90)}};
// ---- SFX ----
const sfx0=Sound.sfx.bind(Sound);
const T=(f,d,ty,v,at,sl)=>Sound.tone(f,d,ty,v,at,sl),N=(d,v,f,at,ty,q)=>Sound.noise(d,v,f,at,ty,null,null,q);
const chime=(notes,gap,v,dec=.9,ratio=3.5)=>{const c=Sound.ctx;notes.forEach((n,i)=>bell(st(n),c.currentTime+i*gap,v,ratio,dec,Sound.fx))};
const NEW={
 tap80:()=>{T(880,.05,'sine',.07,0,.55);N(.012,.05,3200,0,'bandpass',3)},
 click:()=>{T(620,.07,'sine',.08,0,1.9);T(1568,.08,'sine',.03,.025)},
 hit80:()=>{T(150,.16,'sine',.24,0,.45);N(.07,.2,1400,0,'bandpass',1.4);N(.04,.08,5200,.012,'highpass')},
 defeat80:()=>{N(.35,.16,650,0,'lowpass');T(200,.3,'triangle',.08,0,.4);for(let k=0;k<6;k++)T(2100-k*200,.09,'triangle',.03,.05+k*.035);setTimeout(()=>chime([24,28,31,36],.06,.035,.7),260)},
 bossdown80:()=>{T(55,1.1,'sine',.35,0,.5);N(.9,.22,280,0,'lowpass');setTimeout(()=>sfx0('fanfare'),350);setTimeout(()=>chime([24,31,36,40,43,48],.07,.03,1.2),500)},
 boss80:()=>{[110,164.8,220].forEach((f,i)=>{T(f,1.1,'sawtooth',.05,i*.03,.98)});T(55,1.2,'sine',.25,0,.9);N(1,.08,180,0,'lowpass')},
 tel80:()=>{T(330,.3,'square',.025,0,1.9);T(335,.3,'square',.02,.02,1.9)},
 slam80:()=>{T(95,.9,'sawtooth',.05,0,.45);N(.9,.06,220,0,'lowpass',2)},
 dodge80:()=>{N(.18,.08,2500,0,'bandpass',.8);T(1200,.09,'sine',.04,.03,1.6)},
 hatch:()=>{[0,.2,.36].forEach((a,i)=>{N(.035,.2,3500+i*500,a,'highpass');T(900+i*200,.03,'square',.03,a)});setTimeout(()=>{N(.12,.18,1200,0,'bandpass');chime([12,16,19,24,28,31,36],.07,.04,1.1)},520);setTimeout(()=>sfx0('newborn'),1300)},
 level:()=>{chime([12,16,19,24],.08,.04,.9,2);setTimeout(()=>sfx0('fanfare'),300);setTimeout(()=>{for(let k=0;k<10;k++)T(2400+Math.random()*2200,.12,'sine',.02,k*.045)},900)},
 hurt:()=>{T(240,.16,'triangle',.1,0,.5);N(.1,.12,700,0,'bandpass',1.2);sfx0('growl')}};
Sound.sfx=function(n){if(!this.ctx||this.muted)return;const f=NEW[n];if(!f)return sfx0(n);try{if(!M)setup();f()}catch(e){sfx0(n)}};
const init0=Sound.init;Sound.init=function(){const had=!!this.ctx;init0.apply(this,arguments);if(!had&&this.ctx){try{setup()}catch(e){console.warn('a80',e)}}};
if(Sound.ctx)try{setup()}catch(e){}
// UI tap sound on every button press (the bottom bar already clicks)
let lastTap=0;document.addEventListener('pointerdown',e=>{const b=e.target&&e.target.closest&&e.target.closest('button,.btn,.card,[role=button],input[type=range]');if(!b||b.closest('[data-ui]'))return;const n=performance.now();if(n-lastTap<70)return;lastTap=n;try{if(Sound.ctx)Sound.sfx('tap80')}catch(_){}},true);
window.FS_A80={setup,get M(){return M},moodR};
})();

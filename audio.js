// v4 audio — 100% synthesized in WebAudio. No audio files; nothing sampled or copied from the original.
// Modelled on our listening notes (ref/AUDIO_NOTES.md): per-zone music styles + surface footsteps + creature voices.
const Sound={ctx:null,master:null,mus:null,fx:null,muted:localStorage.getItem('fs_muted')==='1',biome:'home',_t:0,_zap:null,
 init(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}try{const c=this.ctx=new(window.AudioContext||window.webkitAudioContext)();
  this.master=c.createGain();this.master.gain.value=this.muted?0:.6;const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=3;this.master.connect(comp);comp.connect(c.destination);
  const ir=c.createBuffer(2,c.sampleRate*1.8,c.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3)}
  this.rev=c.createConvolver();this.rev.buffer=ir;const rg=c.createGain();rg.gain.value=.22;this.rev.connect(rg);rg.connect(this.master);
  this.mus=c.createGain();this.mus.gain.value=.5;this.mus.connect(this.master);this.mus.connect(this.rev);this.fx=c.createGain();this.fx.gain.value=.9;this.fx.connect(this.master);this.fx.connect(this.rev);
  const nb=c.createBuffer(1,c.sampleRate*2,c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;this.nbuf=nb;
  this.startMusic();this.startAmbient()}catch(e){}},
 setMuted(m){this.muted=m;localStorage.setItem('fs_muted',m?'1':'0');if(this.master)this.master.gain.setTargetAtTime(m?0:.6,this.ctx.currentTime,.05)},
 env(g,t,a,d,v){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0008,t+a+d)},
 tone(f,d=.15,type='sine',v=.2,at=0,slide=0,dest,abs){const c=this.ctx;if(!c)return;const t=abs!=null?abs:c.currentTime+at,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  this.env(g,t,.008,d,v);o.connect(g);g.connect(dest||this.fx);o.start(t);o.stop(t+d+.05)},
 noise(d=.3,v=.15,f=800,at=0,type='bandpass',dest,abs,q=1.2){const c=this.ctx;if(!c)return;const t=abs!=null?abs:c.currentTime+at;
  const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nbuf;fl.type=type;fl.frequency.value=f;fl.Q.value=q;this.env(g,t,.003,d,v);s.connect(fl);fl.connect(g);g.connect(dest||this.fx);s.start(t,Math.random()*1.5);s.stop(t+d+.05)},
 // ---- instruments (all music goes to this.mus) ----
 pluck(f,t,v=.1,bright=6,dec=.35,type='triangle'){const c=this.ctx,o=c.createOscillator(),o2=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain(),g2=c.createGain();o.type=type;o2.type='sawtooth';o.frequency.value=f;o2.frequency.value=f*1.003;g2.gain.value=.3;
  fl.type='lowpass';fl.frequency.setValueAtTime(f*bright,t);fl.frequency.exponentialRampToValueAtTime(f*1.1,t+dec*.6);o.connect(fl);o2.connect(g2);g2.connect(fl);fl.connect(g);this.env(g,t,.003,dec,v);g.connect(this.mus);o.start(t);o2.start(t);o.stop(t+dec+.1);o2.stop(t+dec+.1)},
 harp(f,t,v=.07){this.pluck(f,t,v,8,1.1,'sine')},
 guitar(ch,t,v=.05,down=1){const o=down?ch:[...ch].reverse();o.forEach((f,i)=>this.pluck(f,t+i*.014,v,5,.6))},
 bass(f,t,d,v=.16){const c=this.ctx,o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();o.type='triangle';o.frequency.value=f;fl.type='lowpass';fl.frequency.value=500;this.env(g,t,.01,d,v);o.connect(fl);fl.connect(g);g.connect(this.mus);o.start(t);o.stop(t+d+.05)},
 marimba(f,t,v=.1){const c=this.ctx;[[1,1],[4,.25],[10,.05]].forEach(([m,a])=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f*m;this.env(g,t,.003,m>1?.1:.45,v*a);o.connect(g);g.connect(this.mus);o.start(t);o.stop(t+.55)})},
 steel(f,t,v=.08){const c=this.ctx;[[1,1],[2,.5],[2.98,.25],[4.1,.12]].forEach(([m,a])=>{const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(f*m*1.01,t);o.frequency.exponentialRampToValueAtTime(f*m,t+.05);this.env(g,t,.004,.5,v*a);o.connect(g);g.connect(this.mus);o.start(t);o.stop(t+.6)})},
 blow(f,t,d,v=.05,breath=.012,vib=5.2){const c=this.ctx,o=c.createOscillator(),lf=c.createOscillator(),lg=c.createGain(),g=c.createGain();o.frequency.value=f;lf.frequency.value=vib;lg.gain.value=f*.006;lf.connect(lg);lg.connect(o.frequency);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.07);g.gain.setValueAtTime(v,t+d*.7);g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);g.connect(this.mus);o.start(t);lf.start(t);o.stop(t+d+.05);lf.stop(t+d+.05);this.noise(Math.min(.15,d),breath,f*2.2,0,'bandpass',this.mus,t,3)},
 oboe(f,t,d,v=.035){const c=this.ctx,o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=f;fl.type='bandpass';fl.frequency.value=f*3;fl.Q.value=2;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.1);g.gain.linearRampToValueAtTime(0,t+d);o.connect(fl);fl.connect(g);g.connect(this.mus);o.start(t);o.stop(t+d+.05)},
 strings(ch,t,d,v=.018){const c=this.ctx;ch.forEach(f=>[0.997,1.003].forEach(dt=>{const o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.value=f*dt;fl.type='lowpass';fl.frequency.value=1800;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+d*.4);g.gain.linearRampToValueAtTime(0,t+d);o.connect(fl);fl.connect(g);g.connect(this.mus);o.start(t);o.stop(t+d+.05)}))},
 drum(f,t,v=.2,dec=.15,end=.4){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*end,t+dec);this.env(g,t,.002,dec,v);o.connect(g);g.connect(this.mus);o.start(t);o.stop(t+dec+.05)},
 shaker(t,v=.025){this.noise(.05,v,8000,0,'highpass',this.mus,t)},
 // ---- music styles per zone ----
 style(){const z=(window.S&&S.zone)||'',b=this.biome;if(!window.S||!S.fauna||!S.fauna.length)return'title';
  if(z==='amelia'||b==='night')return'night';if(['rockgarden','rockisland','ruins','dungeon','bogs'].includes(z))return'tribal';if(['isthmus'].includes(z)||b==='scorch')return'tropical';return'hub'},
 startMusic(){const c=this.ctx,R=261.63,st=s=>R*Math.pow(2,s/12);let next=c.currentTime+.15,step=0,cur='';
  const P={ // chord roots (semitones from C) & qualities
   hub:{bpm:96,prog:[[0,4,7],[5,9,12],[9,12,16],[7,11,14]]},
   title:{bpm:66,prog:[[2,6,9],[7,11,14],[11,14,18],[9,13,16]]},
   tribal:{bpm:108,prog:[[9,12,16],[9,12,16],[7,10,14],[5,9,12]]},
   tropical:{bpm:118,prog:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]]},
   night:{bpm:60,prog:[[5,9,12],[0,4,7],[9,12,16],[7,11,14]]}};
  const melHub=[16,null,19,null,16,14,12,null,14,null,16,null,12,null,null,null],melTri=[21,null,24,21,19,null,16,null,19,21,null,16,14,null,12,null],melTro=[12,16,19,16,21,19,16,null,17,21,24,21,19,null,16,null];
  const sched=()=>{if(!this.ctx)return;const s=this.style();if(s!==cur){cur=s;step=0}const p=P[s],e=60/p.bpm/2;
   while(next<c.currentTime+.3){if(!this.muted&&!document.hidden){const bar=Math.floor(step/8)%p.prog.length,b=step%8,ch=p.prog[bar],t=next,phrase=Math.floor(step/32)%2;
    if(s==='hub'){ // cozy acoustic guitar strum, acoustic bass, marimba accents, shaker/congas
     if([0,3,4,6].includes(b))this.guitar(ch.map(x=>st(x)),t,.035,b!==3);
     if(b===0||b===5)this.bass(st(ch[0]-24),t,e*2.5);if(b===4)this.bass(st(ch[2]-24),t,e*1.5,.12);
     this.shaker(t,b%2?.03:.018);if(b===2||b===7)this.drum(320,t,.08,.12,.8);if(b===6)this.drum(220,t,.09,.15,.8);
     const m=melHub[step%16];if(m!=null&&phrase)this.marimba(st(m),t,.08)}
    else if(s==='tribal'){ // mysterious: driving bass, bongo/djembe, pan flute
     this.bass(st(ch[0]-24),t,e*.9,b%2?.1:.16);
     if([0,3,6].includes(b))this.drum(110,t,.22,.2,.5);if([2,5,7].includes(b))this.drum(420,t,.09,.08,.85);if(b===4)this.drum(300,t,.12,.1,.8);
     const m=melTri[step%16];if(m!=null&&(step%32)<16)this.blow(st(m),t,e*1.8,.045,.03,4.5);if(b===0&&phrase)this.strings([st(ch[0]-12),st(ch[1]-12)],t,e*8,.012)}
    else if(s==='tropical'){ // bouncy steel drums, bright marimba chords, shaker/guiro
     const m=melTro[step%16];if(m!=null)this.steel(st(m),t,.07);if(b===2||b===6)ch.forEach(x=>this.marimba(st(x),t,.035));
     if(b%4===0)this.bass(st(ch[0]-24),t,e*1.5);if(b%4===3)this.bass(st(ch[2]-24),t,e,.12);this.shaker(t,.025);if(b===4)for(let k=0;k<4;k++)this.noise(.015,.03,3500,0,'bandpass',this.mus,t+k*.02,4)}
    else if(s==='title'){ // slow orchestral strings, oboe/flute melody, harp plucks
     if(b===0)this.strings(ch.map(x=>st(x-12)),t,e*8.2);this.harp(st(ch[b%3]+(b>3?12:0)),t,.05);
     if(b===0)(phrase?this.oboe:this.blow).call(this,st(ch[2]+12),t,e*3.5,phrase?.03:.04);if(b===4)(phrase?this.oboe:this.blow).call(this,st(ch[1]+12),t,e*3.5,phrase?.03:.04)}
    else{ // night: gentle harp + soft strings
     if(b%2===0)this.harp(st(ch[(b/2)%3]+12),t,.045);if(b===0)this.strings(ch.map(x=>st(x-12)),t,e*8.2,.01)}}
    next+=e;step++}};this.musicT=setInterval(sched,60)},
 // ---- ambient loops: incubation heartbeat, idle creature "hmm?" ----
 startAmbient(){setInterval(()=>{if(!this.ctx||this.muted||document.hidden||!window.S)return;
   if(S.zone==='home'&&S.home&&S.home.nest&&S.home.nest.egg&&S.home.nest.inc!=null)this.sfx('heartbeat');
   if(S.fauna&&S.fauna.length&&Math.random()<.04)this.sfx('hmm')},1100)},
 // sustained crackling zap — call zapHold(true) each frame while the beam is active
 zapHold(on){const c=this.ctx;if(!c)return;if(on&&!this.muted){if(!this._zap){const s=c.createBufferSource(),hp=c.createBiquadFilter(),bp=c.createBiquadFilter(),g=c.createGain(),am=c.createGain(),o=c.createOscillator(),og=c.createGain();
    s.buffer=this.nbuf;s.loop=true;hp.type='highpass';hp.frequency.value=2200;bp.type='peaking';bp.frequency.value=4200;bp.gain.value=8;o.type='sawtooth';o.frequency.value=110;og.gain.value=.025;
    s.connect(hp);hp.connect(bp);bp.connect(am);o.connect(og);og.connect(am);am.connect(g);g.gain.value=0;g.gain.linearRampToValueAtTime(.16,c.currentTime+.03);g.connect(this.fx);s.start();o.start();
    this._zap={s,o,g,am,iv:setInterval(()=>{am.gain.setValueAtTime(Math.random()<.35?.15:1,c.currentTime);bp.frequency.setValueAtTime(2500+Math.random()*4000,c.currentTime);o.frequency.setValueAtTime(90+Math.random()*60,c.currentTime)},28)}}
   clearTimeout(this._zapT);this._zapT=setTimeout(()=>this.zapHold(false),150)}
  else if(this._zap){const z=this._zap;this._zap=null;clearInterval(z.iv);z.g.gain.setTargetAtTime(0,c.currentTime,.03);z.s.stop(c.currentTime+.2);z.o.stop(c.currentTime+.2)}},
 voice(f0,f1,d,v=.06,nasal=1){const c=this.ctx,t=c.currentTime,o=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain(),lf=c.createOscillator(),lg=c.createGain();o.type=nasal?'sawtooth':'triangle';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+d);
  lf.frequency.value=7;lg.gain.value=f0*.03;lf.connect(lg);lg.connect(o.frequency);fl.type='bandpass';fl.frequency.value=nasal?1400:600;fl.Q.value=nasal?4:1.5;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.04);g.gain.linearRampToValueAtTime(0,t+d);
  o.connect(fl);fl.connect(g);g.connect(this.fx);o.start(t);lf.start(t);o.stop(t+d+.05);lf.stop(t+d+.05)},
 surface(){const z=window.S&&S.zone,b=this.biome;if(['rockisland','ruins','dungeon','rockgarden'].includes(z)||b==='rock'||b==='arctic')return'stone';if(b==='scorch'||z==='isthmus')return'sand';return'grass'},
 sfx(n){if(!this.ctx||this.muted)return;const T=(f,d,ty,v,at,sl)=>this.tone(f,d,ty,v,at,sl),N=(d,v,f,at,ty,q)=>this.noise(d,v,f,at,ty,null,null,q);({
  zap:()=>{T(1600,.12,'sawtooth',.06,0,.3);for(let k=0;k<8;k++)N(.02+Math.random()*.03,.12,3000+Math.random()*3500,k*.03,'highpass');this.zapHold(true)},
  pop:()=>{T(300,.16,'sine',.26,0,3);N(.06,.05,1800)}, // pollution clears
  drop:()=>{T(220,.14,'sine',.28,0,3.5);T(440,.1,'triangle',.06,.02,2.5)}, // rubbery bloop, sharply rising
  coin:()=>{T(1568,.25,'sine',.1);T(2093,.4,'sine',.08,.06);T(3136,.3,'sine',.03,.06)},
  fanfare:()=>{ // ~2s "da-da-da-DAAA": rising sparkle, then synth brass + bell chords
   for(let k=0;k<8;k++)T(1200+k*220,.12,'sine',.04,k*.035);const br=(f,a,d,v)=>{T(f,d,'sawtooth',v,a);T(f*1.005,d,'sawtooth',v*.6,a);T(f/2,d,'triangle',v,a)};
   [[523,.3],[523,.45],[523,.6]].forEach(([f,a])=>br(f,a,.12,.05));br(784,.78,1.1,.06);br(659,.78,1.1,.04);br(523,.78,1.1,.04);
   [1047,1319,1568,2093].forEach((f,i)=>T(f,1.3,'sine',.05,.78+i*.02));N(.9,.025,7000,.78,'highpass')},
  level:()=>this.sfx('fanfare'),goal:()=>this.sfx('fanfare'),hatch:()=>{this.sfx('fanfare');setTimeout(()=>this.sfx('newborn'),1400)},
  click:()=>{T(1760,.08,'sine',.08);T(2637,.06,'sine',.03,.01)}, // bright chime
  whoosh:()=>{const c=this.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.nbuf;f.type='bandpass';f.Q.value=.8;f.frequency.setValueAtTime(3000,t);f.frequency.exponentialRampToValueAtTime(500,t+.22);this.env(g,t,.04,.2,.09);s.connect(f);f.connect(g);g.connect(this.fx);s.start(t,Math.random());s.stop(t+.3)},
  boing:()=>{const c=this.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain(),l=c.createOscillator(),lg=c.createGain();o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(520,t+.25);l.frequency.value=18;lg.gain.value=40;l.connect(lg);lg.connect(o.frequency);this.env(g,t,.005,.3,.12);o.connect(g);g.connect(this.fx);o.start(t);l.start(t);o.stop(t+.35);l.stop(t+.35)},
  gate:()=>{N(.9,.1,400);T(220,.9,'sine',.1,0,4);T(440,.9,'triangle',.04,.1,3)},
  eat:()=>{for(let k=0;k<7;k++){N(.035,.12,1200+Math.random()*2500,k*.07+Math.random()*.02,'bandpass',.8);T(140+Math.random()*60,.03,'square',.03,k*.07)}setTimeout(()=>this.sfx('trill'),550)}, // rapid crunchy munching
  dig:()=>{for(let k=0;k<6;k++)N(.09,.09,700+Math.random()*900,k*.1,'bandpass',.6)}, // scratchy dirt scrape
  skill:()=>{this.sfx('dig');T(784,.1,'triangle',.1,.6);T(1175,.25,'triangle',.1,.68)},
  hurt:()=>this.sfx('growl'),
  egg:()=>this.sfx('drop'),
  heartbeat:()=>{T(70,.12,'sine',.22,0,.6);T(62,.12,'sine',.17,.22,.6)}, // low thump-thump
  step:()=>{const s=this.surface();if(s==='grass')N(.05,.06,260+Math.random()*80,0,'lowpass');else if(s==='stone'){T(900+Math.random()*300,.03,'triangle',.05);N(.02,.05,3200,0,'bandpass',3)}else N(.09,.04,5000+Math.random()*1500,0,'highpass')},
  type:()=>N(.015,.06,2500,0,'bandpass',4),
  newborn:()=>this.voice(1300,800,.55,.05),hmm:()=>this.voice(420,640,.35,.035),moan:()=>this.voice(260,140,.7,.05,0),
  trill:()=>{for(let k=0;k<5;k++)setTimeout(()=>this.voice(1100+k*120,1500+k*150,.07,.035,0),k*65)},
  growl:()=>{this.voice(140,60,.6,.08);N(.5,.06,200,0,'lowpass')}}[n]||(()=>{}))()}};

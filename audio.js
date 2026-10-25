// Code-generated sound effects + ambient music (WebAudio). No audio files.
const Sound={ctx:null,master:null,muted:localStorage.getItem('fs_muted')==='1',musicT:null,biome:'home',
 init(){if(this.ctx)return;try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=this.muted?0:.5;this.master.connect(this.ctx.destination);this.startMusic()}catch(e){}},
 setMuted(m){this.muted=m;localStorage.setItem('fs_muted',m?'1':'0');if(this.master)this.master.gain.value=m?0:.5},
 tone(f,d=.15,type='sine',v=.2,at=0,slide=0){const c=this.ctx;if(!c)return;const t=c.currentTime+at,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide),t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+d+.05)},
 noise(d=.3,v=.15,f=800){const c=this.ctx;if(!c)return;const b=c.createBuffer(1,c.sampleRate*d,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain();s.buffer=b;fl.type='bandpass';fl.frequency.setValueAtTime(f,c.currentTime);fl.frequency.exponentialRampToValueAtTime(f*4,c.currentTime+d);g.gain.setValueAtTime(v,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+d);s.connect(fl);fl.connect(g);g.connect(this.master);s.start()},
 sfx(n){if(!this.ctx)return;({zap:()=>{this.tone(900,.18,'sawtooth',.08,0,.3);this.tone(1400,.1,'square',.04,0,.5)},pop:()=>{this.tone(500,.12,'sine',.25,0,2.2);this.noise(.15,.08,1200)},
  coin:()=>{this.tone(988,.08,'square',.06);this.tone(1319,.25,'square',.06,.07)},level:()=>[523,659,784,1047].forEach((f,i)=>this.tone(f,.3,'triangle',.18,i*.1)),
  click:()=>this.tone(700,.05,'sine',.12),gate:()=>{this.noise(.8,.15,300);this.tone(300,.8,'sine',.12,0,3)},eat:()=>[0,.1,.2].forEach(a=>this.tone(300+Math.random()*200,.07,'square',.06,a)),
  skill:()=>{this.tone(660,.1,'triangle',.15);this.tone(880,.2,'triangle',.15,.08)},hurt:()=>this.tone(220,.25,'sawtooth',.08,0,.5),egg:()=>[784,988,1175,1568].forEach((f,i)=>this.tone(f,.2,'sine',.15,i*.08)),
  step:()=>this.tone(140+Math.random()*30,.05,'sine',.05)}[n]||(()=>{}))()},
 startMusic(){const scales={home:[0,2,4,7,9],garden:[0,2,4,7,9],rock:[0,2,5,7,9],forest:[0,3,5,7,10],arctic:[0,2,4,7,11],scorch:[0,1,5,7,8],swamp:[0,3,5,6,10],dungeon:[0,1,3,7,8]};
  let step=0;this.musicT=setInterval(()=>{if(this.muted||!this.ctx||document.hidden)return;const sc=scales[this.biome]||scales.home,base=this.biome==='dungeon'?196:262;
   if(step%8===0)this.tone(base/2*Math.pow(2,sc[Math.floor(Math.random()*3)]/12),2.6,'triangle',.05);
   if(Math.random()<.55){const n=sc[Math.floor(Math.random()*sc.length)]+(Math.random()<.3?12:0);this.tone(base*Math.pow(2,n/12),.9,'sine',.045)}step++},380)}};

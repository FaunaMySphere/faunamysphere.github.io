// pvp.js (v6.16) PvP battles (Leo): challenge -> accept only, in shared public zones. Challenger is authoritative for HP;
// defender sends attack/dodge inputs which are rate- and damage-checked on both sides. Loser goes home via the faint flow.
// Save: S.pvp={w,l,tie,block,rw:[timestamps]} (safe defaults). Nothing ever writes to the other player's save.
(function(){
const ES=()=>window.LANG==='es',tr=(en,es)=>ES()?es:en;
const CD={zap:700,special:8000,dodge:5000},DMG={zap:[8,12],special:[20,24]},MAXHIT=25,DUR=60000,PRE=3000,GRACE=8000,ASK_T=15000,DODGE_MS=900;
const XP_WIN=150,LUX_WIN=20,REW_PER_HR=5;
const P=()=>{if(!S.pvp||typeof S.pvp!=='object')S.pvp={w:0,l:0,tie:0,block:false,rw:[]};const p=S.pvp;p.w|=0;p.l|=0;p.tie|=0;p.block=!!p.block;if(!Array.isArray(p.rw))p.rw=[];return p};
const NM=()=>window.NetMP,send=m=>{try{NM().send(m)}catch(e){}};
const pub=z=>z&&z!=='home'&&z!=='visit'&&!/^home/.test(z);
const canHere=()=>pub(S.zone)&&!window.__faint&&!(window.FSVisit&&FSVisit.active);
const myLv=()=>{const f=fa();return f?Math.max(1,f.level|0):1};
const maxHP=lv=>100+3*Math.min(30,Math.max(1,lv|0));
const rnd=([a,b])=>a+Math.floor(Math.random()*(b-a+1));
let B=null,ask=null,out=null,lastDone=0;
const peer=id=>NM()&&NM().peers.get(id);
const pname=id=>{const p=peer(id);return p?(p.name||'?'):(B&&B.oname)||'?'};
const sameZone=id=>{const p=peer(id);return !!(p&&NM().zk&&p.zk===NM().zk())};
// ---------- challenge ----------
function challenge(id){if(B||out)return toast('⚔️ '+tr('You are already in a battle.','Ya estás en una batalla.'));
 if(!canHere())return toast('⚔️ '+tr('Battles only happen in shared worlds, not at home.','Las batallas solo ocurren en mundos compartidos, no en casa.'));
 if(!sameZone(id))return toast(tr('That player is not in this zone.','Ese jugador no está en esta zona.'));
 const bid=NM().myId+'-'+Date.now().toString(36);out={bid,to:id,at:Date.now()};
 send({t:'pvpAsk',to:id,bid,lv:myLv(),zone:S.zone});toast('⚔️ '+tr('Challenge sent to ','Desafío enviado a ')+pname(id)+'…');
 setTimeout(()=>{if(out&&out.bid===bid){out=null;toast('⚔️ '+pname(id)+tr(' did not answer.',' no respondió.'))}},ASK_T+2000)}
function onAsk(m){const busy=B||ask||out;if(P().block||busy||!canHere()||!sameZone(m.id)){send({t:'pvpAns',to:m.id,bid:m.bid,ok:false,why:P().block?'block':busy?'busy':'zone'});return}
 ask={bid:m.bid,from:m.id,lv:m.lv|0,at:Date.now()};try{Sound.sfx('hmm')}catch(e){}
 let d=document.getElementById('pvpask');if(!d){d=document.createElement('div');d.id='pvpask';document.body.appendChild(d)}
 d.innerHTML='<div class="pvpcard"><b>⚔️ '+esc(pname(m.id))+tr(' challenges you to a battle!',' te reta a una batalla!')+'</b><div class="small">'+tr('Loser is sent home. 60 seconds.','Quien pierda vuelve a casa. 60 segundos.')+'</div><div class="pvpt" id="pvpaskt">15</div><button class="btn" id="pvpacc">✅ '+tr('Accept','Aceptar')+'</button> <button class="btn" id="pvpdec">❌ '+tr('Decline','Rechazar')+'</button></div>';
 d.style.display='flex';document.getElementById('pvpacc').onclick=()=>answer(true);document.getElementById('pvpdec').onclick=()=>answer(false);
 const bid=m.bid,iv=setInterval(()=>{if(!ask||ask.bid!==bid){clearInterval(iv);return}const s=Math.ceil((ASK_T-(Date.now()-ask.at))/1000);const el=document.getElementById('pvpaskt');if(el)el.textContent=Math.max(0,s);if(s<=0){clearInterval(iv);answer(false,'timeout')}},250)}
function hideAsk(){const d=document.getElementById('pvpask');if(d)d.style.display='none'}
function answer(ok,why){if(!ask)return;const a=ask;ask=null;hideAsk();
 if(ok&&(!canHere()||!sameZone(a.from))){ok=false;why='zone';toast(tr('Battle cancelled: you are not in the same shared zone.','Batalla cancelada: no están en la misma zona compartida.'))}
 send({t:'pvpAns',to:a.from,bid:a.bid,ok,why:why||(ok?'':'declined'),lv:myLv()});
 if(ok){B=mk('df',a.from,a.bid);B.max=[maxHP(a.lv),maxHP(myLv())];B.hp=B.max.slice();B.pending=true;toast('⚔️ '+tr('Battle accepted! Get ready…','¡Batalla aceptada! Prepárate…'));
  setTimeout(()=>{if(B&&B.pending&&B.bid===a.bid){end('none','nostart')}},6000)}
 else if(why!=='timeout')toast(tr('Challenge declined.','Desafío rechazado.'))}
function onAns(m){if(!out||out.bid!==m.bid||m.id!==out.to)return;out=null;
 if(!m.ok){const w=m.why;return toast('⚔️ '+pname(m.id)+(w==='block'?tr(' is not accepting battles.',' no acepta batallas.'):w==='busy'?tr(' is busy.',' está ocupado.'):w==='zone'?tr(' is not in a shared zone.',' no está en una zona compartida.'):tr(' declined the battle.',' rechazó la batalla.')))}
 if(!canHere()||B)return send({t:'pvpEnd',to:m.id,bid:m.bid,win:'none',why:'cancel'});
 B=mk('ch',m.id,m.bid);B.max=[maxHP(myLv()),maxHP(m.lv)];B.hp=B.max.slice();B.t0=Date.now()+PRE;
 send({t:'pvpGo',to:m.id,bid:m.bid,max:B.max,pre:PRE,dur:DUR});begin()}
function mk(role,opp,bid){return{role,opp,bid,oname:pname(opp),me:role==='ch'?0:1,op:role==='ch'?1:0,last:{zap:0,special:0,dodge:0},olast:{zap:0,special:0,dodge:0},odge:0,mdge:0,seen:Date.now(),seq:0,t0:0,fin:false}}
function onGo(m){if(!B||B.bid!==m.bid||m.id!==B.opp||B.role!=='df')return;B.pending=false;
 const mx=(m.max||[]).map(x=>Math.min(250,Math.max(50,x|0)));B.max=mx;B.hp=mx.slice();B.t0=Date.now()+Math.min(5000,m.pre|0);begin()}
// ---------- battle ----------
function begin(){B.seen=Date.now();ui();try{Sound.sfx('fanfare')}catch(e){}B.iv=setInterval(loop,100);B.hb=setInterval(()=>{if(B)send({t:'pvpHb',to:B.opp,bid:B.bid})},2000)}
function act(kind){if(!B||B.fin||Date.now()<B.t0)return;const n=Date.now();if(n-B.last[kind]<CD[kind])return;
 if(kind==='special'&&!(S.tricks||[]).length)return toast(tr('Learn a trick first!','¡Aprende un truco primero!'));B.last[kind]=n;
 if(kind==='dodge'){B.mdge=n;try{rt.trick={k:'jump',t0:now()}}catch(e){}try{Sound.sfx('whoosh')}catch(e){}send({t:'pvpAct',to:B.opp,bid:B.bid,k:'dodge'});return}
 // attack visuals on my side
 try{rt.zapT=now()}catch(e){}if(kind==='special'){try{const k=(S.tricks||[])[0];rt.trick={k:S.tricks.includes('spin')?'spin':k,t0:now()}}catch(e){}}
 const p=peer(B.opp);try{if(p)G.emit('hit',{i:p.i,j:p.j})}catch(e){}
 if(B.role==='ch')hit(B.op,kind,n);else send({t:'pvpAct',to:B.opp,bid:B.bid,k:kind})}
// authoritative damage (challenger only)
function hit(who,kind,n){if(!B||B.fin)return;const dodging=who===B.me?(n-B.mdge<DODGE_MS):(n-B.odge<DODGE_MS);let d=dodging?0:Math.min(MAXHIT,rnd(DMG[kind]));
 B.hp[who]=Math.max(0,B.hp[who]-d);B.seq++;send({t:'pvpSt',to:B.opp,bid:B.bid,hp:B.hp,sq2:B.seq,ev:{who,d,k:kind}});fxHit(who,d,kind);
 if(B.hp[who]<=0)finish(who===0?'df':'ch','ko')}
function onAct(m){if(!B||B.bid!==m.bid||m.id!==B.opp)return;B.seen=Date.now();const n=Date.now(),k=m.k;if(!CD[k]||n<B.t0-300)return;
 if(n-B.olast[k]<CD[k]*0.8){console.log('[pvp] rejected fast input',k);return}B.olast[k]=n;
 if(k==='dodge'){B.odge=n;const p=peer(B.opp);if(p)p.trick={k:'jump',t0:now()};return}
 if(k==='special'){const p=peer(B.opp);if(p)p.trick={k:'spin',t0:now()}}
 if(B.role==='ch')hit(B.me,k,n)}
function onSt(m){if(!B||B.bid!==m.bid||m.id!==B.opp||B.role!=='df')return;B.seen=Date.now();if(!Array.isArray(m.hp)||(m.sq2|0)<=B.seq)return;
 const nh=m.hp.map(x=>+x);for(let i=0;i<2;i++){if(!(nh[i]>=0&&nh[i]<=B.hp[i]))return console.log('[pvp] rejected hp');if(B.hp[i]-nh[i]>MAXHIT*Math.max(1,(m.sq2|0)-B.seq))return console.log('[pvp] rejected dmg')}
 B.seq=m.sq2|0;B.hp=nh;if(m.ev)fxHit(m.ev.who,Math.min(MAXHIT,m.ev.d|0),m.ev.k);if(m.ev&&m.ev.who===B.op){const p=peer(B.opp);if(p&&m.ev.k){}}}
function fxHit(who,d,k){if(who===B.me){try{rt.shake=5;rt.happyT=0;Sound.noise&&Sound.noise(.2,.1,1800)}catch(e){}float(who,d?'-'+d:tr('Dodged!','¡Esquivado!'),d?'#ff6a6a':'#9fe8ff')}
 else{const p=peer(B.opp);try{if(p&&B.role==='df')G.emit('hit',{i:p.i,j:p.j})}catch(e){}float(who,d?'-'+d:tr('Dodged!','¡Esquivado!'),d?'#ffe25a':'#9fe8ff')}}
function loop(){if(!B)return;const n=Date.now();
 if(!B.fin){ // forfeits
  const gone=!peer(B.opp)||!sameZone(B.opp);if(gone||n-B.seen>GRACE){B.goneAt=B.goneAt||n;if(n-B.goneAt>(gone?5000:0)||n-B.seen>GRACE){if(B.role==='ch')finish('ch','forfeit');else end('df','forfeit')}}else B.goneAt=0;
  if(!canHere()&&!B.fin){send({t:'pvpEnd',to:B.opp,bid:B.bid,win:B.role==='ch'?'df':'ch',why:'left'});end(B.role==='ch'?'df':'ch','left');return}
  if(B.role==='ch'&&n>B.t0+DUR){const[a,b]=B.hp;finish(a>b?'ch':b>a?'df':'none','time')}}
 draw()}
function finish(win,why){if(!B||B.fin)return;send({t:'pvpEnd',to:B.opp,bid:B.bid,win,why,hp:B.hp});end(win,why)}
function onEnd(m){if(!B||B.bid!==m.bid||m.id!==B.opp)return;
 let win=m.win;if(B.role==='df'&&m.why==='ko'&&Array.isArray(m.hp)){if(win==='df'&&B.hp[0]>MAXHIT*2)win='none'} // sanity: impossible KO claim
 end(win,m.why||'')}
function end(win,why){if(!B||B.fin)return;B.fin=true;const mine=B.role,opp=B.opp,on=B.oname;clearInterval(B.iv);clearInterval(B.hb);
 const p=P();
 if(win==='none'){p.tie++;toast('🤝 '+tr('Battle over: it\'s a tie! Nobody is sent home.','Batalla terminada: ¡empate! Nadie vuelve a casa.'))}
 else if(win===mine){p.w++;victory(on,why)}
 else{p.l++;lose(why)}
 try{save()}catch(e){}lastDone=Date.now();setTimeout(()=>{B=null;draw()},win===mine?2600:200);draw()}
function victory(on,why){const p=P(),n=Date.now();p.rw=p.rw.filter(t=>n-t<3600e3);let rew='';
 if(p.rw.length<REW_PER_HR){p.rw.push(n);try{S.player.lux=(S.player.lux|0)+LUX_WIN}catch(e){}setTimeout(()=>{try{window.PLV&&PLV.gain(XP_WIN)}catch(e){}},3400);rew=' +'+LUX_WIN+' Lux · +'+XP_WIN+' XP'}
 else rew=' '+tr('(reward limit reached this hour)','(límite de premios alcanzado esta hora)');
 banner('🏆 '+tr('VICTORY!','¡VICTORIA!'),(why==='forfeit'||why==='left'?tr(on+' left the battle.',on+' abandonó la batalla.'):tr('You beat ','Venciste a ')+on+'!')+rew);
 jingle([523,659,784,1047,1319]);try{rt.trick={k:(S.tricks||[]).includes('dance')?'dance':'jump',t0:now()};rt.happyT=now()}catch(e){}try{renderHUD()}catch(e){}}
const LOSE='You lost the battle and were sent home';
try{Object.assign(window.I18N_ES||{},{[LOSE]:'Perdiste la batalla y fuiste enviado a casa'})}catch(e){}
function lose(why){const f=fa();window.__faint=1;try{Sound.sfx('moan')}catch(e){}try{rt.trick={k:'sleep',t0:now()};rt.say={text:'💫',at:now()}}catch(e){}
 try{send({t:'trick',k:'sleep'})}catch(e){}toast('💫 '+tr(LOSE,'Perdiste la batalla y fuiste enviado a casa'));banner('💫 '+tr('Defeated','Derrota'),tr(LOSE,'Perdiste la batalla y fuiste enviado a casa'));try{document.getElementById('pvpwin').classList.add('lose')}catch(e){}
 setTimeout(()=>{try{rt.trick=null}catch(e){}if(f)f.happiness=Math.max(f.happiness,25);
  try{if(window.FSgo)FSgo('home');else R.travel({zone:'home'})}catch(e){try{R.travel({zone:'home'})}catch(_){}}try{save()}catch(e){}
  setTimeout(()=>{window.__faint=0},2500)},1400)}
function jingle(fr){try{if(!Sound.ctx||Sound.muted)return;fr.forEach((f,i)=>setTimeout(()=>Sound.tone(f,.22,'triangle',.06),i*130))}catch(e){}}
function banner(a,b){let d=document.getElementById('pvpwin');if(!d){d=document.createElement('div');d.id='pvpwin';document.body.appendChild(d)}d.innerHTML='<b>'+a+'</b><div>'+esc(b)+'</div>';d.classList.remove('on','lose');void d.offsetWidth;d.classList.add('on');clearTimeout(banner.t);banner.t=setTimeout(()=>d.classList.remove('on'),3200)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// ---------- UI ----------
let fl=[];function float(who,txt,col){fl.push({who,txt,col,at:Date.now()})}
function ui(){let d=document.getElementById('pvpbar');if(!d){d=document.createElement('div');d.id='pvpbar';document.body.appendChild(d);
  d.innerHTML='<div id="pvptime"></div><button class="btn pvpb" data-k="zap">⚡ '+tr('Attack','Atacar')+'</button><button class="btn pvpb" data-k="dodge">🌀 '+tr('Dodge','Esquivar')+'</button><button class="btn pvpb" data-k="special">✨ '+tr('Trick','Truco')+'</button>';
  d.querySelectorAll('.pvpb').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();act(b.dataset.k)}))}
 let o=document.getElementById('pvplay');if(!o){o=document.createElement('div');o.id='pvplay';o.innerHTML='<div id="pvpring"></div><div class="pvphp" id="pvphp0"><i></i><span></span></div><div class="pvphp" id="pvphp1"><i></i><span></span></div><div id="pvpfl"></div>';document.body.appendChild(o)}}
function draw(){const bar=document.getElementById('pvpbar'),lay=document.getElementById('pvplay');if(!B){if(bar)bar.style.display='none';if(lay)lay.style.display='none';return}
 if(!bar||!lay)ui();const n=Date.now();document.getElementById('pvpbar').style.display=B.fin?'none':'flex';document.getElementById('pvplay').style.display='block';
 const tt=document.getElementById('pvptime');tt.textContent=n<B.t0?tr('Get ready… ','Prepárate… ')+Math.ceil((B.t0-n)/1000):'⏱ '+Math.max(0,Math.ceil((B.t0+DUR-n)/1000))+'s';
 document.querySelectorAll('#pvpbar .pvpb').forEach(b=>{const k=b.dataset.k,r=CD[k]-(n-B.last[k]);b.disabled=n<B.t0||r>0;b.style.setProperty('--cd',r>0?(r/CD[k]):0)});
 const p=peer(B.opp),proj=window.projTile;if(!proj)return;const cv=document.getElementById('cv')||document.querySelector('canvas'),r=cv?cv.getBoundingClientRect():{left:0,top:0};
 const pos=[null,null];pos[B.me]=[rt.pos.i,rt.pos.j];if(p)pos[B.op]=[p.i,p.j];
 const sp=[0,1].map(i=>pos[i]&&proj(pos[i][0],pos[i][1],1.9));if(sp[0]&&sp[1]&&Math.hypot(sp[0][0]-sp[1][0],sp[0][1]-sp[1][1])<40){const L=sp[0][0]<=sp[1][0]?0:1;sp[L]=[sp[L][0]-50,sp[L][1]];sp[1-L]=[sp[1-L][0]+50,sp[1-L][1]]}
 for(let i=0;i<2;i++){const el=document.getElementById('pvphp'+i);if(!pos[i]){el.style.display='none';continue}const[x,y]=sp[i];el.style.display='block';el.style.left=(r.left+x)+'px';el.style.top=(r.top+y)+'px';
  el.firstChild.style.width=(100*B.hp[i]/B.max[i])+'%';el.className='pvphp'+(i===B.me?' me':'');el.lastChild.textContent=(i===B.me?tr('You','Tú'):B.oname)+' '+Math.ceil(B.hp[i])}
 const ring=document.getElementById('pvpring');if(pos[0]&&pos[1]){const ci=(pos[0][0]+pos[1][0])/2,cj=(pos[0][1]+pos[1][1])/2,rad=Math.max(1.6,Math.hypot(pos[0][0]-pos[1][0],pos[0][1]-pos[1][1])/2+1);
  const c=proj(ci,cj,0),a=proj(ci+rad,cj,0),b=proj(ci,cj+rad,0),w=Math.max(60,2*Math.hypot(a[0]-c[0],a[1]-c[1],b[0]-c[0])),h=Math.max(24,2*Math.abs(b[1]-c[1])+2*Math.abs(a[1]-c[1])*.5);
  ring.style.display='block';ring.style.left=(r.left+c[0]-w/2)+'px';ring.style.top=(r.top+c[1]-h/2)+'px';ring.style.width=w+'px';ring.style.height=h+'px'}else ring.style.display='none';
 const fe=document.getElementById('pvpfl');fl=fl.filter(f=>n-f.at<1000);fe.innerHTML=fl.map(f=>{const q=pos[f.who];if(!q)return'';const[x,y]=proj(q[0],q[1],2.3);return '<span style="left:'+(r.left+x)+'px;top:'+(r.top+y-(n-f.at)/25)+'px;color:'+f.col+'">'+esc(f.txt)+'</span>'}).join('')}
setInterval(()=>{if(B)draw()},50);
// ---------- tap a player -> menu ----------
function peerAt(px,py){const N=NM();if(!N||!N.visiblePeers||!window.projTile)return null;let best=null,bd=46;
 for(const p of N.visiblePeers()){const a=projTile(p.i,p.j,.5),b=projTile(p.i,p.j,0);const d=Math.min(Math.hypot(a[0]-px,a[1]-py),Math.hypot(b[0]-px,b[1]-py));if(d<bd){bd=d;best=p}}return best}
function menu(p){const can=canHere()&&!B;const lv=(p.level|0)||1;
 open('<h2>'+esc(p.name)+' & '+esc(p.fname||'')+'</h2><p class="small">Lv '+lv+'</p>'+(can?btn('⚔️ '+tr('Battle','Batalla'),'pvpChallenge',{id:p.id}):'<p class="small">'+(B?tr('You are in a battle.','Estás en una batalla.'):tr('No battles at home or while visiting.','No hay batallas en casa ni de visita.'))+'</p>')+(window.FSPvP.extraMenu?FSPvP.extraMenu(p):''))}
// monsters can't interfere with a battle
function guardDmg(){const ed=window.enemyDmg;if(!ed||ed._pvp)return;const w=function(n){if(B&&!B.fin)return 0;return ed.apply(this,arguments)};w._pvp=1;window.enemyDmg=w}
function boot(){if(typeof S==='undefined'||typeof R==='undefined'||typeof tap!=='function'||!window.NetMP){setTimeout(boot,400);return}P();
 guardDmg();setInterval(guardDmg,3000);R.pvpChallenge=({id})=>{close();challenge(id)};R.pvpBlock=()=>{const p=P();p.block=!p.block;save();toast(p.block?tr('Battle challenges blocked.','Desafíos de batalla bloqueados.'):tr('Battle challenges allowed.','Desafíos de batalla permitidos.'));ui0('friends')};
 const tap0=tap;tap=function(px,py){try{if(!B&&!rt.decor&&canHere()){const p=peerAt(px,py);if(p){setTimeout(()=>menu(p),380);return}}}catch(e){}return tap0.apply(this,arguments)};
 const u1=ui;ui=function(v,p){const r=u1.apply(this,arguments);try{if(v==='friends'||v==='profile')addPanel(v)}catch(e){}return r};
}
function addPanel(v){const box=document.getElementById('mb');if(!box)return;const q=P();
 box.insertAdjacentHTML('beforeend','<div id="pvppanel"><h3>⚔️ '+tr('Battles','Batallas')+'</h3><div class="small">'+tr('Wins','Victorias')+' '+q.w+' · '+tr('Losses','Derrotas')+' '+q.l+' · '+tr('Ties','Empates')+' '+q.tie+'</div>'+(v==='friends'&&canHere()&&!B?[...NetMP.peers.values()].filter(x=>sameZone(x.id)).map(x=>btn('⚔️ '+tr('Battle','Batalla')+' '+esc(x.name),'pvpChallenge',{id:x.id})).join(' '):'')+'<div>'+btn(q.block?'🚫 '+tr('Challenges blocked (tap to allow)','Desafíos bloqueados (toca para permitir)'):'✅ '+tr('Challenges allowed (tap to block)','Desafíos permitidos (toca para bloquear)'),'pvpBlock',{})+'</div></div>')}
function ui0(v){ui(v)}
// leaving page = forfeit
addEventListener('pagehide',()=>{if(B&&!B.fin)send({t:'pvpEnd',to:B.opp,bid:B.bid,win:B.role==='ch'?'df':'ch',why:'left'})});
window.FSPvP={on(m,p){try{({pvpAsk:onAsk,pvpAns:onAns,pvpGo:onGo,pvpAct:onAct,pvpSt:onSt,pvpEnd:onEnd,pvpHb:m=>{if(B&&B.bid===m.bid&&m.id===B.opp)B.seen=Date.now()}}[m.t]||(()=>{}))(m)}catch(e){console.warn('pvp',e)}},
 challenge,menu,peerAt,state:()=>B,canHere,act,_set:o=>Object.assign(B||{},o)};
boot();})();

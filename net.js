'use strict';
// ===== FaunaSphere v5 multiplayer: serverless WebRTC rooms via PeerJS (public broker) =====
// Star topology: the room creator hosts (peer id fsrevival5-CODE) and relays to everyone. If the host leaves, a client re-hosts.
const NET_V=3;const NetMP=window.NetMP={peer:null,room:null,isHost:false,conns:new Map(),peers:new Map(),myId:null,status:'offline',hostConn:null};
NetMP.myId=(()=>{try{let v=localStorage.getItem('fs_mpid');if(!/^u[a-z0-9]{6,12}$/.test(v||'')){v='u'+Math.random().toString(36).slice(2,10);localStorage.setItem('fs_mpid',v)}return v}catch(_){return'u'+Math.random().toString(36).slice(2,10)}})();const WORLD='WORLD';NetMP.WORLD=WORLD;NetMP.isWorld=()=>/^WORLD\d*$/.test(NetMP.room||'');NetMP.shard=()=>NetMP.isWorld()?(+String(NetMP.room).slice(5)||1):0;NetMP.SHARD_MAX=10;NetMP.jt=Date.now();NetMP.homeKey=id=>'home:'+id;const PFX='fsrevival5-',CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from({length:5},()=>CH[Math.floor(Math.random()*CH.length)]).join('');
ZONES.push({id:'visit',name:"Friend's Faunasphere",biome:'home',n:9,tier:0,stations:['gate'],nodes:{},poll:0,props:[],tox:0});
if(S&&S.zone==='visit'){S.zone='home'}
NetMP.zk=()=>S.zone==='visit'?'home:'+(S.v5.visitId||''):S.zone==='home'?'home:'+NetMP.myId:String(S.zone).trim().toLowerCase();
NetMP.visiblePeers=()=>{const zk=NetMP.zk();let q='med';try{q=localStorage.getItem('fs_q')||(new URLSearchParams(location.search).get('q'))||'med'}catch(_){}const cap=q==='high'?9:q==='low'?4:7;let pi=0,pj=0;try{pi=rt.pos.i;pj=rt.pos.j}catch(_){}
 return[...NetMP.peers.values()].filter(p=>p.zk===zk&&p.genes).sort((a,b)=>Math.hypot(a.i-pi,a.j-pj)-Math.hypot(b.i-pi,b.j-pj)).slice(0,cap)};NetMP.zonePeers=()=>{const zk=NetMP.zk();return[...NetMP.peers.values()].filter(p=>p.zk===zk).length};
function me(){const f=fa();return{id:NetMP.myId,jt:NetMP.jt,name:(S.player.name&&S.player.name!=='Caretaker'?S.player.name:(f?f.name+"'s Caretaker":'Caretaker')).slice(0,20),fname:f?f.name:'',genes:f?f.genes:null,level:f?f.level:1,zk:NetMP.zk(),zone:S.zone,i:+rt.pos.i.toFixed(2),j:+rt.pos.j.toFixed(2),sleep:!!rt.sleep,kn:[...NetMP.peers.keys()].slice(0,16),v:NET_V,ts:Date.now()}}
function badge(){let b=document.getElementById('mpbadge');if(!NetMP.room||NetMP.isWorld()){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='mpbadge';document.getElementById('stage').appendChild(b)}
 const here=NetMP.visiblePeers().length;const n=NetMP.peers.size;const E=es();b.textContent=(NetMP.status!=='online'&&!RL.up)||navigator.onLine===false?(E?'🟡 Conectando a la sala ':'🟡 Connecting to room ')+NetMP.room+'…':n?(E?'🟢 Sala ':'🟢 Room ')+NetMP.room+(E?' · conectado con ':' · connected to ')+[...NetMP.peers.values()].map(p=>dn(p.name)).slice(0,2).join(', ')+(n>2?' +'+(n-2):'')+(here?' · '+here+(E?' aquí':' here'):''):(E?'🟡 Sala ':'🟡 Room ')+NetMP.room+(E?' · esperando amigos (necesitan tener el juego abierto)':' · waiting for friends (they need the game open)')}// v8.3.6: badge built in ES directly ('Room' stayed English)
function deliver(m,fromConn){ // host relays
 if(NetMP.isHost){if(m.to&&m.to!==NetMP.myId){const c=NetMP.conns.get(m.to);if(c&&c.open)c.send(m);return}if(!m.to){const zoned=(m.t==='st'||m.t==='say'||m.t==='trick')&&NetMP.isWorld();const sz=m.zk||(NetMP.peers.get(m.id)||{}).zk;for(const[id,c]of NetMP.conns){if(c===fromConn||!c.open)continue;if(zoned){const q=NetMP.peers.get(id);if(q&&q.zk!==sz){if(m.t!=='st')continue;c._lp=c._lp||{};if(Date.now()-(c._lp[m.id]||0)<12000)continue;c._lp[m.id]=Date.now()}}c.send(m)}}}
 if(!m.to||m.to===NetMP.myId)handle(m)}
let SQ=0;const seen=new Set();function send(m){m.id=m.id||NetMP.myId;m.sq=m.sq||(++SQ+'_'+Date.now()%1e6);relayPub(m);if(NetMP.isHost)deliver(m,null);else if(NetMP.hostConn&&NetMP.hostConn.open)NetMP.hostConn.send(m);
 // v6.19: challenges/visit requests are re-sent (same sq, receiver dedupes) so one sent around a Find players reconnect is not lost
 if(!m._rs&&RESEND[m.t]){const mm=Object.assign({},m,{_rs:1});[2500,5500,9000].forEach(d=>setTimeout(()=>{try{relayPub(mm);if(NetMP.isHost)deliver(mm,null);else if(NetMP.hostConn&&NetMP.hostConn.open)NetMP.hostConn.send(mm)}catch(_){}},d))}}
const RESEND={giftResp:1,pvpAsk:1,pvpAns:1,pvpGo:1,hvReq:1,hvNo:1};
NetMP.send=send;NetMP._rx=m=>handle(m);
function es(){return(window.I18N&&I18N.lang==='es')||window.LANG==='es'}
const dn=NetMP.dn=s=>{s=String(s==null?'':s);const m=es()&&s.match(/^(.+)'s Caretaker$/);return m?'Cuidador de '+m[1]:s};// v8.3.5: ES default names are built here, so the live translator's "X's Caretaker" rule can't swallow the sentence around them
let updHint=0;function fixPeer(m){try{const cl=v=>String(v==null?'':v).replace(/[<>&"`]/g,'').slice(0,20);if('name' in m)m.name=cl(m.name)||'Caretaker';if('fname' in m)m.fname=cl(m.fname);if('level' in m)m.level=Math.max(1,Math.min(999,m.level|0));if('zone' in m)m.zone=String(m.zone).replace(/[^\w:-]/g,'').slice(0,40);if(m.genes&&typeof m.genes==='object'){if(!SPECIES[m.genes.species]){m.oddSp=m.genes.species;m.genes={...m.genes,species:Object.keys(SPECIES)[0]}}}
 m.i=+m.i||0;m.j=+m.j||0;m.name=String(m.name||'Friend').slice(0,20);m.fname=String(m.fname||'');if(typeof m.zk!=='string')m.zk=m.zone==='home'?'home:'+m.id:String(m.zone||'');
 if(m.zk&&m.zk.indexOf('home:')!==0)m.zk=m.zk.trim().toLowerCase();
 const pv=+m.v||1;if(pv>NET_V&&!updHint){updHint=1;toast(es()?'🔄 Un amigo tiene una versión más nueva. Por favor actualiza (recarga la app).':'🔄 A friend has a newer version. Please update (reload the app).')}
 else if(pv<NET_V&&!m._h){m.old=1}}catch(_){}}
function handle(m){if(m.id===NetMP.myId)return;if(m.sq){const k=m.id+':'+m.sq;if(seen.has(k))return;seen.add(k);if(seen.size>4000)seen.clear()}let p=NetMP.peers.get(m.id);
 if(typeof m.t==='string'&&m.t.slice(0,2)==='mk'){if(window.FSMkt)try{FSMkt.on(m,p)}catch(e){console.warn('mkt',e)}return} // v7.0 marketplace
 if(typeof m.t==='string'&&m.t.slice(0,2)==='hv'){if(window.FSVisit)try{FSVisit.msg(m,p)}catch(e){console.warn('visit',e)}return}
 if(m.t==='st'){if(m.ts&&Date.now()-m.ts>45000&&Math.abs(Date.now()-m.ts)<6e5)return;fixPeer(m);const isNew=!p;if(p&&p.say&&p.say.zk!==m.zk)delete p.say;p=Object.assign(p||{},m,{last:Date.now()});NetMP.peers.set(m.id,p);if(isNew&&!NetMP.isWorld()){toast('👋 '+dn(p.name)+' is online!');Sound.sfx&&Sound.sfx('hmm')}if(isNew||!(m.kn||[]).includes(NetMP.myId))announce()}
 else if(!p&&m.t!=='sphereReq'&&m.t!=='sphere'&&m.t!=='giftOffer'&&m.t!=='giftResp')return;
 if(m.t&&m.t.slice(0,4)==='gift'&&window.FSGift){FSGift.on(m,p);return}
 if(m.t&&m.t.slice(0,3)==='pvp'&&window.FSPvP){FSPvP.on(m,p);return}
 if(m.t==='say'){const here=NetMP.zk(),wz=typeof m.zk==='string'?m.zk.slice(0,60):(p.zk||'');if(wz!==here)return; // v8.1.1: chat only from the same place (same home base or world)
 p.say={text:String(m.text).slice(0,80),at:Date.now()+CHAT_MS-6000,chat:1,zk:wz};Sound.tone&&Sound.tone(1320,.2,'sine',.04);chatLog(p.name,m.text,wz)}
 if(m.t==='trick'){p.trick={k:m.k,t0:now()}}
 if(m.t==='bye'){NetMP.peers.delete(m.id);if(!NetMP.isWorld())toast((p?dn(p.name):'A friend')+' left the room.')}
 if(m.t==='sphereReq'&&!S.visitsOff){const h=zs('home');const keep=h.objs.filter(o=>o.type==='gate'||o.type==='decor'||o.type==='pullytree'||PROPS.includes(o.type)).map(o=>({...o,type:o.type==='pullytree'?'d_tree':o.type}));send({t:'sphere',to:m.id,owner:me().name,data:{tiles:h.tiles,objs:keep,nextId:999}})}
 if(m.t==='sphere'&&NetMP.pendingVisit===m.id){NetMP.pendingVisit=null;const z=Z('visit');z.n=m.data.tiles.length;z.name=m.owner+"'s Faunasphere";S.zones.visit=m.data;S.unlocked.visit=1;S.v5.visitId=m.id;if(S.zone==='visit'){S.zone='home';}startTravel('visit');setTimeout(()=>dispatch('visit',{who:m.owner}),1200)}}

// ---- Relay fallback (works when WebRTC/UDP is blocked): tiny ephemeral messages over public Nostr relays (wss/443) ----
const RELAYS=['wss://relay.damus.io','wss://nos.lol','wss://relay.primal.net'],KIND=20427;
const RLF={},RLN={};// v8.3.4: relay reconnect backs off (4 s → 60 s) and waits for the network while offline; peer names/levels/zones are sanitized (fixPeer)
const RL=NetMP.relay={socks:[],topic:null,sk:null,up:0,lastSt:0,pend:null};
function relayStart(code){relayStop();if(!window.NostrTools)return;RL.topic=PFX+code;RL.sk=RL.sk||NostrTools.generateSecretKey();
 for(const u of RELAYS)relayOne(u,code)}
function relayOne(u,code){let ws;try{ws=new WebSocket(u)}catch(_){return}ws._u=u;RL.socks.push(ws);
  ws.onopen=()=>{ws._sub=NetMP.zk();ws.send(JSON.stringify(['REQ','fs'+code,{kinds:[KIND],'#t':[RL.topic],'#z':[ws._sub,'all'],since:Math.floor(Date.now()/1000)-60}]));ws._open=1;RL.up++;if(NetMP.status!=='online'){NetMP.status='online';toast(window.LANG==='es'?'🟢 ¡Conectado a la sala '+code+'!':'🟢 Connected to room '+code+'!')}tick(true)};
  ws.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(_){return}if(d[0]!=='EVENT'||!d[2])return;let m;try{m=JSON.parse(d[2].content)}catch(_){return}
   if(!m||typeof m!=='object'||m.id===NetMP.myId)return;if(!m.to||m.to===NetMP.myId)handle(m)};
  ws.onclose=()=>{RL.up=Math.max(0,RL.up-(ws._open?1:0));const i=RL.socks.indexOf(ws);if(i>=0)RL.socks.splice(i,1);if(RL.topic===PFX+code){const f=RLF[u]=ws._open?0:(RLF[u]||0)+1;const go=()=>{if(RL.topic!==PFX+code||RL.socks.some(w=>w._u===u))return;if(navigator.onLine===false){addEventListener('online',()=>setTimeout(go,500+Math.random()*1500),{once:true});return}relayOne(u,code)};const dl=Math.min(60000,4000*Math.pow(2,Math.min(f,4)));RLN[u]=Date.now()+dl;setTimeout(go,dl)}};ws.onerror=()=>{}}
function relayStop(){RL.topic=null;for(const w of RL.socks)try{w.close()}catch(_){}RL.socks=[];RL.up=0}
function relayRaw(m){if(!RL.topic||!RL.up)return;let ev;try{ev=NostrTools.finalizeEvent({kind:KIND,created_at:Math.floor(Date.now()/1000),tags:[['t',RL.topic],['z',m._z||NetMP.zk()]],content:JSON.stringify(m)},RL.sk)}catch(_){return}
 const f=JSON.stringify(['EVENT',ev]);for(const w of RL.socks)if(w.readyState===1)try{w.send(f)}catch(_){}}
function relayPub(m){if(!RL.topic)return;if(m.t==='st'){const n=Date.now(),gap=n-RL.lastSt;if(gap<700){RL.pend=m;return}RL.lastSt=n;RL.pend=null}relayRaw(m)}
setInterval(()=>{if(RL.pend&&Date.now()-RL.lastSt>=700){const m=RL.pend;RL.pend=null;RL.lastSt=Date.now();relayRaw(m)}},250);
const log=[];function chatLog(n,t,zk){log.push({n,t:String(t).slice(0,80),at:Date.now(),zk:zk||NetMP.zk()});if(log.length>30)log.shift()}NetMP.chatHere=()=>{const z=NetMP.zk();return log.filter(l=>l.zk===z)};
function attach(c){c.on('data',m=>{if(!m||typeof m!=='object')return;if(NetMP.isHost&&m.id&&!NetMP.conns.has(m.id)){NetMP.conns.set(m.id,c);c._pid=m.id}deliver(m,c)});
 c.on('close',()=>{if(NetMP.isHost){const id=c._pid;NetMP.conns.delete(id);if(id&&NetMP.peers.has(id)){const p=NetMP.peers.get(id);NetMP.peers.delete(id);toast((dn(p.name)||'A friend')+' disconnected.');deliver({t:'bye',id},c)}}else if(c===NetMP.hostConn){NetMP.hostConn=null;NetMP.status='reconnecting';NetMP.peers.clear();toast('📡 Room host left. Reconnecting…');setTimeout(()=>start(NetMP.room,'auto'),800+Math.random()*2500)}});
 c.on('error',()=>{})}
function start(code,mode){if(typeof Peer==='undefined'){toast('Multiplayer library failed to load. Check your connection.');return}
 stop(true);if(NetMP.room!==code){NetMP.jt=Date.now();NetMP._shOk=0}NetMP.room=code;NetMP.status=RL.up&&RL.topic===PFX+code?'online':'connecting';badge();if(RL.topic!==PFX+code)relayStart(code);
 const asClient=()=>{const pr=new Peer();NetMP.peer=pr;pr.on('open',id=>{NetMP.isHost=false;const c=pr.connect(PFX+code,{reliable:true});NetMP.hostConn=c;attach(c);
   const to=setTimeout(()=>{if(NetMP.peer!==pr)return;/* v8.3.5: a stale timer from a room you already left must not re-host it */if(!c.open){if(!RL.up)toast('Room '+code+' not found. Hosting it instead.');pr.destroy();asHost(true)}},9000);
   c.on('open',()=>{clearTimeout(to);NetMP.status='online';toast('🟢 Joined room '+code+'!');announce()})});pr.on('error',e=>{if(NetMP.peer!==pr)return;if(e.type==='peer-unavailable'){pr.destroy();if(mode!=='join-only')asHost(true);else toast('Room '+code+' not found.')}else if(e.type==='network'||e.type==='server-error')(!RL.up&&toast('📡 Network trouble: '+e.type))})};
 const asHost=fallback=>{const pr=new Peer(PFX+code);NetMP.peer=pr;pr.on('open',id=>{NetMP.isHost=true;NetMP.status='online';toast(fallback?'🟢 You are now hosting room '+code+'.':'🟢 Room '+code+' created! Share the link with friends.');tick(true)});
   pr.on('connection',c=>{attach(c);c.on('open',()=>{setTimeout(()=>c.send({t:'st',...me()}),200);for(const p of NetMP.peers.values())c.send({...p,t:'st'})})});
   pr.on('error',e=>{if(NetMP.peer!==pr)return;if(e.type==='unavailable-id'){pr.destroy();asClient()}else if(e.type!=='peer-unavailable')(!RL.up&&toast('📡 Network trouble: '+e.type))});pr.on('disconnected',()=>{try{pr.reconnect()}catch(_){}})};
 if(mode==='host')asHost(false);else asClient();
 try{const u=new URL(location.href);u.searchParams.set('room',code);history.replaceState(null,'',u)}catch(_){}}
function stop(silent){if(!silent)relayStop();if(NetMP.peer){if(!NetMP._quiet)try{send({t:'bye'})}catch(_){}try{NetMP.peer.destroy()}catch(_){}}NetMP.peer=null;NetMP.conns.clear();NetMP.peers.clear();NetMP.hostConn=null;NetMP.isHost=false;if(!silent){NetMP.room=null;NetMP.status='offline';try{const u=new URL(location.href);u.searchParams.delete('room');history.replaceState(null,'',u)}catch(_){}badge()}}
NetMP.create=()=>start(newCode(),'host');NetMP.MAX=8;NetMP.join=code=>{start(String(code).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8),'join');const r=NetMP.room;setTimeout(()=>{if(NetMP.room===r&&!NetMP.isWorld()&&NetMP.peers.size>=NetMP.MAX){stop(false);toast('Room is full ('+NetMP.MAX+' players max). Try another room!')}},8000)};NetMP.leave=()=>{const w=NetMP.isWorld();stop(false);if(!w){toast(es()?'Volviste al servidor global.':'Back on the global server.');setTimeout(()=>NetMP.join(WORLD),400)}else toast('Left the room.')};
NetMP.visit=id=>{NetMP.pendingVisit=id;send({t:'sphereReq',to:id});toast('Asking to visit…');setTimeout(()=>{if(NetMP.pendingVisit===id){NetMP.pendingVisit=null;toast('No answer from that sphere.')}},8000)};
let lastAnn=0;function announce(){const n=Date.now();if(n-lastAnn<600){setTimeout(()=>{if(Date.now()-lastAnn>=600)announce()},650);return}lastAnn=n;RL.lastSt=0;tick(true)}NetMP.announce=announce;
let lastSent='',lastBeat=0;function tick(force){if(!NetMP.peer||!fa())return;const m=me(),k=JSON.stringify(m);if(force||k!==lastSent||Date.now()-lastBeat>2000){lastSent=k;lastBeat=Date.now();send({t:'st',...m})}
 const cut=Date.now()-30000;for(const[id,p]of NetMP.peers)if(p.last<cut){NetMP.peers.delete(id);if(!NetMP.isWorld())toast((dn(p.name)||'A friend')+' timed out.')}badge()}
setInterval(tick,200);
// re-subscribe relays to the new zone channel; 'all' presence ping every 12 s (so friends lists work across zones)
function resub(){const z=NetMP.zk();for(const w of RL.socks)if(w.readyState===1&&w._sub!==z){try{w.send(JSON.stringify(['CLOSE','fs'+NetMP.room]));w._sub=z;w.send(JSON.stringify(['REQ','fs'+NetMP.room,{kinds:[KIND],'#t':[RL.topic],'#z':[z,'all'],since:Math.floor(Date.now()/1000)-20}]))}catch(_){}}}
setInterval(()=>{if(NetMP.room&&RL.up)resub()},500);
setInterval(()=>{if(!NetMP.room||!fa())return;const m={t:'st',...me(),_z:'all'};m.id=NetMP.myId;m.sq=(++SQ)+'_'+Date.now()%1e6;relayRaw(m)},12000);
let zk0='';setInterval(()=>{try{const z=NetMP.zk();if(zk0&&z!==zk0){for(const q of NetMP.peers.values())if(q.say&&q.say.zk!==z)delete q.say;try{if(rt.say)rt.say=null}catch(_){}}if(!NetMP.room){zk0=z;return}}catch(_){}if(!NetMP.room)return;try{const z=NetMP.zk();if(z!==zk0){zk0=z;[200,1500,4000].forEach(d=>setTimeout(announce,d))}}catch(_){}},300);
// self-heal: room set but PeerJS dropped and no relay -> restart
setInterval(()=>{if(NetMP.room&&!NetMP.peer&&!RL.up)start(NetMP.room,'auto')},10000);
addEventListener('pagehide',()=>{if(NetMP.peer)try{send({t:'bye'})}catch(_){}});
// hooks: chat + tricks broadcast
const CHAT_MS=10000;const cf=document.getElementById('chatf'),cf0=cf.onsubmit;cf.onsubmit=e=>{const t=document.getElementById('chatin').value.trim();cf0(e);try{if(t&&rt.say&&rt.say.text===t.slice(0,80))rt.say.at=now()+CHAT_MS-5000}catch(_){}if(t&&NetMP.peer){const z=NetMP.zk();send({t:'say',text:t.slice(0,80),zk:z});chatLog('You',t,z)}};
const rtr=R.trick;R.trick=p=>{rtr(p);if(NetMP.peer&&S.tricks.includes(p.k))send({t:'trick',k:p.k})};
// leaving a visited sphere: drop it
const trv=R.travel;R.travel=p=>{trv(p);if(NetMP.room)[300,1500,4000].forEach(d=>setTimeout(announce,d));if(p.zone!=='visit'&&S.zones.visit&&S.zone!=='visit'){delete S.zones.visit;S.unlocked.visit=0}};
// Friends panel
const ui5=ui;ui=function(v,p={}){if(v==='mpCreate'){NetMP.create();setTimeout(()=>ui('friends'),2500);return}if(v==='mpFind'){NetMP.findPlayers();setTimeout(()=>ui('friends'),2500);return}if(v==='mpLeave'){NetMP.leave();return ui('friends')}
 if(v==='mpJoin'){const c=(document.getElementById('jc')||{}).value||'';if(c.trim())NetMP.join(c);setTimeout(()=>ui('friends'),3000);return}
 if(v==='mpVisit'){close();return NetMP.visit(p.id)}if(v==='mpName'){const n=(document.getElementById('mn')||{}).value;if(n&&n.trim()){S.player.name=n.trim().slice(0,20);save();tick(true)}return ui('friends')}
 if(v==='mpCopy'){const u=location.origin+location.pathname+'?room='+NetMP.room;(navigator.share?navigator.share({title:'FaunaMySphere',text:'Join my FaunaMySphere room '+NetMP.room,url:u}):navigator.clipboard.writeText(u)).then(()=>toast('Link ready to share!')).catch(()=>prompt('Copy this link:',u));return}
 if(v!=='friends')return ui5(v,p);cur={...p,v};const ps=[...NetMP.peers.values()];
 let h='<h2>👥 Friends</h2>';
 h+=`<div class="row"><div class="grow">Your name: <input id="mn" maxlength="20" value="${(S.player.name||'').replace(/"/g,'')}" placeholder="Caretaker name" style="width:150px"></div>${btn('Save','ui',{v:'mpName'})}</div>`;
 if(!NetMP.room)h+=`<p class="small">Play together! Create a room and send the link or code to friends. You'll see each other's fauna, chat, do tricks together and visit each other's spheres. (Peer-to-peer, no accounts.)</p>${btn('➕ Create Room','ui',{v:'mpCreate'})}<div class="row"><div class="grow"><input id="jc" maxlength="8" placeholder="Room code" style="text-transform:uppercase;width:140px"></div>${btn('Join','ui',{v:'mpJoin'})}</div>`;
 else h+=`<p>${NetMP.isWorld()?(es()?'🌍 Servidor '+NetMP.shard()+' · ':'🌍 Server '+NetMP.shard()+' · ')+NetMP.zonePeers()+(es()?' en tu zona':' in your zone'):'Room: <span class="roomcode">'+NetMP.room+'</span>'} ${NetMP.isHost?'<span class="small">(you host)</span>':''} · <b>${NetMP.status}</b></p>${btn('🔗 Share link','ui',{v:'mpCopy'})} ${btn('Leave room','ui',{v:'mpLeave'})} ${btn('🔄 Find players','ui',{v:'mpFind'})}<h3>Online (${ps.length+1})</h3><div class="row"><div class="grow"><span class="online"></span><b>${me().name}</b> (you) · ${Z(S.zone).name}</div></div>`+ps.map(q=>`<div class="row"><div class="grow"><span class="online"></span><b>${q.name}</b> & ${q.fname} <span class="small">${q.old?'<span title="old">⚠️</span> ':''}(${q.genes&&SPECIES[q.genes.species]?SPECIES[q.genes.species].name:''} Lv ${q.level}) · ${q.zone==='visit'?'visiting':Z(q.zone)?Z(q.zone).name:''}</span></div>${btn('Visit sphere','ui',{v:'mpVisit',id:q.id})}${q.zone!=='visit'&&q.zone!=='home'&&S.unlocked[q.zone]&&q.zone!==S.zone?btn('Go to','travel',{zone:q.zone}):''}</div>`).join('')+(NetMP.chatHere().length?'<h3>Chat</h3>'+NetMP.chatHere().slice(-8).map(l=>`<div class="small"><b style="color:#2f8a1a">${l.n}:</b> ${l.t.replace(/</g,'&lt;')}</div>`).join(''):'');
 if(NetMP.isWorld())h+=`<h3>${es()?'Sala privada (opcional)':'Private room (optional)'}</h3>${btn('➕ Create Room','ui',{v:'mpCreate'})}<div class="row"><div class="grow"><input id="jc" maxlength="8" placeholder="Room code" style="text-transform:uppercase;width:140px"></div>${btn('Join','ui',{v:'mpJoin'})}</div>`;
 h+=`<div class="row"><div class="grow">🏝️ Amelia's Faunasphere (guide NPC)</div>${btn('Visit','visit',{who:'Amelia'})}</div>`;open(h)};
// auto-join from link
{const rq=(new URLSearchParams(location.search).get('room')||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);// v8.3.5: a shared ?room= link (and a reload inside a private room) joins that room again instead of the global server
 const go=()=>{if(NetMP.room)return;if(fa()&&typeof Peer!=='undefined')NetMP.join(rq||WORLD);else setTimeout(go,1500)};setTimeout(go,1200)}
addEventListener('offline',()=>{if(NetMP.room){NetMP.status='connecting';badge()}});// v8.3.5: don't keep showing 'online' while the phone has no network (heal on 'online' reconnects)
// ---- v6.13.1: heal after backgrounding / network change, peer counter, Find players ----
let hidAt=0,lastHeal=0;
function heal(hard){if(!NetMP.room)return;const n=Date.now();if(!hard&&n-lastHeal<3000)return;lastHeal=n;const code=NetMP.room;
 try{if(hard||RL.topic!==PFX+code){RL.topic=null;for(const w of RL.socks)try{w.onclose=null;w.close()}catch(_){}RL.socks=[];RL.up=0;relayStart(code)}else{const have=new Set(RL.socks.map(w=>w._u));for(const u of RELAYS)if(!have.has(u)&&!((RLN[u]||0)>n))relayOne(u,code)}}catch(_){}
 try{const pr=NetMP.peer,hc=NetMP.hostConn;if(hard||!pr||pr.destroyed||(!NetMP.isHost&&!(hc&&hc.open)&&NetMP.status!=='connecting')){const keep=new Map(NetMP.peers);NetMP._quiet=1;try{start(code,'auto')}finally{NetMP._quiet=0}for(const[k,v]of keep)if(!NetMP.peers.has(k))NetMP.peers.set(k,v)}else if(pr.disconnected)pr.reconnect()}catch(_){}
 [300,1200,3000,6000].forEach(d=>setTimeout(announce,d))}
NetMP.heal=heal;NetMP.findPlayers=()=>{heal(true);toast(es()?'🔄 Buscando jugadores…':'🔄 Finding players…')};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){hidAt=Date.now();return}heal(hidAt&&Date.now()-hidAt>8000)});
addEventListener('pageshow',e=>heal(!!e.persisted));addEventListener('online',()=>heal(true));addEventListener('focus',()=>heal(false));
setInterval(()=>{if(!NetMP.room)return;if(!RL.up||(!NetMP.isHost&&!(NetMP.hostConn&&NetMP.hostConn.open)&&NetMP.status!=='connecting'))heal(false)},8000);
function pc(){let b=document.getElementById('mpcount');if(!NetMP.room){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='mpcount';b.style.cssText='position:fixed;top:calc(env(safe-area-inset-top) + 4px);left:50%;transform:translateX(-50%);z-index:60;background:rgba(23,60,15,.8);color:#fff;font:bold 12px sans-serif;padding:2px 8px;border-radius:10px;pointer-events:auto;cursor:pointer';b.onclick=()=>{try{ui('friends')}catch(_){}};document.body.appendChild(b)}
 const n=NetMP.zonePeers(),on=NetMP.status==='online'||RL.up;const sh=NetMP.shard(),t=(sh?'🌍 '+(es()?'Servidor ':'Server ')+sh+' · ':'')+(on?'👥 ':'🟡 ')+n;b.title=es()?'Jugadores en tu zona':'Players in your zone';if(b.textContent!==t)b.textContent=t}
setInterval(pc,700);
console.log('[FaunaMySphere] multiplayer ready');

// ---- v7.3: max 10 players per world server; newcomers overflow to Server 2, 3, ... ----
setInterval(()=>{try{if(!NetMP.isWorld()||NetMP._shOk)return;const age=Date.now()-NetMP.jt;if(age<9000)return;if(age>22000){NetMP._shOk=1;return}
 if(window.FSPvP&&FSPvP.state&&FSPvP.state())return;if(S.zone==='visit')return;
 const older=[...NetMP.peers.values()].filter(p=>!(+p.jt)||+p.jt<NetMP.jt||(+p.jt===NetMP.jt&&p.id<NetMP.myId)).length;
 if(older>=NetMP.SHARD_MAX){const nx=NetMP.shard()+1;NetMP._shOk=1;toast(es()?'🌍 El servidor '+NetMP.shard()+' está lleno (10 jugadores). Te pasamos al servidor '+nx+'.':'🌍 Server '+NetMP.shard()+' is full (10 players). Moving you to Server '+nx+'.');
  stop(false);setTimeout(()=>NetMP.join('WORLD'+nx),300)}}catch(_){}},1500);

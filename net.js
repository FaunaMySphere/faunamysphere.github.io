'use strict';
// ===== FaunaSphere v5 multiplayer: serverless WebRTC rooms via PeerJS (public broker) =====
// Star topology: the room creator hosts (peer id fsrevival5-CODE) and relays to everyone. If the host leaves, a client re-hosts.
const NetMP=window.NetMP={peer:null,room:null,isHost:false,conns:new Map(),peers:new Map(),myId:null,status:'offline',hostConn:null};
NetMP.myId='u'+Math.random().toString(36).slice(2,10);const PFX='fsrevival5-',CH='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode=()=>Array.from({length:5},()=>CH[Math.floor(Math.random()*CH.length)]).join('');
ZONES.push({id:'visit',name:"Friend's Faunasphere",biome:'home',n:9,tier:0,stations:['gate'],nodes:{},poll:0,props:[],tox:0});
if(S&&S.zone==='visit'){S.zone='home'}
NetMP.zk=()=>S.zone==='visit'?'home:'+(S.v5.visitId||''):S.zone==='home'?'home:'+NetMP.myId:S.zone;
NetMP.visiblePeers=()=>{const zk=NetMP.zk();return[...NetMP.peers.values()].filter(p=>p.zk===zk&&p.genes)};
function me(){const f=fa();return{id:NetMP.myId,name:(S.player.name&&S.player.name!=='Caretaker'?S.player.name:(f?f.name+"'s Caretaker":'Caretaker')).slice(0,20),fname:f?f.name:'',genes:f?f.genes:null,level:f?f.level:1,zk:NetMP.zk(),zone:S.zone,i:+rt.pos.i.toFixed(2),j:+rt.pos.j.toFixed(2),sleep:!!rt.sleep}}
function badge(){let b=document.getElementById('mpbadge');if(!NetMP.room){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='mpbadge';document.getElementById('stage').appendChild(b)}
 const here=NetMP.visiblePeers().length;const n=NetMP.peers.size;b.textContent=NetMP.status!=='online'?'🟡 Connecting to room '+NetMP.room+'…':n?'🟢 Room '+NetMP.room+' · connected to '+[...NetMP.peers.values()].map(p=>p.name).slice(0,2).join(', ')+(n>2?' +'+(n-2):'')+(here?' · '+here+' here':''):'🟡 Room '+NetMP.room+' · waiting for friends (they need the game open)'}
function deliver(m,fromConn){ // host relays
 if(NetMP.isHost){if(m.to&&m.to!==NetMP.myId){const c=NetMP.conns.get(m.to);if(c&&c.open)c.send(m);return}if(!m.to)for(const[id,c]of NetMP.conns)if(c!==fromConn&&c.open)c.send(m)}
 if(!m.to||m.to===NetMP.myId)handle(m)}
let SQ=0;const seen=new Set();function send(m){m.id=m.id||NetMP.myId;m.sq=m.sq||(++SQ+'_'+Date.now()%1e6);relayPub(m);if(NetMP.isHost)deliver(m,null);else if(NetMP.hostConn&&NetMP.hostConn.open)NetMP.hostConn.send(m)}
NetMP.send=send;
function handle(m){if(m.id===NetMP.myId)return;if(m.sq){const k=m.id+':'+m.sq;if(seen.has(k))return;seen.add(k);if(seen.size>4000)seen.clear()}let p=NetMP.peers.get(m.id);
 if(m.t==='st'){const isNew=!p;p=Object.assign(p||{},m,{last:Date.now()});NetMP.peers.set(m.id,p);if(isNew){toast('👋 '+p.name+' is online!');Sound.sfx&&Sound.sfx('hmm')}}
 else if(!p&&m.t!=='sphereReq'&&m.t!=='sphere')return;
 if(m.t==='say'){p.say={text:String(m.text).slice(0,80),at:Date.now()};Sound.tone&&Sound.tone(1320,.2,'sine',.04);chatLog(p.name,m.text)}
 if(m.t==='trick'){p.trick={k:m.k,t0:now()}}
 if(m.t==='bye'){NetMP.peers.delete(m.id);toast((p?p.name:'A friend')+' left the room.')}
 if(m.t==='sphereReq'){const h=zs('home');const keep=h.objs.filter(o=>o.type==='gate'||o.type==='decor'||o.type==='pullytree'||PROPS.includes(o.type)).map(o=>({...o,type:o.type==='pullytree'?'d_tree':o.type}));send({t:'sphere',to:m.id,owner:me().name,data:{tiles:h.tiles,objs:keep,nextId:999}})}
 if(m.t==='sphere'&&NetMP.pendingVisit===m.id){NetMP.pendingVisit=null;const z=Z('visit');z.n=m.data.tiles.length;z.name=m.owner+"'s Faunasphere";S.zones.visit=m.data;S.unlocked.visit=1;S.v5.visitId=m.id;if(S.zone==='visit'){S.zone='home';}startTravel('visit');setTimeout(()=>dispatch('visit',{who:m.owner}),1200)}}

// ---- Relay fallback (works when WebRTC/UDP is blocked): tiny ephemeral messages over public Nostr relays (wss/443) ----
const RELAYS=['wss://relay.damus.io','wss://nos.lol','wss://relay.primal.net'],KIND=20427;
const RL=NetMP.relay={socks:[],topic:null,sk:null,up:0,lastSt:0,pend:null};
function relayStart(code){relayStop();if(!window.NostrTools)return;RL.topic=PFX+code;RL.sk=RL.sk||NostrTools.generateSecretKey();
 for(const u of RELAYS)relayOne(u,code)}
function relayOne(u,code){let ws;try{ws=new WebSocket(u)}catch(_){return}ws._u=u;RL.socks.push(ws);
  ws.onopen=()=>{ws.send(JSON.stringify(['REQ','fs'+code,{kinds:[KIND],'#t':[RL.topic],since:Math.floor(Date.now()/1000)-5}]));ws._open=1;RL.up++;if(NetMP.status!=='online'){NetMP.status='online';toast('🟢 Connected to room '+code+'!')}tick(true)};
  ws.onmessage=e=>{let d;try{d=JSON.parse(e.data)}catch(_){return}if(d[0]!=='EVENT'||!d[2])return;let m;try{m=JSON.parse(d[2].content)}catch(_){return}
   if(!m||typeof m!=='object'||m.id===NetMP.myId)return;if(!m.to||m.to===NetMP.myId)handle(m)};
  ws.onclose=()=>{RL.up=Math.max(0,RL.up-(ws._open?1:0));const i=RL.socks.indexOf(ws);if(i>=0)RL.socks.splice(i,1);if(RL.topic===PFX+code)setTimeout(()=>{if(RL.topic===PFX+code)relayOne(u,code)},4000)};ws.onerror=()=>{}}
function relayStop(){RL.topic=null;for(const w of RL.socks)try{w.close()}catch(_){}RL.socks=[];RL.up=0}
function relayRaw(m){if(!RL.topic||!RL.up)return;let ev;try{ev=NostrTools.finalizeEvent({kind:KIND,created_at:Math.floor(Date.now()/1000),tags:[['t',RL.topic]],content:JSON.stringify(m)},RL.sk)}catch(_){return}
 const f=JSON.stringify(['EVENT',ev]);for(const w of RL.socks)if(w.readyState===1)try{w.send(f)}catch(_){}}
function relayPub(m){if(!RL.topic)return;if(m.t==='st'){const n=Date.now(),gap=n-RL.lastSt;if(gap<700){RL.pend=m;return}RL.lastSt=n;RL.pend=null}relayRaw(m)}
setInterval(()=>{if(RL.pend&&Date.now()-RL.lastSt>=700){const m=RL.pend;RL.pend=null;RL.lastSt=Date.now();relayRaw(m)}},250);
const log=[];function chatLog(n,t){log.push({n,t:String(t).slice(0,80),at:Date.now()});if(log.length>30)log.shift()}
function attach(c){c.on('data',m=>{if(!m||typeof m!=='object')return;if(NetMP.isHost&&m.id&&!NetMP.conns.has(m.id)){NetMP.conns.set(m.id,c);c._pid=m.id}deliver(m,c)});
 c.on('close',()=>{if(NetMP.isHost){const id=c._pid;NetMP.conns.delete(id);if(id&&NetMP.peers.has(id)){const p=NetMP.peers.get(id);NetMP.peers.delete(id);toast((p.name||'A friend')+' disconnected.');deliver({t:'bye',id},c)}}else if(c===NetMP.hostConn){NetMP.hostConn=null;NetMP.status='reconnecting';NetMP.peers.clear();toast('📡 Room host left. Reconnecting…');setTimeout(()=>start(NetMP.room,'auto'),800+Math.random()*2500)}});
 c.on('error',()=>{})}
function start(code,mode){if(typeof Peer==='undefined'){toast('Multiplayer library failed to load. Check your connection.');return}
 stop(true);NetMP.room=code;NetMP.status='connecting';badge();if(RL.topic!==PFX+code)relayStart(code);
 const asClient=()=>{const pr=new Peer();NetMP.peer=pr;pr.on('open',id=>{NetMP.isHost=false;const c=pr.connect(PFX+code,{reliable:true});NetMP.hostConn=c;attach(c);
   const to=setTimeout(()=>{if(!c.open){if(!RL.up)toast('Room '+code+' not found. Hosting it instead.');pr.destroy();asHost(true)}},9000);
   c.on('open',()=>{clearTimeout(to);NetMP.status='online';toast('🟢 Joined room '+code+'!');tick(true)})});pr.on('error',e=>{if(e.type==='peer-unavailable'){pr.destroy();if(mode!=='join-only')asHost(true);else toast('Room '+code+' not found.')}else if(e.type==='network'||e.type==='server-error')(!RL.up&&toast('📡 Network trouble: '+e.type))})};
 const asHost=fallback=>{const pr=new Peer(PFX+code);NetMP.peer=pr;pr.on('open',id=>{NetMP.isHost=true;NetMP.status='online';toast(fallback?'🟢 You are now hosting room '+code+'.':'🟢 Room '+code+' created! Share the link with friends.');tick(true)});
   pr.on('connection',c=>{attach(c);c.on('open',()=>{setTimeout(()=>c.send({t:'st',...me()}),200);for(const p of NetMP.peers.values())c.send({...p,t:'st'})})});
   pr.on('error',e=>{if(e.type==='unavailable-id'){pr.destroy();asClient()}else if(e.type!=='peer-unavailable')(!RL.up&&toast('📡 Network trouble: '+e.type))});pr.on('disconnected',()=>{try{pr.reconnect()}catch(_){}})};
 if(mode==='host')asHost(false);else asClient();
 try{const u=new URL(location.href);u.searchParams.set('room',code);history.replaceState(null,'',u)}catch(_){}}
function stop(silent){if(!silent)relayStop();if(NetMP.peer){try{send({t:'bye'})}catch(_){}try{NetMP.peer.destroy()}catch(_){}}NetMP.peer=null;NetMP.conns.clear();NetMP.peers.clear();NetMP.hostConn=null;NetMP.isHost=false;if(!silent){NetMP.room=null;NetMP.status='offline';try{const u=new URL(location.href);u.searchParams.delete('room');history.replaceState(null,'',u)}catch(_){}badge()}}
NetMP.create=()=>start(newCode(),'host');NetMP.join=code=>start(String(code).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8),'join');NetMP.leave=()=>{stop(false);toast('Left the room.')};
NetMP.visit=id=>{NetMP.pendingVisit=id;send({t:'sphereReq',to:id});toast('Asking to visit…');setTimeout(()=>{if(NetMP.pendingVisit===id){NetMP.pendingVisit=null;toast('No answer from that sphere.')}},8000)};
let lastSent='';function tick(force){if(!NetMP.peer||!fa())return;const m=me(),k=JSON.stringify(m);if(force||k!==lastSent||Math.random()<.05){lastSent=k;send({t:'st',...m})}
 const cut=Date.now()-15000;for(const[id,p]of NetMP.peers)if(p.last<cut){NetMP.peers.delete(id);toast((p.name||'A friend')+' timed out.')}badge()}
setInterval(tick,200);
addEventListener('pagehide',()=>{if(NetMP.peer)try{send({t:'bye'})}catch(_){}});
// hooks: chat + tricks broadcast
const cf=document.getElementById('chatf'),cf0=cf.onsubmit;cf.onsubmit=e=>{const t=document.getElementById('chatin').value.trim();cf0(e);if(t&&NetMP.peer){send({t:'say',text:t.slice(0,80)});chatLog('You',t)}};
const rtr=R.trick;R.trick=p=>{rtr(p);if(NetMP.peer&&S.tricks.includes(p.k))send({t:'trick',k:p.k})};
// leaving a visited sphere: drop it
const trv=R.travel;R.travel=p=>{trv(p);if(p.zone!=='visit'&&S.zones.visit&&S.zone!=='visit'){delete S.zones.visit;S.unlocked.visit=0}};
// Friends panel
const ui5=ui;ui=function(v,p={}){if(v==='mpCreate'){NetMP.create();setTimeout(()=>ui('friends'),2500);return}if(v==='mpLeave'){NetMP.leave();return ui('friends')}
 if(v==='mpJoin'){const c=(document.getElementById('jc')||{}).value||'';if(c.trim())NetMP.join(c);setTimeout(()=>ui('friends'),3000);return}
 if(v==='mpVisit'){close();return NetMP.visit(p.id)}if(v==='mpName'){const n=(document.getElementById('mn')||{}).value;if(n&&n.trim()){S.player.name=n.trim().slice(0,20);save();tick(true)}return ui('friends')}
 if(v==='mpCopy'){const u=location.origin+location.pathname+'?room='+NetMP.room;(navigator.share?navigator.share({title:'FaunaSphere',text:'Join my FaunaSphere room '+NetMP.room,url:u}):navigator.clipboard.writeText(u)).then(()=>toast('Link ready to share!')).catch(()=>prompt('Copy this link:',u));return}
 if(v!=='friends')return ui5(v,p);cur={...p,v};const ps=[...NetMP.peers.values()];
 let h='<h2>👥 Friends</h2>';
 h+=`<div class="row"><div class="grow">Your name: <input id="mn" maxlength="20" value="${(S.player.name||'').replace(/"/g,'')}" placeholder="Caretaker name" style="width:150px"></div>${btn('Save','ui',{v:'mpName'})}</div>`;
 if(!NetMP.room)h+=`<p class="small">Play together! Create a room and send the link or code to friends. You'll see each other's fauna, chat, do tricks together and visit each other's spheres. (Peer-to-peer, no accounts.)</p>${btn('➕ Create Room','ui',{v:'mpCreate'})}<div class="row"><div class="grow"><input id="jc" maxlength="8" placeholder="Room code" style="text-transform:uppercase;width:140px"></div>${btn('Join','ui',{v:'mpJoin'})}</div>`;
 else h+=`<p>Room: <span class="roomcode">${NetMP.room}</span> ${NetMP.isHost?'<span class="small">(you host)</span>':''} · <b>${NetMP.status}</b></p>${btn('🔗 Share link','ui',{v:'mpCopy'})} ${btn('Leave room','ui',{v:'mpLeave'})}<h3>Online (${ps.length+1})</h3><div class="row"><div class="grow"><span class="online"></span><b>${me().name}</b> (you) · ${Z(S.zone).name}</div></div>`+ps.map(q=>`<div class="row"><div class="grow"><span class="online"></span><b>${q.name}</b> & ${q.fname} <span class="small">(${q.genes?SPECIES[q.genes.species].name:''} Lv ${q.level}) · ${q.zone==='visit'?'visiting':Z(q.zone)?Z(q.zone).name:''}</span></div>${btn('Visit sphere','ui',{v:'mpVisit',id:q.id})}${q.zone!=='visit'&&q.zone!=='home'&&S.unlocked[q.zone]&&q.zone!==S.zone?btn('Go to','travel',{zone:q.zone}):''}</div>`).join('')+(log.length?'<h3>Chat</h3>'+log.slice(-8).map(l=>`<div class="small"><b style="color:#2f8a1a">${l.n}:</b> ${l.t.replace(/</g,'&lt;')}</div>`).join(''):'');
 h+=`<div class="row"><div class="grow">🏝️ Amelia's Faunasphere (guide NPC)</div>${btn('Visit','visit',{who:'Amelia'})}</div>`;open(h)};
// auto-join from link
const rq=QS.get('room');if(rq){const go=()=>{if(fa())NetMP.join(rq);else setTimeout(go,1500)};setTimeout(go,1200)}
console.log('[FaunaSphere] multiplayer ready');

'use strict';
// v6.17 Visit a friend's home: owner sends a compressed, chunked snapshot (layout + fauna) over PeerJS/relay; the visitor sees a
// read-only copy with the friend's fauna roaming, live presence, live updates, privacy toggle. Friend data NEVER enters the visitor's save:
// while visiting, S.toJSON returns the visitor's real home/fauna, and every mutating action is blocked.
(()=>{if(!window.NetMP)return;
const ES=()=>window.LANG==='es',T=(en,es)=>ES()?es:en,cln=s=>String(s==null?'':s).replace(/[<>&"']/g,''),esc=s=>String(s==null?'':s).replace(/[<>&"']/g,c=>'&#'+c.charCodeAt(0)+';'),tn=s=>String(s==null?'':s).slice(0,40);// v8.3.5: esc now escapes for HTML instead of deleting (Bo's Caretaker kept its apostrophe); toasts are plain text (tn)
const V=window.FSVisit={on:false,owner:null,name:'',real:null,offline:false,rx:new Map(),pend:null,sentSig:new Map(),lastSnapAt:0};
const RZ=new Map();const tx=m=>{if(m.t==='hvReq'||m.t==='hvNo'){m._z='all';NetMP.send(m);return}const q=NetMP.peers.get(m.to),rz=RZ.get(m.to);if(rz&&rz.at>Date.now()-20000)m._z=rz.z;else if(q&&q.zk)m._z=q.zk;NetMP.send(m)};
const MAXRAW=900000,CH=12000,MAXN=60;
// ---------- compression ----------
async function pack(str){if(window.CompressionStream){const st=new Blob([str]).stream().pipeThrough(new CompressionStream('deflate-raw'));const b=new Uint8Array(await new Response(st).arrayBuffer());let o='';for(let i=0;i<b.length;i+=8192)o+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return'z'+btoa(o)}return'u'+btoa(unescape(encodeURIComponent(str)))}
async function unpack(s){if(s[0]==='u'){const r=decodeURIComponent(escape(atob(s.slice(1))));if(r.length>MAXRAW)throw 0;return r}if(s[0]!=='z'||!window.DecompressionStream)throw 0;
 const b=Uint8Array.from(atob(s.slice(1)),c=>c.charCodeAt(0));const rd=new Blob([b]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();let n=0;const parts=[];
 for(;;){const{done,value}=await rd.read();if(done)break;n+=value.length;if(n>MAXRAW){try{rd.cancel()}catch(_){}throw 0}parts.push(value)}return new TextDecoder().decode(await new Blob(parts).arrayBuffer())}
// ---------- sanitize ----------
const BAD=/^(__proto__|constructor|prototype|toJSON)$/;
function clean(v,d){if(d>9)return undefined;if(v===null)return null;const t=typeof v;if(t==='number')return Number.isFinite(v)?v:0;if(t==='boolean')return v;if(t==='string')return v.slice(0,80);
 if(Array.isArray(v))return v.slice(0,3000).map(x=>{const c=clean(x,d+1);return c===undefined?null:c});
 if(t==='object'){const o={};let k=0;for(const key of Object.keys(v)){if(BAD.test(key)||key.length>40||++k>200)continue;const c=clean(v[key],d+1);if(c!==undefined)o[key]=c}return o}return undefined}
function validate(raw){const s=clean(raw,0);if(!s||typeof s!=='object'||!s.z||typeof s.z!=='object')return null;const z=s.z,n=Array.isArray(z.tiles)?z.tiles.length:0;
 if(n<3||n>64||!z.tiles.every(r=>Array.isArray(r)&&r.length<=64))return null;z.tiles=z.tiles.map(r=>r.map(x=>x?1:0));
 z.objs=(Array.isArray(z.objs)?z.objs:[]).filter(o=>o&&typeof o==='object'&&typeof o.type==='string'&&/^[\w-]{1,32}$/.test(o.type)&&Number.isInteger(o.i)&&Number.isInteger(o.j)&&o.i>=0&&o.j>=0&&o.i<n&&o.j<n).slice(0,1500);
 z.polls=[];z.tox=[];const h=s.h&&typeof s.h==='object'&&!Array.isArray(s.h)?s.h:{};if(!Array.isArray(h.decor))h.decor=[];h.decor=h.decor.filter(d=>d&&typeof d==='object').slice(0,1500);
 const f=(Array.isArray(s.f)?s.f:[]).filter(x=>x&&x.genes&&typeof x.genes==='object'&&(typeof x.genes.species==='string'||Number.isInteger(x.genes.species))&&typeof SPECIES!=='undefined'&&SPECIES[x.genes.species]).slice(0,30)
  .map(x=>({name:cln(x.name).slice(0,20)||'Fauna',genes:x.genes,level:Math.max(1,Math.min(99,(x.level|0)||1)),rarity:typeof x.rarity==='string'?x.rarity.slice(0,16):undefined,energy:100,happy:100,hunger:0}));
 return{z,h,f,n:cln(s.n).slice(0,20)}}
// ---------- owner side ----------
function myName(){const f=fa();return(S.player.name&&S.player.name!=='Caretaker'?S.player.name:(f?f.name+"'s Caretaker":'Caretaker')).slice(0,20)}
function snapshot(){const zh=zs('home'),z={};for(const k of Object.keys(zh))if(k!=='polls'&&k!=='tox')z[k]=zh[k];
 const f=S.fauna.map((x,i)=>i===S.active?null:x).filter(Boolean).slice(0,30).map(x=>({name:x.name,genes:x.genes,level:x.level,rarity:x.rarity}));
 return JSON.stringify({v:1,n:myName(),h:S.home||{},z,f})}
async function sendSnap(to,str){str=str||snapshot();const d=await pack(str);const n=Math.ceil(d.length/CH);if(n>MAXN){tx({t:'hvNo',to,why:'big'});return}
 const k=Math.random().toString(36).slice(2,8);for(let i=0;i<n;i++)tx({t:'hvC',to,k,i,n,d:d.slice(i*CH,(i+1)*CH)});RZ.delete(to);V.sentSig.set(to,str)}
const visitorsHere=()=>[...NetMP.peers.values()].filter(p=>p.zk==='home:'+NetMP.myId);
// push updates to visitors when my home changes
setInterval(()=>{try{if(V.on||S.visitsOff||!NetMP.room)return;const vs=visitorsHere();if(!vs.length)return;const str=snapshot();for(const p of vs)if(V.sentSig.get(p.id)!==str)sendSnap(p.id,str)}catch(e){}},1500);
// ---------- messages ----------
function onMsg(m,p){
 if(m.t==='hvReq'){if(typeof m.rz==='string'&&m.rz.length<60)RZ.set(m.id,{z:m.rz,at:Date.now()});if(S.visitsOff){tx({t:'hvNo',to:m.id,why:'off'});return}if(V.on){tx({t:'hvNo',to:m.id,why:'away'});return}sendSnap(m.id);if(p)toast('🏠 '+tn(p.name)+T(' is visiting your home!',' está visitando tu casa!'));return}
 if(m.t==='hvNo'){if(V.pend===m.id||V.owner===m.id){V.pend=null;toast(m.why==='off'?T('🔒 That player isn\'t allowing visits right now.','🔒 Ese jugador no permite visitas ahora.'):m.why==='big'?T('That home is too big to send.','Esa casa es demasiado grande para enviarla.'):T('That player is visiting someone else. Try again soon.','Ese jugador está de visita. Inténtalo pronto.'));if(V.on&&m.why==='off'){toast(T('The owner turned visits off.','El dueño desactivó las visitas.'));exit()}}return}
 if(m.t==='hvC'){if(V.pend!==m.id&&!(V.on&&V.owner===m.id))return;if(typeof m.k!=='string'||typeof m.d!=='string'||m.d.length>CH||!(m.n>0&&m.n<=MAXN)||!(m.i>=0&&m.i<m.n)||(m.i|0)!==m.i)return;
  const key=m.id+':'+m.k;let b=V.rx.get(key);if(!b){if(V.rx.size>6)V.rx.clear();b={n:m.n,parts:[],got:0,at:Date.now()};V.rx.set(key,b)}if(b.n!==m.n||b.parts[m.i]!=null)return;b.parts[m.i]=m.d;b.got++;
  if(b.got===b.n){V.rx.delete(key);unpack(b.parts.join('')).then(str=>{let o;try{o=JSON.parse(str)}catch(_){return}const s=validate(o);if(!s)return;if(V.pend!==m.id&&!(V.on&&V.owner===m.id))return;
   const pn=NetMP.peers.get(m.id);apply(m.id,s,(pn&&pn.name)||s.n||T('Friend','Amigo'))}).catch(()=>{})}}}
V.msg=onMsg;Object.defineProperty(V,'active',{get:()=>V.on});
// ---------- visitor side ----------
V.request=id=>{if(!NetMP.peers.has(id)){toast(T('That player is not online.','Ese jugador no está conectado.'));return}V.pend=id;tx({t:'hvReq',to:id,rz:NetMP.zk()});toast(T('🏠 Asking to visit…','🏠 Pidiendo visitar…'));
 setTimeout(()=>{if(V.pend===id){V.pend=null;toast(T('🏠 Visit not delivered — try again.','🏠 Visita no entregada — inténtalo de nuevo.'))}},14000)};
NetMP.visit=V.request;
function toJSON(){const o=Object.assign({},this);delete o.toJSON;const r=V.real;if(!r)return o;o.home=r.home;o.zones=Object.assign({},this.zones,{home:r.zh});o.fauna=r.fauna;o.active=r.active;o.zone='home';return o}
function apply(id,s,name){const first=!V.on;V.pend=null;
 if(first){try{if(window.FSarr&&FSarr.on)FSarr.setOn(false)}catch(_){}rt.decor=null;rt.paint=null;V.real={home:S.home,zh:zs('home'),fauna:S.fauna,active:S.active};Object.defineProperty(S,'toJSON',{value:toJSON,configurable:true,writable:true,enumerable:false})}
 const own=V.real.fauna[V.real.active];S.home=Object.assign({decor:[],paint:{}},s.h);{const H=S.home,o=x=>x&&typeof x==='object'&&!Array.isArray(x),n=x=>typeof x==='number'&&isFinite(x);if(!o(H.paint))H.paint={};if(!o(H.nest))H.nest={egg:null,inc:null,at:0};if(!o(H.treat)||!n(H.treat.count)||!n(H.treat.last))H.treat={count:0,last:now()};if(!o(H.totem)||!n(H.totem.last))H.totem={last:now()}}S.zones.home=s.z;S.fauna=[own].concat(s.f);S.active=0;
 V.on=true;V.owner=id;V.name=name;V.offline=false;
 if(first){if(S.zone!=='home'){S.zone='home'}const n=s.z.tiles.length,c=(n-1)/2;rt.pos={i:c,j:c+1.5};rt.tgt=null;try{Sound.sfx('gate')}catch(_){}toast('🏠 '+T('Visiting ','Visitando la casa de ')+tn(name)+T("'s home",''))}
 try{G.rebuildIsland&&G.rebuildIsland()}catch(_){}banner();NetMP.announce&&NetMP.announce()}
function exit(){if(!V.on)return;const r=V.real;S.home=r.home;S.zones.home=r.zh;S.fauna=r.fauna;S.active=r.active;delete S.toJSON;V.on=false;V.real=null;V.owner=null;V.offline=false;
 try{G.rebuildIsland&&G.rebuildIsland()}catch(_){}banner();NetMP.announce&&NetMP.announce();try{save()}catch(_){}}
V.exit=exit;V.home=()=>{exit();const n=zs('home').tiles.length,c=(n-1)/2;rt.pos={i:c,j:c+1};rt.tgt=null;toast(T('🏡 Back home','🏡 De vuelta en casa'))};
// presence: visiting zone key = owner's home; tag my status so the owner knows I'm a visitor
const zk0=NetMP.zk;NetMP.zk=()=>V.on?'home:'+V.owner:zk0();
// travel anywhere (incl. Home button / faint warp) ends the visit first
const trv=R.travel;R.travel=p=>{if(V.on){const goHome=p&&p.zone==='home';V.home();if(goHome)return}return trv(p)};
// view-only: block every mutating action while visiting
const OK=new Set(['travel','trick','feed','heal','rest','useHappy','useCream','wear','collar','learn','giftStart','giftTo','giftAccept','giftDecline','skill']);
const dsp=dispatch;dispatch=window.dispatch=function(type,p){if(V.on&&!OK.has(type)){toast(T('👀 View only — this is a friend\'s home.','👀 Solo mirar — es la casa de un amigo.'));return}return dsp(type,p)};
setInterval(()=>{try{if(V.on){if(window.FSarr&&FSarr.on){FSarr.setOn(false);toast(T('👀 View only — you can\'t edit a friend\'s home.','👀 Solo mirar — no puedes editar la casa de un amigo.'))}rt.decor=null;if(rt.paint!=null)rt.paint=null;
  if(S.zone!=='home'){exit()}const off=!NetMP.peers.has(V.owner);if(off!==V.offline){V.offline=off;banner();if(!off){tx({t:'hvReq',to:V.owner,rz:NetMP.zk()});V.pend=null}}}}catch(_){}},300);
// v8.1.4: while visiting, the banner takes the place of the world-name pill (it used to sit on top of it and the Server/Goals row)
setInterval(()=>{try{const H=document.documentElement,b=document.getElementById('visitbar'),zn=document.getElementById('zoneName');H.classList.toggle('fsvisit',!!(V.on&&b));
 if(V.on&&b&&zn){const r=zn.getBoundingClientRect();if(r.height>0){const t=Math.round(r.top)+'px';if(b.style.top!==t)b.style.top=t}}}catch(_){}},300);
try{const st=document.createElement('style');st.textContent='html.fsvisit #zoneName{visibility:hidden!important}#visitbar>span{white-space:nowrap;line-height:1.2;overflow:hidden;text-overflow:ellipsis;min-width:0}';document.head.appendChild(st)}catch(_){}
// banner
function banner(){let b=document.getElementById('visitbar');if(!V.on){if(b)b.remove();return}if(!b){b=document.createElement('div');b.id='visitbar';b.style.cssText='position:absolute;left:50%;transform:translateX(-50%);top:max(64px,calc(env(safe-area-inset-top) + 58px));z-index:40;background:rgba(23,60,15,.9);color:#fff;border:2px solid #3ea318;border-radius:16px;padding:6px 10px;font:700 13px "Trebuchet MS",sans-serif;display:flex;gap:8px;align-items:center;max-width:92vw;box-shadow:0 3px 10px rgba(0,0,0,.3)';(document.getElementById('stage')||document.body).appendChild(b)}
 b.innerHTML=`<span>🏠 ${T('Visiting ','Visitando la casa de ')}${esc(V.name)}${T("'s home",'')}${V.offline?`<br><span style="color:#ffd27a;font-weight:400;font-size:11px">${T('They went offline — showing their last home.','Se desconectó — mostrando su última casa.')}</span>`:''}</span><button id="visitback" style="background:#3ea318;color:#fff;border:0;border-radius:12px;padding:5px 9px;font:700 12px sans-serif;white-space:nowrap">${T('Back home','Volver a casa')}</button>`;
 b.querySelector('#visitback').onclick=e=>{e.stopPropagation();V.home()}}
// taps: tap another player's fauna -> card with Visit home; tap a friend's roaming fauna -> name card (no Switch)
const tp=tap;tap=window.tap=function(px,py){try{
 if(V.on&&window.roamHit){const i=roamHit(px,py);if(i!=null&&S.fauna[i]&&i!==0){const f=S.fauna[i],sp=(SPECIES[f.genes.species]||{}).name||f.genes.species,rr=f.rarity&&window.RARITY&&RARITY[f.rarity];try{Sound.sfx('click')}catch(_){}
  open(`<h2>🐾 ${esc(f.name)}</h2><p>${esc(sp)} · Lv ${f.level|0}${rr?` · <b style="color:${rr.c}">${esc(rr.name)}</b>`:''}</p><p class="small">${T(esc(V.name)+"'s fauna",'Fauna de '+esc(V.name))}</p>`);return}}
 if(window.remoteHit&&NetMP.room){const id=remoteHit(px,py);const p=id&&NetMP.peers.get(id);if(p){try{Sound.sfx('click')}catch(_){}ui('hvPlayer',{id});return}}}catch(e){}return tp(px,py)};
// UI
const ui0=ui;ui=function(v,p={}){
 if(v==='hvPlayer'){const q=NetMP.peers.get(p.id);if(!q)return close();cur={...p,v};const own=q.zk==='home:'+q.id;
  open(`<h2>👤 ${esc(q.name)}</h2><p>${esc(q.fname)} <span class="small">(${q.genes&&SPECIES[q.genes.species]?SPECIES[q.genes.species].name:''} Lv ${q.level|0})</span></p>`+(V.on&&V.owner===q.id?`<p class="small">${T("You're in their home.",'Estás en su casa.')}</p>`:btn('🏠 '+T('Visit home','Visitar casa'),'ui',{v:'hvGo',id:q.id})));return}
 if(v==='hvGo'){close();return V.request(p.id)}
 if(v==='hvAllow'){S.visitsOff=p.off?1:0;try{save()}catch(_){}toast(p.off?T('🔒 Visits off','🔒 Visitas desactivadas'):T('🏠 Other players can visit your home','🏠 Otros jugadores pueden visitar tu casa'));if(p.off)for(const q of visitorsHere())tx({t:'hvNo',to:q.id,why:'off'});return ui('friends')}
 if(v==='fauna'&&V.on){toast(T('Go back home to manage your fauna.','Vuelve a casa para cuidar tu fauna.'));return}
 const r=ui0(v,p);
 if(v==='friends'){try{const mb=document.getElementById('mb')||MB;mb.querySelectorAll('button[data-a="ui"]').forEach(b=>{let d={};try{d=JSON.parse(b.dataset.p||'{}')}catch(_){}if(d.v==='mpVisit'){b.dataset.p=JSON.stringify({v:'hvGo',id:d.id});b.textContent='🏠 '+T('Visit home','Visitar casa')}});
  const off=!!S.visitsOff,div=document.createElement('div');div.className='row';div.innerHTML=`<div class="grow">🏠 ${T('Allow visits:','Permitir visitas:')} <b>${off?T('Nobody','Nadie'):T('Everyone','Todos')}</b></div>`+btn(off?T('Everyone','Todos'):T('Nobody','Nadie'),'ui',{v:'hvAllow',off:off?0:1});
  const h=mb.querySelector('h2');h&&h.parentNode.insertBefore(div,h.nextSibling);
  if(V.on){const d2=document.createElement('div');d2.className='row';d2.innerHTML=`<div class="grow">🏠 ${T('Visiting ','Visitando a ')}${esc(V.name)}</div><button class="btn" id="hvback">${T('Back home','Volver a casa')}</button>`;h&&h.parentNode.insertBefore(d2,div);d2.querySelector('#hvback').onclick=()=>{close();V.home()}}}catch(e){}}
 return r};
const hookPvp=()=>{if(!window.FSPvP||FSPvP._hv)return;FSPvP._hv=1;const em=FSPvP.extraMenu;FSPvP.extraMenu=p=>(em?em(p):'')+(p&&!(V.on&&V.owner===p.id)?btn('🏠 '+T('Visit home','Visitar casa'),'ui',{v:'hvGo',id:p.id}):'')};
hookPvp();window.addEventListener('load',hookPvp);setTimeout(hookPvp,1500);
console.log('[FaunaMySphere] home visits ready');
})();

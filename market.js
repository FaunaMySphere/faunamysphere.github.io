'use strict';
// v7.0 Lux/Bux Marketplace (Leo). Serverless player market over the shared 'all' channel (net.js) + an NPC Shop that works offline.
// Safety without a server: escrow + two-sided confirm.
//  list   -> goods leave the seller's save into S.mkt.my (escrow); cancel/expire returns them.
//  buy    -> buyer deducts price into S.mkt.hold[bid] (persisted) and sends mkBuy.
//  seller -> locks the listing to that bid (one buyer only) and sends mkOk with the goods (re-sent until resolved).
//  buyer  -> validates goods == advertised listing, adds them, records done[bid] (persisted) BEFORE replying mkGot.
//  seller -> on mkGot removes the listing and is paid once (paid[bid]). No mkOk within 25s -> buyer aborts, refunds, sends mkAbort;
//            any later mkOk for that bid is answered mkAbort, so the seller unlocks. Unknown bid -> mkAbort. Both sides idempotent.
// Save: S.mkt (new field, safe defaults). Nothing ever writes to another player's save.
(function(){
const ES=()=>window.LANG==='es',T=(en,es)=>ES()?es:en,esc=s=>String(s==null?'':s).replace(/'/g,'’').replace(/[<>&"`\\]/g,'');
const qs=new URLSearchParams(location.search);
let TTL=24*3600e3;const HOLD_MS=25000,LOCK_MAX=72*3600e3,MAXL=8,MAXBUY_HR=12,MAXLIST_HR=20,SEEN_MS=50000;
const CAP={lux:100000,bux:500},MAXF=10,MAXE=6;
const NM=()=>window.NetMP;
const M=()=>{let m=S.mkt;if(!m||typeof m!=='object'||Array.isArray(m))m=S.mkt={};for(const k of['my','log','buys','lists'])if(!Array.isArray(m[k]))m[k]=[];for(const k of['hold','done','ab','paid','shopN'])if(!m[k]||typeof m[k]!=='object'||Array.isArray(m[k]))m[k]={};m.sold|=0;m.bought|=0;return m};
const persist=()=>{try{save();window.FSidb&&FSidb.flush&&FSidb.flush(localStorage.getItem('faunasphere_save_v3'))}catch(e){}};
const visiting=()=>!!(window.FSVisit&&FSVisit.active);
const online=()=>{const n=NM();return !!(n&&n.room&&(n.status==='online'||(n.relay&&n.relay.up)))};
const send=m=>{try{m._z='all';NM().send(m)}catch(e){}};
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const myName=()=>{try{const f=fa();return(S.player.name&&S.player.name!=='Caretaker'?S.player.name:(f?f.name+"'s Caretaker":'Caretaker')).slice(0,20)}catch(e){return'Caretaker'}};
const tn=s=>{try{return window.FS&&FS.t?FS.t(s):(window.T&&window.T!==T?window.T(s):s)}catch(e){return s}};
const spName=sp=>{try{return tn(SPECIES[sp].name)}catch(e){return String(sp||'')}};
const HK=()=>window.FSHOUSES||{};
const curIc=c=>c==='bux'?'<b style="color:#f2c230">■</b>':'<b style="color:#9dff3a">●</b>';
const log=(en,es)=>{const m=M();m.log.unshift({en,es,at:Date.now()});if(m.log.length>40)m.log.length=40};
const toast2=(en,es)=>{try{toast(T(en,es))}catch(e){}};
const recent=(arr,ms)=>arr.filter(t=>Date.now()-t<ms);
// ---------- goods ----------
function summary(L){const g=L.g;if(L.kind==='item'){const it=ITEMS[g.key]||{};return{ic:it.icon||'📦',nm:tn(it.name||g.key)+(g.n>1?' ×'+g.n:'')}}
 if(L.kind==='egg')return{ic:'🥚',nm:T('Egg','Huevo')+(g.genes&&SPECIES[g.genes.species]?' · '+spName(g.genes.species):'')};
 if(L.kind==='house'){const[k,s]=String(g.key).split(':');const K=HK()[k]||{};return{ic:K.icon||'🏠',nm:(ES()?K.es:K.name||k)+' #'+((s|0)+1)}}
 if(L.kind==='fauna'){const f=g.f||{};return{ic:'🐾',nm:esc(f.name).slice(0,16)+' · '+spName(f.genes&&f.genes.species)+' · '+T('Lv','Nv')+' '+(f.level|0)+(f.rarity?' · '+tn(f.rarity):'')}}
 return{ic:'❔',nm:'?'}}
function sellables(){const P=S.player,out=[];
 for(const k of Object.keys(P.inv||{}))if((P.inv[k]|0)>0&&ITEMS[k])out.push({kind:'item',key:k,max:P.inv[k]|0,ic:ITEMS[k].icon||'📦',nm:tn(ITEMS[k].name)});
 (P.eggs||[]).forEach(e=>{if(e&&e.genes)out.push({kind:'egg',key:e.id,max:1,ic:'🥚',nm:T('Egg','Huevo')+(SPECIES[e.genes.species]?' · '+spName(e.genes.species):'')})});
 const H=P.houses||{};for(const k of Object.keys(H))if((H[k]|0)>0){const[kk,s]=k.split(':');const K=HK()[kk];if(K)out.push({kind:'house',key:k,max:H[k]|0,ic:K.icon||'🏠',nm:(ES()?K.es:K.name||kk)+' #'+((s|0)+1)})}
 if(S.fauna.length>1)S.fauna.forEach((f,i)=>{if(i!==S.active&&f&&f.genes)out.push({kind:'fauna',key:f.id,max:1,ic:'🐾',nm:esc(f.name)+' · '+spName(f.genes.species)+' · '+T('Lv','Nv')+' '+(f.level|0)})});
 return out}
function take(kind,key,n){const P=S.player;
 if(kind==='item'){if((P.inv[key]|0)<n||n<1)return null;P.inv[key]-=n;if(!P.inv[key])delete P.inv[key];return{key,n}}
 if(kind==='egg'){const i=(P.eggs||[]).findIndex(e=>e.id===key);if(i<0)return null;const e=P.eggs.splice(i,1)[0];return{key:e.id,egg:e}}
 if(kind==='house'){const H=P.houses||{};if((H[key]|0)<n||n<1)return null;H[key]-=n;if(!H[key])delete H[key];return{key,n}}
 if(kind==='fauna'){const i=S.fauna.findIndex(f=>f.id===key);if(i<0||i===S.active||S.fauna.length<=1)return null;const act=S.fauna[S.active].id;const f=S.fauna.splice(i,1)[0];S.active=Math.max(0,S.fauna.findIndex(x=>x.id===act));return{key:f.id,f}}
 return null}
function room(kind){if(kind==='fauna'&&S.fauna.length>=MAXF)return T('Your fauna slots are full (10/10).','Tus espacios de fauna están llenos (10/10).');if(kind==='egg'&&(S.player.eggs||[]).length>=MAXE)return T('Your egg basket is full (6).','Tu canasta de huevos está llena (6).');return''}
function give(kind,g){const P=S.player;
 if(kind==='item'){P.inv[g.key]=(P.inv[g.key]|0)+g.n}
 else if(kind==='egg'){const e=JSON.parse(JSON.stringify(g.egg));e.id='egg'+Date.now()+Math.random();(P.eggs=P.eggs||[]).push(e)}
 else if(kind==='house'){P.houses=P.houses||{};P.houses[g.key]=(P.houses[g.key]|0)+g.n}
 else if(kind==='fauna'){const f=JSON.parse(JSON.stringify(g.f));f.id='f'+Date.now()+Math.floor(Math.random()*999);S.fauna.push(f)}}
// strict validation of goods received from a seller against the advertised listing
function valid(kind,g,sum){if(!g||typeof g!=='object')return false;
 if(kind==='item')return typeof g.key==='string'&&!!ITEMS[g.key]&&Number.isInteger(g.n)&&g.n>=1&&g.n<=99&&g.key===sum.key&&g.n===sum.n;
 if(kind==='house'){const[k]=String(g.key).split(':');return !!HK()[k]&&/^[a-z]+:\d$/.test(g.key)&&Number.isInteger(g.n)&&g.n>=1&&g.n<=9&&g.key===sum.key&&g.n===sum.n}
 if(kind==='egg'){const e=g.egg;return !!(e&&e.genes&&typeof e.genes==='object'&&SPECIES[e.genes.species]&&JSON.stringify(e).length<4000)}
 if(kind==='fauna'){const f=g.f;if(!(f&&f.genes&&typeof f.genes==='object'&&SPECIES[f.genes.species]&&JSON.stringify(f).length<20000))return false;f.name=esc(f.name).slice(0,20)||'Fauna';f.level=Math.max(1,Math.min(99,f.level|0));return true}
 return false}
// ---------- seller ----------
function pub(L){const s=summary(L);return{lid:L.lid,kind:L.kind,key:L.kind==='item'||L.kind==='house'?L.g.key:'',n:L.g.n|0,ic:s.ic,nm:s.nm,price:L.price,cur:L.cur,exp:L.exp,lock:!!L.lock}}
let lastBc=0;function broadcast(force){if(!online())return;const m=M();if(!m.my.length&&!force)return;if(Date.now()-lastBc<2500)return;lastBc=Date.now();send({t:'mkL',sn:myName(),ts:Date.now(),ls:m.my.map(pub)})}
function list(kind,key,n,price,cur){const m=M();if(visiting())return toast2('You can’t sell while visiting.','No puedes vender mientras visitas.');
 if(m.my.length>=MAXL)return toast2('You can have up to 8 listings.','Puedes tener hasta 8 anuncios.');
 m.lists=recent(m.lists,3600e3);if(m.lists.length>=MAXLIST_HR)return toast2('Too many listings this hour. Try later.','Demasiados anuncios esta hora. Inténtalo más tarde.');
 price=Math.floor(+price);if(cur!=='bux')cur='lux';if(!(price>=1&&price<=CAP[cur]))return toast2('Price must be 1–'+CAP[cur]+'.','El precio debe ser 1–'+CAP[cur]+'.');
 n=Math.max(1,Math.min(99,Math.floor(+n)||1));if(kind!=='item'&&kind!=='house')n=1;
 const g=take(kind,key,n);if(!g)return toast2('You don’t have that anymore.','Ya no tienes eso.');
 const L={lid:uid('L'),kind,g,price,cur,at:Date.now(),exp:Date.now()+TTL,lock:null};m.my.push(L);m.lists.push(Date.now());persist();try{renderHUD()}catch(e){}
 toast('🛒 '+T('Listed! It shows to players online while you are online.','¡Anunciado! Se muestra a los jugadores conectados mientras estés conectado.'));lastBc=0;broadcast(true);return true}
function giveBack(L,why){give(L.kind,L.g);const s=summary(L);log((why==='exp'?'⌛ Expired, returned: ':'↩️ Cancelled, returned: ')+s.nm,(why==='exp'?'⌛ Expiró, devuelto: ':'↩️ Cancelado, devuelto: ')+s.nm)}
function cancel(lid){const m=M(),i=m.my.findIndex(x=>x.lid===lid);if(i<0)return;const L=m.my[i];if(L.lock)return toast2('A buyer is confirming this one — try again in a moment.','Un comprador está confirmando — inténtalo en un momento.');
 if(visiting())return toast2('Go home first.','Vuelve a casa primero.');m.my.splice(i,1);giveBack(L,'cancel');persist();lastBc=0;broadcast(true);toast2('↩️ Listing cancelled — returned to you.','↩️ Anuncio cancelado — se te devolvió.')}
function onBuy(m){const s=M(),L=s.my.find(x=>x.lid===m.lid);const no=why=>send({t:'mkNo',to:m.id,bid:m.bid,why});
 if(typeof m.bid!=='string'||m.bid.length>40)return;
 if(s.paid[m.bid])return; // already completed
 if(!L)return no('gone');if(L.lock){if(L.lock.bid===m.bid)sendOk(L);else no('pending');return}
 if(L.exp<Date.now())return no('gone');if(m.price!==L.price||m.cur!==L.cur)return no('price');if(visiting())return no('busy');
 L.lock={bid:m.bid,buyer:m.id,at:Date.now(),n:0};persist();sendOk(L);lastBc=0;broadcast(true)}
function sendOk(L){if(!L.lock)return;L.lock.n++;L.lock.last=Date.now();send({t:'mkOk',to:L.lock.buyer,bid:L.lock.bid,lid:L.lid,kind:L.kind,g:L.g,price:L.price,cur:L.cur})}
function onGot(m){const s=M();if(s.paid[m.bid])return;const i=s.my.findIndex(x=>x.lock&&x.lock.bid===m.bid&&x.lock.buyer===m.id);if(i<0)return;const L=s.my[i];
 s.my.splice(i,1);s.paid[m.bid]=Date.now();S.player[L.cur]=(S.player[L.cur]|0)+L.price;s.sold++;const nm=summary(L).nm,bn=(NM().peers.get(m.id)||{}).name||T('a player','un jugador');
 log('💰 Sold '+nm+' to '+bn+' for '+L.price+' '+(L.cur==='bux'?'Bux':'Lux'),'💰 Vendiste '+nm+' a '+bn+' por '+L.price+' '+(L.cur==='bux'?'Bux':'Lux'));persist();try{renderHUD()}catch(e){}
 toast('💰 '+T('Sold! ','¡Vendido! ')+nm+' → '+esc(bn)+' (+'+L.price+' '+(L.cur==='bux'?'Bux':'Lux')+')');try{Sound.sfx('fanfare')}catch(e){}lastBc=0;broadcast(true);refresh()}
function onAbort(m){const s=M(),L=s.my.find(x=>x.lock&&x.lock.bid===m.bid&&x.lock.buyer===m.id);if(!L)return;L.lock=null;persist();lastBc=0;broadcast(true);refresh()}
// ---------- buyer ----------
const shelf=new Map();// lid -> listing seen
function onList(m,p){if(!Array.isArray(m.ls)||!(Math.abs(Date.now()-(+m.ts||0))<30000))return;const now=Date.now();for(const[k,v]of shelf)if(v.sid===m.id)shelf.delete(k);
 for(const x of m.ls.slice(0,MAXL)){if(!x||typeof x.lid!=='string'||x.lid.length>40)continue;const cur=x.cur==='bux'?'bux':'lux',price=Math.floor(+x.price);if(!(price>=1&&price<=CAP[cur]))continue;
  if(!['item','egg','house','fauna'].includes(x.kind))continue;if(+x.exp<now)continue;
  shelf.set(x.lid,{lid:x.lid,kind:x.kind,key:String(x.key||'').slice(0,40),n:Math.max(1,Math.min(99,x.n|0)),ic:esc(x.ic).slice(0,4)||'📦',nm:esc(x.nm).slice(0,60),price,cur,exp:+x.exp,lock:!!x.lock,sid:m.id,sn:esc((p&&p.name)||m.sn||'?').slice(0,20),seen:now})}
 refresh()}
function buy(lid){const x=shelf.get(lid),s=M();if(!x)return toast2('That listing is gone.','Ese anuncio ya no está.');if(visiting())return toast2('Go home first.','Vuelve a casa primero.');
 if(x.sid===NM().myId)return;if(Object.values(s.hold).length)return toast2('Finish your current purchase first.','Termina tu compra actual primero.');
 s.buys=recent(s.buys,3600e3);if(s.buys.length>=MAXBUY_HR)return toast2('Purchase limit reached (12/hour).','Límite de compras alcanzado (12/hora).');
 const r=room(x.kind);if(r)return toast(r);if((S.player[x.cur]|0)<x.price)return toast2('Not enough '+(x.cur==='bux'?'Bux':'Lux')+'.','No tienes suficientes '+(x.cur==='bux'?'Bux':'Lux')+'.');
 if(!confirm(T('Buy ','¿Comprar ')+x.nm+T(' for ',' por ')+x.price+' '+(x.cur==='bux'?'Bux':'Lux')+'?'))return;
 const bid=uid('B');S.player[x.cur]-=x.price;s.hold[bid]={bid,lid,sid:x.sid,sn:x.sn,price:x.price,cur:x.cur,kind:x.kind,key:x.key,n:x.n,nm:x.nm,at:Date.now()};s.buys.push(Date.now());persist();try{renderHUD()}catch(e){}
 send({t:'mkBuy',to:x.sid,bid,lid,price:x.price,cur:x.cur});toast('🛒 '+T('Asking ','Preguntando a ')+x.sn+'…');refresh()}
function refund(h){S.player[h.cur]=(S.player[h.cur]|0)+h.price;delete M().hold[h.bid]}
function abort(h,why){const s=M();refund(h);s.ab[h.bid]={at:Date.now(),sid:h.sid};send({t:'mkAbort',to:h.sid,bid:h.bid});persist();try{renderHUD()}catch(e){}
 toast('↩️ '+(why==='full'?room(h.kind):why==='bad'?T('Trade failed a safety check — refunded.','La compra falló una verificación — reembolsado.'):T('Seller didn’t confirm — refunded.','El vendedor no confirmó — reembolsado.')));refresh()}
function onOk(m){const s=M();if(typeof m.bid!=='string')return;
 if(s.done[m.bid]){send({t:'mkGot',to:m.id,bid:m.bid});return}
 const h=s.hold[m.bid];if(!h||h.sid!==m.id){send({t:'mkAbort',to:m.id,bid:m.bid});return}
 if(m.lid!==h.lid||m.kind!==h.kind||m.price!==h.price||m.cur!==h.cur||!valid(h.kind,m.g,h))return abort(h,'bad');
 if(room(h.kind))return abort(h,'full');
 give(h.kind,m.g);delete s.hold[h.bid];s.done[h.bid]={at:Date.now(),sid:h.sid};s.bought++;
 log('🛍️ Bought '+h.nm+' from '+h.sn+' for '+h.price+' '+(h.cur==='bux'?'Bux':'Lux'),'🛍️ Compraste '+h.nm+' a '+h.sn+' por '+h.price+' '+(h.cur==='bux'?'Bux':'Lux'));
 persist();send({t:'mkGot',to:m.id,bid:h.bid});shelf.delete(h.lid);try{renderHUD()}catch(e){}
 toast('🛍️ '+T('You got ','Obtuviste ')+h.nm+'!');try{Sound.sfx('fanfare')}catch(e){}refresh()}
function onNo(m){const h=M().hold[m.bid];if(!h||h.sid!==m.id)return;refund(h);M().ab[m.bid]={at:Date.now(),sid:h.sid};persist();try{renderHUD()}catch(e){}
 toast('↩️ '+(m.why==='pending'?T('Someone else is buying that — refunded.','Alguien más lo está comprando — reembolsado.'):T('That listing is no longer available — refunded.','Ese anuncio ya no está disponible — reembolsado.')));shelf.delete(h.lid);refresh()}
// ---------- loop ----------
function tick(){if(typeof S==='undefined'||!S||!S.player)return;const s=M(),now=Date.now();let ch=false;
 for(const h of Object.values(s.hold)){if(now-h.at>HOLD_MS){abort(h,'timeout');ch=true}else if(online()&&now-(h.rs||h.at)>3500){h.rs=now;send({t:'mkBuy',to:h.sid,bid:h.bid,lid:h.lid,price:h.price,cur:h.cur})}}
 for(let i=s.my.length-1;i>=0;i--){const L=s.my[i];
  if(L.lock){if(now-L.lock.at>LOCK_MAX){L.lock=null;ch=true}else if(online()&&now-(L.lock.last||0)>(L.lock.n<6?4000:15000))sendOk(L);continue}
  if(L.exp<now&&!visiting()){s.my.splice(i,1);giveBack(L,'exp');ch=true;toast2('⌛ A listing expired and came back to you.','⌛ Un anuncio expiró y volvió a ti.')}}
 for(const k of['done','ab','paid'])for(const b of Object.keys(s[k])){const v=s[k][b];if(now-(+v.at||+v||0)>7*864e5)delete s[k][b]}
 for(const[k,v]of shelf)if(now-v.seen>SEEN_MS||v.exp<now)shelf.delete(k);
 if(ch){persist();lastBc=0;try{renderHUD()}catch(e){}refresh()}
 if(now-lastBc>15000)broadcast()}
// ---------- NPC shop ----------
const day=()=>new Date().toISOString().slice(0,10);
function hsh(s){let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
const BASEP={food:12,mat:35,decor:110,tool:250};
function shopStock(){const d=day(),ks=Object.keys(ITEMS).filter(k=>{const it=ITEMS[k];return it&&BASEP[it.type]&&!it.premium&&!it.hidden&&!(window.FS_B3&&FS_B3[k])&&!/_hot_|_cold_|totem_|trophy/.test(k)}).sort((a,b)=>hsh(d+a)-hsh(d+b)).slice(0,8);
 return ks.map(k=>({k,p:Math.round(BASEP[ITEMS[k].type]*(1+(hsh(d+'p'+k)%5)*.25))}))}
const sellBack=k=>{const it=ITEMS[k];if(!it||!BASEP[it.type])return 0;const v=Math.max(2,Math.round(BASEP[it.type]*.3)),b3=window.FS_B3&&FS_B3[k];return b3&&b3.price?Math.max(1,Math.min(v,Math.floor(b3.price*.5))):v};// v8.3.6: Build items cost 15-30 Lux but sold back for 33 (free Lux loop) → never more than half their price
function shopBuy(k,p){const s=M(),d=day();if(s.shopDay!==d){s.shopDay=d;s.shopN={}}const st=shopStock().find(x=>x.k===k);if(!st||st.p!==p)return;
 if((s.shopN[k]|0)>=5)return toast2('Sold out today — new stock tomorrow.','Agotado hoy — más mañana.');if(S.player.lux<p)return toast2('Not enough Lux.','No tienes suficiente Lux.');
 S.player.lux-=p;S.player.inv[k]=(S.player.inv[k]|0)+1;s.shopN[k]=(s.shopN[k]|0)+1;persist();try{renderHUD();Sound.sfx('pop')}catch(e){}refresh()}
function shopEgg(){const s=M(),d=day();if(s.shopDay!==d){s.shopDay=d;s.shopN={}}if(s.shopN._egg)return toast2('One Mystery Egg per day.','Un Huevo Misterioso por día.');
 if((S.player.eggs||[]).length>=MAXE)return toast(room('egg'));if(S.player.lux<750)return toast2('Not enough Lux.','No tienes suficiente Lux.');const f=fa();if(!f)return;
 S.player.lux-=750;S.player.eggs.push({id:'egg'+Date.now()+Math.random(),genes:{...f.genes,heatProof:false},parent:T('NPC Shop','Tienda')});s.shopN._egg=1;persist();try{renderHUD();Sound.sfx('fanfare')}catch(e){}toast2('🥚 Mystery Egg added — hatch it in your Nest!','🥚 ¡Huevo Misterioso añadido — incúbalo en tu Nido!');refresh()}
function shopSell(k){const s=M(),d=day();if(s.shopDay!==d){s.shopDay=d;s.shopN={}}const v=sellBack(k);if(!v||!(S.player.inv[k]>0))return;if((s.shopN._sold|0)>=30)return toast2('The shop won’t buy more today.','La tienda no compra más hoy.');
 S.player.inv[k]--;if(!S.player.inv[k])delete S.player.inv[k];S.player.lux+=v;s.shopN._sold=(s.shopN._sold|0)+1;persist();try{renderHUD();Sound.sfx('pop')}catch(e){}refresh()}
// ---------- UI ----------
let tab='browse',filt='all',fcur='all',sel=null;
const chip=(on,lab,js)=>'<button class="btn" style="padding:4px 9px;font-size:12px;margin:2px;'+(on?'background:#ffe25a;color:#173c0f':'opacity:.85')+'" onclick="'+js+'">'+lab+'</button>';
const KL={all:['All','Todo'],item:['Items','Objetos'],egg:['Eggs','Huevos'],house:['Houses','Casas'],fauna:['Fauna','Fauna']};
const row=(ic,main,sub,right)=>'<div class="row" style="display:flex;align-items:center;gap:8px;background:#0002;border-radius:10px;padding:6px 8px;margin:4px 0"><span style="font-size:24px">'+ic+'</span><div class="grow" style="flex:1;min-width:0"><b>'+main+'</b><div class="small" style="opacity:.85">'+sub+'</div></div>'+right+'</div>';
const ago=t=>{const s=Math.max(0,Math.round((t-Date.now())/60000));return s>=60?Math.round(s/60)+'h':s+'m'};
function view(){const s=M(),A='FSMkt.a';let h='<h2>🛒 '+T('Marketplace','Mercado')+'</h2><div style="display:flex;flex-wrap:wrap;gap:2px;margin-bottom:6px">'+
 [['browse','🔎 '+T('Browse','Explorar')],['sell','🏷️ '+T('Sell','Vender')],['mine','📋 '+T('My listings','Mis anuncios')+(s.my.length?' ('+s.my.length+')':'')],['shop','🏪 '+T('Shop','Tienda')],['log','📜 '+T('History','Historial')]].map(([k,l])=>chip(tab===k,l,A+"('tab','"+k+"')")).join('')+'</div>';
 if(visiting())return h+'<p>'+T('The Marketplace opens when you are back home or in a world.','El Mercado se abre cuando vuelvas a casa o a un mundo.')+'</p>';
 const pend=Object.values(s.hold);if(pend.length)h+='<p class="small">⏳ '+T('Confirming purchase with ','Confirmando compra con ')+esc(pend[0].sn)+'…</p>';
 if(tab==='browse'){const n=NM();h+='<div>'+Object.keys(KL).map(k=>chip(filt===k,KL[k][ES()?1:0],A+"('f','"+k+"')")).join('')+chip(fcur==='all','●■',A+"('c','all')")+chip(fcur==='lux',curIc('lux')+' Lux',A+"('c','lux')")+chip(fcur==='bux',curIc('bux')+' Bux',A+"('c','bux')")+'</div>';
  const xs=[...shelf.values()].filter(x=>(filt==='all'||x.kind===filt)&&(fcur==='all'||x.cur===fcur)).sort((a,b)=>a.cur===b.cur?a.price-b.price:a.cur==='lux'?-1:1);
  if(!online())h+='<p>📡 '+T('Offline — player listings appear when you are connected. The 🏪 Shop always works.','Sin conexión — los anuncios aparecen cuando estés conectado. La 🏪 Tienda siempre funciona.')+'</p>';
  else if(!xs.length)h+='<p>'+T('No listings from players online right now. Try 🏪 Shop, or list something yourself!','No hay anuncios de jugadores conectados ahora. ¡Prueba la 🏪 Tienda o vende algo tú!')+'</p>';
  h+=xs.map(x=>row(x.ic,x.nm,T('by ','de ')+x.sn+' · ⌛ '+ago(x.exp),x.lock?'<span class="small">⏳ '+T('pending','pendiente')+'</span>':'<button class="btn" onclick="'+A+"('buy','"+x.lid+"')"+'">'+curIc(x.cur)+' '+x.price+'</button>')).join('')}
 else if(tab==='sell'){if(sel){const it=sel;h+='<p><b>'+it.ic+' '+it.nm+'</b></p>'+(it.max>1?'<label>'+T('Quantity','Cantidad')+' <input id="mkn" type="number" min="1" max="'+Math.min(99,it.max)+'" value="1" style="width:70px"></label><br>':'')+
   '<label>'+T('Price','Precio')+' <input id="mkp" type="number" min="1" value="'+(it.kind==='fauna'?500:it.kind==='house'?600:it.kind==='egg'?400:20)+'" style="width:90px"></label> <select id="mkc"><option value="lux">Lux</option><option value="bux">Bux</option></select>'+
   '<p class="small">'+T('It leaves your bag while listed. Cancel any time to get it back. Expires in 24h.','Sale de tu bolsa mientras esté anunciado. Cancela cuando quieras para recuperarlo. Expira en 24h.')+'</p><button class="btn" onclick="'+A+"('list')"+'">✅ '+T('List it','Anunciar')+'</button> <button class="btn" onclick="'+A+"('unsel')"+'">'+T('Back','Atrás')+'</button>'}
  else{const it=sellables();h+=it.length?it.map((x,i)=>row(x.ic,x.nm,(x.max>1?'×'+x.max+' · ':'')+KL[x.kind][ES()?1:0],'<button class="btn" onclick="'+A+"('pick',"+i+')">🏷️ '+T('Sell','Vender')+'</button>')).join(''):'<p>'+T('Nothing to sell yet.','Nada para vender aún.')+'</p>'}}
 else if(tab==='mine'){h+=s.my.length?s.my.map(L=>{const x=summary(L);return row(x.ic,x.nm,curIc(L.cur)+' '+L.price+' · '+(L.lock?'⏳ '+T('buyer confirming','comprador confirmando'):'⌛ '+ago(L.exp)),L.lock?'':'<button class="btn" onclick="'+A+"('cancel','"+L.lid+"')"+'">↩️ '+T('Cancel','Cancelar')+'</button>')}).join(''):'<p>'+T('You have no listings.','No tienes anuncios.')+'</p>';
  h+='<p class="small">'+T('Your listings show while you are online. Sold: ','Tus anuncios se ven mientras estés conectado. Vendidos: ')+s.sold+' · '+T('Bought: ','Comprados: ')+s.bought+'</p>'}
 else if(tab==='shop'){const d=day();if(s.shopDay!==d){s.shopDay=d;s.shopN={}}h+='<p class="small">'+T('Daily stock from the Faunasphere Trading Post. New items every day.','Surtido diario del Puesto de Comercio. Cosas nuevas cada día.')+'</p>'+
  row('🥚',T('Mystery Egg','Huevo Misterioso'),T('Hatches a random unlocked species · 1/day','Nace una especie desbloqueada al azar · 1/día'),s.shopN._egg?'<span class="small">✔</span>':'<button class="btn" onclick="'+A+"('egg')"+'">'+curIc('lux')+' 750</button>')+
  shopStock().map(x=>{const it=ITEMS[x.k],left=5-(s.shopN[x.k]|0);return row(it.icon||'📦',tn(it.name),T('Left today: ','Quedan hoy: ')+left,left>0?'<button class="btn" onclick="'+A+"('sb','"+x.k+"',"+x.p+')">'+curIc('lux')+' '+x.p+'</button>':'<span class="small">'+T('Sold out','Agotado')+'</span>')}).join('')+
  '<h3 style="margin:10px 0 2px">'+T('Sell to the shop','Vender a la tienda')+'</h3>'+Object.keys(S.player.inv).filter(k=>S.player.inv[k]>0&&sellBack(k)).map(k=>row(ITEMS[k].icon||'📦',tn(ITEMS[k].name)+' ×'+S.player.inv[k],'','<button class="btn" onclick="'+A+"('ss','"+k+"')"+'">+'+sellBack(k)+' Lux</button>')).join('')}
 else{h+=s.log.length?s.log.map(e=>'<div class="small" style="margin:3px 0">'+esc(ES()?e.es:e.en)+'</div>').join(''):'<p>'+T('No trades yet.','Aún no hay intercambios.')+'</p>'}
 return h}
let isOpen=false;function show(){isOpen=true;open(view());if(online()){send({t:'mkQ'});broadcast()}}
function refresh(){try{const M0=document.getElementById('modal')||window.M;if(!isOpen||!M0||M0.classList.contains('hidden')||!MB||!MB.querySelector('h2')||MB.querySelector('h2').textContent.indexOf('🛒')!==0){isOpen=false;return}const sc=MB.scrollTop;MB.innerHTML=view();MB.scrollTop=sc}catch(e){}}
let pickList=[];
window.FSMkt={open:show,a(k,v,w){try{Sound.sfx('click')}catch(e){}
 if(k==='tab'){tab=v;sel=null;isOpen=true;open(view());return}else if(k==='f')filt=v;else if(k==='c')fcur=v;else if(k==='buy')buy(v);else if(k==='cancel')cancel(v);
 else if(k==='pick'){pickList=sellables();sel=pickList[v]||null}else if(k==='unsel')sel=null;
 else if(k==='list'&&sel){const n=(document.getElementById('mkn')||{}).value||1,p=document.getElementById('mkp').value,c=document.getElementById('mkc').value;if(list(sel.kind,sel.key,n,p,c)){sel=null;tab='mine'}}
 else if(k==='sb')shopBuy(v,w);else if(k==='egg')shopEgg();else if(k==='ss')shopSell(v);
 refresh()},
 on(m,p){try{if(m.t==='mkL')onList(m,p);else if(m.t==='mkQ'){if(M().my.length){lastBc=Math.min(lastBc,Date.now()-2000);setTimeout(broadcast,300+Math.random()*900)}}
  else if(m.to!==NM().myId)return;else if(m.t==='mkBuy')onBuy(m);else if(m.t==='mkOk')onOk(m);else if(m.t==='mkGot')onGot(m);else if(m.t==='mkAbort')onAbort(m);else if(m.t==='mkNo')onNo(m)}catch(e){console.warn('mkt',e)}},
 _ttl:ms=>{TTL=Math.max(10000,+ms||24*3600e3)}, // test hook
 _s:()=>({shelf:[...shelf.values()],mkt:M()})};
function addBtn(){const bar=document.getElementById('bar');if(!bar||document.getElementById('bmkt'))return;const b=document.createElement('button');b.id='bmkt';b.innerHTML='<i>🛒</i><span>'+T('Market','Mercado')+'</span>';
 b.onclick=()=>{try{Sound.init();Sound.sfx('click')}catch(e){}show()};bar.appendChild(b)}
function boot(){if(typeof S==='undefined'||!S||!S.player||typeof open==='undefined'||!window.NetMP){setTimeout(boot,400);return}M();addBtn();setInterval(tick,1000);
 setInterval(()=>{const sp=document.querySelector('#bmkt span');if(sp){const t=T('Market','Mercado');if(sp.textContent!==t)sp.textContent=t}},1500);
 setTimeout(()=>{if(online())send({t:'mkQ'})},4000)}
boot();
})();

// ===== gift.js: give a fauna to a friend in the same room (safe offer → accept → ack handshake) =====
(function(){
const tr=s=>window.T?window.T(s):s,MAX=10,pend={},seenIn={};
const others=()=>window.NetMP&&NetMP.room?[...NetMP.peers.values()].filter(p=>p.name):[];
const spName=f=>{try{return SPECIES[f.genes.species].name}catch(e){return f.genes&&f.genes.species||''}};
const persist=()=>{try{save();window.FSidb&&FSidb.flush&&FSidb.flush(localStorage.getItem('faunasphere_save_v3'))}catch(e){}};
const logT=m=>{toast(m);try{(S.v5.giftLog=S.v5.giftLog||[]).push({m,at:Date.now()});if(S.v5.giftLog.length>30)S.v5.giftLog.shift()}catch(e){}};
const GS=m=>{m._z='all';NetMP.send(m)}; // v7.3.1: gifts go on the shared 'all' channel so they reach friends in any zone or at home
function boot(){if(typeof S==='undefined'||!S||typeof R==='undefined'||typeof ui==='undefined'||!window.NetMP){setTimeout(boot,500);return}
 // sender: pick fauna → pick player → confirm
 R.giftStart=({fid})=>{const f=S.fauna[fid];if(!f)return;if(S.fauna.length<=1)return toast(tr("You can't give away your last fauna."));
  if(fid===S.active)return toast(tr('Switch to another fauna first — you can\'t give away your active fauna.'));
  const ps=others();if(!ps.length)return toast(tr('No friends in the room right now.'));
  // v7.3.1: the menu click handler re-draws the Fauna list right after this action, which hid the picker; open it on the next tick
  setTimeout(()=>open('<h2>🎁 '+tr('Give to friend')+'</h2><p class="small">'+tr('Who should get')+' <b>'+f.name+'</b>?</p>'+ps.map(p=>`<div class="row"><b class="grow">${p.name}</b>${btn(tr('Give'),'giftTo',{fid:f.id,to:p.id})}</div>`).join('')),0)};
 R.giftTo=({fid,to})=>{const i=S.fauna.findIndex(x=>x.id===fid),f=S.fauna[i],p=NetMP.peers.get(to);if(!f||!p)return;
  if(i===S.active||S.fauna.length<=1)return toast(tr('Switch to another fauna first — you can\'t give away your active fauna.'));
  if(!confirm(tr('Give')+' '+f.name+' '+tr('to')+' '+p.name+'? '+tr("This can't be undone.")))return;
  const gid='g'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
  pend[gid]={fid,to,t:Date.now(),name:f.name,pn:p.name,n:0};const go=()=>{const q=pend[gid];if(!q)return;if(Date.now()-q.t>60000){delete pend[gid];return logT('⌛ '+tr('Gift timed out — nothing changed.')+' ('+q.name+')')}
   const ff=S.fauna.find(x=>x.id===fid);if(!ff){delete pend[gid];return}GS({t:'giftOffer',to,gid,from:S.player.name||'',f:JSON.parse(JSON.stringify(ff))});q.n++;setTimeout(go,q.n<3?4000:8000)};
  go();setTimeout(()=>{try{close()}catch(e){}},0);
  toast('🎁 '+tr('Offer sent to')+' '+p.name+'…')};
 // recipient popup actions
 R.giftAccept=({gid})=>{const g=seenIn[gid];if(!g||g.st!=='ask')return;if(S.fauna.length>=MAX){g.st='no';GS({t:'giftResp',to:g.from,gid,ok:false,why:'full'});return toast(tr('Your fauna slots are full (10/10).'))}
  const f=JSON.parse(JSON.stringify(g.f));f.id='f'+Date.now()+Math.floor(Math.random()*999);f.giftFrom=g.pn;S.fauna.push(f);g.st='ok';persist();
  GS({t:'giftResp',to:g.from,gid,ok:true});logT('🎁 '+f.name+' '+tr('joined your family from')+' '+g.pn+'!');Sound.sfx&&Sound.sfx('fanfare');renderHUD()};
 R.giftDecline=({gid})=>{const g=seenIn[gid];if(!g||g.st!=='ask')return;g.st='no';GS({t:'giftResp',to:g.from,gid,ok:false,why:'declined'});toast(tr('Gift declined.'))};
 window.FSGift={on(m,p){try{
  if(m.t==='giftOffer'&&m.gid&&m.f&&m.f.genes){const g=seenIn[m.gid];
   if(g){if(g.st==='ok')GS({t:'giftResp',to:m.id,gid:m.gid,ok:true});else if(g.st==='no')GS({t:'giftResp',to:m.id,gid:m.gid,ok:false,why:g.why||'declined'});return}
   const pn=(p&&p.name)||m.from||'A friend';
   if(S.fauna.length>=MAX){seenIn[m.gid]={st:'no',why:'full'};GS({t:'giftResp',to:m.id,gid:m.gid,ok:false,why:'full'});return toast('🎁 '+pn+' '+tr('tried to give you a fauna, but your slots are full (10/10).'))}
   seenIn[m.gid]={st:'ask',f:m.f,from:m.id,pn};const f=m.f;
   open('<h2>🎁 '+tr('A gift from')+' '+pn+'!</h2><p><b>'+String(f.name).slice(0,16)+'</b> · '+spName(f)+' · '+tr('Level')+' '+(f.level|0)+'</p><p class="small">'+tr('Accept this fauna into your family?')+'</p>'+btn('✅ '+tr('Accept'),'giftAccept',{gid:m.gid})+btn('❌ '+tr('Decline'),'giftDecline',{gid:m.gid}));Sound.sfx&&Sound.sfx('hmm')}
  if(m.t==='giftResp'&&pend[m.gid]){const q=pend[m.gid];if(m.id!==q.to)return;delete pend[m.gid];
   if(m.ok){const i=S.fauna.findIndex(x=>x.id===q.fid);if(i<0)return;const act=S.fauna[S.active]&&S.fauna[S.active].id;S.fauna.splice(i,1);S.active=Math.max(0,S.fauna.findIndex(x=>x.id===act));persist();logT('🎁 '+q.name+' '+tr('is now with')+' '+q.pn+'. 💚');renderHUD()}
   else logT('🎁 '+q.pn+(m.why==='full'?' '+tr('has no free slots (10/10) — nothing changed.'):' '+tr('declined the gift — nothing changed.')))}
 }catch(e){console.warn('gift',e)}}};
 // buttons in Your Fauna list
 const u1=ui;ui=function(v,p){const r=u1.apply(this,arguments);try{if(v==='fauna'&&window.NetMP&&NetMP.room){const fg=document.getElementById('fg');if(fg)[...fg.children].forEach((d,k)=>{if(k!==S.active&&S.fauna.length>1)d.insertAdjacentHTML('beforeend',btn('🎁 '+tr('Give to friend'),'giftStart',{fid:k}))})}}catch(e){}return r};
}
boot();})();

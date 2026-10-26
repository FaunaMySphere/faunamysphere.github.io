// v4.6 fun loop: micro-goal checklist (right side, like the original), rare finds with popup, collectible sets tracker
(function(){
const t=k=>(window.FS&&FS.t)?FS.t(k):k;
const RARES={rare_starshell:['Star Shell','🐚'],rare_goldnugget:['Gold Nugget','🪙'],rare_fossil:['Tiny Fossil','🦴'],rare_prism:['Prism Pebble','🔷'],rare_feather:['Rainbow Feather','🪶'],rare_acorn:['Silver Acorn','🌰']};
for(const[k,[n,i]]of Object.entries(RARES))ITEMS[k]=ITEMS[k]||{name:n,type:'ing',icon:i,rare:1};
const SETS=[['Rare Finds',Object.keys(RARES)],['Quarry Gems',['gem_amethyst','gem_sunstone','gem_topaz','gem_grossular']],['Beach Herbs',['pepherb','oddherb']],['Lake Samples',['superworm','lakesand','lakesoil']],['Skeleton',['skull','sk_body','sk_leg','sk_arm']]];
function rarePop(k){const it=ITEMS[k];let d=document.getElementById('rarepop');if(!d){d=document.createElement('div');d.id='rarepop';document.body.appendChild(d)}
 d.innerHTML='<b>'+t('RARE FIND!')+'</b><div class="ri">'+it.icon+'</div><div>'+t(it.name)+'</div><small>'+t('Added to your Sets')+'</small>';d.className='';void d.offsetWidth;d.className='on';
 try{const a=Sound.ctx||Sound.ac;if(Sound.tone){[880,1175,1568].forEach((f,i)=>setTimeout(()=>Sound.tone(f,.15,.08),i*110))}else Sound.sfx('level')}catch(e){}setTimeout(()=>d.className='',2600)}
S0();function S0(){}
const zp=R.zap;R.zap=p=>{const s=zs(S.zone),o=s.objs.find(x=>x.id===p.oid);zp(p);if(o&&!s.objs.includes(o)){S.stats.pops=(S.stats.pops||0)+1;if(Math.random()<.035){const k=pick(Object.keys(RARES));addItem(k);rarePop(k)}}};
const skl=R.skill;R.skill=p=>{const n=S.stats.skill;skl(p);if(S.stats.skill>n&&Math.random()<.04){const k=pick(Object.keys(RARES));addItem(k);rarePop(k)}};
const fdd=R.feed;R.feed=p=>{fdd(p);S.stats.fed=(S.stats.fed||0)+1};
// micro goals
const KINDS=[['zap','Zap {n} pollution',()=>S.stats.pops||0,[4,6,8]],['skill','Use an ability {n} times',()=>S.stats.skill||0,[2,3]],['feed','Feed your fauna {n} times',()=>S.stats.fed||0,[1,2]],['lux','Earn {n} Lux',()=>S.player.lux,[60,120]]];
function mk(){const[k,txt,get,ns]=pick(KINDS);const n=pick(ns);return{k,n,base:get(),txt}}
function getK(k){return KINDS.find(x=>x[0]===k)[2]()}
function ensure(){S.micro=S.micro||[];while(S.micro.length<3){const m=mk();if(!S.micro.some(x=>x.k===m.k))S.micro.push(m)}}
function box(){let b=document.getElementById('microbox');if(!b){b=document.createElement('div');b.id='microbox';document.body.appendChild(b);b.onclick=e=>{if(e.target&&e.target.closest&&e.target.closest('.msets'))return setsPanel();gOpen=!gOpen;try{localStorage.setItem('fs_goals_open',gOpen?'1':'0')}catch(x){}tick()}}return b}
let gOpen=(()=>{try{const v=localStorage.getItem('fs_goals_open');if(v!=null)return v==='1'}catch(e){}return innerWidth>600})();
function tick(){try{if(!S||!fa()||document.getElementById('title'))return;ensure();let h='';
 S.micro.forEach((m,i)=>{const p=Math.min(m.n,getK(m.k)-m.base);h+='<div class="'+(p>=m.n?'ok':'')+'">'+(p>=m.n?'✅ ':'▫️ ')+t(m.txt).replace('{n}',m.n)+' <b>('+Math.max(0,p)+'/'+m.n+')</b></div>';
  if(p>=m.n&&!m.done){m.done=1;const l=15+Z(S.zone).tier*10;gainLux(l);toast('⭐ '+t('Goal done!')+' +'+l+' Lux');try{Sound.sfx('coin')}catch(e){}setTimeout(()=>{const j=S.micro.indexOf(m);if(j>=0)S.micro.splice(j,1)},2500)}});
 const nd=S.micro.filter(m=>Math.min(m.n,getK(m.k)-m.base)>=m.n).length;h='<h4><span>⭐ '+t('Goals')+' '+nd+'/'+S.micro.length+' '+(gOpen?'▴':'▾')+'</span> <span class="msets">📚</span></h4>'+(gOpen?h:'');const b=box();b.classList.toggle('mclosed',!gOpen);if(b._h!==h){b._h=h;b.innerHTML=h}}catch(e){}}
setInterval(tick,700);
function setsPanel(){const own=k=>(S.player.inv[k]||0)>0;open('<h2>📚 '+t('Collectible Sets')+'</h2>'+SETS.map(([n,ks])=>{const c=ks.filter(own).length;return'<div class="row"><div class="grow"><b>'+t(n)+'</b> ('+c+'/'+ks.length+')<br>'+ks.map(k=>'<span style="opacity:'+(own(k)?1:.25)+';font-size:22px" title="'+(ITEMS[k]?t(ITEMS[k].name):k)+'">'+(ITEMS[k]?ITEMS[k].icon:'?')+'</span>').join(' ')+'</div>'+(c===ks.length?'🏆':'')+'</div>'}).join(''))}
window.FSsets=setsPanel;
})();
// v6.19: Spanish for goal tracker + certificate labels
try{Object.assign(window.I18N_ES=window.I18N_ES||{},{'Zap {n} pollution':'Elimina {n} contaminaciones','Use an ability {n} times':'Usa una habilidad {n} veces','Feed your fauna {n} times':'Alimenta a tu fauna {n} veces','Earn {n} Lux':'Gana {n} Lux','Goal done!':'¡Meta cumplida!','Eye Type':'Tipo de ojos','Tail Type':'Tipo de cola','Name your Fauna:':'Nombra a tu fauna:','Collectible Sets':'Colecciones'})}catch(e){}

// v4.25: hatch rarity tiers (original palettes/patterns/sfx). Saves: f.rarity + f.genes.rfx; old fauna = common.
(function(){
const TIERS=[
 {id:'common',name:'Common',p:60,c:'#b8c4b0',shake:2,parts:10,notes:[523]},
 {id:'uncommon',name:'Uncommon',p:25,c:'#5fd16b',shake:4,parts:16,notes:[523,659]},
 {id:'rare',name:'Rare',p:10,c:'#4aa8ff',shake:7,parts:24,notes:[523,659,784]},
 {id:'epic',name:'Epic',p:4,c:'#b45cff',shake:10,parts:32,notes:[523,659,784,1047]},
 {id:'legendary',name:'Legendary',p:1,c:'#ffc93a',shake:14,parts:44,notes:[523,659,784,1047,1319,1568]}];
const TB={};TIERS.forEach(t=>TB[t.id]=t);window.RARITY=TB;
const NEWC={'Mint Frost':'#9ff5d8','Coral Glow':'#ff7a6b','Deep Lagoon':'#1f8fa8','Storm Blue':'#3a5fd9','Ember':'#ff5a1f','Violet Haze':'#8a4dff','Neon Lime':'#a8ff3a','Midnight':'#26245a','Rose Quartz':'#ffb3cf','Aurora':'#3affc8',
 'Solar Gold':'#ffcf3a','Opal':'#d9f3ff','Nebula':'#6a3dff','Prism Pink':'#ff62d4','Starlight':'#fff6c8'};
try{Object.assign(COLORS,NEWC)}catch(e){}
const pick=a=>a[Math.floor(Math.random()*a.length)];
const POOL={
 common:null,
 uncommon:{c:['Mint Frost','Coral Glow','Rose Quartz','Sky','Moss','Sunny'],p:['Spotted','Dotted','Speckled','Stripes'],fx:'two'},
 rare:{c:['Deep Lagoon','Storm Blue','Ember','Aurora','Turquoise'],p:['Tiled','Moon','Star','Stripes'],fx:'grad'},
 epic:{c:['Violet Haze','Neon Lime','Midnight','Ember','Aurora'],p:['Diamond','Shine','Star'],fx:'glow'},
 legendary:{c:['Solar Gold','Opal','Nebula','Prism Pink','Starlight'],p:['Shine','Star','Diamond'],fx:'shiny'}};
function roll(){try{const f=localStorage.getItem('fs_rar_debug');if(f&&TB[f])return f}catch(e){}let r=Math.random()*100;for(const t of TIERS){if(r<t.p)return t.id;r-=t.p}return 'common'}
window.rarOf=f=>(f&&TB[f.rarity])?f.rarity:'common';
function applyTier(f,id){f.rarity=id;const P=POOL[id];if(!P)return;const g=f.genes;g.color=pick(P.c);let c2=pick(Object.keys(NEWC));if(c2===g.color)c2='Starlight';g.color2=c2;g.pattern=pick(P.p);g.rfx=P.fx;
 try{if(f.genome){if(f.genome.color)f.genome.color[0]=g.color;if(f.genome.pattern)f.genome.pattern[0]=g.pattern}}catch(e){}}
// hatch wrapper: roll a tier for the newborn
const H0=R.hatch;let nextTier=null;R.hatch=function(p){const k=S.fauna.length;const r=H0.apply(this,arguments);try{const f=S.fauna[k];if(f&&S.fauna.length>k){applyTier(f,nextTier||roll());nextTier=null;try{save()}catch(e){}}}catch(e){}return r};
// migrate (non-destructive): old fauna -> common
function mig(){try{if(typeof S!=='undefined'&&S&&S.fauna)S.fauna.forEach(f=>{if(!f.rarity)f.rarity='common'})}catch(e){}}setTimeout(mig,3000);
// css
const st=document.createElement('style');st.textContent=`.rbadge{display:inline-block;padding:1px 7px;border-radius:9px;font:700 11px system-ui;color:#10131a;margin:2px 3px;vertical-align:middle;letter-spacing:.3px}
.rbadge.legendary{background:linear-gradient(90deg,#ffe27a,#ff9de6,#9ee8ff,#ffe27a)!important;background-size:200% 100%!important;animation:rbs 2.5s linear infinite}@keyframes rbs{to{background-position:200% 0}}
.hegg{font-size:64px;text-align:center;display:block;margin:6px auto;animation:hsh .12s infinite alternate;will-change:transform}
@keyframes hsh{from{transform:translateX(calc(var(--s)*-1px)) rotate(calc(var(--s)*-1.2deg))}to{transform:translateX(calc(var(--s)*1px)) rotate(calc(var(--s)*1.2deg))}}
.hfx{position:relative;height:0}.hfx i{position:absolute;left:50%;top:-60px;width:9px;height:9px;border-radius:50%;animation:hbu .9s ease-out forwards;will-change:transform,opacity}
@keyframes hbu{to{transform:translate(var(--x),var(--y)) scale(.3);opacity:0}}
.tban{text-align:center;font:900 26px system-ui;letter-spacing:2px;margin:8px 0;text-shadow:0 0 12px currentColor;animation:pop .45s cubic-bezier(.3,1.6,.6,1)}`;document.head.appendChild(st);
const badge=f=>{const t=TB[rarOf(f)];return `<span class="rbadge ${t.id}" style="background:${t.c}">${(window.T||(x=>x))(t.name)}</span>`};window.rarBadge=badge;
function tierSfx(id){try{const t=TB[id],s=Sound;if(!s.ctx||s.muted)return;t.notes.forEach((n,k)=>s.tone(n,.22,id==='legendary'?'triangle':'sine',.12,k*.11));if(id==='epic'||id==='legendary')for(let k=0;k<6;k++)s.tone(2000+Math.random()*1800,.08,'sine',.04,.5+k*.07);if(id==='legendary')s.tone(262,.9,'triangle',.08,0,.5)}catch(e){}}
function burst(t){let h='<div class="hfx">';for(let k=0;k<t.parts;k++){const a=k/t.parts*6.283,d=70+Math.random()*90;const col=t.id==='legendary'?pick(['#ffe27a','#ff9de6','#9ee8ff','#fff']):t.c;h+=`<i style="background:${col};--x:${(Math.cos(a)*d)|0}px;--y:${(Math.sin(a)*d)|0}px"></i>`}return h+'</div>'}
const u0=ui;ui=window.ui=function(v,p={}){
 if(v==='hatching'){const n=S.home.nest;if(!n.egg||now()<n.at||S.fauna.length>=10)return u0(v,p);const id=nextTier=roll(),t=TB[id];
  open('<h2>🪺 Nest</h2><p><b>Hatching...</b></p><span class="hegg" style="--s:'+t.shake+'">🥚</span><div class="hbar"><i></i></div>');try{Sound.sfx('hatch')}catch(e){}
  setTimeout(()=>{const k=S.fauna.length;dispatch('hatch',{name:''});const f=S.fauna[k];if(f){tierSfx(id);
   window._rarPend=id;const ov=document.getElementById('eggov'),eb=ov&&ov.querySelector('.eband');if(eb){eb.style.background='linear-gradient(90deg,'+t.c+',#1d2a1a)';if(id==='legendary')eb.style.background='linear-gradient(90deg,#ffcf3a,#ff62d4,#6a3dff)';const et=eb.querySelector('.etitle');if(et)et.insertAdjacentHTML('beforebegin','<div class="tban" style="color:#fff;text-align:left;margin:0">'+(window.T||(x=>x))(t.name.toUpperCase()+'!')+'</div>');eb.style.position='relative';eb.insertAdjacentHTML('beforeend',burst(t).replace('class="hfx"','class="hfx" style="position:absolute;left:25%;top:50%"'))}}},1700);return}
 const r=u0(v,p);
 try{if(v==='cert'&&window._rarPend&&MB){const t=TB[window._rarPend];window._rarPend=null;const c=MB.querySelector('.cert');if(c)c.insertAdjacentHTML('afterbegin',burst(t)+'<div class="tban" style="color:'+t.c+'">'+(window.T||(x=>x))(t.name.toUpperCase())+'</div>')}}catch(e){}
 try{if(v==='fauna'&&!p.tab){const fg=document.getElementById('fg');if(fg)[...fg.children].forEach((d,k)=>{const f=S.fauna[k];if(f&&!d.querySelector('.rbadge'))d.insertAdjacentHTML('afterbegin',badge(f))})}
  if((v==='cert'||v==='finfo'||(v==='fauna'&&p.tab))&&MB){const f=S.fauna[p.fid|0];if(f&&!MB.querySelector('.rbadge')){const h=MB.querySelector('h2,h3');if(h)h.insertAdjacentHTML('afterend','<div style="text-align:center">'+badge(f)+'</div>')}}}catch(e){}
 return r};
// tap-to-name popup on roaming fauna: decorate after open
const op0=open;open=window.open2=function(h){op0(h);try{if(window._rarTap!=null){const f=S.fauna[window._rarTap];window._rarTap=null;const h2=MB.querySelector('h2');if(f&&h2&&!MB.querySelector('.rbadge'))h2.insertAdjacentHTML('beforeend',' '+badge(f))}}catch(e){}};
const tp0=tap;tap=window.tap=function(px,py){try{if(!rt.decor&&S.zone==='home'&&window.roamHit){const i=roamHit(px,py);if(i!=null)window._rarTap=i}}catch(e){}const r=tp0(px,py);window._rarTap=null;return r};
// 3D: called from gl.js after buildFauna (gradient / glow / sparkle / shiny)
window.RARFX=function(g3,genes,THREE){const fx=genes&&genes.rfx;if(!fx||fx==='two')return;const c1=new THREE.Color(COLORS[genes.color]||'#fff'),c2=new THREE.Color(COLORS[genes.color2]||'#fff');let gradTex=null;
 if(fx==='grad'||fx==='shiny'){const cv=document.createElement('canvas');cv.width=8;cv.height=128;const x=cv.getContext('2d'),gr=x.createLinearGradient(0,0,0,128);gr.addColorStop(0,'#'+c2.getHexString());gr.addColorStop(1,'#'+c1.getHexString());if(fx==='shiny'){gr.addColorStop(.5,'#ffe9a8')}x.fillStyle=gr;x.fillRect(0,0,8,128);gradTex=new THREE.CanvasTexture(cv);gradTex.colorSpace=THREE.SRGBColorSpace}
 const done=new Map();g3.traverse(m=>{if(!m.isMesh||!m.material||Array.isArray(m.material))return;const M=m.material;if(!(M.sheen>0||M.map))return;let N=done.get(M);if(!N){N=M.clone();if(gradTex&&M.map)N.map=gradTex;
   if((fx==='glow'||fx==='shiny')&&N.emissive){N.emissive=c1.clone();N.emissiveIntensity=fx==='shiny'?.35:.28}if(fx==='shiny'&&'iridescence' in N){N.iridescence=1;N.iridescenceIOR=1.6}done.set(M,N)}m.material=N});
 if(fx==='glow'||fx==='shiny'){const n=fx==='shiny'?40:22,pos=new Float32Array(n*3);for(let k=0;k<n;k++){pos[k*3]=(Math.random()-.5)*.6;pos[k*3+1]=.1+Math.random()*.55;pos[k*3+2]=(Math.random()-.5)*.6}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));const pm=new THREE.PointsMaterial({color:fx==='shiny'?0xfff1a0:c1,size:.035,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false});
  const pts=new THREE.Points(geo,pm);pts.onBeforeRender=()=>{pts.rotation.y+=.01;pm.opacity=.55+.4*Math.sin(performance.now()/300)};g3.add(pts)}};
try{Object.assign(window.I18N_ES||{},{'Common':'Común','Uncommon':'Poco común','Rare':'Rara','Epic':'Épica','Legendary':'Legendaria','COMMON':'COMÚN','UNCOMMON':'POCO COMÚN','RARE':'RARA','EPIC':'ÉPICA','LEGENDARY':'LEGENDARIA','UNCOMMON!':'¡POCO COMÚN!','RARE!':'¡RARA!','EPIC!':'¡ÉPICA!','LEGENDARY!':'¡LEGENDARIA!',
 'Mint Frost':'Menta helada','Coral Glow':'Coral brillante','Deep Lagoon':'Laguna profunda','Storm Blue':'Azul tormenta','Ember':'Brasa','Violet Haze':'Bruma violeta','Neon Lime':'Lima neón','Midnight':'Medianoche','Rose Quartz':'Cuarzo rosa','Aurora':'Aurora','Solar Gold':'Oro solar','Opal':'Ópalo','Nebula':'Nebulosa','Prism Pink':'Rosa prisma','Starlight':'Luz estelar'})}catch(e){}

// ===== v6.12 (preview, not shipped): more colour variety + Mythic tier + named special variants. New genes are optional (rv:2); old fauna untouched. =====
TB.common.p=59.8;TIERS.push(TB.mythic={id:'mythic',name:'Mythic',p:.2,c:'#ff3df2',shake:18,parts:56,notes:[392,523,659,784,1047,1319,1568,2093]});
const FAM={
 natural:{'Fawn':'#c99a6b','Chestnut':'#8a4b2a','Ash':'#9a9488','Sandstone':'#d8b98a','Bark':'#5e4330','Fern':'#5f8f3e','Pebble':'#a7a196','Honey':'#e0a33a','Russet':'#a8502a','Driftwood':'#b9a58a','Sage':'#9cb08a','Clay':'#c2734f'},
 pastel:{'Peach':'#ffcfae','Butter':'#fff1a8','Baby Blue':'#bfe2ff','Lavender':'#d9c6ff','Blush':'#ffc8d8','Pistachio':'#cfeeb5','Seafoam':'#b5f0de','Lemon Ice':'#f8f6c4','Periwinkle':'#b8bdf5'},
 neon:{'Neon Pink':'#ff2fa8','Neon Orange':'#ff8a1f','Electric Blue':'#1fb3ff','Toxic Green':'#5cff2f','Laser Purple':'#b02fff','Hot Cyan':'#2ff5ff','Volt Yellow':'#eaff2f'},
 deep:{'Ink':'#1c1f3a','Wine':'#5a1530','Forest':'#1f4a2a','Navy':'#1b2f6a','Obsidian':'#17141c','Garnet':'#7a1424'}};
const ALLNEW={};Object.values(FAM).forEach(o=>Object.assign(ALLNEW,o));try{Object.assign(COLORS,ALLNEW)}catch(e){}
const K=o=>Object.keys(o),BASE=(()=>{try{return K(COLORS).filter(c=>!ALLNEW[c]&&!NEWC[c])}catch(e){return['Tan']}})();
// pattern marks drawn on the new fur texture (pat2) + matching legacy name for 2D art fallback
const PAT2={spots:'Spots',stripes:'Stripes',patches:'Spots',sparkle:'Star',rosette:'Spots',band:'Stripes',socks:'Plain',mask:'Plain',none:'Plain',stars:'Star',swirl:'Plain'};
const TP={ // per tier: palette families, pattern pool, combo style chances
 common:{f:['natural'],base:1,pat:['none','none','spots','patches','socks'],tri:0,grad:.15},
 uncommon:{f:['natural','pastel'],pat:['spots','stripes','patches','socks','mask'],tri:.15,grad:.35},
 rare:{f:['pastel','neon','natural'],pat:['stripes','rosette','band','mask','spots'],tri:.35,grad:.6},
 epic:{f:['neon','deep','pastel'],pat:['rosette','band','sparkle','swirl'],tri:.55,grad:.8,fx:'glow'},
 legendary:{f:['neon','pastel','deep'],pat:['sparkle','stars','swirl'],tri:.8,grad:1,fx:'shimmer'},
 mythic:{f:['deep','neon'],pat:['stars','swirl'],tri:1,grad:1,fx:'cosmic'}};
const ORD=['common','uncommon','rare','epic','legendary','mythic'];
const VAR={ // special named variants (odds are % of all hatches; min tier bumps the hatch)
 diamond:{name:'Diamond',es:'Diamante',p:.1,min:'mythic',c:'#bff4ff',ico:'💎',c1:'Diamond White',c2:'Ice Prism',c3:'Prism Pink'},
 gold:{name:'Gold',es:'Dorado',p:.5,min:'legendary',c:'#ffcf3a',ico:'🏆',c1:'Pure Gold',c2:'Rose Gold',c3:'Solar Gold'},
 rainbow:{name:'Rainbow',es:'Arcoíris',p:.3,min:'legendary',c:'#ff8a3d',ico:'🌈'},
 crystal:{name:'Crystal',es:'Cristal',p:.4,min:'epic',c:'#9ff0ff',ico:'🔷',c1:'Ice Prism',c2:'Baby Blue',c3:'Lavender'},
 shadow:{name:'Shadow',es:'Sombra',p:.5,min:'epic',c:'#6b3dbf',ico:'🌑',c1:'Obsidian',c2:'Laser Purple',c3:'Ink'},
 albino:{name:'Albino',es:'Albino',p:1,min:'common',c:'#fff4f4',ico:'🤍',c1:'Snow',c2:'Blush',c3:'Snow'},
 melanistic:{name:'Melanistic',es:'Melánico',p:1,min:'common',c:'#2b2630',ico:'🖤',c1:'Obsidian',c2:'Ink',c3:'Obsidian'}};
Object.assign(COLORS,{'Diamond White':'#f2fbff','Ice Prism':'#3fb8ec','Pure Gold':'#ffc93a','Rose Gold':'#f2a98a','Snow':'#fbf8f4'});
window.RARVAR=VAR;
K(VAR).forEach(v=>{const x=VAR[v],t=TB[x.min];TB['v_'+v]={id:'v_'+v,real:x.min,vid:v,name:x.name,c:x.c,shake:t.shake+2,parts:t.parts+8,notes:t.notes}});
let PAR=null;const rnd=Math.random;
roll=function(){try{const v=localStorage.getItem('fs_var_debug');if(v&&VAR[v])return 'v_'+v;const f=localStorage.getItem('fs_rar_debug');if(f&&TB[f]&&!TB[f].real)return f}catch(e){}
 let r=rnd()*100;for(const v of K(VAR)){if(r<VAR[v].p)return 'v_'+v;r-=VAR[v].p}r=rnd()*100;for(const t of TIERS){if(r<t.p)return t.id;r-=t.p}return 'common'};
function famPick(fs){const o=FAM[pick(fs)];return pick(K(o))}
function jit(){return[+(rnd()*.06-.03).toFixed(3),+(rnd()*.2-.1).toFixed(3),+(rnd()*.12-.06).toFixed(3)]}
// build new-style genes for a tier/variant; parents' colours mix in
function rarGenes(tier,vid,par){const P=TP[tier]||TP.common,g={rv:2,shade:jit()},pc=[];(par||[]).forEach(p=>{if(p){p.color&&pc.push(p.color);p.color2&&pc.push(p.color2)}});
 const inh=()=>pc.length&&rnd()<.4?pick(pc):null;
 g.color=inh()||(P.base&&rnd()<.6?pick(BASE):famPick(P.f));g.color2=inh()||famPick(P.f);if(g.color2===g.color)g.color2=famPick(P.f);
 if(rnd()<P.tri)g.color3=famPick(P.f);g.grad=rnd()<P.grad?1:0;g.pat2=pick(P.pat);g.pattern=PAT2[g.pat2]||'Plain';g.rfx=P.fx||'v2';
 if(vid){const V=VAR[vid];g.variant=vid;g.rfx=vid;if(V.c1){g.color=V.c1;g.color2=V.c2;g.color3=V.c3}g.pat2=vid==='rainbow'?'none':vid==='diamond'||vid==='gold'?'sparkle':vid==='shadow'?'swirl':vid==='crystal'?'sparkle':g.pat2;g.pattern=PAT2[g.pat2];g.grad=1;
  if(vid==='rainbow'){g.color='Neon Pink';g.color2='Electric Blue';g.color3='Volt Yellow'}
  if(vid==='albino'||vid==='melanistic')g.shade=[0,0,+(rnd()*.06-.03).toFixed(3)]}
 g.shc=1;
 return g}
window.rarGenes=rarGenes;
applyTier=function(f,id){const t=TB[id]||TB.common,tier=t.real||id,vid=t.vid||null;f.rarity=tier;const g=f.genes,n=rarGenes(tier,vid,PAR);PAR=null;
 ['color2','color3','pat2','grad','variant','rfx'].forEach(k=>delete g[k]);Object.assign(g,n);
 try{if(f.genome){if(f.genome.color)f.genome.color[0]=g.color;if(f.genome.pattern)f.genome.pattern[0]=g.pattern}}catch(e){}};
const H1=R.hatch;R.hatch=function(){try{const n=S.home.nest;PAR=[n.egg&&n.egg.genes,n.inc]}catch(e){}return H1.apply(this,arguments)};
const varOf=f=>f&&f.genes&&VAR[f.genes.variant]?f.genes.variant:null;window.rarVarOf=varOf;
const isES=()=>{try{return (window.LANG||localStorage.getItem('fs_lang')||'').startsWith('es')}catch(e){return false}};
window.rarBadge=function(f){let h=badge(f);const v=varOf(f);if(v){const V=VAR[v];h+=`<span class="rbadge rv ${v}" style="background:${V.c};color:${v==='melanistic'||v==='shadow'?'#fff':'#10131a'}">${V.ico} ${isES()?V.es:V.name}</span>`}return h};
st.textContent+=`.rbadge.mythic{background:linear-gradient(90deg,#ff3df2,#6a3dff,#2ff5ff,#ff3df2)!important;background-size:200% 100%!important;color:#fff;animation:rbs 1.8s linear infinite}
.rbadge.rv.gold{background:linear-gradient(100deg,#b8860b,#ffe680 40%,#fff 50%,#ffd23a 60%,#b8860b)!important;background-size:250% 100%!important;animation:rbs 2s linear infinite}
.rbadge.rv.diamond{background:linear-gradient(100deg,#dff9ff,#fff 30%,#ffd1f5 45%,#c9fff1 60%,#d6dcff 75%,#fff)!important;background-size:250% 100%!important;animation:rbs 1.6s linear infinite;box-shadow:0 0 8px #bff4ff}
.rbadge.rv.rainbow{background:linear-gradient(90deg,#ff5a5a,#ffb23a,#f6ff3a,#4dff7a,#3ab8ff,#a35aff)!important}`;
// info: variant badge everywhere the tier badge shows + a line in the certificate
{const u1=ui;ui=window.ui=function(v,p={}){const r=u1(v,p);try{if(MB){const f=S.fauna[p.fid|0];if(f&&varOf(f)&&(v==='cert'||v==='finfo'||(v==='fauna'&&p.tab))&&!MB.querySelector('.rbadge.rv')){const b=MB.querySelector('.rbadge');const V=VAR[varOf(f)];if(b)b.insertAdjacentHTML('afterend',window.rarBadge(f).split('</span>').slice(1).join('</span>'));const pp=MB.querySelector('.cert p');if(pp)pp.insertAdjacentHTML('beforeend','<br>Variant: <b>'+V.ico+' '+(isES()?V.es:V.name)+'</b>')}}
  if(v==='fauna'&&!p.tab){const fg=document.getElementById('fg');if(fg)[...fg.children].forEach((d,k)=>{const f=S.fauna[k];if(f&&varOf(f)&&!d.querySelector('.rbadge.rv')){const V=VAR[varOf(f)];d.insertAdjacentHTML('afterbegin',`<span class="rbadge rv ${varOf(f)}" style="background:${V.c}">${V.ico}</span>`)}})}}catch(e){}return r}}
// hatch sound + burst per tier/variant
tierSfx=function(id){try{const t=TB[id],s=Sound;if(!s.ctx||s.muted)return;const v=t.vid;
 if(v==='gold'){[523,659,784,1047,1319].forEach((n,k)=>s.tone(n,.3,'square',.06,k*.09));for(let k=0;k<10;k++)s.tone(3000+k*180,.06,'sine',.05,.55+k*.05);return}
 if(v==='diamond'){[1568,2093,2637,3136,2637,3136,4186].forEach((n,k)=>s.tone(n,.35,'sine',.07,k*.12));s.tone(196,1.4,'triangle',.08,0,1.5);return}
 if(v==='shadow'){s.tone(110,.9,'sawtooth',.06,0,.6);[220,207,196].forEach((n,k)=>s.tone(n,.3,'triangle',.08,.2+k*.18));return}
 const tt=TB[t.real||id];tt.notes.forEach((n,k)=>s.tone(n,.22,tt.id==='legendary'||tt.id==='mythic'?'triangle':'sine',.12,k*.11));
 if(['epic','legendary','mythic'].includes(tt.id)||v)for(let k=0;k<6;k++)s.tone(2000+rnd()*1800,.08,'sine',.04,.5+k*.07);if(tt.id==='mythic')s.tone(131,1.4,'triangle',.09,0,2)}catch(e){}};
const PC={v_gold:['#fff3b0','#ffd23a','#e6a800','#fff'],v_diamond:['#fff','#bff4ff','#ffd1f5','#c9fff1','#d6dcff'],v_rainbow:['#ff5a5a','#ffb23a','#f6ff3a','#4dff7a','#3ab8ff','#a35aff'],mythic:['#ff3df2','#6a3dff','#2ff5ff','#fff'],legendary:['#ffe27a','#ff9de6','#9ee8ff','#fff'],v_shadow:['#2b1a4a','#6b3dbf','#000'],v_crystal:['#9ff0ff','#fff','#c9e9ff']};
burst=function(t){let h='<div class="hfx">';for(let k=0;k<t.parts;k++){const a=k/t.parts*6.283,d=70+rnd()*90;const col=PC[t.id]?pick(PC[t.id]):t.c;h+=`<i style="background:${col};--x:${(Math.cos(a)*d)|0}px;--y:${(Math.sin(a)*d)|0}px${t.vid==='diamond'?';border-radius:1px;transform:rotate(45deg)':''}"></i>`}return h+'</div>'};
// ---- 3D (cheap): one 128x64 canvas fur texture per look (cached), matcap for metal/gem, small additive sparkle points ----
const TXC=new Map();
function furTex(g,T){const key=[g.color,g.color2,g.color3,g.grad,g.pat2,g.variant].join('|');if(TXC.has(key))return TXC.get(key);
 const C=n=>COLORS[n]||'#ccc',cv=document.createElement('canvas');cv.width=128;cv.height=64;const x=cv.getContext('2d');
 if(g.variant==='rainbow'){const gr=x.createLinearGradient(0,0,128,0);['#ff5a5a','#ffb23a','#f6ff3a','#4dff7a','#3ab8ff','#a35aff','#ff5a5a'].forEach((c,k)=>gr.addColorStop(k/6,c));x.fillStyle=gr}
 else if(g.grad){const gr=x.createLinearGradient(0,0,0,64);gr.addColorStop(0,C(g.color2));gr.addColorStop(g.color3?.5:1,g.color3?C(g.color):C(g.color));if(g.color3)gr.addColorStop(1,C(g.color3));x.fillStyle=gr}else x.fillStyle=C(g.color);
 x.fillRect(0,0,128,64);for(let k=0;k<350;k++){x.fillStyle=rnd()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.07)';x.fillRect(rnd()*128,rnd()*64,1,2)}
 const a=g.color3&&!g.grad?C(g.color3):C(g.color2);x.fillStyle=a;x.strokeStyle=a;const P=g.pat2;
 if(P==='spots')for(let k=0;k<16;k++){x.beginPath();x.arc(rnd()*128,8+rnd()*48,2+rnd()*3,0,7);x.fill()}
 if(P==='patches')for(let k=0;k<5;k++){x.beginPath();x.ellipse(rnd()*128,10+rnd()*44,8+rnd()*10,6+rnd()*8,rnd()*3,0,7);x.fill()}
 if(P==='stripes'){x.lineWidth=4;for(let k=0;k<9;k++){x.beginPath();x.moveTo(k*15,0);x.quadraticCurveTo(k*15+6,26,k*15-3,52);x.stroke()}}
 if(P==='rosette'){x.lineWidth=2;for(let k=0;k<12;k++){x.beginPath();x.arc(rnd()*128,8+rnd()*48,3+rnd()*2,0,5.5);x.stroke()}}
 if(P==='band'){x.fillRect(0,22,128,10);x.globalAlpha=.5;x.fillRect(0,36,128,4);x.globalAlpha=1}
 if(P==='socks'){x.fillRect(0,50,128,14)}if(P==='mask'){x.globalAlpha=.8;x.fillRect(0,0,128,12);x.globalAlpha=1}
 if(P==='swirl'){x.lineWidth=2;for(let k=0;k<6;k++){x.beginPath();x.arc(10+k*22,30,6+(k%3)*3,0,4.7);x.stroke()}}
 if(P==='sparkle'||P==='stars'){x.fillStyle='#fff';x.font='bold 10px serif';for(let k=0;k<(P==='stars'?14:22);k++){P==='stars'?x.fillText('★',rnd()*124,6+rnd()*56):x.fillRect(rnd()*128,rnd()*64,1.5,1.5)}}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;if(TXC.size>40)TXC.clear();TXC.set(key,t);return t}
const MC={};function matcap(kind,T){if(MC[kind])return MC[kind];const cv=document.createElement('canvas');cv.width=cv.height=64;const x=cv.getContext('2d');
 const st=kind==='gold'?[[0,'#fffbe0'],[.25,'#ffe27a'],[.55,'#e0a91c'],[.8,'#8a5a00'],[1,'#3a2400']]:kind==='diamond'?[[0,'#ffffff'],[.3,'#e6fbff'],[.55,'#b8e8ff'],[.75,'#ffd8f6'],[.9,'#9fd9ff'],[1,'#5a7aa8']]:[[0,'#fff'],[.4,'#c9f6ff'],[.8,'#6fc6e8'],[1,'#2a5a80']];
 const gr=x.createRadialGradient(22,20,1,32,32,34);st.forEach(s=>gr.addColorStop(s[0],s[1]));x.fillStyle=gr;x.fillRect(0,0,64,64);
 x.fillStyle='rgba(255,255,255,.9)';x.beginPath();x.ellipse(22,18,7,4,-.6,0,7);x.fill();if(kind==='diamond'){x.globalAlpha=.35;['#ff9ad5','#9affd8','#9ab8ff','#fff59a'].forEach((c,k)=>{x.fillStyle=c;x.beginPath();x.moveTo(32,32);x.arc(32,32,32,k*1.57+.3,k*1.57+.9);x.fill()});x.globalAlpha=1}
 const t=new T.CanvasTexture(cv);t.colorSpace=T.SRGBColorSpace;return MC[kind]=t}
function sparkles(g3,n,cols,T,size,spin){const pos=new Float32Array(n*3),col=new Float32Array(n*3);for(let k=0;k<n;k++){pos[k*3]=(rnd()-.5)*.7;pos[k*3+1]=.08+rnd()*.6;pos[k*3+2]=(rnd()-.5)*.7;const c=new T.Color(pick(cols));col.set([c.r,c.g,c.b],k*3)}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('color',new T.BufferAttribute(col,3));const pm=new T.PointsMaterial({vertexColors:true,size,transparent:true,opacity:.9,blending:T.AdditiveBlending,depthWrite:false});
 const pts=new T.Points(geo,pm);pts.onBeforeRender=()=>{pts.rotation.y+=spin;pm.opacity=.5+.45*Math.sin(performance.now()/260)};g3.add(pts);return pts}
const RF0=window.RARFX;window.RARFX=function(g3,genes,T){if(!genes||genes.rv!==2)return RF0(g3,genes,T);
 const v=genes.variant,fx=genes.rfx,sh=genes.shade||[0,0,0],tex=(v==='gold'||v==='diamond')?null:furTex(genes,T);const done=new Map();
 g3.traverse(m=>{if(!m.isMesh||!m.material||Array.isArray(m.material)||m.userData.outline)return;const M=m.material;const fur=M.sheen>0||!!M.map;if(!fur&&!(v==='gold'||v==='diamond'))return;if(M.isMeshBasicMaterial||M.side===T.BackSide)return;
  if(!fur&&M.color){const h={};M.color.getHSL(h);if(h.l<.15||h.l>.9)return}// keep eyes/dark bits
  let N=done.get(M);if(!N){
   if(v==='gold'||v==='diamond'){N=new T.MeshMatcapMaterial({matcap:matcap(v,T),color:v==='gold'?0xffe9a0:0xffffff,flatShading:v==='diamond'});N.userData.toon=1;}
   else{N=M.clone();if(fur&&tex){N.map=tex}const h={};N.color.getHSL(h);if(fur)N.color.setHSL((h.h+sh[0]+1)%1,Math.max(0,Math.min(1,h.s+sh[1])),Math.max(0,Math.min(1,h.l+sh[2]-(sh[2]<0?0:0))));
    if(N.emissive){if(fx==='glow'||fx==='shimmer'||fx==='cosmic'||v==='crystal'){N.emissive=new T.Color(COLORS[genes.color2]||'#fff');N.emissiveIntensity=fx==='glow'?.22:.3}if(v==='shadow'){N.emissive=new T.Color('#5a2aa8');N.emissiveIntensity=.25}if(v==='crystal'){N.emissive=new T.Color('#1f7fd0');N.emissiveIntensity=.2;if(N.sheenColor)N.sheenColor=new T.Color('#7fd4ff')}}
    if((fx==='shimmer'||fx==='cosmic'||v==='crystal'||v==='rainbow')&&'iridescence' in N){N.iridescence=1;N.iridescenceIOR=1.7}}
   done.set(M,N)}m.material=N;if(v==='diamond'&&m.geometry&&!m.userData.facet){m.userData.facet=1}});
 if(v==='diamond'){const mats=[...done.values()];let h0=0;const p=sparkles(g3,36,['#fff','#ff9ad5','#9affd8','#9ab8ff','#fff59a'],T,.05,.02);const pr=p.onBeforeRender;p.onBeforeRender=()=>{pr();h0=(performance.now()/4000)%1;mats.forEach(M=>M.color.setHSL(h0,.35,.93))}}
 else if(v==='gold')sparkles(g3,30,['#fff','#fff3b0','#ffd23a'],T,.045,.012);
 else if(v==='shadow')sparkles(g3,24,['#6b3dbf','#2b1a4a','#a070ff'],T,.05,-.008);
 else if(v==='crystal'||v==='rainbow')sparkles(g3,26,v==='rainbow'?['#ff5a5a','#ffb23a','#f6ff3a','#4dff7a','#3ab8ff','#a35aff']:['#fff','#9ff0ff'],T,.04,.012);
 else if(fx==='cosmic'){sparkles(g3,48,['#ff3df2','#6a3dff','#2ff5ff','#fff'],T,.045,.02)}
 else if(fx==='shimmer')sparkles(g3,32,['#ffe27a','#ff9de6','#9ee8ff','#fff'],T,.035,.01);
 else if(fx==='glow')sparkles(g3,16,[COLORS[genes.color2]||'#fff'],T,.035,.01)};
try{const es={'Mythic':'Mítica','MYTHIC':'MÍTICA','MYTHIC!':'¡MÍTICA!','GOLD!':'¡DORADO!','DIAMOND!':'¡DIAMANTE!','RAINBOW!':'¡ARCOÍRIS!','CRYSTAL!':'¡CRISTAL!','SHADOW!':'¡SOMBRA!','ALBINO!':'¡ALBINO!','MELANISTIC!':'¡MELÁNICO!','Variant':'Variante',
 'Fawn':'Cervato','Chestnut':'Castaño','Ash':'Ceniza','Sandstone':'Arenisca','Bark':'Corteza','Fern':'Helecho','Pebble':'Guijarro','Honey':'Miel','Russet':'Rojizo','Driftwood':'Madera de deriva','Sage':'Salvia','Clay':'Arcilla','Peach':'Durazno','Butter':'Mantequilla','Baby Blue':'Azul bebé','Lavender':'Lavanda','Blush':'Rubor','Pistachio':'Pistacho','Seafoam':'Espuma de mar','Lemon Ice':'Hielo de limón','Periwinkle':'Vincapervinca',
 'Neon Pink':'Rosa neón','Neon Orange':'Naranja neón','Electric Blue':'Azul eléctrico','Toxic Green':'Verde tóxico','Laser Purple':'Morado láser','Hot Cyan':'Cian intenso','Volt Yellow':'Amarillo voltio','Ink':'Tinta','Wine':'Vino','Forest':'Bosque','Navy':'Azul marino','Obsidian':'Obsidiana','Garnet':'Granate','Diamond White':'Blanco diamante','Ice Prism':'Prisma de hielo','Pure Gold':'Oro puro','Rose Gold':'Oro rosa','Snow':'Nieve'};
 K(VAR).forEach(v=>{es[VAR[v].name]=VAR[v].es;es[VAR[v].name.toUpperCase()]=VAR[v].es.toUpperCase()});Object.assign(window.I18N_ES||{},es)}catch(e){}
})();
// v6.19: Mythic badge stands out (cheap CSS only: sparkle mark + glow ring)
try{const s9=document.createElement('style');s9.textContent=`.rbadge.mythic{box-shadow:0 0 0 1px #fff,0 0 7px #ff3df2;text-shadow:0 1px 0 #6a1d7a}.rbadge.mythic::before{content:"✦ "}.rbadge.mythic::after{content:" ✦"}`;document.head.appendChild(s9)}catch(e){}

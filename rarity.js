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
const badge=f=>{const t=TB[rarOf(f)];return `<span class="rbadge ${t.id}" style="background:${t.c}">${t.name}</span>`};window.rarBadge=badge;
function tierSfx(id){try{const t=TB[id],s=Sound;if(!s.ctx||s.muted)return;t.notes.forEach((n,k)=>s.tone(n,.22,id==='legendary'?'triangle':'sine',.12,k*.11));if(id==='epic'||id==='legendary')for(let k=0;k<6;k++)s.tone(2000+Math.random()*1800,.08,'sine',.04,.5+k*.07);if(id==='legendary')s.tone(262,.9,'triangle',.08,0,.5)}catch(e){}}
function burst(t){let h='<div class="hfx">';for(let k=0;k<t.parts;k++){const a=k/t.parts*6.283,d=70+Math.random()*90;const col=t.id==='legendary'?pick(['#ffe27a','#ff9de6','#9ee8ff','#fff']):t.c;h+=`<i style="background:${col};--x:${(Math.cos(a)*d)|0}px;--y:${(Math.sin(a)*d)|0}px"></i>`}return h+'</div>'}
const u0=ui;ui=window.ui=function(v,p={}){
 if(v==='hatching'){const n=S.home.nest;if(!n.egg||now()<n.at||S.fauna.length>=10)return u0(v,p);const id=nextTier=roll(),t=TB[id];
  open('<h2>🪺 Nest</h2><p><b>Hatching...</b></p><span class="hegg" style="--s:'+t.shake+'">🥚</span><div class="hbar"><i></i></div>');try{Sound.sfx('hatch')}catch(e){}
  setTimeout(()=>{const k=S.fauna.length;dispatch('hatch',{name:''});const f=S.fauna[k];if(f){tierSfx(id);
   window._rarPend=id;const ov=document.getElementById('eggov'),eb=ov&&ov.querySelector('.eband');if(eb){eb.style.background='linear-gradient(90deg,'+t.c+',#1d2a1a)';if(id==='legendary')eb.style.background='linear-gradient(90deg,#ffcf3a,#ff62d4,#6a3dff)';const et=eb.querySelector('.etitle');if(et)et.insertAdjacentHTML('beforebegin','<div class="tban" style="color:#fff;text-align:left;margin:0">'+t.name.toUpperCase()+'!</div>');eb.style.position='relative';eb.insertAdjacentHTML('beforeend',burst(t).replace('class="hfx"','class="hfx" style="position:absolute;left:25%;top:50%"'))}}},1700);return}
 const r=u0(v,p);
 try{if(v==='cert'&&window._rarPend&&MB){const t=TB[window._rarPend];window._rarPend=null;const c=MB.querySelector('.cert');if(c)c.insertAdjacentHTML('afterbegin',burst(t)+'<div class="tban" style="color:'+t.c+'">'+t.name.toUpperCase()+'</div>')}}catch(e){}
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
})();

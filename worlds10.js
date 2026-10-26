// v7 preview (Leo): 10 new worlds. Data + mechanics only (visuals in worlds10gl.js). Saves: new zones use safe defaults (S.unlocked/S.zones keys added on demand).
(function(){
const ES=()=>window.LANG==='es';
// tile-mask shapes (dx,dy centred; n size; r seeded rng)
const ang=(x,y)=>Math.atan2(y,x),R=(x,y)=>Math.hypot(x,y);
const SH={
 maple:(x,y,n,r)=>R(x*.85,y*1.1)<n/2-.4+r()*.5,
 sky:(x,y,n,r)=>{const L=[[-n*.26,-n*.2,n*.2],[n*.24,-n*.12,n*.19],[0,n*.25,n*.21]];if(L.some(([a,b,c])=>R(x-a,y-b)<c+r()*.4))return true;
  // 1-tile rope-bridge strips between islets
  const seg=(ax,ay,bx,by)=>{const t=Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2)));return R(x-(ax+(bx-ax)*t),y-(ay+(by-ay)*t))<.75};
  return seg(L[0][0],L[0][1],L[1][0],L[1][1])||seg(L[1][0],L[1][1],L[2][0],L[2][1])||seg(L[2][0],L[2][1],L[0][0],L[0][1])},
 glow:(x,y,n,r)=>R(x,y)<(n/2-1.2)*(.78+.22*Math.cos(ang(x,y)*5))+r()*.4,
 bamboo:(x,y,n,r)=>{const d=R(x,y);return d<n/2-.4+r()*.4&&!(R(x-n*.12,y+n*.1)<n*.09)&&!(R(x+n*.16,y-n*.14)<n*.07)},
 oasis:(x,y,n,r)=>R(x,y)<n/2-.3+r()*.4&&R(x+n*.3,y-n*.05)>n*.3,
 canyon:(x,y,n,r)=>Math.abs(x-y)<n*.28+Math.sin((x+y)*.5)*1.2+r()*.5&&R(x,y)<n/2+1,
 aurora:(x,y,n,r)=>R(x*.78,y*1.25)<n/2-.6+r()*.5,
 ember:(x,y,n,r)=>R(x,y)<(n/2-1)*(.82+.18*Math.abs(Math.cos(ang(x,y)*3.5)))+r()*.6,
 haunt:(x,y,n,r)=>R(x,y)<n/2-.5&&(Math.sin(x*.9)+Math.cos(y*.8)+Math.sin((x+y)*.45))>-1.1,
 junk:(x,y,n,r)=>Math.max(Math.abs(x),Math.abs(y))<n/2-1.2||(Math.abs(x)+Math.abs(y)<n*.62&&((Math.round(ang(x,y)/(Math.PI/4))&1)===0))};
// zones: id, EN, ES, base biome (mechanics), w7 profile key, tier, unlock player level, size, shape, near, weather, hills, monsters, pollution names, props, nodes
const W=[
 ['maplevale','Amberleaf Vale','Valle Hojámbar','forest','w10maple',2,5,18,SH.maple,['ruins','amph'],'leaf',{amp:.9,ter:.2},['bramble','stalker'],['Sap Sludge','Rot Pile','Tar Leaf'],['maple','maple','maple','leafpile','leafpile','lantern','bench'],{tree:3,stump:2,dig:1}],
 ['skyreach','Skyreach Isles','Islas Alcanzacielo','garden','w10sky',2,10,18,SH.sky,['rockgarden','home'],null,{amp:.6,n:3,ter:.8},['stalker','bramble'],['Smog Puff','Soot Kite','Storm Grime'],['windmill','bridgepost','bridgepost','bridgepost','kite','flagpole'],{tree:2,rock:1,dig:1}],
 ['glowcap','Glowcap Hollow','Hondonada Brillante','night','w10glow',3,15,17,SH.glow,['gobblefield','bogs'],'firefly',{amp:.7,ter:.3},['stalker','spider'],['Murk Spore','Gloom Gel','Blight Cap'],['bigshroom','bigshroom','bigshroom','bigshroom','glowstone','glowstone'],{stump:2,dig:2}],
 ['mistreed','Mistreed Grove','Bosque Bruma','garden','w10bamboo',3,20,18,SH.bamboo,['maplevale','bogs'],null,{amp:.5,ter:.9},['bramble','stalker'],['Muddy Mire','Plastic Snarl','Silt Slick'],['bamboo','bamboo','bamboo','bamboo','bamboo','stonelamp','stonelamp','lotus','lotus'],{pool:2,tree:1,dig:1}],
 ['mirage','Mirage Oasis','Oasis del Espejismo','scorch','w10oasis',3,25,18,SH.oasis,['isthmus','mesa'],'dust',{amp:1.1,ter:.1},['scorpion','stalker'],['Oil Slick','Rust Dune','Grit Clot'],['palm','palm','palm','oasisruin','oasisruin','pillar','pillar'],{pool:2,dig:2}],
 ['prism','Prism Canyon','Cañón Prisma','rock','w10crystal',4,30,19,SH.canyon,['dungeon','rockisland'],'dust',{amp:2,n:5,ter:.9,rad:.8},['spider','stalker'],['Grey Static','Cracked Ooze','Dull Shard'],['bigcrystal','bigcrystal','bigcrystal','bigcrystal','geode','geode'],{rock:3,dig:1}],
 ['auroramere','Aurora Mere','Lago Aurora','arctic','w10aurora',4,35,18,SH.aurora,['wintergift','village'],'snow',{n:2,amp:.5,ter:0},['wraith','stalker'],['Frost Smog','Slush Gunk','Ice Sludge'],['icespire','icespire','icespire','icehole','icehole','fishhut'],{pool:2,rock:1,dig:1}],
 ['cinder','Cinder Wastes','Páramo de Ceniza','scorch','w10lava',5,40,18,SH.ember,['isthmus','mirage'],'ember',{amp:1.5,n:4,ter:.6},['scorpion','stalker'],['Ash Heap','Smoke Clot','Slag Glob'],['vent','vent','vent','obsidian','obsidian','obsidian','lavapool','lavapool'],{rock:2,dig:2}],
 ['wispfen','Wispfen Marsh','Ciénaga Fuegofatuo','swamp','w10haunt',5,45,18,SH.haunt,['bogs','glowcap'],'firefly',{amp:.4,ter:.2},['lurker','stalker'],['Grave Grime','Wisp Rot','Bone Muck'],['deadtree','deadtree','deadtree','tombstone','tombstone','tombstone','lantern'],{stump:2,pool:1,dig:1}],
 ['cogwork','Cogwork Scrapyard','Chatarrería Engranaje','rock','w10junk',5,50,17,SH.junk,['prism','cinder'],'ember',{amp:1.2,n:3,ter:1},['spider','bramble'],['Oil Puddle','Scrap Tangle','Smog Valve'],['gear','gear','gear','pipe','pipe','scrapheap','scrapheap','chimney'],{rock:2,dig:2}]];
// palettes: top,left,right,water,sky1,sky2
const PAL={maplevale:['#C98A3A','#7A4E2C','#5C3A22','#3D7FA3','#F7C98B','#FCE3C0'],skyreach:['#8CCB5E','#9A7A58','#6E5438','#4FA6D8','#7FC6F5','#E8F6FF'],
 glowcap:['#2F5D4A','#3A2E4A','#2A2238','#2A6F8F','#1A1A3A','#3B2D5E'],mistreed:['#6FA65A','#6B5A44','#4E4232','#4F9A8F','#C9DDD4','#E6EFEA'],
 mirage:['#E8C88A','#B88A52','#8E6A3E','#2FB7C4','#9AD6F0','#FFF1D6'],prism:['#B9A8D8','#7B6A9C','#594C78','#6FD3E8','#C7B8F0','#F2E8FF'],
 auroramere:['#DCEFF7','#5B7A99','#3F5A78','#7FD0E8','#0E2240','#2C6E6A'],cinder:['#4A3A36','#2E2422','#1E1716','#FF5A1F','#5A2A1E','#C2643A'],
 wispfen:['#4E5A3E','#3E3A30','#2C2A22','#3A5A50','#2A3340','#5E6B70'],cogwork:['#8A7E6E','#6A5848','#4E4034','#7A8A88','#B9A88E','#E2D2B6']};
const IT={maplevale:[['maple_leaf','Maple Leaf','Hoja de Arce','🍁'],['amber_sap','Amber Sap','Savia Ámbar','🍯']],skyreach:[['cloud_tuft','Cloud Tuft','Mechón de Nube','☁️'],['sky_feather','Sky Feather','Pluma Celeste','🪶']],
 glowcap:[['glow_spore','Glow Spore','Espora Brillante','✨'],['lumicap','Lumicap','Lumisombrero','🍄']],mistreed:[['bamboo_shoot','Bamboo Shoot','Brote de Bambú','🎋'],['lotus_seed','Lotus Seed','Semilla de Loto','🪷']],
 mirage:[['date_fruit','Date Fruit','Dátil','🌴'],['sun_glass','Sunglass Shard','Cristal Solar','🔆']],prism:[['prism_shard','Prism Shard','Fragmento Prisma','💎'],['geode_core','Geode Core','Núcleo de Geoda','🔮']],
 auroramere:[['aurora_ice','Aurora Ice','Hielo Aurora','🧊'],['mere_fish','Mere Fish','Pez del Lago','🐟']],cinder:[['obsidian_chip','Obsidian Chip','Astilla de Obsidiana','🪨'],['ember_core','Ember Core','Núcleo de Brasa','🔥']],
 wispfen:[['wisp_light','Wisp Light','Luz Fatua','🕯️'],['bog_lily','Bog Lily','Lirio del Pantano','🌸']],cogwork:[['brass_cog','Brass Cog','Engranaje de Latón','⚙️'],['spring_coil','Spring Coil','Resorte','🌀']]};
const ESD=window.I18N_ES||(window.I18N_ES={});
const LV={};window.W10=[];
W.forEach(([id,en,es,biome,w7,tier,lv,n,shape,near,weather,hills,mon,pn,props,nodes])=>{
 const z={id,name:en,biome,w7,tier,n,shape,near,hills,monKinds:mon,pollNames:pn,stations:['gate','goal','vendor'],nodes,poll:9+tier,tox:Math.min(4,tier),props,unlock:'plv_'+id,w10:1,lvReq:lv};
 if(weather!==undefined)z.weather=weather;try{window.FSmonAssign?FSmonAssign(id,mon,{count:Math.min(8,3+tier)}):((window.FS_MON_ZONES=window.FS_MON_ZONES||{})[id]={kinds:mon,count:Math.min(8,3+tier)})}catch(e){}ZONES.push(z);W10.push(z);LV[id]=lv;ESD[en]=es;
 if(PAL[id])(window.ZPAL=window.ZPAL||{})[id]=PAL[id];
 const its=IT[id];its.forEach(([k,ien,ies,ic])=>{ITEMS[k]={name:ien,type:'ing',icon:ic};ESD[ien]=ies});pn.forEach(p=>{ESD[p]=ESD[p]||p});
 ZDROP[id]=its[0][0];DIGLOOT[id]=[its[1][0],its[0][0]];VENDORS[id]=[['boilroot',30+tier*5],['oilywurst',40]].filter(x=>ITEMS[x[0]]);
 const gid='w10_'+id,qn=en+': '+'Restore the Land',qes=es+': Restaura la Tierra';ESD[qn]=qes;
 const txt=en+': zap 6 pollution here and bring 3 '+its[0][1]+' and 1 '+its[1][1]+' to the Goal Station.';ESD[txt]=es+': elimina 6 contaminaciones aquí y trae 3 '+its[0][2]+' y 1 '+its[1][2]+' a la Estación de Metas.';
 const has=(k,c)=>(S.player.inv[k]||0)>=c;
 GOALS.push({id:gid,zone:id,name:qn,giver:'Esteban',say:txt,text:txt,check:()=>((S.stats.zap||{})[id]||0)>=6&&has(its[0][0],3)&&has(its[1][0],1),take:[its[0][0],its[0][0],its[0][0],its[1][0]],lux:400+tier*250,done:en+' '+'is shining again. Thank you, starfriend!'});
});
Object.assign(ESD,{'Unlocks at player Lv ':'Se desbloquea en Nivel de jugador ','Near: ':'Cerca de: ','New land unlocked: ':'Nueva tierra desbloqueada: '});
// level unlocks (adds S.unlocked keys only; never removes)
const tick=()=>{try{if(typeof S==='undefined'||!S||!S.unlocked)return;const lv=(S.plv&&S.plv.lv)||1;let ch=0;W10.forEach(z=>{if(!S.unlocked[z.id]&&lv>=LV[z.id]){S.unlocked[z.id]=1;ch=1;try{toast('🔓 '+(ES()?'Nueva tierra desbloqueada: ':'New land unlocked: ')+(ES()?ESD[z.name]:z.name)+'!')}catch(e){}}});if(ch&&typeof save==='function')save()}catch(e){}};
setInterval(tick,4000);setTimeout(tick,1500);
// world map: lock label shows the level, plus neighbours
const u0=window.ui;window.ui=ui=function(v,p){const r=u0.apply(this,arguments);if(v==='map')try{document.querySelectorAll('.drow').forEach(row=>{const nm=row.querySelector('.dn');if(!nm)return;const z=W10.find(q=>nm.textContent.replace('🔒 ','').trim()===(ES()?ESD[q.name]:q.name));if(!z)return;const ds=row.querySelector('.ds');
 const nb=(ES()?'Cerca de: ':'Near: ')+z.near.map(i=>{try{const q=Z(i);return ES()&&ESD[q.name]?ESD[q.name]:q.name}catch(e){return i}}).join(', ');
 if(ds&&!S.unlocked[z.id])ds.textContent=(ES()?'Nivel ':'Lv ')+LV[z.id];row.title=nb;const sm=document.createElement('div');sm.className='small';sm.style.cssText='font-size:10px;opacity:.75';sm.textContent=nb;nm.appendChild(sm)})}catch(e){}return r};
console.log('[FaunaMySphere] worlds10 preview loaded ('+W10.length+' zones)');
})();

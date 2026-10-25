// v4.20: placement hotfix (free placement, snap to nearest free tile, feedback) + Edit Home (move/rotate/store, ground themes, decor shop)
(function(){const t=k=>(window.FS&&FS.t)?FS.t(k):k;
Object.assign(ITEMS,{d_bench:{name:'Park Bench',type:'decor',icon:'🪑'},d_hedge:{name:'Hedge',type:'decor',icon:'🌳'},d_birdbath:{name:'Bird Bath',type:'decor',icon:'⛲'},d_pinwheel:{name:'Pinwheel',type:'decor',icon:'🎡'},d_totem:{name:'Sphere Totem',type:'decor',icon:'🗿'}});
const SHOP=[['d_flower',30],['d_fence',25],['d_paving',20],['d_hedge',40],['d_bench',60],['d_birdbath',90],['d_pinwheel',45],['d_mushroom',80],['d_crystal',150],['d_lantern',60,'bux'],['d_totem',120,'bux']];
const THEMES={Classic:['#7CA836','#7C7D81'],Autumn:['#556B2F','#7a5230'],Resort:['#3CB371','#8a7a5a'],Winter:['#F0F8FF','#B0E0E6'],Desert:['#d9b56b','#a07a45'],Lilac:['#b79bd8','#6e5a8a']};
const base=ZPAL.home.slice();
const applyTheme=()=>{try{const th=THEMES[(S.home&&S.home.theme)||'Classic']||THEMES.Classic;ZPAL.home=base.slice();ZPAL.home[0]=th[0];ZPAL.home[1]=th[1];window.rebuildIsland&&rebuildIsland()}catch(e){}};
setTimeout(applyTheme,1500);
// Root cause fix: placing charged a hidden 25 Lux fee (new players have ~30 Lux after shopping) and silently did nothing; taps off-grid/occupied also silently failed.
R.place=({item,i,j})=>{if(!S.player.inv[item])return;S.player.inv[item]--;S.home.decor.push({item,i,j,rot:0});syncHomeDecor()};
const free=(i,j)=>{const s=zs('home');return s.tiles[i]&&s.tiles[i][j]&&!s.objs.some(o=>o.i===i&&o.j===j)&&!(rt.pos&&Math.round(rt.pos.i)===i&&Math.round(rt.pos.j)===j)};
const near=(i,j)=>{const s=zs('home'),n=s.tiles.length;let b=null,bd=1e9;for(let a=0;a<n;a++)for(let c=0;c<n;c++)if(free(a,c)){const d=Math.hypot(a-i,c-j);if(d<bd){bd=d;b=[a,c]}}return bd<=3?b:null};
const tap0=tap;tap=window.tap=function(px,py){try{if(rt.decor&&S.zone==='home'&&fa()&&!rt.trans){const o=hitObj(px,py);if(o&&o.type==='decor')return interact(o);const[i,j]=screenToTile(px,py);const p=free(i,j)?[i,j]:near(i,j);if(!p){toast(t('Tap an empty tile on your island.'));return}
 if(!S.player.inv[rt.decor]){rt.decor=null;return}dispatch('place',{item:rt.decor,i:p[0],j:p[1]});try{Sound.sfx('pop')}catch(e){}if(!S.player.inv[rt.decor]){rt.decor=null;toast(t('Placed! Done decorating.'))}else toast(t('Placed!'));return}}catch(e){console.warn('[FaunaMySphere] place',e)}return tap0(px,py)};
const sync0=syncHomeDecor;syncHomeDecor=window.syncHomeDecor=function(){const s=zs('home');s.objs=s.objs.filter(o=>o.type!=='decor');S.home.decor.forEach((d,idx)=>s.objs.push({id:'dec'+idx+'_'+d.item+'_'+(d.rot|0)+'_'+d.i+'_'+d.j,type:'decor',item:d.item,i:d.i,j:d.j,rot:d.rot|0,idx}))};
try{syncHomeDecor()}catch(e){}
R.decRot=({idx})=>{const d=S.home.decor[idx];if(d){d.rot=((d.rot|0)+1)%4;syncHomeDecor()}};
R.decStore=({idx})=>{const d=S.home.decor.splice(idx,1)[0];if(d){addItem(d.item);syncHomeDecor()}};
R.homeTheme=({k})=>{if(THEMES[k]){S.home.theme=k;applyTheme()}};
window.FSdec=(a,p)=>{try{if(a==='move'){const d=S.home.decor[p];if(!d)return;dispatch('decStore',{idx:p});rt.decor=d.item;M.classList.add('hidden');if(S.zone!=='home')startTravel('home');toast(t('Tap a tile to place it.'));return}
 if(a==='buy'){const e=SHOP[p];dispatch('buy',{item:e[0],price:e[1],cur:e[2]})}else dispatch(a,a==='homeTheme'?{k:p}:{idx:p});ui('edithome')}catch(e){console.warn(e)}};
const u0=window.ui;window.ui=ui=function(v,p={}){if(v!=='edithome')return u0(v,p);
 const pl=S.home.decor.map((d,k)=>'<div class="row"><span style="font-size:22px">'+(ITEMS[d.item]||{}).icon+'</span><div class="grow">'+t((ITEMS[d.item]||{}).name||d.item)+' <span class="small">('+d.i+','+d.j+')</span></div><button class="btn" onclick="FSdec(\'move\','+k+')">'+t('Move')+'</button><button class="btn" onclick="FSdec(\'decRot\','+k+')">⟳</button><button class="btn" onclick="FSdec(\'decStore\','+k+')">'+t('Store')+'</button></div>').join('')||'<p class="small">'+t('Nothing placed yet.')+'</p>';
 const th=Object.keys(THEMES).map(k=>'<button class="btn" style="background:'+THEMES[k][0]+';color:#123;'+(((S.home.theme||'Classic')===k)?'outline:3px solid #fff':'')+'" onclick="FSdec(\'homeTheme\',\''+k+'\')">'+t(k)+'</button>').join(' ');
 const sh=SHOP.map((e,k)=>'<div class="row"><span style="font-size:22px">'+ITEMS[e[0]].icon+'</span><div class="grow">'+t(ITEMS[e[0]].name)+' — '+e[1]+' '+(e[2]==='bux'?'Bux':'Lux')+'</div><button class="btn" onclick="FSdec(\'buy\','+k+')">'+t('Buy')+'</button></div>').join('');
 return open('<h2>🏡 '+t('Edit Home')+'</h2><p class="small">'+t('Placing is free and snaps to the tile grid. Tap placed decor while decorating to pick it up.')+'</p><button class="btn" onclick="ui(\'decor\')">'+t('Place from inventory')+'</button><h3>'+t('Placed items')+'</h3>'+pl+'<h3>'+t('Ground theme')+'</h3><div>'+th+'</div><h3>'+t('Decor shop')+'</h3>'+sh)};
// add an "Edit Home" button to the Decorate window
const u1=window.ui;window.ui=ui=function(v,p={}){const r=u1(v,p);try{if(v==='decor'&&MB&&!MB.querySelector('.fsedh'))MB.insertAdjacentHTML('beforeend','<p><button class="btn fsedh" onclick="ui(\'edithome\')">🏡 '+t('Edit Home')+'</button></p>')}catch(e){}return r};
})();

// v4.23: Home base 3x bigger (9x9 -> 15x15 grid, ~3x tiles). Old saves migrate by offsetting every home coordinate by +3 (center stays put).
(function(){const N=15,OFF=3;try{const zd=(typeof ZONES!=='undefined'&&(Array.isArray(ZONES)?ZONES.find(z=>z.id==='home'):ZONES.home))||Z('home');zd.n=N}catch(e){}
const circle=()=>{const t=[];for(let i=0;i<N;i++){t[i]=[];for(let j=0;j<N;j++)t[i][j]=Math.hypot(i-(N-1)/2,j-(N-1)/2)<8?1:0}return t};
function migrate(){try{migrate0()}catch(e){console.warn('[FaunaMySphere] home migration skipped',e)}}
function migrate0(){if(typeof S==='undefined'||!S||!S.zones)return;const h=S.zones.home;if(!h||!h.tiles)return;S.home=S.home||{};
 if(h.tiles.length>=N){if((S.home.big|0)<2){const c=circle();h.tiles.forEach((r,i)=>r.forEach((v,j)=>{if(c[i]&&c[i][j])r[j]=1}));S.home.big=2;try{window.rebuildIsland&&rebuildIsland();save()}catch(e){}}return}
 const o=Math.floor((N-h.tiles.length)/2);const H=JSON.parse(JSON.stringify(h)),HM=JSON.parse(JSON.stringify(S.home));const nt=circle();
 H.tiles.forEach((row,i)=>row.forEach((v,j)=>{if(v)nt[i+o][j+o]=1}));H.tiles=nt;
 H.objs.forEach(x=>{x.i+=o;x.j+=o});(HM.decor||[]).forEach(d=>{d.i+=o;d.j+=o});
 if(HM.paint){const p={};for(const k in HM.paint){const[i,j]=k.split(',').map(Number);p[(i+o)+','+(j+o)]=HM.paint[k]}HM.paint=p}
 // all computed on copies; commit atomically only if nothing threw
 S.zones.home=H;Object.assign(S.home,HM);
 if(S.zone==='home'&&typeof rt!=='undefined'&&rt.pos){rt.pos.i+=o;rt.pos.j+=o;rt.tgt=null}
 S.home.big=2;try{syncHomeDecor()}catch(e){}try{window.rebuildIsland&&rebuildIsland()}catch(e){}try{save()}catch(e){}console.log('[FaunaMySphere] home migrated to '+N+'x'+N+' (offset '+o+')')}
migrate();setInterval(migrate,2000);window.FSmigrateHome=migrate;
})();

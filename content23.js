// v6 step 1: bigger worlds. Non-home zones grow by area factor AREA (side * sqrt(AREA)).
// Old saves migrate by padding the grid and offsetting every object (center stays put); progress kept.
(function(){let AREA=2;try{const q=new URLSearchParams(location.search).get('ws6');if(q)AREA=Math.max(1,Math.min(5,+q))}catch(e){}
window.FS_WORLD_AREA=AREA;const K=Math.sqrt(AREA);
try{ZONES.forEach(z=>{if(z.id==='home'||!z.n)return;if(!z.n0)z.n0=z.n;z.n=Math.round(z.n0*K);if(z.nodes&&!z.nodes0){z.nodes0=z.nodes;const nn={};for(const k in z.nodes)nn[k]=Math.max(z.nodes[k],Math.round(z.nodes[k]*AREA*.75));z.nodes=nn}})}catch(e){console.warn('ws6',e)}
const h=(a,b)=>{const x=Math.sin(a*127.1+b*311.7)*43758.5453;return x-Math.floor(x)};
function grow(id){const z=Z(id),s=S.zones[id],N=z.n,old=s.tiles.length;if(old>=N)return false;const o=Math.floor((N-old)/2);
 const T=[];for(let i=0;i<N;i++){T[i]=[];for(let j=0;j<N;j++)T[i][j]=Math.hypot(i-(N-1)/2,j-(N-1)/2)<N/2-.2+h(i,j)*.6?1:0}
 s.tiles.forEach((r,i)=>r.forEach((v,j)=>{if(v)T[i+o][j+o]=1}));
 const objs=JSON.parse(JSON.stringify(s.objs));objs.forEach(x=>{x.i+=o;x.j+=o});
 const occ=new Set(objs.map(x=>x.i+','+x.j));let nid=s.nextId||objs.length+1,k=0;
 const ring=[];for(let i=1;i<N-1;i++)for(let j=1;j<N-1;j++){const oi=i-o,oj=j-o;const inOld=oi>=0&&oj>=0&&oi<old&&oj<old&&s.tiles[oi][oj];if(T[i][j]&&!inOld&&!occ.has(i+','+j))ring.push([i,j])}
 const want={};for(const t in (z.nodes||{}))want[t]=Math.max(0,z.nodes[t]-objs.filter(x=>x.type===t).length);
 for(const t in want)for(let q=0;q<want[t]&&ring.length;q++){const p=ring.splice(Math.floor(h(q+3,nid)*ring.length),1)[0];objs.push({id:id+'_'+nid++,type:t,i:p[0],j:p[1],ready:true,at2:0});occ.add(p[0]+','+p[1])}
 s.tiles=T;s.objs=objs;s.nextId=nid;s.big6=AREA;
 if(S.zone===id&&typeof rt!=='undefined'&&rt.pos){rt.pos.i+=o;rt.pos.j+=o;rt.tgt=null}return true}
function migrate(){try{if(typeof S==='undefined'||!S||!S.zones)return;let ch=false,cur=false;for(const id in S.zones){if(id==='home')continue;try{if(grow(id)){ch=true;if(id===S.zone)cur=true}}catch(e){console.warn('[FaunaMySphere] grow skipped',id,e)}}
 if(ch){if(cur)try{window.rebuildIsland&&rebuildIsland()}catch(e){}try{save()}catch(e){}}}catch(e){}}
migrate();setInterval(migrate,2000);window.FSgrowZones=migrate})();

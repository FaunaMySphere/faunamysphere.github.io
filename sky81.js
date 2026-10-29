// v8.1 PREVIEW (A): sky / light / water mood. Works with the V81 shaders in gl.js (drifting toon clouds, sunset tint, reflective water).
// Runs inside applyEnv BEFORE restore.js snapshots the light, so restoration darkening/brightening still layers on top.
// Phone-safe: no new passes, no new shadow casters. Cool fill light only on PC High. Low = thinner clouds, 2 noise octaves, cheaper glint.
// ?v81off disables everything (gl.js falls back to the v8.0 shaders).
const G=window;
(function boot(){if(new URLSearchParams(location.search).has('v81off'))return;if(!G.W81)return setTimeout(boot,200);
const W=G.W81,T=W.THREE,su=W.su,QS=new URLSearchParams(location.search);
// preview helpers: ?dusk81 forces a sunset, ?nt81=0..1 forces the night amount
if(QS.has('dusk81'))G.__nt81=.42;if(QS.has('nt81'))G.__nt81=Math.max(0,Math.min(1,+QS.get('nt81')||0));
const q=()=>(G.GL&&GL.Q)||'med',PCHI=()=>!W.isPhone&&q()==='high';
const SUNSET=new T.Color(0xff9a58),PINK=new T.Color(0xffb6cc),GOLD=new T.Color(0xfff0c8),DTOP=new T.Color(0x6a5aa8),DHOR=new T.Color(0xffa070),PEACH=new T.Color(0xffc2a0);
let fill=null,cur={z:null,nt:0,dusk:0};
function uni(){const z=cur.z;if(!z)return;const dun=z.biome==='dungeon',lo=q()==='low';
 su.uCloud.value=dun?0:(lo?.55:W.isPhone?.75:.85)*(z.biome==='scorch'||z.biome==='mesa'?.55:1);su.uOct.value=lo?0:1;W.uLow81.value=lo?1:0;
 if(PCHI()&&!fill){fill=new T.DirectionalLight(0xbfd8ff,0);W.scene.add(fill)}
 if(fill){fill.visible=PCHI()&&!dun;const sp=W.sun.position;fill.position.set(-sp.x,Math.max(6,sp.y*.6),-sp.z);fill.intensity=.35*(1-cur.nt*.6);fill.color.set(cur.dusk>.3?0xd2bcff:0xbfd8ff)}}
G.FS_env81=(z,nt)=>{const dun=z.biome==='dungeon',dusk=dun?0:Math.max(0,1-Math.abs(nt-.4)/.38);cur={z,nt,dusk,t:0};
 su.uDusk.value=dusk;su.uNight.value=dun?0:Math.min(1,Math.max(0,(nt-.45)*1.8));uni()};
// called by restore.js right before it snapshots the light (after every world's own env override), once per applyEnv
G.FS_tint81=()=>{if(!cur.z||cur.t)return;cur.t=1;const dusk=cur.dusk,nt=cur.nt,dun=cur.z.biome==='dungeon';
 // golden-hour light: warm low sun, pink sky fill; daytime: a touch of gold
 W.sun.color.lerp(SUNSET,dusk*.6).lerp(GOLD,(1-nt)*(1-dusk)*.15);W.sun.intensity*=1-dusk*.08;W.hemi.color.lerp(PINK,dusk*.3);
 if(W.sun.shadow&&'intensity' in W.sun.shadow)W.sun.shadow.intensity=dun?.6:.85-dusk*.15-nt*.2; // softer, coloured shadows instead of black
 // v7 screen-space backdrop + sprite clouds (most worlds hide the dome): warm them at golden hour
 const bd=G._bd&&G._bd();if(bd&&dusk>0){bd[0].lerp(DTOP,dusk*.4);bd[1].lerp(DHOR,dusk*.6);if(bd[2]&&bd[2].isColor)bd[2].lerp(SUNSET,dusk*.7)}
 W.scene.traverse(o=>{if(!o.isSprite||!o.material||o.material.fog!==false||o.material.depthWrite!==false||o.scale.x<20)return;const m=o.material;if(!m.userData.c81)m.userData.c81=m.color.clone();m.color.copy(m.userData.c81).lerp(PEACH,dusk*.55)})};
let last=0;(function tick(){requestAnimationFrame(tick);const n=performance.now();if(n-last>700){last=n;try{uni()}catch(e){}}})();
G.FS_SKY81={get cur(){return cur}};
// first world was lit before this file loaded: re-run applyEnv once it exists
(function first(n){if(typeof S!=='undefined'&&S.zone&&!cur.z){W.reEnv();if(!cur.z&&n<40)setTimeout(()=>first(n+1),250)}else if(!cur.z&&n<40)setTimeout(()=>first(n+1),250)})(0);
})();

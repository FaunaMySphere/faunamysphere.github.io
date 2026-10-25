// ===== toonfauna.js (local, not shipped): modest toon polish for fauna — keeps toon style + outlines =====
(function(){
let SOFT=null;
function soft(T){if(SOFT)return SOFT;const d=new Uint8Array([140,140,150,255,185,185,192,255,228,228,232,255,255,255,255,255]);SOFT=new T.DataTexture(d,4,1,T.RGBAFormat);SOFT.minFilter=SOFT.magFilter=T.LinearFilter;SOFT.needsUpdate=true;return SOFT}
// 'uTime' marker makes gl.js toonOf() carry this hook onto the toon material
function hook(m,T){m.onBeforeCompile=function(sh){/*uTime*/if(sh.uniforms.gradientMap)sh.uniforms.gradientMap.value=soft(T);
 sh.fragmentShader=sh.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\n{float fr=1.0-clamp(dot(normal,normalize(vViewPosition)),0.0,1.0);totalEmissiveRadiance+=diffuseColor.rgb*pow(fr,3.0)*0.35;}')};m.customProgramCacheKey=()=>'tf'}
window.FSFaunaHD=function(root,rig,genes,animal,a,T,hd){try{
 const CL=typeof COLORS!=='undefined'?COLORS:{},gc=new T.Color(CL[genes.color]||'#e2b273'),g2=new T.Color(CL[genes.color2]||'#000');const seen=new Set();
 root.traverse(m=>{if(!m.isMesh||!m.material||Array.isArray(m.material))return;const M=m.material;if(M.side===T.BackSide)return;if(seen.has(M))return;seen.add(M);
  if(M.color&&(M.color.equals(gc)||M.color.equals(g2))){const h={};M.color.getHSL(h);M.color.setHSL(h.h,Math.min(1,h.s*1.25+.05),Math.min(.72,h.l+.04))}
  if(!M.isMeshBasicMaterial&&!M.isShaderMaterial&&!M.onBeforeCompile.toString().includes('uTime'))hook(M,T)});
 const R=a&&a.head?a.head:.12;(rig.eyes||[]).forEach(e=>{const ir=e.children[1];if(ir&&ir.isMesh)ir.scale.multiplyScalar(1.12);const h1=e.children[2];if(h1&&h1.isMesh)h1.scale.multiplyScalar(1.25);
  const hl=new T.Mesh(new T.SphereGeometry(1,10,8),new T.MeshBasicMaterial({color:0xffffff}));hl.scale.set(R*.032,R*.032,R*.016);hl.position.set(-R*.05,-R*.06,R*.24);hl.userData.ol=1;hl.userData.noToon=1;e.add(hl)});
}catch(e){console.warn('toonfauna',e)}};
})();

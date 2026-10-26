// v3 original procedural art: shaded iso cubes + 2D cartoon fauna with animation. No external assets.
const TW=64,TH=32,CD=20;
function shade(hex,a){let n=parseInt(hex.slice(1,7),16),r=n>>16,g=n>>8&255,b=n&255;const f=v=>Math.max(0,Math.min(255,Math.round(a<0?v*(1+a):v+(255-v)*a)));return'#'+((1<<24)|(f(r)<<16)|(f(g)<<8)|f(b)).toString(16).slice(1)}
function poly(c,pts,fill,stroke){c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.stroke()}}
function hash(a,b,k=0){let h=(a*374761393+b*668265263+k*2147483647)|0;h=(h^(h>>>13))*1274126177;return((h^(h>>>16))>>>0)/4294967296}
function lg(c,x0,y0,x1,y1,a,b){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,a);g.addColorStop(1,b);return g}
// generic object cube (pollution, machines)
function cube(c,x,y,top,l,r,h=CD,w=TW/2,hh=TH/2){
 poly(c,[x-w,y,x,y+hh,x,y+hh+h,x-w,y+h],lg(c,0,y,0,y+h+hh,l,shade(l,-.25)));poly(c,[x+w,y,x,y+hh,x,y+hh+h,x+w,y+h],lg(c,0,y,0,y+h+hh,r,shade(r,-.25)));
 poly(c,[x,y-hh,x+w,y,x,y+hh,x-w,y],lg(c,x-w,y-hh,x+w,y+hh,shade(top,.12),top));
 c.lineWidth=1.2;c.strokeStyle='#ffffff55';c.beginPath();c.moveTo(x-w,y);c.lineTo(x,y-hh);c.lineTo(x+w,y);c.stroke();c.strokeStyle='#00000030';c.beginPath();c.moveTo(x,y+hh);c.lineTo(x,y+hh+h);c.stroke()}
// ground tile with exposed-edge sides, grass lip, texture & AO
function tile(c,x,y,pal,i,j,showL,showR,depth,biome){const w=TW/2,hh=TH/2,h=CD+depth;
 if(showL){poly(c,[x-w,y,x,y+hh,x,y+hh+h,x-w,y+h],lg(c,0,y,0,y+h,pal[1],shade(pal[1],-.45)));poly(c,[x-w,y,x,y+hh,x,y+hh+5,x-w,y+5],shade(pal[0],-.18));
  c.fillStyle='#00000022';for(let k=0;k<3;k++){const u=hash(i,j,k);c.fillRect(x-w+4+u*24,y+10+hash(j,i,k)*h*.6+u*8,3,2)}}
 if(showR){poly(c,[x+w,y,x,y+hh,x,y+hh+h,x+w,y+h],lg(c,0,y,0,y+h,pal[2],shade(pal[2],-.45)));poly(c,[x+w,y,x,y+hh,x,y+hh+5,x+w,y+5],shade(pal[0],-.3))}
 const v=hash(i,j)*.08-.04,top=shade(pal[0],v+((i+j)%2?0:-.03));
 poly(c,[x,y-hh,x+w,y,x,y+hh,x-w,y],lg(c,x,y-hh,x,y+hh,shade(top,.1),shade(top,-.06)));
 c.fillStyle=biome==='arctic'?'#ffffff99':'#00000014';for(let k=0;k<4;k++){const a=hash(i,j,k+5)-.5,b=hash(j,i,k+9)-.5;c.fillRect(x+a*w*1.2-(b*0),y+b*hh*.9,2,1.5)}
 c.lineWidth=1;c.strokeStyle='#ffffff40';c.beginPath();c.moveTo(x-w,y);c.lineTo(x,y-hh);c.lineTo(x+w,y);c.stroke();c.strokeStyle='#0000001a';c.beginPath();c.moveTo(x-w,y);c.lineTo(x,y+hh);c.lineTo(x+w,y);c.stroke()}
// small swaying tile details
function tileDeco(c,x,y,biome,i,j,t){const r=hash(i,j,3);if(r>.42)return;const ox=(hash(i,j,4)-.5)*30,oy=(hash(i,j,6)-.5)*12,X=x+ox,Y=y+oy,sw=Math.sin(t/700+i+j)*2;c.lineWidth=1.6;
 if(biome==='arctic'){c.fillStyle='#fff';c.beginPath();c.ellipse(X,Y,6,2.5,0,0,7);c.fill();return}
 if(biome==='dungeon'){c.fillStyle='#5d5868';c.fillRect(X-3,Y-2,4,3);c.fillRect(X+2,Y,3,2);return}
 if(biome==='scorch'){c.fillStyle='#c98a4a';c.beginPath();c.arc(X,Y,2,0,7);c.arc(X+5,Y+1,1.5,0,7);c.fill();return}
 const gcol=biome==='swamp'?'#4d6b2e':biome==='rock'?'#8f9a6a':'#3f8f35';c.strokeStyle=gcol;
 for(let k=-1;k<2;k++){c.beginPath();c.moveTo(X+k*3,Y);c.quadraticCurveTo(X+k*3,Y-5,X+k*4+sw,Y-9);c.stroke()}
 if(r<.1&&(biome==='home'||biome==='garden'||biome==='forest')){c.fillStyle=['#ff7eb6','#ffe04a','#fff','#9ecbff'][Math.floor(r*40)%4];c.beginPath();c.arc(X+sw,Y-10,2.6,0,7);c.fill()}
 if(r<.07&&biome==='swamp'){c.fillStyle='#7a5a3a';c.fillRect(X+5,Y-14,2.5,14);c.fillStyle='#5a3d22';c.fillRect(X+4,Y-18,4.5,6)}}
function glow(c,x,y,t,r=26){c.save();c.globalAlpha=.35+.2*Math.sin(t/220);const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'#b6ff7a');g.addColorStop(1,'#6dff5a00');c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r/2,0,0,7);c.fill();c.globalAlpha=.8;c.strokeStyle='#8dff6a';c.lineWidth=2;c.beginPath();c.ellipse(x,y,r*.8,r*.4,0,0,7);c.stroke();c.restore()}
function E(c,x,y,rx,ry,f,rot=0){c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,0,7);c.fillStyle=f;c.fill();c.stroke()}
function EG(c,x,y,rx,ry,col,rot=0){const g=c.createRadialGradient(x-rx*.35,y-ry*.55,1,x,y,Math.max(rx,ry)*1.2);g.addColorStop(0,shade(col,.4));g.addColorStop(.55,col);g.addColorStop(1,shade(col,-.28));c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot,0,7);c.fillStyle=g;c.fill();c.stroke()}
// ---- Fauna ---- anim: {walk,zap(0..1),happy,sleep}
function drawFauna(c,g,x,y,s,t,face=1,mood='',anim={}){
 const col=COLORS[g.color]||'#e2b273',dk=shade(col,-.3),lt=shade(col,.5),ln=shade(col,-.6),sp=g.species,sleep=mood==='sleep'||anim.sleep,happy=anim.happy;
 const walk=anim.walk,ph=t/85,hop=walk?Math.abs(Math.sin(ph))*3:0,breathe=sleep?Math.sin(t/600)*.04:Math.sin(t/420)*.025,zap=anim.zap||0;
 c.save();c.translate(x,y);c.scale(s*face,s);
 c.fillStyle='#00000030';c.beginPath();c.ellipse(0,0,24-hop,7-hop/3,0,0,7);c.fill();
 c.translate(-zap*4,-hop);c.scale(1+breathe+zap*.08,1-breathe-zap*.06);if(sleep)c.translate(0,6);
 c.lineWidth=2.4;c.strokeStyle=ln;c.lineJoin='round';c.lineCap='round';
 const legs=(n=4,len=12)=>{if(sleep)len=3;for(let i=0;i<n;i++){const lx=-14+i*(28/(n-1)),lift=walk?Math.max(0,Math.sin(ph+i*Math.PI/2*(i%2?1:-1)+(i%2)*Math.PI))*4:0;c.fillStyle=lg(c,0,-len,0,0,i%2?dk:col,shade(i%2?dk:col,-.25));c.beginPath();c.roundRect(lx-4,-len-lift,8,len,3.5);c.fill();c.stroke()}};
 const tail=(tx,ty,kind)=>{c.save();c.translate(tx,ty);c.rotate(Math.sin(t/(happy?90:260))*(happy?.5:.25));
  if(g.tail==='Mild'){EG(c,-4,0,5,4,col)}else if(kind==='bushy'){EG(c,-12,-4,14,7,col,-.4);E(c,-22,-9,5,4,'#fff')}else if(kind==='curl'){c.beginPath();c.arc(-6,-4,5,0,5.5);c.stroke()}
  else if(kind==='puff'){EG(c,-3,-2,6,6,'#ffffff')}else if(kind==='mane'){EG(c,-10,0,11,4.5,dk,-.6)}else{c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-14,-2,-20,-12);c.lineWidth=5;c.strokeStyle=ln;c.stroke();c.lineWidth=3;c.strokeStyle=dk;c.stroke();c.lineWidth=2.4;c.strokeStyle=ln}
  if(g.tail==='Flower'){c.lineWidth=1;for(let i=0;i<5;i++)E(c,-20+Math.cos(i*1.26)*4,-12+Math.sin(i*1.26)*4,3,3,'#ff9ad5');E(c,-20,-12,2,2,'#ffe04a');c.lineWidth=2.4}c.restore()};
 const pattern=(bx,by,rx,ry)=>{c.save();c.beginPath();c.ellipse(bx,by,rx-1,ry-1,0,0,7);c.clip();c.fillStyle=dk;c.strokeStyle=dk;
  if(g.pattern==='Spots')for(let i=0;i<5;i++){c.beginPath();c.arc(bx-rx+6+i*rx*.45,by-ry/3+(i%2)*ry*.6,3.5,0,7);c.fill()}
  if(g.pattern==='Stripes'){c.lineWidth=3;for(let i=-3;i<4;i++){c.beginPath();c.moveTo(bx+i*7,by-ry);c.lineTo(bx+i*7-4,by+ry);c.stroke()}}
  if(g.pattern==='Palm')for(let i=0;i<3;i++){c.save();c.translate(bx-rx/2+i*rx/2,by);c.lineWidth=.8;c.strokeStyle='#2c6e34';for(let k=0;k<4;k++){c.rotate(1.57);E(c,4,0,5,2,'#3e9b4a')}c.restore()}
  if(g.pattern==='B-sharp'){c.font='bold 11px serif';c.fillText('♯',bx-8,by+3);c.fillText('♭',bx+3,by-1)}c.restore()};
 const blink=((t+(g.color.length*397))%3900)<120;
 const eye=(ex,ey,r=3.4)=>{c.lineWidth=1.6;c.strokeStyle=ln;if(sleep||blink||g.eyes==='Sleepy'&&!happy){c.beginPath();c.arc(ex,ey,r,.2,2.9);c.stroke()}else if(happy){c.beginPath();c.arc(ex,ey+2,r,3.5,5.9);c.stroke()}
  else{E(c,ex,ey,r+.8,r+1.3,'#fff');c.fillStyle='#1d1d2a';c.beginPath();c.arc(ex+1,ey+.6,r*.72,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(ex+2,ey-.7,1.2,0,7);c.fill()}
  if(g.eyes==='Vamp'&&!sleep){c.strokeStyle='#8a3cb8';c.lineWidth=2;c.beginPath();c.arc(ex,ey,r+2,3.4,6);c.stroke();c.strokeStyle='#111';c.beginPath();c.moveTo(ex+3,ey-4);c.lineTo(ex+6,ey-7);c.stroke()}
  c.fillStyle='#ff8fb066';c.beginPath();c.ellipse(ex+1,ey+r+3.5,3,1.8,0,0,7);c.fill();c.lineWidth=2.4;c.strokeStyle=ln};
 switch(sp){
 case'scooter':legs(4,8);tail(-20,-12,'thin');EG(c,0,-16,22,11,col);{const sh=g.pattern==='B-sharp'||g.pattern==='Palm'?col:'#5f9e4f';EG(c,-1,-22,19,13,sh);c.lineWidth=1.2;for(let i=-1;i<2;i++)poly(c,[i*10-4,-27,i*10+4,-27,i*10+6,-20,i*10-6,-20],shade(sh,.25),shade(sh,-.4));c.lineWidth=2.4}pattern(-1,-22,19,13);EG(c,22,-22+(walk?Math.sin(ph)*1.5:0),10,9,col);eye(24,-25);break;
 case'grabber':for(let i=0;i<6;i++){const a=Math.sin(t/(walk?90:220)+i)*4;c.beginPath();c.moveTo(-14+i*6,-12);c.quadraticCurveTo(-18+i*7+a,-2,-14+i*7,2);c.lineWidth=7;c.strokeStyle=ln;c.stroke();c.lineWidth=4.5;c.strokeStyle=dk;c.stroke()}c.lineWidth=2.4;c.strokeStyle=ln;EG(c,0,-28,20,20,col);pattern(0,-28,20,20);eye(-6,-28);eye(7,-28);c.beginPath();c.arc(0,-20,3,.3,2.8);c.stroke();break;
 case'reacher':legs(4,20);tail(-20,-30,'thin');EG(c,0,-30,20,11,col);pattern(0,-30,20,11);c.fillStyle=lg(c,10,0,28,0,col,dk);c.beginPath();c.moveTo(10,-36);c.lineTo(20,-66);c.lineTo(28,-64);c.lineTo(20,-30);c.fill();c.stroke();for(const o of[22,27])EG(c,o,-82,2.5,6,dk);EG(c,26,-72,10,8,col);EG(c,33,-69,6,4,lt);eye(26,-74,2.8);break;
 case'chomper':legs(4,7);tail(-20,-12,'thin');c.fillStyle=col;c.beginPath();c.moveTo(-22,-14);c.lineTo(-38,-8+Math.sin(t/200)*2);c.lineTo(-20,-6);c.fill();c.stroke();EG(c,0,-14,22,9,col);pattern(0,-14,22,9);poly(c,[16,-22,40,-18,40,-12,16,-8],lg(c,0,-22,0,-8,lt,col),ln);c.lineWidth=1;for(let i=0;i<4;i++)poly(c,[22+i*5,-12,24+i*5,-9,26+i*5,-12],'#fff','#999');c.lineWidth=2.4;for(let i=-2;i<3;i++)EG(c,i*7,-23,2.6,2.6,dk);eye(18,-24,3);break;
 default:{const big=sp==='grazer'||sp==='hugger',small=sp==='nibber'||sp==='oinker';
  legs(4,sp==='hoofer'?16:small?7:11);tail(-20,-22,{pouncer:'bushy',oinker:'curl',nibber:'puff',hoofer:'mane',hugger:'puff',grazer:'thin'}[sp]||'thin');
  const by=sp==='hoofer'?-28:small?-17:-23,brx=big?24:20,bry=big?15:11;EG(c,0,by,brx,bry,col);E(c,2,by+bry*.45,brx*.6,bry*.35,lt+'88');c.strokeStyle=ln;pattern(0,by,brx,bry);
  if(sp==='grazer')EG(c,-2,by-10,14,8,dk);
  const hx=sp==='hoofer'?20:18,hy=by-14+(walk?Math.sin(ph*2)*1:0),hr=big?13:sp==='nibber'?11:12;
  if(sp==='nibber'){const ew=Math.sin(t/500)*.15;EG(c,hx-4,hy-20,4,13,col,-.2+ew);EG(c,hx+3,hy-20,4,13,col,.2-ew);c.lineWidth=0;c.fillStyle='#ffc0d0';c.beginPath();c.ellipse(hx+3,hy-20,1.8,9,.2-ew,0,7);c.fill();c.lineWidth=2.4}
  if(sp==='scratcher'||sp==='pouncer'){poly(c,[hx-9,hy-6,hx-6,hy-20,hx,hy-9],col,ln);poly(c,[hx+1,hy-9,hx+8,hy-20,hx+10,hy-5],col,ln);poly(c,[hx+3,hy-10,hx+7,hy-16,hx+8,hy-8],'#ffb6c8')}
  if(sp==='hoofer'){poly(c,[hx-4,hy-8,hx-2,hy-20,hx+3,hy-9],col,ln);EG(c,hx-9,hy-2,5,12,dk,.4)}
  if(sp==='hugger'){EG(c,hx-8,hy-10,5,5,col);EG(c,hx+7,hy-10,5,5,col)}
  if(sp==='grazer'){c.lineWidth=3.5;c.strokeStyle='#f0e6cc';c.beginPath();c.arc(hx-10,hy-6,7,3.4,5.2);c.stroke();c.beginPath();c.arc(hx+10,hy-6,7,4.2,6);c.stroke();c.lineWidth=2.4;c.strokeStyle=ln}
  EG(c,hx,hy,hr,hr*.9,col);
  if(sp==='sniffer'){EG(c,hx-8,hy+2+Math.sin(t/300),4,10,dk,.3)}
  if(sp==='oinker'){poly(c,[hx-8,hy-8,hx-4,hy-15,hx,hy-9],col,ln);EG(c,hx+10,hy+3,5,4,shade(col,.2));c.fillStyle=dk;c.fillRect(hx+8,hy+2,1.5,2);c.fillRect(hx+11,hy+2,1.5,2)}
  else if(sp==='hoofer'){EG(c,hx+9,hy+5,8,6,lt);c.fillStyle=ln;c.fillRect(hx+13,hy+3,1.6,1.6)}else if(sp==='pouncer'){poly(c,[hx+6,hy-2,hx+20,hy+4,hx+6,hy+7],lt,ln);E(c,hx+19,hy+4,2,2,'#222')}
  else{EG(c,hx+8,hy+4,6,4.5,lt);E(c,hx+12,hy+2,2.2,1.8,'#333')}
  c.lineWidth=1.4;c.beginPath();c.arc(hx+7,hy+7,2.5,.2,happy?3:2.4);c.stroke();c.lineWidth=2.4;
  if(sp==='scratcher'){c.lineWidth=1;for(const d of[-2,2]){c.beginPath();c.moveTo(hx+12,hy+4);c.lineTo(hx+22,hy+4+d*2);c.stroke()}c.lineWidth=2.4}
  eye(hx+2,hy-3)}}
 c.restore()}
function drawAmelia(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=2;c.strokeStyle='#3b2a20';
 EG(c,0,30,22,16,'#4f9d69');EG(c,0,0,17,18,'#f2c9a0');c.fillStyle='#7a4a2a';c.beginPath();c.arc(0,-4,18,3.3,6.1);c.fill();EG(c,-16,6,5,10,'#7a4a2a');EG(c,16,6,5,10,'#7a4a2a');
 poly(c,[-24,-12,24,-12,12,-30,-12,-30],'#3d8b5a','#24563a');EG(c,0,-30,12,4,'#5fb57a');E(c,10,-20,4,4,'#ffe04a');
 E(c,-6,2,2.2,2.6,'#2a2a2a');E(c,6,2,2.2,2.6,'#2a2a2a');c.beginPath();c.arc(0,8,5,.3,2.8);c.stroke();c.fillStyle='#ff9bb088';c.beginPath();c.arc(-10,8,3,0,7);c.arc(10,8,3,0,7);c.fill();c.restore()}
// ---- World objects ----
function drawObj(c,o,x,y,t,env){c.save();c.lineWidth=2;c.strokeStyle='#0005';const L=env.lights;
 switch(o.type){
 case'poll':{const hh=8+o.hp*6,w=Math.sin(t/300+o.v)*1.5;cube(c,x,y-hh,['#8c5bb0','#6b8f2f','#58606a'][o.v%3],['#5e3a7a','#4b6720','#3c434b'][o.v%3],['#4a2c61','#3c521a','#2e343b'][o.v%3],hh+w,18,9);
  c.fillStyle='#4a2c6188';c.beginPath();c.ellipse(x,y+9,22,6,0,0,7);c.fill();
  c.fillStyle='#d9ff6a';for(let i=0;i<2;i++){c.beginPath();c.arc(x-5+i*10,y-hh-3+Math.sin(t/150+i)*2,2.5,0,7);c.fill()}
  for(let k=0;k<2;k++){const p=((t/30+o.v*20+k*40)%60)/60;c.fillStyle=`rgba(190,255,60,${.7*(1-p)})`;c.beginPath();c.arc(x+(k?-8:8),y-hh-6-p*22,2+p*2,0,7);c.fill()}break}
 case'tox':{const s=1+Math.sin(t/160)*.08;c.translate(x,y);c.fillStyle='#0003';c.beginPath();c.ellipse(0,0,18,6,0,0,7);c.fill();c.scale(s,1/s);
  c.fillStyle=lg(c,0,-32,0,0,'#a464d4','#5a2a80');c.beginPath();c.moveTo(-18,0);c.quadraticCurveTo(-20,-30,0,-32);c.quadraticCurveTo(20,-30,18,0);for(let i=0;i<4;i++)c.quadraticCurveTo(13-i*9,4,9-i*9,0);c.fill();c.stroke();
  c.fillStyle='#e8ff5a';c.beginPath();c.arc(-6,-18,4,0,7);c.arc(6,-18,4,0,7);c.fill();c.fillStyle='#222';c.fillRect(-7,-19,2,3);c.fillRect(5,-19,2,3);c.strokeStyle='#2a0a3a';c.beginPath();c.moveTo(-10,-24);c.lineTo(-3,-22);c.moveTo(10,-24);c.lineTo(3,-22);c.stroke();
  c.fillStyle='#b26be0';c.fillRect(-12,-36,2,6);c.fillRect(10,-38,2,8);c.fillStyle='#ff5a7a';c.font='bold 10px sans-serif';c.fillText('♥'.repeat(o.hp),-o.hp*3.5,-42);break}
 case'tree':{const arc=env.biome==='arctic',sw=Math.sin(t/900+o.i)*.04,lc=arc?'#7fae9e':env.biome==='swamp'?'#5f7f3a':'#4e9a3c';c.fillStyle='#00000025';c.beginPath();c.ellipse(x,y+2,22,8,0,0,7);c.fill();
  c.fillStyle=lg(c,x-5,0,x+5,0,'#8a5e38','#5e3e22');c.beginPath();c.moveTo(x-5,y);c.lineTo(x-3,y-34);c.lineTo(x+3,y-34);c.lineTo(x+5,y);c.fill();c.stroke();
  c.translate(x,y-34);c.rotate(sw);for(const[a,b,r]of[[-14,-6,14],[14,-6,14],[0,-16,20],[-6,-24,12],[8,-22,12]])EG(c,a,b,r,r*.85,lc);if(arc)for(const[a,b]of[[-6,-34],[8,-30],[-14,-16]]){c.fillStyle='#fff';c.beginPath();c.ellipse(a,b,7,3,0,0,7);c.fill()}
  if(o.ready)for(let i=0;i<3;i++)EG(c,-10+i*10,-10+(i%2)*8,3.8,3.8,'#5868e8');break}
 case'pool':{c.fillStyle='#6a5a40';c.beginPath();c.ellipse(x,y+1,29,14,0,0,7);c.fill();c.fillStyle=lg(c,0,y-12,0,y+12,'#4fb6ea','#1f6aa8');c.beginPath();c.ellipse(x,y,26,12,0,0,7);c.fill();
  c.strokeStyle='#ffffff99';c.lineWidth=1.2;for(let k=0;k<2;k++){const p=((t/1800+k*.5)%1);c.globalAlpha=1-p;c.beginPath();c.ellipse(x-4,y,6+p*16,3+p*7,0,0,7);c.stroke()}c.globalAlpha=1;
  c.fillStyle='#ffffff70';c.beginPath();c.ellipse(x-8+Math.sin(t/700)*3,y-4,8,2,0,0,7);c.fill();if(o.ready){c.fillStyle='#fff';c.font='14px sans-serif';c.fillText('✦',x+6,y+2-Math.abs(Math.sin(t/300))*5)}break}
 case'rock':c.fillStyle='#00000025';c.beginPath();c.ellipse(x,y+2,22,7,0,0,7);c.fill();c.strokeStyle='#4a463e';EG(c,x,y-10,20,13,'#9a958a');EG(c,x+9,y-5,9,7,'#8a857a');E(c,x-6,y-16,7,3,'#ffffff40');if(o.ready){c.fillStyle='#ffe066';c.font='14px sans-serif';c.fillText('✦',x+10,y-20-Math.abs(Math.sin(t/300))*4)}break;
 case'stump':c.fillStyle=lg(c,x-14,0,x+14,0,'#8a5e38','#5e3e22');c.fillRect(x-14,y-18,28,18);c.strokeRect(x-14,y-18,28,18);EG(c,x,y-18,14,6,'#c49a63');c.strokeStyle='#8a6a40';c.beginPath();c.ellipse(x,y-18,8,3.2,0,0,7);c.stroke();E(c,x,y-18,4,1.8,'#3d2a17');EG(c,x+12,y-4,5,3,'#5fae4a');if(o.ready){c.fillStyle='#ffe066';c.font='14px sans-serif';c.fillText('✦',x+12,y-24-Math.abs(Math.sin(t/300))*4)}break;
 case'gate':{L&&L.push([x,y-26,70,'#6fd7ff']);const sp=t/600;cube(c,x,y,'#c7b48a','#8c7a55','#6f5f40',5,24,12);const g=c.createRadialGradient(x,y-26,2,x,y-26,26);g.addColorStop(0,'#e6fbff');g.addColorStop(1,'#3fb6ff66');c.fillStyle=g;c.beginPath();c.ellipse(x,y-26,17,25,0,0,7);c.fill();
  c.strokeStyle='#ffffffaa';c.lineWidth=1.5;for(let k=0;k<3;k++){c.beginPath();c.ellipse(x,y-26,14-k*4,22-k*6,0,sp+k,sp+k+2.2);c.stroke()}c.lineWidth=6;c.strokeStyle=lg(c,x-20,0,x+20,0,'#c9a86a','#7d6438');c.beginPath();c.ellipse(x,y-26,20,28,0,0,7);c.stroke();
  for(let k=0;k<4;k++){const a=sp*2+k*1.57;E(c,x+Math.cos(a)*20,y-26+Math.sin(a)*28,2,2,'#bff')}break}
 case'goal':cube(c,x,y-26,'#ffd84a','#c99a1c','#a77d10',26,16,8);c.fillStyle='#fff';c.font='bold 16px sans-serif';c.fillText('★',x-6,y-22);c.fillStyle='#7a5a10';c.fillRect(x-1,y-60,2,10);E(c,x,y-62,4,4,o.alert?'#ff4':'#aa8');if(o.alert){L&&L.push([x,y-62,30,'#ffee66']);c.fillStyle='#fff36a';c.font='bold 22px sans-serif';c.strokeStyle='#7a5a10';c.lineWidth=3;const yy=y-72-Math.abs(Math.sin(t/200))*6;c.strokeText('!',x-3,yy);c.fillText('!',x-3,yy)}break;
 case'vendor':cube(c,x,y-14,'#d98c5f','#a45f37','#86492a',14,22,11);c.fillStyle='#7a5230';c.fillRect(x-22,y-36,3,22);c.fillRect(x+19,y-36,3,22);for(let i=0;i<4;i++)poly(c,[x-24+i*12,y-46,x-12+i*12,y-46,x-12+i*12,y-36+Math.sin(t/400+i),x-24+i*12,y-36+Math.sin(t/400+i)],i%2?'#fff':'#e44b4b','#0003');E(c,x-8,y-30,4,4,'#ff7a7a');E(c,x+2,y-31,4,4,'#ffd84a');E(c,x+11,y-30,4,4,'#8fd36b');break;
 case'den':poly(c,[x-28,y-4,x,y+10,x+28,y-4,x,y-18],'#8b6b45');c.fillStyle=lg(c,x,y-56,x,y,'#d6a466','#9a6c3a');c.beginPath();c.moveTo(x-26,y-2);c.quadraticCurveTo(x,y-62,x+26,y-2);c.fill();c.stroke();c.strokeStyle='#7a5228';for(let k=1;k<4;k++){c.beginPath();c.moveTo(x-26+k*3,y-2-k*8);c.quadraticCurveTo(x,y-62+k*12,x+26-k*3,y-2-k*8);c.stroke()}
  c.fillStyle='#2a1a0e';c.beginPath();c.ellipse(x,y-6,10,14,0,3.14,0);c.fill();E(c,x,y-58,6,4,'#5fb57a');break;
 case'nest':c.fillStyle='#00000025';c.beginPath();c.ellipse(x,y,26,9,0,0,7);c.fill();EG(c,x,y-6,22,9,'#b98a4a');c.lineWidth=1;c.strokeStyle='#7a5228';for(let i=0;i<9;i++){c.beginPath();c.arc(x-18+i*4.5,y-7,6,3.4,6);c.stroke()}if(o.egg){const w=Math.sin(t/120)*.12;c.save();c.translate(x,y-14);c.rotate(w);c.strokeStyle='#bba';EG(c,0,0,7,9,'#fff7e0');c.fillStyle='#8cd';c.fillRect(-4,-2,3,3);c.fillRect(2,2,2,2);c.restore()}break;
 case'treetree':c.fillStyle=lg(c,x-4,0,x+4,0,'#8a5e38','#5e3e22');c.fillRect(x-4,y-30,8,30);c.strokeRect(x-4,y-30,8,30);c.translate(x,y);c.rotate(Math.sin(t/900)*.03);for(const[a,b,r]of[[-12,-40,14],[12,-40,14],[0,-50,18]])EG(c,a,b,r,r*.85,'#ff9ccf');for(let i=0;i<o.count;i++){EG(c,-12+i*12,-40+(i%2)*6,4.5,4.5,'#ffe04a')}break;
 case'totem':cube(c,x,y-40,'#c9a46b','#9b7a46','#7c6034',40,10,5);for(const[yy,cc]of[[-30,'#7cd'],[-16,'#e77']])EG(c,x,y+yy,5,5,cc);c.fillStyle='#3a2a1a';c.fillRect(x-5,y-44,3,3);c.fillRect(x+2,y-44,3,3);if(o.ready){L&&L.push([x,y-50,30,'#ffe066']);c.fillStyle='#fff';c.font='14px sans-serif';c.fillText('⚙',x-5,y-56-Math.abs(Math.sin(t/300))*4)}break;
 case'project':cube(c,x,y-20,'#9ab','#678','#567',20,24,12);c.save();c.translate(x,y-34);c.rotate(t/800);c.fillStyle='#cde';for(let k=0;k<6;k++){c.rotate(1.047);c.fillRect(-2,-12,4,6)}EG(c,0,0,8,8,'#9ab');c.restore();c.fillStyle='#333';c.fillRect(x-20,y-60,40,6);c.fillStyle='#6f6';c.fillRect(x-20,y-60,40*Math.min(1,(o.prog||0)/o.need),6);break;
 case'skeleton':case'mammoth':{c.strokeStyle='#5a5246';c.lineWidth=7;const bone='#f3ecdb',ribs=()=>{for(let i=0;i<5;i++){c.beginPath();c.arc(x-4+i*0,y-6,10+i*3.5,3.5,5.9);c.stroke()}};ribs();c.lineWidth=4.5;c.strokeStyle=bone;ribs();
  c.lineWidth=2;c.strokeStyle='#5a5246';EG(c,x+26,y-22,10,8,bone);c.lineWidth=4;c.strokeStyle=bone;c.beginPath();c.moveTo(x+32,y-16);c.quadraticCurveTo(x+52,y-10,x+44,y-34);c.stroke();c.fillStyle='#333';c.beginPath();c.arc(x+28,y-24,2,0,7);c.fill();break}
 case'whalebone':c.strokeStyle='#8a7a60';c.lineWidth=8;c.beginPath();c.arc(x,y,28,3.3,6.1);c.stroke();c.strokeStyle='#fbf3e0';c.lineWidth=5;c.stroke();break;
 case'ruin':cube(c,x,y-38,'#c8c1a8','#99917a','#7d765f',38,11,5.5);c.fillStyle='#5fae4a';c.fillRect(x-11,y-34,4,14);c.fillRect(x+4,y-20,3,10);cube(c,x,y-44,'#d8d1b8','#a9a18a','#8d866f',6,14,7);break;
 case'arch':cube(c,x-18,y-40,'#c8c1a8','#99917a','#7d765f',40,8,4);cube(c,x+18,y-40,'#c8c1a8','#99917a','#7d765f',40,8,4);c.fillStyle='#b8b198';c.strokeStyle='#7d765f';c.beginPath();c.moveTo(x-26,y-44);c.quadraticCurveTo(x,y-70,x+26,y-44);c.lineTo(x+26,y-50);c.quadraticCurveTo(x,y-78,x-26,y-50);c.fill();c.stroke();c.fillStyle='#5fae4a';c.fillRect(x-22,y-48,6,3);break;
 case'torch':{const f=Math.sin(t/60)*1.5+Math.sin(t/37);L&&L.push([x,y-34,90+f*4,'#ffb04a']);c.fillStyle='#4a3a2a';c.fillRect(x-2,y-30,4,30);E(c,x,y-34,5,3,'#6a5a4a');c.fillStyle='#ff9a2a';c.beginPath();c.moveTo(x-5,y-34);c.quadraticCurveTo(x,y-50-f,x+5,y-34);c.fill();c.fillStyle='#ffe66a';c.beginPath();c.moveTo(x-2,y-34);c.quadraticCurveTo(x,y-43-f,x+2,y-34);c.fill();break}
 case'igloo':c.strokeStyle='#9ab8cc';EG(c,x,y-12,24,20,'#f4fbff');c.beginPath();for(let k=1;k<3;k++){c.moveTo(x-22,y-8-k*7);c.quadraticCurveTo(x,y-14-k*8,x+22,y-8-k*7)}c.stroke();c.fillStyle='#3a5a7a';c.beginPath();c.ellipse(x+8,y-4,6,8,0,3.14,0);c.fill();L&&L.push([x+8,y-8,40,'#ffd27a']);break;
 case'lamp':L&&L.push([x,y-34,60,'#ffe0a0']);c.fillStyle='#8a8070';c.fillRect(x-6,y-6,12,6);c.fillRect(x-2,y-28,4,22);cube(c,x,y-34,'#ffe8a8','#e0b860','#c09840',8,8,4);c.fillStyle='#6a6050';poly(c,[x-10,y-40,x+10,y-40,x,y-48],'#6a6050');break;
 case'zenrock':c.strokeStyle='#4a463e';EG(c,x,y-8,16,11,'#a7a294');EG(c,x+2,y-20,11,7,'#b7b2a4');EG(c,x,y-29,7,5,'#c7c2b4');c.strokeStyle='#c9c09a';c.lineWidth=1;for(let k=1;k<3;k++){c.beginPath();c.ellipse(x,y-2,18+k*6,6+k*3,0,0,7);c.stroke()}break;
 case'chain':c.strokeStyle='#777';c.lineWidth=2;for(let k=0;k<6;k++){c.beginPath();c.ellipse(x,y-60+k*8+Math.sin(t/700)*1,3,4.5,0,0,7);c.stroke()}break;
 case'reeds':for(let k=0;k<5;k++){const sw=Math.sin(t/600+k)*3;c.strokeStyle='#5a7a3a';c.lineWidth=2.5;c.beginPath();c.moveTo(x-10+k*5,y);c.quadraticCurveTo(x-10+k*5,y-16,x-10+k*5+sw,y-28-k%2*6);c.stroke();if(k%2){c.fillStyle='#6a4a2a';c.fillRect(x-11.5+k*5+sw,y-34-k%2*6,3.5,9)}}break;
 case'mushring':for(let k=0;k<5;k++){const a=k*1.25,X=x+Math.cos(a)*16,Y=y+Math.sin(a)*7;c.fillStyle='#f4ead6';c.fillRect(X-2,Y-8,4,8);EG(c,X,Y-9,7,4,k%2?'#e44b4b':'#d68a3a')}break;
 case'decor':{const k=o.item;c.strokeStyle='#0004';if(k==='d_flower'){c.fillStyle=lg(c,x-7,0,x+7,0,'#d8735a','#a8503a');c.fillRect(x-7,y-12,14,12);for(let i=0;i<3;i++)EG(c,x-6+i*6,y-18+Math.sin(t/500+i),4,4,['#ffef6a','#ff9ac8','#9ccfff'][i])}
  else if(k==='d_lantern'){L&&L.push([x,y-36,60,'#ffd06a']);c.fillStyle='#544';c.fillRect(x-1,y-34,2,34);EG(c,x,y-36,6,8,'#ffcf4a')}
  else if(k==='d_paving')poly(c,[x-26,y,x,y-13,x+26,y,x,y+13],'#ddd6c8','#0002');else if(k==='d_mushroom'){c.fillStyle='#f4ead6';c.fillRect(x-4,y-20,8,20);EG(c,x,y-22,16,9,'#e44b4b');E(c,x-5,y-25,2.5,2,'#fff');E(c,x+6,y-23,2.5,2,'#fff')}
  else if(k==='d_crystal'){L&&L.push([x,y-22,50,'#7ad7ff']);poly(c,[x,y-44,x+9,y-14,x,y,x-9,y-14],lg(c,x-9,0,x+9,0,'#bdf0ff','#3a9fd0'),'#2a7fa0')}else if(k==='d_fence'){c.fillStyle='#fff';for(let i=0;i<4;i++)c.fillRect(x-18+i*10,y-18+i*3,5,16);c.fillRect(x-18,y-12,36,3)}break}}
 c.restore()}
function faunaPortrait(g,size=80,t=0,anim={}){const cv=document.createElement('canvas');cv.width=cv.height=size*2;const c=cv.getContext('2d');c.scale(2,2);drawFauna(c,g,size/2,size*.85,size/105,t,1,'',anim);return cv}

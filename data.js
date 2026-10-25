// Game data. Names marked (S) are sourced in RESEARCH.md; others are guesses.
const SPECIES={ // skill: shake|dive|lift|root (starters sourced; the rest guessed)
 hoofer:{name:'Hoofer',animal:'horse',skill:'shake',fav:'berry',starter:1,desc:'Sure-footed; kicks trees to shake down items.'},
 sniffer:{name:'Sniffer',animal:'dog',skill:'lift',fav:'truffle',starter:1,desc:'Keen nose; sniffs out treasure and lifts rocks.'},
 scooter:{name:'Scooter',animal:'turtle',skill:'dive',fav:'fish',starter:1,desc:'Small but hardy; dives into pools.'},
 chomper:{name:'Chomper',animal:'crocodile',skill:'dive',fav:'fish'},
 grabber:{name:'Grabber',animal:'octopus',skill:'dive',fav:'fish'},
 grazer:{name:'Grazer',animal:'buffalo',skill:'shake',fav:'clover'},
 hugger:{name:'Hugger',animal:'bear',skill:'lift',fav:'berry'},
 oinker:{name:'Oinker',animal:'pig',skill:'root',fav:'truffle'},
 nibber:{name:'Nibber',animal:'rabbit',skill:'root',fav:'clover'},
 pouncer:{name:'Pouncer',animal:'fox',skill:'root',fav:'berry'},
 reacher:{name:'Reacher',animal:'giraffe',skill:'shake',fav:'clover'},
 scratcher:{name:'Scratcher',animal:'cat',skill:'lift',fav:'fish'}};
const SKILLS={shake:{verb:'Shake tree',node:'tree'},dive:{verb:'Dive pool',node:'pool'},lift:{verb:'Lift rock',node:'rock'},root:{verb:'Root in stump',node:'stump'}};
const COLORS={Tan:'#e2b273',Cocoa:'#9a6b45',Cream:'#f3e6c4',Slate:'#8a99a8',Moss:'#8fbf5a',Sky:'#7fc3ec',Plum:'#a77bc9',Sunny:'#f6cf4a','Hot Pink':'#ff5fb0',Turquoise:'#2fd3c4'};
const PATTERNS=['Plain','Spots','Stripes','Palm','B-sharp'];const TAILS=['Normal','Flower','Mild'];const EYES=['Round','Sleepy','Vamp'];
const ITEMS={
 treat:{name:'Treat',type:'food',e:15,h:10,icon:'🍬'},berry:{name:'Treetop Berry',type:'food',e:12,h:14,icon:'🫐'},
 fish:{name:'Pool Minnow',type:'food',e:18,h:8,icon:'🐟'},truffle:{name:'Stump Truffle',type:'food',e:10,h:18,icon:'🍄'},
 clover:{name:'Clover Bunch',type:'food',e:14,h:12,icon:'☘️'},tart:{name:'Berry Tart',type:'food',e:35,h:35,icon:'🥧'},
 stone:{name:'Shiny Stone',type:'mat',icon:'💎'},component:{name:'Totem Component',type:'mat',icon:'⚙️'},
 gene_heat:{name:'Heat Proof Gene Food',type:'gene',icon:'🔥',gene:{heatProof:true}},
 gene_pink:{name:'Hot Pink Gene Food',type:'gene',icon:'🎨',gene:{color:'Hot Pink'}},gene_teal:{name:'Turquoise Gene Food',type:'gene',icon:'🎨',gene:{color:'Turquoise'}},
 gene_flower:{name:'Flower Tail Gene Food',type:'gene',icon:'🌸',gene:{tail:'Flower'}},gene_vamp:{name:'Vamp Eyes Gene Food',type:'gene',icon:'👁️',gene:{eyes:'Vamp'}},
 gene_palm:{name:'Palm Pattern Gene Food',type:'gene',icon:'🌴',gene:{pattern:'Palm'}},
 d_flower:{name:'Flower Pot',type:'decor',icon:'🌼'},d_lantern:{name:'Glow Lantern',type:'decor',icon:'🏮'},d_paving:{name:'Paving Stone',type:'decor',icon:'⬜'},
 d_mushroom:{name:'Giant Mushroom',type:'decor',icon:'🍄'},d_crystal:{name:'Crystal Spire',type:'decor',icon:'🔷'},d_fence:{name:'Picket Fence',type:'decor',icon:'🪵'}};
const RECIPES=[{in:{treat:1,berry:1},out:'tart'}];
const VENDORS={
 rockgarden:[['treat',8],['clover',10],['d_flower',30],['d_fence',25],['d_paving',20],['d_lantern',60,'bux']],
 village:[['gene_heat',120],['gene_pink',200],['gene_teal',200],['gene_flower',250],['gene_vamp',250],['gene_palm',300,'bux']],
 amph:[['berry',12],['d_mushroom',80],['d_crystal',150]]};
// Zones: biome palette + content. tier scales pollution hp & lux.
const ZONES=[
 {id:'home',name:'Your Faunasphere',biome:'home',n:9,tier:0,stations:['gate','den','nest','treetree','totem'],nodes:{},poll:0,props:['mushring'],tox:0},
 {id:'rockgarden',name:'The Rock Garden',biome:'garden',n:10,tier:0,stations:['gate','goal','vendor','project'],nodes:{tree:1,rock:1},poll:2,props:['zenrock','zenrock','lamp','lamp'],tox:0},
 {id:'rockisland',name:'Rock Island',biome:'rock',n:10,tier:1,unlock:'g_buy',stations:['gate','goal'],nodes:{rock:2,tree:1,pool:1},poll:9,props:['zenrock','reeds'],tox:0},
 {id:'ruins',name:'Tribal Ruins',biome:'forest',n:10,tier:2,unlock:'g_rock',stations:['gate','goal'],nodes:{tree:3,stump:2,pool:1},poll:9,props:['ruin','ruin','arch','ruin','mushring'],tox:1},
 {id:'amph',name:'Forest Amphitheater',biome:'forest',n:11,tier:2,unlock:'g_ruins',stations:['gate','goal','vendor'],nodes:{tree:2,stump:2,pool:1,rock:1},poll:10,props:['arch','ruin','ruin','torch','torch','mushring'],tox:2},
 {id:'avalanche',name:'The Avalanche',biome:'arctic',n:10,tier:3,unlock:'g_amph',stations:['gate','goal'],nodes:{rock:2,pool:1},poll:10,props:['mammoth','mammoth','ruin'],tox:2},
 {id:'village',name:'Frozen Village',biome:'arctic',n:10,tier:3,unlock:'g_aval',stations:['gate','goal','vendor','project'],nodes:{rock:1,tree:1},poll:4,props:['igloo','igloo','igloo','lamp','mammoth'],tox:1},
 {id:'isthmus',name:'Whalebone Isthmus',biome:'scorch',n:10,tier:4,unlock:'g_village',heat:1,stations:['gate','goal'],nodes:{rock:2,stump:1},poll:11,props:['whalebone','whalebone','whalebone','torch'],tox:2},
 {id:'bogs',name:'The Bogs',biome:'swamp',n:11,tier:4,unlock:'g_swamp',heat:1,stations:['gate','goal'],nodes:{stump:2,pool:2,tree:1},poll:12,props:['reeds','reeds','reeds','mushring','torch'],tox:3},
 {id:'dungeon',name:'The Dungeon',biome:'dungeon',n:10,tier:5,unlock:'g_bogs',stations:['gate','goal'],nodes:{rock:2,stump:1},poll:14,props:['torch','torch','torch','torch','chain','chain','ruin','arch'],tox:4}];
const BIOMES={ // top,left,right,water,sky1,sky2
 home:['#7cd36b','#8a6a45','#6e5236','#4fb3e8','#9fe0ff','#e6fbff'],garden:['#9fd66b','#9a7d55','#7a6040','#56b8e6','#a6e3ff','#effbff'],
 rock:['#b8b29a','#8c8270','#6f6656','#5aa9cf','#b9dff2','#eef7fb'],forest:['#5fb54a','#7a5a38','#5c432a','#3d9fc8','#9ed9b0','#e2f5e0'],
 arctic:['#eef8ff','#a9c3d6','#8aa6bb','#9fd8f0','#cfe6f7','#ffffff'],scorch:['#e0b06a','#b0703c','#8c5530','#e86b2c','#ffcf8f','#fff1d6'],
 swamp:['#6f8f4a','#5a5034','#463e28','#5c7a5a','#a9b98a','#e3ead0'],dungeon:['#7a7488','#4f4a5c','#3c3846','#4a6c8a','#2d2a3a','#5a5470']};
const GOALS=[ // (S) first goal = buy from vendor; "Swampward Go" + Heat Proof reward sourced
 {id:'g_buy',zone:'rockgarden',text:'Buy something from the Vendor Station.',check:s=>s.stats.buys>=1,lux:25},
 {id:'g_rock',zone:'rockisland',text:'Zap 8 pollution on Rock Island.',check:s=>(s.stats.zap.rockisland||0)>=8,lux:40,item:'treat'},
 {id:'g_ruins',zone:'ruins',text:'Use your fauna\'s gathering skill 3 times.',check:s=>s.stats.skill>=3,lux:50},
 {id:'g_amph',zone:'amph',text:'Zap 2 toxic creatures and reach level 4.',check:s=>s.stats.tox>=2&&maxLv(s)>=4,lux:60},
 {id:'g_aval',zone:'avalanche',text:'Zap 10 pollution on the Avalanche.',check:s=>(s.stats.zap.avalanche||0)>=10,lux:80},
 {id:'g_village',zone:'village',text:'Reach level 7 with any fauna.',check:s=>maxLv(s)>=7,lux:100,item:'gene_heat'},
 {id:'g_swamp',zone:'isthmus',name:'Swampward Go',text:'Swampward Go: feed Heat Proof Gene Food and zap 8 pollution on the Isthmus.',check:s=>(s.stats.zap.isthmus||0)>=8,lux:120},
 {id:'g_bogs',zone:'bogs',text:'Zap 4 toxic creatures in the Bogs and reach level 10.',check:s=>(s.stats.toxZ.bogs||0)>=4&&maxLv(s)>=10,lux:150},
 {id:'g_dungeon',zone:'dungeon',text:'Clear every pollution cube in the Dungeon.',check:s=>s.stats.cleared.dungeon,lux:300,item:'d_crystal'}];
function maxLv(s){return Math.max(...s.fauna.map(f=>f.level))}

const PROPS=['skeleton','mammoth','whalebone','ruin','arch','torch','igloo','lamp','zenrock','chain','reeds','mushring'];

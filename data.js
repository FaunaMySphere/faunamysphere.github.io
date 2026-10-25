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
 nibber:{name:'Nibbler',animal:'rabbit',skill:'root',fav:'clover'},
 pouncer:{name:'Pouncer',animal:'fox',skill:'root',fav:'berry'},
 reacher:{name:'Reacher',animal:'giraffe',skill:'shake',fav:'clover'},
 scratcher:{name:'Scratcher',animal:'cat',skill:'lift',fav:'fish'}};
const SKILLS={shake:{verb:'Shake tree',node:'tree'},dive:{verb:'Dive pool',node:'pool'},lift:{verb:'Lift rock',node:'rock'},root:{verb:'Root in stump',node:'stump'}};
const COLORS={Tan:'#e2b273',Cocoa:'#9a6b45',Cream:'#f3e6c4',Slate:'#8a99a8',Moss:'#8fbf5a',Sky:'#7fc3ec',Plum:'#a77bc9',Sunny:'#f6cf4a','Hot Pink':'#ff5fb0',Turquoise:'#2fd3c4',Ochre:'#cc8a2a',Sepia:'#7a5230',Scarlet:'#d22a1e',White:'#f4f4f0',Gray:'#8c8c90',Maroon:'#7a1f2b','Tea Green':'#c9e8b0',Lime:'#a6e02a',Emerald:'#2ea86b',Lilac:'#c8a2e0',Amethyst:'#9966cc',Eggplant:'#5a2a5e',Teal:'#2a8c8c',Carnation:'#ff9fb8',Vermilion:'#e8452c',Kelly:'#3a9a2a',Violet:'#8a4fd0',Byzantium:'#702963',Ecru:'#d8cba0',Gold:'#e6b422',Black:'#2a2628',Rusty:'#b5562a',Merle:'#9aa0a8',Cobalt:'#2f55c8',Midnight:'#22285a'};
const PATTERNS=['Plain','Spots','Stripes','Palm','B-sharp'];const TAILS=['Normal','Flower','Mild','Straight'];const EYES=['Round','Sleepy','Vamp','Happy','Beady','Lashy','Serious','Smitten','Toony','Glam','Buster','Greenvamp','Bluevamp','Pinkvamp','Orangevamp','Purplevamp','Wired','Zonked','Dizzy','Evil','Cat','Surly'];
const ITEMS={
 treat:{name:'Treat',type:'food',e:15,h:10,icon:'🍬'},berry:{name:'Treetop Berry',type:'food',e:12,h:14,icon:'🫐'},
 fish:{name:'Pool Minnow',type:'food',e:18,h:8,icon:'🐟'},truffle:{name:'Stump Truffle',type:'food',e:10,h:18,icon:'🍄'},
 clover:{name:'Clover Bunch',type:'food',e:14,h:12,icon:'☘️'},tart:{name:'Berry Tart',type:'food',e:35,h:35,icon:'🥧'},
 stone:{name:'Shiny Stone',type:'mat',icon:'💎'},component:{name:'Biorock Disc',type:'mat',icon:'💿'},totem_base:{name:'Totem Base',type:'mat',icon:'🪨'},totem_coffer:{name:'Totem Coffer',type:'mat',icon:'🎁'},totem_lowman:{name:'Totem Lowman',type:'mat',icon:'🗿'},scanner:{name:'Scanner Doohickey',type:'mat',icon:'📡'},namechanger:{name:'Name Changer',type:'tool',icon:'🏷️'},trophy:{name:'Level 20 Fauna Trophy',type:'decor',icon:'🏆'},silt:{name:'Silt',type:'mat',icon:'🟫'},helianth:{name:'Helianth',type:'decor',icon:'🌻'},
 gene_heat:{name:'Heat Proof Gene Food',type:'gene',icon:'🔥',gene:{heatProof:true}},
 gene_pink:{name:'Hot Pink Gene Food',type:'gene',icon:'🎨',gene:{color:'Hot Pink'}},gene_teal:{name:'Turquoise Gene Food',type:'gene',icon:'🎨',gene:{color:'Turquoise'}},
 gene_flower:{name:'Flower Tail Gene Food',type:'gene',icon:'🌸',gene:{tail:'Flower'}},gene_vamp:{name:'Vamp Eyes Gene Food',type:'gene',icon:'👁️',gene:{eyes:'Vamp'}},
 gene_palm:{name:'Palm Pattern Gene Food',type:'gene',icon:'🌴',gene:{pattern:'Palm'}},
 d_flower:{name:'Flower Pot',type:'decor',icon:'🌼'},d_lantern:{name:'Glow Lantern',type:'decor',icon:'🏮'},d_paving:{name:'Paving Stone',type:'decor',icon:'⬜'},
 d_mushroom:{name:'Giant Mushroom',type:'decor',icon:'🍄'},d_crystal:{name:'Crystal Spire',type:'decor',icon:'🔷'},d_fence:{name:'Picket Fence',type:'decor',icon:'🪵'}};
const RECIPES=[{in:{treat:1,berry:1},out:'tart'}];
const VENDORS={
 rockgarden:[['helianth',25],['treat',8],['clover',10],['d_flower',30],['d_fence',25],['d_paving',20],['d_lantern',60,'bux']],
 village:[['gene_heat',120],['gene_pink',200],['gene_teal',200],['gene_flower',250],['gene_vamp',250],['gene_palm',300,'bux']],
 amph:[['berry',12],['d_mushroom',80],['d_crystal',150]]};
// Zones: biome palette + content. tier scales pollution hp & lux.
const ZONES=[
 {id:'home',name:'Your Faunasphere',biome:'home',n:9,tier:0,stations:['gate','den','nest','treetree','totem'],nodes:{},poll:0,props:['mushring'],tox:0},
 {id:'amelia',name:'Amelia\'s Sphere',biome:'night',n:9,tier:0,stations:['gate'],nodes:{pool:2},poll:0,props:['lamp','lamp','reeds','sunflower','mushring'],tox:0},
 {id:'rockgarden',name:'The Rock Garden',biome:'garden',n:10,tier:0,stations:['gate','goal','vendor','project'],nodes:{tree:1,rock:1},poll:5,props:['stonehead','stonehead','log','lilypond','sunflower','sunflower','sunflower','waterfall'],tox:0},
 {id:'rockisland',name:'Rock Island',biome:'rock',n:10,tier:1,unlock:'g_buy',stations:['gate','goal'],nodes:{rock:2,tree:1,pool:1},poll:9,props:['zenrock','reeds'],tox:0},
 {id:'ruins',name:'Tribal Ruins',biome:'forest',n:10,tier:2,unlock:'g_rock',stations:['gate','goal'],nodes:{tree:3,stump:2,pool:1},poll:9,props:['moneyman','stonehead','ruin','arch','mushring'],tox:1},
 {id:'amph',name:'Forest Amphitheater',biome:'forest',n:11,tier:2,unlock:'g_ruins',stations:['gate','goal','vendor'],nodes:{tree:2,stump:2,pool:1,rock:1},poll:10,props:['arch','stonehead','log','lilypond','torch','torch','mushring'],tox:2},
 {id:'avalanche',name:'The Avalanche',biome:'arctic',n:10,tier:3,unlock:'g_amph',stations:['gate','goal'],nodes:{rock:2,pool:1},poll:10,props:['mammoth','mammoth','ruin'],tox:2},
 {id:'village',name:'Frozen Village',biome:'arctic',n:10,tier:3,unlock:'g_aval',stations:['gate','goal','vendor','project'],nodes:{rock:1,tree:1},poll:4,props:['igloo','igloo','igloo','lamp','mammoth'],tox:1},
 {id:'isthmus',name:'Whalebone Isthmus',biome:'scorch',n:10,tier:4,unlock:'g_village',heat:1,stations:['gate','goal'],nodes:{rock:2,stump:1},poll:11,props:['whalebone','whalebone','whalebone','torch'],tox:2},
 {id:'bogs',name:'The Bogs',biome:'swamp',n:11,tier:4,unlock:'g_swamp',heat:1,stations:['gate','goal'],nodes:{stump:2,pool:2,tree:1},poll:12,props:['reeds','reeds','reeds','mushring','torch'],tox:3},
 {id:'dungeon',name:'The Dungeon',biome:'dungeon',n:10,tier:5,unlock:'g_bogs',stations:['gate','goal'],nodes:{rock:2,stump:1},poll:14,props:['torch','torch','torch','torch','chain','chain','ruin','arch'],tox:4}];
const BIOMES={ // top,left,right,water,sky1,sky2
 home:['#76a93f','#8a6a45','#6e5236','#3d8fb3','#ffffff','#fce8d5'],garden:['#607c33','#8a6e48','#6a5236','#3d8fb3','#b9d3e6','#f0af99'],
 rock:['#b8b29a','#8c8270','#6f6656','#5aa9cf','#9fc8e6','#f4b8a2'],forest:['#5f8a34','#7a5a38','#5c432a','#3d8fb3','#c7d9e6','#f6bca7'],
 arctic:['#dbe9f4','#74b1d6','#3e5a8a','#4ea5d9','#c9d4ea','#8b9dc3'],scorch:['#f4a460','#cd853f','#a8662e','#00bfff','#aed6f1','#fff1d6'],
 swamp:['#5a6b3c','#6b543c','#4a3a28','#4a6b5c','#6e6a62','#3b3633'],night:['#4f7a3a','#5a4a38','#3e3428','#2d5f8a','#060a22','#1c2550'],dungeon:['#7a7488','#4f4a5c','#3c3846','#4a6c8a','#2d2a3a','#5a5470']};
const GOALS=[ // (S) first goal = buy from vendor; "Swampward Go" + Heat Proof reward sourced
 {id:'g_buy',zone:'rockgarden',name:'Go Shopping!',giver:'Esteban',text:'Go Shopping! Buy a Helianth from the Lux Store.',check:s=>(s.stats.helianth||0)>=1||s.stats.buys>=1,lux:25},
 {id:'g_totem',zone:'rockgarden',name:'Get on the Totem Grid',giver:'Esteban',text:'Get on the Totem Grid: find a Totem Base, Totem Coffer and Totem Lowman by zapping in the Rock Garden.',check:s=>['totem_base','totem_coffer','totem_lowman'].every(k=>(s.player.inv[k]||0)>0||(s.flags&&s.flags.totemGrid)),lux:60,item:'component',take:['totem_base','totem_coffer','totem_lowman']},
 {id:'g_rock',zone:'rockisland',name:'Tarnation, Y\'all',giver:'Prospector',say:'Nee haw! Wouldja lookit all this gunk? Zap it clean and I\'ll point ya to them Tribal Ruins. Okey dokey Smokey!',text:'Tarnation, Y\'all: zap 8 pollution on Rock Island for ol\' E.P. (reward: Scanner Doohickey).',check:s=>(s.stats.zap.rockisland||0)>=8,lux:40,item:'scanner'},
 {id:'g_ruins',zone:'ruins',name:'The Moneyman',giver:'Prospector',say:'That inscrutable Moneyman, what a mystery! Nee haw!',text:'Use your fauna\'s gathering skill 3 times near the Moneyman.',check:s=>s.stats.skill>=3,lux:50},
 {id:'g_amph',zone:'amph',text:'Zap 2 toxic creatures and reach level 4.',check:s=>s.stats.tox>=2&&maxLv(s)>=4,lux:60},
 {id:'g_aval',zone:'avalanche',text:'Zap 10 pollution on the Avalanche.',check:s=>(s.stats.zap.avalanche||0)>=10,lux:80},
 {id:'g_village',zone:'village',text:'Reach level 7 with any fauna.',check:s=>maxLv(s)>=7,lux:100,item:'gene_heat'},
 {id:'g_swamp',zone:'isthmus',name:'Swampward Go',text:'Swampward Go: feed Heat Proof Gene Food and zap 8 pollution on the Isthmus.',check:s=>(s.stats.zap.isthmus||0)>=8,lux:120},
 {id:'g_bogs',zone:'bogs',text:'Zap 4 toxic creatures in the Bogs and reach level 10.',check:s=>(s.stats.toxZ.bogs||0)>=4&&maxLv(s)>=10,lux:150},
 {id:'g_dungeon',zone:'dungeon',text:'Clear every pollution cube in the Dungeon.',check:s=>s.stats.cleared.dungeon,lux:300,item:'d_crystal'}];
function maxLv(s){return Math.max(...s.fauna.map(f=>f.level))}

const POLL_NAMES=['Inert Liquid','Inert Solid','Inert Gas'],TOX_NAMES=['Vile 9-eyed Slimy','Jellyrice','1-eyed Trashy','1-eyed Gassy'];
const PROPS=['stonehead','log','lilypond','sunflower','waterfall','moneyman','skeleton','mammoth','whalebone','ruin','arch','torch','igloo','lamp','zenrock','chain','reeds','mushring'];

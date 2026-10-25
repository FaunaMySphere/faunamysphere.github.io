'use strict';
// ===== FaunaSphere Revival v5: genome, abilities, crafting stumps, quests, dens, tricks, food cards, new worlds =====
// Names/numbers from reference notes (VIDEO_NOTES_*). Values marked (G) are guesses.
const V5=window.V5={};
// ---------- Species (21 from notes) ----------
Object.assign(SPECIES,{
 dasher:{name:'Dasher',animal:'cat',skill:'shake',fav:'berry'},flapper:{name:'Flapper',animal:'bird',skill:'shake',fav:'berry'},
 bobbler:{name:'Bobbler',animal:'crocodile',skill:'dive',fav:'fish'},waddler:{name:'Waddler',animal:'bird',skill:'dive',fav:'fish'},
 tusker:{name:'Tusker',animal:'buffalo',skill:'lift',fav:'clover'},thumper:{name:'Thumper',animal:'rabbit',skill:'dig',fav:'clover'},
 wiggler:{name:'Wiggler',animal:'octopus',skill:'dig',fav:'truffle'},squeaker:{name:'Squeaker',animal:'mouse',skill:'dig',fav:'truffle'},
 hopper:{name:'Hopper',animal:'frog',skill:'dive',fav:'fish'}});
SPECIES.sniffer.skill='dig';SPECIES.sniffer.desc='Keen nose; digs up buried treasure.';SPECIES.oinker.skill='dig';
SPECIES.hoofer.desc='Sure-footed; kicks trees to shake items down.';SPECIES.scooter.desc='Small but hardy tortoise; dives into water for items. Born Water Proof.';
SKILLS.dig={verb:'Dig',node:'dig'};SKILLS.shake.verb='Kick tree';SKILLS.dive.verb='Dive';
// flavor tastes per species (G)
const FLAV=['Sweet','Bland','Meaty','Sticky','Tender','Chewy','Fishy','Earthy','Leafy','Juicy','Greasy','Crunchy','Sour','Tart'];
const TASTE={hoofer:['Sweet','Meaty'],sniffer:['Meaty','Leafy'],scooter:['Leafy','Sweet'],chomper:['Meaty','Sweet'],grabber:['Fishy','Earthy'],grazer:['Leafy','Greasy'],hugger:['Sweet','Sour'],oinker:['Earthy','Bland'],nibber:['Crunchy','Meaty'],pouncer:['Fishy','Leafy'],reacher:['Leafy','Greasy'],scratcher:['Fishy','Bland'],dasher:['Juicy','Earthy'],flapper:['Juicy','Greasy'],bobbler:['Fishy','Sour'],waddler:['Fishy','Sweet'],tusker:['Crunchy','Fishy'],thumper:['Crunchy','Meaty'],wiggler:['Earthy','Sweet'],squeaker:['Tender','Bitter'],hopper:['Juicy','Earthy']};
// ---------- Traits (from notes 5, 6, 8) ----------
const PRIMARY=['Tan','Cocoa','Cream','Slate','Sky','Pink','Scarlet','Maroon','Tea Green','Lime','Emerald','Lilac','Amethyst','Eggplant','Teal','Carnation','Vermilion','Kelly','Violet','Byzantium','Hot Pink','Turquoise','Ecru','Ochre','Sepia','Gold','Black','White','Rusty','Gray','Merle','Cobalt','Midnight'];
COLORS.Pink='#f7a8c4';
const PATS=['Solid','Spotted','Moon','Sawtooth','Speckled','Flower','Star','Splatter','Spade','Dotted','Diamond','Palm','B Sharp','Finny','Lumpy','Double','Stego','Roundel','Boomerang','Bolt','Tiled','Curl','Clover','Flutter','Budding','Tulip','Bone','Sun','Shine','Leafed','Rip'];
const EARS=['Unique','Short','Long','Pointy','Prongy','Ibex','Robot','Tube','Angler','Blackbuck','Pinched','Kohia','Wahini','Konini','Squared'];
const TAILS5=['Unique','Straight','Tufted','Wild','Bald','Frizzy','Feathered','Stellar','Toothy','Leafy','Flower','Roundel','Boomtuft','Spaded','Finny','Mild','Rounded'];
const EYES5=['Happy','Serious','Lashy','Beady','Buster','Glam','Toony','Smitten','Wired','Zonked','Dizzy','Evil','Cat','Surly','Pinkvamp','Orangevamp','Purplevamp','Bluevamp','Greenvamp'];
PATTERNS.splice(0,PATTERNS.length,...PATS);TAILS.splice(0,TAILS.length,...TAILS5);EYES.splice(0,EYES.length,...EYES5);
const TRAITS=[ // genome rows as on the Gene Test Kit screen
 ['Coat','coldProof',[ 'Normal','Cold Proof']],['Cooling','heatProof',['Normal','Heat Proof']],['Ear','ears',EARS],['Eye','eyes',EYES5],['Pattern','pattern',PATS],
 ['Primary Color','color',PRIMARY],['Secondary Color','color2',PRIMARY],['Species','species',null],['Tail','tail',TAILS5],['WaterProof','waterProof',['Normal','Water Proof']]];
const OLDPAT={Plain:'Solid',Spots:'Spotted',Stripes:'Sawtooth','B-sharp':'B Sharp'},OLDTAIL={Normal:'Unique'},OLDEYE={Round:'Happy',Sleepy:'Serious',Vamp:'Pinkvamp'};
const boolT=v=>v?(v===true?1:v):0;
function alleleOf(g,key){if(key==='coldProof')return g.coldProof?'Cold Proof':'Normal';if(key==='heatProof')return g.heatProof?'Heat Proof':'Normal';if(key==='waterProof')return g.waterProof?'Water Proof':'Normal';return g[key]}
function randAllele(key,vals){if(key==='species')return pick(Object.keys(SPECIES));return pick(vals)}
function recessiveFor(key,vals){if(key==='coldProof'||key==='heatProof'||key==='waterProof')return Math.random()<.2?vals[1]:'Normal';return randAllele(key,vals)}
function genomeFrom(g){const gm={};for(const[,k,vals]of TRAITS)gm[k]=[alleleOf(g,k),recessiveFor(k,vals)];return gm}
function applyGenome(f){const g=f.genes,gm=f.genome;for(const[,k]of TRAITS){const d=gm[k][0];if(k==='coldProof'||k==='heatProof'||k==='waterProof')g[k]=d!=='Normal'||(k==='heatProof'&&g.heatFed)||(k==='waterProof'&&g.species==='scooter');else g[k]=d}}
V5.inherit=function(a,b){const c={};for(const[,k,vals]of TRAITS){const pa=pick(a[k]),pb=pick(b[k]);let al=Math.random()<.5?[pa,pb]:[pb,pa];
  if(Math.random()<.03)al[Math.random()<.5?0:1]=randAllele(k,vals||[]); // rare mutation
  c[k]=al}return c};
function geneticName(f){return f.genes.color+' '+f.genes.pattern+' '+SPECIES[f.genes.species].name}
// ---------- Items: foods with cards, ingredients, crafted, den items, chips ----------
const FOODS={ // E in original units (1,100 max); flavors, temp, aftertaste
 treat:[165,['Sweet'],'Warm',''],berry:[132,['Sweet','Juicy'],'Cold','Tart'],fish:[198,['Fishy'],'Cold',''],truffle:[110,['Earthy'],'Warm',''],clover:[154,['Leafy','Crunchy'],'Warm',''],tart:[385,['Sweet','Sticky'],'Warm',''],
 gruffle:[350,['Bland'],'Warm',''],muffle:[350,['Bland'],'Warm',''],pullyleaf:[400,['Tender','Chewy'],'Warm',''],
 applemolass:[400,['Sticky','Sweet'],'Hot','Bitter'],bacoberry:[400,['Meaty'],'Hot','Bitter'],boilroot:[300,['Bland'],'Hot','Sour'],oilywurst:[400,['Meaty','Greasy'],'Warm',''],rasblueberry:[260,['Sweet','Tart'],'Cold','']};
Object.assign(ITEMS,{
 gruffle:{name:'Gruffle',type:'food',icon:'🥯'},muffle:{name:'Muffle',type:'food',icon:'🧁'},pullyleaf:{name:'Pullyleaf',type:'food',icon:'🥬'},
 applemolass:{name:'Hot Applemolass',type:'food',icon:'🍎'},bacoberry:{name:'Hot Bacoberry',type:'food',icon:'🥓'},boilroot:{name:'Hot Boilroot',type:'food',icon:'🥔'},oilywurst:{name:'Oilywurst',type:'food',icon:'🌭'},rasblueberry:{name:'Rasblueberry',type:'food',icon:'🫐'},
 genekit:{name:'Gene Test Kit',type:'tool',icon:'🧬'},gene_water:{name:'Water Proof Gene Food',type:'gene',icon:'💧',gene:{waterProof:true}},gene_cold:{name:'Cold Proof Gene Food',type:'gene',icon:'❄️',gene:{coldProof:true}},
 gene_spotted:{name:'Spotted Pattern Gene Food',type:'gene',icon:'🟤',gene:{pattern:'Spotted'}},gene_moon:{name:'Moon Pattern Gene Food',type:'gene',icon:'🌙',gene:{pattern:'Moon'}},gene_tufted:{name:'Tufted Tail Gene Food',type:'gene',icon:'🪶',gene:{tail:'Tufted'}},gene_lashy:{name:'Lashy Eyes Gene Food',type:'gene',icon:'👁️',gene:{eyes:'Lashy'}},gene_smitten:{name:'Smitten Eyes Gene Food',type:'gene',icon:'😍',gene:{eyes:'Smitten'}},gene_long:{name:'Long Ears Gene Food',type:'gene',icon:'🐰',gene:{ears:'Long'}},gene_scarlet:{name:'Scarlet Gene Food',type:'gene',icon:'🎨',gene:{color:'Scarlet'}},gene_midnight:{name:'Midnight Secondary Gene Food',type:'gene',icon:'🎨',gene:{color2:'Midnight'}},
 // ingredients
 grass:{name:'Grass',type:'ing',icon:'🌾'},sand:{name:'Sand',type:'ing',icon:'⏳'},ice:{name:'Ice',type:'ing',icon:'🧊'},marsh:{name:'Marsh',type:'ing',icon:'🪷'},sugar:{name:'Sugar Crystal',type:'ing',icon:'🍬'},
 leaf:{name:'Leaf',type:'ing',icon:'🍃'},patty:{name:'Patty',type:'ing',icon:'🟤'},duskroot:{name:'Duskroot',type:'ing',icon:'🫚'},mud:{name:'Mud Clump',type:'ing',icon:'🟫'},minerals:{name:'Minerals',type:'ing',icon:'🪨'},
 honeymush:{name:'Honeymush',type:'ing',icon:'🍯'},citrileaf:{name:'Citrileaf',type:'ing',icon:'🍋'},amber:{name:'Amber',type:'ing',icon:'🟠'},bakerstone:{name:'Bakerstone',type:'ing',icon:'🧱'},
 skull:{name:'Skull',type:'ing',icon:'💀'},sk_body:{name:'Body',type:'ing',icon:'🦴'},sk_leg:{name:'Leg',type:'ing',icon:'🦴'},sk_arm:{name:'Arm',type:'ing',icon:'🦴'},
 art_sport:{name:'Sport Artifact',type:'ing',icon:'🏺'},art_drama:{name:'Drama Artifact',type:'ing',icon:'🎭'},art_concert:{name:'Concert Artifact',type:'ing',icon:'🎺'},
 tooth:{name:'Strange Tooth',type:'ing',icon:'🦷'},iglooblock:{name:'Igloo Block',type:'ing',icon:'🧊'},garbage:{name:'Bag of Garbage',type:'ing',icon:'🗑️'},
 skybloom:{name:'Skybloom Fluph',type:'ing',icon:'🌸'},
 // crafted
 mulch:{name:'Arctic Mulch',type:'ing',icon:'🌱'},amberc:{name:'Amber Compound',type:'ing',icon:'🧪'},skeleton_c:{name:'Completed Skeleton',type:'ing',icon:'🦖'},clay:{name:'Sculpting Clay',type:'ing',icon:'🏺'},
 cream:{name:'Beauty Cream',type:'tool',icon:'🫙'},pullyseed:{name:'Pullyleaf Tree Seedling',type:'tool',icon:'🌳'},sculpture:{name:'Fired Sculpture',type:'ing',icon:'🗿'},
 argilla:{name:'Argilla Jar',type:'decor',icon:'🏺'},nutcracker:{name:'Nutcracker 2',type:'decor',icon:'💂'},frozenwater:{name:'Frozen Water Block ×3',type:'decor',icon:'🧊'},
 // trick chips
 chip_boing:{name:'Boing Chip',type:'chip',icon:'💾',trick:'boing'},chip_sniff:{name:'Sniff Chip',type:'chip',icon:'💾',trick:'sniff'},chip_roll:{name:'Roll Chip',type:'chip',icon:'💾',trick:'roll'},chip_itch:{name:'Itch Chip',type:'chip',icon:'💾',trick:'itch'},
 // den items: cat + smilies (G values)
 den_grass:{name:'Grass-Top Hut',type:'den',cat:'Shelter',sm:4,icon:'🛖'},den_bark:{name:'Bark-Top Hut',type:'den',cat:'Shelter',sm:3,icon:'🛖'},den_kiwi:{name:'Kiwi-Top Hut',type:'den',cat:'Shelter',sm:5,icon:'🥝'},den_castle:{name:'Castle Den',type:'den',cat:'Shelter',sm:7,icon:'🏰'},
 den_pillows:{name:'Pillows',type:'den',cat:'Comfort',sm:3,icon:'🛏️'},den_quilt:{name:'Patchwork Quilt',type:'den',cat:'Comfort',sm:5,icon:'🧶'},
 den_topiary:{name:'Fountain Topiary',type:'den',cat:'Beauty',sm:5,icon:'⛲'},den_giftbloom:{name:'Red Giftbloom',type:'den',cat:'Beauty',sm:3,icon:'🌺'},
 den_punch:{name:'Punch Bowl',type:'den',cat:'Amusement',sm:3,icon:'🥣'},den_balloons:{name:'Balloons',type:'den',cat:'Amusement',sm:4,icon:'🎈'},den_spheres:{name:'Bouncing Spheres',type:'den',cat:'Amusement',sm:5,icon:'🔮'}});
for(const[k,[E,fl,tp,af]]of Object.entries(FOODS)){const it=ITEMS[k];it.type='food';it.E=E;it.flavors=fl;it.temp=tp;it.after=af;it.e=Math.round(E/11);it.h=it.h||Math.round(E/22)}
// ---------- Stations / recipes ----------
const STUMPS={
 basin:{name:'Combining Basin',icon:'🥣',rec:[{in:{duskroot:10},out:'mulch'},{in:{leaf:9,patty:9},out:'pullyseed'},{in:{treat:1,berry:1},out:'tart'}]},
 claystump:{name:"Clay Maker's Stump",icon:'🏺',rec:[{in:{mud:3,minerals:1},out:'clay'}]},
 beautystump:{name:'Beauty Stump',icon:'💄',rec:[{in:{mud:3,honeymush:3,citrileaf:3},out:'cream'}]},
 paleostump:{name:'Paleo Stump',icon:'🦴',rec:[{in:{skull:1,sk_body:1,sk_leg:2,sk_arm:2},out:'skeleton_c'}]},
 diffstump:{name:'Differential Stump',icon:'⚗️',rec:[{in:{amber:10},out:'amberc'}]},
 kiln:{name:'Kiln',icon:'🔥',rec:[{in:{clay:1,bakerstone:1},out:'sculpture'}]}};
// ---------- New worlds (notes 4) ----------
Object.assign(BIOMES,{beach:['#d2b48c','#b8955f','#8f7346','#20b2aa','#3f9fe6','#bfe6f5'],mesa:['#f4a460','#cd853f','#a0602c','#00bfff','#4f9fdc','#cfe6f4'],
 candy:['#ffc0cb','#4a2e15','#3a220f','#add8e6','#5fb4e8','#c5e6f8'],sea:['#c08081','#7a4e5e','#5a3848','#2a60a0','#00105e','#1c3a8a']});
// fix pale skies (deeper zenith; horizons keep the reference void colours)
BIOMES.home[4]='#5fa9e3';BIOMES.home[5]='#d4ecf8';BIOMES.garden[4]='#6ea7da';BIOMES.forest[4]='#76acd9';BIOMES.rock[4]='#68a9dc';BIOMES.scorch[4]='#5ea8e2';
PROPS.push('palm','tiki','cactus','lollipop','candycane','gumdrop','coral','seaweed');
ZONES.push(
 {id:'fishatish',name:'Fishatish: Sand Bar',biome:'beach',n:10,tier:1,unlock:'g_rock',stations:['gate','goal','vendor'],nodes:{tree:2,pool:2,dig:2},poll:8,props:['palm','palm','palm','tiki','tiki','reeds'],tox:1},
 {id:'mesa',name:'Searing Mesa: Duned Tract',biome:'mesa',n:10,tier:2,unlock:'g_ruins',stations:['gate','goal','vendor'],nodes:{dig:3,rock:1,tree:1},poll:9,props:['cactus','cactus','cactus','skeleton','torch'],tox:2},
 {id:'puddinpie',name:'Puddinpie Falls',biome:'candy',n:10,tier:2,unlock:'g_amph',stations:['gate','goal','vendor'],nodes:{tree:2,dig:1,pool:1},poll:8,props:['lollipop','lollipop','candycane','candycane','gumdrop','gumdrop','mushring'],tox:1},
 {id:'deepplains',name:'Deep Plains: Briny Sink',biome:'sea',n:10,tier:3,unlock:'g_village',water:1,stations:['gate','goal','vendor'],nodes:{pool:2,dig:1,rock:1},poll:10,props:['coral','coral','coral','seaweed','seaweed','seaweed'],tox:2});
Object.assign(VENDORS,{
 fishatish:[['citrileaf',20],['gene_water',220],['chip_roll',300],['rasblueberry',18],['den_balloons',90],['den_quilt',120]],
 mesa:[['bakerstone',40],['gene_cold',220],['chip_sniff',300],['bacoberry',35],['den_kiwi',150]],
 puddinpie:[['muffle',30],['gruffle',30],['applemolass',35],['chip_itch',300],['den_spheres',160],['den_castle',400,'bux']],
 deepplains:[['boilroot',30],['oilywurst',40],['gene_midnight',250],['den_topiary',150]]});
VENDORS.rockgarden.push(['den_grass',80],['den_bark',60],['den_pillows',50],['den_punch',60],['den_giftbloom',70],['honeymush',20]);
VENDORS.village.push(['genekit',150],['gene_spotted',200],['gene_moon',220],['gene_tufted',220],['gene_lashy',200],['gene_smitten',260],['gene_long',220],['gene_scarlet',200]);
VENDORS.amph.push(['honeymush',20],['gruffle',30]);
const STATION_ADD={home:['basin','dig'],rockgarden:['paleostump','dig'],village:['basin','diffstump'],bogs:['claystump','beautystump','kiln','dig'],ruins:['dig'],mesa:['diffstump']};
for(const[zid,ts]of Object.entries(STATION_ADD)){const z=Z(zid);ts.forEach(t=>{if(t==='dig')z.nodes.dig=(z.nodes.dig||0)+1;else z.stations.push(t)})}
// zone drops: zapping Inert nodes gives the zone's material (notes 4/5)
const ZDROP={rockgarden:'grass',rockisland:'grass',ruins:'grass',amph:'grass',fishatish:'sand',mesa:'sand',village:'ice',avalanche:'ice',bogs:'marsh',isthmus:'sand',deepplains:'silt',puddinpie:'sugar',dungeon:'minerals'};
const DIGLOOT={home:['truffle','leaf'],rockgarden:['skull','sk_body','sk_leg','sk_arm','leaf'],ruins:['skull','sk_body','sk_leg','sk_arm'],fishatish:['boilroot','patty','skybloom'],mesa:['amber','amber','tooth','sk_leg'],bogs:['mud','mud','duskroot'],puddinpie:['sugar','muffle'],deepplains:['garbage','silt'],village:['duskroot','duskroot']};
// ---------- Quests (notes 3, 10, 11) ----------
const has=(k,n=1)=>(S.player.inv[k]||0)>=n;
GOALS.push(
 {id:'q_museum',zone:'amph',name:'They Belong in a Museum',giver:'Esteban',text:'They Belong in a Museum: find the Sport, Drama and Concert artifacts (zap pollution around the Amphitheater).',check:()=>has('art_sport')&&has('art_drama')&&has('art_concert'),take:{art_sport:1,art_drama:1,art_concert:1},lux:1250},
 {id:'q_nochew',zone:'rockgarden',name:'No Chewing!',giver:'Esteban',text:'No Chewing!: dig up a Skull, a Body, 2 Legs and 2 Arms, then assemble a Completed Skeleton at the Paleo Stump.',check:()=>has('skeleton_c'),take:{skeleton_c:1},lux:1000},
 {id:'q_boing',zone:'rockgarden',name:'Boing!',giver:'Amelia',text:'Boing!: bring Amelia 5 Grass from zapping Inert nodes and she\'ll hand you a Boing Chip to teach a trick.',check:()=>has('grass',5),take:{grass:5},lux:200,item:'chip_boing'},
 {id:'q_tooth',zone:'mesa',name:'Toothiness',giver:'Amelia',text:'Toothiness: show Amelia a Strange Tooth (dig in Searing Mesa).',check:()=>has('tooth'),take:{tooth:1},lux:1000},
 {id:'q_igloo',zone:'village',name:'Habitat for Faunanity',giver:'The Scrutinizer',text:'Habitat for Faunanity: bring 3 Igloo Blocks (from zapping) to fix the Scrutinizer\'s igloo.',check:()=>has('iglooblock',3),take:{iglooblock:3},lux:2500},
 {id:'q_mulch',zone:'village',name:'It\'s Beneficial',giver:'Esteban',text:'It\'s Beneficial: combine 10 Duskroot in a Combining Basin to make Arctic Mulch.',check:()=>has('mulch'),take:{mulch:1},lux:1000},
 {id:'q_volakis',zone:'mesa',name:'The Volakis Foundation',giver:'Esteban',text:'The Volakis Foundation: refine 10 Amber in a Differential Stump into Amber Compound.',check:()=>has('amberc'),take:{amberc:1},lux:3000},
 {id:'q_garbage',zone:'deepplains',name:'Pollution Predicament',giver:'Amelia',say:'Oh my! There is so much pollution here... Zap the pollution in the Briny Sink, fill five bags of garbage then return it to the goal station for pick-up.',done:'Thank you so much for the help. Every bit helps. Come back when your faunas are rested. We have lots to do!',text:'Pollution Predicament: collect 5 Bags of Garbage in the Briny Sink.',check:()=>has('garbage',5),take:{garbage:5},lux:10000},
 {id:'q_art',zone:'bogs',name:'Art is Messy',giver:'Nina',say:'Wow Weee! Look at that!',text:'Art is Messy: make Sculpting Clay at the Clay Maker\'s Stump (3 Mud Clumps + 1 Minerals), then fire it in the Kiln with a Bakerstone.',check:()=>has('sculpture'),take:{sculpture:1},lux:244,item:'argilla'},
 {id:'q_spa',zone:'bogs',name:'Spa Treatment',giver:'Amelia',text:'Spa Treatment: make Beauty Cream at the Beauty Stump (3 Mud Clumps + 3 Honeymush + 3 Citrileaf) and rub it on your fauna.',check:s=>s.stats.cream>=1,lux:5000},
 {id:'q_dragon',zone:'puddinpie',name:'Dragon Drop',giver:'Nina',text:'Dragon Drop: hatch a Bobbler with the Spotted pattern and a Tufted tail. (Gene food on a grown fauna doesn\'t count, but gene food before laying the egg does!)',check:s=>!!s.stats.dragon,lux:2000},
 {id:'q_wish',zone:'mesa',name:'E.P.\'s Wish List',giver:'Prospector',say:'Howdy, starfriend!',text:'E.P.\'s Wish List: drop a Skybloom Fluph (dig on the Fishatish beach) on the Goal Station.',check:()=>has('skybloom'),take:{skybloom:1},lux:500,item:'nutcracker'});
// ---------- migration ----------
function migrateFauna(f){const g=f.genes;if(OLDPAT[g.pattern])g.pattern=OLDPAT[g.pattern];if(OLDTAIL[g.tail])g.tail=OLDTAIL[g.tail];if(OLDEYE[g.eyes])g.eyes=OLDEYE[g.eyes];
 if(!g.ears)g.ears='Unique';if(!g.color2)g.color2=pick(['Sepia','Gray','Cream','Cocoa']);if(g.heatProof)g.heatFed=1;if(g.species==='scooter')g.waterProof=true;
 if(!f.genome)f.genome=genomeFrom(g);if(f.gen==null)f.gen=1}
function ensureObj(zid,type,x={}){const s=S.zones[zid];if(!s||s.objs.some(o=>o.type===type))return;const p=freeTile(zid);if(p)s.objs.push({id:zid+'_v5'+type+s.nextId++,type,i:p[0],j:p[1],...x})}
V5.migrate=function(){if(!S)return;S.v5=S.v5||{};S.stats.made=S.stats.made||{};S.den=S.den||{Shelter:null,Comfort:null,Beauty:null,Amusement:null};S.tricks=S.tricks||['greet','play','bored'];S.trees=S.trees||[];
 S.fauna.forEach(migrateFauna);S.player.eggs.forEach(e=>{if(!e.genome)e.genome=genomeFrom(e.genes)});if(S.home.nest.egg&&!S.home.nest.egg.genome)S.home.nest.egg.genome=genomeFrom(S.home.nest.egg.genes);
 for(const[zid,ts]of Object.entries(STATION_ADD))ts.forEach(t=>ensureObj(zid,t,t==='dig'?{ready:true,at2:0}:{}));
 ZONES.forEach(z=>{if(z.unlock&&S.done[z.unlock])S.unlocked[z.id]=1});
 if(!S.v5.gift&&S.fauna.length){S.v5.gift=1;addItem('genekit');addItem('gruffle',2);setTimeout(()=>toast('🎁 v5 gift: a Gene Test Kit and 2 Gruffles are in your Goods.'),2500)}save()};
// ---------- reducers ----------
const R0={...R};
R.adopt=p=>{R0.adopt(p);const f=S.fauna[S.fauna.length-1];f.genes.eyes='Happy';f.genes.pattern='Solid';f.genes.tail='Unique';migrateFauna(f)};
V5.layEgg=function(){const f=fa();if(S.player.eggs.length<6){const gm=JSON.parse(JSON.stringify(f.genome));if(f.genes.heatFed)gm.heatProof[0]='Heat Proof';S.player.eggs.push({id:'egg'+now()+Math.random(),genes:{...f.genes,heatProof:false},genome:gm,parent:f.name,gen:f.gen||1});toast('🥚 '+f.name+' laid an egg! Hatch it in your Nest.');emit('egg')}else toast('Egg basket full (6).')};
layEgg=V5.layEgg;
R.incubate=p=>{const n=S.home.nest;if(n.egg)return;R0.incubate(p);const f=S.fauna[p.fid];n.incG=JSON.parse(JSON.stringify(f.genome));n.incGen=f.gen||1;n.incName=f.name};
R.hatch=({name})=>{const n=S.home.nest;if(!n.egg||now()<n.at)return;if(S.fauna.length>=3)return toast('All 3 fauna slots are full. Release one in the Fauna panel first.');
 const A=n.egg.genome||genomeFrom(n.egg.genes),Bg=n.incG||genomeFrom(n.inc),gm=V5.inherit(A,Bg);const f=mkFauna({},name||'Hatchling');f.genome=gm;f.gen=Math.max(n.egg.gen||1,n.incGen||1)+1;f.level=0;f.parents=[n.egg.parent,n.incName||'?'];applyGenome(f);
 S.fauna.push(f);n.egg=null;n.incG=null;emit('egg');Sound.sfx('hatch');banner('EGG HATCHED');
 if(f.genes.species==='bobbler'&&f.genes.pattern==='Spotted'&&f.genes.tail==='Tufted')S.stats.dragon=1;
 toast('🐣 A '+SPECIES[f.genes.species].name+' hatched! Generation '+f.gen+'.');setTimeout(()=>ui('cert',{fid:S.fauna.length-1}),900)};
R.feed=({item})=>{const f=fa(),it=ITEMS[item];if(!S.player.inv[item])return;
 if(it.type==='gene'){S.player.inv[item]--;const [[k,v]]=Object.entries(it.gene);const al=typeof v==='boolean'?(k==='heatProof'?'Heat Proof':k==='coldProof'?'Cold Proof':'Water Proof'):v;f.genome[k][0]=al;if(k==='heatProof')f.genes.heatFed=1;applyGenome(f);Sound.sfx('trill');toast(f.name+' ate '+it.name+'. Something changed!');if(item==='gene_heat')S.flags={...S.flags,heat:1};return}
 if(it.type!=='food')return;S.player.inv[item]--;const t=TASTE[f.genes.species]||['Sweet','Bland'],fl=it.flavors||['Bland'],like=fl.includes(t[0]),hate=fl.includes(t[1])||it.after===t[1];
 S.tf.fed=1;f.energy=clamp(f.energy+it.e);let dh=Math.round(it.h*(like?1.6:1));if(hate)dh=-8;f.happiness=clamp(f.happiness+dh);emit('eat',{fav:like});
 rt.say={text:f.name+' thinks: Flavors: '+fl.join(', ')+(like?' — Yum!':hate?' — Yuck!':''),at:now()};if(hate){rt.frownT=now();Sound.sfx('moan')}
 toast(f.name+(like?' LOVES ':hate?' dislikes ':' eats ')+it.name+' (+'+(it.E||it.e*11)+' Energy)')};
R.craft=({st,r})=>{const rc=STUMPS[st].rec[r];if(!Object.entries(rc.in).every(([k,v])=>(S.player.inv[k]||0)>=v))return toast('Missing ingredients.');for(const[k,v]of Object.entries(rc.in))S.player.inv[k]-=v;addItem(rc.out);S.stats.made[rc.out]=(S.stats.made[rc.out]||0)+1;Sound.sfx('dig');setTimeout(()=>Sound.sfx('coin'),400);emit('skill',{o:zs(S.zone).objs.find(o=>o.type===st),l:0});toast(STUMPS[st].name+': made '+ITEMS[rc.out].name+'!')};
R.claim=({gid})=>{const g=GOALS.find(g=>g.id===gid);if(!g||S.done[gid]||!g.check(S))return;if(g.take&&!Array.isArray(g.take)){for(const[k,n]of Object.entries(g.take))S.player.inv[k]=Math.max(0,(S.player.inv[k]||0)-n);const t=g.take,ck=g.check;g.take=null;g.check=()=>true;try{R0.claim({gid})}finally{g.take=t;g.check=ck}}else R0.claim({gid});if(g.done)setTimeout(()=>V5.dialog(g.giver,g.done),600)};
R.useCream=()=>{if(!S.player.inv.cream)return;S.player.inv.cream--;S.stats.cream=(S.stats.cream||0)+1;const f=fa();f.happiness=clamp(f.happiness+30);rt.happyT=now();emit('level');toast('✨ '+f.name+' sparkles after a Beauty Cream spa treatment!')};
R.genekit=({fid})=>{const f=S.fauna[fid];if(!f||!S.player.inv.genekit)return;S.player.inv.genekit--;f.tested=1;Sound.sfx('moan');toast('🧬 Genome revealed for '+f.name+'.')};
R.learn=({item})=>{const it=ITEMS[item];if(!S.player.inv[item]||!it.trick)return;if(S.tricks.includes(it.trick))return toast('Your fauna already know that trick.');S.player.inv[item]--;S.tricks.push(it.trick);emit('goal');toast('💾 Learned a new trick: '+it.trick[0].toUpperCase()+it.trick.slice(1)+'! Tap your fauna\'s portrait for Tricks.')};
R.trick=({k})=>{if(!S.tricks.includes(k))return;rt.trick={k,t0:now()};const f=fa();Sound.sfx({greet:'hmm',play:'trill',bored:'moan',boing:'boing',sniff:'hmm',roll:'whoosh',itch:'dig'}[k]);rt.say={text:{greet:'Hi there! 👋',play:'Wheee!',bored:'*yawn*…',boing:'BOING!',sniff:'*sniff sniff*',roll:'🌀',itch:'*scritch scratch*'}[k],at:now()};f.happiness=clamp(f.happiness+(k==='bored'?0:1))};
R.denSet=({cat,item})=>{const d=S.den;if(item&&!S.player.inv[item])return;if(d[cat])addItem(d[cat]);d[cat]=item||null;if(item)S.player.inv[item]--;Sound.sfx('pop')};
R.rest=()=>{rt.sleep=true;const q=V5.denQ();toast(fa().name+' curls up in the Den. 💤 Den bonus: +'+q.pct+'% rest')};
R.heal=()=>{const a=V5.abil(fa());if(!a.includes('Heal'))return;if(now()-(S.v5.heal||0)<6e5)return toast('Heal is recharging ('+Math.ceil((6e5-(now()-S.v5.heal))/6e4)+' min).');S.v5.heal=now();S.fauna.forEach(x=>x.happiness=clamp(x.happiness+25));emit('level');toast('💚 '+fa().name+' used Heal! All your fauna feel better.')};
R.plantTree=()=>{if(!S.player.inv.pullyseed||S.zone!=='home')return toast('Plant seedlings on your home island.');const p=freeTile('home');if(!p)return toast('No room!');S.player.inv.pullyseed--;zs('home').objs.push({id:'pt'+now(),type:'pullytree',i:p[0],j:p[1],ready:false,at2:now()+9e5});toast('🌳 Planted a Pullyleaf tree! It grows in 15 minutes and can be harvested again and again.')};
R.harvest=({oid})=>{const o=zs(S.zone).objs.find(o=>o.id===oid);if(!o)return;if(!o.ready)return toast('Still growing… '+Math.max(1,Math.ceil((o.at2-now())/6e4))+' min.');o.ready=false;o.at2=now()+9e5;addItem('pullyleaf',2);emit('skill',{o,l:0});toast('Harvested 2 Pullyleaf!')};
// skill: gather abilities + zone loot
R.skill=({oid})=>{const f=fa(),o=zs(S.zone).objs.find(o=>o.id===oid);if(!o)return;const need=Object.entries(SKILLS).find(([k,v])=>v.node===o.type)[0],my=SPECIES[f.genes.species].skill;
 if(my!==need&&!(need==='dig'&&V5.abil(f).includes('Dig')))return toast('Only fauna who can '+SKILLS[need].verb.toLowerCase()+' can search this. '+SPECIES[f.genes.species].name+'s '+SKILLS[my].verb.toLowerCase()+'.');
 if(!o.ready)return toast('Nothing here right now. Try again later.');if(f.energy<4)return toast(f.name+' is too tired.');
 o.ready=false;o.at2=now()+9e4;f.energy=clamp(f.energy-4);S.stats.skill++;let it;
 if(need==='dig')it=pick(DIGLOOT[S.zone]||['truffle','leaf']);else if(need==='shake')it=S.zone==='fishatish'?pick(['patty','citrileaf','berry']):S.zone==='puddinpie'?pick(['muffle','sugar']):S.zone==='village'?'berry':pick(['berry','leaf','clover','leaf']);
 else it={pool:S.zone==='deepplains'?pick(['fish','garbage']):'fish',rock:S.zone==='mesa'?'amber':'stone',stump:S.zone==='bogs'?'mud':'truffle'}[o.type];
 addItem(it);const l=6+Z(S.zone).tier*2;gainLux(l);emit('skill',{o,l});Sound.sfx(need==='dig'?'dig':'skill');toast(f.name+' used '+SKILLS[need].verb+'! Found '+ITEMS[it].name+' +'+l+' Lux')};
// zap: zone material drops + quest drops
const zap0=R.zap;R.zap=p=>{const s=zs(S.zone),o=s.objs.find(x=>x.id===p.oid);const wasHp=o?o.hp:0,typ=o&&o.type,ab=V5.abil(fa());zap0(p);
 if(!o||s.objs.includes(o))return;const z=S.zone,add=(k,msg)=>{addItem(k);toast('Found '+ITEMS[k].name+'!'+(msg||''))};
 if(ZDROP[z]&&Math.random()<.6)add(ZDROP[z]);
 if(z==='amph'&&!S.done.q_museum){const need=['art_sport','art_drama','art_concert'].filter(k=>!has(k));if(need.length&&Math.random()<.4)add(need[0])}
 if((z==='village'||z==='avalanche')&&Math.random()<.35)add('iglooblock');if(z==='village'&&Math.random()<.3)add('duskroot');
 if(z==='deepplains'&&Math.random()<.5)add('garbage');if((z==='bogs'||z==='dungeon')&&typ==='tox')add('minerals');if(z==='mesa'&&Math.random()<.25)add('amber')};
// travel gate for underwater
const tr0=R.travel;R.travel=p=>{const z=Z(p.zone);if(z&&z.water&&!fa().genes.waterProof)return toast('Too deep for '+fa().name+'! It needs the Water Proof gene (Scooters are born with it; Gene Food sold in Fishatish).');tr0(p)};
const st0=startTravel;startTravel=zone=>{const z=Z(zone);if(z.water&&!fa().genes.waterProof)return dispatch('travel',{zone});st0(zone)};
// ---------- abilities ----------
V5.abil=f=>{const a=['Zap'];const sk=SPECIES[f.genes.species].skill;if(sk==='dig'||f.level>=12)a.push('Dig');if(f.genes.heatProof)a.push('Heat');if(f.genes.coldProof)a.push('Cold');if(f.level>=10)a.push('Heal');if(f.level>=20)a.push('Build');return a};
V5.denQ=()=>{const d=S.den,full=['Shelter','Comfort','Beauty','Amusement'].every(c=>d[c]);const sm=Object.values(d).reduce((a,k)=>a+(k?ITEMS[k].sm:0),0);const pct=full?Math.min(100,Math.round(10+90*Math.min(20,sm)/20)):10;return{sm,full,pct}};
// den bonus + tree growth tick
setInterval(()=>{if(!S||!fa())return;if(rt.sleep&&S.zone==='home'){const q=V5.denQ();const f=fa();f.energy=clamp(f.energy+3*q.pct/100)}},1000);
// ---------- interaction hooks ----------
const int0=interact;interact=o=>{if(STUMPS[o.type]){rt.tgtObj=o;Sound.sfx('click');return walkTo(o,()=>ui('stump',{st:o.type}))}
 if(o.type==='dig'){rt.tgtObj=o;Sound.sfx('click');return walkTo(o,()=>dispatch('skill',{oid:o.id}))}
 if(o.type==='pullytree'){rt.tgtObj=o;return walkTo(o,()=>dispatch('harvest',{oid:o.id}))}
 if(o.type==='den'){rt.tgtObj=o;Sound.sfx('click');return walkTo(o,()=>ui('den'))}return int0(o)};
V5.dialog=(who,text)=>{const ic={Amelia:'👩‍🔬',Esteban:'🧑‍🔬',Nina:'👧',Prospector:'⛏️','The Scrutinizer':'🦭'}[who]||'💬';open(`<div class="npc"><div class="npcp">${ic}</div><div><b>${who}</b><p>${text}</p></div></div>`+'<button class="btn" data-a="ui" data-p=\'{"v":"close"}\'>OK</button>')};
// ---------- UI ----------
const ui0=ui;
const cardFood=it=>it.type==='food'?`<span class="small fc">⚡ ${it.E||it.e*11} Energy · Flavors: ${(it.flavors||['Bland']).join(', ')} · Temp: ${it.temp||'Warm'}${it.after?' · Aftertaste: '+it.after:''}</span>`:'';
ui=function(v,p={}){const f=fa(),inv=S.player.inv;
 if(v==='close')return close();
 if(v==='bag'){cur={...p,v};const tab=p.tab||'Food',tabs={Food:['food'],Eggs:['egg'],Ingredients:['ing','mat'],Misc:['gene','tool','chip','decor','den']};
  let rows=Object.entries(inv).filter(([k,n])=>n>0&&ITEMS[k]&&tabs[tab].includes(ITEMS[k].type)).sort((a,b)=>ITEMS[a[0]].name.localeCompare(ITEMS[b[0]].name)).map(([k,n])=>{const it=ITEMS[k];
   const act=it.type==='food'||it.type==='gene'?btn('Feed','feed',{item:k}):it.type==='decor'?btn('Place','decorate',{item:k}):it.type==='chip'?btn('Learn','learn',{item:k}):k==='cream'?btn('Use','useCream',{}):k==='pullyseed'?btn('Plant','plantTree',{}):k==='genekit'?btn('Test','ui',{v:'genome',fid:S.active}):k==='namechanger'?btn('Use','rename2',{}):it.type==='den'?btn('Den','ui',{v:'den'}):'';
   return`<div class="row"><span style="font-size:22px">${it.icon}</span><div class="grow">${it.name} ×${n}<br>${it.type==='food'?cardFood(it):`<span class="small">${it.type==='den'?it.cat+' · '+'☺'.repeat(it.sm):it.type==='ing'?'Ingredient':it.type}</span>`}</div>${act}</div>`});
  if(tab==='Eggs')rows=S.player.eggs.map(e=>`<div class="row"><span style="font-size:22px">🥚</span><div class="grow">Egg laid by: ${e.parent}<br><span class="small">Generation ${(e.gen||1)+1} · place it in your Nest</span></div></div>`);
  open('<h2>🎒 Goods</h2><div class="tabs">'+Object.keys(tabs).map(t=>`<button class="tab${t===tab?' on':''}" data-a="ui" data-p='{"v":"bag","tab":"${t}"}'>${t}</button>`).join('')+'</div>'+(rows.join('')||'<p>Nothing here yet.</p>'));return}
 if(v==='fauna'&&p.tab){cur={...p,v};const x=S.fauna[p.fid];if(!x)return;const sp=SPECIES[x.genes.species];const tabsH=['Info','Abilities','Genome'].map(t=>`<button class="tab${t===p.tab?' on':''}" data-a="ui" data-p='{"v":"fauna","fid":${p.fid},"tab":"${t}"}'>${t}</button>`).join('');
  let h=`<h2>🐾 ${x.name}</h2><div class="tabs">${tabsH}</div>`;
  if(p.tab==='Info')h+=`<div id="fpf"></div><table class="gt"><tr><td>Age</td><td>${Math.max(0,Math.floor((now()-x.born)/864e5))?Math.floor((now()-x.born)/864e5)+' days':'New Born'}</td></tr><tr><td>Generation</td><td>${x.gen||1}</td></tr><tr><td>Level</td><td>${x.level}</td></tr><tr><td>Species</td><td>${sp.name}</td></tr><tr><td>Color</td><td>${x.genes.color} / ${x.genes.color2}</td></tr><tr><td>Pattern</td><td>${x.genes.pattern}</td></tr><tr><td>Eye</td><td>${x.genes.eyes}</td></tr><tr><td>Ear</td><td>${x.genes.ears}</td></tr><tr><td>Tail</td><td>${x.genes.tail}</td></tr><tr><td>Likes</td><td>${(TASTE[x.genes.species]||[])[0]} · dislikes ${(TASTE[x.genes.species]||[])[1]}</td></tr>${x.parents?`<tr><td>Parents</td><td>${x.parents.join(' × ')}</td></tr>`:''}</table>`;
  if(p.tab==='Abilities'){const a=V5.abil(x);h+='<div class="grid">'+['Dig','Zap','Heat','Cold','Heal','Build'].map(k=>`<div class="card ${a.includes(k)?'':'off'}"><div style="font-size:28px">${{Dig:'⛏️',Zap:'⚡',Heat:'🔥',Cold:'❄️',Heal:'💚',Build:'🧱'}[k]}</div><b>${k}</b><br><span class="small">${{Dig:'Dig up buried items from dirt mounds.',Zap:'Collar zapper: '+(x.level>=10?'2':'1')+' damage per zap.',Heat:'Visit scorching lands (Heat Proof gene).',Cold:'Cold Proof coat.',Heal:'Lv 10: restore all fauna happiness.',Build:'Lv 20: place decorations for free.'}[k]}</span></div>`).join('')+'</div>'+(a.includes('Heal')&&p.fid===S.active?btn('Use Heal','heal',{}):'')+`<p class="small">Gathering: <b>${SKILLS[sp.skill].verb}</b> (${sp.desc||''})</p>`}
  if(p.tab==='Genome'){if(!x.tested)h+=`<p>Use a <b>Gene Test Kit</b> to reveal ${x.name}'s Genome: the Dominant (shown) and Recessive (hidden) genes it can pass to its eggs.</p><p class="small">You have ${inv.genekit||0} kits. Kits are sold in the Frozen Village Gene Food store.</p>`+btn('🧬 Use Gene Test Kit','genekit',{fid:p.fid},!inv.genekit);
   else h+='<table class="gt gen"><tr><th>Trait</th><th>Dominant</th><th>Recessive</th></tr>'+TRAITS.map(([lab,k])=>{const al=x.genome[k];const sh=a=>k==='species'?SPECIES[a].name:a;return`<tr><td>${lab}</td><td><b>${sh(al[0])}</b></td><td>${sh(al[1])}</td></tr>`}).join('')+'</table><p class="small">Each parent passes one of its two genes for every trait. Either can end up dominant, and rare mutations happen, so an egg from a Sniffer can hatch a Hoofer!</p>'}
  open(h);if(p.tab==='Info'){const e=document.getElementById('fpf');if(e)e.appendChild(faunaPortrait(x.genes))}if(p.tab==='Genome')Sound.sfx('moan');return}
 if(v==='genome'){return ui('fauna',{fid:p.fid??S.active,tab:'Genome'})}
 if(v==='stump'){cur={...p,v};const st=STUMPS[p.st];open(`<h2>${st.icon} ${st.name}</h2><p class="small">Drop the ingredients in and craft.</p>`+st.rec.map((rc,r)=>{const ok=Object.entries(rc.in).every(([k,n])=>(inv[k]||0)>=n);return`<div class="row"><div class="grow">${Object.entries(rc.in).map(([k,n])=>`${ITEMS[k].icon} ${ITEMS[k].name} <span class="${(inv[k]||0)>=n?'ok':'no'}">${inv[k]||0}/${n}</span>`).join(' + ')}<br>➜ <b>${ITEMS[rc.out].icon} ${ITEMS[rc.out].name}</b></div>${btn('Create','craft',{st:p.st,r},!ok)}</div>`}).join(''));return}
 if(v==='den'){cur={...p,v};const d=S.den,q=V5.denQ();open(`<h2>🛖 Common Den</h2><p class="small">A den needs 1 Shelter, 1 Comfort, 1 Beauty and 1 Amusement item. More smilies = faster resting (bad den 10%, 20 smilies 100%).</p><p><b>Den quality: ${'☺'.repeat(Math.min(20,q.sm))||'—'} (${q.sm} smilies) · Rest bonus ${q.pct}%</b></p>`+['Shelter','Comfort','Beauty','Amusement'].map(c=>{const cur2=d[c],opts=Object.entries(inv).filter(([k,n])=>n>0&&ITEMS[k]&&ITEMS[k].cat===c);return`<div class="row"><div class="grow"><b>${c}:</b> ${cur2?ITEMS[cur2].icon+' '+ITEMS[cur2].name+' '+'☺'.repeat(ITEMS[cur2].sm):'<i class="small">empty</i>'}</div>${opts.map(([k])=>btn(ITEMS[k].icon+' '+ITEMS[k].sm+'☺','denSet',{cat:c,item:k})).join('')}${cur2?btn('Remove','denSet',{cat:c,item:null}):''}</div>`}).join('')+'<p class="small">Den items: Custom Den Store (Rock Garden) and the new world stores.</p>'+btn('💤 Rest in Den','rest',{}));return}
 if(v==='goals'||v==='goal'){cur={...p,v};const list=v==='goal'?GOALS.filter(g=>g.zone===S.zone):GOALS;const ic=w=>({Amelia:'👩‍🔬',Esteban:'🧑‍🔬',Nina:'👧',Prospector:'⛏️','The Scrutinizer':'🦭'}[w]||'⭐');
  open('<h2>⭐ '+(v==='goal'?'Goal Station':'Goals')+'</h2>'+list.map(g=>{const ok=g.check(S),d=S.done[g.id];return`<div class="row goalrow${d?' done':''}"><div class="npcp sm">${ic(g.giver)}</div><div class="grow"><b>${g.name||g.text.split(':')[0]}</b>${g.giver?` <span class="small">· ${g.giver}</span>`:''}<br>${d?'✅ ':ok?'🎁 ':''}<span class="small">${g.text}</span>${g.say&&!d?`<br><i class="small">“${g.say}”</i>`:''}<br><span class="small rew">${Z(g.zone).name} · Reward: ${g.lux.toLocaleString()} Lux${g.item?' + '+ITEMS[g.item].name:''}</span></div>${d?'':btn('Claim','claim',{gid:g.id},!ok||(S.zone!==g.zone))}</div>`}).join(''));return}
 ui0(v,p);
 if(v==='fauna'){const fg=document.getElementById('fg');if(fg){[...fg.children].forEach((d,k)=>{const x=S.fauna[k];const sm=d.querySelector('.small');if(sm)sm.innerHTML=`${geneticName(x)} · Gen ${x.gen||1}<br>${x.genes.eyes} eyes · ${x.genes.ears} ears · ${x.genes.tail} tail<br>Abilities: ${V5.abil(x).join(', ')}<br>😊${Math.round(x.happiness*11)} ⚡${Math.round(x.energy*11)}`;d.insertAdjacentHTML('beforeend',btn('Info','ui',{v:'fauna',fid:k,tab:'Info'})+btn('Abilities','ui',{v:'fauna',fid:k,tab:'Abilities'})+btn('Genome','ui',{v:'fauna',fid:k,tab:'Genome'}))})}
  MB.querySelector('h2').insertAdjacentHTML('afterend',`<p class="small">Caring for: ${S.fauna.length} · Room for: ${3-S.fauna.length}</p>`)}
 if(v==='cert'){const x=S.fauna[p.fid];const pEl=MB.querySelector('.cert p');if(x&&pEl)pEl.innerHTML=`Species: <b>${SPECIES[x.genes.species].name}</b> · Generation ${x.gen||1} · Age: New Born<br>${x.genes.color} / ${x.genes.color2} · ${x.genes.pattern} · ${x.genes.eyes} eyes · ${x.genes.ears} ears · ${x.genes.tail} tail${x.genes.heatProof?' · Heat Proof':''}${x.genes.waterProof?' · Water Proof':''}`}
 if(v==='nest'&&!S.home.nest.egg&&S.player.eggs.length){const pp=MB.querySelector('.small');if(pp)pp.textContent='Place an egg in the Nest and Incubate it with one of your fauna. Each parent passes one Dominant or Recessive gene per trait — babies can even be a different species!'}};
// ---------- Tricks radial menu (tap portrait) ----------
const TRICK_IC={greet:'👋',play:'⚽',bored:'😑',boing:'🦘',sniff:'👃',roll:'🌀',itch:'🐾'};
V5.tricksMenu=function(){let m=document.getElementById('radial');if(m){m.remove();return}m=document.createElement('div');m.id='radial';const all=['greet','play','bored','boing','sniff','roll','itch'];const items=[...all.map(k=>({k,on:S.tricks.includes(k)})),{k:'home'}];
 m.innerHTML='<div class="rc">Tricks</div>'+items.map((it,i)=>{const a=i/items.length*6.283-1.57;return`<button style="left:calc(50% + ${Math.cos(a)*92}px);top:calc(50% + ${Math.sin(a)*92}px)" class="${it.on===false?'lock':''}" data-k="${it.k}"><i>${it.k==='home'?'🏠':TRICK_IC[it.k]}</i><span>${it.k==='home'?'Go Home':it.k[0].toUpperCase()+it.k.slice(1)}</span></button>`}).join('');
 m.onclick=e=>{const b=e.target.closest('button');m.remove();if(!b)return;const k=b.dataset.k;if(k==='home'){if(S.zone!=='home')startTravel('home');return}if(!S.tricks.includes(k))return toast('Find a '+k[0].toUpperCase()+k.slice(1)+' Chip to teach this trick.');dispatch('trick',{k})};
 document.getElementById('stage').appendChild(m);Sound.sfx('whoosh')};
document.getElementById('pf').addEventListener('click',()=>{Sound.init();V5.tricksMenu()});
// help text
document.getElementById('help').onclick=e=>{e.preventDefault();open('<h2>? Help</h2><p><b>Zap</b> Inert pollution with your collar. <b>Goods</b> 🎒 has Food, Eggs, Ingredients and Misc tabs; food cards show Flavors, Temp and Aftertaste, and every species has a favourite and a hated flavor. <b>Crafting stumps</b> (Combining Basin, Clay Maker\'s, Beauty, Paleo, Differential, Kiln) turn ingredients into quest items. Tap your fauna\'s <b>portrait</b> for Tricks. Use a <b>Gene Test Kit</b> in Fauna ▸ Genome. Fill the Egg Meter to level up and lay eggs; each parent passes Dominant/Recessive genes.</p>')};
// audio: new biomes
const sty0=Sound.style.bind(Sound);Sound.style=function(){const b=this.biome;if(window.S&&S.fauna&&S.fauna.length){if(b==='beach')return'tropical';if(b==='mesa')return'tribal';if(b==='sea')return'night'}return sty0()};
const sur0=Sound.surface.bind(Sound);Sound.surface=function(){const b=this.biome;if(b==='beach'||b==='mesa'||b==='sea')return'sand';return sur0()};
V5.migrate();if(fa())renderHUD();
console.log('[FaunaSphere] v5 systems loaded');

// ===== v5 batch 12: Wintergift, Sunken Probe, Parade Balloons 2, release/hatch flow, Level 20 ceremony =====
ZONES.push(
 {id:'wintergift',name:'Wintergift Valley',biome:'arctic',n:10,tier:3,unlock:'g_rock',stations:['gate','goal','vendor'],nodes:{rock:1,pool:1,dig:1},poll:8,props:['snowman','snowman','gift','gift','gift','igloo','lamp'],tox:1},
 {id:'abyss',name:'Under Sea Abyss',biome:'sea',n:10,tier:3,unlock:'g_village',water:1,stations:['gate','goal','vendor'],nodes:{dig:2,pool:1},poll:8,props:['coral','coral','seaweed','seaweed','seaweed','coral'],tox:2},
 {id:'gobblefield',name:'Camp Gobblefield',biome:'forest',n:10,tier:2,unlock:'g_amph',stations:['gate','goal','vendor'],nodes:{tree:2,rock:1,dig:1},poll:8,props:['pumpkin','pumpkin','hay','hay','mushring','log'],tox:1});
Object.assign(ITEMS,{
 gift_untagged:{name:'Untagged Gift',type:'ing',icon:'🎁'},gift_mystery:{name:'Mystery Gift',type:'ing',icon:'🎀'},igloo_decor:{name:'Igloo Decorations',type:'ing',icon:'❄️'},
 d_snowman:{name:'Snowman Sculpture',type:'decor',icon:'⛄',cat:'Beauty',smilies:3},
 shell_pointy:{name:'Pointy Shell',type:'ing',icon:'🐚'},shell_spiky:{name:'Spiky Shell',type:'ing',icon:'🦪'},shell_wavy:{name:'Wavy Shell',type:'ing',icon:'🐚'},
 d_cukes:{name:'Birthday Cukes',type:'decor',icon:'🪸',cat:'Beauty',smilies:2},
 zirco_fluph:{name:'Zirco Fluph',type:'ing',icon:'☁️'},skybloom_fluph:{name:'Skybloom Fluph',type:'ing',icon:'🌸'},wriggleyarn:{name:'Wriggleyarn',type:'ing',icon:'🧶'},scratchyarn:{name:'Scratchyarn',type:'ing',icon:'🧵'},
 d_hayroll:{name:'Hay Roll',type:'decor',icon:'🌾',cat:'Comfort',smilies:2}});
for(const k of['d_snowman','d_cukes','d_hayroll'])if(ITEMS[k]&&!ITEMS[k].prop)ITEMS[k].prop={d_snowman:'snowman',d_cukes:'coral',d_hayroll:'hay'}[k];
Object.assign(VENDORS,{wintergift:[['den_giftbloom',70],['hotapplemolass',40]].filter(x=>ITEMS[x[0]]),abyss:[['boilroot',30],['oilywurst',40]],gobblefield:[['zirco_fluph',45],['skybloom_fluph',45],['wriggleyarn',35],['scratchyarn',35],['gruffle',30]]});
Object.assign(DIGLOOT,{abyss:['shell_pointy','silt'],gobblefield:['duskroot','truffle']});
DIGLOOT.deepplains=(DIGLOOT.deepplains||[]).concat(['shell_spiky']);DIGLOOT.fishatish=(DIGLOOT.fishatish||[]).concat(['shell_wavy']);
Object.assign(ZDROP,{wintergift:'ice',abyss:'silt',gobblefield:'grass'});
GOALS.push(
 {id:'wg_start',zone:'wintergift',name:'Who Will Save Wintergift?',giver:'Amelia',say:"A snow storm blew the tags off the Wintergift gifts! We don't know who any of them are meant for. The Scrutinizer is feeling grumpy, too. Decorate his igloo with these to help get him into the Wintergift spirit.",text:'Who Will Save Wintergift?: talk to Amelia at the Goal Station to pick up the gifts.',check:()=>true,lux:0,give:{gift_untagged:4,gift_mystery:1,igloo_decor:1},done:'Deliver the Untagged Gifts to Amelia at the Mammoth Skeleton, Esteban in the Rock Garden, Nina at the Forest Amphitheater and the Prospector in the Frozen Village. The Mystery Gift is for the Scrutinizer!'},
 {id:'wg_igloo',zone:'village',name:'Wintergift: Igloo Decorations',giver:'The Scrutinizer',text:'Put the Igloo Decorations on the Scrutinizer\'s igloo and hand him the Mystery Gift.',check:()=>S.done.wg_start&&has('igloo_decor')&&has('gift_mystery'),take:{igloo_decor:1,gift_mystery:1},lux:2500,done:'Hmph. ...Well. It does look rather festive. Thank you, starfriend.'},
 {id:'wg_amelia',zone:'ruins',name:'Wintergift: Gift for Amelia',giver:'Amelia',text:'Deliver an Untagged Gift to Amelia at the Mammoth Skeleton.',check:()=>S.done.wg_start&&has('gift_untagged'),take:{gift_untagged:1},lux:0,done:'For me? Oh, how wonderful! Happy Wintergift!'},
 {id:'wg_esteban',zone:'rockgarden',name:'Wintergift: Gift for Esteban',giver:'Esteban',text:'Deliver an Untagged Gift to Esteban in the Rock Garden.',check:()=>S.done.wg_start&&has('gift_untagged'),take:{gift_untagged:1},lux:0,done:'What have you got there? A Wintergift present for me? Thank you!'},
 {id:'wg_nina',zone:'amph',name:'Wintergift: Gift for Nina',giver:'Nina',text:'Deliver an Untagged Gift to Nina at the Forest Amphitheater.',check:()=>S.done.wg_start&&has('gift_untagged'),take:{gift_untagged:1},lux:0,done:'Presents! Hooray!'},
 {id:'wg_prospector',zone:'village',name:'Wintergift: Gift for the Prospector',giver:'Prospector',text:'Deliver an Untagged Gift to the Prospector in the Frozen Village.',check:()=>S.done.wg_start&&has('gift_untagged'),take:{gift_untagged:1},lux:0,done:"Well golly gosh, starfriend, you shouldn't 'ave."},
 {id:'wg_done',zone:'wintergift',name:'Wintergift Is Saved!',giver:'Amelia',text:'Wintergift Is Saved!: deliver all the gifts, then return to Amelia.',check:()=>['wg_igloo','wg_amelia','wg_esteban','wg_nina','wg_prospector'].every(k=>S.done[k]),lux:5000,item:'d_snowman',done:'You saved Wintergift! Everyone got their presents. Here, take this snowman sculpture for your Faunasphere!'},
 {id:'q_probe',zone:'abyss',name:'Sunken Probe',giver:'Esteban',say:'My probe broke apart down here! Dig up a Pointy Shell here in the Abyss, a Spiky Shell in Deep Plains and a Wavy Shell on Fishatish Island so I can patch it.',text:'Sunken Probe: dig a Pointy Shell (Abyss), Spiky Shell (Deep Plains) and Wavy Shell (Fishatish).',check:()=>has('shell_pointy')&&has('shell_spiky')&&has('shell_wavy'),take:{shell_pointy:1,shell_spiky:1,shell_wavy:1},lux:1500,item:'d_cukes'},
 {id:'q_balloons2',zone:'gobblefield',name:'Parade Balloons 2',giver:'Prospector',say:"Kaylee May's parade balloons need fixin', starfriend! Bring me a Zirco Fluph, a Skybloom Fluph, some Wriggleyarn and some Scratchyarn.",text:'Parade Balloons 2: drop a Zirco Fluph, Skybloom Fluph, Wriggleyarn and Scratchyarn on the Goal Station.',check:()=>has('zirco_fluph')&&has('skybloom_fluph')&&has('wriggleyarn')&&has('scratchyarn'),take:{zirco_fluph:1,skybloom_fluph:1,wriggleyarn:1,scratchyarn:1},lux:1500,item:'d_hayroll'});
// wg_done: 3×2500 Lux total split: igloo 2500 + done 5000
const claim5=R.claim;R.claim=p=>{const g=GOALS.find(x=>x.id===p.gid);const was=S.done[p.gid];claim5(p);if(g&&g.give&&!was&&S.done[p.gid])for(const[k,n]of Object.entries(g.give))S.player.inv[k]=(S.player.inv[k]||0)+n};
// release flow with the three green popups
const gpop=(t,b)=>`<div class="gpop">${t}</div>${b||''}`;
R.release=({fid})=>{const f=S.fauna[fid];if(!f||S.fauna.length<=1)return;const n=f.name;S.fauna.splice(fid,1);S.active=0;Sound.sfx('moan');setTimeout(()=>open(gpop(n+' has been released into the wild. So sad...',btn('OK','close'))),50)};
const ui12=ui;ui=function(v,p={}){
 if(v==='release0'){if(S.fauna.length<=1)return toast('You need at least one fauna.');return open('<h2>Release</h2>'+gpop('You are about to select one of your Fauna to release into the wild. The Fauna you choose will no longer show up in your Fauna list.')+S.fauna.map((f,i)=>btn(f.name,'ui',{v:'release1',fid:i})).join(' ')+' '+btn('Cancel','close'))}
 if(v==='release1'){const f=S.fauna[p.fid];return open('<h2>Release</h2>'+gpop('You are about to release '+f.name+' into the wild. Are you sure? This cannot be undone.')+btn('Release','release',{fid:p.fid})+' '+btn('Cancel','close'))}
 if(v==='hatching'){open('<h2>🪺 Nest</h2><p><b>Hatching...</b></p><div class="hbar"><i></i></div>');Sound.sfx('hatch');setTimeout(()=>{const k=S.fauna.length;dispatch('hatch',{name:''});const f=S.fauna[k];if(f){open(gpop('EGG HATCHED. You\'ve hatched a baby '+SPECIES[f.genes.species].name)+btn('See certificate','ui',{v:'cert',fid:k}))}},1700);return}
 ui12(v,p);
 if(v==='fauna'&&MB)MB.querySelectorAll('button[data-a="release"]').forEach(b=>{const q=JSON.parse(b.dataset.p);b.dataset.a='ui';b.dataset.p=JSON.stringify({v:'release1',fid:q.fid})});
 if(v==='fauna'&&S.fauna.length>1&&MB&&!MB.querySelector('[data-rel]')){MB.insertAdjacentHTML('beforeend','<p data-rel>'+btn('Release a Fauna…','ui',{v:'release0'})+'</p>')}
 if(v==='nest'&&MB){MB.querySelectorAll('button[data-a="hatch"]').forEach(b=>{b.dataset.a='ui';b.dataset.p=JSON.stringify({v:'hatching'})})}
 if(v==='cert'){const x=S.fauna[p.fid],pEl=MB&&MB.querySelector('.cert p');if(x&&pEl){const ab=V5.abil(x)||[];pEl.insertAdjacentHTML('afterbegin',`Parents: <b>${(x.parents||['?','?']).join(' & ')}</b><br>`);pEl.insertAdjacentHTML('beforeend','<br>'+ab.map(a=>`<span class="abic" title="${a}">${{dig:'⛏️',zap:'⚡',heat:'🔥',cold:'❄️',heal:'💚',build:'🔨'}[a]||'★'}</span>`).join(''))}}};
// Level 20 gold ceremony: flash, fireworks, fanfare, new vibrant color, thick gold collar
const VIBRANT=['Scarlet','Lime','Sky','Gold','Magenta','Orange','Turquoise','Violet'].filter(c=>!PRIMARY||PRIMARY.includes(c));
V5.gold=function(f){if(!f||f.gold)return;f.gold=1;const pool=VIBRANT.length?VIBRANT:PRIMARY;const nc=pool.filter(c=>c!==f.genes.color);if(nc.length){f.genes.color=nc[Math.floor(Math.random()*nc.length)];if(f.genome&&f.genome.color)f.genome.color[0]=f.genes.color}
 const fl=document.createElement('div');fl.style.cssText='position:absolute;inset:0;z-index:60;pointer-events:none;background:radial-gradient(#fff,#ffe36a00 70%);animation:none;opacity:1;transition:opacity 1.2s';document.getElementById('stage').appendChild(fl);setTimeout(()=>fl.style.opacity=0,80);setTimeout(()=>fl.remove(),1500);
 const cv=document.createElement('canvas');cv.width=innerWidth;cv.height=innerHeight;cv.style.cssText='position:fixed;inset:0;z-index:61;pointer-events:none';document.body.appendChild(cv);const c=cv.getContext('2d'),P=[];
 for(let b=0;b<6;b++){const x=innerWidth*(.2+.6*Math.random()),y=innerHeight*(.15+.35*Math.random()),h=Math.random()*360;for(let i=0;i<50;i++){const a=Math.random()*6.28,s=1+Math.random()*4;P.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,h,d:b*12})}}
 let fr=0;(function an(){c.clearRect(0,0,cv.width,cv.height);fr++;for(const p of P){if(fr<p.d)continue;p.x+=p.vx;p.y+=p.vy;p.vy+=.05;c.fillStyle=`hsla(${p.h},100%,60%,${Math.max(0,1-(fr-p.d)/90)})`;c.fillRect(p.x,p.y,3,3)}if(fr<170)requestAnimationFrame(an);else cv.remove()})();
 try{Sound.init();[523,659,784,1047,784,1047].forEach((n,i)=>Sound.tone(n,.35,'triangle',.07,i*.15))}catch(_){}save()};
const lvl5=window.banner;setInterval(()=>{const f=fa();if(f&&f.level>=20&&!f.gold)V5.gold(f)},1000);
for(const p of['snowman','pumpkin','hay','gift'])if(!PROPS.includes(p))PROPS.push(p);
console.log('[FaunaSphere] v5 batch 12 loaded');

# FaunaSphere research notes (v2)

## Sources
- [W] Wikipedia — https://en.wikipedia.org/wiki/Faunasphere
- [GS] Game Studies, Begy & Consalvo 2011 — https://gamestudies.org/1101/articles/begy_consalvo
- [E] Engadget 2010 — https://www.engadget.com/2010-06-06-facebook-mmography-first-impressions-of-faunasphere.html
- [M] MMORPG.com review — https://www.mmorpg.com/reviews/faunasphere-review-2000108792
- [SW] StrategyWiki — https://strategywiki.org/wiki/Faunasphere
- [B] 2009 beta promo text (official copy, quoted on a fan forum) — https://125836.activeboard.com/t26322278/faunasphere/
- [G] "Genki's Fauna" fan post, 2012, species galleries — https://genkisgamegab.forumotion.com/t678-genki-s-fauna
- [U] MMOHuts patch notes (2010) — https://mmohuts.com/news/faunasphere-may-10th-update
- [V] Village Gamer 2009 — https://www.villagegamer.net/2009/09/22/enter-the-faunasphere/
Not reached: archive.org snapshots of faunasphere.com and its forums, and YouTube. The fetch tools didn't return usable content from them, so nothing below comes from them.

## History
Big Fish Games, browser 2009 (beta spring 2009), Facebook Feb 18 2010, shut down Mar 15 2011 [SW][W][B].

## Species
- 3 starters [B][M]: **Scooter** (tortoise/turtle) — dives into water for items just under the surface; **Sniffer** (dog) — sniffs buried treasure, lifts rocks covering it; **Hoofer** (horse) — kicks trees to shake down items.
- Launch text: "There are 12 known species" [B]. Max 3 fauna per free account [E]. Fauna can't be traded, only eggs [M].
- Species names from a fan's galleries [G], animal where the fan stated it: Bobbler (dinosaur?), Chomper (crocodile), Dasher (?), Flapper (?), Grabber (octopus), Grazer (buffalo), Hoofer (horse), Hugger (bear), Oinker (pig), Nibber (rabbit), Pouncer (fox — "last type released"), Reacher (giraffe), Scooter (turtle), Scratcher (feline), Squeakers, Thumpers, Tuskers, Waddlers, Wigglers (animals unstated). That's about 19 names, so the roster grew past 12 after launch.
- **v2 roster (12)**: the 3 starters plus the 9 whose animal is confirmed: Chomper, Grabber, Grazer, Hugger, Oinker, Nibber, Pouncer, Reacher, Scratcher. Which 12 existed at launch is UNCERTAIN.
- Genes: parent layer + incubating fauna each contribute a gene; offspring may not resemble parents [B][M]. Gene traits include colors (e.g. Hot Pink, Turquoise), tails (Flower, Mild), eye types (Vamp + eyeshadow colors), patterns (B-sharp, Palm), special ears [U][G]. Gene food changes traits in one bite and grants access (e.g. "Heat Proof Gene Food" from the "Swampward Go" goal) [B][W][U].

## Mechanics
- Players = Caretakers. Fauna zap pollution (cube entities) and toxic creatures → Lux, XP, items, egg points [GS][E][M].
- Lux = free currency; Bux = premium (real money) [W].
- Level cap 20; levelling up lays an egg / egg meter fills from Lux [GS][W][E].
- Happiness works as health; energy; Den restores both; Nest for breeding [GS]. Fauna don't die while you're away [B forum reply].
- Favourite foods per fauna; likes for food, comfort, beauty [B][V].
- Home "Faunasphere" = private floating island: dens, nests, Treat Trees (basic food), combining foods, decorating; friends can visit [GS][M][W].
- Totem at home → components for community projects; visiting others' spheres gives Lux/items [W]. Community Projects in the Garden Hub and the Frozen Village Hub [B forum].
- Goal Stations give quests; the first goal is to buy something from a vendor [E]. Gates unlock via goals [M]. A World Gate links the home sphere and the Rock Garden [U].
- Green glow on interactables [M]. World = cubes (dirt with grass, water, ice, pollution); 3D world with 2D fauna [M].

## World
- The Rock Garden (start hub: marketplace, Goal Station) [B][U]; Rock Island (first quest zone, reached by teleport pad) [E].
- Forest: Tribal Ruins, Forest Amphitheater [B]. Arctic: the Avalanche → arctic lands with remains of an ancient civilization; mammoth skeletons [B][M]; Frozen Village (hub, Gene Food store) [U]. Swamp: via the scorching Whalebone Isthmus, bogs [B]. Duned Tract (store) [U]. A dungeon area [M].

## GUESSES used in v2 (not sourced)
- Which species roots in stumps, and the skills of non-starter species. The review lists "root inside hollow stumps" without naming a species.
- Food names, numbers, decay rates, goal texts (except "buy from a vendor"), zone order after the forest, toxic-creature behaviour, dungeon placement, and the exact art. All the art is my own drawing, made from these written descriptions.


## User-recalled details (from Leo's memory, not independently sourced)
- Fauna wore a zapper/ray necklace (collar with a glowing gem/emitter) that zaps pollution with an electric current. v4 models this as a collar + pulsing gem on all 12 species; the lightning beam fires from the gem. Gem color by level (green 1-4, cyan 5-9, purple 10-14, gold 15+) is our own design choice.

## Video notes (primary source of truth for v4)
Source: our own notes from watching reference gameplay videos (VIDEO_NOTES_1–3). We sampled colours from frames with ffmpeg for reference only; no frames or audio are shipped.

### Look
- Chibi fauna: big heads, bold dark outlines, toon shading.
- Islands topped with grass, with riveted grey metal undersides. v4 approximates the undersides.
- Peach sunset skies.
- Sampled palette:
  - Sky peach #f0af99. Home sky #FCE8D5 (bottom) to #FFFFFF (top).
  - Grass #76A93F. Rock Garden grass #607c33.
  - Ruins sky #f6bca7. Frozen sky #A5BCC6, ice #aed1e6, water #3d8fb3.
  - UI greens #3D991C–#52A827. Panel #073f00 / #173c0f.
  - Energy lime #b9d10a. Happiness amber #ce9802.
  - Lux is a green circle; Bux is a blue square.

### Zap and world objects
- Green jagged lightning comes from a round glowing pendant on the collar.
- Pollution comes as Inert Liquid, Inert Solid and Inert Gas.
- Monsters: "1-eyed Gassy" and "1-eyed Trashy" (black spiky blobs with one green eye).
- Rings are green when ripe or usable, red when not.
- Goal Station and World Gate are hologram pads. In the Rock Garden, the World Gate is a giant grey robot head.

### HUD
- Bottom-left: portrait, Energy (green) bar, Happiness (yellow) bar, circular egg meter.
- Bottom-right: round green buttons for Goods, Fauna, Friends, Goals and Map, with Lux/Bux above.
- Top-right: EDIT/DONE.
- Energy is shown as N/1,100. v4 scales the internal 0–100 value by 11 (guess).

### Goals and NPCs
- "Go Shopping!"
- "Get on the Totem Grid" (Esteban): find the Base, Coffer and Lowman. The Totem then produces Biorock Discs.
- "Tarnation, Y'all" (Prospector "E.P.", catchphrase "Nee haw!"): rewards the Scanner Doohickey.
- The Moneyman is in the Tribal Ruins.

### Shops and eggs
- Lux Store with a cart and a Buy! button.
- Nest: Incubate, then an EGG HATCHED banner, then a birth certificate.

### Other features
- Daily Goodie Grab with 3 sacks.
- Amelia's night sphere: stars, crescent moon, a stream, no pollution.
- Rock Garden props: stone heads, hollow logs, waterfalls, lily ponds, sunflowers.
- Max 3 fauna.
- Placing a decoration costs 25 Lux.

### Audio
- From analysing one reference clip: about 172 BPM (felt at 86), key of D major.
- Style: whimsical orchestral, with pizzicato, flute/marimba and light percussion.
- v4's music and sound effects are synthesised entirely in code. No original audio is embedded or copied.

### Our guesses
- The exact drop rates for totem parts.
- The Helianth price of 25 Lux, set for balance.
- The Daily Goodie Grab prize table.
- Which zones the props appear in.

### Deferred
- Everything else from notes 2–3 is listed in BACKLOG.md.

## Audio reference (AUDIO_NOTES.md, from listening to real game audio — recreated in synthesis only)
Per-zone music in audio.js:
- Loading/title: slow strings with oboe/flute and harp.
- Grassy hub: acoustic guitar strum, acoustic bass, marimba, shaker/congas.
- Rock Garden and rocky zones: tribal, with driving bass, bongo/djembe and pan flute.
- Beach/isthmus: steel drums, marimba chords, shaker/guiro.
- Amelia's night sphere: harp (our guess).

Effects:
- Footsteps vary by surface: grass thuds, stone clacks, sand swooshes.
- Digging scrape, sustained crackling zap loop, rubbery rising bloop for drops, crunchy munch, incubation heartbeat, airy whoosh on panels, bright chime clicks, ~2s "da-da-da-DAAA" fanfare, elastic boing.
- Creature voices: newborn whine, idle "hmm?", low moan on the fauna menu, happy trill after eating, monster growl.

Moved to the backlog: digging brown dirt patches for Root Stems and Hot Boilroots, Goods tabs, the goals "The Bone Racket" and "A Stone for a Chip", and typing clacks in chat.

## VIDEO_NOTES_4 (estimates)
- Inert Gas is a green spiky blob, Inert Liquid a grey bubble cluster, Inert Solid a grey block pile. All are universal pollution nodes and drop Silt or Sand. v4 drops Silt 30% of the time (our guess).
- v4 uses the Searing Mesa palette for the scorch biome.
- The new zones are listed in BACKLOG.md.

## VIDEO_NOTES_5 and RESEARCH_WIKI
- The full gene colour list from the Gene Food stores is now in COLORS. The hex values are our guesses.
- v4 uses the Frozen Village palette (void #8b9dc3, ice #dbe9f4, water #4ea5d9) and the Mire Knoll palette (void #3b3633, mud #5a6b3c, water #4a6b5c).
- Egg Meter per the wiki: earning Lux fills it, and a full meter gives an egg (it works like XP). In v4 only Lux fills it (0.6 per Lux); the old level-up bonus is removed.
- Each species has its own gathering ability, which v4 already implements.
- VIDEO_NOTES_6: the observed list has 16 species. v4 uses those names where they match (Nibbler); the eye type list is extended, and iris tints are our guess. v4 already has the GOAL COMPLETE and Level up! banners and green +Lux floaters.

## RESEARCH_SOURCES rules applied in v4
- Three starters: Scooter (tortoise, dives water), Sniffer (lifts rocks / buried treasure), Hoofer (kicks trees).
- The Egg Meter is the level meter.
  - Lux fills it, multiplied by 1.0–1.4 depending on energy plus happiness.
  - A full meter gives a level up and an egg. The egg is laid only at home; otherwise it is queued until you return.
  - Max level is 20: a gold collar and a Level 20 Fauna Trophy.
  - From level 10, the zap deals 2 damage (the level threshold is our guess).
- Energy at 0 triggers a ~10s nap, shown with Zzz bubbles. Happiness at 0 sends the fauna home (already in v4).
- Interactive things glow green on hover (ring).
- Lux is green and Bux is gold. VIDEO_NOTES_2 said Bux was a blue square; the sources win.
- Both species lists are treated as real.
- HUD (VIDEO_NOTES_7): "Hi, <name> | Reload Game | ? Help" at the top; the nest shows "Egg laid by:".
- VIDEO_NOTES_8: v4 now includes the full eye-type list (iris tints are guessed). Ears, tails, patterns, the extra species, abilities and holiday worlds are in BACKLOG.md.
- VIDEO_NOTES_9: v4 HUD uses lime panels (#8CC63F, border #5C8A29) and a bottom-centre chat pill with SEND (local only, no multiplayer). The loading screen has a dark green #1A3311 background, faded polaroid cards (our own emoji scenes, not the originals), the logo, a status panel ('Signing in… Loading resources… Processing resources… Waiting for world…'), a progress bar, tips and a bottom Loading bar.

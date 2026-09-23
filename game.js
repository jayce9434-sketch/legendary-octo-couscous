'use strict';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
const fmt = n => Math.floor(n).toLocaleString();
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4);
const esc = s => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const timeText = ms => {
  ms=Math.max(0,ms); const s=Math.ceil(ms/1000);
  if(s<60) return `${s}s`;
  const m=Math.floor(s/60), rs=s%60;
  if(m<60) return `${m}m ${rs}s`;
  const h=Math.floor(m/60), rm=m%60; return `${h}h ${rm}m`;
};
const haptic = ms => { try{ navigator.vibrate?.(ms) }catch{} };

const RARITIES = {
  Common:{mult:1, wait:1, coin:1, cls:'common'},
  Rare:{mult:1.7, wait:1.35, coin:1.7, cls:'rare'},
  Epic:{mult:2.8, wait:1.7, coin:2.8, cls:'epic'},
  Legendary:{mult:4.5, wait:2.2, coin:4.5, cls:'legendary'}
};
const rarityOrder=['Common','Rare','Epic','Legendary'];

const islands = [
  {id:'verdant',name:'Verdant Isle',icon:'🌿',unlock:0,gradient:'linear-gradient(#6ec8ff 0 50%,#77bf54 51% 100%)',accent:'#77bf54',desc:'Bouncy reeds, warm breezes, and the first Chordlings.'},
  {id:'ember',name:'Ember Crag',icon:'🌋',unlock:4800,gradient:'linear-gradient(#8c4f6d 0 48%,#cf6245 49% 100%)',accent:'#d96546',desc:'A volcanic stage of crackles, bass thumps, and brass.'},
  {id:'tidal',name:'Tidal Key',icon:'🌊',unlock:16000,gradient:'linear-gradient(#72d8ee 0 46%,#3ea9c6 47% 100%)',accent:'#42bed4',desc:'Percussion echoes across bright reefs and moonlit water.'},
  {id:'astral',name:'Astral Atoll',icon:'🌌',unlock:52000,gradient:'linear-gradient(#302c66 0 48%,#6754a5 49% 100%)',accent:'#8776db',desc:'Dreamy synths and starlit voices at the edge of the sky.'}
];

const monsters = [
  // Verdant
  {id:'mossmara',name:'Mossmara',island:'verdant',elements:['Leaf'],emoji:'🌱',colors:['#75dd78','#356f51'],sound:'pluck',base:45,breed:18,income:6,bio:'A springy sprout that plucks its leaf-strings on every downbeat.'},
  {id:'twiggle',name:'Twiggle',island:'verdant',elements:['Wood'],emoji:'🪵',colors:['#d09d62','#725037'],sound:'click',base:90,breed:40,income:9,bio:'Taps hollow twigs together like a tiny wooden metronome.'},
  {id:'chimecub',name:'Chimecub',island:'verdant',elements:['Crystal'],emoji:'🔔',colors:['#82dff1','#407b9e'],sound:'bell',base:170,breed:75,income:14,bio:'Its glassy ears ring with bright little chords.'},
  {id:'sleetbeat',name:'Sleetbeat',island:'verdant',elements:['Frost'],emoji:'❄️',colors:['#c5f3ff','#5986b9'],sound:'hat',base:260,breed:110,income:18,bio:'Shivers rhythmically, making crisp icy percussion.'},
  {id:'hummbud',name:'Hummbud',island:'verdant',elements:['Leaf','Air'],emoji:'🌼',colors:['#ffe56d','#59a964'],sound:'hum',base:430,breed:160,income:26,bio:'A flower-faced singer with a soft, wobbling hum.'},
  {id:'barkitone',name:'Barkitone',island:'verdant',elements:['Wood','Leaf'],emoji:'🌳',colors:['#9d6d43','#3e744d'],sound:'bass',base:720,breed:240,income:36,bio:'A stump-sized baritone with roots that keep time.'},
  {id:'glimfinch',name:'Glimfinch',island:'verdant',elements:['Crystal','Air'],emoji:'🐦',colors:['#ffcb70','#e98272'],sound:'chirp',base:1100,breed:360,income:48,bio:'Whistles shimmering triplets and refuses to stand still.'},
  {id:'drumplet',name:'Drumplet',island:'verdant',elements:['Wood','Frost'],emoji:'🥁',colors:['#da9b63','#8f5a5d'],sound:'kick',base:1700,breed:520,income:65,bio:'A round little drummer with a surprisingly enormous kick.'},
  {id:'choraloe',name:'Choraloe',island:'verdant',elements:['Leaf','Crystal','Frost'],emoji:'🎵',colors:['#80e0ae','#5a75b4'],sound:'choir',base:2600,breed:720,income:88,bio:'Sings layered vowel tones through a spiral of petals.'},
  {id:'grovegrand',name:'Grovegrand',island:'verdant',elements:['Leaf','Wood','Crystal','Frost'],emoji:'🦌',colors:['#c3d96b','#446849'],sound:'grand',base:4300,breed:980,income:120,bio:'The deep-voiced elder of Verdant Isle. Every step sounds like a chord.'},
  // Ember
  {id:'cinderpip',name:'Cinderpip',island:'ember',elements:['Flame'],emoji:'🔥',colors:['#ffbc4c','#d94f34'],sound:'pop',base:600,breed:65,income:18,bio:'Pops sparks in syncopated bursts.'},
  {id:'clankit',name:'Clankit',island:'ember',elements:['Metal'],emoji:'🔩',colors:['#b8c2cc','#59636e'],sound:'clank',base:900,breed:100,income:24,bio:'A cheerful pile of percussion-grade scrap metal.'},
  {id:'coaloon',name:'Coaloon',island:'ember',elements:['Smoke'],emoji:'☁️',colors:['#777b84','#34333c'],sound:'whoosh',base:1300,breed:150,income:30,bio:'Puffs smoky breaths that land exactly between the beats.'},
  {id:'brassaur',name:'Brassaur',island:'ember',elements:['Brass'],emoji:'📯',colors:['#f2c04d','#9f6235'],sound:'brass',base:1900,breed:220,income:40,bio:'A horn-backed stomper that treats every song like a parade.'},
  {id:'furnibble',name:'Furnibble',island:'ember',elements:['Flame','Metal'],emoji:'⚙️',colors:['#f16f41','#6e6870'],sound:'tick',base:2900,breed:330,income:54,bio:'Its furnace-heart ticks faster as the chorus builds.'},
  {id:'smolderoo',name:'Smolderoo',island:'ember',elements:['Flame','Smoke'],emoji:'🦘',colors:['#ed7950','#5d3d4c'],sound:'tom',base:4300,breed:460,income:72,bio:'Bounces on its tail and lands with a smoky tom hit.'},
  {id:'gongoyle',name:'Gongoyle',island:'ember',elements:['Metal','Brass'],emoji:'🗿',colors:['#b49b77','#625d65'],sound:'gong',base:6300,breed:620,income:95,bio:'Its chest is a gong. Yes, it knows exactly how dramatic that is.'},
  {id:'flarehorn',name:'Flarehorn',island:'ember',elements:['Flame','Brass'],emoji:'🦬',colors:['#ffb545','#a83e30'],sound:'horn',base:9000,breed:800,income:125,bio:'Blasts warm brass notes through curled ember horns.'},
  {id:'kilnchoir',name:'Kilnchoir',island:'ember',elements:['Smoke','Metal','Brass'],emoji:'🎶',colors:['#ad6c5c','#4f4c5d'],sound:'choir2',base:12500,breed:1100,income:165,bio:'A three-throated furnace singer with perfect harmony.'},
  {id:'magmammoth',name:'Magmammoth',island:'ember',elements:['Flame','Smoke','Metal','Brass'],emoji:'🐘',colors:['#ef6546','#703137'],sound:'mega',base:18000,breed:1450,income:225,bio:'The mountain-sized closer of Ember Crag.'},
  // Tidal
  {id:'bubblip',name:'Bubblip',island:'tidal',elements:['Bubble'],emoji:'🫧',colors:['#9bf1f3','#4ba9ca'],sound:'bubble',base:1700,breed:90,income:25,bio:'Sings by popping bubbles of different sizes.'},
  {id:'shellsnap',name:'Shellsnap',island:'tidal',elements:['Shell'],emoji:'🐚',colors:['#f3caa5','#b77987'],sound:'snap',base:2400,breed:130,income:32,bio:'Clacks shell-plates together like castanets.'},
  {id:'kelpkey',name:'Kelpkey',island:'tidal',elements:['Kelp'],emoji:'🌿',colors:['#5dd5a4','#247c75'],sound:'keys',base:3300,breed:190,income:41,bio:'Its floating fronds behave suspiciously like piano keys.'},
  {id:'coraltoot',name:'Coraltoot',island:'tidal',elements:['Coral'],emoji:'🪸',colors:['#ff8b9e','#a8598c'],sound:'toot',base:4500,breed:270,income:52,bio:'Toots bright reef melodies through coral pipes.'},
  {id:'wavewhump',name:'Wavewhump',island:'tidal',elements:['Bubble','Shell'],emoji:'🐋',colors:['#73cfe9','#376ca8'],sound:'wave',base:6400,breed:390,income:68,bio:'A tiny whale with a not-tiny bass drop.'},
  {id:'marimoss',name:'Marimoss',island:'tidal',elements:['Kelp','Shell'],emoji:'🐢',colors:['#79bf8b','#517369'],sound:'marimba',base:8800,breed:540,income:88,bio:'Its shell plates form a living marimba.'},
  {id:'reefrattle',name:'Reefrattle',island:'tidal',elements:['Coral','Shell'],emoji:'🦀',colors:['#fa826d','#704b73'],sound:'rattle',base:12000,breed:730,income:114,bio:'Scuttles in sixteenth notes with pebbles in its claws.'},
  {id:'tidevox',name:'Tidevox',island:'tidal',elements:['Bubble','Kelp','Coral'],emoji:'🐙',colors:['#8e75d4','#4f95b8'],sound:'vox',base:16500,breed:940,income:148,bio:'Eight arms, eight notes, one extremely committed vocalist.'},
  {id:'moonray',name:'Moonray',island:'tidal',elements:['Bubble','Coral'],emoji:'🌙',colors:['#9ee6f5','#6164aa'],sound:'pad',base:22000,breed:1200,income:190,bio:'Glides through the air and leaves a soft chord behind.'},
  {id:'leviathrum',name:'Leviathrum',island:'tidal',elements:['Bubble','Shell','Kelp','Coral'],emoji:'🐉',colors:['#3d9fb7','#274e74'],sound:'ocean',base:31000,breed:1550,income:255,bio:'Tidal Key shakes when its enormous water-drum starts playing.'},
  // Astral
  {id:'starbleep',name:'Starbleep',island:'astral',elements:['Star'],emoji:'⭐',colors:['#ffe57b','#a46bd7'],sound:'bleep',base:5200,breed:120,income:38,bio:'Communicates primarily in friendly arpeggios.'},
  {id:'orbitot',name:'Orbitot',island:'astral',elements:['Orbit'],emoji:'🪐',colors:['#9f8af4','#5765aa'],sound:'orbit',base:7200,breed:180,income:48,bio:'Its tiny moon is also its percussion section.'},
  {id:'dreamlet',name:'Dreamlet',island:'astral',elements:['Dream'],emoji:'💤',colors:['#bca5ff','#6a5fa5'],sound:'dream',base:9800,breed:260,income:61,bio:'Half asleep, fully on pitch.'},
  {id:'prismite',name:'Prismite',island:'astral',elements:['Light'],emoji:'💎',colors:['#8ef0ff','#cf8fff'],sound:'prism',base:13200,breed:360,income:78,bio:'Splits one note into a rainbow of harmonics.'},
  {id:'nebubass',name:'Nebubass',island:'astral',elements:['Star','Dream'],emoji:'🌠',colors:['#6e75cc','#3b396d'],sound:'sub',base:18000,breed:500,income:101,bio:'Plays bass frequencies that make nearby stars wobble.'},
  {id:'ringding',name:'Ringding',island:'astral',elements:['Orbit','Light'],emoji:'🔵',colors:['#5ed7e0','#6466c9'],sound:'ring',base:24000,breed:680,income:130,bio:'Its orbiting rings chime whenever they cross.'},
  {id:'lucidrum',name:'Lucidrum',island:'astral',elements:['Dream','Light'],emoji:'🥁',colors:['#ca9af1','#6686d7'],sound:'softkick',base:32000,breed:870,income:168,bio:'A dreamy drummer that somehow hits before you expect it.'},
  {id:'cometcall',name:'Cometcall',island:'astral',elements:['Star','Orbit','Light'],emoji:'☄️',colors:['#ffb474','#8b6edb'],sound:'lead',base:43000,breed:1100,income:215,bio:'A bright lead singer that streaks across the chorus.'},
  {id:'voidvowel',name:'Voidvowel',island:'astral',elements:['Star','Dream','Orbit'],emoji:'🕳️',colors:['#696092','#25243c'],sound:'void',base:57000,breed:1350,income:275,bio:'Sings a vowel so deep the background gets quieter.'},
  {id:'cosmocrown',name:'Cosmocrown',island:'astral',elements:['Star','Orbit','Dream','Light'],emoji:'👑',colors:['#e0a8ff','#4d5bb3'],sound:'cosmos',base:76000,breed:1700,income:360,bio:'The grand finale: choir, synth, bell, bass, and pure space drama.'}
];
const monsterById = Object.fromEntries(monsters.map(m=>[m.id,m]));

const questDefs = [
  ['q1','First Note','Own 2 Chordlings.',s=>totalOwned(s)>=2,120,1],
  ['q2','Tiny Choir','Own 4 Chordlings.',s=>totalOwned(s)>=4,240,1],
  ['q3','Full Verdant Band','Own 7 monsters on Verdant Isle.',s=>ownedOn(s,'verdant')>=7,500,1],
  ['q4','Collector I','Discover 8 unique monster forms.',s=>Object.keys(s.discovered).length>=8,700,2],
  ['q5','Level Up','Raise any monster to level 5.',s=>allOwned(s).some(x=>x.level>=5),600,1],
  ['q6','Rare Air','Discover any Rare.',s=>Object.keys(s.discovered).some(k=>k.endsWith('|Rare')),900,2],
  ['q7','Epic Entrance','Discover any Epic.',s=>Object.keys(s.discovered).some(k=>k.endsWith('|Epic')),1500,3],
  ['q8','Legendary Noise','Discover any Legendary.',s=>Object.keys(s.discovered).some(k=>k.endsWith('|Legendary')),3000,5],
  ['q9','Island Hopper','Unlock 2 islands.',s=>s.unlocked.length>=2,1200,2],
  ['q10','Touring Band','Unlock 3 islands.',s=>s.unlocked.length>=3,2500,3],
  ['q11','Four Stages','Unlock all 4 islands.',s=>s.unlocked.length>=4,6000,5],
  ['q12','Coin Pile','Hold 10,000 coins at once.',s=>s.coins>=10000,1000,1],
  ['q13','Big Savings','Hold 50,000 coins at once.',s=>s.coins>=50000,3000,2],
  ['q14','Monster Bookworm','Discover 20 unique forms.',s=>Object.keys(s.discovered).length>=20,2800,3],
  ['q15','Half the World','Own 20 Chordlings total.',s=>totalOwned(s)>=20,3000,3],
  ['q16','Massive Chorus','Own 30 Chordlings total.',s=>totalOwned(s)>=30,5000,4],
  ['q17','Maximum Ensemble','Own 40 Chordlings total.',s=>totalOwned(s)>=40,8000,5],
  ['q18','Seasoned Singer','Raise 5 monsters to level 5.',s=>allOwned(s).filter(x=>x.level>=5).length>=5,4000,3],
  ['q19','Star Student','Earn 20 stars.',s=>s.stars>=20,2500,2],
  ['q20','Orchestra Master','Discover 40 unique forms.',s=>Object.keys(s.discovered).length>=40,10000,8]
].map(([id,title,desc,check,coins,gems])=>({id,title,desc,check,coins,gems}));

function defaultState(){
  const starter = {uid:uid(),id:'mossmara',rarity:'Common',level:1,lastCollect:now(),x:22,y:54};
  return {
    version:2, coins:650, gems:8, stars:0, currentIsland:'verdant', unlocked:['verdant'],
    owned:{verdant:[starter],ember:[],tidal:[],astral:[]},
    discovered:{'mossmara|Common':true}, breeding:null, nursery:null,
    questClaims:{}, settings:{music:true,sfx:true,reduceMotion:false},
    stats:{breeds:0,hatches:0,coinsCollected:0,memoryWins:0,rushPlays:[]},
    lastGift:0, giftStreak:0, lastSeen:now(), lastSave:now()
  };
}

function normalizeState(s){
  const d=defaultState();
  s={...d,...s};
  s.owned={...d.owned,...(s.owned||{})};
  for(const i of islands) if(!Array.isArray(s.owned[i.id])) s.owned[i.id]=[];
  s.discovered=s.discovered||{}; s.unlocked=s.unlocked||['verdant'];
  s.settings={...d.settings,...(s.settings||{})}; s.stats={...d.stats,...(s.stats||{})};
  if(!Array.isArray(s.stats.rushPlays)) s.stats.rushPlays=[];
  return s;
}

let state;
try{state=normalizeState(JSON.parse(localStorage.getItem('chordlingsSaveV2'))||defaultState())}catch{state=defaultState()}

function save(){state.lastSeen=now();state.lastSave=now();localStorage.setItem('chordlingsSaveV2',JSON.stringify(state));}
function allOwned(s=state){return Object.values(s.owned).flat()}
function totalOwned(s=state){return allOwned(s).length}
function ownedOn(s,id){return (s.owned[id]||[]).length}
function discoveredCount(){return Object.keys(state.discovered).length}
function getOwned(uidv){return allOwned().find(x=>x.uid===uidv)}
function calcRate(o){const m=monsterById[o.id];return m?m.income*RARITIES[o.rarity].coin*(1+(o.level-1)*.22):0}
function capacity(o){return 60+o.level*35+RARITIES[o.rarity].mult*30}
function pendingCoins(o,t=now()){return Math.floor(Math.min(capacity(o),(t-(o.lastCollect||t))/1000/60*calcRate(o)))}
function collectMonster(o){const n=pendingCoins(o);if(n>0){state.coins+=n;state.stats.coinsCollected+=n;o.lastCollect=now();save()}return n}
function collectAll(){let n=0;for(const o of state.owned[state.currentIsland]) n+=collectMonster(o);toast(n?`Collected ${fmt(n)} coins!`:'No coins ready yet.');renderTop();renderScene()}

function maxWaitSeconds(m,rarity){
  // m.breed is a design weight; result is capped at 60 minutes TOTAL from Breed to Hatch.
  const tier=clamp(m.breed/1700,0,1);
  const total=Math.round((25 + tier*1500) * RARITIES[rarity].wait);
  return clamp(total,20,3600);
}
function splitWait(total){const breed=Math.max(10,Math.round(total*.62));return {breed,hatch:Math.max(5,total-breed)}}
function skipCost(ms){const min=Math.ceil(ms/60000);return min<5?1:min<8?2:3}
function rarityRoll(a,b){
  const bonus=((a?.level||1)+(b?.level||1)-2)*0.35;
  const r=Math.random()*100;
  if(r<2+bonus*.15) return 'Legendary';
  if(r<10+bonus*.35) return 'Epic';
  if(r<30+bonus*.6) return 'Rare';
  return 'Common';
}
function breedPool(a,b,islandId){
  const ma=monsterById[a.id], mb=monsterById[b.id];
  const elems=new Set([...(ma?.elements||[]),...(mb?.elements||[])]);
  const pool=monsters.filter(m=>m.island===islandId && m.elements.every(e=>elems.has(e)));
  if(!pool.length) return [ma,mb].filter(Boolean);
  const exact=pool.filter(m=>m.elements.length>=Math.max(ma.elements.length,mb.elements.length));
  return exact.length?exact:pool;
}
function chooseWeighted(arr){
  const weighted=arr.flatMap(m=>Array(Math.max(1,12-m.elements.length*2)).fill(m));
  return weighted[Math.floor(Math.random()*weighted.length)];
}

function processTimers(){
  const t=now();
  if(state.breeding && t>=state.breeding.end){
    if(!state.nursery){
      state.nursery={id:state.breeding.resultId,rarity:state.breeding.rarity,end:t+state.breeding.hatchSec*1000,totalSec:state.breeding.hatchSec};
      state.breeding=null; save(); toast('Breeding finished — egg moved to Nursery!');
    }
  }
  if(state.nursery && t>=state.nursery.end){ /* waits for tap to hatch */ }
  renderTimersOnly();
}

class AudioEngine{
  constructor(){this.ctx=null;this.master=null;this.timer=null;this.step=0}
  ensure(){
    if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=.12;this.master.connect(this.ctx.destination)}
    if(this.ctx?.state==='suspended')this.ctx.resume();
  }
  tone(freq=440,dur=.15,type='sine',vol=.1,when=0){
    if(!state.settings.music&&!state.settings.sfx)return;this.ensure();if(!this.ctx)return;
    const t=this.ctx.currentTime+when,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.02)
  }
  hit(kind,step=0){if(!state.settings.music)return;const n=[261.6,293.7,329.6,392,440,523.3][step%6];const map={
    pluck:[n,.12,'triangle'],click:[1000,.03,'square'],bell:[n*2,.35,'sine'],hat:[2500,.035,'square'],hum:[n/2,.38,'sine'],bass:[n/4,.2,'sawtooth'],chirp:[n*2.5,.1,'sine'],kick:[70,.11,'sine'],choir:[n,.5,'triangle'],grand:[n/2,.45,'sawtooth'],
    pop:[n*1.5,.06,'square'],clank:[400,.08,'square'],whoosh:[120,.25,'sawtooth'],brass:[n/2,.24,'square'],tick:[1300,.025,'square'],tom:[120,.16,'sine'],gong:[n/2,.55,'sine'],horn:[n/2,.34,'sawtooth'],choir2:[n*.75,.5,'triangle'],mega:[n/4,.5,'sawtooth'],
    bubble:[n*2,.08,'sine'],snap:[800,.04,'square'],keys:[n*1.25,.16,'triangle'],toot:[n,.16,'square'],wave:[90,.3,'sine'],marimba:[n,.1,'sine'],rattle:[1800,.03,'square'],vox:[n*.7,.4,'triangle'],pad:[n,.65,'sine'],ocean:[65,.6,'sawtooth'],
    bleep:[n*2,.07,'square'],orbit:[n*1.5,.18,'sine'],dream:[n*.75,.6,'sine'],prism:[n*2,.3,'triangle'],sub:[55,.25,'sine'],ring:[n*2.2,.4,'sine'],softkick:[80,.12,'sine'],lead:[n*1.4,.25,'sawtooth'],void:[48,.5,'sine'],cosmos:[n,.7,'triangle']};
    const p=map[kind]||[n,.1,'sine'];this.tone(...p,.08)
  }
  start(){this.ensure();this.stop();this.timer=setInterval(()=>{if(!state.settings.music)return;const list=state.owned[state.currentIsland]||[];if(!list.length)return;const beat=this.step++;list.slice(0,12).forEach((o,i)=>{if((beat+i)%Math.max(2,5-(i%4))===0)this.hit(monsterById[o.id]?.sound,beat+i)});animateNotes()},500)}
  stop(){if(this.timer)clearInterval(this.timer);this.timer=null}
  sfx(freq=660){if(!state.settings.sfx)return;this.tone(freq,.08,'sine',.08)}
}
const audio=new AudioEngine();

function animateNotes(){
  const cards=$$('.monster');if(!cards.length)return;const el=cards[Math.floor(Math.random()*cards.length)];
  const n=document.createElement('span');n.className='note';n.textContent=['♪','♫','♩'][Math.floor(Math.random()*3)];n.style.left=(el.offsetLeft+35)+'px';n.style.top=(el.offsetTop+25)+'px';$('#monsterLayer').appendChild(n);setTimeout(()=>n.remove(),1250)
}

function renderTop(){
  $('#coins').textContent=fmt(state.coins);$('#gems').textContent=fmt(state.gems);$('#stars').textContent=fmt(state.stars);
  $('#islandLabel').textContent=islands.find(i=>i.id===state.currentIsland)?.name||'';
}
function renderScene(){
  const isl=islands.find(i=>i.id===state.currentIsland);$('#islandScene').style.background=isl.gradient;
  document.documentElement.style.setProperty('--islandAccent',isl.accent);
  const layer=$('#monsterLayer'); layer.innerHTML='';
  const list=state.owned[state.currentIsland];
  list.forEach((o,idx)=>{
    const m=monsterById[o.id];if(!m)return;
    if(o.x==null)o.x=12+(idx*17)%78;if(o.y==null)o.y=28+(idx*11)%36;
    const el=document.createElement('button');el.className=`monster ${RARITIES[o.rarity].cls}`;el.style.left=`${o.x}%`;el.style.top=`${o.y}%`;el.style.setProperty('--c1',m.colors[0]);el.style.setProperty('--c2',m.colors[1]);el.style.setProperty('--beat',`${.7+(idx%5)*.13}s`);
    el.innerHTML=`<span class="body"><span class="face">${m.emoji}</span></span><span class="name">${esc(m.name)} · L${o.level}</span>`;
    el.onclick=()=>openMonster(o.uid);layer.appendChild(el)
  });
  if(list.length===0){layer.innerHTML='<div class="emptyIsland">This island is quiet.<br><b>Breed or buy a Chordling to start the song.</b></div>'}
  $('#skyFX').innerHTML='<i class="cloud" style="top:14%;animation-delay:-8s"></i><i class="cloud" style="top:29%;animation-delay:-19s;transform:scale(.7)"></i>';
  renderTimersOnly();
}
function renderTimersOnly(){
  const t=now();
  if(state.breeding){$('#breederText').textContent=t>=state.breeding.end?'Finished!':timeText(state.breeding.end-t)}else $('#breederText').textContent='Ready';
  if(state.nursery){$('#nurseryText').textContent=t>=state.nursery.end?'Hatch!':timeText(state.nursery.end-t)}else $('#nurseryText').textContent='Empty';
}
function render(){renderTop();renderScene()}

function modal(html){$('#modalContent').innerHTML=html;$('#modal').classList.remove('hidden')}
function closeModal(){ $('#modal').classList.add('hidden') }
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2100)}

function openIslands(){
  modal(`<h2>Islands</h2><p class="sub">Build four completely different songs. Unlock prices use coins only.</p><div class="grid">${islands.map(i=>{
    const unlocked=state.unlocked.includes(i.id),active=state.currentIsland===i.id;
    return `<div class="card"><div class="islandBadge" style="background:${i.gradient}">${i.icon}</div><strong>${i.name}</strong><small>${i.desc}</small><small>${ownedOn(state,i.id)} monsters</small>${unlocked?`<button data-visit="${i.id}" ${active?'disabled':''}>${active?'Here now':'Visit'}</button>`:`<button data-unlock="${i.id}">Unlock · 🪙 ${fmt(i.unlock)}</button>`}</div>`}).join('')}</div>`);
  $$('[data-visit]').forEach(b=>b.onclick=()=>{state.currentIsland=b.dataset.visit;save();closeModal();render();audio.start()});
  $$('[data-unlock]').forEach(b=>b.onclick=()=>{const i=islands.find(x=>x.id===b.dataset.unlock);if(state.coins<i.unlock)return toast('Not enough coins.');state.coins-=i.unlock;state.unlocked.push(i.id);state.currentIsland=i.id;state.stars++;save();closeModal();render();audio.start();toast(`${i.name} unlocked!`)})
}

function variantPrice(m,r){return Math.round(m.base*RARITIES[r].mult)}
function openMarket(){
  const available=monsters.filter(m=>m.island===state.currentIsland);
  modal(`<h2>Market</h2><p class="sub">Buy Common eggs instantly. Rare forms are mainly bred, but the Daily Spark can roll one random premium egg.</p><div class="marketTools"><button id="dailySpark" class="bigBtn">✨ Daily Spark · 3 Gems</button><button id="collectAll" class="bigBtn secondary">🪙 Collect All Coins</button></div><div class="grid">${available.map(m=>`<div class="card"><strong>${m.emoji} ${m.name}</strong><small>${m.elements.join(' · ')}</small><small>Base song: ${m.sound}</small><button data-buy="${m.id}">Buy Egg · 🪙 ${fmt(m.base)}</button></div>`).join('')}</div>`);
  $$('[data-buy]').forEach(b=>b.onclick=()=>buyEgg(b.dataset.buy));
  $('#collectAll').onclick=()=>{collectAll();openMarket()};$('#dailySpark').onclick=dailySpark
}
function buyEgg(id){
  if(state.nursery)return toast('Nursery is already occupied.');const m=monsterById[id];if(state.coins<m.base)return toast('Not enough coins.');
  state.coins-=m.base;const total=maxWaitSeconds(m,'Common');const hatch=Math.max(10,Math.round(total*.38));state.nursery={id,rarity:'Common',end:now()+hatch*1000,totalSec:hatch};save();render();openNursery();toast(`${m.name} egg sent to Nursery.`)
}
function dailySpark(){
  if(state.nursery)return toast('Nursery is already occupied.');if(state.gems<3)return toast('You need 3 gems.');state.gems-=3;
  const pool=monsters.filter(m=>m.island===state.currentIsland);const m=pool[Math.floor(Math.random()*pool.length)];const r=Math.random()<.1?'Epic':'Rare';const hatch=splitWait(maxWaitSeconds(m,r)).hatch;state.nursery={id:m.id,rarity:r,end:now()+hatch*1000,totalSec:hatch};save();render();openNursery();toast(`${r} ${m.name} egg!`)
}

function ownedOptions(){return state.owned[state.currentIsland].map(o=>{const m=monsterById[o.id];return `<option value="${o.uid}">${m.name} · ${o.rarity} · L${o.level}</option>`}).join('')}
function openBreed(){
  const list=state.owned[state.currentIsland];
  if(state.breeding)return openBreeder();
  if(list.length<2)return modal(`<h2>Harmony Hut</h2><p class="sub">You need at least 2 Chordlings on this island before you can breed.</p><button class="bigBtn" id="toMarket">Open Market</button>`),$('#toMarket').onclick=()=>openMarket();
  modal(`<h2>Harmony Hut</h2><p class="sub">Pick two parents. Combined elements affect the result. Better parent levels slightly improve premium rarity odds.</p><div class="pair"><label class="selectMonster">Parent A<select id="parentA">${ownedOptions()}</select></label><label class="selectMonster">Parent B<select id="parentB">${ownedOptions()}</select></label></div><div id="breedPreview" class="gameBox"></div><button id="breedGo" class="bigBtn">💞 Breed</button><p class="credits">Every result is designed so the entire Breed → Hatch journey is at most 60 minutes.</p>`);
  const a=$('#parentA'),b=$('#parentB');if(list[1])b.value=list[1].uid;const preview=()=>{const oa=getOwned(a.value),ob=getOwned(b.value);if(!oa||!ob)return;const elems=[...new Set([...monsterById[oa.id].elements,...monsterById[ob.id].elements])];const pool=breedPool(oa,ob,state.currentIsland);$('#breedPreview').innerHTML=`<b>Combined elements:</b> ${elems.join(' · ')}<br><small>Possible family: ${pool.map(x=>x.name).join(', ')}</small>`};a.onchange=preview;b.onchange=preview;preview();
  $('#breedGo').onclick=()=>startBreed(a.value,b.value)
}
function startBreed(aid,bid){
  if(aid===bid)return toast('Pick two different individual monsters.');if(state.breeding)return toast('Harmony Hut is busy.');
  const a=getOwned(aid),b=getOwned(bid);if(!a||!b)return;const result=chooseWeighted(breedPool(a,b,state.currentIsland));const rarity=rarityRoll(a,b);const parts=splitWait(maxWaitSeconds(result,rarity));
  state.breeding={a:aid,b:bid,resultId:result.id,rarity,end:now()+parts.breed*1000,totalSec:parts.breed,hatchSec:parts.hatch};state.stats.breeds++;save();render();openBreeder();audio.sfx(520)
}
function openBreeder(){
  if(!state.breeding)return openBreed();const j=state.breeding, left=j.end-now(), done=left<=0,m=monsterById[j.resultId];
  modal(`<h2>Harmony Hut</h2><p class="sub">The result is hidden until breeding completes.</p><div class="timer">${done?'READY!':timeText(left)}</div><div class="progress"><i style="width:${clamp(100-(left/(j.totalSec*1000))*100,0,100)}%"></i></div>${done?`<button id="moveEgg" class="bigBtn">Move Egg to Nursery</button>`:`<button id="skipBreed" class="bigBtn">Finish Now · 💎 ${skipCost(left)}</button>`}<button id="cancelBreed" class="bigBtn secondary">Cancel Breeding</button><p class="credits">Potential hatch after this stage: ${timeText(j.hatchSec*1000)}. Total original timer never exceeds 60 minutes.</p>`);
  if(done)$('#moveEgg').onclick=()=>{if(state.nursery)return toast('Nursery is occupied.');state.nursery={id:j.resultId,rarity:j.rarity,end:now()+j.hatchSec*1000,totalSec:j.hatchSec};state.breeding=null;save();render();openNursery()};
  else $('#skipBreed').onclick=()=>skipJob('breeding');
  $('#cancelBreed').onclick=()=>{state.breeding=null;save();render();closeModal();toast('Breeding canceled.')}
}
function openNursery(){
  if(!state.nursery)return modal(`<h2>Nursery</h2><p class="sub">No egg is waiting right now.</p><button class="bigBtn" id="nurseryMarket">Find an Egg</button>`),$('#nurseryMarket').onclick=openMarket;
  const j=state.nursery,m=monsterById[j.id],left=j.end-now(),done=left<=0;
  modal(`<h2>Nursery</h2><div class="eggHero">🥚</div><h3>${done?`${j.rarity} ${m.name}`:'Mystery Egg'}</h3><div class="timer">${done?'READY TO HATCH':timeText(left)}</div><div class="progress"><i style="width:${clamp(100-(left/(j.totalSec*1000))*100,0,100)}%"></i></div>${done?`<button id="hatchGo" class="bigBtn">🐣 Hatch ${m.name}</button>`:`<button id="skipHatch" class="bigBtn">Finish Now · 💎 ${skipCost(left)}</button>`}`);
  if(done)$('#hatchGo').onclick=hatchEgg;else $('#skipHatch').onclick=()=>skipJob('nursery')
}
function skipJob(kind){
  const j=state[kind];if(!j)return;const cost=skipCost(j.end-now());if(state.gems<cost)return toast(`You need ${cost} gems.`);state.gems-=cost;j.end=now();save();render();kind==='breeding'?openBreeder():openNursery();audio.sfx(780)
}
function hatchEgg(){
  const j=state.nursery;if(!j||now()<j.end)return;const m=monsterById[j.id];const count=state.owned[state.currentIsland].length;
  const o={uid:uid(),id:j.id,rarity:j.rarity,level:1,lastCollect:now(),x:10+(count*19)%80,y:28+(count*13)%35};state.owned[state.currentIsland].push(o);state.discovered[`${j.id}|${j.rarity}`]=true;state.nursery=null;state.stats.hatches++;state.stars+=j.rarity==='Legendary'?3:j.rarity==='Epic'?2:1;save();closeModal();render();audio.sfx(880);toast(`${j.rarity} ${m.name} joined the song!`)
}

function openMonster(uidv){
  const o=getOwned(uidv),m=monsterById[o.id];if(!o||!m)return;const coins=pendingCoins(o);const feedCost=Math.round((m.base/9)*(1+o.level*.4));
  modal(`<h2>${m.emoji} ${m.name}</h2><p class="rarity ${o.rarity}">${o.rarity} · Level ${o.level}</p><p>${m.bio}</p><div class="gameBox"><b>Elements:</b> ${m.elements.join(' · ')}<br><b>Coins/min:</b> ${calcRate(o).toFixed(1)}<br><b>Stored:</b> 🪙 ${fmt(coins)} / ${fmt(capacity(o))}</div><button id="collectOne" class="bigBtn">Collect · 🪙 ${fmt(coins)}</button><button id="feedOne" class="bigBtn">Feed to Level ${o.level+1} · 🪙 ${fmt(feedCost)}</button><button id="soloOne" class="bigBtn secondary">Hear Solo</button>`);
  $('#collectOne').onclick=()=>{const n=collectMonster(o);renderTop();openMonster(uidv);toast(n?`+${fmt(n)} coins`:'Nothing ready yet.')};
  $('#feedOne').onclick=()=>{if(o.level>=15)return toast('Maximum level is 15.');if(state.coins<feedCost)return toast('Not enough coins.');state.coins-=feedCost;o.level++;save();render();openMonster(uidv);audio.sfx(700)};
  $('#soloOne').onclick=()=>{audio.ensure();audio.hit(m.sound,Math.floor(Math.random()*8))}
}

function openBook(){
  const filter=monsters.filter(m=>m.island===state.currentIsland);
  modal(`<h2>Monster Book</h2><p class="sub">${discoveredCount()} / ${monsters.length*4} forms discovered across all rarities.</p><div class="grid">${filter.map(m=>{const forms=rarityOrder.map(r=>state.discovered[`${m.id}|${r}`]?`<span class="rarity ${r}">${r}</span>`:`<span class="dim">????</span>`).join(' · ');return `<div class="card"><strong>${m.emoji} ${m.name}</strong><small>${m.elements.join(' · ')}</small><small>${forms}</small><small>${m.bio}</small></div>`}).join('')}</div>`)
}
function openQuests(){
  modal(`<h2>Quests</h2><p class="sub">Permanent goals — no multi-day timers.</p>${questDefs.map(q=>{const done=q.check(state),claimed=state.questClaims[q.id];return `<div class="questRow"><header><b>${q.title}</b><span>${claimed?'✅':done?'🎁':'⬜'}</span></header><small>${q.desc}</small><div>Reward: 🪙 ${fmt(q.coins)} + 💎 ${q.gems}</div>${done&&!claimed?`<button class="bigBtn" data-claim="${q.id}">Claim</button>`:''}</div>`}).join('')}`);
  $$('[data-claim]').forEach(b=>b.onclick=()=>{const q=questDefs.find(x=>x.id===b.dataset.claim);if(!q||state.questClaims[q.id]||!q.check(state))return;state.questClaims[q.id]=true;state.coins+=q.coins;state.gems+=q.gems;state.stars++;save();renderTop();openQuests();toast('Quest reward claimed!')})
}

function cleanRushHistory(){state.stats.rushPlays=state.stats.rushPlays.filter(t=>now()-t<3600000)}
function openGames(){
  cleanRushHistory();const remaining=5-state.stats.rushPlays.length;
  modal(`<h2>Mini-Games</h2><p class="sub">Earn extra currency while your eggs cook.</p><div class="gameBox"><h3>⚡ Coin Rush</h3><p>10 seconds. Tap the coin as many times as possible. ${remaining}/5 plays left this hour.</p><button id="rushStart" class="bigBtn" ${remaining<=0?'disabled':''}>Start Coin Rush</button></div><div class="gameBox"><h3>🧠 Echo Memory</h3><p>Match eight pairs of Chordling symbols for coins and a chance at a gem.</p><button id="memoryStart" class="bigBtn">Start Echo Memory</button></div><div class="gameBox"><h3>🎛️ Beat Echo</h3><p>Watch the glowing pads, then repeat the pattern. Each round adds one note.</p><button id="echoStart" class="bigBtn">Start Beat Echo</button></div><div class="gameBox"><h3>🎹 Jam Pad</h3><p>Tap notes and improvise over your island.</p><div class="jam">${[261.6,293.7,329.6,349.2,392,440,493.9,523.3].map((f,i)=>`<button data-note="${f}">${['C','D','E','F','G','A','B','C'][i]}</button>`).join('')}</div></div>`);
  if(remaining>0)$('#rushStart').onclick=startRush;$('#memoryStart').onclick=startMemory;$('#echoStart').onclick=startBeatEcho;$$('[data-note]').forEach(b=>b.onclick=()=>{audio.ensure();audio.tone(+b.dataset.note,.25,'triangle',.12);haptic(8)})
}
function startRush(){
  cleanRushHistory();if(state.stats.rushPlays.length>=5)return toast('5 plays per hour reached.');state.stats.rushPlays.push(now());save();let taps=0,sec=10;
  modal(`<h2>Coin Rush</h2><div class="timer" id="rushTime">10</div><button id="rushCoin" class="rushCoin">🪙</button><h3 id="rushScore">0 taps</h3>`);const btn=$('#rushCoin');btn.onclick=()=>{taps++;$('#rushScore').textContent=`${taps} taps`;btn.style.transform=`translate(${Math.random()*120-60}px,${Math.random()*80-40}px) scale(${.85+Math.random()*.3})`;audio.sfx(800+Math.random()*250);haptic(6)};
  const iv=setInterval(()=>{sec--;if($('#rushTime'))$('#rushTime').textContent=sec;if(sec<=0){clearInterval(iv);const reward=80+taps*18;state.coins+=reward;state.stars+=taps>=25?1:0;save();modal(`<h2>Coin Rush Complete!</h2><div class="timer">${taps} taps</div><p>You earned 🪙 ${fmt(reward)}${taps>=25?' and ⭐ 1!':''}</p><button class="bigBtn" id="gamesBack">Back to Games</button>`);$('#gamesBack').onclick=openGames;renderTop()}},1000)
}
function startMemory(){
  const symbols=['🌱','🔥','🫧','⭐','🔔','🐚','💎','🥁'];const deck=[...symbols,...symbols].sort(()=>Math.random()-.5);let open=[],matched=0,moves=0,lock=false;
  modal(`<h2>Echo Memory</h2><p id="memoryInfo">Moves: 0</p><div class="memoryGrid">${deck.map((x,i)=>`<button data-mem="${i}" data-val="${x}">?</button>`).join('')}</div>`);
  $$('[data-mem]').forEach(b=>b.onclick=()=>{if(lock||b.classList.contains('matched')||open.includes(b))return;b.classList.add('open');b.textContent=b.dataset.val;open.push(b);audio.sfx(520+open.length*80);if(open.length===2){moves++;$('#memoryInfo').textContent=`Moves: ${moves}`;if(open[0].dataset.val===open[1].dataset.val){open.forEach(x=>x.classList.add('matched'));open=[];matched+=2;if(matched===16){const reward=Math.max(250,900-moves*18);state.coins+=reward;if(moves<=12||Math.random()<.25)state.gems++;state.stats.memoryWins++;save();setTimeout(()=>{modal(`<h2>Memory Cleared!</h2><p>You finished in ${moves} moves and earned 🪙 ${fmt(reward)}${moves<=12?' + 💎 1':''}.</p><button class="bigBtn" id="gamesBack">Back to Games</button>`);$('#gamesBack').onclick=openGames;renderTop()},350)}}else{lock=true;setTimeout(()=>{open.forEach(x=>{x.classList.remove('open');x.textContent='?'});open=[];lock=false},650)}}})
}

function startBeatEcho(){
  const freqs=[261.6,329.6,392,523.3], icons=['🌿','🔥','🌊','⭐'];
  let sequence=[], input=[], round=0, showing=false, finished=false;
  const paint=()=>modal(`<h2>Beat Echo</h2><p class="sub" id="echoInfo">Round ${round+1}</p><div class="echoPads">${icons.map((x,i)=>`<button data-echo="${i}">${x}</button>`).join('')}</div><p class="credits">Watch first. Then repeat the pattern exactly.</p>`);
  const flash=(i,delay=0)=>setTimeout(()=>{const b=document.querySelector(`[data-echo="${i}"]`);if(!b)return;b.classList.add('lit');audio.ensure();audio.tone(freqs[i],.22,'triangle',.12);haptic(10);setTimeout(()=>b.classList.remove('lit'),240)},delay);
  const showSequence=()=>{
    showing=true; input=[]; $('#echoInfo').textContent=`Round ${round+1} · listen...`;
    sequence.forEach((v,i)=>flash(v,450+i*520));
    setTimeout(()=>{showing=false;if($('#echoInfo'))$('#echoInfo').textContent=`Round ${round+1} · your turn`;},450+sequence.length*520);
  };
  const next=()=>{round++;sequence.push(Math.floor(Math.random()*4));paint();$$('[data-echo]').forEach(b=>b.onclick=()=>{
    if(showing||finished)return;const v=+b.dataset.echo;flash(v);input.push(v);const idx=input.length-1;
    if(input[idx]!==sequence[idx]){finished=true;const reward=Math.max(100,round*180);state.coins+=reward;if(round>=5){state.gems++;state.stars++;}save();setTimeout(()=>{modal(`<h2>Beat Echo Complete</h2><p>You reached round ${round} and earned 🪙 ${fmt(reward)}${round>=5?' + 💎 1 + ⭐ 1':''}.</p><button class="bigBtn" id="gamesBack">Back to Games</button>`);$('#gamesBack').onclick=openGames;renderTop()},300);return;}
    if(input.length===sequence.length){if(round>=8){finished=true;const reward=2200;state.coins+=reward;state.gems+=2;state.stars+=2;save();setTimeout(()=>{modal(`<h2>Perfect Echo!</h2><p>You cleared all 8 rounds: 🪙 2,200 + 💎 2 + ⭐ 2.</p><button class="bigBtn" id="gamesBack">Back to Games</button>`);$('#gamesBack').onclick=openGames;renderTop()},350);}else setTimeout(next,550);}
  });showSequence()};
  sequence.push(Math.floor(Math.random()*4));paint();$$('[data-echo]').forEach(b=>b.onclick=()=>{});
  // Repaint once through next() logic while preserving round numbering.
  round=-1; sequence=[]; next();
}

function openDailyGift(){
  const day=24*60*60*1000, left=Math.max(0,(state.lastGift||0)+day-now());
  const ready=left<=0;
  modal(`<h2>Daily Gift</h2><div class="eggHero">🎁</div><p class="sub">A free reward every 24 hours. Missed days do not punish your save.</p>${ready?`<button id="claimGift" class="bigBtn">Open Gift</button>`:`<div class="timer">${timeText(left)}</div><p>Come back when the timer reaches zero.</p>`}`);
  if(ready)$('#claimGift').onclick=()=>{
    const previous=state.lastGift||0;const kept=previous&&now()-previous<day*2.2;state.giftStreak=kept?(state.giftStreak||0)+1:1;state.lastGift=now();
    const coins=350+state.giftStreak*120, gems=state.giftStreak%5===0?2:1;state.coins+=coins;state.gems+=gems;if(state.giftStreak%3===0)state.stars++;
    save();renderTop();modal(`<h2>Gift Opened!</h2><p>Day ${state.giftStreak} streak reward:</p><div class="timer">🪙 ${fmt(coins)} · 💎 ${gems}${state.giftStreak%3===0?' · ⭐ 1':''}</div><button class="bigBtn" id="giftDone">Nice!</button>`);$('#giftDone').onclick=closeModal;haptic(25)
  }
}

function openSettings(){
  modal(`<h2>Settings</h2><label class="switch"><span>Island music</span><input id="musicSet" type="checkbox" ${state.settings.music?'checked':''}></label><label class="switch"><span>Sound effects</span><input id="sfxSet" type="checkbox" ${state.settings.sfx?'checked':''}></label><label class="switch"><span>Reduce motion</span><input id="motionSet" type="checkbox" ${state.settings.reduceMotion?'checked':''}></label><div class="gameBox"><b>Save</b><p>Your game saves automatically to this browser/device.</p><button id="exportSave" class="bigBtn secondary">Copy Save Backup</button><button id="importSave" class="bigBtn secondary">Import Save Backup</button></div><div class="gameBox"><b>About</b><p>Chordlings: Island Orchestra is an original browser game inspired by the musical-monster collection genre. All names, creatures, code, visuals, and generated sounds in this project are original.</p></div><button id="resetSave" class="bigBtn danger">Reset Game</button>`);
  $('#musicSet').onchange=e=>{state.settings.music=e.target.checked;save();e.target.checked?audio.start():audio.stop()};$('#sfxSet').onchange=e=>{state.settings.sfx=e.target.checked;save()};$('#motionSet').onchange=e=>{state.settings.reduceMotion=e.target.checked;document.body.classList.toggle('reduceMotion',e.target.checked);save()};
  $('#exportSave').onclick=async()=>{const data=btoa(unescape(encodeURIComponent(JSON.stringify(state))));try{await navigator.clipboard.writeText(data);toast('Save copied!')}catch{prompt('Copy this save backup:',data)}};
  $('#importSave').onclick=()=>{const data=prompt('Paste your save backup:');if(!data)return;try{state=normalizeState(JSON.parse(decodeURIComponent(escape(atob(data)))));save();closeModal();render();toast('Save imported!')}catch{toast('That backup could not be read.')}};
  $('#resetSave').onclick=()=>{if(confirm('Reset ALL Chordlings progress on this device?')){state=defaultState();save();closeModal();render();toast('Fresh island started.')}}
}

function offlineProgress(){
  const elapsed=now()-(state.lastSeen||now());if(elapsed<60000)return;
  let total=0;for(const o of allOwned()){const n=pendingCoins(o);if(n){total+=n;state.coins+=n;state.stats.coinsCollected+=n;o.lastCollect=now()}}
  if(total){save();setTimeout(()=>toast(`Welcome back! Your islands made ${fmt(total)} coins.`),700)}
}

function bind(){
  $('#startBtn').onclick=()=>{$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');audio.ensure();audio.start();render();offlineProgress()};
  $('#closeModal').onclick=closeModal;$('#modal').onclick=e=>{if(e.target===$('#modal'))closeModal()};
  $('#giftBtn').onclick=openDailyGift;$('#settingsBtn').onclick=openSettings;$('#marketBtn').onclick=openMarket;$('#breederBtn').onclick=openBreeder;$('#nurseryBtn').onclick=openNursery;
  $$('.bottomNav button').forEach(b=>b.onclick=()=>({islands:openIslands,book:openBook,breed:openBreed,quests:openQuests,games:openGames}[b.dataset.panel]?.()));
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();else{processTimers();render()}});
  window.addEventListener('beforeunload',save);
}

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
document.body.classList.toggle('reduceMotion',state.settings.reduceMotion);
bind();render();processTimers();setInterval(processTimers,1000);setInterval(save,15000);

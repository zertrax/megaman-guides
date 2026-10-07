const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const files=['index.html','x1/index.html','x2/index.html','x3/index.html','x4/index.html','x4/zero.html','x5/index.html','x6/index.html','x7/index.html','x8/index.html'];
const campaignIds=fs.readdirSync('src/campaigns').filter(f=>f.endsWith('.json')).map(f=>f.slice(0,-5));
const identity=require('../src/game-info.json');
const previousVersion=JSON.parse(fs.readFileSync('dist/previous/version.json','utf8'));
assert.equal(previousVersion.revision,require('./build-previous.cjs').revision,'Previous public version must remain pinned');
for(const file of files){
 const archived='previous/'+file;
 const html=fs.readFileSync('dist/'+archived,'utf8');
 const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
 for(const [,raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(/^(https?:|mailto:)/.test(raw))continue;
  if(raw.startsWith('#')){assert(ids.includes(raw.slice(1)),`Broken archive anchor ${archived}${raw}`);continue;}
  let resolved=path.join('dist',path.dirname(archived),raw.split(/[?#]/)[0]);
  if(fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');
  assert(fs.existsSync(resolved),`Missing archive asset ${archived} -> ${raw}`);
 }
}
assert(fs.readFileSync('dist/previous/guide.js','utf8').includes('field-guide-previous:'),'Previous reading state needs its own namespace');
assert(!fs.readFileSync('dist/previous/index.html','utf8').includes('class="game-entry"'),'Previous presentation must remain unchanged');
console.log('PASS previous public version: pinned source, 9 campaigns, page/assets links and separate reading state.');
for(const art of require('../src/library-art.json')){assert(art.source&&art.credit&&art.width>0&&art.height>0,'Banner artwork needs attribution and dimensions');assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('src/'+art.src)).digest('hex'),art.sha256,'Banner artwork provenance');}
assert.equal(campaignIds.length,27,'Expected 11 Classic, 6 Zero/ZX and 10 Battle Network campaigns');
files.push(...campaignIds.map(id=>id+'/index.html'));
for(const file of files){
 const html=fs.readFileSync('dist/'+file,'utf8'),ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`Duplicate IDs in ${file}`);
 assert(!html.includes('${'),'Unresolved template expression');assert(!/<iframe/i.test(html),'Video must not load before a click');
 for(const [,raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(/^(https?:|mailto:)/.test(raw))continue;
  if(raw.startsWith('#')){assert(ids.includes(raw.slice(1)),`Broken ${file}${raw}`);continue;}
  const ref=raw.split(/[?#]/)[0];let resolved=path.join('dist',path.dirname(file),ref);if(fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');assert(fs.existsSync(resolved),`Missing ${file} -> ${ref}`);
 }
 if(file==='index.html'){
  assert.equal((html.match(/class="game-entry"/g)||[]).length,36,'Library must link all campaigns');
  assert.equal((html.match(/data-game-complete=/g)||[]).length,36,'Every game needs an independent completion control');
  assert(!html.includes('Open guide'),'Library links are full cards');
  assert.deepEqual([...html.matchAll(/<section id="([^"]+)" data-progress-group/g)].map(m=>m[1]),['classic','x','zero','network'],'Requested collection order');
  assert.equal((html.match(/class="game-year">\d{4}</g)||[]).length,36,'Each library title needs a plain release year');
  assert.equal((html.match(/class="card-cover"/g)||[]).length,36,'Every card uses its game cover');
  assert(!html.includes('Your Mega Man library')&&!html.includes('library-hint'),'Banner stays limited to the title and collection links');
  for(const [,card] of html.matchAll(/<a class="game-card"[^>]*>([\s\S]*?)<\/a>/g))assert(!/<button|<p>/.test(card),'Cards must have no nested buttons or game descriptions');
  continue;
 }
 const gameId=file==='x4/zero.html'?'x4-zero':file.split('/')[0];
 const progressGame=JSON.parse(fs.readFileSync(`src/${campaignIds.includes(gameId)?'campaigns':'games'}/${gameId}.json`));
 const info=identity.games[gameId];assert(info&&Number.isInteger(info.year)&&info.year>=1987&&info.year<=2018,'Missing original release year: '+gameId);
 assert.equal((html.match(/class="game-cover"/g)||[]).length,1,'One original cover per guide: '+gameId);
 for(const asset of [info.cover,info.cover.preview,info.cover.header]){assert(asset.width>0&&asset.height>0&&fs.existsSync('src/'+asset.src),'Missing cover asset: '+gameId);assert.equal(require('node:crypto').createHash('sha256').update(fs.readFileSync('src/'+asset.src)).digest('hex'),asset.sha256,'Cover provenance hash: '+gameId);}
 assert(html.includes('<span data-completion-label>Completed</span>'),'Simple completion label: '+gameId);
 assert(!html.includes('Mark game complete')&&!html.includes('Mark complete'),'Old button labels removed: '+gameId);
 assert(html.includes('class="flow-progress" hidden><span data-stage-tally>'),'Stage count stays beside the boss flow: '+gameId);
 assert(html.includes(info.cover.source.replaceAll('&','&amp;')),'Missing cover credit: '+gameId);
 const progressStages=[...progressGame.stages,...(progressGame.sideStages||[])];
 assert.deepEqual([...html.matchAll(/data-stage-complete="([^"]+)"/g)].map(m=>m[1]),progressStages.map(s=>s.id),'Progress controls must match the listed stages: '+gameId);
 assert.equal((html.match(/data-game-complete=/g)||[]).length,1,'One manual game completion control: '+gameId);
 if(campaignIds.includes(gameId)){
  const g=JSON.parse(fs.readFileSync(`src/campaigns/${gameId}.json`));
  assert(g.primer.length>=2&&g.routeIntro&&g.stages.length&&g.sections.length,gameId+' needs game-specific guidance');
  assert(g.sources.length>=2,gameId+' needs references');
  for(const s of g.stages){assert(s.tip&&s.name,s.id+' missing directions');for(const p of s.items||[])assert(p.text&&p.need&&p.when,p.id+' incomplete pickup');}
  for(const r of g.returns||[])for(const id of r.items)assert(ids.includes('return-'+id),'Missing return: '+id);
  for(const r of g.extraReturns||[])assert(ids.includes(r.id),'Missing grouped inventory: '+r.id);
  for(const m of [...(g.extraMedia||[]),...g.stages.flatMap(s=>[s.sprite,...(s.items||[]).flatMap(p=>p.media||[])])].filter(Boolean))assert(m.width>0&&m.height>0&&m.source&&m.credit,'Missing campaign media provenance: '+gameId);
  assert(html.includes('data-guide-id="'+gameId+'"')&&html.includes('guide-theme.css'));
  console.log('PASS '+gameId+': '+g.stages.length+' stage/scenario stops; '+ids.length+' valid anchors');continue;
 }
 const g=JSON.parse(fs.readFileSync(`src/games/${gameId}.json`));
 for(const s of [...g.stages,...(g.sideStages||[])]){assert((g.sideStages||[]).includes(s)||(s.sprite&&s.weakness&&s.reward),`Missing boss facts: ${s.id}`);for(const p of s.items){assert(p.media.length||p.video,`Missing pickup media: ${p.id}`);for(const m of p.media)assert(m.width&&m.height&&m.source&&m.credit,`Incomplete provenance: ${p.id}`);}}
 for(const c of g.checkpoints||[])assert(g.stages.some(s=>s.id===c.afterStage),'Invalid checkpoint');
 assert.equal((html.match(/class="return-level"/g)||[]).length,g.returns.length);
 for(const r of g.returns)for(const id of r.items)assert(ids.includes(`return-${id}`),`Missing return card ${id}`);
 console.log(`PASS ${gameId}: 8 bosses; ${[...g.stages,...(g.sideStages||[])].flatMap(s=>s.items).length} pickup locations; ${ids.length} valid anchors`);
}
const x3=JSON.parse(fs.readFileSync('src/games/x3.json'));assert.equal(x3.stages.flatMap(s=>s.items).filter(p=>p.type==='chip'&&p.timing==='skip').length,4);
const zero=JSON.parse(fs.readFileSync('src/games/x4-zero.json'));assert.equal(zero.stages.flatMap(s=>s.items).filter(p=>p.type==='armor').length,0);
assert(zero.stages.find(s=>s.name==='Cyber Peacock').items.every(p=>!p.media.length&&p.video),'Zero must not display X reward-room screenshots');
console.log('PASS: local page/assets links, return disclosures, lazy media, chip exclusions and character-specific pickups.');
const x5=JSON.parse(fs.readFileSync('src/games/x5.json'));
assert.equal(x5.stages.length,8);
for(const suit of ['Falcon','Gaea'])assert.equal(x5.stages.flatMap(s=>s.items).filter(p=>p.type==='armor'&&p.name.startsWith(suit)).length,4,`${suit} needs four programs`);
assert(x5.checkpoints.some(c=>c.afterStage==='firefly'&&c.href==='#return-whale'),'Missing Falcon completion checkpoint');
assert.equal(x5.returns.filter(r=>r.stage==='firefly').length,1,'Firefly return must group both loadouts in one disclosure');
assert(x5.stages.every(s=>s.alias),'X5 requires original English boss aliases');
console.log('PASS x5: both complete armor sets, mid-route Falcon return, grouped Firefly return and boss aliases.');



for(const id of ['x6','x7','x8']) { const g=JSON.parse(fs.readFileSync('src/games/'+id+'.json')); assert.equal(g.stages.length,8); const items=[...g.stages,...(g.sideStages||[])].flatMap(s=>s.items); for(const [type,count] of Object.entries(g.expectedCounts))assert.equal(items.filter(p=>p.type===type).length,count,id+' '+type); }
const x8=JSON.parse(fs.readFileSync('src/games/x8.json'));assert.equal(x8.sideStages.length,1);assert.equal(x8.sideStages[0].items.length,3);assert.equal(x8.stages.find(s=>s.id==='manowar').items.length,0);assert(x8.returns.some(r=>r.stage==='noah'));
assert(fs.readFileSync('dist/style.css','utf8').includes('.many-pickups .shot img{max-height:220px}'));
console.log('PASS x6–x8: inventories, eight bosses, Noah side-stage returns, empty Dynasty stage and shared 220px limit.');
const mm8=JSON.parse(fs.readFileSync('src/campaigns/mm8.json'));assert.equal(mm8.stages.flatMap(s=>s.items).filter(p=>p.name.startsWith('Bolt ')).length,40,'Mega Man 8 must include all 40 unique bolts');
assert(mm8.warning.text.includes('cannot be undone')||mm8.primer.some(p=>p.includes('cannot be undone')),'Limited bolt spending needs a warning');
const mm7=JSON.parse(fs.readFileSync('src/campaigns/mm7.json'));assert(mm7.returns.find(r=>r.stage==='shade-man').items.includes('shade-man-proto-shield'));
console.log('PASS Classic: 40 unique MM8 bolts and grouped Proto Shield return.');
const campaign=id=>JSON.parse(fs.readFileSync(`src/campaigns/${id}.json`));
for(const id of ['mm1','mm2','mm3','mm4','mm5','mm6','mm7','mm8','mm9','mm10','mm11']){
 const g=campaign(id),bosses=g.stages.filter(s=>/ Man$|Splash Woman$/.test(s.name));assert.equal(bosses.length,id==='mm1'?6:8,id+' Robot Master roster');
 assert(g.sections.some(s=>s.id==='fortress'),id+' needs final-stage guidance');
 assert(bosses.every(s=>s.weakness&&s.reward&&s.tip),id+' boss guidance');
}
for(const id of ['zero1','zero2','zero3','zero4'])assert(campaign(id).warning?.text,id+' must explain its rank choices');
for(const id of ['zx','zx-advent'])assert(campaign(id).primer.some(p=>/difficulty|Expert|Easy|Normal|Beginner/i.test(p)),id+' must explain its difficulty choices');
for(const id of ['zero1','zero2','zero3']){
 const g=campaign(id),items=g.stages.flatMap(s=>s.items);
 assert.equal(items.filter(p=>/Sub Tank|tank elf|elf Sub Tank/i.test(p.name)).length,4,id+' four tank sources');
 assert.equal(items.filter(p=>/health|doubled health/i.test(p.name)).length,5,id+' five health elves');
}
for(const id of ['zx','zx-advent'])assert.equal(campaign(id).stages.flatMap(s=>s.items).filter(p=>/Sub Tank/.test(p.name)).length,4,id+' four tanks');
assert.equal(campaign('zx').stages.flatMap(s=>s.items).filter(p=>/Life Up/.test(p.name)).length,4);
assert.equal(campaign('zx-advent').stages.flatMap(s=>s.items).filter(p=>/Life Up|BM Upgrade/.test(p.name)).length,8);
const inventories=JSON.parse(fs.readFileSync('src/network-upgrades.json')).games;
for(const [n,g] of Object.entries(inventories)){
 assert.equal(g.upgrades.filter(p=>p.type==='HP Memory').length,45,'BN'+n+' health inventory');
 if(Number(n)<=2)assert.equal(g.upgrades.filter(p=>p.type==='Power UP').length,12,'BN'+n+' Buster inventory');
 if(Number(n)>=2){
  assert.equal(g.upgrades.filter(p=>p.type==='Sub Memory').length,4,'BN'+n+' Sub Memory inventory');
  assert.equal(g.upgrades.filter(p=>p.type==='Regular UP'&&/^RegUp/i.test(p.item)).reduce((v,p)=>v+Number(p.item.match(/\d+/)?.[0]||0),0),46,'BN'+n+' Regular Memory must reach 50MB from 4MB');
 }
}
for(const id of campaignIds.filter(id=>id.startsWith('bn'))){const g=campaign(id);assert.equal(g.extraReturns.reduce((n,r)=>n+r.count,0),inventories[g.networkGame].upgrades.length,id+' complete grouped upgrade inventory');assert(g.routeLabel==='Story route'&&g.flowLabel==='Chapter overview',id+' is not a selectable boss chain');}
for(const id of ['bn4-red-sun','bn4-blue-moon'])assert.equal((JSON.stringify(campaign(id)).match(/scenario-\d+/g)||[]).length,18,id+' all tournament scenarios');
console.log('PASS new collections: boss rosters, health/tank inventories, all BN permanent stat upgrades and 18 tournament scenarios per BN4 version.');

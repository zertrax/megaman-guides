const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const files=['index.html','x1/index.html','x2/index.html','x3/index.html','x4/index.html','x4/zero.html','x5/index.html','x6/index.html','x7/index.html','x8/index.html'];
for(const file of files){
 const html=fs.readFileSync('dist/'+file,'utf8'),ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,`Duplicate IDs in ${file}`);
 assert(!html.includes('${'),'Unresolved template expression');assert(!/<iframe/i.test(html),'Video must not load before a click');
 for(const [,raw] of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  if(/^(https?:|mailto:)/.test(raw))continue;
  if(raw.startsWith('#')){assert(ids.includes(raw.slice(1)),`Broken ${file}${raw}`);continue;}
  const ref=raw.split('#')[0];let resolved=path.join('dist',path.dirname(file),ref);if(fs.existsSync(resolved)&&fs.statSync(resolved).isDirectory())resolved=path.join(resolved,'index.html');assert(fs.existsSync(resolved),`Missing ${file} -> ${ref}`);
 }
 if(file==='index.html')continue;
 const gameId=file==='x4/zero.html'?'x4-zero':file.split('/')[0],g=JSON.parse(fs.readFileSync(`src/games/${gameId}.json`));
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

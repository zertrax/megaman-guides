const fs=require('node:fs'),path=require('node:path');
const {render}=require('../src/template.cjs');
const projectRoot=path.resolve(__dirname,'..');
process.chdir(projectRoot);
const outputDirectory=path.join(projectRoot,'dist');
if(path.dirname(outputDirectory)!==projectRoot)throw Error('Unsafe output directory');
if(fs.existsSync(outputDirectory)){
 if(fs.lstatSync(outputDirectory).isSymbolicLink())throw Error('Refusing linked output directory');
 fs.rmSync(outputDirectory,{recursive:true});
}
const ids=['x1','x2','x3','x4','x4-zero','x5','x6','x7','x8'];
const games=ids.map(id=>JSON.parse(fs.readFileSync(`src/games/${id}.json`,'utf8')));
fs.mkdirSync('dist',{recursive:true});
for(const game of games){
 const allStages=[...game.stages,...(game.sideStages||[])];const stages=new Map(allStages.map(s=>[s.id,s])),items=allStages.flatMap(s=>s.items);
 if(new Set([...stages.keys(),...items.map(p=>p.id)]).size!==allStages.length+items.length)throw Error('Duplicate IDs');
 for(const [type,count] of Object.entries(game.expectedCounts))if(items.filter(p=>p.type===type).length!==count)throw Error(`Invalid ${game.id} ${type} count`);
 for(const r of game.returns)for(const id of r.items)if(!stages.get(r.stage)?.items.some(p=>p.id===id))throw Error(`Invalid return reference ${id}`);
 const media=[...items.flatMap(p=>p.media),...(game.detour?.doors||[]).flatMap(d=>d.media||[]),...(game.extraMedia||[]),...game.stages.map(s=>s.sprite)];
 for(const m of media)if(!fs.existsSync(path.join('src',m.src)))throw Error(`Missing media: ${m.src}`);
 const destination=game.id==='x4-zero'?'x4/zero.html':`${game.id}/index.html`;
 fs.mkdirSync(path.dirname('dist/'+destination),{recursive:true});
 const html=render(game).replaceAll('href="style.css"','href="../style.css"').replaceAll('src="guide.js"','src="../guide.js"').replaceAll('src="assets/','src="../assets/').replaceAll('href="assets/','href="../assets/');
 if(Buffer.byteLength(html)>150000)throw Error(`${game.id} exceeds HTML budget`);
 fs.writeFileSync('dist/'+destination,html);
 console.log(`${game.title}: ${items.length} pickup locations; ${Buffer.byteLength(html)} HTML bytes`);
}
fs.writeFileSync('dist/style.css',['style.css','stage.css','collection.css'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n'));
fs.writeFileSync('dist/guide.js',['guide.js','reading-position.js','collection.js'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n'));
fs.cpSync('src/assets','dist/assets',{recursive:true});
fs.copyFileSync('src/index.html','dist/index.html');fs.writeFileSync('dist/.nojekyll','');
for(const [file,max] of Object.entries({'guide.js':14000,'style.css':25000}))if(fs.statSync('dist/'+file).size>max)throw Error(file+' exceeds budget');

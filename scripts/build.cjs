const fs=require('node:fs'),path=require('node:path');
const {render}=require('../src/template.cjs');
const {render:renderCampaign}=require('../src/campaign-template.cjs');
const {render:renderLibrary}=require('../src/library-template.cjs');
const {enhance:withProgress}=require('../src/progress-template.cjs');
const {enhance:withIdentity}=require('../src/game-info.cjs');
const projectRoot=path.resolve(__dirname,'..');
process.chdir(projectRoot);
const outputDirectory=path.join(projectRoot,'dist');
if(path.dirname(outputDirectory)!==projectRoot)throw Error('Unsafe output directory');
if(fs.existsSync(outputDirectory)){
 if(fs.lstatSync(outputDirectory).isSymbolicLink())throw Error('Refusing linked output directory');
 fs.rmSync(outputDirectory,{recursive:true});
}
const campaigns=fs.readdirSync('src/campaigns').filter(f=>f.endsWith('.json')).map(f=>JSON.parse(fs.readFileSync('src/campaigns/'+f,'utf8')));
for(const game of campaigns){
 const stages=new Map(game.stages.map(s=>[s.id,s])),items=game.stages.flatMap(s=>s.items||[]);
 const anchors=[...stages.keys(),...items.map(p=>p.id),...(game.sections||[]).map(s=>s.id)];
 if(new Set(anchors).size!==anchors.length)throw Error('Duplicate campaign IDs: '+game.id);
 for(const r of game.returns||[])for(const id of r.items)if(!stages.get(r.stage)?.items.some(p=>p.id===id))throw Error('Invalid campaign return: '+id);
 for(const m of [...(game.extraMedia||[]),...game.stages.map(s=>s.sprite),...items.flatMap(p=>p.media||[])].filter(Boolean))if(!fs.existsSync(path.join('src',m.src)))throw Error('Missing campaign asset: '+m.src);
 const html=withIdentity(withProgress(renderCampaign(game),game),game).replaceAll('src="assets/','src="../assets/').replaceAll('href="assets/','href="../assets/');
 if(Buffer.byteLength(html)>150000)throw Error(game.id+' exceeds HTML budget');
 fs.mkdirSync('dist/'+game.id,{recursive:true});fs.writeFileSync('dist/'+game.id+'/index.html',html);
 console.log(game.title+': '+items.length+' utility locations; '+Buffer.byteLength(html)+' HTML bytes');
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
 const html=withIdentity(withProgress(render(game),game),game).replaceAll('href="style.css"','href="../style.css"').replaceAll('src="guide.js"','src="../guide.js"').replaceAll('src="assets/','src="../assets/').replaceAll('href="assets/','href="../assets/');
 if(Buffer.byteLength(html)>150000)throw Error(`${game.id} exceeds HTML budget`);
 fs.writeFileSync('dist/'+destination,html);
 console.log(`${game.title}: ${items.length} pickup locations; ${Buffer.byteLength(html)} HTML bytes`);
}
fs.writeFileSync('dist/style.css',['style.css','stage.css','collection.css'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n'));
fs.writeFileSync('dist/guide.js',['guide.js','reading-position.js','collection.js'].map(f=>fs.readFileSync('src/'+f,'utf8')).join('\n'));
fs.cpSync('src/assets','dist/assets',{recursive:true});
fs.copyFileSync('src/guide-theme.css','dist/guide-theme.css');
for(const file of ['progress.js','progress.css','library.css','identity.css'])fs.copyFileSync('src/'+file,'dist/'+file);
fs.writeFileSync('dist/index.html',renderLibrary(games,campaigns));fs.writeFileSync('dist/.nojekyll','');
if(process.argv.includes('--source-only')){console.log('Undecorated English pages ready for catalog extraction.');process.exit(0);}
const localization=require('../src/localization.cjs');
const localeUi=JSON.parse(fs.readFileSync('src/locales/ui.json','utf8'));
const previewIndex=process.argv.indexOf('--preview-locale');
const selectedLocale=previewIndex<0?null:process.argv[previewIndex+1];
if(selectedLocale&&!localization.locales.includes(selectedLocale))throw Error('Unsupported preview language');
const buildLocales=selectedLocale?['en',...(selectedLocale==='en'?[]:[selectedLocale])]:localization.locales;
fs.writeFileSync('dist/localization.js',localization.compileRuntime(localeUi));
fs.copyFileSync('src/localization.css','dist/localization.css');
const englishPages=['index.html',...campaigns.map(g=>g.id+'/index.html'),...games.map(g=>g.id==='x4-zero'?'x4/zero.html':g.id+'/index.html')];
const catalog=JSON.parse(fs.readFileSync('src/locales/source.json','utf8'));
const sourceByKey=new Map(catalog.units.map(u=>[u.key,u.source]));
const reviewed=JSON.parse(fs.readFileSync('src/locales/reviewed.json','utf8'));
const dictionaries=new Map(buildLocales.filter(l=>l!=='en').map(l=>[l,{...JSON.parse(fs.readFileSync('src/locales/'+l+'.json','utf8')),...reviewed[l]}]));
const pages=[];
for(const page of englishPages){
 const original=fs.readFileSync('dist/'+page,'utf8');
 for(const u of localization.units(original))if(sourceByKey.get(u.key)!==u.source)throw Error('English source changed; refresh translations: '+u.key);
 const route=page==='index.html'?'':page.replace(/index\.html$/,'');
 for(const locale of buildLocales){
  const translated=locale==='en'?original:localization.translate(original,locale,dictionaries.get(locale),catalog.protectedTerms);
  const destination=(locale==='en'?'':locale+'/')+page;
  fs.mkdirSync(path.dirname('dist/'+destination),{recursive:true});
  fs.writeFileSync('dist/'+destination,localization.decorate(translated,{locale,route}));pages.push(destination);
 }
}
console.log(buildLocales.length+' languages: '+pages.length+' current pages, shared original media.');
// Updated files get fresh URLs while unchanged files keep their browser cache.
const sharedFiles=['style.css','guide.js','guide-theme.css','progress.js','progress.css','library.css','identity.css','localization.js','localization.css'];
// Keep content hashes identical on Windows previews and Linux publication builds.
for(const file of sharedFiles)fs.writeFileSync('dist/'+file,fs.readFileSync('dist/'+file,'utf8').replaceAll('\r\n','\n'));
const hashes=new Map(sharedFiles.map(file=>[file,require('node:crypto').createHash('sha256').update(fs.readFileSync('dist/'+file)).digest('hex').slice(0,10)]));
for(const page of pages){const file='dist/'+page;fs.writeFileSync(file,fs.readFileSync(file,'utf8').replaceAll('\r\n','\n').replace(/\b(src|href)="((?:\.\.\/)*)([\w-]+\.(?:css|js))"/g,(match,attribute,prefix,name)=>hashes.has(name)?`${attribute}="${prefix}${name}?v=${hashes.get(name)}"`:match));}
for(const [file,max] of Object.entries({'guide.js':14000,'style.css':25000,'progress.js':6500,'progress.css':5000,'library.css':6500,'identity.css':3500}))if(fs.statSync('dist/'+file).size>max)throw Error(file+' exceeds budget');
require('./build-previous.cjs').buildPrevious();

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const engine = require('../src/localization.cjs');
process.chdir(path.resolve(__dirname,'..'));
let checks = 0;
function check(name, fn) { fn(); checks++; }
const digest = value => createHash('sha256').update(value).digest('hex');
const decode = value => value.replace(/&(?:amp|quot|apos|lt|gt|nbsp);|&#(?:\d+|x[\da-f]+);/gi, entity => {
  const named = {'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '};
  if (Object.hasOwn(named,entity.toLowerCase())) return named[entity.toLowerCase()];
  const number=entity[2].toLowerCase()==='x'?parseInt(entity.slice(3,-1),16):parseInt(entity.slice(2,-1),10);
  return Number.isInteger(number)&&number<=0x10ffff&&!(number>=0xd800&&number<=0xdfff)?String.fromCodePoint(number):entity;
});
function plainText(value) { return decode(value.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim(); }
function fallbackChecker(terms) {
  const names=new Set();
  for(const entry of terms)for(const term of typeof entry==='string'?[entry]:[entry?.term,...(entry?.aliases||[])])if(typeof term==='string'&&term){
    names.add(term);if(/\b(?:Tank|Part|Chip|Disk|Bolt|Module|Fragment|Program)$/.test(term))names.add(term+'s');
  }
  const pattern=names.size?new RegExp('(?<![A-Za-z0-9_])(?:'+[...names].sort((a,b)=>b.length-a.length).map(term=>term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z0-9_])','gi'):null;
  // Boss aliases, network locations and recipes contain names missing from the
  // canonical catalog. Detect unchanged explanatory sentences without treating
  // every short name list or cognate as untranslated prose.
  return (unit,value) => {
    if (unit.source.includes('<strong>Need</strong>')) {
      assert.ok(!value.includes('<strong>Need</strong>'),'Untranslated requirement label: '+unit.key);
    }
    const source=plainText(unit.source),translated=plainText(value);
    if(source!==translated)return;
    const remaining=pattern?source.replace(pattern,' '):source;
    const words=(remaining.match(/[A-Za-z][A-Za-z’'-]*/g)||[]).length;
    const isProse=/^(?:p(?:\.|$)|meta@)/.test(unit.context)||/[.!?]$/.test(source);
    assert.ok(!isProse||words<4,'Untranslated English prose: '+unit.key+' ('+unit.context+')');
  };
}
function tags(html) {
  const safe=html.replace(/<!--[\s\S]*?-->/g,'').replace(/(<(?:script|style)\b[^>]*>)[\s\S]*?(<\/(?:script|style)\s*>)/gi,'$1$2');
  return [...safe.matchAll(/<([a-z][\w:-]*)\b(?:[^"'<>]|"[^"]*"|'[^']*')*>/gi)].map(match=>{
    const attributes={};
    for(const attribute of match[0].matchAll(/\s([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)){
      const key=attribute[1].toLowerCase();assert.ok(!Object.hasOwn(attributes,key),'Duplicate HTML attribute: '+key);
      attributes[key]=decode(attribute[2]??attribute[3]??attribute[4]??'');
    }
    return {tag:match[1].toLowerCase(),attributes};
  });
}
function pageRecord(html,file) {
  const parsed=tags(html),ids=parsed.flatMap(node=>Object.hasOwn(node.attributes,'id')?[node.attributes.id]:[]);
  assert.equal(new Set(ids).size,ids.length,'Duplicate page IDs: '+file);
  return {html,tags:parsed,ids:new Set(ids),body:parsed.find(node=>node.tag==='body')?.attributes,lang:parsed.find(node=>node.tag==='html')?.attributes.lang};
}
function htmlFiles(dir) {
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?htmlFiles(path.join(dir,entry.name)):entry.name.endsWith('.html')?[path.join(dir,entry.name).replaceAll('\\','/')]:[]);
}
function renderedEnglish() {
  // Read-only rendering mirrors the build inputs. Decorated pages normalize
  // relative links, so their text-unit hashes are not the original catalog.
  const {render}=require('../src/template.cjs');
  const {render:campaign}=require('../src/campaign-template.cjs');
  const {render:library}=require('../src/library-template.cjs');
  const {enhance:progress}=require('../src/progress-template.cjs');
  const {enhance:identity}=require('../src/game-info.cjs');
  const campaigns=fs.readdirSync('src/campaigns').filter(file=>file.endsWith('.json')).map(file=>JSON.parse(fs.readFileSync('src/campaigns/'+file,'utf8')));
  const games=['x1','x2','x3','x4','x4-zero','x5','x6','x7','x8'].map(id=>JSON.parse(fs.readFileSync('src/games/'+id+'.json','utf8')));
  const pages=new Map([['index.html',library(games,campaigns)]]);
  for(const game of campaigns)pages.set(game.id+'/index.html',identity(progress(campaign(game),game),game).replaceAll('src="assets/','src="../assets/').replaceAll('href="assets/','href="../assets/'));
  for(const game of games)pages.set(game.id==='x4-zero'?'x4/zero.html':game.id+'/index.html',identity(progress(render(game),game),game).replaceAll('href="style.css"','href="../style.css"').replaceAll('src="guide.js"','src="../guide.js"').replaceAll('src="assets/','src="../assets/').replaceAll('href="assets/','href="../assets/'));
  return pages;
}
function localTarget(value,file) {
  const base='https://guides.invalid/site/';
  const url=new URL(value,base+file);
  if(url.origin!=='https://guides.invalid')return {external:true,url};
  assert.ok(url.pathname.startsWith('/site/'),'Local URL escapes repository: '+file+' '+value);
  const target=decodeURIComponent(url.pathname.slice('/site/'.length));
  return {external:false,url,target:target.endsWith('/')?target+'index.html':target||'index.html'};
}
function validateAssembledPage(record,file,locale,original,englishFile,pages,hashes) {
  const route=englishFile==='index.html'?'':englishFile.replace(/index\.html$/,'');
  assert.equal(record.lang,locale,'Document language: '+file);
  assert.equal(record.body?.['data-guide-locale'],locale,'Page locale: '+file);
  assert.equal(record.body?.['data-guide-route'],route,'Page route: '+file);
  assert.equal(record.body?.['data-guide-id'],original.body?.['data-guide-id'],'Progress identity: '+file);
  assert.deepEqual([...record.ids].sort(),[...original.ids].sort(),'Changed section IDs: '+file);
  const selects=record.tags.filter(node=>node.tag==='select'&&node.attributes.id==='guide-language');
  assert.equal(selects.length,1,'Missing language selector: '+file);
  assert.ok(selects[0].attributes['aria-label'],'Unlabelled language selector: '+file);
  const options=record.tags.filter(node=>node.tag==='option');
  assert.deepEqual(options.map(node=>node.attributes.value),engine.locales,'Language options: '+file);
  assert.equal(options.filter(node=>Object.hasOwn(node.attributes,'selected')).length,1,'Selected language count: '+file);
  assert.equal(options.find(node=>Object.hasOwn(node.attributes,'selected')).attributes.value,locale,'Wrong selected language: '+file);
  const notes=record.tags.filter(node=>node.tag==='aside'&&(node.attributes.class||'').split(/\s+/).includes('translation-note'));
  assert.equal(notes.length,locale==='en'?0:1,'AI translation notice: '+file);
  const credits=record.tags.filter(node=>(node.attributes.class||'').split(/\s+/).includes('translation-credit'));
  assert.equal(credits.length,locale==='en'?0:1,'Translation review disclosure: '+file);
  if(locale!=='en'){
    const footer=record.html.match(/<footer\b[^>]*>[\s\S]*?<\/footer>/i)?.[0];
    assert.ok(footer?.includes('class="translation-note"'),'Translation notice must be in the footer: '+file);
    assert.ok(footer?.includes('class="translation-credit"'),'Translation review disclosure must be in the footer: '+file);
  }
  const englishLinks=record.tags.filter(node=>Object.hasOwn(node.attributes,'data-english-source'));
  assert.equal(englishLinks.length,locale==='en'?0:1,'English source link: '+file);
  if(englishLinks.length){const target=localTarget(englishLinks[0].attributes.href,file);assert.equal(target.target,englishFile);assert.equal(target.url.searchParams.get('lang'),'en');}
  const resources=[];
  for(const node of record.tags)for(const name of ['href','src','poster']){
    const value=node.attributes[name];if(!value)continue;
    const target=localTarget(value,file);
    if(target.external){assert.equal(name,'href','External media or script: '+file+' '+value);continue;}
    const isResource=name!=='href'||/^(?:assets)\//.test(target.target)||/\.(?:css|js|ico|png|jpe?g|gif|webp|svg|woff2?|mp4|webm|mp3|json|txt|pdf)$/i.test(target.target);
    assert.ok(fs.existsSync(path.join('dist',target.target)),'Missing local link: '+file+' '+value);
    if(target.url.hash&&target.target.endsWith('.html')){
      let linked=pages.get(target.target);if(!linked){linked=pageRecord(fs.readFileSync(path.join('dist',target.target),'utf8'),target.target);pages.set(target.target,linked);}
      assert.ok(linked.ids.has(decodeURIComponent(target.url.hash.slice(1))),'Missing local anchor: '+file+' '+value);
    }
    if(isResource){
      assert.ok(!engine.locales.some(id=>id!=='en'&&target.target.startsWith(id+'/')),'Copied language resource: '+file+' '+value);
      resources.push(node.tag+'@'+name+':'+target.target);
      if(hashes.has(target.target))assert.equal(target.url.searchParams.get('v'),hashes.get(target.target),'Stale shared asset hash: '+file+' '+value);
    }else if(!target.target.startsWith('previous/')&&!Object.hasOwn(node.attributes,'data-english-source')){
      assert.ok(locale==='en'?!engine.locales.some(id=>id!=='en'&&target.target.startsWith(id+'/')):target.target.startsWith(locale+'/'),'Navigation leaves chosen language: '+file+' '+value);
    }
  }
  return resources.sort();
}
const fixture = '<!doctype html><html lang="en"><head><title>Mega Man X3 — Field Guide</title><meta name="description" content="Collect 3 parts before the boss."><link rel="stylesheet" href="../style.css?v=123"><script src="../guide.js" defer></script><style>.red{color:red}</style></head><body data-guide-id="x3"><header class="top"><div class="top-tools"></div></header><div class="layout" id="top"><main><p>Before the boss, <strong>collect 3 parts</strong> and <a href="#return">return here</a>.</p><p>Before the boss, <strong>collect 3 parts</strong> and <a href="#return">return here</a>.</p><p>Keep <code>field-guide:x3:reading:v1</code> unchanged.</p><p>◆ 01 →</p><p><span aria-hidden="true">♥</span> Heart Tank</p><a href="../">All guides</a><a href="../x4/zero.html#intro">Zero campaign</a><a href="../previous/">Previous site</a><a href="../assets/map.webp" data-lightbox title="Enlarge screenshot">Enlarge</a><img src="../assets/map.webp" alt="The boss&apos;s doorway"><a href="https://example.test/source">Reference</a><section id="sources"><h2>Sources &amp; credits</h2><p>Author name and original source.</p></section><details class="library-credits"><summary>Cover artwork &amp; sources</summary><p>Contributor names.</p></details><pre>Never translate code.</pre></main></div><script>const markup="<p>Script source is not guide text.</p>";</script></body></html>';
const extracted = engine.units(fixture);
const identity = Object.fromEntries(extracted.map(unit=>[unit.key,unit.source]));
const sentence = extracted.find(unit=>unit.source.startsWith('Before the boss,'));
check('Complete paragraph and inline structure are one context unit', () => {
  assert.ok(sentence);
  assert.equal(sentence.source,'Before the boss, <strong>collect 3 parts</strong> and <a href="#return">return here</a>.');
  assert.equal(extracted.filter(unit=>unit.source===sentence.source).length,1);
  assert.ok(!extracted.some(unit=>unit.source==='collect 3 parts'));
});
check('Navigation and pickup choices are separate while prose remains whole', () => {
  const html='<html lang="en"><head><title>Guide</title></head><body><nav><a href="#one">Start here</a><a href="#two">Return trips</a></nav><div class="boss-pickups"><span>Stage pickups</span><a href="#heart">♥ Heart Tank</a><a href="#armor">◆ Arm Parts</a></div><div class="stage-inventory"><a href="#heart">Heart Tank <small>Now</small></a><a href="#armor">Arm Parts <small>Later</small></a></div><div class="jump-links"><a href="#heart">Find Heart Tank</a><a href="#armor">Find Arm Parts</a></div><p>Before the boss, <strong>collect 3 parts</strong> and <a href="#return">return here</a>.</p><ul><li>Climb the left wall and <strong>jump to the capsule</strong>.</li></ul><table><tr><td>Use <strong>Frost Shield</strong> before crossing.</td></tr></table></body></html>';
  const units=engine.units(html);
  for(const source of ['Start here','Return trips','Stage pickups','♥ Heart Tank','◆ Arm Parts','Heart Tank <small>Now</small>','Arm Parts <small>Later</small>','Find Heart Tank','Find Arm Parts',sentence.source,'Climb the left wall and <strong>jump to the capsule</strong>.','Use <strong>Frost Shield</strong> before crossing.'])assert.ok(units.some(unit=>unit.source===source),'Missing separate choice or whole prose: '+source);
  assert.ok(!units.some(unit=>/^(?:nav|div\.(?:boss-pickups|stage-inventory|jump-links))/.test(unit.context)));
  const dict=Object.fromEntries(units.map(unit=>[unit.key,unit.source]));assert.equal(engine.translate(html,'fr',dict).replace('lang="fr"','lang="en"'),html);
});
check('Source hashes, unique units, pure-symbol/code/credit exclusions', () => {
  assert.equal(new Set(extracted.map(unit=>unit.key)).size,extracted.length);
  for (const unit of extracted) assert.equal(unit.key,createHash('sha256').update(unit.source).digest('hex').slice(0,16));
  for (const unwanted of ['◆ 01 →','Author name and original source.','Contributor names.','Never translate code.','Script source is not guide text.','.red{color:red}']) assert.ok(!extracted.some(unit=>unit.source.includes(unwanted)));
});
check('Identity dictionary preserves markup and all source IDs', () => {
  const translated=engine.translate(fixture,'fr',identity);
  assert.equal(translated.replace('lang="fr"','lang="en"'),fixture);
});
check('Translated sentence preserves its exact inline nodes and links', () => {
  const dictionary={...identity,[sentence.key]:'Avant le boss, <strong>récupérez 3 pièces</strong> et <a href="#return">revenez ici</a>.'};
  const output=engine.translate(fixture,'fr',dictionary);
  assert.equal((output.match(/Avant le boss/g)||[]).length,2);
  assert.ok(output.includes('<strong>récupérez 3 pièces</strong>'));
  assert.ok(output.includes('data-guide-id="x3"'));
});
check('Missing, empty, malformed and stale values fail closed', () => {
  const missing={...identity}; delete missing[sentence.key];
  assert.throws(()=>engine.translate(fixture,'fr',missing),/Missing translation/);
  for (const value of ['',null,3,'<em>Changed markup</em>','Wrong <script>alert(1)</script>','Before<!-- hidden --> the boss.']) assert.throws(()=>engine.translate(fixture,'fr',{...identity,[sentence.key]:value}));
  assert.throws(()=>engine.translate(fixture,'fr',{...identity,[sentence.key]:{source:'outdated sentence',translation:sentence.source}}),/Stale translation/);
  const changedSource=fixture.replace('Before the boss,','After the boss,');
  assert.throws(()=>engine.translate(changedSource,'fr',identity),/Missing translation/);
});
check('Links, attributes, fixed code/icons and numerical meaning cannot change', () => {
  for (const value of [sentence.source.replace('#return','https://bad.test'),sentence.source.replace('<strong>','<strong id="new">'),sentence.source.replace('3 parts','4 parts'),sentence.source.replace('<strong>','<em>').replace('</strong>','</em>')]) assert.throws(()=>engine.translate(fixture,'fr',{...identity,[sentence.key]:value}));
  const code=extracted.find(unit=>unit.source.includes('<code>'));
  assert.throws(()=>engine.translate(fixture,'fr',{...identity,[code.key]:code.source.replace('reading:v1','completion:v1')}));
  const icon=extracted.find(unit=>unit.source.includes('aria-hidden'));
  assert.throws(()=>engine.translate(fixture,'fr',{...identity,[icon.key]:icon.source.replace('♥','◆')}));
  const adjacent={key:'number-boundaries',kind:'html',source:'<a href="#a">ACDC 3</a><a href="#b"><span>03</span>Next chapter</a>'};
  assert.equal(engine.validateValue(adjacent,'<a href="#a">ACDC 3</a> <a href="#b"><span>03</span>Chapitre suivant</a>'),'<a href="#a">ACDC 3</a> <a href="#b"><span>03</span>Chapitre suivant</a>');
});
check('Visible icons keep exact order/count beyond aria-hidden wrappers', () => {
  const item={key:'visible-icons',kind:'html',source:'♥ Heart Tank → ◆ Arm Parts ↗ ▣ Sub Tank + 2 parts = 100% ✓'};
  const translated='♥ Heart Tank → ◆ Arm Parts ↗ ▣ Sub Tank + 2 pièces = 100% ✓';
  assert.equal(engine.validateValue(item,translated),translated);
  for(const changed of [translated.replace('♥','◆'),translated.replace('→','←'),translated.replace('↗',''),translated.replace('✓','☑'),translated.replace('▣','▣ ▣'),translated+' →',translated.replace('+','et'),translated.replace('%',''),translated.replace('2 pièces','２ pièces'),translated.replace('2 pièces','2 pièces ٣'),translated.replace('2 pièces','2 pièces 3')])assert.throws(()=>engine.validateValue(item,changed),/glyphs|numbers/);
  const entity={key:'entity-icons',kind:'html',source:'&hearts; Heart Tank &rarr; &diams; Arm Parts &#x2197;'};
  assert.equal(engine.validateValue(entity,'♥ Heart Tank → ♦ Arm Parts ↗'),'♥ Heart Tank → ♦ Arm Parts ↗');
  const punctuation={key:'natural-punctuation',kind:'html',source:'Read this: keep moving.'};
  assert.equal(engine.validateValue(punctuation,'これを読んで、動き続けてください。'),'これを読んで、動き続けてください。');
  const signed={key:'signed',kind:'html',source:'The meter changes by -2; keep HP &lt; 50.'};
  assert.equal(engine.validateValue(signed,'La jauge change de -2 ; gardez les HP &lt; 50.'),'La jauge change de -2 ; gardez les HP &lt; 50.');
  assert.throws(()=>engine.validateValue(signed,'La jauge change de 2 ; gardez les HP &lt; 50.'),/numbers/);
  assert.throws(()=>engine.validateValue(signed,'La jauge change de -2 ; gardez les HP &gt; 50.'),/glyphs/);
  const mathSpacing={key:'math-spacing',kind:'html',source:'Collect 1+2 parts in stages 1-4.'};
  assert.equal(engine.validateValue(mathSpacing,'Récupérez 1 + 2 pièces dans les stages 1 -4.'),'Récupérez 1 + 2 pièces dans les stages 1 -4.');
});
check('Attribute translations are escaped, not interpreted as HTML', () => {
  const alt=extracted.find(unit=>unit.context==='img@alt');
  const output=engine.translate(fixture,'fr',{...identity,[alt.key]:'La porte d’écran "boss"'});
  assert.ok(output.includes('alt="La porte d’écran &quot;boss&quot;"'));
  assert.throws(()=>engine.translate(fixture,'fr',{...identity,[alt.key]:'<img src=x onerror=alert(1)>'}),/Unsafe translated attribute/);
  assert.equal(engine.validateValue({key:'unquoted',kind:'attribute',source:'Boss',quote:''},'La porte'),'La&#32;porte');
});
check('Nested accessible labels translate after their complete sentence safely', () => {
  const html='<html lang="en"><head><title>Guide</title></head><body><p>Climb right and <a href="#door" title="Door location" aria-label="Enlarge the door">check this door</a>.</p></body></html>';
  const required=engine.units(html),dict=Object.fromEntries(required.map(unit=>[unit.key,unit.source]));
  const sentence=required.find(unit=>unit.source.startsWith('Climb right'));
  const title=required.find(unit=>unit.source==='Door location');
  const label=required.find(unit=>unit.source==='Enlarge the door');
  assert.ok(sentence&&title&&label);
  dict[sentence.key]=sentence.source.replace('Climb right and','Montez à droite et').replace('check this door','regardez cette porte');
  dict[title.key]='Emplacement de la porte';dict[label.key]='Agrandir la porte';
  const output=engine.translate(html,'fr',dict);
  assert.ok(output.includes('Montez à droite et <a href="#door" title="Emplacement de la porte" aria-label="Agrandir la porte">regardez cette porte</a>.'));
  const missing={...dict};delete missing[label.key];assert.throws(()=>engine.translate(html,'fr',missing),/Missing translation/);
});
check('Canonical names, plurals, repetitions and CJK-adjacent names retain exact counts', () => {
  const item={key:'names',kind:'html',source:'Use <strong>Frost Shield</strong> with Zero; collect 2 Heart Tanks and another Frost Shield.'};
  const terms=['Frost Shield','Zero','Heart Tank'];
  const value='Utilisez <strong>Frost Shield</strong> avec Zero ; récupérez 2 Heart Tanks et encore Frost Shield.';
  assert.equal(engine.validateValue(item,value,terms),value);
  for(const changed of [value.replace('Frost Shield','FrostShield'),value.replace('Heart Tanks','Heart Tank'),value.replace('Zero','Zero Zero'),value.replace('encore Frost Shield','une autre arme')]) assert.throws(()=>engine.validateValue(item,changed,terms),/canonical names/);
  assert.equal(engine.protectCanonical({key:'ja',kind:'html',source:'Use Frost Shield.'},'Frost Shieldを使います。',['Frost Shield']),'Frost Shieldを使います。');
  assert.equal(engine.protectCanonical({key:'attrs',kind:'html',source:'Read <a href="#Zero">here</a>.'},'Lisez <a href="#Zero">ici</a>.',['Zero']),'Lisez <a href="#Zero">ici</a>.');
  const reward={key:'adjacent-label',kind:'html',source:'<span class="eyebrow">You earn</span><strong>Spark Shock</strong>'};
  assert.equal(engine.validateValue(reward,'<span class="eyebrow">Obtienes</span> <strong>Spark Shock</strong>',['Spark Shock']),'<span class="eyebrow">Obtienes</span> <strong>Spark Shock</strong>');
  const aliases=[{term:'Frost Shield',aliases:['Frost Shields']}];
  assert.throws(()=>engine.protectCanonical({key:'alias',kind:'html',source:'Frost Shields'},'Frost Shield',aliases),/canonical names/);
});
check('Tokenizer residue and untranslated placeholders cannot ship', () => {
  const unit={key:'token',kind:'html',source:'Collect the Heart Tank.'};
  for(const value of ['▁Collect the Heart Tank.','&#x2581;Collect the Heart Tank.','Collect ZXQ0123TOKEN.','Collect zxq_term_12.']) assert.throws(()=>engine.validateValue(unit,value),/tokenizer\/placeholder/);
});
check('English fallback guard permits names and cognates, not untouched instructions', () => {
  const validate=fallbackChecker(['Mega Man X3','Heart Tank','Frost Shield']);
  validate({key:'name',context:'h1',source:'<b>Mega Man X3</b>'},'<b>Mega Man X3</b>');
  validate({key:'cognate',context:'span',source:'Optional'},'Optional');
  validate({key:'translated',context:'p',source:'Collect the Heart Tank before the boss.'},'Récupérez le Heart Tank avant le boss.');
  assert.throws(()=>validate({key:'fallback',context:'p',source:'Collect the Heart Tank before the boss.'},'Collect the Heart Tank before the boss.'),/Untranslated English prose/);
});
check('Short requirement labels must translate even beside form codes', () => {
  const validate=fallbackChecker(['HX','FX','LX','PX']);
  const unit={key:'short-need',context:'p.need',source:'<strong>Need</strong> HX + FX + LX + PX'};
  assert.throws(()=>validate(unit,unit.source),/Untranslated requirement label/);
  validate(unit,'<strong>Necesitas</strong> HX + FX + LX + PX');
});
check('Independent assembled-page scan detects changed media, anchors and locale links', () => {
  const valid=pageRecord('<html lang="ja"><body data-guide-id="x3"><img id="door" src="../../assets/map.webp"><a href="#door">場所</a></body></html>','ja/x3/index.html');
  assert.deepEqual([...valid.ids],['door']);assert.equal(valid.lang,'ja');
  assert.equal(localTarget('../../assets/map.webp','ja/x3/index.html').target,'assets/map.webp');
  assert.equal(localTarget('../x4/zero.html#intro','ja/x3/index.html').target,'ja/x4/zero.html');
  assert.throws(()=>pageRecord('<p id="same"></p><p id="same"></p>','duplicate'),/Duplicate page IDs/);
  assert.throws(()=>tags('<p id="first" id="second"></p>'),/Duplicate HTML attribute/);
  assert.throws(()=>localTarget('../../../escape/','ja/index.html'),/escapes repository/);
});
check('All eight static selectors, translated note and same guide identity', () => {
  for (const locale of engine.locales) {
    const html=locale==='en'?fixture:engine.translate(fixture,locale,identity);
    const output=engine.decorate(html,{locale,route:'x3/'});
    assert.equal((output.match(/<option /g)||[]).length,8);
    assert.ok(output.includes('value="'+locale+'" lang="'+locale+'" selected'));
    assert.ok(output.includes('data-guide-id="x3"'));
    assert.ok(output.includes('data-guide-locale="'+locale+'"'));
    assert.equal(output.includes('class="translation-note"'),locale!=='en');
    assert.equal(output.includes('class="translation-credit"'),locale!=='en');
    if(locale!=='en'){
      assert.ok(output.indexOf('class="translation-note"')>output.indexOf('<pre>Never translate code.</pre>'));
      const withFooter=html.replace('</main>','<footer><p>Credits</p></footer></main>');
      const decoratedFooter=engine.decorate(withFooter,{locale,route:'x3/'}).match(/<footer>[\s\S]*?<\/footer>/)[0];
      assert.ok(decoratedFooter.includes('class="translation-note"'));
      assert.ok(decoratedFooter.includes('class="translation-credit"'));
    }
    assert.ok(!engine.units(output).some(unit=>unit.source.includes('Español (Latinoamérica)')));
    assert.throws(()=>engine.decorate(output,{locale,route:'x3/'}),/already/);
  }
});
check('Translated navigation stays in its locale and assets/archive stay shared', () => {
  const output=engine.decorate(engine.translate(fixture,'ja',identity),{locale:'ja',route:'x3/'});
  assert.ok(output.includes('href="../"'));
  assert.ok(output.includes('href="../x4/zero.html#intro"'));
  assert.ok(output.includes('href="../../previous/"'));
  assert.ok(output.includes('href="../../style.css?v=123"'));
  assert.ok(output.includes('src="../../guide.js"'));
  assert.ok(output.includes('src="../../assets/map.webp"'));
  assert.ok(output.includes('href="../../assets/map.webp"'));
  assert.ok(output.includes('href="#return"'));
  assert.ok(output.includes('href="https://example.test/source"'));
  assert.ok(output.includes('href="../../x3/?lang=en" data-english-source'));
});
check('Library and X4 file routes use correct relative roots', () => {
  const library='<!doctype html><html lang="en"><head><title>Library</title></head><body><main><header class="hero library-hero"><h1>Mega Man</h1></header><div id="collections"><a href="x3/">X3</a><a href="previous/">Previous</a><img src="assets/library/art.webp" alt=""></div></main></body></html>';
  const dict=Object.fromEntries(engine.units(library).map(u=>[u.key,u.source]));
  const japanese=engine.decorate(engine.translate(library,'ja',dict),{locale:'ja',route:''});
  assert.ok(japanese.includes('href="x3/"'));
  assert.ok(japanese.includes('href="../previous/"'));
  assert.ok(japanese.includes('src="../assets/library/art.webp"'));
  assert.ok(japanese.includes('src="../localization.js"'));
  const x4=engine.rewriteUrls('<a href="./">X</a><a href="zero.html">Zero</a><img src="../assets/x4.png">','de','x4/zero.html');
  assert.ok(x4.includes('href="./"')); assert.ok(x4.includes('href="zero.html"')); assert.ok(x4.includes('src="../../assets/x4.png"'));
  assert.throws(()=>engine.decorate(fixture,{locale:'ja',route:'x3/'}),/Document language/);
  assert.throws(()=>engine.rewriteUrls(fixture,'xx','x3/'),/Invalid locale/);
  assert.throws(()=>engine.rewriteUrls(fixture,'en','../../escape/'),/Invalid locale/);
});
const ui=JSON.parse(fs.readFileSync('src/locales/ui.json','utf8'));
const runtime=engine.compileRuntime(ui);
check('Language assets stay small and naming exceptions stay source-specific', () => {
  assert.ok(Buffer.byteLength(runtime)<=25000,'Language runtime exceeds 25KB');
  assert.ok(fs.statSync('src/localization.css').size<=3000,'Language styles exceed 3KB');
  const source=require('../src/locales/source.json'),exceptions=require('../src/locales/canonical-exceptions.json').units;
  const byKey=new Map(source.units.map(unit=>[unit.key,unit]));
  for(const [key,exception] of Object.entries(exceptions)){
    assert.ok(byKey.has(key),'Stale naming exception: '+key);
    assert.equal(digest(byKey.get(key).source).slice(0,16),key,'Naming exception source hash');
    for(const term of exception.terms)assert.ok(source.protectedTerms.includes(term),'Exception must address an existing protected term');
    assert.ok(exception.reason,'Naming exception needs a contextual reason');
  }
  const verb=byKey.get('4191d55da0a83a4c');
  engine.validateValue(verb,'Derrota a GateMan por 1.ª vez',['Beat']);
  assert.throws(()=>engine.validateValue({key:'robot-name',kind:'html',source:'Beat rescues you.'},'Te rescata.',['Beat']),/canonical/);
});
check('Localized integer grouping keeps deadlines distinct from decimals', () => {
  const item={key:'grouped-souls',kind:'html',source:'Before 3,000 Souls; ranks at 1,500, 5,000 and 9,999.'};
  for(const value of ['Before 3.000 Souls; ranks at 1.500, 5.000 and 9.999.','Before 3\u202F000 Souls; ranks at 1\u202F500, 5\u202F000 and 9\u202F999.','Before 3\u00A0000 Souls; ranks at 1\u00A0500, 5\u00A0000 and 9\u00A0999.','Before 3000 Souls; ranks at 1500, 5000 and 9999.'])engine.validateValue(item,value);
  for(const value of ['Before 3.0 Souls; ranks at 1.500, 5.000 and 9.999.','Before 3.001 Souls; ranks at 1.500, 5.000 and 9.999.','Before 3.000 Souls; ranks at 5.000, 1.500 and 9.999.'])assert.throws(()=>engine.validateValue(item,value),/numbers/);
  const decimal={key:'decimal',kind:'html',source:'3.000 seconds'};
  assert.throws(()=>engine.validateValue(decimal,'3000 seconds'),/numbers/);
  const large={key:'large-integer',kind:'html',source:'1,000,000 points'};
  engine.validateValue(large,'1.000.000 points');
  assert.throws(()=>engine.validateValue(large,'1.000.001 points'),/numbers/);
});
check('Guide-written headings translate without becoming unofficial game aliases', () => {
  const source=require('../src/locales/source.json'),headings=require('../src/locales/guide-labels.json');
  assert.deepEqual(headings.locales,engine.locales.filter(locale=>locale!=='en'));
  for(const [label,values] of Object.entries(headings.labels)){
    assert.ok(!source.protectedTerms.includes(label),'Descriptive heading incorrectly treated as an identifier: '+label);
    assert.equal(values.length,headings.locales.length,'Heading locale coverage');
    for(const value of values)engine.validateValue({key:digest(label).slice(0,16),kind:'html',source:label},value,source.protectedTerms);
  }
  const robot={key:'tower-chip',kind:'html',source:'Use Tower.'};
  assert.throws(()=>engine.validateValue(robot,'Utilisez une tour.',['Tower']),/canonical/);
});
function browserFixture({locale='en',route='x3/',preference,query='',hash='#neon-tiger',brokenStorage=false}={}) {
  const handlers={},saved=[],navigation=[];
  const root='https://example.test/megaman-guides/';
  const url=new URL((locale==='en'?'':locale+'/')+route+query+hash,root);
  const select={value:locale,addEventListener:(event,callback)=>{handlers[event]=callback;}};
  const english={addEventListener:(event,callback)=>{handlers['english:'+event]=callback;}};
  const context={URL,console,document:{body:{dataset:{guideLocale:locale,guideRoute:route}},getElementById:id=>id==='guide-language'?select:null,querySelector:selector=>selector==='script[data-locale-runtime]'?{src:root+'localization.js?v=123'}:selector==='[data-english-source]'&&locale!=='en'?english:null},window:{},location:{href:url.href,search:url.search,hash:url.hash,assign:next=>navigation.push(['assign',next]),replace:next=>navigation.push(['replace',next])},localStorage:{getItem:key=>{if(brokenStorage)throw Error('blocked');return preference;},setItem:(key,value)=>{if(brokenStorage)throw Error('blocked');saved.push([key,value]);}}};
  vm.runInNewContext(runtime,context);
  return {context,handlers,saved,navigation,select,english};
}
check('Compiled runtime has local messages and matching placeholders', () => {
  const page=browserFixture({locale:'fr'});
  assert.equal(page.context.window.guideI18n.locale,'fr');
  assert.equal(page.context.window.guideI18n.t('gameTally',{count:2,total:36}),ui.fr.gameTally.replace('{count}','2').replace('{total}','36'));
  assert.equal(page.context.window.guideI18n.t('completed'),ui.fr.completed);
  const broken=structuredClone(ui); broken.fr.gameTally=broken.fr.gameTally.replace('{total}','');
  assert.throws(()=>engine.compileRuntime(broken),/Changed UI parameters/);
  assert.ok(!/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/.test(runtime));
});
check('Saved preference redirects English paths while direct locales stay explicit', () => {
  const english=browserFixture({preference:'ja'});
  assert.deepEqual(english.navigation,[['replace','https://example.test/megaman-guides/ja/x3/#neon-tiger']]);
  assert.equal(english.saved.length,0);
  const explicit=browserFixture({locale:'fr',preference:'ja'});
  assert.equal(explicit.navigation.length,0);assert.equal(explicit.saved.length,0);
  const invalid=browserFixture({preference:'invented'});assert.equal(invalid.navigation.length,0);
});
check('English screenshot opt-out does not silently change preference', () => {
  const page=browserFixture({preference:'ja',query:'?lang=en'});
  assert.equal(page.navigation.length,0);assert.equal(page.saved.length,0);
});
check('Explicit switch preserves route, query, hash and browser preference', () => {
  const page=browserFixture({locale:'fr',route:'x4/zero.html',query:'?preview=covers'});
  page.select.value='de';page.handlers.change();
  assert.deepEqual(page.saved,[['field-guide:language:v1','de']]);
  assert.deepEqual(page.navigation,[['assign','https://example.test/megaman-guides/de/x4/zero.html?preview=covers#neon-tiger']]);
  assert.equal(page.english.href,'https://example.test/megaman-guides/x4/zero.html?preview=covers&lang=en#neon-tiger');
  page.context.location.hash='#volt-catfish';page.handlers['english:click']();
  assert.equal(page.english.href,'https://example.test/megaman-guides/x4/zero.html?preview=covers&lang=en#volt-catfish');
  const english=browserFixture({locale:'ja',query:'?lang=ja'});english.select.value='en';english.handlers.change();
  assert.equal(english.navigation[0][1],'https://example.test/megaman-guides/x3/?lang=en#neon-tiger');
});
check('Blocked storage still allows explicit language navigation', () => {
  const page=browserFixture({brokenStorage:true});page.select.value='ru';page.handlers.change();
  assert.equal(page.navigation[0][1],'https://example.test/megaman-guides/ru/x3/#neon-tiger');
});
// Check the actual generated English pages with identity fixtures. This is a DOM,
// extraction and safety check, not evidence of translation quality or readiness.
let englishSources,englishPages,originalEnglishPages;
if (!process.argv.includes('--fixtures-only') && fs.existsSync('dist/index.html')) {
  const dirs=fs.readdirSync('dist',{withFileTypes:true}).filter(entry=>entry.isDirectory()&&!['assets','previous',...engine.locales].includes(entry.name));
  const pages=['dist/index.html',...dirs.flatMap(dir=>fs.readdirSync('dist/'+dir.name).filter(file=>file.endsWith('.html')).map(file=>'dist/'+dir.name+'/'+file))];
  const all=new Map();let perPage=0;
  for (const file of pages) {
    const html=fs.readFileSync(file,'utf8'),required=engine.units(html);
    for (const unit of required) {
      assert.ok(!all.has(unit.key)||all.get(unit.key)===unit.source,'Cross-page source hash collision');
      all.set(unit.key,unit.source);
    }
    const dictionary=Object.fromEntries(required.map(unit=>[unit.key,unit.source]));
    const output=engine.translate(html,'fr',dictionary);
    assert.equal(output.replace('lang="fr"','lang="en"'),html,'Identity translation changed original HTML: '+file);
    perPage+=required.length;
  }
  console.log('Generated English sources: '+pages.length+' pages; '+perPage+' page units; '+all.size+' unique units.');
  const originalPages=renderedEnglish();englishSources=new Map();
  originalEnglishPages=originalPages;
  for(const html of originalPages.values())for(const unit of engine.units(html)){
    assert.ok(!englishSources.has(unit.key)||englishSources.get(unit.key)===unit.source,'Original source hash collision');englishSources.set(unit.key,unit.source);
  }
  englishPages=[...originalPages.keys()];
  assert.deepEqual(pages.map(file=>file.replace(/^dist\//,'')).sort(),[...englishPages].sort(),'Built English page inventory differs from current guide data');
}
if (process.argv.includes('--release')||process.argv.includes('--pages-only')) {
  assert.ok(englishSources&&englishPages,'Release verification requires the built English pages');
  assert.equal(englishPages.length,37,'Expected library and 36 current guides');
  const releaseDictionaries=new Map();
  if(process.argv.includes('--release')){
  const source=JSON.parse(fs.readFileSync('src/locales/source.json','utf8'));
  assert.equal(source.sourceLanguage,'en');
  assert.ok(Array.isArray(source.units)&&source.units.length,'Missing source catalog units');
  const seen=new Set();
  for(const unit of source.units){
    assert.equal(unit.key,createHash('sha256').update(unit.source).digest('hex').slice(0,16),'Stale catalog source hash');
    assert.ok(!seen.has(unit.key),'Duplicate source catalog key');seen.add(unit.key);
    if(englishSources)assert.equal(englishSources.get(unit.key),unit.source,'Catalog no longer matches built English: '+unit.key);
  }
  if(englishSources)assert.equal(seen.size,englishSources.size,'Source catalog misses current English units');
  const reviewed=JSON.parse(fs.readFileSync('src/locales/reviewed.json','utf8'));
  for(const locale of Object.keys(reviewed))assert.ok(engine.locales.includes(locale)&&locale!=='en','Unknown reviewed locale: '+locale);
  const noFallback=fallbackChecker(source.protectedTerms||[]);
  let translated=0,overrides=0;
  for(const locale of engine.locales.filter(locale=>locale!=='en')){
    const raw=JSON.parse(fs.readFileSync('src/locales/'+locale+'.json','utf8'));
    const corrections=reviewed[locale]||{};
    for(const key of Object.keys(raw))assert.ok(seen.has(key),'Unknown '+locale+' raw translation key: '+key);
    for(const key of Object.keys(corrections))assert.ok(seen.has(key),'Unknown '+locale+' reviewed translation key: '+key);
    const dictionary={...raw,...corrections};overrides+=Object.keys(corrections).length;
    releaseDictionaries.set(locale,dictionary);
    for(const unit of source.units){
      assert.ok(Object.hasOwn(dictionary,unit.key),'Missing '+locale+' source: '+unit.key);
      engine.validateValue(unit,dictionary[unit.key],source.protectedTerms||[]);
      noFallback(unit,dictionary[unit.key]);
      translated++;
    }
  }
  console.log('Release catalogs: '+translated+' current translations across 7 locales; '+overrides+' reviewed overrides; numbers, markup, canonical names, prose fallback and provider residue validated.');
  }
  const previewAt=process.argv.indexOf('--preview-locale'),preview=previewAt<0?null:process.argv[previewAt+1];
  assert.ok(!preview||(process.argv.includes('--pages-only')&&!process.argv.includes('--release')&&engine.locales.includes(preview)),'Preview locale is permitted only for --pages-only diagnostic checks');
  const pageLocales=preview?['en',...(preview==='en'?[]:[preview])]:engine.locales;
  const records=new Map(),sharedFiles=['style.css','guide.js','guide-theme.css','progress.js','progress.css','library.css','identity.css','localization.js','localization.css'];
  const hashes=new Map(sharedFiles.map(file=>[file,digest(fs.readFileSync('dist/'+file)).slice(0,10)]));
  const currentFiles=[];
  for(const locale of pageLocales){
    const prefix=locale==='en'?'':locale+'/';
    const expected=englishPages.map(file=>prefix+file).sort();
    if(locale!=='en')assert.deepEqual(htmlFiles('dist/'+locale).map(file=>file.replace(/^dist\//,'')).sort(),expected,'Missing or extra translated pages: '+locale);
    for(const file of expected){
      assert.ok(fs.existsSync('dist/'+file),'Missing current page: '+file);
      records.set(file,pageRecord(fs.readFileSync('dist/'+file,'utf8'),file));currentFiles.push(file);
    }
  }
  assert.equal(currentFiles.length,37*pageLocales.length,'Expected exactly 37 current pages per checked language');
  let checkedLinks=0;
  for(const englishFile of englishPages){
    const original=records.get(englishFile);
    const englishResources=validateAssembledPage(original,englishFile,'en',original,englishFile,records,hashes);
    for(const locale of pageLocales.filter(locale=>locale!=='en')){
      const file=locale+'/'+englishFile,record=records.get(file);
      const resources=validateAssembledPage(record,file,locale,original,englishFile,records,hashes);
      assert.deepEqual(resources,englishResources,'Media or shared resources differ from original English: '+file);
      checkedLinks+=record.tags.reduce((count,node)=>count+['href','src','poster'].filter(name=>node.attributes[name]).length,0);
    }
    if(process.argv.includes('--release'))for(const locale of engine.locales){
      const raw=originalEnglishPages.get(englishFile),route=englishFile==='index.html'?'':englishFile.replace(/index\.html$/,'');
      const translated=locale==='en'?raw:engine.translate(raw,locale,releaseDictionaries.get(locale));
      const expected=engine.decorate(translated,{locale,route}).replaceAll('\r\n','\n').replace(/\b(src|href)="((?:\.\.\/)*)([\w-]+\.(?:css|js))"/g,(match,attribute,prefix,name)=>hashes.has(name)?`${attribute}="${prefix}${name}?v=${hashes.get(name)}"`:match);
      const file=(locale==='en'?'':locale+'/')+englishFile;
      assert.equal(records.get(file).html,expected,'Assembled page differs from current source and reviewed translations: '+file);
    }
  }
  assert.equal(fs.readFileSync('dist/localization.js','utf8'),runtime.replaceAll('\r\n','\n'),'Built localized UI differs from reviewed UI catalog');
  console.log('Assembled pages: '+currentFiles.length+' current pages in '+pageLocales.join(', ')+', '+checkedLinks+' localized links; IDs, saved-progress identity, original English media, anchors, assets, locale navigation and content hashes validated.'+(process.argv.includes('--release')?' Every page matches current source and reviewed translations.':''));
}
console.log('PASS: '+checks+' localization engine/runtime regression groups. Translation corpus and native editorial quality are separate release checks.');

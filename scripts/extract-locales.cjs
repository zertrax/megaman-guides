// Run after `node scripts/build.cjs --source-only` so the inputs are undecorated English.
const fs=require('node:fs'),path=require('node:path');
const {units}=require('../src/localization.cjs');
const pages=[];
function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(e.name==='previous')continue;const p=path.join(dir,e.name);if(e.isDirectory())scan(p);else if(e.name.endsWith('.html'))pages.push(path.relative('dist',p).replaceAll('\\','/'));}}
scan('dist');
if(pages.length!==37)throw Error('Extract only the 37 original English pages');
const entries=new Map();
for(const page of pages){const html=fs.readFileSync('dist/'+page,'utf8');if(html.includes('guide-language'))throw Error('Do not extract decorated pages');for(const u of units(html)){if(!entries.has(u.key))entries.set(u.key,{...u,pages:[]});entries.get(u.key).pages.push(page);}}
const terms=new Set(['Mega Man','MegaMan','Rockman','Zero','X-Buster','Buster','Dr. Light','Dr. Wily','Sigma','Vile','X-Hunters','Ride Armor','Sub Tank','Heart Tank','Life Up','Weapon Tank','E-Tank','W-Tank','M-Tank','Rush','NaviCust','HPMemory','PowerUP','Cyber-Elf','Secret Disk','Power-Up Chips','Life/Weapon Ups','Life Up','Weapon Up','Weapon Ups','Life Ups','Gold Armor','Hyper Chip','Fourth Armor','Falcon Armor','Gaea Armor','Blade Armor','Shadow Armor','Zero Nightmare','Enigma','Dynamo']);
const descriptiveLabels=require('../src/locales/guide-labels.json');
for(const name of descriptiveLabels.canonicalItems)terms.add(name);
// A name stays English; directions, visit numbers and weather appended to it
// remain ordinary prose. Never globally freeze verbs such as fire or charge.
const identifier=value=>value?.split(/\s*·\s*|\s*→\s*|,\s*|\s*\(/)[0].trim();
const ordinary=/^(?:None|No weapon|Buster only|Same as X|Varies|Fire|Ice|Thunder|Neutral|Charged attacks|Fire attacks|Ice attacks|Thunder attacks|Neutral attacks|(?:Flame|Ice|Thunder|Neutral) charged attacks|Saber at the head|Two extra Sub Tanks|Triple Rod from Cerveau)$/i;
for(const dir of ['games','campaigns'])for(const f of fs.readdirSync('src/'+dir).filter(f=>f.endsWith('.json'))){const g=JSON.parse(fs.readFileSync('src/'+dir+'/'+f));terms.add(g.title);for(const s of [...g.stages,...(g.sideStages||[])]){terms.add(s.name);if(s.area)terms.add(identifier(s.area));if(s.alias)terms.add(s.alias);if(!f.startsWith('bn'))for(const k of ['weakness','reward','weapon'])if(s[k]&&s[k].split(/\s+/).length<=4&&!/[.;]/.test(s[k])){const name=identifier(s[k]);if(name&&!ordinary.test(name))terms.add(name);}for(const p of s.items||[])terms.add(identifier(p.name));}}
for(const name of JSON.parse(fs.readFileSync('src/locales/extra-terms.json','utf8')))terms.add(name);
for(const label of Object.keys(descriptiveLabels.labels))terms.delete(label);
for(const term of [...terms])if(/(?:Tank|Part|Chip|Disk|Cyber-Elf|Metal|Program|Bolt|Module|Fragment)$/.test(term))terms.add(term+'s');
const catalog={version:1,sourceLanguage:'en',units:[...entries.values()].sort((a,b)=>a.key.localeCompare(b.key)),protectedTerms:[...terms].filter(t=>t.length>2&&!/^(?:None|No weapon|Buster only|Same as X|Varies)$/i.test(t)).sort((a,b)=>b.length-a.length||a.localeCompare(b))};
fs.mkdirSync('src/locales',{recursive:true});fs.writeFileSync('src/locales/source.json',JSON.stringify(catalog,null,2)+'\n');
console.log(`${pages.length} English pages; ${catalog.units.length} unique sentence/label units; ${catalog.protectedTerms.length} canonical game terms.`);

// Prepare agent authoring queues. No network calls or translation model is used.
const fs=require('node:fs'),path=require('node:path');
const {validateValue,locales}=require('../src/localization.cjs');
const source=require('../src/locales/source.json'),reviewed=require('../src/locales/reviewed.json'),ui=require('../src/locales/ui.json');
const patterns=require('../src/locales/label-patterns.json').locales;
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&nbsp;/g,' ');
const plain=s=>decode(s.replace(/<[^>]*>/g,' '));
const canonical=new RegExp('(?<![A-Za-z0-9_])(?:'+source.protectedTerms.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z0-9_])','g');
function hasProse(s){return /[A-Za-z]{2}/.test(plain(s).replace(canonical,'').replace(/\b(?:X\d+|BN\d+|MM\d+)\b/g,''));}
function label(unit,locale){
 const original=unit.source,labels=patterns[locale];
 if(Object.hasOwn(labels,original))return labels[original];
 const weapon=original.match(/^<span class="eyebrow">(Weakness|Reward|You earn|Use)<\/span><strong>([\s\S]+)<\/strong>$/);
 if(weapon&&!hasProse(weapon[2]))return '<span class="eyebrow">'+ui[locale][{Weakness:'weaknessLabel',Reward:'rewardLabel','You earn':'earnLabel',Use:'useLabel'}[weapon[1]]]+'</span><strong>'+weapon[2]+'</strong>';
 let remaining=original,value=original;
 for(const [phrase,target]of Object.entries(labels)){
  if(phrase==='MEGA MAN'){
   remaining=remaining.replace(/\bMEGA MAN\b/g,'');continue;
  }
  if(phrase.endsWith(' ')&&remaining.startsWith(phrase)){remaining=remaining.slice(phrase.length);value=target+value.slice(phrase.length);}
  else if(phrase.startsWith(' ')&&remaining.endsWith(phrase)){remaining=remaining.slice(0,-phrase.length);value=value.slice(0,-phrase.length)+target;}
 }
 for(const phrase of ['Need','Now','Return','Optional','None'])for(const tag of ['strong','small']){
  const fragment='<'+tag+'>'+phrase+'</'+tag+'>';
  if(remaining.includes(fragment)){remaining=remaining.replaceAll(fragment,'');value=value.replaceAll(fragment,'<'+tag+'>'+labels[phrase]+'</'+tag+'>');}
 }
 return !hasProse(remaining)?value:null;
}
const reset=process.argv.includes('--reset-authoring');
const dir=path.resolve(process.argv.find((arg,index)=>index>1&&!arg.startsWith('--'))||'../../guide-research/translation-queues');
fs.mkdirSync(dir,{recursive:true});
for(const locale of locales.filter(l=>l!=='en')){
 const file='src/locales/'+locale+'.json',dictionary={},pending=[];
 const existing=!reset&&fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};
 for(const unit of source.units){
  let value=reviewed[locale]?.[unit.key]??existing[unit.key]??(!hasProse(unit.source)?unit.source:label(unit,locale));
  if(value!==null&&value!==undefined){validateValue(unit,value,source.protectedTerms);dictionary[unit.key]=value;}
  else pending.push({...unit,protectedOccurrences:plain(unit.source).match(canonical)||[]});
 }
 // Preserve validated source-hash entries by default. An explicit reset keeps
 // the old draft outside the repository before preparing a fresh catalog.
 if(reset&&fs.existsSync(file))fs.copyFileSync(file,path.join(dir,locale+'-prior-draft.json'));
 fs.writeFileSync(file,JSON.stringify(dictionary,null,2)+'\n');
 const queueDir=path.join(dir,locale);fs.mkdirSync(queueDir,{recursive:true});
 pending.sort((a,b)=>a.source.length-b.source.length);
 for(let i=0;i<pending.length;i+=100)fs.writeFileSync(path.join(queueDir,String(i/100+1).padStart(3,'0')+'.json'),JSON.stringify(pending.slice(i,i+100),null,2)+'\n');
 fs.writeFileSync(path.join(dir,locale+'-inventory.json'),JSON.stringify({locale,total:source.units.length,prepared:Object.keys(dictionary).length,pending:pending.length,chunks:Math.ceil(pending.length/100)},null,2)+'\n');
 console.log(locale+': '+Object.keys(dictionary).length+' reviewed/template/name entries; '+pending.length+' authoring units in '+Math.ceil(pending.length/100)+' chunks.');
}

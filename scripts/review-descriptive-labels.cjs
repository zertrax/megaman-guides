// Apply explicitly authored translations for guide-written headings. Never
// rename in-game identifiers or alter the translator-owned draft dictionaries.
const fs=require('node:fs'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const engine=require('../src/localization.cjs');
const source=require('../src/locales/source.json');
const headings=require('../src/locales/guide-labels.json');
const reviewed=require('../src/locales/reviewed.json');
const pairs=Object.entries(headings.labels).sort(([a],[b])=>b.length-a.length);
const errors=[];
for(const locale of headings.locales){
  const dictionary=require('../src/locales/'+locale+'.json');
  const index=headings.locales.indexOf(locale);let changed=0;
  for(const unit of source.units){
    const original=reviewed[locale]?.[unit.key]??dictionary[unit.key];
    if(original===undefined)continue;
    const applicable=pairs.filter(([label])=>unit.source.includes(label));
    if(!applicable.length)continue;
    const replace=text=>{for(const [label,values]of applicable)text=text.replaceAll(label,values[index]);return text;};
    const value=unit.kind==='attribute'?replace(original):original.split(/(<[^>]*>)/g).map((part,i)=>i%2?part:replace(part)).join('');
    if(value===original)continue;
    try{engine.validateValue(unit,value,source.protectedTerms);}
    catch(error){errors.push({locale,key:unit.key,source:unit.source,value,error:error.message});continue;}
    reviewed[locale][unit.key]=value;changed++;
  }
  console.log(locale+': '+changed+' descriptive heading units corrected.');
}
if(errors.length){console.log(JSON.stringify(errors,null,2));process.exit(1);}
const file='src/locales/reviewed.json',temporary=file+'.tmp';
fs.writeFileSync(temporary,JSON.stringify(reviewed,null,2)+'\n');
fs.renameSync(temporary,file);

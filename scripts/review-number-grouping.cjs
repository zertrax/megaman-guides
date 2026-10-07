// Keep the exact source values while using readable integer grouping in prose.
const fs=require('node:fs'),path=require('node:path');
process.chdir(path.resolve(__dirname,'..'));
const source=require('../src/locales/source.json');
const engine=require('../src/localization.cjs');
const reviewed=require('../src/locales/reviewed.json');
const separators={'pt-BR':'.',de:'.',fr:'\u202F',ru:'\u00A0'};
const grouped=/(?<![\p{N}.,])\d{1,3}(?:,\d{3})+(?!\p{N}|[,.]\p{N})/gu;
for(const [locale,separator]of Object.entries(separators)){
  const dictionary=require('../src/locales/'+locale+'.json');let changed=0;
  for(const unit of source.units){
    if(!unit.source.match(grouped))continue;
    const original=reviewed[locale]?.[unit.key]??dictionary[unit.key];
    if(original===undefined)throw Error('Complete numeric instruction before reviewing: '+locale+' '+unit.key);
    const replace=text=>text.replace(grouped,number=>number.replaceAll(',',separator));
    // Attributes and immutable code keep their source representation. These
    // current numeric instructions are prose, including a short strong heading.
    if(unit.kind!=='html'||/<(?:code|pre|script)\b/i.test(original))throw Error('Review grouped numeric code/attribute separately: '+unit.key);
    const value=original.split(/(<[^>]*>)/g).map((part,i)=>i%2?part:replace(part)).join('');
    engine.validateValue(unit,value,source.protectedTerms);
    if(value!==original){reviewed[locale][unit.key]=value;changed++;}
  }
  console.log(locale+': '+changed+' grouped-number instructions reviewed.');
}
const file='src/locales/reviewed.json',temporary=file+'.tmp';
fs.writeFileSync(temporary,JSON.stringify(reviewed,null,2)+'\n');fs.renameSync(temporary,file);

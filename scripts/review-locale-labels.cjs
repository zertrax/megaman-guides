// Variable weapon panels share manually authored labels; their game names remain English.
const fs=require('node:fs'),{locales,validateValue}=require('../src/localization.cjs');
const source=require('../src/locales/source.json'),ui=require('../src/locales/ui.json');
const labels={'Weakness':'weaknessLabel','Reward':'rewardLabel','You earn':'earnLabel','Use':'useLabel'};
const selected=process.argv[2];
for(const locale of locales.filter(l=>l!=='en'&&(!selected||l===selected))){
 const file='src/locales/'+locale+'.json',dict=JSON.parse(fs.readFileSync(file,'utf8'));let changed=0;
 for(const unit of source.units){
  if(!dict[unit.key])continue;
  const match=unit.source.match(/^<span class="eyebrow">(Weakness|Reward|You earn|Use)<\/span><strong>([\s\S]+)<\/strong>$/);
  if(!match)continue;
  const content=dict[unit.key].match(/<strong>([\s\S]+)<\/strong>/)?.[1];
  if(!content?.trim())throw Error('Empty weapon field: '+locale+'/'+unit.key);
  dict[unit.key]='<span class="eyebrow">'+ui[locale][labels[match[1]]]+'</span><strong>'+content+'</strong>';
  validateValue(unit,dict[unit.key],source.protectedTerms);changed++;
 }
 fs.writeFileSync(file,JSON.stringify(dict,null,2)+'\n');console.log(locale+': '+changed+' variable weapon labels reviewed.');
}

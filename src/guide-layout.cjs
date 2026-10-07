// Shared presentation; game-specific introductions and choices stay in guide data.
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function revise(html,g,{pickup}) {
 const index=html.match(/<section id="pickups">[\s\S]*?<\/section>/)?.[0];
 if(!index)throw Error('Missing pickup index: '+g.id);
 html=html.replace(index,'').replace(g.videos.length?'<section id="media">':'<section id="sources">',index+(g.videos.length?'<section id="media">':'<section id="sources">'));
 const basics=html.match(/<details class="basics" id="basics">[\s\S]*?<\/details>/)?.[0];
 if(!basics||!g.startHereHtml)throw Error('Missing introduction: '+g.id);
 html=html.replace(basics,'').replace('<section id="route">',g.startHereHtml+(g.decisionsHtml||'')+basics+'<section id="route">');
 const links='<a href="#start-here">Start here · '+escape(g.displayId||g.id.toUpperCase())+' basics</a>'+(g.decisionsHtml?'<a href="#decide-first">Gold &amp; saber choices</a>':'');
 html=html.replace('<nav aria-label="Guide contents">','<nav aria-label="Guide contents">'+links).replace('<span class="eyebrow">On this page</span>','<span class="eyebrow">On this page</span>'+links);
 html=html.replace('<h2>Choose your roadmap</h2>','<h2>Your route through '+escape(g.displayId||g.id.toUpperCase())+'</h2>');
 html=html.replace('Choose a roadmap</a>',(g.routes.length===1?'Recommended route':'Choose a route')+'</a>');
 html=html.replaceAll('save this pickup for the cleanup route','collect this pickup on a later visit');
 const heroLinks='<nav class="hero-actions" aria-label="Start or continue">'+g.heroLinks.map(a=>'<a href="'+escape(a.href)+'">'+escape(a.text)+' →</a>').join('')+'</nav>';
 html=html.replace('<div class="facts">',heroLinks+'<div class="facts">');
 for(const s of g.stages) {
  const chips=g.id==='x3'?s.items.filter(p=>p.type==='chip'):[];
  if(chips.length){
   const before='<div class="pickup-grid'+(s.items.length>2?' many-pickups':'')+'">'+s.items.map(p=>pickup(p,s)).join('')+'</div>';
   const after='<div class="pickup-grid'+(s.items.length>2?' many-pickups':'')+'">'+s.items.filter(p=>p.type!=='chip').map(p=>pickup(p,s)).join('')+'</div><details class="chip-alternative" id="optional-'+s.id+'"><summary>◇ Pink '+escape(chips[0].name)+' · skip for Gold <span>Optional alternative</span></summary><p>Choose an individual enhancement only if you do not want Gold Armor. Taking it prevents the Gold capsule from appearing for the rest of this playthrough.</p><div class="pickup-grid">'+chips.map(p=>pickup(p,s)).join('')+'</div></details>';
   if(!html.includes(before))throw Error('Pickup grid changed unexpectedly: '+s.id);
   html=html.replace(before,after);
  }
  for(const p of s.items){
   const original='<span class="pickup-icon '+p.type+'" aria-hidden="true">'+({heart:'♥',tank:'▣',armor:'◆',ride:'▰',chip:'◇',weaponTank:'▣',ex:'✦',rare:'◈'}[p.type])+'</span>'+escape(p.name)+'</a>';
   const when=p.timing==='first'?'Now':p.timing==='return'?'Return':g.id==='x3'?'Skip for Gold':'Optional';
   html=html.replace(original,original.replace('</a>',' <small>'+when+'</small></a>'));
  }
 }
 if(g.id==='x3')html=html.replace('<b>4</b> Optional chip locations','<b>4</b> chip alternatives · skip for Gold');
 return html.replace('<link rel="stylesheet" href="style.css">','<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="../guide-theme.css">');
}
module.exports={revise};

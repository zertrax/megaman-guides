const {iconLink,iconCredit,releaseRecord}=require('./guide-icons.cjs');
const {gameButton}=require('./progress-template.cjs');
const {gameInfo,yearCredits,libraryCoverCredits}=require('./game-info.cjs');
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const groups=[['classic','Mega Man'],['x','Mega Man X'],['zero','Zero / ZX'],['network','Battle Network']];
function card(g){
 const href=g.id==='x4-zero'?'x4/zero.html':g.id+'/';
 const {year,cover:{preview}}=gameInfo(g.id);
 return '<article class="game-entry" data-game-id="'+e(g.id)+'"><a class="game-card" href="'+e(href)+'" aria-label="'+e(g.title)+' guide"><img class="card-cover" src="'+e(preview.src)+'" alt="" width="'+preview.width+'" height="'+preview.height+'" loading="lazy" decoding="async"><div class="game-card-copy"><span class="game-year">'+year+'</span><h3>'+e(g.title)+'</h3><span class="game-collection">'+e(releaseRecord(g.id).name)+'</span></div><span class="card-arrow" aria-hidden="true">›</span></a>'+gameButton(g.id,g.title,true)+'</article>';
}
function render(x,campaigns){
 const all=[...x.map(g=>({...g,series:'x'})),...campaigns];
 const sections=groups.map(([id,name])=>{
  const games=all.filter(g=>g.series===id).sort((a,b)=>gameInfo(a.id).year-gameInfo(b.id).year||a.id.localeCompare(b.id,'en',{numeric:true}));
  return '<section id="'+id+'" data-progress-group><div class="section-head"><h2>'+name+'</h2><span class="eyebrow library-progress" data-game-tally hidden>0 / '+games.length+' completed</span></div><div class="game-grid">'+games.map(card).join('')+'</div></section>';
 }).join('');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#071b34"><meta name="description" content="Mega Man field guides for Classic, X, Zero/ZX and Battle Network."><title>Mega Man · Field Guides</title>'+iconLink('library','')+'<link rel="stylesheet" href="style.css"><link rel="stylesheet" href="guide-theme.css"><link rel="stylesheet" href="progress.css"><link rel="stylesheet" href="library.css"><script src="progress.js" defer></script></head><body data-guide-id="library"><a class="skip" href="#collections">Skip to collections</a><main class="library"><header class="hero"><span class="eyebrow">Your Mega Man library</span><h1>MEGA MAN <span>FIELD GUIDES</span></h1><div class="library-progress" hidden><span class="eyebrow">My progress</span><strong data-game-tally>0 / '+all.length+' completed</strong></div><p class="library-hint">Open a guide, or check off a game you’ve finished.</p><nav class="hero-actions" aria-label="Collections">'+groups.map(([id,name])=>'<a href="#'+id+'">'+name+'</a>').join('')+'</nav></header><div id="collections">'+sections+'</div><footer><p>Select a card to open its guide. Use its check button to mark the game complete; select it again to undo.</p><p>Completion marks and reading positions stay in this browser. They do not carry between devices, the local preview and the public site, or survive clearing this site’s browser data.</p>'+yearCredits()+iconCredit('library')+libraryCoverCredits(all)+'<p>Independent fan guides. Mega Man and game imagery © Capcom. No account, ads or external fonts.</p><a href="https://github.com/zertrax/megaman-x-guides">Source on GitHub ↗</a></footer></main><p class="progress-announcement sr-only" role="status" aria-live="polite"></p><p class="progress-save-error" role="status" hidden></p></body></html>';
}
module.exports={render};

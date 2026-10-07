const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function gameButton(id,title,compact=false){return `<button type="button" class="completion-toggle${compact?' card-complete':''}" data-game-complete="${escape(id)}" data-completion-name="${escape(title)}" aria-pressed="false" aria-label="Mark ${escape(title)} complete" title="Mark ${escape(title)} complete" hidden><span class="completion-check" aria-hidden="true">✓</span><span data-completion-label>${compact?'Mark complete':'Mark game complete'}</span></button>`;}
function enhance(html,g){
 const noun=g.networkGame?'Chapter':g.series==='zero'?'Mission':'Stage';
 const stages=[...g.stages,...(g.sideStages||[])];
 html=html.replace(/(<section class="stage" id="([^"]+)")(>)([\s\S]*?<\/h2>)/g,(_,open,id,close,heading)=>{
  const s=stages.find(s=>s.id===id);if(!s)throw Error('Unrecognized progress stage: '+id);
  return open+' data-stage-id="'+id+'"'+close+`<span class="completion-stamp stage-stamp" hidden>${noun} clear</span>`+heading+`<button type="button" class="completion-toggle stage-complete" data-stage-complete="${id}" data-completion-name="${escape(s.name)}" aria-pressed="false" aria-label="Mark ${escape(s.name)} complete" title="Mark ${escape(s.name)} complete" hidden><span class="completion-check" aria-hidden="true">✓</span></button>`;
 });
 html=html.replace(/<li class="boss-panel">([\s\S]*?<h3><a href="#([^"]+)")/g,(_,content,id)=>`<li class="boss-panel" data-stage-id="${id}"><span class="completion-stamp flow-stamp" hidden>${noun} clear</span>`+content);
 const progress=`<div class="guide-progress" hidden><div><span class="eyebrow">My progress</span><span data-stage-tally>0 / ${stages.length} ${noun.toLowerCase()}${stages.length===1?'':'s'} cleared</span></div>${gameButton(g.id,g.title)}<small>Use the check beside a ${noun.toLowerCase()} name to mark it clear. Mark the game complete after the final stages. Saved in this browser.</small></div>`;
 html=html.replace('<div class="facts">',progress+'<div class="facts">');
 html=html.replace('</head>','<link rel="stylesheet" href="../progress.css"><script src="../progress.js" defer></script></head>');
 return html.replace('</body>','<p class="progress-announcement sr-only" role="status" aria-live="polite"></p><p class="progress-save-error" role="status" hidden></p></body>');
}
module.exports={enhance,gameButton};

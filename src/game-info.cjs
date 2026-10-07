// Shared identity metadata; game content and saved-progress IDs stay unchanged.
const metadata=require('./game-info.json');
const e=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function gameInfo(id){const record=metadata.games[id];if(!record)throw Error('Missing game identity: '+id);return record;}
function yearCredits(){return '<p>Years show the first original release worldwide, including the equivalent Japanese version. '+metadata.yearSources.map((url,i)=>'<a href="'+url+'" target="_blank" rel="noopener">'+['Release history','Battle Network 3 versions','Battle Network 5 versions'][i]+'</a>').join(' · ')+'.</p>';}
function libraryCoverCredits(games){return '<details class="library-credits"><summary>Cover artwork &amp; sources</summary><p>Original imagery © Capcom. Scans are archived by libretro-thumbnails. Mega Man 9 and 10 use their official promotional covers; Mega Man 11 uses its official Steam artwork.</p><ul>'+games.filter(g=>g.id!=='x4-zero').map(g=>'<li><a href="'+e(gameInfo(g.id).cover.source)+'" target="_blank" rel="noopener">'+e(g.title)+'</a> — '+e(gameInfo(g.id).cover.credit)+'</li>').join('')+'</ul></details>';}
function enhance(html,g){
 const {cover}=gameInfo(g.id),preview=cover.preview;
 const start=html.indexOf('<div class="hero" id="intro">');
 if(start<0)throw Error('Missing title card: '+g.id);
 const tags=/<\/?div\b[^>]*>/g;tags.lastIndex=start;let depth=0,end;
 for(let match;(match=tags.exec(html));){depth+=match[0].startsWith('</')?-1:1;if(depth===0){end=match.index;break;}}
 if(end===undefined)throw Error('Unclosed title card: '+g.id);
 const figure='<figure class="game-cover"><a class="cover-link" href="'+e(cover.src)+'" data-lightbox data-title="'+e(g.title)+' · '+e(cover.kind)+'" aria-label="Enlarge '+e(g.title)+' cover"><img src="'+e(preview.src)+'" width="'+preview.width+'" height="'+preview.height+'" alt="'+e(g.title)+' — '+e(cover.kind)+'" decoding="async"><span aria-hidden="true">⤢</span></a></figure>';
 html=html.slice(0,end)+figure+html.slice(end);
 html=html.replace('<div class="hero" id="intro">','<div class="hero guide-hero" id="intro">');
 const credit='<p>'+e(cover.kind)+': <a href="'+e(cover.source)+'" target="_blank" rel="noopener">'+e(g.title)+'</a>. '+e(cover.credit)+'. Whole-cover previews are resized; enlarged artwork retains the source pixels.</p>';
 html=html.replace(/(<section id="sources">[\s\S]*?<\/h2>)/, '$1'+credit);
 return html.replace('</head>','<link rel="stylesheet" href="../identity.css"></head>');
}
module.exports={gameInfo,yearCredits,libraryCoverCredits,enhance};

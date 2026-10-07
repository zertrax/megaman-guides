// Original vector helmet marks, shared between library cards and browser icons.
// Number and version badges distinguish campaigns without adding image downloads.
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function identity(id){
 if(id==='library')return {helmet:'classic',series:'MM',number:'',accent:'#82e0ff'};
 if(id==='x4-zero')return {helmet:'zero',series:'X',number:'4',variant:'Z',accent:'#ff8b99'};
 const x=id.match(/^x([1-8])$/);if(x)return {helmet:'x',series:'X',number:x[1],accent:'#82e0ff'};
 const classic=id.match(/^mm(\d+)$/);if(classic)return {helmet:'classic',series:'MM',number:classic[1],accent:'#82e0ff'};
 const zero=id.match(/^zero([1-4])$/);if(zero)return {helmet:'zero',series:'Z',number:zero[1],accent:'#ff8b99'};
 if(id==='zx')return {helmet:'zx',series:'ZX',number:'',accent:'#86efc3'};
 if(id==='zx-advent')return {helmet:'advent',series:'ZX',number:'A',accent:'#ffce66'};
 const bn=id.match(/^bn([1-6])(?:-(.+))?$/);
 if(bn){
  const variants={'white':['W','#eef5ff'],'blue':['B','#74b8ff'],'red-sun':['R','#ff957c'],'blue-moon':['B','#97b7ff'],'team-protoman':['P','#ff8b99'],'team-colonel':['C','#d6adff'],'cybeast-gregar':['G','#ffce66'],'cybeast-falzar':['F','#86efc3']};
  const variant=bn[2]?variants[bn[2]]:null;
  if(bn[2]&&!variant)throw Error('Unknown icon version: '+id);
  return {helmet:'network',series:'BN',number:bn[1],variant:variant?.[0],accent:variant?.[1]||'#82e0ff'};
 }
 throw Error('Missing guide icon identity: '+id);
}
function helmet(type){
 const face='<path d="M19 27h26v12c0 9-6 14-13 14s-13-5-13-14z" fill="#ffdab4"/><path d="m23 34 8-2v8h-8zm10-2 8 2v6h-8z" fill="#fff" stroke="none"/><path d="M28 33h3v7h-3zm5 0h3v7h-3z" fill="#09203d" stroke="none"/><path d="M29 45h6" fill="none" stroke="#a45c56" stroke-width="2" stroke-linecap="round"/>';
 const blue=type==='network'?'#237dd6':'#218ce5';
 if(type==='classic')return `${face}<path d="M15 35V24C15 13 22 7 32 7s17 6 17 17v11l-7-5V25H22v5z" fill="${blue}"/><path d="M29 8h6v15h-6z" fill="#87e6ff"/><path d="M11 26h8v17h-8zm34 0h8v17h-8z" fill="#4bbfff"/><path d="M17 41l6 8h18l6-8v9l-8 6H25l-8-6z" fill="#218ce5"/><path d="M18 19c2-5 7-8 12-9" fill="none" stroke="#b2efff" stroke-width="2"/>`;
 if(type==='x')return `${face}<path d="M14 36V24C14 12 22 6 32 6s18 6 18 18v12l-9-7-3-6H26l-3 6z" fill="${blue}"/><path d="M28 8h8l2 10-6 6-6-6z" fill="#daecff"/><path d="M30 9h4l2 8-4 4-4-4z" fill="#ff5475"/><path d="M10 26h9v17h-9zm35 0h9v17h-9z" fill="#cfeaff"/><path d="M11 31h6v7h-6zm36 0h6v7h-6z" fill="#ffce66"/><path d="M17 40l7 9h16l7-9v10l-8 6H25l-8-6z" fill="#1372c9"/>`;
 if(type==='network')return `${face}<path d="M14 34V23C14 12 22 6 32 6s18 6 18 17v11l-9-7-2-5H25l-2 5z" fill="${blue}"/><path d="M29 7h6v12h-6z" fill="#72d9ff"/><path d="M9 20l8-4v27H9zm38-4 8 4v23h-8z" fill="#102542"/><circle cx="14" cy="31" r="7" fill="#ffd16e"/><circle cx="50" cy="31" r="7" fill="#ffd16e"/><circle cx="14" cy="31" r="4" fill="#172c4d"/><circle cx="50" cy="31" r="4" fill="#172c4d"/><path d="M16 41l8 8h16l8-8v10l-9 5H25l-9-5z" fill="#236fbe"/><path d="M10 31h8m32-4v8" stroke="#f66e75" stroke-width="2"/>`;
 const advent=type==='advent',zx=type==='zx',red=advent?'#edf4ff':'#eb5268';
 return `<path d="M16 20 9 44l9-5-3 13 10-6 4-26z" fill="#ffda75"/>${face}<path d="M14 36V22C14 12 22 6 32 6s18 6 18 16v14l-9-8-2-5H25l-2 5z" fill="${red}"/><path d="M23 8l9 3 9-3-3 14-6 6-6-6z" fill="${advent?'#49536b':'#edf4ff'}"/><path d="M29 12h6l2 8-5 5-5-5z" fill="#50e8bc"/><path d="M10 24h9v19h-9zm35 0h9v19h-9z" fill="${advent?'#f2a053':zx?'#277cce':'#ccefff'}"/><path d="M13 29h4v9h-4zm34 0h4v9h-4z" fill="#4ba7d2"/><path d="M17 41l7 8h16l7-8v10l-8 5H25l-8-5z" fill="${advent?'#55647e':'#b62949'}"/>`;
}
function svg(id,title){
 const {helmet:type,series,number,variant,accent}=identity(id);
 const badge=number?`<path d="M42 42h21v21H40V46z" fill="#071b34" stroke="${accent}" stroke-width="1.5"/><text x="51.5" y="58.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="${number.length>1?15:19}" font-weight="bold" fill="${accent}">${number}</text>`:'';
 const version=variant?`<path d="M47 1h15v15H47z" fill="${accent}"/><text x="54.5" y="12" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="#071b34">${variant}</text>`:'';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title"><title id="title">${escape(title||id)} helmet icon</title><path d="M8 1h55v54l-8 8H1V8z" fill="#0b2b4b" stroke="${accent}" stroke-width="1.5"/><g stroke="#071b34" stroke-width="1.2" stroke-linejoin="round">${helmet(type)}</g><path d="M1 51h29v12H1z" fill="#071b34"/><text x="5" y="60" font-family="Arial,sans-serif" font-size="9" font-weight="bold" fill="${accent}">${series}</text>${badge}${version}</svg>`;
}
function iconPath(id){identity(id);return 'icons/'+id+'.svg';}
function iconLink(id,prefix='../'){return `<link rel="icon" type="image/svg+xml" sizes="any" href="${prefix}${iconPath(id)}">`;}
module.exports={svg,iconPath,iconLink};

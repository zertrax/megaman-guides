// Use the unmodified desktop icon of each guide's actual Steam release.
// Collection games share their release icon; artwork is never redrawn or badged.
const {releases}=require('./guide-icons.json');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function iconRecord(id){
 let app;
 if(id==='library')app=363440;
 else if(/^x[1-4]$/.test(id)||id==='x4-zero')app=743890;
 else if(/^x[5-8]$/.test(id))app=743900;
 else if(/^mm[1-6]$/.test(id))app=363440;
 else if(/^mm(?:[7-9]|10)$/.test(id))app=495050;
 else if(id==='mm11')app=742300;
 else if(/^zero[1-4]$/.test(id)||id==='zx'||id==='zx-advent')app=999020;
 else if(/^bn[1-3](?:-|$)/.test(id))app=1798010;
 else if(/^bn[4-6](?:-|$)/.test(id))app=1798020;
 if(!app)throw Error('Missing original icon for guide: '+id);
 return releases[app];
}
function iconPath(id){return iconRecord(id).src;}
function iconLink(id,prefix='../'){return '<link rel="icon" type="image/x-icon" href="'+prefix+iconPath(id)+'">';}
function iconCredit(id){const r=iconRecord(id);return '<p class="muted">Original desktop icon: <a href="'+r.store+'" target="_blank" rel="noopener">'+escape(r.name)+'</a>. Artwork © Capcom, distributed by Steam.</p>';}
module.exports={iconRecord,iconPath,iconLink,iconCredit};

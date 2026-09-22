// Local comparison tools only. Run after build; never included in a normal build.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../dist');
const script = `(() => {
  const style = document.createElement('style');
  style.textContent = '.size-lab{position:fixed;z-index:100;bottom:12px;right:12px;background:#142231;color:#eef6ff;border:1px solid #78dcee;border-radius:8px;padding:10px 14px;max-width:calc(100vw - 24px);box-shadow:0 4px 24px #0008}.size-lab summary{cursor:pointer;font-weight:700}.size-lab label{display:block;margin:12px 0 6px}.size-lab input{width:100%}.size-lab button{margin:6px 5px 0 0;padding:5px 9px}.size-lab p{font-size:13px;margin:7px 0}.size-lab nav{display:flex;gap:14px}.size-lab output{font-weight:bold}html[data-size-preview] .many-pickups .shot img{max-height:var(--preview-shot-height)!important}';
  document.head.append(style);
  const panel = document.createElement('details');
  panel.className='size-lab'; panel.open=true;
  panel.innerHTML='<summary>Screenshot size · local preview</summary><label for="shot-height">3+ rewards: <output id="shot-value">Current default</output></label><input id="shot-height" type="range" min="120" max="420" step="10" value="220"><div><button type="button" data-height="180">180px</button><button type="button" data-height="220">220px</button><button type="button" data-height="300">300px</button><button type="button" data-height="reset">Original</button></div><p>Maximum height; images shrink to fit their width.<br>Only this local preview changes. Collapse this panel to compare.</p><nav><a href="../x5/#grizzly">X5 · 3 rewards</a><a href="../x3/#blizzard-buffalo">X3 · 3 rewards</a></nav>';
  document.body.append(panel);
  const slider=panel.querySelector('input'), output=panel.querySelector('output');
  const apply=value=>{const original=value==='reset';document.documentElement.toggleAttribute('data-size-preview',!original);if(!original){slider.value=value;document.documentElement.style.setProperty('--preview-shot-height',value+'px');}output.textContent=original?'Current default':value+'px';try{sessionStorage.setItem('shot-size-preview',value)}catch{}};
  slider.addEventListener('input',()=>apply(slider.value));
  panel.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>apply(b.dataset.height)));
  try{apply(sessionStorage.getItem('shot-size-preview')||'220')}catch{apply('220')}
})();`;
fs.writeFileSync(path.join(root,'size-preview.js'),script);
for(const dir of ['x1','x2','x3','x4','x5','x6','x7','x8'])for(const file of fs.readdirSync(path.join(root,dir)).filter(f=>f.endsWith('.html'))){
 const target=path.join(root,dir,file);
 let html=fs.readFileSync(target,'utf8');
 if(!html.includes('size-preview.js'))html=html.replace('</body>','<script src="../size-preview.js"></script></body>');
 fs.writeFileSync(target,html);
}
console.log('Local screenshot-height controls added. A normal build removes them.');


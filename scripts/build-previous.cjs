const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');

const revision = 'b802060b6c377e43e186136a393ef9804e184e85';
const root = path.resolve(__dirname, '..');

function buildPrevious() {
  const temporaryRoot = fs.realpathSync(os.tmpdir());
  const scratch = fs.mkdtempSync(path.join(temporaryRoot, 'megaman-previous-'));
  const destination = path.join(root, 'dist', 'previous');
  try {
    execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, 'archive', '--format=tar', '--output=' + path.join(scratch, 'source.tar'), revision], {cwd: root});
    execFileSync('tar', ['-xf', path.join(scratch, 'source.tar'), '-C', scratch]);
    execFileSync(process.execPath, ['scripts/build.cjs'], {cwd: scratch, stdio: 'pipe'});
    execFileSync(process.execPath, ['scripts/verify-all.cjs'], {cwd: scratch, stdio: 'pipe'});
    fs.cpSync(path.join(scratch, 'dist'), destination, {recursive: true});
    // Comparison pages must not overwrite the current guides' reading position.
    const script = path.join(destination, 'guide.js');
    fs.writeFileSync(script, fs.readFileSync(script, 'utf8').replaceAll('field-guide', 'field-guide-previous'));
    fs.writeFileSync(path.join(destination, 'version.json'), JSON.stringify({
      label: 'Previous public X1–X8 guides', revision,
      source: 'https://github.com/zertrax/megaman-guides/tree/' + revision,
      note: 'Original presentation and content. Browser reading settings use a separate namespace.'
    }, null, 2) + '\n');
    console.log('Previous public version: 9 X campaigns, preserved at /previous/');
  } finally {
    const resolved = fs.realpathSync(scratch);
    if (path.dirname(resolved) !== temporaryRoot || !path.basename(resolved).startsWith('megaman-previous-')) throw Error('Unsafe archive cleanup path');
    fs.rmSync(resolved, {recursive: true});
  }
}

module.exports = {buildPrevious, revision};

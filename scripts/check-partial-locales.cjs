// Read-only authoring check. Missing entries are expected during a draft;
// verify-localization.cjs --release is the complete publication gate.
const fs = require('node:fs');
const path = require('node:path');
process.chdir(path.resolve(__dirname, '..'));
const engine = require('../src/localization.cjs');
const source = require('../src/locales/source.json');
const reviewed = require('../src/locales/reviewed.json');
const requested = process.argv.slice(2);
const locales = requested.length ? requested : engine.locales.filter(locale => locale !== 'en');
let failures = 0;
for (const locale of locales) {
  if (!engine.locales.includes(locale) || locale === 'en') throw new Error('Unknown translation locale: ' + locale);
  const file = 'src/locales/' + locale + '.json';
  const dictionary = {...(fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}), ...reviewed[locale]};
  const errors = [];
  let present = 0;
  for (const unit of source.units) {
    if (!Object.hasOwn(dictionary, unit.key)) continue;
    present++;
    try { engine.validateValue(unit, dictionary[unit.key], source.protectedTerms); }
    catch (error) { errors.push({key:unit.key, message:error.message}); }
  }
  failures += errors.length;
  console.log(locale + ': ' + present + '/' + source.units.length + ' present; ' + errors.length + ' invalid.');
  for (const error of errors) console.log('  ' + error.key + ': ' + error.message);
}
if (failures) process.exitCode = 1;

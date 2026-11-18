// Writes the pedal drawings of the site, site/landing/pedal-<id>.svg, from the
// generator site/pedal-model.js (realistic style, cables plugged in).
//   node tools/pedal-models.mjs          write the files
//   node tools/pedal-models.mjs --check  fail when a file is missing or out of date
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const site = new URL('../site/', import.meta.url);
const context = {};
vm.runInNewContext(readFileSync(new URL('pedal-model.js', site), 'utf8'), context);
const { PEDALMODEL } = context;

const check = process.argv.includes('--check');
const stale = [];
for (const id of Object.keys(PEDALMODEL.pedals)) {
  const file = `landing/pedal-${id.replace('-', '')}.svg`;
  const svg = '<!-- Drawn by tools/pedal-models.mjs from site/pedal-model.js: do not edit by hand. -->\n' +
    PEDALMODEL.render(id, { style: 'real', cables: true }) + '\n';
  const url = new URL(file, site);
  const current = existsSync(url) ? readFileSync(url, 'utf8') : null;
  if (current === svg) continue;
  if (check) stale.push(file);
  else { writeFileSync(url, svg); console.log(`wrote site/${file} (${(svg.length / 1024).toFixed(0)} KB)`); }
}
if (check) {
  if (stale.length) {
    console.error(`Out of date: ${stale.map((f) => 'site/' + f).join(', ')}. Run node tools/pedal-models.mjs`);
    process.exit(1);
  }
  console.log('pedal drawings: up to date');
}

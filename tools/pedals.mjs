#!/usr/bin/env node
// Writes the pedal menu of every page, and the beta bar of the beta pedals, from site/pedals.js.
//   node tools/pedals.mjs           rewrite the pages
//   node tools/pedals.mjs --check   change nothing; fail if a page is out of date or another list of pedals disagrees
//   --site <dir>                    work on another copy of site/ (for tests; the other lists are not checked)
// The menu of a pedal page links every other pedal to the same page when that pedal has it, else to its Effects page.
// Pages outside the pedal folders (privacy.html) belong to the first pedal of the list.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const check = args.includes('--check');
const SITE = resolve(args.includes('--site') ? args[args.indexOf('--site') + 1] : join(ROOT, 'site'));
const PEDALS = vm.runInNewContext(`${readFileSync(join(SITE, 'pedals.js'), 'utf8')}\n;PEDAL_LIST`, {});

const esc = text => String(text).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const label = pedal => `${pedal.name} ${pedal.kind}`;
const htmlPages = folder => existsSync(join(SITE, folder)) ? readdirSync(join(SITE, folder)).filter(f => f.endsWith('.html')) : [];
const MENU = /([ \t]*)<ul class="fs-menu-list" id="pedal-menu" hidden>[\s\S]*?<\/ul>/;
const CURRENT = /(<span class="fs-menu-current">)[^<]*(<\/span>)/;
const BETA = /\n[ \t]*<div class="fs-note fs-beta"[^\n]*<\/div>/;

// atRoot: the page is in site/ itself, not in a pedal folder
function menu(indent, current, page, atRoot) {
  const items = PEDALS.map(pedal => {
    const tag = pedal.status ? ` <span class="Label">${esc(pedal.status)}</span>` : '';
    if (pedal === current) return `<li><a href="${atRoot ? `${pedal.folder}/` : './'}" aria-current="true">${esc(label(pedal))}${tag}</a></li>`;
    const target = !atRoot && page !== 'index.html' && htmlPages(pedal.folder).includes(page) ? page : '';
    return `<li><a href="${atRoot ? '' : '../'}${pedal.folder}/${target}">${esc(label(pedal))}${tag}</a></li>`;
  });
  return `${indent}<ul class="fs-menu-list" id="pedal-menu" hidden>\n${items.map(item => `${indent}  ${item}`).join('\n')}\n${indent}</ul>`;
}

const betaBar = pedal => `<div class="fs-note fs-beta" role="note"><p><b>Beta</b> — this pedal has not been tested on real hardware yet. Own one? Tell us.</p><button class="btn btn-sm btn-primary" type="button" data-report="contact" data-intro="Tell us about your ${esc(pedal.name)}: what works, what does not, or how you could help test it.">Write to us</button></div>`;

const targets = [
  ...PEDALS.flatMap(pedal => htmlPages(pedal.folder).map(page => ({ file: join(SITE, pedal.folder, page), page, current: pedal, atRoot: false }))),
  ...readdirSync(SITE).filter(f => f.endsWith('.html')).map(page => ({ file: join(SITE, page), page, current: PEDALS[0], atRoot: true }))
];

const problems = [];
let written = 0;
for (const { file, page, current, atRoot } of targets) {
  const before = readFileSync(file, 'utf8');
  if (!MENU.test(before)) continue; // old-address pages and the home page have no pedal menu
  let html = before.replace(MENU, (_, indent) => menu(indent, current, page, atRoot)).replace(CURRENT, `$1${esc(label(current))}$2`);
  html = html.replace(BETA, '');
  if (current.beta && !atRoot) html = html.replace(/(\n([ \t]*)<\/header>)/, (all, _, indent) => `${all}\n${indent}${betaBar(current)}`);
  if (html === before) continue;
  if (check) problems.push(`${relative(ROOT, file)}: pedal menu or beta bar out of date (run node tools/pedals.mjs)`);
  else { writeFileSync(file, html); written++; }
}

// The other lists of pedals must name the same pedals
if (SITE === join(ROOT, 'site')) {
  const ids = PEDALS.map(p => p.id).join(',');
  const server = await import(join(ROOT, 'deploy/pedals.mjs'));
  if (server.PEDALS.map(p => p.id).join(',') !== ids) problems.push('deploy/pedals.mjs: PEDALS ids differ from site/pedals.js');
  for (const p of server.PEDALS) {
    const own = PEDALS.find(q => q.id === p.id);
    if (own && own.name !== p.name) problems.push(`deploy/pedals.mjs: ${p.id} is "${p.name}", site/pedals.js says "${own.name}"`);
  }
  const account = readFileSync(join(SITE, 'account.js'), 'utf8').match(/const PEDALS = \[([^\]]*)\]/);
  if (!account || account[1].replace(/['\s]/g, '') !== ids) problems.push('site/account.js: PEDALS differ from site/pedals.js');
  const sw = readFileSync(join(SITE, 'sw.js'), 'utf8');
  for (const p of PEDALS) {
    if (!sw.includes(`'${p.folder}/index.html'`)) problems.push(`site/sw.js: CORE has no ${p.folder}/index.html`);
    const own = readFileSync(join(SITE, p.folder, 'pedal.js'), 'utf8').match(/\bid: '([^']+)'/);
    if (!own || own[1] !== p.id) problems.push(`site/${p.folder}/pedal.js: PEDAL.id is not ${p.id}`);
  }
}

if (problems.length) { console.error(problems.join('\n')); process.exit(1); }
console.log(check ? `pedals: ${PEDALS.length} pedals, every page and list agrees` : `pedals: ${written} page(s) written`);

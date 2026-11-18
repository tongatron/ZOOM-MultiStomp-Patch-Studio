// Writes "Last update <day> <month> <year> HH:MM CET/CEST" (Europe/Rome time) under the GitHub link in every page footer.
// Run it right before a deploy: node tools/stamp-update.mjs
// The pages are found, not listed: every .html under site/ (not the design prototypes) that already has the footer time
// (<time class="gh-updated">) or a footer GitHub link to put it after, so a new page is stamped without touching this file.
import fs from 'node:fs';

const GITHUB_LINK = '<span>Source on GitHub</span></a>';
const pages = fs.readdirSync('site', { recursive: true })
  .filter(file => file.endsWith('.html') && !file.startsWith('designs/'))
  .filter(file => { const html = fs.readFileSync(`site/${file}`, 'utf8'); return html.includes('class="gh-updated"') || html.includes(GITHUB_LINK); })
  .sort();
const now = new Date();
const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', timeZoneName: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const parts = formatter.formatToParts(now);
const part = type => parts.find(p => p.type === type).value;
const zone = part('timeZoneName');
const label = `Last update ${part('day')} ${part('month')} ${part('year')} ${part('hour')}:${part('minute')} ${zone}`;
const iso = now.toISOString().slice(0, 16) + 'Z';
const stamp = `<time class="gh-updated" datetime="${iso}">${label}</time>`;

const updatesFile = 'site/updates.js';
let updates = fs.readFileSync(updatesFile, 'utf8');
if (!/pushedAt:\s*'[^']*'/.test(updates)) throw new Error(`${updatesFile}: pushedAt is missing`);
updates = updates.replace(/pushedAt:\s*'[^']*'/, `pushedAt: '${iso}'`);
fs.writeFileSync(updatesFile, updates);

const serverPagesFile = 'deploy/pages.mjs';
let serverPages = fs.readFileSync(serverPagesFile, 'utf8');
if (!/const footerNow = new Date\('[^']*'\);/.test(serverPages)) throw new Error(`${serverPagesFile}: footerNow is missing`);
serverPages = serverPages.replace(/const footerNow = new Date\('[^']*'\);/, `const footerNow = new Date('${iso}');`);
fs.writeFileSync(serverPagesFile, serverPages);

for (const page of pages) {
  const file = `site/${page}`;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('class="gh-updated"')) html = html.replace(/<time class="gh-updated"[^>]*>[^<]*<\/time>/, stamp);
  else {
    const at = html.indexOf('<span>Source on GitHub</span></a>');
    if (at === -1) throw new Error(`${file}: GitHub link not found`);
    const end = at + '<span>Source on GitHub</span></a>'.length;
    const indent = html.slice(html.lastIndexOf('\n', at) + 1).match(/^\s*/)[0];
    html = `${html.slice(0, end)}\n${indent}${stamp}${html.slice(end)}`;
  }
  fs.writeFileSync(file, html);
}
console.log(`${label} → ${pages.length} pages`);

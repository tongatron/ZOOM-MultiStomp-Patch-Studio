// Writes "Last update <day> <month> <year> HH:MM" (Europe/Rome time) under the GitHub link in every page footer.
// Run it right before a deploy: node tools/stamp-update.mjs
import fs from 'node:fs';

const pages = ['index.html', 'builder.html', 'tones.html', 'usb.html', 'ms-50g/index.html', 'ms-50g/builder.html', 'landing/index.html'];
const now = new Date();
const part = type => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
  .formatToParts(now).find(p => p.type === type).value;
const label = `Last update ${part('day')} ${part('month')} ${part('year')} ${part('hour')}:${part('minute')}`;
const iso = now.toISOString().slice(0, 16) + 'Z';
const stamp = `<time class="gh-updated" datetime="${iso}">${label}</time>`;

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

// Writes "Last update <day> <month> <year> HH:MM CET/CEST" (Europe/Rome time) under the GitHub link in every page footer.
// Run it right before a deploy: node tools/stamp-update.mjs
import fs from 'node:fs';

const pages = ['ms-60b/index.html', 'ms-60b/builder.html', 'ms-60b/tones.html', 'ms-60b/pedal-manager.html', 'privacy.html', 'ms-60b/resources.html', 'ms-60b/technical-notes.html', 'ms-60b/guide.html', 'ms-50g/index.html', 'ms-50g/builder.html', 'ms-50g/resources.html', 'ms-50g/guide.html', 'ms-50g/help.html', 'ms-70cdr/index.html', 'ms-70cdr/builder.html', 'ms-70cdr/guide.html', 'ms-70cdr/resources.html', 'ms-70cdr/help.html', 'ms-70cdr/pedal-manager.html', 'index.html'];
const now = new Date();
const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', timeZoneName: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const parts = formatter.formatToParts(now);
const part = type => parts.find(p => p.type === type).value;
const zone = part('timeZoneName');
const label = `Last update ${part('day')} ${part('month')} ${part('year')} ${part('hour')}:${part('minute')} ${zone}`;
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

// Writes the SEO block of the head of every public page (title, description, canonical, Open Graph, Twitter, robots)
// and site/sitemap.xml from one table. Run it after changing a title or a description, then commit the result.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const ORIGIN = 'https://zoommultistompstudio.tongatron.org';
const NAME = 'ZOOM MultiStomp Studio';
// One preview image for every page (1200 × 675): the ZOOM MultiStomp Studio card
const IMG = { url: `${ORIGIN}/og-image.jpg`, alt: 'ZOOM MultiStomp STUDIO: build patches, save presets, load to the pedal. A favorites list and the Patch Editor for the MS-60B+, MS-50G+ and MS-70CDR+, and effects lists for the MS-200D+, MS-80IR+ and MS-90LP+.' };
const IMG60 = IMG;
const IMG50 = IMG;
const IMG70 = IMG;

// file, address, title, description, image, sitemap priority
const PAGES = [
  ['index.html', '/', 'ZOOM MultiStomp patch editor and effects lists — MS-60B+, MS-50G+, MS-70CDR+, MS-200D+, MS-80IR+, MS-90LP+',
    'Free online patch editor for the ZOOM MS-60B+ bass, MS-50G+ guitar and MS-70CDR+ spatial MultiStomp pedals, plus effects lists for the MS-200D+ drive, MS-80IR+ amp and IR and MS-90LP+ looper (beta): build patches with a live DSP meter and smart advice, export .zptc files for Handy Guitar Lab and manage the pedal over USB.', IMG60, 1],
  ['ms-60b/index.html', '/ms-60b/', 'ZOOM MS-60B+ effects list: 97 bass effects, parameters, DSP load',
    'Explore all 97 effects of the ZOOM MS-60B+ bass multi-effects pedal with the original Effects List text, every parameter and range, and the estimated DSP load. Then build a patch and export it for Handy Guitar Lab.', IMG60, 0.9],
  ['ms-60b/builder.html', '/ms-60b/builder.html', 'ZOOM MS-60B+ patch builder: design a bass patch and export .zptc',
    'Build ZOOM MS-60B+ patches in your browser: pick up to 6 effects, set every parameter, watch the DSP load and the advice on effect order and levels, and export a .zptc file for Handy Guitar Lab.', IMG60, 0.9],
  ['ms-60b/tones.html', '/ms-60b/tones.html', 'ZOOM MS-60B+ bass tone ideas: patches by style and by bassist',
    'Starting points for ZOOM MS-60B+ bass patches by style and by bassist, with a focus on alternative rock: grunge, post-punk, indie, alt-metal and fuzz rock. Every idea cites its source and opens in the builder.', IMG60, 0.7],
  ['ms-60b/pedal-manager.html', '/ms-60b/pedal-manager.html', 'ZOOM MS-60B+ USB pedal manager: read and write patches',
    'Manage the patches stored on a ZOOM MS-60B+ over USB MIDI in Chrome or Edge. Read the memories, edit them in the builder and write patches back, with a backup before every change.', IMG60, 0.7],
  ['ms-60b/guide.html', '/ms-60b/guide.html', 'ZOOM MS-60B+ guide: build a patch and load it on the pedal',
    'How to use the studio with the ZOOM MS-60B+: find an effect, build a patch, read the advice, save and share it, and load it on the pedal with Handy Guitar Lab or over USB.', IMG60, 0.6],
  ['ms-60b/resources.html', '/ms-60b/resources.html', 'ZOOM MS-60B+ manual and Effects List (PDF)',
    'Official ZOOM MS-60B+ documents: the manual in English and Italian and the Effects List PDF.', IMG60, 0.5],
  ['ms-60b/technical-notes.html', '/ms-60b/technical-notes.html', 'ZOOM .zptc patch format and USB MIDI: technical notes',
    'How the ZOOM .zptc patch file format of the MS-60B+ and MS-50G+ was reverse-engineered, and how the site talks to the pedal over USB MIDI.', IMG60, 0.5],
  ['ms-50g/index.html', '/ms-50g/', 'ZOOM MS-50G+ effects list: 127 guitar effects, parameters, DSP load',
    'Explore all 127 effects of the ZOOM MS-50G+ guitar multi-effects pedal with the original Effects List text, every parameter and range, and the estimated DSP load. Not tested on the pedal yet.', IMG50, 0.9],
  ['ms-50g/builder.html', '/ms-50g/builder.html', 'ZOOM MS-50G+ patch builder: design a guitar patch and export .zptc',
    'Build ZOOM MS-50G+ patches in your browser (not tested on the pedal yet): pick up to 6 effects, set every parameter, watch the DSP load and export a .zptc file for Handy Guitar Lab.', IMG50, 0.8],
  ['ms-50g/pedal-manager.html', '/ms-50g/pedal-manager.html', 'ZOOM MS-50G+ USB pedal manager: load and write effects',
    'Connect a ZOOM MS-50G+ in Chrome or Edge, read its memories, load a .zptc patch into a test slot and write it back with a backup before every change. Not tested on the pedal yet.', IMG50, 0.7],
  ['ms-50g/guide.html', '/ms-50g/guide.html', 'ZOOM MS-50G+ guide: build a patch and load it with Handy Guitar Lab',
    'How to use the studio with the ZOOM MS-50G+ (not tested on the pedal yet): find an effect, build a patch, save and share it, and load it with the Pedal manager or Handy Guitar Lab.', IMG50, 0.5],
  ['ms-50g/resources.html', '/ms-50g/resources.html', 'ZOOM MS-50G+ manual and Effects List (PDF)',
    'Official ZOOM MS-50G+ documents: the manual in English and Italian and the Effects List PDF.', IMG50, 0.4],
  ['ms-50g/help.html', '/ms-50g/help.html', 'Help test the ZOOM MS-50G+: what we would need from owners',
    'Own a ZOOM MS-50G+? These short tests would show whether the patches made in the studio work on a real pedal. Pick the ones that fit your time.', IMG50, 0.4],
  ['ms-70cdr/index.html', '/ms-70cdr/', 'ZOOM MS-70CDR+ effects list: 149 spatial effects, parameters, DSP load',
    'Explore all 149 effects of the ZOOM MS-70CDR+ spatial multi-effects pedal with the original Effects List text, every parameter and range, and the estimated DSP load. Being tested on the pedal.', IMG70, 0.9],
  ['ms-70cdr/builder.html', '/ms-70cdr/builder.html', 'ZOOM MS-70CDR+ patch builder: design a spatial effects patch and export .zptc',
    'Build ZOOM MS-70CDR+ patches in your browser (being tested on the pedal): pick up to 6 effects, set every parameter, watch the DSP load and export a .zptc file for Handy Guitar Lab.', IMG70, 0.8],
  ['ms-70cdr/pedal-manager.html', '/ms-70cdr/pedal-manager.html', 'ZOOM MS-70CDR+ USB pedal manager: load and write effects',
    'Connect a ZOOM MS-70CDR+ in Chrome or Edge, read its memories, load a .zptc patch into a test slot and write it back with a backup before every change. Being tested on the pedal.', IMG70, 0.7],
  ['ms-70cdr/guide.html', '/ms-70cdr/guide.html', 'ZOOM MS-70CDR+ guide: build a patch and load it with Handy Guitar Lab',
    'How to use the studio with the ZOOM MS-70CDR+ (being tested on the pedal): find an effect, build a patch, save and share it, and load it with Handy Guitar Lab.', IMG70, 0.5],
  ['ms-70cdr/resources.html', '/ms-70cdr/resources.html', 'ZOOM MS-70CDR+ manual and Effects List (PDF)',
    'Official ZOOM MS-70CDR+ documents: the manual in English and Italian and the Effects List PDF.', IMG70, 0.4],
  ['ms-70cdr/help.html', '/ms-70cdr/help.html', 'Help test the ZOOM MS-70CDR+: what we would need from owners',
    'Own a ZOOM MS-70CDR+? These short tests would show whether the patches made in the studio work on a real pedal. Pick the ones that fit your time.', IMG70, 0.4],
  ['ms-200d/index.html', '/ms-200d/', 'ZOOM MS-200D+ effects list: 217 drive effects and their parameters',
    'Explore all 217 effects of the ZOOM MS-200D+ drive pedal (boosters, overdrives, distortions, fuzzes, preamps) with the original Effects List text and every parameter and range. Beta.', IMG70, 0.8],
  ['ms-200d/pedal-manager.html', '/ms-200d/pedal-manager.html', 'ZOOM MS-200D+ USB pedal manager: read patches and back them up',
    'Connect a ZOOM MS-200D+ in Chrome or Edge, read its memories and keep a backup in your browser. Read-only beta: nothing is written to the pedal.', IMG70, 0.5],
  ['ms-200d/guide.html', '/ms-200d/guide.html', 'ZOOM MS-200D+ guide: find a drive effect',
    'How to use the studio with the ZOOM MS-200D+ (beta): search the 217 effects, filter them by category and keep your favorites.', IMG70, 0.4],
  ['ms-200d/resources.html', '/ms-200d/resources.html', 'ZOOM MS-200D+ manual, Effects List and Patch Memory List (PDF)',
    'Official ZOOM MS-200D+ documents: the manual in English and Italian, the Effects List, the Patch Memory List and the version 1.20 supplement.', IMG70, 0.3],
  ['ms-200d/help.html', '/ms-200d/help.html', 'Help us test the ZOOM MS-200D+: short checks for owners of the pedal',
    'Own a ZOOM MS-200D+ drive pedal? A few short checks at home would help the studio (beta): the effects of the factory patches over USB, patches with known effects, the Processor percentage and the order of two effects.', IMG70, 0.3],
  ['ms-80ir/index.html', '/ms-80ir/', 'ZOOM MS-80IR+ effects list: 41 amp, IR and ambience effects and their parameters',
    'Explore the effects of the ZOOM MS-80IR+ amp and cabinet pedal: 23 amp models, studio ambiences, the IR effect, tools and delays, with the original Effects List text and every parameter and range. Beta.', IMG70, 0.8],
  ['ms-80ir/pedal-manager.html', '/ms-80ir/pedal-manager.html', 'ZOOM MS-80IR+ USB pedal manager: read patches and back them up',
    'Connect a ZOOM MS-80IR+ in Chrome or Edge, read its memories and keep a backup in your browser. Read-only beta: nothing is written to the pedal.', IMG70, 0.5],
  ['ms-80ir/guide.html', '/ms-80ir/guide.html', 'ZOOM MS-80IR+ guide: find an amp or ambience effect',
    'How to use the studio with the ZOOM MS-80IR+ (beta): search the effects, filter them by category and keep your favorites.', IMG70, 0.4],
  ['ms-80ir/resources.html', '/ms-80ir/resources.html', 'ZOOM MS-80IR+ manual, Effects List and IR Loader manual (PDF)',
    'Official ZOOM MS-80IR+ documents: the manual in English and Italian, the Effects List, the Patch Memory List, the version 1.10 supplement and the IR Loader manual.', IMG70, 0.3],
  ['ms-80ir/help.html', '/ms-80ir/help.html', 'Help us test the ZOOM MS-80IR+: short checks for owners of the pedal',
    'Own a ZOOM MS-80IR+ amp and IR pedal? A few short checks at home would help the studio (beta): its memories over USB, a patch with the USER IR effect, the three slots of a patch and the Processor percentage.', IMG70, 0.3],
  ['ms-90lp/index.html', '/ms-90lp/', 'ZOOM MS-90LP+ looper: 8 loop effects, 68 rhythm patterns and specifications',
    'The ZOOM MS-90LP+ looper pedal at a glance: its 8 loop effects, 68 rhythm patterns and main specifications, with the original text of the ZOOM manual. Beta.', IMG70, 0.7],
  ['ms-90lp/loop-tools.html', '/ms-90lp/loop-tools.html', 'ZOOM MS-90LP+ loop tools: loop length, tempo, tap tempo and song planner',
    'Free tools for the ZOOM MS-90LP+ looper (beta): how long a loop of a number of bars lasts, the tempo that fits a length, tap tempo with a metronome and a song planner with the 68 rhythm patterns.', IMG70, 0.5],
  ['ms-90lp/guide.html', '/ms-90lp/guide.html', 'ZOOM MS-90LP+ guide: loop effects and rhythms',
    'How to use the studio with the ZOOM MS-90LP+ looper (beta): find a loop effect, search the rhythm patterns and see what the pedal does.', IMG70, 0.4],
  ['ms-90lp/resources.html', '/ms-90lp/resources.html', 'ZOOM MS-90LP+ manual and firmware update guide (PDF)',
    'Official ZOOM MS-90LP+ documents: the manual in English and Italian, the version 1.10 supplement and the firmware update guide.', IMG70, 0.3],
  ['ms-90lp/help.html', '/ms-90lp/help.html', 'Help us test the ZOOM MS-90LP+: short checks for owners of the pedal',
    'Own a ZOOM MS-90LP+ looper pedal? A few short checks at home would help the studio (beta): the loop effects and rhythms against the pedal, a loop length against the Loop tools and what the pedal shows over USB.', IMG70, 0.3],
  ['downloads.html', '/downloads.html', 'ZOOM MultiStomp Studio desktop app beta for macOS, Windows and Linux',
    'Download the beta desktop version of ZOOM MultiStomp Studio for macOS, Windows and Linux, with installation instructions and notes about the local test build.', IMG60, 0.3],
  ['privacy.html', '/privacy.html', 'Privacy — what the studio stores and where',
    'What ZOOM MultiStomp Studio stores, where, and why: the data kept in your browser, the data kept in an account, emails, backups and how to delete everything.', IMG60, 0.2]
];

const esc = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const FULL = title => (title.includes('MultiStomp Studio') ? title : `${title} | MultiStomp Studio`);

const LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${ORIGIN}/#website`, name: NAME, url: `${ORIGIN}/`, inLanguage: 'en',
      description: 'Patch editor and effects library for the ZOOM MS-60B+ bass, MS-50G+ guitar and MS-70CDR+ spatial MultiStomp pedals, and effects lists for the MS-200D+ drive, MS-80IR+ amp and IR and MS-90LP+ looper (beta).' },
    { '@type': 'WebApplication', '@id': `${ORIGIN}/#app`, name: NAME, url: `${ORIGIN}/`, applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (modern browser; USB manager needs Chrome or Edge)', browserRequirements: 'Window of at least 800 × 640 px',
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, inLanguage: 'en',
      description: 'Browse every effect of six ZOOM MultiStomp pedals (MS-60B+, MS-50G+, MS-70CDR+, MS-200D+, MS-80IR+, MS-90LP+), build patches with a live DSP meter and advice, export .zptc files for Handy Guitar Lab and manage the MS-60B+, MS-50G+ and MS-70CDR+ over USB.',
      keywords: 'ZOOM MS-60B+, ZOOM MS-50G+, ZOOM MS-70CDR+, ZOOM MS-200D+, ZOOM MS-80IR+, ZOOM MS-90LP+, MultiStomp, patch editor, effects list, Handy Guitar Lab, zptc',
      isPartOf: { '@id': `${ORIGIN}/#website` }, sameAs: ['https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio'] }
  ]
});

for (const [file, path, title, description, image, , ] of PAGES) {
  const full = FULL(title);
  const url = ORIGIN + path;
  const block = [
    `<meta name="description" content="${esc(description)}" />`,
    `<link rel="canonical" href="${url}" />`,
    '<meta name="robots" content="index, follow, max-image-preview:large" />',
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${NAME}" />`,
    `<meta property="og:title" content="${esc(full)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image.url}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="675" />',
    `<meta property="og:image:alt" content="${esc(image.alt)}" />`,
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${esc(full)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${image.url}" />`
  ].map(line => `    ${line}`).join('\n');
  let html = await readFile(join(SITE, file), 'utf8');
  html = html.replace(/^[ \t]*<meta (?:name="(?:description|robots)"|property="og:[^"]*"|name="twitter:[^"]*")[^>]*>\n/gm, '')
    .replace(/^[ \t]*<link rel="canonical"[^>]*>\n/gm, '')
    .replace(/^[ \t]*<script type="application\/ld\+json">.*?<\/script>\n/gms, '')
    .replace(/(<meta name="viewport"[^>]*>\n)/, `$1${block}\n`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(full)}</title>`);
  if (path === '/') html = html.replace('</head>', `    <script type="application/ld+json">${LD}</script>\n  </head>`);
  await writeFile(join(SITE, file), html);
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(([, path, , , , priority]) => `  <url><loc>${ORIGIN}${path}</loc><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`;
await writeFile(join(SITE, 'sitemap.xml'), sitemap);
await writeFile(join(SITE, 'robots.txt'), `User-agent: *
Allow: /
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /forgot
Disallow: /reset
Disallow: /verify
Disallow: /logout
Disallow: /admin
Disallow: /moved

Sitemap: ${ORIGIN}/sitemap.xml
`);
console.log(`SEO tags written to ${PAGES.length} pages, plus sitemap.xml and robots.txt`);

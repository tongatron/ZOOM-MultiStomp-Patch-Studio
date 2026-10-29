// Writes the SEO block of the head of every public page (title, description, canonical, Open Graph, Twitter, robots)
// and site/sitemap.xml from one table. Run it after changing a title or a description, then commit the result.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..', 'site');
const ORIGIN = 'https://zoommultistompstudio.tongatron.org';
const NAME = 'ZOOM MultiStomp Patch Studio';
const IMG60 = { url: `${ORIGIN}/landing/shots/builder.webp`, alt: 'The Patch builder of the studio with a chain of six effects for the ZOOM MS-60B+ and its DSP load' };
const IMG50 = { url: `${ORIGIN}/landing/shots/ms50g-builder.webp`, alt: 'The Patch builder of the studio with a chain of six effects for the ZOOM MS-50G+ and its DSP load' };

// file, address, title, description, image, sitemap priority
const PAGES = [
  ['index.html', '/', 'ZOOM MS-60B+ and MS-50G+ patch editor — MultiStomp Patch Studio',
    'Free online patch editor for the ZOOM MS-60B+ bass and MS-50G+ guitar MultiStomp pedals: browse every effect, build patches with a live DSP meter and smart advice, export .zptc files for Handy Guitar Lab and manage the pedal over USB.', IMG60, 1],
  ['ms-60b/index.html', '/ms-60b/', 'ZOOM MS-60B+ effects list: 97 bass effects, parameters, DSP load',
    'Explore all 97 effects of the ZOOM MS-60B+ bass multi-effects pedal with the original Effects List text, every parameter and range, and the estimated DSP load. Then build a patch and export it for Handy Guitar Lab.', IMG60, 0.9],
  ['ms-60b/builder.html', '/ms-60b/builder.html', 'ZOOM MS-60B+ patch builder: design a bass patch and export .zptc',
    'Build ZOOM MS-60B+ patches in your browser: pick up to 6 effects, set every parameter, watch the DSP load and the advice on effect order and levels, and export a .zptc file for Handy Guitar Lab.', IMG60, 0.9],
  ['ms-60b/tones.html', '/ms-60b/tones.html', 'ZOOM MS-60B+ bass tone ideas: patches by style and by bassist',
    'Starting points for ZOOM MS-60B+ bass patches by style and by bassist, with a focus on alternative rock: grunge, post-punk, indie, alt-metal and fuzz rock. Every idea cites its source and opens in the builder.', IMG60, 0.7],
  ['ms-60b/pedal-manager.html', '/ms-60b/pedal-manager.html', 'ZOOM MS-60B+ USB pedal manager: read and write patches',
    'Experimental: manage the patches stored on a ZOOM MS-60B+ over USB MIDI in Chrome or Edge. Read the memories, edit them in the builder and write patches back, with a backup before every change.', IMG60, 0.7],
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
  ['ms-50g/guide.html', '/ms-50g/guide.html', 'ZOOM MS-50G+ guide: build a patch and load it with Handy Guitar Lab',
    'How to use the studio with the ZOOM MS-50G+ (not tested on the pedal yet): find an effect, build a patch, save and share it, and load it with Handy Guitar Lab.', IMG50, 0.5],
  ['ms-50g/resources.html', '/ms-50g/resources.html', 'ZOOM MS-50G+ manual and Effects List (PDF)',
    'Official ZOOM MS-50G+ documents: the manual in English and Italian and the Effects List PDF.', IMG50, 0.4],
  ['ms-50g/help.html', '/ms-50g/help.html', 'Help test the ZOOM MS-50G+: what we would need from owners',
    'Own a ZOOM MS-50G+? These short tests would show whether the patches made in the studio work on a real pedal. Pick the ones that fit your time.', IMG50, 0.4],
  ['privacy.html', '/privacy.html', 'Privacy — what the studio stores and where',
    'What ZOOM MultiStomp Patch Studio stores, where, and why: the data kept in your browser, the data kept in an account, emails, backups and how to delete everything.', IMG60, 0.2]
];

const esc = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const FULL = title => (title.includes('Patch Studio') ? title : `${title} | Patch Studio`);

const LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${ORIGIN}/#website`, name: NAME, url: `${ORIGIN}/`, inLanguage: 'en',
      description: 'Patch editor, effects library and USB manager for the ZOOM MS-60B+ bass and MS-50G+ guitar MultiStomp pedals.' },
    { '@type': 'WebApplication', '@id': `${ORIGIN}/#app`, name: NAME, url: `${ORIGIN}/`, applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Any (modern browser; USB manager needs Chrome or Edge)', browserRequirements: 'Window of at least 800 × 640 px',
      isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' }, inLanguage: 'en',
      description: 'Browse every effect of the ZOOM MS-60B+ and MS-50G+, build patches with a live DSP meter and advice, export .zptc files for Handy Guitar Lab and manage the MS-60B+ over USB.',
      keywords: 'ZOOM MS-60B+, ZOOM MS-50G+, MultiStomp, patch editor, effects list, Handy Guitar Lab, zptc',
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

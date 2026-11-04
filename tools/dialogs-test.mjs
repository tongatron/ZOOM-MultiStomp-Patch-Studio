// Public pages must use the site's dialogs instead of browser-native alert/confirm/prompt boxes.
import { readdir, readFile } from 'node:fs/promises';

async function filesIn(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...await filesIn(path));
    else if (entry.name.endsWith('.js')) out.push(path);
  }
  return out;
}

const nativeDialog = /(?<![\w.])(?:window\.)?(?:alert|confirm|prompt)\s*\(/;
const files = await filesIn('site');
for (const file of files) {
  const text = await readFile(file, 'utf8');
  const code = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  if (nativeDialog.test(code)) throw new Error(`${file} uses a browser-native dialog; use DIALOGS instead.`);
}
console.log(`✓ ${files.length} public scripts use site dialogs for confirmations`);

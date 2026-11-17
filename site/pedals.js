// The pedals of the site, one entry each, in the order of the pedal menu. `node tools/pedals.mjs` writes the pedal menu
// (and the beta bar of the pedals marked `beta`) into every page from this list and checks that the other lists of
// pedals (deploy/pedals.mjs, PEDALS of site/account.js, the CORE list of site/sw.js) name the same pedals.
//   id      prefix of the browser storage keys and the account sync namespace (PEDAL.id in the pedal's pedal.js)
//   folder  the folder of the pedal's pages under site/ (also its address: /<folder>/)
//   name    the pedal's name; kind is shown after it in the menu ("MS-60B+ bass")
//   status  the label next to the name in the menu ('' for none)
//   beta    true for the pedals added from 2026-11 (docs/piano-multistomp.md): their pages get the fixed beta bar
//           with the Write to us button (the Contact us form of report.js)
//   sync    false for a pedal without patches yet (Effects page only): it stays out of the account sync, so it is not in
//           deploy/pedals.mjs or PEDALS of site/account.js
const PEDAL_LIST = [
  { id: 'ms60b', folder: 'ms-60b', name: 'MS-60B+', kind: 'bass', status: '', beta: false },
  { id: 'ms50g', folder: 'ms-50g', name: 'MS-50G+', kind: 'guitar', status: 'Not tested', beta: false },
  { id: 'ms70cdr', folder: 'ms-70cdr', name: 'MS-70CDR+', kind: 'spatial', status: 'Testing', beta: false },
  { id: 'ms200d', folder: 'ms-200d', name: 'MS-200D+', kind: 'drive', status: 'Beta', beta: true, sync: false },
  { id: 'ms80ir', folder: 'ms-80ir', name: 'MS-80IR+', kind: 'amp', status: 'Beta', beta: true, sync: false },
  { id: 'ms90lp', folder: 'ms-90lp', name: 'MS-90LP+', kind: 'looper', status: 'Beta', beta: true, sync: false }
];
if (typeof module !== 'undefined') module.exports = { PEDAL_LIST };

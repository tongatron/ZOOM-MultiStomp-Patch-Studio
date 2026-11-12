// The pedal this copy of the site is for. The scripts in site/ are shared by every pedal; each pedal has its own
// pedal.js, effects-data.js, firmware-data.js and effect images (the MS-50G+ lives in site/ms-50g/, the MS-70CDR+ in site/ms-70cdr/).
// Load it before the other scripts.
const PEDAL = {
  id: 'ms60b', // prefix of the browser storage keys and of the sync namespace
  name: 'Zoom MS-60B+',
  amp: 'Amp', // "Plug into" choice in the advice panel
  tested: true, // false: generated patches have not been checked on the pedal yet
  targetMask: 0x00080000, // PTCF target bit measured on the MS-60B+
  targetEvidence: 'measured',
  maxEffects: 6,
  fxListUrl: 'https://zoomcorp.com/media/documents/E_MS-60Bplus_FX-list.pdf',
  manualUrl: 'https://zoomcorp.com/manuals/ms-60bplus-en/#unique_41',
  fwSourceUrl: 'https://github.com/mungewell/zoom-zt2/blob/master/zoom_fx_ms-plus/ms-60bp/effects_sort.txt'
};

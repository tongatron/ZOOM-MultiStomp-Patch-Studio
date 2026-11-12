// MS-50G+ (guitar) settings for the shared scripts in site/ (see site/ms-60b/pedal.js).
const PEDAL = {
  id: 'ms50g',
  name: 'Zoom MS-50G+',
  amp: 'Amp',
  tested: false,
  targetMask: 0x00040000, // PTCF target bit from the reverse-engineered device map
  targetEvidence: 'source',
  maxEffects: 6,
  fxListUrl: 'https://zoomcorp.com/media/documents/E_MS-50Gplus_EffectsList.pdf',
  manualUrl: 'https://zoomcorp.com/manuals/ms-50gplus-en/',
  fwSourceUrl: 'https://github.com/mungewell/zoom-zt2/blob/master/zoom_fx_ms-plus/ms-50gp/effects_sort.txt'
};

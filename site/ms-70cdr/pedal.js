// MS-70CDR+ settings for the shared scripts in site/ (see site/ms-60b/pedal.js).
const PEDAL = {
  id: 'ms70cdr',
  name: 'Zoom MS-70CDR+',
  amp: 'Line',
  tested: false,
  // The source map groups MS-70CDR+ with the 0x00040000 family, but this still needs a physical export/read-back.
  targetMask: 0x00040000,
  targetEvidence: 'source-unverified',
  maxEffects: 6,
  fxListUrl: 'https://zoomcorp.com/media/documents/E_MS-70CDRplus_FX-list.pdf',
  manualUrl: 'https://zoomcorp.com/manuals/ms-70cdrplus-en/',
  fwSourceUrl: 'https://github.com/mungewell/zoom-zt2/blob/master/zoom_fx_HGL/zoom_fx/MS70CDRPLUS/list_sorted.txt'
};

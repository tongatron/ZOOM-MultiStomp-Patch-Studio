// MS-70CDR+ settings for the shared scripts in site/ (see site/ms-60b/pedal.js).
const PEDAL = {
  id: 'ms70cdr',
  name: 'Zoom MS-70CDR+',
  amp: 'Line',
  tested: false,
  // A tester's seven MS-70CDR+ exports (System 1.20) carry this target mask. Generated-patch write/read-back is still open.
  targetMask: 0x00040000,
  targetEvidence: 'hardware-export',
  maxEffects: 6,
  fxListUrl: 'https://zoomcorp.com/media/documents/E_MS-70CDRplus_FX-list.pdf',
  manualUrl: 'https://zoomcorp.com/manuals/ms-70cdrplus-en/',
  fwSourceUrl: 'https://github.com/mungewell/zoom-zt2/blob/master/zoom_fx_HGL/zoom_fx/MS70CDRPLUS/list_sorted.txt'
};

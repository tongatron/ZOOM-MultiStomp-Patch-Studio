// MS-200D+ settings for the shared scripts in site/ (see site/ms-60b/pedal.js). Beta: only the Effects page so far.
const PEDAL = {
  id: 'ms200d',
  name: 'Zoom MS-200D+',
  amp: 'Line',
  tested: false,
  // The effect IDs and DSP loads are not known yet (site/ms-200d/firmware-data.js is empty): no Patch builder yet
  idsPending: true,
  maxEffects: 2, // the manual: two effects at the same time
  memories: 250,
  fxListUrl: 'https://zoomcorp.com/media/documents/E_MS-200Dplus_EffectsList.pdf',
  manualUrl: 'https://zoomcorp.com/manuals/ms-200dplus-en/',
  fwSourceUrl: 'https://github.com/mungewell/zoom-zt2/blob/master/zoom_fx_HGL/zoom_fx/MS200DPLUS/list_sorted.txt'
};

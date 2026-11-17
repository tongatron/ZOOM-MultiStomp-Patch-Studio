// MS-80IR+ settings for the shared scripts in site/ (see site/ms-60b/pedal.js). Beta: only the Effects page so far.
const PEDAL = {
  id: 'ms80ir',
  name: 'Zoom MS-80IR+',
  amp: 'Amp and IR',
  tested: false,
  // The IDs and DSP loads of 40 of the 41 effects come from zoom-zt2 (site/ms-80ir/firmware-data.js; the IR effect has none).
  // No Patch builder or Pedal manager yet: the patch format of this pedal has not been checked on hardware
  noBuilder: true,
  maxEffects: 3, // the product page: one amp, one studio ambience and one other effect at the same time
  memories: 80,
  fxListUrl: 'https://zoomcorp.com/media/documents/E_MS-80IRplus_FX-list.pdf',
  manualUrl: 'https://zoomcorp.com/manuals/ms-80irplus-en/',
  fwSourceUrl: 'https://github.com/mungewell/zoom-zt2/blob/master/zoom_fx_HGL/zoom_fx/MS80IRPLUS/list_sorted.txt'
};

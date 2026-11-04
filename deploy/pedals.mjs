// The pedals the site supports, for the server: `id` is the prefix of the browser storage keys and the sync namespace
// (PEDAL.id in site/ms-*/pedal.js), `name` the label of the account and admin pages. A new pedal is added here
// (and in PEDALS of site/account.js).
export const PEDALS = [
  { id: 'ms60b', name: 'MS-60B+' },
  { id: 'ms50g', name: 'MS-50G+' },
  { id: 'ms70cdr', name: 'MS-70CDR+' }
];
export const PEDAL_IDS = PEDALS.map(pedal => pedal.id);

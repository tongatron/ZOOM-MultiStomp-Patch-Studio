// Single source for the public version label and release communication.
// The account menu reads this object today; the version-news popup can consume it next.
(() => {
  const entries = [
    {
      date: '2026-11-22',
      kind: 'Beta',
      title: 'Experimental live patch controls',
      objects: 'Live mode now exposes experimental effect selection, tempo, routing, R OUT, tuner and pedal-status controls for the MS-60B+, MS-50G+ and MS-70CDR+. They affect the pedal or edit buffer only; support is still unverified on beta pedals and firmware versions.'
    },
    {
      date: '2026-11-22',
      kind: 'Compatibility',
      title: 'MS-70CDR patch conversion groundwork',
      objects: 'The studio now carries an audited effect-ID map and an isolated experimental converter for original MS-70CDR patches. Known effects can use compatible parameter names when available, fall back to raw values otherwise, and always produce a verification report; full parameter-scale conversion remains experimental.'
    },
    {
      date: '2026-11-12',
      kind: 'Beta',
      title: 'Pedal audition and Live mode',
      objects: 'Beta controls are available from the account menu and are off by default. Pedal audition plays clean bass reference loops from the computer output; Live mode sends supported edits to the pedal edit buffer.'
    },
    {
      date: '2026-11-12',
      kind: 'Navigation',
      title: 'Pedal model links',
      objects: 'Pedal model links are kept together so each supported ZOOM model can be reached from the studio navigation and its own tools.'
    },
    {
      date: '2026-11-12',
      kind: 'Sync',
      title: 'Pedal patch and local patch sync',
      objects: 'The link between the patch read from the pedal and the patch saved locally is tracked together with account sync, so changes can be compared before they are saved or sent.'
    }
  ];

  window.SITE_UPDATES = Object.freeze({
    version: '1.1',
    pushedAt: '2026-11-22T22:44Z',
    released: '2026-11-14',
    entries: Object.freeze(entries.map(entry => Object.freeze(entry))),
    latest: entries[0]
  });
})();

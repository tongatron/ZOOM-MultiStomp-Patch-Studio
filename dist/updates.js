// Single source for the public version label and release communication.
// The account menu reads this object today; the version-news popup can consume it next.
(() => {
  const entries = [
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
    version: '1.0',
    released: '2026-11-12',
    entries: Object.freeze(entries.map(entry => Object.freeze(entry))),
    latest: entries[0]
  });
})();

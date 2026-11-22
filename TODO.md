# Development roadmap

Status: development paused on 23 November 2026. This file records the next work; no new feature work should start until the project is resumed.

## Source policy

`thammer/zoom-explorer` is now marked as a trusted, tested reference for the MS Plus MIDI commands and patch transport documented there. Its working observations can be used directly for the MS-50G+ implementation. It is not treated as automatic confirmation of effect IDs, USER IR data or memory layouts for MS-80IR+, MS-200D+ or MS-90LP+; those still need model-specific evidence.

## Completed groundwork

- MS-50G+, MS-80IR+ and MS-200D+ catalog-gap audit (`npm run audit:expansion`).
- MS-50G+ baseline: 103 known effect IDs out of 127.
- MS-80IR+ baseline: 40 known effect IDs out of 41; USER IR remains unidentified.
- MS-200D+ baseline: 217 catalog effects, with no confirmed IDs yet.
- MS-90LP+ catalog and Loop Tools baseline: 8 loop effects and 68 rhythms.

## Next development, in order

1. MS-50G+: capture and validate the 24 Handy Guitar Lab add-on IDs from single-effect exports or pedal backups.
2. MS-50G+: verify generated-patch write/read-back and parameter encodings on real hardware.
3. MS-80IR+: identify USER IR and document the three patch slots and their metadata.
4. MS-200D+: collect representative backups or firmware artifacts, then build the effect-ID map in batches.
5. MS-90LP+: validate the rhythm and loop-effect catalog on hardware, then investigate USB/WAV and MIDI workflows.
6. Cross-pedal: add confirmed IDs and hardware evidence to the catalogs, tests and public “Still to check” pages.

## Explicitly blocked until evidence arrives

- Do not invent MS-50G+ add-on IDs.
- Do not mark MS-80IR+, MS-200D+ or MS-90LP+ as hardware-tested without read-back evidence.
- Do not enable write support for pedals that are currently read-only or unverified.

## Resume checklist

- Run `npm run audit:expansion`.
- Add the supplied pedal exports/backups under the appropriate test fixture directory.
- Update the matching catalog and add a focused regression test.
- Run the relevant catalog, MIDI and browser tests.
- Update this file and the public changelog before committing and deploying.

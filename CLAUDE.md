# Project rules

- **The site is English-only.** Everything under `site/` — page text, UI strings, notices and error messages, `title`/`aria-label` attributes, code and CSS comments — must be in English. Do not add strings in other languages.
- **Effects List text is verbatim.** Effect and parameter descriptions in `site/effects-data.js` are copied exactly from the official ZOOM MS-60B+ Effects List; never translate or paraphrase them.
- Link the English ZOOM manual: `https://zoomcorp.com/manuals/ms-60bplus-en/#unique_41`. Use `.` as the decimal separator and `en-GB` date formatting.
- The `.zptc` codec lives in `site/zptc.js` and is shared with `tools/zptc.mjs`. After changing it, run `node tools/zptc.mjs roundtrip patches/0* "patches/07Big Black .zptc"`: every file must round-trip byte for byte. Format notes: `docs/zptc-reverse-engineering.md`.
- Advice engine: `site/advice-engine.js` runs the rules; rules, placement tips and style profiles live in `site/advice-rules.js`. Every rule must cite at least one source (`ADVICE.addSources`) unless it is an objective fact about the pedal. Effect order is convention: order rules are `warning` or `tip`, never `error`. After changing rules or starter chains run `node tools/advice-test.mjs` (starter chains must encode, stay under 100% DSP and raise no errors or warnings in their own style).
- Deploy: `rsync -a --exclude '.DS_Store' site/ hp-ubuntu:/srv/apps/zoom-ms60b/` (served at https://zoom.tongatron.org). Bump the `?v=` query strings in the HTML when CSS/JS change.

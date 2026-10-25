<div align="center">

# MS-60B+ STUDIO

**Explore every effect of the ZOOM MS-60B+, build patches with a smart advice engine, and export `.zptc` files for Handy Guitar Lab.**

[**Open the site → zoom.tongatron.org**](https://zoom.tongatron.org)

[Effects library](https://zoom.tongatron.org) · [Patch builder](https://zoom.tongatron.org/builder.html) · [Official manual (EN)](https://zoomcorp.com/manuals/ms-60bplus-en/#unique_41) · [Manuale (IT)](https://zoomcorp.com/manuals/ms-60bplus-it/)

</div>

---

## What it does

| | |
|---|---|
| **Effects library** | All 97 effects with the original ZOOM Effects List text, parameters and ranges. Search by effect, model or parameter and filter by category. |
| **Patch builder** | Pick up to 6 effects, order them, set every parameter and watch the DSP load (the pedal's limit is 100%). Undo/redo, saved patches, comparison view, backup and import. |
| **Advice engine** | Rules that check effect order, levels and DSP load, with tips on placement and parameter settings. Style profiles tailor the advice, and you can say whether the pedal plugs into a bass amp or a mixer. Every rule cites its sources. |
| **`.zptc` export** | Generates patch files that import into Handy Guitar Lab. The format was reverse-engineered from exported patches and every sample file round-trips byte for byte. |
| **Installable** | Works offline as a PWA. |

## Repository layout

```
site/            The static site (HTML, CSS, vanilla JS). No build step.
tools/           Node scripts: .zptc codec CLI, advice tests, source-link checker.
patches/         Sample .zptc patches used for the codec round-trip test.
docs/            Notes on the .zptc format and the open work list.
documentazione/  Official ZOOM documents used as the source of the data.
deploy/          systemd unit for the server.
```

## Run it locally

```bash
python3 -m http.server 8766 --directory site
```

Then open <http://localhost:8766>.

## Checks

```bash
# the .zptc codec must reproduce every sample file byte for byte
node tools/zptc.mjs roundtrip patches/0* "patches/07Big Black .zptc"

# advice rules and starter chains
node tools/advice-test.mjs

# are the sources cited by the advice rules still reachable?
node tools/check-sources.mjs
```

## Notes

- The site is English-only.
- Effect and parameter descriptions are copied verbatim from the official ZOOM MS-60B+ Effects List.
- Tested on MS-60B+ firmware 1.20.
- The `.zptc` format is not documented by ZOOM. See [`docs/zptc-reverse-engineering.md`](docs/zptc-reverse-engineering.md) for how it was decoded.
- Effect order advice is convention, so order rules are warnings or tips, never errors.

## Credits and legal

Effects data © 2024 ZOOM CORPORATION. Manufacturer names are used only to describe sonic character. This is an independent fan project and is not affiliated with or supported by ZOOM.

<div align="center">

Made by [tongatron.org](https://tongatron.org)

</div>

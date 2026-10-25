<div align="center">

# MS-60B+ STUDIO

**Explore every effect of the ZOOM MS-60B+, build patches with a smart advice engine, and export `.zptc` files for Handy Guitar Lab.**

[**Open the site → zoom.tongatron.org**](https://zoom.tongatron.org)

[Landing](https://zoom.tongatron.org/landing/) · [Effects library](https://zoom.tongatron.org) · [Patch builder](https://zoom.tongatron.org/builder.html) · [Official manual (EN)](https://zoomcorp.com/manuals/ms-60bplus-en/#unique_41) · [Manuale (IT)](https://zoomcorp.com/manuals/ms-60bplus-it/)

</div>

---

## Why use it

The MS-60B+ is a great pedal, but its 97 effects, tight DSP budget and 6-slot chain are hard to explore on a tiny screen. MS-60B+ STUDIO gives you the whole pedal on a big screen, so you can design patches at your desk and load them with confidence.

- **Find the right effect fast.** Every effect with the original ZOOM text, parameters and ranges, searchable by name, model or parameter.
- **Never hit the DSP wall by surprise.** See the load of each effect and of the whole chain live, against the 100% limit.
- **Get advice, not just a form.** Rules flag a bad effect order, hot levels or a heavy chain, and explain what to change and why, with cited sources.
- **Tailored to your rig.** Pick a style profile and say whether the pedal feeds a bass amp or a mixer, and the tips adapt.
- **Straight to the pedal.** Export a `.zptc` file and import it into Handy Guitar Lab, no manual re-typing of parameters.
- **Keep your work.** Save patches in the browser, compare two versions, undo and redo, back up and restore.
- **Anywhere.** Installable as an offline PWA, works on phone, tablet and desktop.

## Features

| | |
|---|---|
| **Effects library** | All 97 effects with the original ZOOM Effects List text, parameters and ranges. Search and filter by category. |
| **Patch builder** | Up to 6 effects, drag to reorder, every parameter editable, live DSP meter. |
| **Advice engine** | Order, level and DSP checks plus placement tips. Order rules are warnings or tips, never errors. Every rule cites its sources. |
| **Style profiles** | Starter chains and tuned advice per playing style. |
| **`.zptc` export / import** | Reverse-engineered format; every sample file round-trips byte for byte. |
| **Saved patches** | Local library, comparison view, backup and import. |

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

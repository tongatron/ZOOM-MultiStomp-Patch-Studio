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
- **Keep your work.** Save patches in the browser, compare two versions, undo and redo, back up and restore, or sync them between your devices with a private code. Write your own advice rules in a form and share them as `.json` rule packs.
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

## Under the hood: reverse-engineering `.zptc`

ZOOM publishes the effects, not the patch file format. So the generator was **reconstructed from scratch**, with no disassembly of the firmware or of Handy Guitar Lab: just a black box, a hex editor and a lot of patient diffing.

**The method: differential analysis.** Seven patches were exported from Handy Guitar Lab, each differing from the previous one by exactly *one* known change (a parameter +1, an effect switched off, a renamed patch, one more effect). Comparing the bytes shows what each change touches.

```
TONE 50 -> 51      offset 0x62     80 -> c0     one bit flips in the middle of a byte
effect ON -> OFF   offset 0x5c     21 -> 20     bit 0 of the effect block is ON/OFF
add FLIPTOP        size 0xc4 -> 0xe0, slots 2 -> 3   one more 24-byte effect block
```

That first line cracked the format: a single increment lighting up a bit *inside* a byte means the parameters are **bit-packed**, not byte-aligned.

**The result.** Each effect is a 24-byte block read as one 192-bit little-endian integer:

```
bit    0        ON / OFF
bits   1-29     effect ID (29 bits)
bits  30-89     parameters 1-5   (12 bits each)
bits  90-113    parameters 6-8   ( 8 bits each)
bits 114-161    parameters 9-12  (12 bits each)
```

Around it sit the `PTCF` header and tagged blocks (`EDTB`, `PRM2`, `NAME`). A hidden "slot 0" turned out to be the BLANK tile the app shows at the start of the chain, and amps carry a ninth, undocumented parameter that the generator reproduces. Display values map to stored values by rule: list index for options, `value - min` for integers, and 0.5 dB steps for the EQ ranges, deduced from a real patch ("Big Black") where stored values 16, 28, 33, 36, 24 only make sense as -4, +2, +4.5, +6, 0 dB.

**Proven four ways.**

1. **Byte-for-byte round-trip.** Decode and re-encode every exported file: all of them come back identical.
2. **Encoder from readable values.** Typing "TONE 50, ATTACK FAST" reproduces the original files exactly.
3. **On the real pedal.** Generated patches were imported into Handy Guitar Lab and copied to an MS-60B+ on firmware 1.20: all 28 values match, decimals, negatives and switches included.
4. **In the browser.** The patch composed in the builder UI yields the same bytes as the tested file.

Effect IDs and DSP load figures come from the open-source [zoom-zt2](https://github.com/mungewell/zoom-zt2) project (MIT). Full write-up, including what is still unverified: [`docs/zptc-reverse-engineering.md`](docs/zptc-reverse-engineering.md).

## Repository layout

```
site/            The static site (HTML, CSS, vanilla JS). No build step.
tools/           Node scripts: .zptc codec CLI, advice and sync tests, source-link checker.
patches/         Sample .zptc patches used for the codec round-trip test.
docs/            Notes on the .zptc format and the open work list.
documentazione/  Official ZOOM documents used as the source of the data.
deploy/          Node server (static files + sync API) and its systemd unit.
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

<div align="center">

# ZOOM MultiStomp Patch Studio

**Explore every effect of your ZOOM MultiStomp pedal, build patches with a live DSP meter and advice, and export `.zptc` files for Handy Guitar Lab.**

For the **MS-60B+** (bass, tested on the pedal) and the **MS-50G+** (guitar, new and not tested yet).

[**Open the site → zoom.tongatron.org**](https://zoom.tongatron.org/landing/)

| Pedal | Effects library | Patch builder | Status |
|---|---|---|---|
| MS-60B+ bass | [Effects](https://zoom.tongatron.org) | [Builder](https://zoom.tongatron.org/builder.html) · [Tone ideas](https://zoom.tongatron.org/tones.html) | Tested on firmware 1.20 |
| MS-50G+ guitar | [Effects](https://zoom.tongatron.org/ms-50g/) | [Builder](https://zoom.tongatron.org/ms-50g/builder.html) | **Not tested** — [help wanted](#help-test-the-ms-50g) |

</div>

---

## Why use it

ZOOM MultiStomp pedals pack a lot into a tiny screen: around a hundred effects, a tight DSP budget and a 6-slot chain. The Patch Studio puts the whole pedal on a big screen, so you can design patches at your desk and load them with confidence.

- **Find the right effect fast.** Every effect with the original ZOOM text, parameters and ranges, searchable by name, model or parameter.
- **Never hit the DSP wall by surprise.** See the load of each effect and of the whole chain live, against the 100% limit.
- **Get advice, not just a form.** Rules flag a bad effect order, hot levels or a heavy chain, and explain what to change and why, with cited sources (full set on the MS-60B+, objective checks on the MS-50G+).
- **Tailored to your rig.** Say whether the pedal feeds an amp or a mixer, and the tips adapt (MS-60B+).
- **Straight to the pedal.** Export a `.zptc` file and import it into Handy Guitar Lab, no manual re-typing of parameters.
- **Keep your work.** Save patches in the browser, compare two versions, undo and redo, share a patch with a link, back up and restore, or sync them between your devices with a private code. Each pedal keeps its own library. Write your own advice rules in a form and share them as `.json` rule packs.
- **Tone ideas.** Starting chains by style and by bassist, with a focus on alternative rock (grunge, post-punk, indie, alt-metal, fuzz rock: Krist Novoselic, Peter Hook, Kim Deal, Justin Chancellor, Mike Kerr, Chris Wolstenholme). Every gear fact cites its source; one click opens the chain in the builder (MS-60B+).
- **Anywhere.** Installable as an offline PWA, works on phone, tablet and desktop.

## Pedals

| | MS-60B+ (bass) | MS-50G+ (guitar) |
|---|---|---|
| Effects | 97 | 127 (24 are Handy Guitar Lab add-ons) |
| Usable in the builder | 97 | 103 (add-on IDs are not known yet) |
| Amp models | 11 bass amps | 22 amps (PREAMP category) |
| Advice | Order, levels, low end, output | Objective checks only (DSP, levels, routing) |
| Tone ideas | Yes | Not yet |
| Tested on the pedal | Yes, firmware 1.20 | **No** |

Both pedals share the same codec, builder and catalog code. Each one has its own data in its folder (`site/` for the MS-60B+, `site/ms-50g/` for the MS-50G+): `pedal.js` (links, storage prefix), `effects-data.js` (Effects List text), `firmware-data.js` (IDs and DSP load) and the effect images.

## Help test the MS-50G+

The MS-50G+ section is built from the official ZOOM documentation and assumes the same `.zptc` format as the MS-60B+. Nobody has checked it on a real pedal yet. If you own one:

1. Build a simple patch in the [MS-50G+ builder](https://zoom.tongatron.org/ms-50g/builder.html), or use the ready-made [`patches/generated/ms50g-test.zptc`](patches/generated/ms50g-test.zptc) (COMPRESSOR, MS1959 DRIVE, DELAY).
2. Import it in Handy Guitar Lab and copy it to a free memory.
3. [Open an issue](https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio/issues) with what you see: the effects, the values on the pedal, the "Processor %" in the app. A patch exported from your pedal helps even more.

What still needs checking is listed in [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md) (section 0).

## Features

| | |
|---|---|
| **Effects library** | Every effect with the original ZOOM Effects List text, parameters and ranges. Search and filter by category and feature. |
| **Patch builder** | Up to 6 effects, drag to reorder, every parameter editable, live DSP meter, undo and redo. |
| **Advice engine** | Order, level and DSP checks plus placement tips. Order rules are warnings or tips, never errors. Every rule cites its sources. |
| **`.zptc` export / import** | Reverse-engineered format; every sample file round-trips byte for byte. |
| **My patches** | Local library per pedal, comparison view, share links, backup and import, sync between devices. |
| **Pedal manager** (experimental) | Over USB in Chrome: lists the pedal's 100 memories next to My patches, opens them in the builder, sends patches to a chosen memory with backup and read-back check (MS-60B+). |

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

**Proven four ways (MS-60B+).**

1. **Byte-for-byte round-trip.** Decode and re-encode every exported file: all of them come back identical.
2. **Encoder from readable values.** Typing "TONE 50, ATTACK FAST" reproduces the original files exactly.
3. **On the real pedal.** Generated patches were imported into Handy Guitar Lab and copied to an MS-60B+ on firmware 1.20: all 28 values match, decimals, negatives and switches included.
4. **In the browser.** The patch composed in the builder UI yields the same bytes as the tested file.

**The MS-50G+** belongs to the same MultiStomp "+" family, so it reuses this codec with its own effect table. Its effects and parameters were extracted word by word from the official Effects List PDF (`tools/extract-effects-list.py`, all 743 descriptions checked against the PDF text), and its effect IDs come from the firmware table. Whether the pedal accepts the files is exactly what the testers will tell us.

Effect IDs and DSP load figures come from the open-source [zoom-zt2](https://github.com/mungewell/zoom-zt2) project (MIT). Full write-up, including what is still unverified: [`docs/zptc-reverse-engineering.md`](docs/zptc-reverse-engineering.md).

## Repository layout

```
site/            The static site (HTML, CSS, vanilla JS). No build step. MS-60B+ data and the shared scripts.
site/ms-50g/     MS-50G+ pages and data (effects, firmware table, advice rules, effect images).
site/landing/    Landing page for both pedals.
tools/           .zptc codec CLI, Effects List extractor, advice/sync/browser tests, source-link checker.
patches/         Sample .zptc patches for the codec round-trip test, plus generated test patches.
docs/            Notes on the .zptc format and the open work list.
documentazione/  Official ZOOM documents used as the source of the data (MS-50G+ in ms-50gplus/).
deploy/          Node server (static files + sync API) and its systemd unit.
```

## Run it locally

```bash
node deploy/server.mjs
```

Then open <http://localhost:8097>. The Node server also runs the Sync API; a plain static server
(`python3 -m http.server 8766 --directory site`) works too, without Sync.

## Checks

```bash
# the .zptc codec must reproduce every sample file byte for byte
node tools/zptc.mjs roundtrip patches/0* "patches/07Big Black .zptc"

# decode or encode with the MS-50G+ effects
ZPTC_PEDAL=ms-50g node tools/zptc.mjs decode file.zptc

# advice rules and starter chains (both pedals)
node tools/advice-test.mjs

# patch sync: merge rules and server API
node tools/sync-test.mjs

# the builder in a real browser: build, save, share, compare, download, sync
npm install && npx playwright install chromium && node tools/e2e-test.mjs
# (or use your installed Chrome: PW_CHANNEL=chrome node tools/e2e-test.mjs)

# are the sources cited by the advice rules still reachable? (also runs weekly on GitHub Actions)
node tools/check-sources.mjs

# re-extract the MS-50G+ effects from the official PDF (needs pdfplumber; --images DIR for the effect screens)
python3 tools/extract-effects-list.py documentazione/ms-50gplus/E_MS-50Gplus_EffectsList.pdf > effects.json
```

On the server, `deploy/backup-sync-data.sh` runs every day at 03:30 from the user crontab and keeps 30 days of
the sync data in `/srv/apps/zoom-ms60b-backups`.

## Notes

- The site is English-only.
- Effect and parameter descriptions are copied verbatim from the official ZOOM Effects Lists.
- MS-60B+: tested on firmware 1.20. MS-50G+: not tested yet.
- The `.zptc` format is not documented by ZOOM. See [`docs/zptc-reverse-engineering.md`](docs/zptc-reverse-engineering.md) for how it was decoded.
- Effect order advice is convention, so order rules are warnings or tips, never errors.

## Credits and legal

Effects data © 2024 ZOOM CORPORATION. Manufacturer names are used only to describe sonic character. This is an independent fan project and is not affiliated with or supported by ZOOM.

<div align="center">

Made by [tongatron.org](https://tongatron.org)

</div>

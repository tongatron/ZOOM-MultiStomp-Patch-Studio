<div align="center">

<img src="site/favicon.svg" width="88" height="88" alt="" />

# 🎛️ ZOOM MultiStomp Patch Studio

### Your MultiStomp pedal, on a big screen.

Explore every effect · build patches with a live DSP meter and smart advice · export `.zptc` for Handy Guitar Lab · manage the pedal over USB

[![Open the site](https://img.shields.io/badge/▶_open_the_site-zoom.tongatron.org-ffcc00?style=for-the-badge&labelColor=0d1117)](https://zoom.tongatron.org/landing/)

[![CI](https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio/actions/workflows/ci.yml/badge.svg)](https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio/actions/workflows/ci.yml)
![No build step](https://img.shields.io/badge/build_step-none-2ea043)
![Vanilla JS](https://img.shields.io/badge/vanilla-JS-f7df1e?logo=javascript&logoColor=000)
![PWA](https://img.shields.io/badge/PWA-offline-5a0fc8?logo=pwa&logoColor=fff)
![Node 22+](https://img.shields.io/badge/node-22%2B-339933?logo=node.js&logoColor=fff)

</div>

---

## 🎸 Pick your pedal

| Pedal | Effects | Builder | Extras | Status |
|---|---|---|---|---|
| **MS-60B+** bass | [97 effects](https://zoom.tongatron.org) | [Patch builder](https://zoom.tongatron.org/builder.html) | [Tone ideas](https://zoom.tongatron.org/tones.html) · [Pedal manager](https://zoom.tongatron.org/pedal-manager.html) · [Resources](https://zoom.tongatron.org/resources.html) | ✅ Tested on firmware 1.20 |
| **MS-50G+** guitar | [127 effects](https://zoom.tongatron.org/ms-50g/) | [Patch builder](https://zoom.tongatron.org/ms-50g/builder.html) | [Resources](https://zoom.tongatron.org/ms-50g/resources.html) | 🧪 Not tested — [help wanted](#-help-test-the-ms-50g) |

## 💡 Why

ZOOM MultiStomp pedals pack about a hundred effects, a tight DSP budget and a 6-slot chain behind a tiny screen. The Patch Studio puts it all on your desk, so you can design patches calmly and load them with confidence.

## ✨ Features

| | |
|---|---|
| 🔎 **Effects library** | Every effect with the original ZOOM Effects List text, parameters and ranges. Search by name, model or parameter; filter by category and feature. |
| 🧱 **Patch builder** | Up to 6 effects, drag to reorder, every parameter editable, undo and redo. |
| 📊 **Live DSP meter** | The load of each effect and of the whole chain, against the 100% limit — no surprises on the pedal. |
| 🧠 **Advice engine** | Flags risky order, hot levels and heavy chains, explains *why*, and cites its sources. Adapts to your rig (amp or mixer). Order rules are tips, never errors. |
| 🧩 **Rule packs** | Write your own advice rules in a form and share them as `.json`. |
| 💾 **`.zptc` export / import** | Straight into Handy Guitar Lab — reverse-engineered format, byte-for-byte exact. |
| 📚 **My patches** | A library per pedal, side-by-side comparison, share links, backup and restore. |
| 🎨 **Tone ideas** | Starting chains by style and by bassist, with a soft spot for alternative rock (grunge, post-punk, indie, fuzz). Every gear fact is sourced; one click opens the chain in the builder. |
| 🔌 **Pedal manager** *(experimental)* | Over USB in Chrome or Edge: see the pedal's 100 memories next to My patches, read them, send patches, move or swap memories, and **Arrange** the whole list with drag & drop and block moves. Every write keeps a backup and is checked by reading it back. |
| 📖 **Resources** | The official ZOOM manual (English and Italian) and the Effects List PDF, one tab away. |
| ☁️ **Free account** *(optional)* | Sign in to sync patches, settings, rule packs and pedal backups across devices. Without an account everything stays in your browser. |
| 📱 **Anywhere** | Installable offline PWA for phone, tablet and desktop. |

## 🆚 The two pedals

| | MS-60B+ bass | MS-50G+ guitar |
|---|---|---|
| Effects | 97 | 127 (24 are Handy Guitar Lab add-ons) |
| Usable in the builder | 97 | 103 (add-on IDs not known yet) |
| Amp models | 11 bass amps | 22 amps (PREAMP) |
| Advice | Order, levels, low end, output | Objective checks only (DSP, levels, routing) |
| Tone ideas | ✅ | ⏳ not yet |
| Pedal manager | ✅ | ⏳ not yet |
| Tested on the pedal | ✅ firmware 1.20 | ❌ not yet |

Both pedals share the codec, builder and catalog code; each keeps its own data (`pedal.js`, `effects-data.js`, `firmware-data.js`, effect images) in `site/` (MS-60B+) or `site/ms-50g/` (MS-50G+).

## 🙋 Help test the MS-50G+

The MS-50G+ section is built from the official ZOOM documentation and assumes the same `.zptc` format as the MS-60B+. Nobody has tried it on a real pedal yet. Own one? You can help in five minutes:

1. 🛠️ Build a simple patch in the [MS-50G+ builder](https://zoom.tongatron.org/ms-50g/builder.html), or grab [`patches/generated/ms50g-test.zptc`](patches/generated/ms50g-test.zptc) (COMPRESSOR → MS1959 DRIVE → DELAY).
2. 📥 Import it in Handy Guitar Lab and copy it to a free memory.
3. 📝 [Open an issue](https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio/issues) with what you see: the effects, the values on the pedal, the "Processor %" in the app. A patch exported from your pedal is gold.

What still needs checking: [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md) (section 0).

## 🔬 Under the hood: cracking `.zptc`

ZOOM documents the effects, not the patch file. So the format was **rebuilt from scratch** — no firmware or app disassembly, just a black box, a hex editor and a lot of patient diffing.

**🧪 Differential analysis.** Seven patches were exported from Handy Guitar Lab, each one *exactly one change* away from the previous: a parameter +1, an effect off, a new name, one more effect.

```
TONE 50 -> 51      offset 0x62     80 -> c0     one bit flips mid-byte
effect ON -> OFF   offset 0x5c     21 -> 20     bit 0 is ON/OFF
add FLIPTOP        size 0xc4 -> 0xe0, slots 2 -> 3   one more 24-byte block
```

That first line cracked it: a +1 lighting up a bit *inside* a byte means the parameters are **bit-packed**.

**🧬 The layout.** Each effect is a 24-byte block read as one 192-bit little-endian integer:

```
bit    0        ON / OFF
bits   1-29     effect ID          (29 bits)
bits  30-89     parameters 1-5     (12 bits each)
bits  90-113    parameters 6-8     ( 8 bits each)
bits 114-161    parameters 9-12    (12 bits each)
```

Around it sit the `PTCF` header and tagged blocks (`EDTB`, `PRM2`, `NAME`). A hidden "slot 0" is the BLANK tile at the start of the chain, amps carry a ninth undocumented parameter, and EQ ranges move in 0.5 dB steps — deduced from a real patch ("Big Black") where stored 16, 28, 33, 36, 24 only make sense as −4, +2, +4.5, +6, 0 dB.

**✅ Proven four ways (MS-60B+):**

1. 🔁 **Round-trip** — decode and re-encode every exported file: all identical, byte for byte.
2. ⌨️ **From readable values** — typing "TONE 50, ATTACK FAST" rebuilds the original files exactly.
3. 🎚️ **On the real pedal** — generated patches on an MS-60B+ (firmware 1.20): all 28 values match, decimals, negatives and switches included.
4. 🌐 **In the browser** — a patch composed in the builder gives the same bytes as the tested file.

The **MS-50G+** reuses the codec with its own effect table, extracted word by word from the official Effects List PDF (743 descriptions checked). Effect IDs and DSP figures come from the open-source [zoom-zt2](https://github.com/mungewell/zoom-zt2) project (MIT), which also documents the USB SysEx protocol used by the Pedal manager.

📄 Full write-up: [`docs/zptc-reverse-engineering.md`](docs/zptc-reverse-engineering.md)

## 🗂️ Repository layout

```
site/            🌐 The static site: HTML, CSS, vanilla JS. No build step. MS-60B+ data + shared scripts.
site/ms-50g/     🎸 MS-50G+ pages and data.
site/landing/    🛬 Landing page for both pedals.
deploy/          🖥️ Node server: static files, accounts, sync, admin console, backups.
tools/           🧰 .zptc CLI, Effects List extractor, tests, simulated pedal, source checker.
patches/         💾 Sample .zptc files for the round-trip test, plus generated test patches.
docs/            📝 Format notes and the open work list.
documentazione/  📚 Official ZOOM documents used as data sources.
```

## 🚀 Run it locally

```bash
node deploy/server.mjs
```

Open <http://localhost:8097>. The Node server (Node 22+, for built-in SQLite) also runs accounts, with the database in `sync-data/studio.db`; emails are only sent when configured (`MAIL_OUTBOX=dir` writes them to files instead).

No accounts needed? Any static server works:

```bash
python3 -m http.server 8766 --directory site
```

## 🧪 Checks

```bash
npm test
```

Runs the codec round-trip, advice, sync and account tests in one go.

<details>
<summary>🔍 One by one</summary>

```bash
# .zptc codec: every sample must round-trip byte for byte
node tools/zptc.mjs roundtrip patches/0* "patches/07Big Black .zptc"

# decode or encode with the MS-50G+ effects
ZPTC_PEDAL=ms-50g node tools/zptc.mjs decode file.zptc

# advice rules and starter chains (both pedals)
node tools/advice-test.mjs

# merge rules and the account sync API
node tools/sync-test.mjs

# accounts: sign-up, sign-in, reset, cookies, CSRF, rate limits, admin console, backup
node tools/auth-test.mjs

# pedal manager over USB, against a simulated pedal
node tools/midi-test.mjs

# the builder in a real browser (Playwright)
npm install && npx playwright install chromium && node tools/e2e-test.mjs
# or with your installed Chrome:
PW_CHANNEL=chrome node tools/e2e-test.mjs

# are the sources cited by the advice still reachable? (also weekly on GitHub Actions)
node tools/check-sources.mjs

# re-extract the MS-50G+ effects from the official PDF (needs pdfplumber)
python3 tools/extract-effects-list.py documentazione/ms-50gplus/E_MS-50Gplus_EffectsList.pdf > effects.json
```

</details>

## 🔐 Privacy

No tracking cookies, no newsletter. Without an account your data never leaves the browser; with one, it lives on a server run by tongatron.org, backed up daily and kept 30 days. The details: [`site/privacy.html`](site/privacy.html).

## 📌 Good to know

- 🇬🇧 The site is English-only.
- 📜 Effect and parameter descriptions are copied **verbatim** from the official ZOOM Effects Lists.
- 🎚️ MS-60B+ tested on firmware 1.20 · MS-50G+ not tested yet.
- 🧭 Effect order is convention: order advice is a tip or a warning, never an error.

## ⚖️ Credits and legal

Effects data © 2024 ZOOM CORPORATION. Manufacturer names are used only to describe sonic character. This is an independent fan project, not affiliated with or endorsed by ZOOM. Effect tables and the USB protocol thanks to [zoom-zt2](https://github.com/mungewell/zoom-zt2).

<div align="center">

---

Made with 🎶 and a hex editor by [**tongatron.org**](https://tongatron.org)

</div>

<div align="center">

<img src="site/favicon.svg" width="88" height="88" alt="" />

# 🎛️ ZOOM MultiStomp Patch Studio

### Stop squinting at a tiny pedal screen. Design your tone on a big one.

**224 effects. One calm workspace.** Explore every effect · build patches with a live DSP meter and smart advice · export `.zptc` for Handy Guitar Lab · manage the pedal over USB

[![Open the site](https://img.shields.io/badge/▶_open_the_site-zoommultistompstudio.tongatron.org-ffcc00?style=for-the-badge&labelColor=0d1117)](https://zoommultistompstudio.tongatron.org/landing/)

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
| **MS-60B+** bass | [97 effects](https://zoommultistompstudio.tongatron.org/ms-60b/) | [Patch builder](https://zoommultistompstudio.tongatron.org/ms-60b/builder.html) | [Tone ideas](https://zoommultistompstudio.tongatron.org/ms-60b/tones.html) · [Pedal manager](https://zoommultistompstudio.tongatron.org/ms-60b/pedal-manager.html) · [Resources](https://zoommultistompstudio.tongatron.org/ms-60b/resources.html) | ✅ Tested on firmware 1.20 |
| **MS-50G+** guitar | [127 effects](https://zoommultistompstudio.tongatron.org/ms-50g/) | [Patch builder](https://zoommultistompstudio.tongatron.org/ms-50g/builder.html) | [Resources](https://zoommultistompstudio.tongatron.org/ms-50g/resources.html) | 🧪 Not tested — [help wanted](#-help-test-the-ms-50g) |

## 💡 Why

A ZOOM MultiStomp hides about a hundred effects, a tight DSP budget and a 6-slot chain behind a screen the size of a postage stamp. Great sounds are in there. Getting to them is the hard part.

The Patch Studio puts the whole pedal on your desk:

- 🧠 **Know before you load.** The DSP meter and the advice engine tell you what will work, and *why*, before you touch the pedal.
- 🎯 **Find your tone faster.** Search, star your favorites, start from a ready chain, then tweak.
- 🔒 **Yours to keep.** Free, open source, works offline, and your patches stay in your browser unless you choose to sync.
- 🔬 **Built on the real format.** The `.zptc` codec is proven byte for byte, so what you build is what the pedal gets.

## ✨ Features

| | |
|---|---|
| 🔎 **Effects library** | Every effect with the original ZOOM Effects List text, parameters and ranges. Search by name, model or parameter; filter by category and feature. |
| ⭐ **Favorites** | Star the effects you love and filter the list down to them. |
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
| 💻 **Offline** | Installable PWA for computers and tablets held sideways (windows of at least 800 × 640 px; there is no phone version). |

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

1. 🛠️ Build a simple patch in the [MS-50G+ builder](https://zoommultistompstudio.tongatron.org/ms-50g/builder.html), or grab [`patches/generated/ms50g-test.zptc`](patches/generated/ms50g-test.zptc) (COMPRESSOR → MS1959 DRIVE → DELAY).
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

## 🛠️ Run it yourself

Clone it, start one Node command, and the whole studio is on `localhost`. No build step, no bundler, no dependencies to install.

👉 **[How to install](INSTALL.md)**: run it locally, repository layout, and the test suite.

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

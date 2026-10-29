<div align="center">

<img src="site/favicon.svg" width="88" height="88" alt="" />

# 🎛️ ZOOM MultiStomp Studio

### Stop squinting at a tiny pedal screen. Design your tone on a big one.

**224 effects. One calm workspace.** Explore every effect · build patches with a live DSP meter and smart advice · export `.zptc` for Handy Guitar Lab · manage the pedal over USB

[![Open the site](https://img.shields.io/badge/▶_open_the_site-zoommultistompstudio.tongatron.org-ffcc00?style=for-the-badge&labelColor=0d1117)](https://zoommultistompstudio.tongatron.org/)

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

MultiStomp Studio puts the whole pedal on your desk:

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
| 🔌 **Pedal manager** | Over USB in Chrome or Edge: see the pedal's 100 memories next to My patches, read them, send patches, and reorder the memories by dragging them (or **Arrange** for block moves). Every write keeps a backup and is checked by reading it back. |
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

The MS-50G+ section is built from the official ZOOM documentation, but nobody has tried it on a real pedal yet. Own one? There are a few short tests, from five minutes up, and you choose how much time to give. All you need is the pedal and the Handy Guitar Lab app on an iPhone or iPad.

👉 **[What would help, and how to get in touch](https://zoommultistompstudio.tongatron.org/ms-50g/help.html)**

## 🔬 Under the hood: cracking `.zptc`

ZOOM documents the effects, not the patch file, so the format was **rebuilt from scratch**: no firmware or app disassembly, just seven patches that each differ by one change, a hex editor and a lot of patient diffing. It turned out to be bit-packed: each effect is a 24-byte block read as one 192-bit integer (ON/OFF, effect ID, then the parameters), inside a `PTCF` header with tagged blocks.

The codec is proven four ways on the MS-60B+: byte-for-byte round-trips, files rebuilt from readable values, generated patches checked on a real pedal (firmware 1.20), and the browser builder producing the same bytes. The MS-50G+ reuses it with its own effect table; effect IDs, DSP figures and the USB protocol come from the open-source [zoom-zt2](https://github.com/mungewell/zoom-zt2) project (MIT).

📄 Read the full story: [Technical notes](https://zoommultistompstudio.tongatron.org/ms-60b/technical-notes.html) · [`docs/zptc-reverse-engineering.md`](docs/zptc-reverse-engineering.md)

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

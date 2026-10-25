# Next steps

Open work on the MS-60B+ site, the `.zptc` codec and the advice engine, roughly in priority order.
Each item says what is missing and how to close it.

## 1. Finish decoding the `.zptc` parameters

The builder can already write every parameter, but some formats are only known as raw stored values.
Method (see `docs/zptc-reverse-engineering.md`): export the same patch from Handy Guitar Lab two or three times, changing **only one parameter**, note the displayed values, then run `node tools/zptc.mjs decode file.zptc` to read the raw values and add the rule to `codec()` in `site/zptc.js`.

**Raw — format unknown (24 parameters):**

| Range | Parameters |
|---|---|
| `32 Hz – 6.3 kHz` | AMPG SVT, SMR400, B-MAN100, AC 370 — MID-FREQ |
| Continuous frequencies (`20 Hz – 20 kHz`, `20 Hz – 640 Hz`, `500 Hz – 20 kHz`, `80 Hz – 2.5 kHz`, `300 Hz – 1.5 kHz`, `100 Hz – 1.0 kHz`, `350 Hz – 3.2 kHz`, `40 Hz – 600 Hz`, `1.5 kHz – 22.0 kHz`) | BASS PARAMETRIC EQ FREQ, LOW EQ FREQ, HIGH EQ FREQ, SPLITTER FREQ, DUAL COMPRESSOR FREQ, CLEAR DRIVER PREAMP MID-FREQ, 1073 PREAMP MID-F, SOLID PREAMP LO-FREQ / HI-FREQ |
| `OFF, 60 Hz – 800 Hz`, `OFF, 20 Hz – 120 Hz` | BASS STEREO CHORUS / BASS VINTAGE FLANGER LOCUT, DJENT PREAMP LOCUT |
| `0.5 – 16.0`, `1.0 – 10.0` | BASS PARAMETRIC EQ Q, 160 COMPRESSOR RATIO |
| `-10 – -1, 1 – 10` | SENSE on BASS AUTO WAH, Z TRON FILTER, BASS CRY FILTER |
| Others | BASS MONO PITCH SHIFTER SHIFT (`-12 – 12, 24`), DUAL DELAY DEPTH (`MN-0 – ST-50`), ENVELOPE GENERATOR FILTER TYPE (`HPF2 – LPF4`) |

Suggested exports: one parameter at its minimum, at its maximum and at one middle value is usually enough to find offset and step.

**Inferred — "unverified" in the builder (18 parameters):**

- `-15.0 – 15.0` and `-10.0 – 10.0` (SMR400, TE400SMX, EBH360 tone stacks): assumed 0.5 dB steps like the verified ±12 / ±20 ranges.
- `OFF, 1 – 6` (DI-5 PREAMP TONE) and `OFF – 100` (SUN CB DIST): assumed OFF = 0.
- Delay MODE (`SHORT, LONG, ♩`, `TIME, ♩`): SHORT/LONG are indexes; the tempo-synced note values after `♩` are not decoded.

Close each one with a generated patch checked on the pedal, then add the range to `VERIFIED_DECIMAL` or mark the codec as verified.

## 2. Remaining patch-level data (PRM2)

- Byte 0 and bytes 11–12 change in the "Big Black" export and are not explained yet. Patch level, tempo and footswitch assignments are likely candidates.
- Export pairs that differ only in patch volume, tempo (BPM) or the effect assigned to the footswitch.
- Expose the decoded fields in the builder (patch level, tempo).

## 3. Confirm the open questions on the pedal

- **"Big Black" anomaly**: the export contains ID `0x09000020` where the patch shows BLACK OPTICAL COMPRESSOR (`0x01000020`). Re-export the same patch to see whether bit 27 is a flag or an app bug.
- **Hidden amp parameter**: parameter 9 = 2 was seen only on FLIPTOP and AMPG SVT. Export one patch per amp model to confirm the default for all 11 amps.
- **BLEND / BALANCE direction**: the advice rule assumes the maximum is "effect only". Check by ear on two drives.
- **DSP calibration**: `DSP_SCALE = 0.925` comes from 4 patches. Note the Handy Guitar Lab "Processor" value of more patches (especially with synths and several amps) to refine it.

## 4. Advice engine

- **Test the starter chains on the pedal** (6 styles with a starter) and adjust their values by ear.
- **More rules**, each with a source: stereo output, patch level / unity gain, tuner and mute usage. (Footswitch effects and tempo-synced delays are done.)
- **Rule packs (v3)**: import and export rule sets as `.json` to share them.
- **Source health**: some links (TalkBass, Perfect Circuit) sit behind Cloudflare; re-check all sources periodically.

## 5. Patch builder

- Patch description (`TXE1`) and patch level fields.
- Drag-and-drop reordering on desktop and touch, in addition to the ↑/↓ buttons.
- Compare two saved patches side by side.
- Sync "My patches" across devices: today they live in one browser and move via Backup/Import. Options: a small backend on the server, or a shared file.
- PWA: done (`manifest.webmanifest`, `sw.js`). The worker is stale-while-revalidate, so a deploy shows from the second visit on: add an "update available" notice. Also PNG icons (192/512 px) for the install prompt on every browser.

## 6. Project hygiene

- Done: CI (`.github/workflows/ci.yml`, round-trip + advice tests on every push) and English text outside `site/`. Push the repository to GitHub to activate the workflow.
- Accessibility pass (keyboard flow in the builder, contrast of the severity colours) and a performance check on mobile.

## 7. UI

- The "Stage" theme (`site/stage.css`) is applied on top of `styles.css`; the builder chain is still vertical. The demo in `site/demos/pedal.html` shows the horizontal pedalboard layout with signal cables.

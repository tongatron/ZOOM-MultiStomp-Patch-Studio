# How the ZOOM MS-60B+ `.zptc` format was reconstructed

This document explains how the patch generator (`site/zptc.js`, used by the Patch Builder and by `tools/zptc.mjs`) came about: where the information comes from, how the format was deciphered and how it was verified.

## In short: no compiled file was decompiled

The generator was **not** obtained by disassembling or decompiling software: neither the pedal firmware nor the Handy Guitar Lab app.

The method is **black-box reverse engineering of a data format**:

1. have the app export patches that differ by **one** known change;
2. compare the bytes of the files and find what changes;
3. write a decoder, then an encoder, and check that it regenerates the originals **byte for byte**;
4. the final test is in the field: the generated patches are imported into Handy Guitar Lab and the values are checked on the pedal.

The only indirect contact with compiled files is that the **DSP load values** and the **effect IDs** come from [mungewell/zoom-zt2](https://github.com/mungewell/zoom-zt2) (MIT licence). That project reads the headers of the `.ZD2` effect modules contained in the firmware. Here only the published table (`zoom_fx_ms-plus/ms-60bp/effects_sort.txt`) was used, without touching the firmware.

## The sources and what each one provided

| Source | Type | What it gave us |
|---|---|---|
| Official ZOOM Effects List (`documentazione/E_MS-60Bplus_FX-list.pdf`) | Documentation | Name, order and range of every parameter of the 97 effects. **Nothing about the file format.** |
| Handy Guitar Lab guide (`documentazione/E_HandyGuitarLab_for_MS-60Bplus.pdf`) | Documentation | Confirms that the app imports and exports `.zptc` files (pp. 20–21), Pool, Copy to Device. |
| [zoom-zt2](https://github.com/mungewell/zoom-zt2) `decode_preset.py` | Open-source code | Starting hypothesis for the PTCF structure of the G1Four pedals (`TXJ1`/`TXE1`/`EDTB`/`PPRM` blocks, bit layout). |
| zoom-zt2 `effects_sort.txt` (MS-60B+) | Open-source data | 32-bit ID, short display name, ZD2 file, version and DSP % of the 97 effects. |
| Test exports in `patches/` | Experimental data | Confirmation of every field for the MS-60B+ (the structure differs from the G1Four). |
| Handy Guitar Lab screenshots | Verification | Values read back from the app after import and the "Processor %" indicator. |

The ZOOM technical documentation describes the **effects**, not the **format**: the format was reconstructed.

## Method: differential analysis

Seven patches, built on purpose, were exported from Handy Guitar Lab:

| File | Content | Difference from the previous one |
|---|---|---|
| `01base.zptc` | DYNAMIC COMPRESSOR: SENSE 5, ATTACK FAST, TONE 50, VOL 80 | — (reference) |
| `02tone51` | TONE 51 | one parameter, +1 |
| `03vol100` | VOL 100 | another parameter |
| `04effettooff` | effect OFF | on/off state |
| `05TESTA.zptc` | name "TEST A" | patch name |
| `06FLIP.zptc` | + FLIPTOP | second effect, an amp |
| `07Big Black .zptc` | real patch with 5 effects | check on a real case |

Comparing the hex dumps (`xxd`) in pairs, each change touches very few bytes:

| Comparison | Offset | Before → after | Interpretation |
|---|---|---|---|
| 01 → 02 (TONE 50→51) | `0x62` | `80` → `c0` | one bit turns on: the LSB of TONE |
| 02 → 03 (VOL 80→100) | `0x64` | `40` → `90` | the bits of VOL change |
| 03 → 04 (effect OFF) | `0x5c` | `21` → `20` | bit 0 of the effect block = ON/OFF |
| 04 → 05 (name) | `0xa4…` | `TEST ` → `TEST A` | `NAME` block in plain text |
| 05 → 06 (+FLIPTOP) | size and count | `0xc4`→`0xe0`, `2`→`3` | one more effect block (24 bytes) |

The fact that TONE+1 turns on a bit **in the middle of a byte** (`0x80`→`0xc0`) immediately shows that the parameters are **bit-packed**, not byte-aligned.

## The file structure

All integers are little-endian.

```
offset  content
0x00    "PTCF"                         magic
0x04    u32  total file size
0x08    u32  version (2)
0x0C    u32  number of slots (effects + 1)
0x10    10 bytes  00 00 08 00 00 00 00 00 00 00   (constant in all exports)
0x1A    10 chars  short name, ASCII, padded with spaces
0x24    slots × u32  effect ID per slot (slot 0 is 0)

then a sequence of blocks  [4-char tag][u32 length][data]:
  "TXJ1"  text (empty)
  "TXE1"  description (empty)
  "EDTB"  slots × 24 bytes, one block per effect
  "PRM2"  32 bytes of patch parameters
  "NAME"  32 bytes: full name (28 chars + 4 zero bytes)
```

**Slot 0.** Every file contains one more slot than the number of effects: ID 0, on, parameters at zero. The Handy Guitar Lab screenshots made clear what it is: the **BLANK** tile the app shows at the start of the chain. The generator reproduces it identically.

### The effect block (EDTB, 24 bytes)

The 24 bytes are read as **a single 192-bit little-endian integer**. From the least significant bit:

| Bits | Field |
|---|---|
| 0 | ON/OFF |
| 1–29 | effect ID (29 bits, e.g. `0x01000010` = DYNAMIC COMPRESSOR) |
| 30–89 | parameters 1–5, **12 bits** each |
| 90–113 | parameters 6–8, **8 bits** each |
| 114–161 | parameters 9–12, 12 bits each |
| 162–191 | unused (always 0 in the exports) |

The 5×12 / 3×8 / 4×12 widths come from the zoom-zt2 hypothesis for the G1Four. They were confirmed here: with that layout, all the effects in all the exports decode to the expected values, for example the 8-parameter Graphic EQ.

Example with `01base`, block at offset `0x5c`:

```
21 00 00 42 01 04 80 0c 40 01 00 …
bit 0        = 1              → ON
bit 1–29     = 0x01000010     → DYNAMIC COMPRESSOR (ID from the zoom-zt2 table)
param 1 (12) = 5              → SENSE 5
param 2 (12) = 1              → ATTACK = FAST (index 1 of "SLOW, FAST")
param 3 (12) = 50             → TONE 50
param 4 (12) = 80             → VOL 80
```

TONE starts at bit 54, that is bit 6 of byte 6 of the block (offset `0x62`). Going from 50 to 51 turns on exactly that bit: `0x80 | 0x40 = 0xc0`, exactly what the comparison showed.

### From displayed value to stored value

The format stores unsigned integers. The conversion depends on the range documented in the Effects List:

| Range | Rule | Example | Status |
|---|---|---|---|
| List of options (`SLOW, FAST`) | index | FAST → 1 | verified |
| Integer `a – b` | `value − a` | TONE 50 → 50 | verified |
| `-12.0 – 12.0`, `-20.0 – 20.0` | 0.5 steps: `(value − min) / 0.5` | EQ +1.5 dB → 27; BASS +4.0 → 48 | verified |
| `±15.0`, `±10.0` (other amps) | same rule, by analogy | — | **unverified** |
| `OFF, 1 – 6`, `OFF – 100` | OFF = 0, then `n − min + 1` | — | **unverified** |
| Continuous frequencies, Q, `-10 – -1, 1 – 10` | unknown | — | the raw value is entered |

The 0.5 step rule was deduced from the Graphic EQ of the "Big Black" patch. The stored values 16, 28, 33, 36 and 24 become −4, +2, +4.5, +6 and 0 dB only if 24 corresponds to 0 dB and the step is 0.5. It was then confirmed by importing GEN TEST2 on the pedal.

### The PRM2 block

It is not fully deciphered. Two fields were identified by comparison:

- **byte 10, bits 5–7**: the slot selected for editing. In `06FLIP` it is `0x4c` instead of `0x2c` because FLIPTOP (slot 2) was selected.
- **byte 20**: one bit for every slot that contains an amp. In `06FLIP` it is `0x08` (bit 3 = slot 2 + 1); in "Big Black" it is `0x40` (AMPG SVT in slot 5).

The rest is copied from `01base` (template). Some fields of "Big Black" are still unexplained: byte 0 and bytes 11–12.

### Hidden parameters

Amps have a **ninth parameter**, undocumented, which is always 2 in the exports (FLIPTOP, AMPG SVT). The generator sets it to the same value.

## Verification

1. **Byte-for-byte round-trip.** `node tools/zptc.mjs roundtrip patches/*` decodes every export and re-encodes it: all 7 files are identical to the originals.
2. **Encoder from readable values.** Starting from the displayed values alone (e.g. TONE 50, ATTACK FAST), the encoder reproduces `01base.zptc` and `06FLIP.zptc` exactly.
3. **Test on the pedal.** Two generated patches (GEN TEST1 with a compressor; GEN TEST2 with compressor, overdrive, graphic EQ and FLIPTOP) were imported into Handy Guitar Lab and copied to the pedal. All 28 values match, including decimals, negative values and switches.
4. **Site builder.** The GEN TEST2 patch composed from the interface produces the same bytes as the file already tested; an imported and re-exported `.zptc` stays identical.

## The DSP load

ZOOM does not publish the "weight" of the effects. The zoom-zt2 table contains a percentage per effect, read from the ZD2 files. Compared with the **Processor** indicator of Handy Guitar Lab, it is consistently about 8% higher:

| Patch | zoom-zt2 sum | Handy Guitar Lab |
|---|---|---|
| GEN TEST1 | 5.66 | 5% |
| GEN TEST2 | 66.27 | 61% |
| Big Black (exported) | 92.88 | 86% |
| Big Black (original) | 103.74 | 96% |

The ratio is constant (≈ 0.925). The site therefore multiplies the values by `DSP_SCALE = 0.925` (in `site/firmware-data.js`): with this correction the sum of the effects matches the app indicator within ±1%. The builder blocks the download above 100%, where the pedal would show PROCESS OVERFLOW.

## Known anomalies

- **"Big Black" export.** In the original patch the first effect is BLACK OPTICAL COMPRESSOR (ID `0x01000020`). The exported file contains `0x09000020` instead, with parameters at zero, and when re-imported the app itself shows it as an unknown effect (⚠). The two IDs differ by a single bit (bit 27): it could be a flag, or a defect in the Handy Guitar Lab export. It needs checking with a new export.

## How to extend the decoding

To decipher a parameter that is still "raw" or "unverified":

1. export the same patch two or three times, changing **only** that parameter and noting the values on the display;
2. `node tools/zptc.mjs decode file.zptc` shows the raw value (`raw`) of every parameter;
3. work out the rule from displayed value to raw value and add it to the `codec()` function in `site/zptc.js`;
4. re-run the round-trip, generate a test patch and check it on the pedal before removing the "unverified" label.

## Project files

| File | Role |
|---|---|
| `site/zptc.js` | Shared codec: decode, encode, round-trip, value conversion |
| `site/builder.html`, `site/builder.js` | Patch Builder: chain, parameters, DSP, saving, import, download |
| `site/effects-data.js` | Effects and parameters from the Effects List (original English texts) |
| `site/firmware-data.js` | IDs, display name, DSP (zoom-zt2) and `DSP_SCALE` |
| `tools/zptc.mjs` | CLI: `decode`, `encode`, `roundtrip` |
| `patches/` | Reference exports and generated patches used for the checks |

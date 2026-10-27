# Technical notes

How this site writes patches the pedal accepts, and how it talks to the pedal over USB. ZOOM documents neither: the `.zptc` file format was reconstructed from exported patches, and the USB protocol comes from the open-source [zoom-zt2](https://github.com/mungewell/zoom-zt2) project (MIT licence).

## Part 1 — The `.zptc` patch file

### No software was decompiled

Neither the pedal firmware nor the Handy Guitar Lab app was disassembled or decompiled. The format was worked out as **black-box reverse engineering of a data format**:

1. export patches from Handy Guitar Lab that differ by **one** known change;
2. compare the bytes of the files and find what changes;
3. write a decoder, then an encoder, and check that it regenerates the originals **byte for byte**;
4. import the generated patches into Handy Guitar Lab and check the values on the pedal.

The **effect IDs** and **DSP load values** come from the published zoom-zt2 table `effects_sort.txt`, which that project reads from the headers of the `.ZD2` effect modules. The table was used as is; the firmware was not touched.

### Sources

| Source | What it gave |
|---|---|
| ZOOM MS-60B+ Effects List (PDF) | Name, order and range of every parameter of the 97 effects. Nothing about the file format. |
| Handy Guitar Lab guide (PDF) | Confirms that the app imports and exports `.zptc` files. |
| zoom-zt2 `decode_preset.py` | Starting hypothesis for the PTCF structure of the G1Four pedals (block names, bit layout). |
| zoom-zt2 `effects_sort.txt` (MS-60B+) | 32-bit ID, display name, module version and DSP % of every effect. |
| Test exports | Confirmation of every field for the MS-60B+. |
| Handy Guitar Lab screenshots | Values read back after import, and the "Processor %" meter. |

### Differential analysis

Seven patches were built on purpose and exported:

| File | Content | Difference from the previous one |
|---|---|---|
| `01base` | DYNAMIC COMPRESSOR: SENSE 5, ATTACK FAST, TONE 50, VOL 80 | reference |
| `02tone51` | TONE 51 | one parameter, +1 |
| `03vol100` | VOL 100 | another parameter |
| `04effettooff` | effect OFF | on/off state |
| `05TESTA` | name "TEST A" | patch name |
| `06FLIP` | + FLIPTOP | a second effect, an amp |
| `07Big Black` | a real patch with 5 effects | check on a real case |

Each change touches very few bytes:

| Comparison | Offset | Before → after | Meaning |
|---|---|---|---|
| TONE 50 → 51 | `0x62` | `80` → `c0` | one bit turns on: the lowest bit of TONE |
| VOL 80 → 100 | `0x64` | `40` → `90` | the bits of VOL change |
| effect OFF | `0x5c` | `21` → `20` | bit 0 of the effect block is ON/OFF |
| name | `0xa4…` | `TEST ` → `TEST A` | `NAME` block in plain text |
| + FLIPTOP | size, count | `0xc4` → `0xe0`, `2` → `3` | one more 24-byte effect block |

TONE + 1 turns on a bit **in the middle of a byte** (`0x80` → `0xc0`): the parameters are **bit-packed**, not byte-aligned.

### File structure

All integers are little-endian.

```
offset  content
0x00    "PTCF"                         magic
0x04    u32  total file size
0x08    u32  version (2)
0x0C    u32  number of slots (effects + 1)
0x10    10 bytes, constant in all exports
0x1A    10 chars  short name, ASCII, padded with spaces
0x24    slots × u32  effect ID per slot (slot 0 is 0)

then blocks  [4-char tag][u32 length][data]:
  "TXJ1"  text (empty)
  "TXE1"  description (empty)
  "EDTB"  slots × 24 bytes, one block per effect
  "PRM2"  32 bytes of patch parameters
  "NAME"  32 bytes: full name (28 chars + 4 zero bytes)
```

**Slot 0** has ID 0: it is the BLANK tile Handy Guitar Lab shows at the start of the chain. Patches stored on the pedal do not always have it (factory memory 10, read over USB, has none), so the decoder treats slot 0 as BLANK only when its ID is 0.

### The effect block (EDTB, 24 bytes)

The 24 bytes are read as **one 192-bit little-endian integer**. From the lowest bit:

| Bits | Field |
|---|---|
| 0 | ON/OFF |
| 1–29 | effect ID (29 bits, e.g. `0x01000010` = DYNAMIC COMPRESSOR) |
| 30–89 | parameters 1–5, **12 bits** each |
| 90–113 | parameters 6–8, **8 bits** each |
| 114–161 | parameters 9–12, 12 bits each |
| 162–191 | unused (always 0) |

Example from `01base`, block at `0x5c`:

```
21 00 00 42 01 04 80 0c 40 01 00 …
bit 0        = 1              → ON
bits 1–29    = 0x01000010     → DYNAMIC COMPRESSOR
param 1 (12) = 5              → SENSE 5
param 2 (12) = 1              → ATTACK FAST (index 1 of "SLOW, FAST")
param 3 (12) = 50             → TONE 50
param 4 (12) = 80             → VOL 80
```

TONE starts at bit 54, which is bit 6 of byte 6 of the block (offset `0x62`): going from 50 to 51 sets exactly that bit, `0x80 | 0x40 = 0xc0`.

### From displayed value to stored value

| Range in the Effects List | Rule | Example | Status |
|---|---|---|---|
| list of options (`SLOW, FAST`) | index | FAST → 1 | verified |
| integer `a – b` | `value − a` | TONE 50 → 50 | verified |
| `-12.0 – 12.0`, `-20.0 – 20.0` | 0.5 steps: `(value − min) / 0.5` | EQ +1.5 dB → 27 | verified |
| `±15.0`, `±10.0` | same rule, by analogy | — | unverified |
| `OFF, 1 – 6`, `OFF – 100` | OFF = 0, then `n − min + 1` | — | unverified |
| amp MID-FREQ `32 Hz – 6.3 kHz` | knob step 0–31 (32 steps) | 220 Hz → 13 | 9 of 32 steps read |
| continuous frequencies, Q | unknown | — | raw value |

The builder marks the unverified parameters.

### The PRM2 block

Only partly deciphered: byte 10 bits 5–7 hold the slot selected for editing, byte 20 has one bit per slot that holds an amp. The rest is copied from a reference export. Amps also carry an undocumented ninth parameter, always 2 in the exports; the encoder writes the same value.

### Verification

1. **Byte-for-byte round trip**: every reference export is decoded and re-encoded identically.
2. **Encoder from displayed values**: starting from values such as TONE 50 or ATTACK FAST, the encoder reproduces the reference exports exactly.
3. **On the pedal**: generated patches were imported into Handy Guitar Lab and copied to an MS-60B+ running firmware 1.20. All 28 values checked match, including decimals, negative values and switches.

### DSP load

ZOOM does not publish how much processing power each effect uses. The zoom-zt2 percentages are consistently about 8% higher than the Handy Guitar Lab "Processor" meter (e.g. 92.88 against 86%), so the site multiplies them by `0.925`. With that, the total matches the app within ±1%, and the builder blocks the download above 100%, where the pedal would show PROCESS OVERFLOW.

## Part 2 — The USB connection (Pedal manager)

### Web MIDI and SysEx

Plugged in over USB, the pedal is a class-compliant MIDI device. Chrome and Edge on a computer reach it through **Web MIDI**: the page asks for access with SysEx enabled (`navigator.requestMIDIAccess({ sysex: true })`), which shows a permission prompt, then picks the input and output ports whose name contains "ZOOM".

Everything goes through **System Exclusive** messages. The commands, the byte packing and the checksum framing come from `zoomzt2.py` in zoom-zt2; ZOOM does not document or support them.

```
F0 52 00 <device> <command …> F7
   52      = ZOOM manufacturer ID
   device  = model byte from the identity reply
```

Each request gets one SysEx answer. The site sends one command at a time, waits for the answer (2.5 s timeout) and ignores non-SysEx traffic such as program changes or the tuner's control changes.

### Commands used

| Command | Bytes after `F0 52 00 <device>` | Purpose |
|---|---|---|
| Identity | `F0 7E 7F 06 01 F7` (standard MIDI) | ZOOM ID, model byte and firmware version |
| Editor mode on / off | `50` / `51` | needed before reading the current patch |
| Patch info | `44` | number of memories, memory size, patches per bank |
| Read current patch | `64 13` | the patch being played or edited |
| Read memory | `46 00 00 <bank lo hi> <slot lo hi>` | a stored patch |
| Write memory | `45 00 00 <bank lo hi> <slot lo hi> <length lo hi> <data> <CRC>` | overwrite a stored patch |

An MS-60B+ on firmware 1.20 reports 100 memories of 848 bytes in banks of 10. Memory *n* is addressed as bank `(n − 1) / 10`, slot `(n − 1) mod 10`, each split into two 7-bit bytes.

### 7-bit packing

MIDI data bytes cannot use bit 7, so 8-bit patch data is packed in groups: for every 7 data bytes, one leading byte collects their high bits, followed by the 7 bytes with bit 7 cleared. Eight MIDI bytes carry seven data bytes.

```
data:    d0 d1 d2 d3 d4 d5 d6
packed:  hi d0&7F d1&7F … d6&7F
         hi bit 6 = d0 bit 7, hi bit 5 = d1 bit 7, …, hi bit 0 = d6 bit 7
```

### Checksum

A read answer ends with the length of the data (two 7-bit bytes), the packed data and five 7-bit bytes carrying the **inverted CRC32** of the unpacked memory, lowest bits first. The site recomputes the CRC32 and flags any memory whose checksum does not match. Writes carry the same framing in the other direction.

A memory holds a PTCF file followed by zero padding: the file size in the PTCF header tells where the patch ends. The same `.zptc` codec then decodes it, so a patch read from the pedal opens in the builder like an imported file.

### Safe writing

Writing is the risky part, so every write follows the same steps:

1. **Backup**: the target memory is read fresh and stored whole (with its padding) in this browser's backups; nothing is written if the read fails or its CRC is wrong.
2. **Confirmation**: the page says which memory changes and what it currently holds.
3. **Write**: the patch is padded with zeros to the memory size and sent with its CRC.
4. **Read-back**: the memory is read again and compared byte for byte with what was sent. A mismatch is reported and the backup can be restored.

Moves, swaps and the Arrange mode use the same steps for every memory they change. A move writes the target first and clears the source last, so if something fails the patch is still on the pedal.

### Testing without a pedal

The protocol code is tested against a **simulated pedal** that answers the same SysEx commands. Its identity, editor-mode, memory-size and current-patch answers copy those of a real MS-60B+ on firmware 1.20. The simulator checks the packing, the CRC, the addressing and the backup and read-back flow before anything is tried on hardware.

## Code on GitHub

| File | Role |
|---|---|
| `site/zptc.js` | `.zptc` codec: decode, encode, round trip, value conversion |
| `site/firmware-data.js` | effect IDs, display names, DSP load and the 0.925 scale |
| `site/pedal-midi.js` | Web MIDI and SysEx: identity, patch info, read, write, packing, CRC32 |
| `site/pedal-manager.js` | Pedal manager page: backups, confirmation, read-back |
| `tools/fake-pedal.mjs` | simulated pedal for the tests |
| `docs/zptc-reverse-engineering.md` | full notes on the format |

Source: [github.com/tongatron/ZOOM-MultiStomp-Patch-Studio](https://github.com/tongatron/ZOOM-MultiStomp-Patch-Studio).

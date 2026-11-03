# Firmware audit inputs

This directory deliberately contains metadata only. ZOOM firmware and effect binaries are proprietary and are not checked into this repository.

The official download pages and the corresponding open-source technical reference are listed in [`sources.json`](sources.json). Download the updater from ZOOM, extract it if necessary, and pass either the extracted directory, the ZIP file, or the updater binary to the audit tool:

```sh
node tools/firmware-audit.mjs --catalog all
node tools/firmware-audit.mjs ms-60b /path/to/MS-60B-firmware.zip
node tools/firmware-audit.mjs ms-50g /path/to/extracted-firmware-directory --strict
```

The tool does not modify the input. It reports hashes, embedded `ZDLF`/`.ZD2` containers, effect IDs, versions, targets, DSP information when present, and mismatches against the site's catalog. The extracted binaries can remain outside the repository or under the ignored `firmware/downloads/` and `firmware/extracted/` directories.

This is a static audit, not firmware emulation. Basic USB/MIDI behavior is tested separately with the simulated pedal and, ultimately, on real hardware.

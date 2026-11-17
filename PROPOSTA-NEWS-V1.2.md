# Version 1.2 Update Communication Proposal

## Objective

Prepare the version 1.2 announcement and keep a reliable record of the changes made during the current Patch Builder and Pedal Manager work.

## Proposed popup title

**What's new in version 1.2**

## Proposed popup text

Zoom MS-60B+ Studio version 1.2 makes patch organisation clearer and safer when working with a connected pedal:

- **Patch favourites**: mark patches with a star and keep favourites at the top of My patches.
- **My patches search**: find a local patch quickly by name or patch details.
- **Pedal link visibility**: a blue indicator shows when a local patch is linked to a pedal memory; its tooltip identifies the pedal patch and the last memory position.
- **Clearer patch saving**: the selected patch name is always visible in the right-hand panel. The name field is more compact, and SAVE is green when there are unsaved changes and grey when there is nothing to save.
- **Safer cleanup of deleted links**: when a connected pedal contains a memory linked to a local patch that no longer exists, Pedal Manager offers to clear that memory with the name `Empty`. The action is read back, backed up, and can be undone.

## Ready-to-send user message

**Subject:** 🎉 Version 1.2 is here — clearer patch organisation and safer pedal sync

```text
🎉 Version 1.2 is here!

This release makes it easier to find your favourite sounds and keeps local patches and pedal memories easier to understand.

✨ Now available

• ⭐ Patch favourites
  Mark a patch with a star. Favourite patches stay at the top of My patches.

• 🔎 My patches search
  Search your saved patches by name and details.

• 🔵 Pedal-link indicator
  See at a glance when a local patch is linked to a pedal memory. Hover the indicator to see the pedal patch name and its last memory position.

• 💾 Clearer saving
  The selected patch name remains visible in the Patch panel. SAVE turns green when there are changes to save and grey when the patch is already up to date.

• 🧹 Safer cleanup
  If a local patch linked to a pedal memory has been deleted, Pedal Manager offers to clear the corresponding pedal memory as `Empty`. The original memory is backed up and the operation can be undone.

Thanks for using ZOOM MultiStomp Studio! 🎸
```

## Technical notes and verification status

### R OUT POSITION

The official MS-60B+ manual confirms that R OUT POSITION is a per-patch setting. A patch read from the pedal therefore contains more than the effect list and parameter values: its patch metadata also needs to be preserved when it is imported into My patches.

The connected pedal was read without loading or writing a patch. Memory 1, `Big Black2`, was downloaded and inspected. Its PTCF data contains the raw PRM2 block and a four-bit field identified by the reverse-engineering notes as `rightPosition`; the field reads `0`, which is confirmed on the connected MS-60B+ as the R output between effects 1 and 2.

The value is now translated in the interface as “between effects 1 and 2”. The current `selected` value must not be confused with R OUT POSITION: it identifies the selected/editing slot, not the right-channel output point. The remaining R OUT values still need paired reads before their labels are treated as confirmed.

Before exposing a user-facing R OUT POSITION control in My patches, capture the same patch twice while changing only R OUT POSITION on the pedal. Comparing the two PRM2 blocks will establish the exact value-to-position mapping and prevent incompatible patches from being generated.

### Planned My patches support

The first implementation step is complete: the raw field is read from the pedal, translated for the confirmed `raw 0` case, shown as diagnostic metadata, and preserved through My patches, patch links and `.zptc` export. The Patch Builder does not yet offer position editing. Once the remaining differential checks are complete, My patches can expose a verified R OUT POSITION selector and the export can update only that field while retaining the remaining pedal metadata.

The comparison command is:

`node tools/zptc.mjs compare-r-out first.zptc second.zptc`

## Release checklist

- Confirm the final version number and release date in `site/updates.js`.
- Add the popup entry and link it to the full changelog.
- Complete the two-patch R OUT POSITION comparison before enabling editing of that setting.
- Re-run the pedal-manager and Patch Builder checks before publishing.

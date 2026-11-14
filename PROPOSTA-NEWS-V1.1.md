# Version 1.1 Update Communication Proposal

## Objective

Show users a short, readable popup the first time they access the app after version 1.1 is released, with a link to a complete news file in the project root.

## Popup title

**What's new in version 1.1**

## Proposed popup text

Zoom MS-60B+ Studio version 1.1 is here.

We've added useful tools to audition, manage, and sync your sounds:

- **Pedal audition and Live mode**: listen to reference loops from your computer and try supported changes directly in the pedal's edit buffer.
- **ZOOM model navigation**: reach each pedal model and its related tools more easily from the studio navigation.
- **Patch synchronization**: compare changes between a patch read from the pedal and its locally saved copy before replacing or saving it.

**See all the details** in the complete changelog.

## Ready-to-send user message

**Subject:** 🎉 Version 1.1 is here — new tools for your sounds

```text
🎉 Version 1.1 is here!

We've added new tools to help you audition, manage, and sync your sounds.

✨ Now available

• 🧭 ZOOM pedal model navigation
  Reach each supported pedal model and its related tools more easily from the studio navigation.

• 🔄 Patch synchronization
  Keep the pedal version and the locally saved copy linked, compare both versions, and review changes before saving or sending them. Actions that may replace a patch require confirmation.

🧪 Beta features

• 🎧 Pedal audition
  Play clean bass reference loops through your computer's audio output.

• ⚡ Live mode
  Send supported changes directly to the pedal's edit buffer while you work.

Beta features are available from the account menu and are disabled by default. They may evolve in future versions.

💾 We recommend keeping a backup of your patch before sending changes to the pedal.

Thanks for using ZOOM MultiStomp Studio! 🎸
```

### Actions

- `See what's new` → opens `NEWS.md` or the equivalent web page.
- `Later` → closes the popup without marking the news as read.
- `Don't show again` → hides the popup for version 1.1.

## News file in the project root

Recommended name: `NEWS.md`

Proposed content:

```md
# News

## Version 1.1 — November 2026

Version 1.1 introduces new tools for auditioning sounds, reaching pedal models more quickly, and keeping patches in sync.

### Published features

- 🧭 ZOOM pedal model navigation.
- 🔄 Patch synchronization with comparison and confirmation before replacement.

### Beta features

- 🎧 Pedal audition: bass reference loops through the computer's audio output.
- ⚡ Live mode: supported changes sent to the pedal's edit buffer.
- Beta features are available from the account menu and remain disabled by default.

### Notes

- Beta features may change in future versions.
- We recommend creating or keeping a backup of the patch before sending changes to the pedal.
```

## Suggested behavior

The popup should be shown once per version, using a local key such as `news-dismissed-1.1`. The `Later` option should allow users to see it again on their next visit; `Don't show again` should store their choice.

## Editorial note

The text uses the features already described in `site/updates.js`. Before releasing version 1.1, verify the actual release date, the beta status of the features, and the final button labels.


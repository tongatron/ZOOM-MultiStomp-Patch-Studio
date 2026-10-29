# 🛠️ How to install

Run ZOOM MultiStomp Patch Studio on your own computer, look around the code, and run the tests. Back to the [README](README.md).

You only need Node 22+ (for the built-in SQLite). There is no build step and nothing to compile.

## 🗂️ Repository layout

```
site/            🌐 The static site: HTML, CSS, vanilla JS. No build step. Shared scripts and styles.
site/ms-60b/     🎸 MS-60B+ pages and data.
site/ms-50g/     🎸 MS-50G+ pages and data.
site/index.html 🛬 Home page for both pedals (images in site/landing/).
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

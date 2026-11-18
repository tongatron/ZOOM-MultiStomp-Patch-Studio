# ZOOM MultiStomp Studio — Electron desktop beta

This is the desktop shell for the beta builds published from the studio. It
starts the existing site on a loopback-only local server and opens the MS-60B+
studio in an Electron window. The app currently reuses the web UI; direct
MIDI/USB access is still the next desktop-specific layer to validate.
Sign-in and account sync are forwarded securely to the canonical online site,
so an internet connection is required for those features.

From the repository root:

```sh
npm --prefix desktop install
npm --prefix desktop start
```

To create the ZIP builds from the repository root:

```sh
npm --prefix desktop run dist:mac    # Apple Silicon
npm --prefix desktop run dist:win    # Windows x64
npm --prefix desktop run dist:linux  # Linux x64
```

The local account data created while testing is stored by Electron under its
application data directory, not in the repo. The beta builds are unsigned and
are intended for local testing, not store distribution.

🏗 Build & Run Instructions – IFS Parts Electron

⚠️ Note: The app is still under active debugging.
“npm run start” may fail until export/bridge issues are resolved.
This document is a placeholder for clean run/build instructions.

Development (local run)

Install dependencies:
$ npm install

Run the app in dev mode:
$ npm run start

While running, check:

DevTools console for errors

Cards/questions load

PDF export works

No preload/bridge errors

Target Platforms

This app is intended to support cross-platform builds with Electron:

✅ Linux (currently tested on Fedora 42 KDE Plasma)

⏳ Windows 11 (planned)

⏳ macOS (planned)

Packaging will be set up with Electron Forge for simpler multi-platform distribution.
Installers/notarization (Windows .exe, macOS .dmg) will be added later.

Packaging (TODO)

We will add packaging once the app runs clean. Options include:

Electron Forge (simpler, built-in templates)

Electron Builder (more advanced, installers + signing)

Next steps for this section:

Add devDependencies (@electron-forge/cli or electron-builder)

Add package.json scripts ("make", "package", "dist")

Document packaging commands here

Release Process (future)

Merge dev → stable

Refresh safe worktree (safe-refresh)

Tag on stable (e.g. v1.1.0)

Push tag to GitHub

(Optional) GitHub Actions auto-build installers

📌 This file will be updated as soon as the debug session resolves current run-time issues.
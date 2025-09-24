BUILD GUIDE — IFS Parts Electron

This document explains how to build, package, and test the IFS Parts Electron app across platforms.

Linux (Ubuntu/Debian) — Authoritative Path
Local build (inside Ubuntu VM)

Clone the repo:
git clone https://github.com/fintube61git/ifs-parts-electron.git

cd ifs-parts-electron

Install dependencies:
npm install

Build package:
npm run make -- --platform=linux --arch=x64 --targets=@electron-forge/maker-deb

Install locally:
sudo apt install ./out/make/deb/x64/*.deb

Run:
ifs-parts-electron
CI/CD build (preferred)

On tag push (vX.Y.Z), GitHub Actions builds .deb automatically and publishes it as a release asset.

Workflow: .github/workflows/release-linux.yml

Output: ifs-parts-electron_X.Y.Z_amd64.deb

Packaging Polish (planned for v1.0.20)

Custom icons: /src/Icons/ (app.png at 48/64/128/256/512 px)

Desktop entry: friendly name + icon in Ubuntu app menu

Release notes: RELEASE_NOTES_TEMPLATE.md for testers

Windows (next milestone)

VM: Windows 11

Install Node.js 20.x, VS Build Tools (C++)

Run:
npm run make -- --platform=win32 --arch=x64

Installer maker: NSIS (preferred)

Output: .exe installer (workflow later)

Safe Tagging

Always tag before risky changes:
git tag -a vX.Y.Z -m "description"
git push origin vX.Y.Z
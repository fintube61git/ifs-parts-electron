# BUILD GUIDE — IFS Parts Electron

This document explains how to build, package, and test the IFS Parts Electron app across platforms.

---

## Linux (Ubuntu/Debian) — Authoritative Path

### Local build (inside Ubuntu VM)
1. Clone the repo:
   git clone https://github.com/fintube61git/ifs-parts-electron.git
   cd ifs-parts-electron

2. Install dependencies:
   npm install

3. Build package:
   npm run make -- --platform=linux --arch=x64 --targets=@electron-forge/maker-deb

4. Install locally:
   sudo apt install ./out/make/deb/x64/*.deb

5. Run:
   ifs-parts-electron

---

### CI/CD build (preferred)
- On tag push (`vX.Y.Z`), GitHub Actions builds `.deb` automatically and publishes it as a release asset.
- Workflow: `.github/workflows/release-linux.yml`
- Output: `ifs-parts-electron_X.Y.Z_amd64.deb`

---

## Packaging Polish (planned for v1.0.20)

- **Custom icons**: store under `/src/Icons/` (`app.png` at multiple sizes: 48, 64, 128, 256, 512)
- **Desktop entry**: friendly name + icon will appear in Ubuntu app menu
- **Release notes**: use `RELEASE_NOTES_TEMPLATE.md` for tester-friendly instructions

---

## Windows (next milestone)

1. VM: Windows 11
2. Install Node.js 20.x, VS Build Tools (C++)
3. Run:
   npm run make -- --platform=win32 --arch=x64
4. Installer maker: NSIS (preferred)
5. Output: `.exe` installer (to be added to GitHub Actions workflow later)

---

## Safe Tagging
Always tag before risky changes:
   git tag -a vX.Y.Z -m "description"
   git push origin vX.Y.Z

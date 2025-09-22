# 🛠 Build Readiness Checklist (Electron App)

## 1. Repo Hygiene
- [x] `.gitignore` covers `node_modules/`, `out/`, `dist/`, logs, IDE junk.  
- [ ] Branches are clean (`whereami` shows CLEAN ✅).  
- [ ] Safe branch (`stable`) matches GitHub.  
- [ ] Dev branch (`chores/editor-migration`) tracks GitHub and pushes cleanly.  

## 2. Project Setup
- [ ] `package.json` has correct `name`, `version`, `main`, and `scripts` (`start`, `build`, maybe `make`).  
- [ ] Dependencies vs devDependencies are sorted (no bloat in production).  
- [ ] Electron version locked in `package.json`.  
- [ ] Entry files (`main.js`, `preload.js`, `renderer.js`, `index.html`) work locally with `npm run start`.  

## 3. Export/Functionality
- [ ] PDF export works as expected.  
- [ ] Preload/bridge IPC is clean (no `fs/path bridge missing`).  
- [ ] App opens without console errors.  
- [ ] Cards + questions load correctly.  

## 4. Build Tool Choice
- Decide: **Electron Forge** (simpler, built-in templates) vs **Electron Builder** (more powerful, signing, installers).  
- [ ] Add tool as dev dependency (`npm install --save-dev @electron-forge/cli` OR `electron-builder`).  
- [ ] Scripts in `package.json` updated (e.g., `"make"`, `"package"`, `"dist"`).  

## 5. Test Builds
- [ ] Local build runs clean on Fedora.  
- [ ] Confirm output artifacts (AppImage, Snap, or deb).  
- (Later) Add Windows build cross-target if needed.  

## 6. Release Hygiene
- [ ] Tag repo (`v1.1.0`) once stable.  
- [ ] Push tag to GitHub.  
- (Optional) GitHub Actions workflow to auto-build on release tags.  

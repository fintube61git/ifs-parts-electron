BUILD.md
Build & Packaging Guide
This document describes how to set up, run, and package the IFS Parts Electron app.

1. Prerequisites
·	Node.js v20+ (LTS recommended)
·	npm v10+
·	Git
·	Linux: build-essential and lib dependencies (varies by distro)
·	macOS: Xcode CLI tools
·	Windows: Visual Studio Build Tools (Desktop Development with C++)

2. Setup
# Clone repository
git clone https://github.com/fintube61git/ifs-parts-electron.git
cd ifs-parts-electron
# Install dependencies
npm install
# Start in dev mode
npm start


3. Running
·	App auto-loads images from src/images/ and questions from src/data/questions.json.
·	DevTools can be opened with Ctrl+I (enabled in dev baseline).

4. Packaging (Electron Forge)
# Linux AppImage (.AppImage)
npm run make -- --platform=linux
# macOS DMG (.dmg)
npm run make -- --platform=darwin
# Windows EXE (.exe via Squirrel)
npm run make -- --platform=win32

Artifacts are generated in the out/ folder.

5. Release Workflow
	1.	Verify working branch (stable or feature/bugfix).
	2.	Run npm run make for target platforms.
	3.	Draft GitHub release:
		o	Tag appropriately (vX.Y.Z or baseline-*).
		o	Attach packaged artifacts.
		o	Mark pre-release if experimental.

6. Notes
·	Export currently supports HTML only (baseline v0.2.0).
·	PDF export work is deferred (previous attempts unstable).
·	Baseline tags are important for cross-machine reproducibility.


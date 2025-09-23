README.md
IFS Parts Electron
An Electron-based desktop application for reviewing image-based “cards” with associated reflective questions.
This tool supports Internal Family Systems (IFS) style part exploration in a structured digital format.

Features
·	Automatic startup: Loads images from src/images/ and questions from src/data/questions.json.
·	Card navigation: Use ← / → or on-screen buttons to move between images.
·	Answer persistence: Responses auto-save while typing.
·	Export: Create a portable HTML file containing all responses and associated card images (base64 embedded).
·	Accessibility: Dark/light theme toggle, skip-to-content, and keyboard navigation.
·	Cross-platform builds: Packaged with Electron Forge for Linux, macOS, and Windows.

Repository Layout
repo-root/
├── main.js                # Electron main process
├── src/
│   ├── index.html         # Renderer entrypoint
│   ├── js/renderer.js     # Renderer logic (images, questions, export)
│   ├── css/style.css      # Stylesheet
│   ├── images/            # Card image assets
│   └── data/questions.json# Question definitions
├── BUILD.md               # Build & packaging guide
├── PROJECT_GUIDE.MD       # Project owner workflow
├── TESTER_GUIDE.md        # Tester workflow
├── INVITATION_TEMPLATE.md # Email template for inviting testers
└── UPDATE_NOTICE_TEMPLATE.md # Email template for tester updates


Quick Start (Development)
# install dependencies
npm install
# run in dev mode
npm start


Build & Packaging
See BUILD.md for cross-platform packaging instructions.

Contribution Notes
·	Keep all .md docs in repo root for clarity.
·	Branching strategy: stable (glass-case), feature/bugfix branches off stable, PR back when verified.
·	Tag new baselines explicitly (e.g., v0.2.0-baseline-html-only).

License
ISC (default from package.json).

📄 Documentation Pack Workflow

All project documentation (BUILD.md, PROJECT_GUIDE.MD, TESTER_GUIDE.md, etc.) is also stored together in IFS_Docs_Pack.md at the repo root.

Primary edit source: IFS_Docs_Pack.md

Individual files: generated from the pack to keep GitHub navigation easy.

To resync individual files after updating the pack:
cd ~/Desktop/ifs-parts-electron
scripts/sync-docs-from-pack.sh
git add *.md
git commit -m "docs: sync individual files from IFS_Docs_Pack.md"
git push


ℹ️ Backup files (.BAK) are ignored by .gitignore. If you need a manual copy, save it outside the repo.
PROJECT_GUIDE.md
📘 Project Guide – IFS Parts Electron
Overview

IFS Parts Electron is a cross-platform desktop app built with Electron.
It presents card-like images with associated questions, allows annotations, and exports results.

Structure

src/ → app code (HTML, CSS, JS, preload, renderer)

src/images/ → card assets

src/data/questions.json → card questions

main.js → Electron entry point

package.json → dependencies and scripts

Branches

main → default integration branch

stable → locked, known-good builds

bugfix/* → targeted fixes

chores/* → editor or housekeeping changes

Conventions

Prefer feature branches; PR into main or stable.

Commit messages follow <type>: <desc> (e.g., fix:, docs:, feat:).

Tag stable baselines (v0.x.y) when tested.

Dev Hints

Run: npm start

Package: npm run make

Export HTML works reliably; PDF is WIP.

Use Ctrl+I shortcut for DevTools on Linux.

Next Steps

Improve PDF export

Expand question/answer formats

Theme selector (dark/light) persisted
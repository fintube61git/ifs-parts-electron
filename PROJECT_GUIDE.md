Project Management Guide
This is the central guide for managing the ifs-parts-electron project. It covers the entire lifecycle, from code development to tester communication.

Part 1: Project Owner's Workflow
1.1 Update Application Code
Work locally, test via npm start.
1.2 Commit & Push
git add .
git commit -m "Your descriptive message"
git push origin main

1.3 Build
npm run make

1.4 Release
·	Draft new GitHub release
·	Tag (e.g., v1.0.2)
·	Attach build artifacts
·	Mark pre-release if experimental

Part 2: Tester Management Workflow
2.1 Onboarding a New Tester
·	Send INVITATION_TEMPLATE.md text
·	Add GitHub username as collaborator
·	Confirm acceptance
2.2 Notify Testers of Release
·	Use UPDATE_NOTICE_TEMPLATE.md
·	Fill in version + changelog
·	Send to testers

Part 3: Documentation Management
·	Keep all .md files in repo root
·	Update guides/templates as needed
·	Commit changes with descriptive messages

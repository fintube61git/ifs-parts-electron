Project Management and Testing Guide
This is the central guide for managing the ifs-parts-electron project. It covers the entire lifecycle, from code development to tester communication.

Table of Contents
Part 1: Project Owner's Workflow

Part 2: Tester Management Workflow

Part 3: Documentation Management

Part 1: Project Owner's Workflow
This is your step-by-step process for updating, building, and releasing new versions.

1.1: Update the Application Code
Work on your project locally and test changes by running the app from your terminal (e.g., npm start).

1.2: Commit and Push Changes to GitHub
git add .
git commit -m "Your descriptive message"
git push origin main

1.3: Build the Application for Release
Run the build command in your terminal to generate the final files (.AppImage, .exe, .dmg) in the dist/ folder.

npm run dist

1.4: Create a New Pre-Release on GitHub
Go to your repository's Releases page and click "Draft a new release".

Create a new tag (e.g., v1.0.2), give the release a title, and write release notes.

Check the box "Set as a pre-release".

Upload the application files from your local dist/ folder.

Click "Publish release".

Part 2: Tester Management Workflow
This covers how to onboard and communicate with testers.

2.1: Onboarding a New Tester
Send Invitation: Copy the text from INVITATION_TEMPLATE.md and email it to the new tester.

Get Username: Wait for them to reply with their GitHub username.

Add Collaborator: Go to Settings > Collaborators > Add people and enter their username.

Confirm: Email them to confirm the invitation has been sent.

2.2: Notifying Testers of a New Release
After publishing a new release, copy the text from UPDATE_NOTICE_TEMPLATE.md.

Fill in the version number and change-log details.

Email the update to your list of testers.

Part 3: Documentation Management
This is the process for keeping these guides and templates up-to-date.

3.1: Updating an Existing Guide or Template
In the repository, navigate to the Markdown file you want to edit (e.g., TESTER_GUIDE.md).

Click the pencil icon to open the editor.

Make your changes to the text.

Scroll to the bottom and click "Commit changes".

3.2: Creating a New Guide or Template
From the main repository page, click "Add file" > "Create new file".

Give the file a descriptive name with the .md extension (e.g., NEW_GUIDE.md).

Write the content using Markdown formatting.

Click "Commit new file".

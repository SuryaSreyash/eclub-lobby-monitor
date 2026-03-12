# E-Club Lobby Monitor

## SETUP STEPS

### 1. Add your Apps Script URL
- Find the file called .env.example
- Make a copy and rename it to .env
- Replace the URL inside with your Apps Script Web App URL

### 2. Run locally to test
Open terminal in VSCode and run:
  npm install
  npm start

### 3. Deploy to Netlify
- Run: npm run build
- Go to netlify.com/drop
- Drag the "build" folder onto the page
- Done — you get a live link!

OR connect GitHub to Netlify for auto-deploy.

## GOOGLE SHEETS HEADERS

students tab row 1:
  id | name | team | status | exitTime | entryTime

logs tab row 1:
  studentId | studentName | team | action | timestamp

## GIT COMMANDS

First time:
  git init
  git remote add origin https://github.com/YOURUSERNAME/eclub-lobby-monitor.git
  git add .
  git commit -m "first upload"
  git push -u origin main

Every update:
  git add .
  git commit -m "what changed"
  git push

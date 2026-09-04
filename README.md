# E-Club Lobby Monitor

## SETUP STEPS

### 1. Connect the Apps Script to the correct Google account and sheet
- Open the Apps Script project in Google Apps Script editor.
- In `appscript/Code.gs`, update `SPREADSHEET_ID` with the spreadsheet ID from the sheet you want to use.
- The spreadsheet ID is the long string in the sheet URL: `https://docs.google.com/spreadsheets/d/PASTE_ID_HERE/edit`
- If you do not want to use the ID, you can also change `SPREADSHEET_NAME`, but using the ID is safer because it points to one exact file.
- Make sure the Apps Script project itself is opened from the Google account that owns the sheet.

### 2. Add your Apps Script URL
- Find the file called .env.example
- Make a copy and rename it to .env
- Replace the URL inside with your Apps Script Web App URL

### 3. Run locally to test
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
  id | name | team | status | exitTime | entryTime | category

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
